-- ==============================================================================
-- NỀN TẢNG CHUYỂN ĐỔI SỐ & HỌC TẬP CỘNG ĐỒNG (THÔN 6 XÃ DI LINH)
-- DATABASE SCHEMA TOÀN DIỆN & DỮ LIỆU THỰC TẾ TRÊN SUPABASE POSTGRESQL
-- ==============================================================================

-- 1. BẢNG PROFILES (NGƯỜI DÙNG & PHÂN QUYỀN HỆ THỐNG)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone_number TEXT DEFAULT '0903.382.277',
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'citizen' CHECK (role IN ('citizen', 'supporter', 'tech_team', 'admin')),
    hamlet_address TEXT DEFAULT 'Thôn 6, Xã Di Linh',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Cho phép mọi người xem danh sách profiles" ON public.profiles;
CREATE POLICY "Cho phép mọi người xem danh sách profiles" 
ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Người dùng tự cập nhật profile của mình" ON public.profiles;
CREATE POLICY "Người dùng tự cập nhật profile của mình" 
ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admin toàn quyền quản trị profiles" ON public.profiles;
CREATE POLICY "Admin toàn quyền quản trị profiles" 
ON public.profiles FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- Trigger tự động tạo profile khi đăng ký auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'role', 'citizen')
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
        role = COALESCE(EXCLUDED.role, profiles.role);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 2. BẢNG LEARNING_RESOURCES (KHO BÀI HỌC & VIDEO KỸ NĂNG SỐ)
CREATE TABLE IF NOT EXISTS public.learning_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('video', 'image', 'infographic', 'document', 'audio')),
    category TEXT NOT NULL, -- 'Tôi Muốn Học', 'VNeID & Dịch vụ công', 'Sử dụng Zalo', 'An toàn số', 'Quét QR'
    media_url TEXT NOT NULL,
    thumbnail_url TEXT,
    source_author TEXT DEFAULT 'Tổ Công nghệ số Cộng đồng Thôn 6',
    view_count INT DEFAULT 0,
    senior_friendly BOOLEAN DEFAULT TRUE,
    status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'pending', 'published')),
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.learning_resources ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Xem tài nguyên học tập" ON public.learning_resources;
CREATE POLICY "Xem tài nguyên học tập" ON public.learning_resources FOR SELECT USING (true);

DROP POLICY IF EXISTS "Quản lý tài nguyên học tập" ON public.learning_resources;
CREATE POLICY "Quản lý tài nguyên học tập" ON public.learning_resources FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('tech_team', 'admin'))
);


-- 3. BẢNG NEWS_ARTICLES (BẢN TIN THỜI SỰ, NÔNG NGHIỆP & CẢNH BÁO SỐ)
CREATE TABLE IF NOT EXISTS public.news_articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL, -- 'Nông Nghiệp Di Linh', 'Thông Báo Xã', 'Kinh Tế Lâm Đồng', 'Cảnh Báo An Ninh', 'Chính Sách Mới'
    category_color TEXT DEFAULT 'bg-blue-600',
    scope TEXT NOT NULL DEFAULT 'dilinh' CHECK (scope IN ('dilinh', 'lamdong', 'national')),
    scope_label TEXT DEFAULT '🏛️ Xã Di Linh',
    image_url TEXT,
    source TEXT NOT NULL DEFAULT 'UBND Xã Di Linh',
    author TEXT NOT NULL DEFAULT 'Tổ CNS Cộng Đồng',
    published_date TEXT NOT NULL,
    views INT DEFAULT 0,
    is_urgent BOOLEAN DEFAULT FALSE,
    is_new BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.news_articles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Xem bản tin" ON public.news_articles;
CREATE POLICY "Xem bản tin" ON public.news_articles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Quản lý bản tin" ON public.news_articles;
CREATE POLICY "Quản lý bản tin" ON public.news_articles FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('tech_team', 'admin'))
);


-- 4. BẢNG COMMUNITY_ACTIVITIES (HOẠT ĐỘNG LAN TỎA CỘNG ĐỒNG)
CREATE TABLE IF NOT EXISTS public.community_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    media_urls TEXT[],
    article_url TEXT,
    source_name TEXT,
    participants_count INT DEFAULT 1,
    assisted_count INT DEFAULT 0,
    results_summary TEXT,
    author_name TEXT NOT NULL DEFAULT 'Tổ CNS Cộng Đồng Thôn 6',
    status TEXT DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
    is_featured BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.community_activities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Xem hoạt động cộng đồng" ON public.community_activities;
CREATE POLICY "Xem hoạt động cộng đồng" ON public.community_activities FOR SELECT USING (true);

DROP POLICY IF EXISTS "Đăng bài hoạt động" ON public.community_activities;
CREATE POLICY "Đăng bài hoạt động" ON public.community_activities FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Quản lý hoạt động" ON public.community_activities;
CREATE POLICY "Quản lý hoạt động" ON public.community_activities FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('tech_team', 'admin'))
);


-- 5. BẢNG LEARNING_MODELS (MÔ HÌNH HỌC TẬP TỪ NGƯỜI DÂN)
CREATE TABLE IF NOT EXISTS public.learning_models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    raw_content TEXT NOT NULL,
    ai_formatted_content JSONB,
    media_urls TEXT[],
    author_name TEXT NOT NULL DEFAULT 'Người dân Thôn 6',
    likes_count INT DEFAULT 0,
    status TEXT DEFAULT 'approved' CHECK (status IN ('draft', 'pending', 'approved')),
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.learning_models ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Xem mô hình học tập" ON public.learning_models;
CREATE POLICY "Xem mô hình học tập" ON public.learning_models FOR SELECT USING (true);

DROP POLICY IF EXISTS "Đăng mô hình học tập" ON public.learning_models FOR INSERT;
CREATE POLICY "Đăng mô hình học tập" ON public.learning_models FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Quản lý mô hình học tập" ON public.learning_models;
CREATE POLICY "Quản lý mô hình học tập" ON public.learning_models FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('tech_team', 'admin'))
);


-- 6. BẢNG OFFICIAL_DOCUMENTS (VĂN BẢN PHÁP QUY & TRI THỨC AI RAG)
CREATE TABLE IF NOT EXISTS public.official_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doc_number TEXT NOT NULL,
    title TEXT NOT NULL,
    issuing_body TEXT NOT NULL,
    issued_date DATE NOT NULL,
    effect_status TEXT NOT NULL DEFAULT 'Còn hiệu lực',
    source_url TEXT,
    file_url TEXT,
    content_summary TEXT NOT NULL,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.official_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Xem văn bản chính thống" ON public.official_documents;
CREATE POLICY "Xem văn bản chính thống" ON public.official_documents FOR SELECT USING (true);

DROP POLICY IF EXISTS "Quản lý văn bản chính thống" ON public.official_documents;
CREATE POLICY "Quản lý văn bản chính thống" ON public.official_documents FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('tech_team', 'admin'))
);


-- 7. BẢNG AGRI_MARKET_PRICES (BẢNG GIÁ NÔNG SẢN DI LINH HÀNG NGÀY)
CREATE TABLE IF NOT EXISTS public.agri_market_prices (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    unit TEXT NOT NULL DEFAULT 'kg',
    price_str TEXT NOT NULL,
    avg_price NUMERIC DEFAULT 0,
    trend TEXT DEFAULT 'up' CHECK (trend IN ('up', 'down', 'stable')),
    change_str TEXT,
    note TEXT,
    icon TEXT DEFAULT '☕',
    sort_order INT DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.agri_market_prices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Xem giá nông sản" ON public.agri_market_prices;
CREATE POLICY "Xem giá nông sản" ON public.agri_market_prices FOR SELECT USING (true);

DROP POLICY IF EXISTS "Cập nhật giá nông sản" ON public.agri_market_prices;
CREATE POLICY "Cập nhật giá nông sản" ON public.agri_market_prices FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('tech_team', 'admin'))
);


-- 8. BẢNG WEATHER_DAILY (THỜI TIẾT DI LINH & KHUYẾN CÁO NÔNG VỤ)
CREATE TABLE IF NOT EXISTS public.weather_daily (
    id TEXT PRIMARY KEY DEFAULT 'current_weather',
    location TEXT DEFAULT 'Huyện Di Linh, Tỉnh Lâm Đồng',
    temp_current INT DEFAULT 24,
    temp_min INT DEFAULT 19,
    temp_max INT DEFAULT 29,
    humidity INT DEFAULT 78,
    rain_probability INT DEFAULT 45,
    wind_speed TEXT DEFAULT '12 km/h',
    uv_index INT DEFAULT 6,
    condition TEXT DEFAULT 'Mây thay đổi, ngày nắng, chiều tối có mưa rào rải rác',
    icon TEXT DEFAULT '⛅',
    advice TEXT DEFAULT 'Thời tiết thích hợp để bón phân đợt cuối và tỉa cành thông thoáng. Tránh xịt thuốc phòng nấm khi trời chuyển mây đen chiều tối.',
    forecast JSONB DEFAULT '[
      {"time": "Sáng", "temp": "22°C", "icon": "🌤️", "desc": "Nắng nhẹ, gió mát"},
      {"time": "Trưa", "temp": "28°C", "icon": "☀️", "desc": "Nắng ấm ráo"},
      {"time": "Chiều", "temp": "25°C", "icon": "🌦️", "desc": "Mưa rào cục bộ"},
      {"time": "Tối", "temp": "20°C", "icon": "🌙", "desc": "Trời mát mẻ, se lạnh"}
    ]',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.weather_daily ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Xem thời tiết" ON public.weather_daily;
CREATE POLICY "Xem thời tiết" ON public.weather_daily FOR SELECT USING (true);

DROP POLICY IF EXISTS "Cập nhật thời tiết" ON public.weather_daily;
CREATE POLICY "Cập nhật thời tiết" ON public.weather_daily FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('tech_team', 'admin'))
);


-- 9. BẢNG UNANSWERED_QUESTIONS (NHẬT KÝ CÂU HỎI CHƯA BIẾT CỦA AI)
CREATE TABLE IF NOT EXISTS public.unanswered_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question TEXT NOT NULL,
    asked_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'answered', 'dismissed')),
    answer TEXT,
    answered_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    answered_at TIMESTAMPTZ
);

ALTER TABLE public.unanswered_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Ghi câu hỏi chưa trả lời" ON public.unanswered_questions;
CREATE POLICY "Ghi câu hỏi chưa trả lời" ON public.unanswered_questions FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Xem và trả lời câu hỏi" ON public.unanswered_questions;
CREATE POLICY "Xem và trả lời câu hỏi" ON public.unanswered_questions FOR ALL USING (true);


-- ==============================================================================
-- NẠP DỮ LIỆU THỰC TẾ BAN ĐẦU (REAL SEED DATA)
-- ==============================================================================

-- 1. GIÁ NÔNG SẢN
INSERT INTO public.agri_market_prices (id, name, unit, price_str, avg_price, trend, change_str, note, icon, sort_order) VALUES
('coffee-robusta', 'Cà phê Robusta (Nhân xô)', 'kg', '119.500 – 122.000', 121000, 'up', '+1.500 đ/kg', 'Đạt mức giá cao kỷ lục, thương lái thu mua mạnh', '☕', 1),
('coffee-fresh', 'Cà phê quả tươi chín (Hái chọn)', 'kg', '24.000 – 26.500', 25000, 'up', '+500 đ/kg', 'Ưu tiên vườn hái chín trên 90%', '🍒', 2),
('durian-monthong', 'Sầu riêng Monthong (Loại 1)', 'kg', '85.000 – 95.000', 90000, 'stable', 'Ổn định', 'Cắt tại vườn, thương lái đóng thùng xuất khẩu', '🍈', 3),
('durian-ri6', 'Sầu riêng Ri6 (Loại 1)', 'kg', '60.000 – 68.000', 65000, 'stable', 'Ổn định', 'Cơm vàng hạt lép, chất lượng đồng đều', '🍈', 4),
('pepper-black', 'Hồ tiêu đen Di Linh', 'kg', '148.000 – 152.000', 150000, 'up', '+2.000 đ/kg', 'Dung tích hạt chắc, tiêu khô bảo quản tốt', '🌿', 5),
('macadamia', 'Hạt Mắc ca tươi (Vỏ xanh)', 'kg', '75.000 – 82.000', 78000, 'stable', 'Ổn định', 'Thu mua chế biến sấy nứt vỏ chất lượng cao', '🌰', 6)
ON CONFLICT (id) DO UPDATE SET
    price_str = EXCLUDED.price_str,
    avg_price = EXCLUDED.avg_price,
    trend = EXCLUDED.trend,
    change_str = EXCLUDED.change_str,
    note = EXCLUDED.note,
    updated_at = NOW();

-- 2. THỜI TIẾT DI LINH
INSERT INTO public.weather_daily (id, location, temp_current, temp_min, temp_max, humidity, rain_probability, wind_speed, uv_index, condition, advice) VALUES
('current_weather', 'Huyện Di Linh, Tỉnh Lâm Đồng', 24, 19, 29, 78, 45, '12 km/h', 6, 'Mây thay đổi, ngày nắng, chiều tối có mưa rào rải rác', 'Thời tiết thích hợp để bón phân đợt cuối và tỉa cành thông thoáng. Tránh xịt thuốc phòng nấm khi trời chuyển mây đen chiều tối.')
ON CONFLICT (id) DO UPDATE SET
    temp_current = EXCLUDED.temp_current,
    temp_min = EXCLUDED.temp_min,
    temp_max = EXCLUDED.temp_max,
    humidity = EXCLUDED.humidity,
    rain_probability = EXCLUDED.rain_probability,
    condition = EXCLUDED.condition,
    advice = EXCLUDED.advice,
    updated_at = NOW();

-- 3. KHO BÀI HỌC KỸ NĂNG SỐ
INSERT INTO public.learning_resources (title, description, type, category, media_url, source_author, view_count, senior_friendly, status) VALUES
('🎥 Video Hướng Dẫn Kỹ Năng Số Cầm Tay Chỉ Việc - Phần 1', 'Cẩm nang video hướng dẫn chi tiết trực quan các thao tác công nghệ số thiết yếu, hỗ trợ bà con Thôn 6 xem và thực hành dễ dàng.', 'video', 'Tôi Muốn Học', 'https://www.youtube.com/embed/pu3IBvcnC9U', 'Tổ Công nghệ số Cộng đồng Thôn 6', 245, true, 'published'),
('🎥 Video Hướng Dẫn Kỹ Năng Số Thực Hành Trực Quan - Phần 2', 'Video cẩm nang tiếp theo hướng dẫn chi tiết các thao tác công nghệ số thực tế, giúp người dân Thôn 6 làm chủ ứng dụng số dễ dàng.', 'video', 'Tôi Muốn Học', 'https://www.youtube.com/embed/HvSLR4j1baY', 'Tổ Công nghệ số Cộng đồng Thôn 6', 198, true, 'published'),
('🎥 Video Hướng Dẫn Kỹ Năng Số Nâng Cao - Phần 3', 'Cẩm nang video thực hành chuyên sâu giúp người dân Thôn 6 tiếp cận nền tảng công nghệ và ứng dụng thông minh trong đời sống.', 'video', 'Tôi Muốn Học', 'https://www.youtube.com/embed/HSmgjZ4Q6dM', 'Tổ Công nghệ số Cộng đồng Thôn 6', 280, true, 'published'),
('🎥 Video Hướng Dẫn Kích Hoạt VNeID Mức 2 & Tra Cứu Dịch Vụ Công', 'Hướng dẫn trực quan chi tiết từng nút bấm trên điện thoại giúp người dân kích hoạt tài khoản định danh điện tử VNeID.', 'video', 'VNeID & Dịch vụ công', 'https://www.youtube.com/embed/pu3IBvcnC9U', 'Công an Xã Di Linh - Tổ CNS', 312, true, 'published'),
('🎥 Video Hướng Dẫn Gọi Điện Video Zalo Kết Nối Người Thân', 'Video thao tác màn hình lớn đơn giản giúp các bác cao tuổi tự tin gọi video trò chuyện với con cháu.', 'video', 'Sử dụng Zalo', 'https://www.youtube.com/embed/HvSLR4j1baY', 'Đoàn Thanh Niên Thôn 6', 175, true, 'published'),
('✨ Hướng dẫn 4 bước quét mã QR thanh toán & Dịch vụ công', 'Thao tác cầm tay chỉ việc chi tiết từng bước mở camera hoặc ứng dụng Zalo để quét QR an toàn.', 'infographic', 'Quét QR', 'https://images.unsplash.com/photo-1595079672139-cee4c06cdc92?auto=format&fit=crop&w=1000&q=80', 'Tổ Công nghệ số cộng đồng Thôn 6', 98, true, 'published'),
('🛡️ 5 Dấu hiệu nhận biết lừa đảo qua cuộc gọi & tin nhắn', 'Tài liệu infographic trực quan giúp người cao tuổi phòng tránh bị chiếm đoạt tài khoản ngân hàng.', 'infographic', 'An toàn số', 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1000&q=80', 'Cục An toàn thông tin - Bộ TT&TT', 210, true, 'published'),
('🎙️ Podcast 2 phút: Cảnh báo chiêu trò giả danh VNeID', 'Bản thu âm ngắn truyền thanh cho người dân không tiện đọc chữ, phân tích thủ đoạn lừa đảo.', 'audio', 'An toàn số', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', 'Đài Truyền thanh Xã Di Linh', 85, true, 'published');

-- 4. BẢN TIN THỜI SỰ & NÔNG NGHIỆP
INSERT INTO public.news_articles (title, summary, content, category, category_color, scope, scope_label, image_url, source, author, published_date, views, is_urgent, is_new) VALUES
('☕ Giá Cà Phê Di Linh & Dự Báo Nông Nghiệp Hôm Nay', 'Cập nhật thị trường nông sản hôm nay tại huyện Di Linh: Giá cà phê Robusta nhân xô neo cao ở mức 118.000đ - 122.500đ/kg, hướng dẫn kỹ thuật chăm sóc vườn và kết nối tiêu thụ nông sản số.', 'BẢN TIN THỊ TRƯỜNG NÔNG SẢN DI LINH HÔM NAY:\n\n1. TÌNH HÌNH GIÁ NÔNG SẢN:\n- Giá Cà phê Robusta nhân xô thu mua: Dao động từ 118.000đ – 122.500đ/kg.\n- Giá Sầu riêng Monthong & Ri6 loại 1 giữ mức cao.\n- Khuyến cáo bà con Thôn 6 ứng dụng tem quét mã QR truy xuất nguồn gốc chất lượng để nâng cao giá trị khi xuất bán.\n\n2. HỖ TRỢ NÔNG DÂN SỐ:\nTổ CNS Thôn 6 hỗ trợ bà con kết nối bán hàng qua nhóm Zalo Cộng đồng và sàn thương mại điện tử miễn phí. Hotline: 0903.382.277.', 'Nông Nghiệp Di Linh', 'bg-emerald-600', 'dilinh', '🏛️ Xã Di Linh', '/banner_2.png', 'Ban Nông Nghiệp Xã Di Linh', 'Tổ Khuyến Nông', 'Cập nhật hôm nay', 520, false, true),
('📢 UBND Xã Di Linh Thông Báo: Đợt Cao Điểm Kích Hoạt VNeID Mức 2 & Dịch Vụ Công Toàn Trình', 'Công an xã phối hợp cùng Tổ Công nghệ số Thôn 6 tổ chức hỗ trợ người dân cài đặt định danh điện tử, tích hợp BHYT và giải quyết thủ tục giấy tờ trực tuyến tại cơ sở.', 'KẾ HOẠCH CAO ĐIỂM CHUYỂN ĐỔI SỐ TẠI XÃ DI LINH:\n\nNhằm phục vụ nhân dân tốt nhất, UBND Xã Di Linh triển khai:\n1. Hỗ trợ kích hoạt VNeID Mức 2 cho 100% người dân.\n2. Tích hợp Thẻ BHYT, Giấy phép lái xe vào điện thoại.\n3. Đội tình nguyện viên lưu động đến tận nhà hỗ trợ các cụ cao tuổi.', 'Thông Báo Xã', 'bg-blue-600', 'dilinh', '🏛️ Xã Di Linh', '/banner_1.jpg', 'UBND Xã Di Linh', 'Tổ CNS Cộng Đồng', 'Cập nhật hôm nay', 740, true, true),
('🚗 Lâm Đồng Đẩy Nhanh Tiến Độ Dự Án Cao Tốc Tân Phú - Bảo Lộc - Liên Khương Đi Qua Di Linh', 'Tuyến cao tốc huyết mạch kết nối TP.HCM với Lâm Đồng sẽ rút ngắn thời gian di chuyển từ Di Linh đi Đà Lạt và Đông Nam Bộ, mở ra cơ hội đột phá kinh tế - du lịch cho địa phương.', 'TIN THỜI SỰ TỈNH LÂM ĐỒNG:\nTuyến đường cao tốc hoàn thành sẽ kết nối thông suốt từ TP.HCM qua Đồng Nai lên Lâm Đồng, đi qua địa phận huyện Di Linh. Giúp rút ngắn một nửa thời gian vận chuyển nông sản cà phê, chè, sầu riêng của bà con Di Linh về các cảng xuất khẩu.', 'Kinh Tế Lâm Đồng', 'bg-teal-600', 'lamdong', '🌲 Tỉnh Lâm Đồng', '/banner_thon6_dilinh.jpg', 'Cổng TTĐT Tỉnh Lâm Đồng', 'Báo Lâm Đồng', 'Hôm nay', 890, false, true),
('🚨 Cục An Toàn Thông Tin Cảnh Báo Khẩn Toàn Quốc: 24 Thủ Đoạn Lừa Đảo Công Nghệ Cao', 'Bộ Công an và Bộ TT&TT khuyến cáo người dân cả nước tuyệt đối cảnh giác trước các thủ đoạn mạo danh công an, ngân hàng, thuế gọi điện thoại yêu cầu cài link độc hại (.apk).', 'CẢNH BÁO AN NINH MẠNG QUỐC GIA:\n\nTuyệt đối ghi nhớ nguyên tắc "4 KHÔNG - 2 PHẢI":\n- KHÔNG cung cấp mật khẩu, mã OTP cho bất kỳ ai.\n- KHÔNG bấm vào đường link lạ gửi qua tin nhắn/Zalo.\n- KHÔNG tải app ngoài kho ứng dụng chính thức.\n- KHÔNG chuyển tiền theo yêu cầu của người lạ qua điện thoại.\n- PHẢI kiểm tra lại với Công an địa phương khi có nghi vấn.\n- PHẢI báo ngay cho ngân hàng khóa tài khoản khi nghi ngờ lộ thông tin.', 'Cảnh Báo An Ninh', 'bg-red-700', 'national', '🇻🇳 Cả Nước', 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1000&q=80', 'Cục An Toàn Thông Tin - Bộ TT&TT', 'Bộ TT&TT', 'Hôm qua', 1580, true, false);

-- 5. HOẠT ĐỘNG LAN TỎA CỘNG ĐỒNG
INSERT INTO public.community_activities (title, description, media_urls, article_url, source_name, participants_count, assisted_count, results_summary, author_name, status, is_featured) VALUES
('📰 Báo Lâm Đồng: Xã Di Linh – Để Đại hội Đảng thật sự là ngày hội lớn của toàn dân', 'Bài báo trên Báo Lâm Đồng ghi nhận khí thế thi đua sôi nổi tại xã Di Linh: Phát huy sức mạnh khối đại đoàn kết toàn dân, đẩy mạnh các công trình dân sinh, chuyển đổi số cộng đồng, nâng cao đời sống vật chất và tinh thần cho nhân dân toàn xã.', ARRAY['https://baolamdong.vn/file/e7837c02876411cd0187645a2551378a/dataimages/202410/original/images2482348_1.jpg', '/banner_thon6_dilinh.jpg'], 'https://baolamdong.vn/xa-di-linh-de-dai-hoi-dang-that-su-la-ngay-hoi-lon-cua-toan-dan-383069.html', 'Báo Lâm Đồng (baolamdong.vn)', 1250, 580, 'Lan tỏa sâu rộng tinh thần đoàn kết, thi đua lập thành tích chào mừng Đại hội Đảng các cấp, gắn liền với phong trào Chuyển đổi số cộng đồng và xây dựng Nông thôn mới kiểu mẫu tại Xã Di Linh.', 'Báo Lâm Đồng', 'approved', true),
('🌱 Ra Quân Hỗ Trợ 85 Hộ Dân Thôn 6 Kích Hoạt VNeID & BHYT Số', 'Đoàn thanh niên phối hợp cùng Chi hội Phụ nữ Thôn 6 đã đến từng hộ gia đình hướng dẫn các cô chú lớn tuổi cài đặt VNeID Mức 2 và tra cứu thẻ BHYT điện tử trên smartphone.', ARRAY['/banner_1.jpg'], NULL, NULL, 15, 85, '100% các hộ được hỗ trợ đã nắm vững cách tra cứu thẻ BHYT trên điện thoại khi đi khám bệnh.', 'Tổ CNS Cộng Đồng Thôn 6', 'approved', false),
('🤝 Hướng Dẫn Nông Dân Tạo Mã QR Truy Xuất Nguồn Gốc Cà Phê & Sầu Riêng', 'Buổi tập huấn thực hành cầm tay chỉ việc cho các hộ nông dân Thôn 6 biết cách tạo mã QR tem nhãn cho sản phẩm nông sản sạch để xuất bán cho thương lái và sàn thương mại điện tử.', ARRAY['/banner_2.png'], NULL, NULL, 28, 45, 'Đã tạo thành công 15 mã QR tem truy xuất nguồn gốc cho các vườn mẫu tại Thôn 6.', 'Hội Nông Dân Thôn 6', 'approved', false);

-- 6. VĂN BẢN CHÍNH THỐNG
INSERT INTO public.official_documents (doc_number, title, issuing_body, issued_date, effect_status, source_url, content_summary) VALUES
('06/QĐ-TTg', 'Đề án Phát triển ứng dụng dữ liệu về dân cư, định danh và xác thực điện tử phục vụ chuyển đổi số quốc gia (Đề án 06)', 'Thủ tướng Chính phủ', '2022-01-06', 'Còn hiệu lực', 'https://chinhphu.vn', 'Quy định mục tiêu tích hợp định danh điện tử VNeID thay thế thẻ BHYT giấy, sổ hộ khẩu giấy, giải quyết dịch vụ công trực tuyến và tạo lập công dân số.'),
('24/KH-UBND', 'Kế hoạch Triển khai Phong trào "Bình dân học vụ số" và Hoạt động Tổ công nghệ số cộng đồng năm 2026', 'UBND Xã Di Linh', '2026-01-15', 'Còn hiệu lực', 'https://dilinh.lamdong.gov.vn', 'Phổ cập kỹ năng số toàn diện cho người dân Thôn 6: Quét mã QR, thanh toán không tiền mặt, tra cứu thông tin đất đai, nộp hồ sơ trực tuyến và nhận diện lừa đảo trên mạng.'),
('18/TB-UBND', 'Thông báo Lịch hỗ trợ kích hoạt tài khoản định danh điện tử VNeID Mức 2 lưu động tại Thôn 6', 'UBND Xã Di Linh - Công an Xã', '2026-02-10', 'Còn hiệu lực', 'https://dilinh.lamdong.gov.vn', 'Tổ chức các điểm hỗ trợ lưu động tại Nhà sinh hoạt cộng đồng Thôn 6 từ 08h00 - 20h00 các ngày trong tuần. Hướng dẫn công dân mang CCCD gắn chip để được kích hoạt miễn phí.');
