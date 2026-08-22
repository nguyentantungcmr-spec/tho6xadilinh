-- ==============================================================================
-- NỀN TẢNG CHUYỂN ĐỔI SỐ & HỌC TẬP CỘNG ĐỒNG (THÔN 6 XÃ DI LINH)
-- DATABASE SCHEMA TOÀN DIỆN & 12 TRỤ CỘT TRI THỨC CHUẨN TRÊN SUPABASE POSTGRESQL
-- ==============================================================================

-- 1. BẢNG PROFILES (NGƯỜI DÙNG & PHÂN QUYỀN)
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

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone_number TEXT DEFAULT '0903.382.277';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'citizen';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS hamlet_address TEXT DEFAULT 'Thôn 6, Xã Di Linh';

-- CÁC HÀM SECURITY DEFINER ĐỂ TRÁNH LỖI INFINITE RECURSION
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_tech_or_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('tech_team', 'admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Cho phép mọi người xem danh sách profiles" ON public.profiles;
CREATE POLICY "Cho phép mọi người xem danh sách profiles" 
ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Người dùng tự cập nhật profile của mình" ON public.profiles;
CREATE POLICY "Người dùng tự cập nhật profile của mình" 
ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Cho phép chèn profile" ON public.profiles;
CREATE POLICY "Cho phép chèn profile" 
ON public.profiles FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admin toàn quyền quản trị profiles" ON public.profiles;
CREATE POLICY "Admin toàn quyền quản trị profiles" 
ON public.profiles FOR ALL USING (public.is_admin());

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


-- 2. BẢNG LEARNING_RESOURCES (KHO BÀI HỌC KỸ NĂNG SỐ)
CREATE TABLE IF NOT EXISTS public.learning_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL,
    category TEXT NOT NULL,
    media_url TEXT NOT NULL,
    thumbnail_url TEXT,
    source_author TEXT DEFAULT 'Tổ Công nghệ số Cộng đồng Thôn 6',
    view_count INT DEFAULT 0,
    senior_friendly BOOLEAN DEFAULT TRUE,
    status TEXT DEFAULT 'published',
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.learning_resources ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;
ALTER TABLE public.learning_resources ADD COLUMN IF NOT EXISTS source_author TEXT DEFAULT 'Tổ Công nghệ số Cộng đồng Thôn 6';
ALTER TABLE public.learning_resources ADD COLUMN IF NOT EXISTS view_count INT DEFAULT 0;
ALTER TABLE public.learning_resources ADD COLUMN IF NOT EXISTS senior_friendly BOOLEAN DEFAULT TRUE;
ALTER TABLE public.learning_resources ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'published';

ALTER TABLE public.learning_resources ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Xem tài nguyên học tập" ON public.learning_resources;
CREATE POLICY "Xem tài nguyên học tập" ON public.learning_resources FOR SELECT USING (true);

DROP POLICY IF EXISTS "Quản lý tài nguyên học tập" ON public.learning_resources;
CREATE POLICY "Quản lý tài nguyên học tập" ON public.learning_resources FOR ALL USING (public.is_tech_or_admin());


-- 3. BẢNG NEWS_ARTICLES (BẢN TIN THỜI SỰ & NÔNG NGHIỆP)
CREATE TABLE IF NOT EXISTS public.news_articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL,
    category_color TEXT DEFAULT 'bg-blue-600',
    scope TEXT NOT NULL DEFAULT 'dilinh',
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

ALTER TABLE public.news_articles ADD COLUMN IF NOT EXISTS category_color TEXT DEFAULT 'bg-blue-600';
ALTER TABLE public.news_articles ADD COLUMN IF NOT EXISTS scope TEXT DEFAULT 'dilinh';
ALTER TABLE public.news_articles ADD COLUMN IF NOT EXISTS scope_label TEXT DEFAULT '🏛️ Xã Di Linh';
ALTER TABLE public.news_articles ADD COLUMN IF NOT EXISTS is_urgent BOOLEAN DEFAULT FALSE;
ALTER TABLE public.news_articles ADD COLUMN IF NOT EXISTS is_new BOOLEAN DEFAULT TRUE;

ALTER TABLE public.news_articles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Xem bản tin" ON public.news_articles;
CREATE POLICY "Xem bản tin" ON public.news_articles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Quản lý bản tin" ON public.news_articles;
CREATE POLICY "Quản lý bản tin" ON public.news_articles FOR ALL USING (public.is_tech_or_admin());


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
    status TEXT DEFAULT 'approved',
    is_featured BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.community_activities ADD COLUMN IF NOT EXISTS article_url TEXT;
ALTER TABLE public.community_activities ADD COLUMN IF NOT EXISTS source_name TEXT;
ALTER TABLE public.community_activities ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;
ALTER TABLE public.community_activities ADD COLUMN IF NOT EXISTS participants_count INT DEFAULT 1;
ALTER TABLE public.community_activities ADD COLUMN IF NOT EXISTS assisted_count INT DEFAULT 0;
ALTER TABLE public.community_activities ADD COLUMN IF NOT EXISTS results_summary TEXT;
ALTER TABLE public.community_activities ADD COLUMN IF NOT EXISTS author_name TEXT DEFAULT 'Tổ CNS Cộng Đồng Thôn 6';
ALTER TABLE public.community_activities ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'approved';

ALTER TABLE public.community_activities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Xem hoạt động cộng đồng" ON public.community_activities;
CREATE POLICY "Xem hoạt động cộng đồng" ON public.community_activities FOR SELECT USING (true);

DROP POLICY IF EXISTS "Đăng bài hoạt động" ON public.community_activities;
CREATE POLICY "Đăng bài hoạt động" ON public.community_activities FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Quản lý hoạt động" ON public.community_activities;
CREATE POLICY "Quản lý hoạt động" ON public.community_activities FOR ALL USING (public.is_tech_or_admin());


-- 5. BẢNG LEARNING_MODELS (MÔ HÌNH HỌC TẬP TỪ NGƯỜI DÂN)
CREATE TABLE IF NOT EXISTS public.learning_models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    raw_content TEXT NOT NULL,
    ai_formatted_content JSONB,
    media_urls TEXT[],
    author_name TEXT NOT NULL DEFAULT 'Người dân Thôn 6',
    likes_count INT DEFAULT 0,
    status TEXT DEFAULT 'approved',
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.learning_models ADD COLUMN IF NOT EXISTS ai_formatted_content JSONB;
ALTER TABLE public.learning_models ADD COLUMN IF NOT EXISTS likes_count INT DEFAULT 0;

ALTER TABLE public.learning_models ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Xem mô hình học tập" ON public.learning_models;
CREATE POLICY "Xem mô hình học tập" ON public.learning_models FOR SELECT USING (true);

DROP POLICY IF EXISTS "Đăng mô hình học tập" ON public.learning_models;
CREATE POLICY "Đăng mô hình học tập" ON public.learning_models FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Quản lý mô hình học tập" ON public.learning_models;
CREATE POLICY "Quản lý mô hình học tập" ON public.learning_models FOR ALL USING (public.is_tech_or_admin());


-- 6. BẢNG OFFICIAL_DOCUMENTS (VĂN BẢN PHÁP QUY & RAG AI - 12 TRỤ CỘT TRI THỨC)
CREATE TABLE IF NOT EXISTS public.official_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doc_number TEXT NOT NULL,
    title TEXT NOT NULL,
    issuing_body TEXT NOT NULL,
    issued_date DATE NOT NULL,
    category TEXT NOT NULL DEFAULT 'Chuyển đổi số cộng đồng',
    effect_status TEXT NOT NULL DEFAULT 'Còn hiệu lực',
    source_url TEXT,
    file_url TEXT,
    content_summary TEXT NOT NULL,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.official_documents ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'Chuyển đổi số cộng đồng';

ALTER TABLE public.official_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Xem văn bản chính thống" ON public.official_documents;
CREATE POLICY "Xem văn bản chính thống" ON public.official_documents FOR SELECT USING (true);

DROP POLICY IF EXISTS "Quản lý văn bản chính thống" ON public.official_documents;
CREATE POLICY "Quản lý văn bản chính thống" ON public.official_documents FOR ALL USING (public.is_tech_or_admin());


-- 7. BẢNG AGRI_MARKET_PRICES (BẢNG GIÁ NÔNG SẢN DI LINH)
CREATE TABLE IF NOT EXISTS public.agri_market_prices (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    unit TEXT NOT NULL DEFAULT 'kg',
    price_str TEXT NOT NULL,
    avg_price NUMERIC DEFAULT 0,
    trend TEXT DEFAULT 'up',
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
CREATE POLICY "Cập nhật giá nông sản" ON public.agri_market_prices FOR ALL USING (public.is_tech_or_admin());


-- 8. BẢNG WEATHER_DAILY (THỜI TIẾT DI LINH)
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
CREATE POLICY "Cập nhật thời tiết" ON public.weather_daily FOR ALL USING (public.is_tech_or_admin());


-- 9. BẢNG UNANSWERED_QUESTIONS (NHẬT KÝ CÂU HỎI AI)
CREATE TABLE IF NOT EXISTS public.unanswered_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question TEXT NOT NULL,
    asked_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'pending',
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
-- NẠP 12 TRỤ CỘT TRI THỨC CHUẨN VÀO BẢNG OFFICIAL_DOCUMENTS
-- ==============================================================================

-- 1. VNeID & ĐỊNH DANH ĐIỆN TỬ
INSERT INTO public.official_documents (doc_number, title, issuing_body, issued_date, category, effect_status, source_url, content_summary) VALUES
('06/QĐ-TTg & 15/KH-CAX', 'Quy trình kích hoạt tài khoản định danh điện tử VNeID Mức 2 và tích hợp giấy tờ công dân tại Xã Di Linh', 'Thủ tướng Chính phủ & Công an Xã Di Linh', '2026-01-10', 'VNeID & Định danh điện tử', 'Còn hiệu lực', 'https://dilinh.lamdong.gov.vn', 'HƯỚNG DẪN KÍCH HOẠT VNeID MỨC 2 TẠI THÔN 6 XÃ DI LINH:\n1. Địa điểm làm thủ tục: Trụ sở Công an Xã Di Linh hoặc các buổi lưu động tại Nhà sinh hoạt cộng đồng Thôn 6.\n2. Giấy tờ cần mang: Thẻ CCCD gắn chip và điện thoại có số thuê bao chính chủ.\n3. Các bước tích hợp giấy tờ vào VNeID Mức 2:\n- Thẻ BHYT: Vào "Ví giấy tờ" -> "Tích hợp thông tin" -> Chọn "Thẻ BHYT" -> Nhập mã số BHXH in trên thẻ.\n- Giấy phép lái xe (GPLX): Chọn loại GPLX (PET) và nhập số giấy phép.\n- Đăng ký xe: Nhập biển số và số khung/số máy.\n4. Hỗ trợ sự cố: Khi quên mật khẩu hoặc đổi số điện thoại đăng ký, liên hệ Công an Xã hoặc Hotline Tổ CNS Thôn 6: 0903.382.277 để được hỗ trợ mở khóa.'),

-- 2. DỊCH VỤ CÔNG TRỰC TUYẾN
('42/2022/NĐ-CP & 08/HD-UBND', 'Quy định và hướng dẫn nộp hồ sơ thủ tục hành chính trực tuyến toàn trình tại Bộ phận Một cửa UBND Xã Di Linh', 'Chính phủ & UBND Xã Di Linh', '2026-01-15', 'Dịch vụ công trực tuyến', 'Còn hiệu lực', 'https://dichvucong.gov.vn', 'HƯỚNG DẪN NỘP HỒ SƠ DỊCH VỤ CÔNG TRỰC TUYẾN TOÀN TRÌNH:\n1. Các thủ tục phổ biến đã được cung cấp trực tuyến 24/7:\n- Cấp bản sao trích lục hộ tịch (Khai sinh, Kết hôn, Khai tử).\n- Đăng ký khai sinh, đăng ký kết hôn, thông báo lưu trú.\n- Chứng thực bản sao điện tử từ bản chính.\n- Đăng ký biến động quyền sử dụng đất đai.\n2. Quy trình 4 bước thực hiện:\n- Bước 1: Truy cập dichvucong.gov.vn hoặc dilinh.lamdong.gov.vn -> Đăng nhập bằng tài khoản VNeID Mức 2.\n- Bước 2: Chọn cơ quan tiếp nhận: "UBND Xã Di Linh, Huyện Di Linh, Tỉnh Lâm Đồng".\n- Bước 3: Điền tờ khai điện tử và đính kèm ảnh chụp các giấy tờ gốc rõ nét.\n- Bước 4: Thanh toán lệ phí trực tuyến qua quét mã QR ngân hàng và nhận kết quả tại nhà qua bưu điện hoặc tại Bộ phận Một cửa xã.'),

-- 3. PHÒNG CHỐNG LỪA ĐẢO CÔNG NGHỆ CAO
('02/TB-CAH & 88/CAT-PA05', 'Cảnh báo 24 thủ đoạn lừa đảo công nghệ cao và nguyên tắc 4 KHÔNG - 2 PHẢI bảo vệ tài khoản ngân hàng', 'Công an Huyện Di Linh & Phòng An ninh mạng Công an Tỉnh Lâm Đồng', '2026-02-01', 'Phòng chống lừa đảo mạng', 'Còn hiệu lực', 'https://dilinh.lamdong.gov.vn', 'CẢNH BÁO AN NINH MẠNG VÀ PHÒNG CHỐNG TỘI PHẠM CÔNG NGHỆ CAO:\n1. Các thủ đoạn lừa đảo nguy hiểm nhất hiện nay tại Di Linh:\n- Kẻ gian giả danh Cán bộ Công an hoặc Cán bộ Thuế gọi điện thoại báo "sai thông tin CCCD", sau đó gửi đường link lạ đuôi ".apk" qua Zalo yêu cầu cài đặt để chiếm đoạt tài khoản ngân hàng.\n- Gọi video Deepfake giả khuôn mặt người thân mượn tiền khẩn cấp.\n- Mạo danh nhân viên điện lực/nước dọa cắt dịch vụ nếu không chuyển tiền vào tài khoản cá nhân.\n- Tuyển cộng tác viên làm việc online, xem video TikTok kiếm tiền hoa hồng cao.\n2. NGUYÊN TẮC VÀNG "4 KHÔNG - 2 PHẢI":\n- KHÔNG cung cấp mật khẩu, mã OTP, mã Smart OTP cho bất kỳ ai (kể cả nhân viên ngân hàng hay công an).\n- KHÔNG bấm vào link lạ, link rút gọn gửi qua SMS/Zalo.\n- KHÔNG tải app ngoài kho ứng dụng chính thức (Google Play / App Store).\n- KHÔNG chuyển tiền theo yêu cầu của người lạ qua điện thoại.\n- PHẢI xác minh lại với Công an Xã Di Linh khi có người tự xưng cơ quan chức năng gọi điện.\n- PHẢI gọi ngay ngân hàng khóa thẻ và báo Tổ CNS: 0903.382.277 khi nghi vấn bị lộ thông tin.'),

-- 4. CHUYỂN ĐỔI SỐ CỘNG ĐỒNG & BÌNH DÂN HỌC VỤ SỐ
('24/KH-UBND & 01/KH-TOCNS6', 'Kế hoạch triển khai phong trào "Bình dân học vụ số" và hoạt động Tổ công nghệ số cộng đồng Thôn 6 năm 2026', 'UBND Xã Di Linh & Tổ CNS Cộng Đồng Thôn 6', '2026-01-20', 'Chuyển đổi số cộng đồng', 'Còn hiệu lực', 'https://dilinh.lamdong.gov.vn', 'KẾ HOẠCH BÌNH DÂN HỌC VỤ SỐ TẠI THÔN 6:\n1. Mục tiêu: Phổ cập kỹ năng số căn bản cho 100% người dân, đặc biệt là người cao tuổi, phụ nữ và bà con đồng bào thiểu số.\n2. 4 Kỹ năng cốt lõi người dân Thôn 6 làm chủ:\n- Sử dụng VNeID và BHYT số đi khám bệnh.\n- Quét mã QR thanh toán tiền điện, nước, phân bón và nhu yếu phẩm.\n- Sử dụng Zalo gọi điện video kết nối con cháu và nhận tin tức cảnh báo an ninh thôn.\n- Tra cứu bảng giá nông sản cà phê, sầu riêng hàng ngày trên cổng thông tin thôn.\n3. Lịch hỗ trợ:\n- Định kỳ Thứ 7 & Chủ Nhật hàng tuần tại Nhà sinh hoạt cộng đồng Thôn 6.\n- Đội thanh niên tình nguyện "Đi từng ngõ, gõ từng nhà" hỗ trợ trực tiếp người cao tuổi.'),

-- 5. Y TẾ & BẢO HIỂM Y TẾ SỐ
('05/HD-BHXH-TTYT', 'Hướng dẫn khám chữa bệnh bằng mã QR thẻ BHYT trên ứng dụng VNeID và VssID tại các cơ sở y tế Di Linh', 'Bảo hiểm Xã hội & Trung tâm Y tế Huyện Di Linh', '2026-01-25', 'Y tế & BHYT số', 'Còn hiệu lực', 'https://dilinh.lamdong.gov.vn', 'QUY ĐỊNH KHÁM CHỮA BỆNH BẰNG THẺ BHYT ĐIỆN TỬ:\n1. Cơ sở y tế áp dụng: Trung tâm Y tế Huyện Di Linh, Trạm Y tế Xã Di Linh và tất cả bệnh viện tuyến huyện, tỉnh trên toàn quốc.\n2. Người dân Thôn 6 không cần mang thẻ BHYT giấy hay giấy tờ tùy thân rườm rà:\n- Chỉ cần mở ứng dụng VNeID (đã kích hoạt Mức 2) -> Vào "Ví giấy tờ" -> Chọn "Thẻ BHYT" -> Xuất trình mã QR cho nhân viên tiếp đón quét vào máy.\n- Hoặc sử dụng ứng dụng VssID (BHXH số) để xuất trình hình ảnh thẻ BHYT.\n3. Tiêm chủng mở rộng: Trạm Y tế Xã Di Linh tổ chức tiêm chủng định kỳ cho trẻ em vào ngày mùng 5 và 20 hàng tháng.'),

-- 6. GIÁO DỤC & HỌC TẬP SUỐT ĐỜI
('12/HD-PGDĐT', 'Hướng dẫn đăng ký tuyển sinh trực tuyến đầu cấp và tra cứu kết quả học tập qua sổ liên lạc điện tử VnEdu', 'Phòng GD&ĐT Huyện Di Linh & Trường TH-THCS Di Linh', '2026-02-05', 'Giáo dục & Tuyển sinh số', 'Còn hiệu lực', 'https://dilinh.lamdong.gov.vn', 'HƯỚNG DẪN GIÁO DỤC SỐ DÀNH CHO PHỤ HUYNH THÔN 6:\n1. Tuyển sinh trực tuyến đầu cấp (Mầm non, Lớp 1, Lớp 6):\n- Phụ huynh đăng ký hồ sơ nhập học cho con qua cổng tuyển sinh trực tuyến của ngành giáo dục Lâm Đồng mà không cần xếp hàng nộp hồ sơ giấy.\n2. Sổ liên lạc điện tử VnEdu:\n- Phụ huynh cài đặt ứng dụng VnEdu Connect trên điện thoại để nhận thông báo kết quả học tập, điểm danh, thời khóa biểu và học phí trực tuyến.\n3. Khuyến học Thôn 6: Chi hội Khuyến học Thôn 6 hàng năm trao thưởng học bổng cho học sinh nghèo vượt khó và đỗ đại học cao đẳng.'),

-- 7. MÔI TRƯỜNG & THU GOM RÁC THẢI
('19/TB-UBND', 'Quy định thời gian thu gom rác sinh hoạt, phân loại rác tại nguồn và giữ gìn vệ sinh môi trường Thôn 6', 'UBND Xã Di Linh - Ban Quản lý Môi trường', '2026-02-10', 'Môi trường & Rác thải', 'Còn hiệu lực', 'https://dilinh.lamdong.gov.vn', 'QUY ĐỊNH BẢO VỆ MÔI TRƯỜNG NÔNG THÔN MỚI THÔN 6:\n1. Lịch thu gom rác sinh hoạt:\n- Xe thu gom rác đi qua các trục đường chính Thôn 6 vào các ngày Thứ 3, Thứ 5 và Thứ 7 hàng tuần (từ 06h00 - 09h00 sáng).\n2. Phân loại rác tại nguồn:\n- Rác hữu cơ, lá cây, vỏ cà phê: Khuyến khích bà con ủ làm phân bón hữu cơ vi sinh bón cho cây trồng.\n- Rác tái chế (chai lọ nhựa, giấy vụn, kim loại): Thu gom để bán phế liệu.\n- Rác nguy hại nông nghiệp (vỏ bao bì, chai lọ thuốc bảo vệ thực vật): Tuyệt đối KHÔNG vứt bừa bãi ra nương rẫy, suối nguồn; phải bỏ vào các bể chứa xi măng chuyên dụng đặt tại các tuyến đường nội đồng.'),

-- 8. AN NINH TRẬT TỰ & PHÒNG CHÁY CHỮA CHÁY
('09/TB-CAX', 'Quy định đăng ký tạm trú, thông báo lưu trú qua VNeID và bảo đảm an ninh trật tự, PCCC mùa vụ', 'Công an Xã Di Linh', '2026-02-12', 'An ninh trật tự & PCCC', 'Còn hiệu lực', 'https://dilinh.lamdong.gov.vn', 'QUY ĐỊNH BẢO ĐẢM AN NINH TRẬT TỰ VÀ PCCC TẠI THÔN 6:\n1. Khai báo lưu trú nhân công thời vụ:\n- Các hộ gia đình thuê nhân công hái cà phê, cắt sầu riêng thời vụ phải thực hiện thông báo lưu trú trực tuyến qua ứng dụng VNeID hoặc báo cho Cán bộ Công an phụ trách Thôn 6 trong vòng 24 giờ.\n2. Phòng ngừa trộm cắp nông sản mùa vụ:\n- Tăng cường kiểm tra khóa cổng vườn, chòi rẫy; tích cực tham gia mô hình Camera an ninh thôn và Zalo an ninh trật tự.\n3. Phòng cháy chữa cháy (PCCC) mùa khô:\n- Nghiêm cấm đốt thực bì, dọn rẫy vào những ngày hanh khô gió lớn khi chưa tạo đường băng cản lửa; chuẩn bị sẵn máy bơm nước và bồn nước tưới phòng cháy lan sang rừng.'),

-- 9. CHÍNH SÁCH AN SINH XÃ HỘI & NGƯỜI CÓ CÔNG
('20/2021/NĐ-CP & 14/HD-LĐTBXH', 'Chính sách trợ cấp xã hội, cấp thẻ BHYT miễn phí cho người cao tuổi, hộ nghèo và vay vốn NHCSXH Di Linh', 'UBND Xã Di Linh - Bộ phận Lao động Thương binh & Xã hội', '2026-01-18', 'Chính sách người dân & An sinh', 'Còn hiệu lực', 'https://dilinh.lamdong.gov.vn', 'CHÍNH SÁCH AN SINH XÃ HỘI ÁP DỤNG TẠI THÔN 6 XÃ DI LINH:\n1. Trợ cấp xã hội hàng tháng:\n- Người cao tuổi từ đủ 80 tuổi trở lên không có lương hưu hoặc trợ cấp BHXH được hưởng trợ cấp xã hội và cấp thẻ BHYT miễn phí 100%.\n- Người khuyết tật nặng và đặc biệt nặng được hưởng trợ cấp theo quy định.\n2. Hỗ trợ hộ nghèo, cận nghèo:\n- Miễn giảm học phí, cấp bù tiền điện sinh hoạt và cấp thẻ BHYT diện nghèo/cận nghèo.\n3. Vay vốn Ngân hàng Chính sách Xã hội (NHCSXH) Huyện Di Linh:\n- Hỗ trợ vốn vay ưu đãi phát triển sản xuất cà phê, chăn nuôi, nhà ở xã hội và giải quyết việc làm qua Tổ Tiết kiệm & Vay vốn Thôn 6.'),

-- 10. NÔNG NGHIỆP, KHUYẾN NÔNG & NÔNG SẢN SỐ
('31/HD-TTKN', 'Quy trình kỹ thuật thâm canh cà phê Robusta bền vững, chăm sóc sầu riêng Ri6/Monthong và dán tem QR truy xuất', 'Trung tâm Khuyến Nông Tỉnh Lâm Đồng & Ban Nông Nghiệp Xã Di Linh', '2026-02-15', 'Nông nghiệp & Nông sản Di Linh', 'Còn hiệu lực', 'https://dilinh.lamdong.gov.vn', 'HƯỚNG DẪN KỸ THUẬT NÔNG NGHIỆP CÔNG NGHỆ CAO TẠI DI LINH:\n1. Canh tác Cà phê Robusta:\n- Tỉa cành thông thoáng sau thu hoạch, bón phân hữu cơ vi sinh kết hợp NPK cân đối theo 4 đợt nuôi trái.\n- Phòng trừ rệp sáp, mọt đục cành và bệnh rỉ sắt bằng chế phẩm sinh học an toàn.\n2. Chăm sóc Sầu riêng Monthong & Ri6:\n- Quản lý nước tưới giai đoạn xiết nước làm bông và xổ nhụy; phòng bệnh thối rễ, nứt thân xì mủ do nấm Phytophthora.\n3. Ứng dụng công nghệ số trong tiêu thụ:\n- Tạo mã QR tem truy xuất nguồn gốc vườn mẫu Thôn 6 giúp nâng giá trị xuất khẩu lên 15 - 25% so với bán xô truyền thống.'),

-- 11. PHÒNG CHỐNG THIÊN TAI & CỨU NẠN CỨU HỘ
('03/PA-BCH', 'Phương án chủ động phòng chống mưa bão, sạt lở đất, lũ quét và ứng phó hạn hán tại Thôn 6 Xã Di Linh', 'Ban Chỉ huy PCTT&TKCN Xã Di Linh', '2026-02-18', 'Phòng chống thiên tai & Bão lũ', 'Còn hiệu lực', 'https://dilinh.lamdong.gov.vn', 'PHƯƠNG ÁN ỨNG PHÓ THIÊN TAI TẠI THÔN 6:\n1. Phòng chống sạt lở đất mùa mưa bão (Tháng 7 - Tháng 11):\n- Cảnh giác cao độ tại các khu vực sườn đồi dốc, taluy cao dọc tuyến đường liên thôn. Khi có mưa lớn dầm dề trên 3 ngày, chủ động sơ tán người già và trẻ nhỏ về Nhà sinh hoạt cộng đồng thôn.\n2. Phòng chống hạn hán mùa khô (Tháng 1 - Tháng 4):\n- Nạo vét kênh mương, tích trữ nước hồ đập thủy lợi; áp dụng công nghệ tưới tiết kiệm nước nhỏ giọt/phun mưa cho vườn cà phê, sầu riêng.\n3. Lực lượng xung kích tại chỗ: Đội xung kích PCTT Thôn 6 trực ban 24/24 khi có tin bão áp thấp nhiệt đới.'),

-- 12. DANH BẠ LIÊN HỆ & ĐƯỜNG DÂY NÓNG ĐỊA PHƯƠNG
('01/TB-DBNL', 'Bảng danh bạ điện thoại đường dây nóng các cơ quan, đơn vị hỗ trợ người dân Thôn 6 Xã Di Linh', 'UBND Xã Di Linh & Ban Điều Hành Thôn 6', '2026-02-20', 'Thông tin liên hệ địa phương', 'Còn hiệu lực', 'https://dilinh.lamdong.gov.vn', 'DANH BẠ ĐƯỜNG DÂY NÓNG KHẨN CẤP THÔN 6 XÃ DI LINH:\n1. Khẩn cấp an ninh & Cứu nạn:\n- 📞 Công an Xã Di Linh (Trực ban 24/7): 0263.3870.113 / 113\n- 📞 Trạm Y tế Xã Di Linh (Cấp cứu 24/7): 0263.3870.115 / 115\n- 📞 Đội PCCC & Cứu nạn Huyện Di Linh: 114\n2. Chính quyền & Điều hành thôn:\n- 📞 UBND Xã Di Linh (Bộ phận Một cửa): 0263.3870.222\n- 📞 Trưởng Ban điều hành Thôn 6: 0903.382.277\n3. Tiện ích sinh hoạt:\n- 📞 Điện lực Di Linh (Sửa chữa sự cố điện): 1900.6769\n- 📞 Cấp nước sinh hoạt Di Linh: 0263.3870.333\n4. Hỗ trợ Chuyển đổi số & Công nghệ:\n- 📞 Hotline Tổ Công nghệ số Cộng đồng Thôn 6: 0903.382.277 (Hỗ trợ Zalo/Gọi điện 24/7 miễn phí).');
