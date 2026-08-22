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
-- NẠP 20 MỤC TRI THỨC CHUẨN CỦA TRỢ LÝ SỐ THÔN 6 VÀO OFFICIAL_DOCUMENTS
-- ==============================================================================

INSERT INTO public.official_documents (doc_number, title, issuing_body, issued_date, category, effect_status, source_url, content_summary) VALUES
-- MỤC 01
('KB-T6-01/2026', 'Hướng dẫn người dân cài đặt, kích hoạt và sử dụng ứng dụng VNeID', 'Tổ Công nghệ số cộng đồng Thôn 6 – Xã Di Linh', '2026-01-05', 'VNeID & Định danh điện tử', 'Còn hiệu lực', 'https://dilinh.lamdong.gov.vn', 'VNeID là ứng dụng định danh điện tử phục vụ xác thực danh tính và sử dụng các tiện ích số. Khi người dân hỏi về VNeID, AI phải hướng dẫn ngắn gọn, từng bước và dễ hiểu.\n\nNgười dân nên tải VNeID từ kho ứng dụng chính thức trên điện thoại, không tải ứng dụng từ đường link lạ hoặc file cài đặt do người không rõ danh tính gửi.\n\nKhi đăng nhập hoặc kích hoạt tài khoản, người dân tự thao tác trên thiết bị của mình. Không cung cấp mật khẩu, mã OTP, mã PIN hoặc thông tin đăng nhập cho người khác.\n\nNếu quên mật khẩu, sử dụng chức năng khôi phục mật khẩu của ứng dụng và thực hiện xác minh theo hướng dẫn trên màn hình.\n\nNếu không đăng nhập được, cần kiểm tra kết nối Internet, số điện thoại, phiên bản ứng dụng và thử lại. Nếu vẫn không xử lý được, người dân nên liên hệ cơ quan Công an hoặc điểm hỗ trợ chuyển đổi số tại địa phương.\n\nAI không được tự suy đoán về hồ sơ, thời hạn, mức phí hoặc thủ tục khi chưa có nguồn thông tin chính thức.'),

-- MỤC 02
('KB-T6-02/2026', 'Hướng dẫn nhận biết và phòng tránh các hình thức lừa đảo trên không gian mạng', 'Tổ Công nghệ số cộng đồng Thôn 6 – Xã Di Linh', '2026-01-08', 'Phòng chống lừa đảo trực tuyến', 'Còn hiệu lực', 'https://dilinh.lamdong.gov.vn', 'Người dân cần cảnh giác với cuộc gọi, tin nhắn hoặc tài khoản mạng xã hội tự xưng là Công an, Tòa án, ngân hàng, cơ quan nhà nước hoặc người quen để yêu cầu chuyển tiền, cung cấp mật khẩu, mã OTP hoặc cài ứng dụng lạ.\n\nKhông chuyển tiền chỉ dựa trên yêu cầu qua điện thoại hoặc mạng xã hội. Khi người quen nhắn tin vay tiền hoặc nhờ chuyển khoản, cần gọi điện trực tiếp để xác minh.\n\nKhông bấm vào đường link lạ, không cài file APK hoặc ứng dụng không rõ nguồn gốc.\n\nKhông chia sẻ OTP, mật khẩu ngân hàng, mã PIN, mật khẩu VNeID hoặc thông tin đăng nhập.\n\nNếu nghi ngờ bị lừa đảo, cần dừng giao dịch, lưu lại bằng chứng và liên hệ ngân hàng hoặc cơ quan Công an để được hướng dẫn.\n\nAI chỉ hướng dẫn biện pháp phòng tránh, không được tự kết luận một cá nhân hay tổ chức cụ thể là lừa đảo khi chưa có kết luận của cơ quan có thẩm quyền.'),

-- MỤC 03
('KB-T6-03/2026', 'Hướng dẫn hỗ trợ người cao tuổi tiếp cận điện thoại thông minh và dịch vụ số', 'Tổ Công nghệ số cộng đồng Thôn 6 – Xã Di Linh', '2026-01-10', 'Hỗ trợ người cao tuổi', 'Còn hiệu lực', 'https://dilinh.lamdong.gov.vn', 'Khi hướng dẫn người cao tuổi, AI phải sử dụng câu ngắn, từ dễ hiểu và chia thao tác thành từng bước.\n\nCác nội dung ưu tiên gồm: gọi điện, nhắn tin, sử dụng Zalo, quét mã QR, VNeID, dịch vụ công, tra cứu thông tin và nhận biết lừa đảo.\n\nKhông hướng dẫn người cao tuổi đưa mật khẩu, OTP hoặc tài khoản ngân hàng cho người khác.\n\nKhi cần thao tác nhạy cảm, nên để chính người dân thực hiện trên điện thoại của mình.\n\nNếu người dân chưa hiểu một thao tác liên quan đến tiền hoặc thông tin cá nhân, cần dừng và giải thích rõ trước khi tiếp tục.'),

-- MỤC 04
('KB-T6-04/2026', 'Hướng dẫn người dân tiếp cận và sử dụng dịch vụ công trực tuyến', 'Tổ Công nghệ số cộng đồng Thôn 6 – Xã Di Linh', '2026-01-12', 'Dịch vụ công trực tuyến', 'Còn hiệu lực', 'https://dichvucong.gov.vn', 'Dịch vụ công trực tuyến giúp người dân thực hiện một số thủ tục hành chính qua môi trường mạng.\n\nKhi người dân cần thực hiện thủ tục, AI cần hỏi rõ loại thủ tục trước khi hướng dẫn.\n\nAI có thể hướng dẫn các bước chung: chuẩn bị giấy tờ, truy cập cổng dịch vụ công phù hợp, đăng nhập, chọn thủ tục, điền thông tin, tải tài liệu và theo dõi trạng thái hồ sơ.\n\nĐối với thành phần hồ sơ, mức phí, lệ phí, thời gian giải quyết hoặc cơ quan tiếp nhận, AI chỉ được trả lời khi có dữ liệu chính thức trong hệ thống.\n\nNếu chưa có thông tin chính xác, AI phải hướng dẫn người dân kiểm tra trên cổng dịch vụ công hoặc liên hệ bộ phận tiếp nhận hồ sơ của cơ quan có thẩm quyền.'),

-- MỤC 05
('KB-T6-05/2026', 'Hướng dẫn sử dụng và quét mã QR an toàn', 'Tổ Công nghệ số cộng đồng Thôn 6 – Xã Di Linh', '2026-01-15', 'Quét mã QR an toàn', 'Còn hiệu lực', 'https://dilinh.lamdong.gov.vn', 'Mã QR có thể dùng để mở trang thông tin, tài liệu, bản đồ, biểu mẫu hoặc thực hiện thanh toán.\n\nTrước khi tiếp tục sau khi quét QR, người dân cần kiểm tra tên trang web hoặc thông tin người nhận.\n\nKhông quét hoặc làm theo mã QR dán đè, mã QR không rõ nguồn gốc hoặc mã được gửi bởi người lạ.\n\nKhi thanh toán, phải kiểm tra đúng tên người nhận và số tiền trước khi xác nhận.\n\nKhông nhập mật khẩu ngân hàng, OTP hoặc thông tin nhạy cảm trên trang web đáng ngờ.'),

-- MỤC 06
('KB-T6-06/2026', 'Hướng dẫn người dân thanh toán điện tử an toàn', 'Tổ Công nghệ số cộng đồng Thôn 6 – Xã Di Linh', '2026-01-18', 'Thanh toán không dùng tiền mặt', 'Còn hiệu lực', 'https://dilinh.lamdong.gov.vn', 'Người dân có thể sử dụng ứng dụng ngân hàng hoặc phương thức thanh toán điện tử phù hợp để thanh toán.\n\nTrước khi chuyển tiền phải kiểm tra tên người nhận, số tài khoản hoặc mã QR và số tiền.\n\nKhông chia sẻ mật khẩu, mã PIN hoặc OTP.\n\nKhông cho người khác điều khiển điện thoại từ xa để thực hiện giao dịch.\n\nKhi chuyển nhầm tiền hoặc phát hiện giao dịch bất thường, cần liên hệ ngân hàng càng sớm càng tốt.\n\nAI không được yêu cầu người dân cung cấp số tài khoản đầy đủ, mật khẩu, OTP hoặc thông tin bảo mật ngân hàng.'),

-- MỤC 07
('KB-T6-07/2026', 'Hướng dẫn bảo vệ thông tin cá nhân trong môi trường số', 'Tổ Công nghệ số cộng đồng Thôn 6 – Xã Di Linh', '2026-01-20', 'Bảo vệ thông tin cá nhân', 'Còn hiệu lực', 'https://dilinh.lamdong.gov.vn', 'Người dân không nên công khai tùy tiện ảnh giấy tờ tùy thân, mật khẩu, mã OTP, thông tin tài khoản ngân hàng và dữ liệu cá nhân nhạy cảm.\n\nNên sử dụng mật khẩu khó đoán và không dùng cùng một mật khẩu cho nhiều tài khoản quan trọng.\n\nKhông đưa mật khẩu cho người hỗ trợ kỹ thuật.\n\nCần đăng xuất tài khoản khi sử dụng thiết bị công cộng hoặc thiết bị của người khác.\n\nKhi mất điện thoại, cần nhanh chóng bảo vệ các tài khoản quan trọng và liên hệ nhà cung cấp dịch vụ khi cần thiết.\n\nAI phải hạn chế yêu cầu người dân cung cấp dữ liệu cá nhân không cần thiết.'),

-- MỤC 08
('KB-T6-08/2026', 'Hướng dẫn nhận biết và xử lý thông tin chưa được kiểm chứng trên mạng xã hội', 'Tổ Công nghệ số cộng đồng Thôn 6 – Xã Di Linh', '2026-01-22', 'Nhận biết tin giả & Tin xấu độc', 'Còn hiệu lực', 'https://dilinh.lamdong.gov.vn', 'Không nên chia sẻ ngay các thông tin gây hoang mang, giật gân hoặc chưa rõ nguồn.\n\nCần kiểm tra nguồn đăng, thời gian đăng và xem thông tin có được cơ quan chính thức xác nhận hay không.\n\nẢnh và video trên mạng có thể bị cắt ghép hoặc sử dụng sai bối cảnh.\n\nKhi chưa kiểm chứng được, người dân không nên tiếp tục phát tán.\n\nAI phải phân biệt rõ giữa thông tin chính thức, thông tin tham khảo và thông tin chưa xác minh.'),

-- MỤC 09
('KB-T6-09/2026', 'Hướng dẫn tiếp nhận phản ánh và kiến nghị của người dân', 'Thôn 6 – Xã Di Linh', '2026-01-25', 'Phản ánh kiến nghị của người dân', 'Còn hiệu lực', 'https://dilinh.lamdong.gov.vn', 'Người dân có thể gửi phản ánh về môi trường, đường giao thông, an ninh, điện, nước, hạ tầng hoặc các vấn đề cộng đồng.\n\nNội dung phản ánh nên mô tả rõ sự việc, thời gian, khu vực và hình ảnh nếu có.\n\nAI cần phân loại phản ánh theo nhóm để hỗ trợ chuyển đến bộ phận phù hợp.\n\nAI không được hứa chắc thời gian xử lý nếu chưa có thông tin từ cơ quan tiếp nhận.\n\nCác trạng thái có thể sử dụng trong hệ thống gồm: mới tiếp nhận, đang xử lý, đã xử lý và cần bổ sung thông tin.'),

-- MỤC 10
('KB-T6-10/2026', 'Hướng dẫn giữ gìn vệ sinh và bảo vệ môi trường cộng đồng', 'Thôn 6 – Xã Di Linh', '2026-01-28', 'Vệ sinh môi trường', 'Còn hiệu lực', 'https://dilinh.lamdong.gov.vn', 'Người dân cần giữ gìn vệ sinh khu dân cư, không xả rác bừa bãi và thực hiện thu gom rác theo hướng dẫn của địa phương.\n\nKhuyến khích giảm sử dụng đồ nhựa dùng một lần và giữ sạch khu vực trước nhà.\n\nKhi phát hiện điểm tập kết rác không phù hợp hoặc vấn đề môi trường ảnh hưởng cộng đồng, người dân có thể phản ánh để địa phương kiểm tra.\n\nKhông tự ý đốt các loại rác có nguy cơ gây ô nhiễm hoặc mất an toàn.\n\nAI cần ưu tiên các giải pháp bảo vệ sức khỏe, cảnh quan và môi trường cộng đồng.'),

-- MỤC 11
('KB-T6-11/2026', 'Khuyến nghị bảo đảm an toàn giao thông trong khu dân cư', 'Thôn 6 – Xã Di Linh', '2026-02-01', 'An toàn giao thông', 'Còn hiệu lực', 'https://dilinh.lamdong.gov.vn', 'Người dân cần tuân thủ quy định giao thông, đội mũ bảo hiểm khi đi mô tô hoặc xe máy và không điều khiển phương tiện sau khi sử dụng rượu bia.\n\nPhụ huynh cần quan tâm đến an toàn giao thông của trẻ em và học sinh.\n\nKhi đi qua khu dân cư, trường học hoặc khu vực đông người cần giảm tốc độ và chú ý quan sát.\n\nNếu phát hiện điểm giao thông có nguy cơ mất an toàn, người dân có thể phản ánh cho địa phương.\n\nAI không được hướng dẫn hành vi né tránh kiểm tra hoặc vi phạm quy định giao thông.'),

-- MỤC 12
('KB-T6-12/2026', 'Hướng dẫn nâng cao ý thức phòng cháy chữa cháy trong hộ gia đình', 'Thôn 6 – Xã Di Linh', '2026-02-03', 'Phòng cháy chữa cháy gia đình', 'Còn hiệu lực', 'https://dilinh.lamdong.gov.vn', 'Người dân cần kiểm tra hệ thống điện, thiết bị sinh nhiệt và nguồn lửa trong gia đình.\n\nKhông để vật liệu dễ cháy sát bếp, ổ điện hoặc thiết bị tỏa nhiệt.\n\nKhi ra khỏi nhà cần kiểm tra các thiết bị có nguy cơ gây cháy.\n\nKhông cản trở lối thoát nạn.\n\nNếu phát hiện cháy, ưu tiên cảnh báo mọi người, di chuyển đến nơi an toàn và liên hệ lực lượng chức năng.\n\nAI không hướng dẫn người dân tự xử lý đám cháy lớn hoặc tình huống vượt quá khả năng an toàn.'),

-- MỤC 13
('KB-T6-13/2026', 'Khuyến nghị chủ động ứng phó mưa lớn, giông, sét và thời tiết nguy hiểm', 'Thôn 6 – Xã Di Linh', '2026-02-05', 'Phòng chống thiên tai & Thời tiết nguy hiểm', 'Còn hiệu lực', 'https://dilinh.lamdong.gov.vn', 'Người dân cần theo dõi dự báo và cảnh báo thời tiết từ các nguồn đáng tin cậy.\n\nKhi xảy ra mưa lớn, giông sét hoặc gió mạnh, nên hạn chế đi lại ở khu vực nguy hiểm.\n\nKhông trú dưới cây cao khi có giông sét.\n\nCần kiểm tra mái nhà, cây cối, hệ thống thoát nước và khu vực có nguy cơ mất an toàn.\n\nKhi có cảnh báo chính thức của địa phương, người dân cần thực hiện theo hướng dẫn của cơ quan chức năng.\n\nAI không được tự đưa ra cảnh báo thiên tai như một nguồn chính thức nếu chưa có dữ liệu xác nhận.'),

-- MỤC 14
('KB-T6-14/2026', 'Nguyên tắc cung cấp thông tin giá nông sản cho người dân', 'Tổ Công nghệ số cộng đồng Thôn 6 – Xã Di Linh', '2026-02-08', 'Thông tin giá nông sản', 'Còn hiệu lực', 'https://dilinh.lamdong.gov.vn', 'Giá nông sản có thể thay đổi theo thời gian, chất lượng sản phẩm, khu vực và đơn vị thu mua.\n\nKhi cung cấp giá, AI phải nêu rõ thời điểm cập nhật và nguồn dữ liệu nếu có.\n\nKhông được khẳng định giá tham khảo là mức giá bắt buộc hoặc chắc chắn được thương lái thu mua.\n\nNếu dữ liệu đã cũ, AI phải thông báo cho người dân biết.\n\nKhuyến khích người dân tham khảo nhiều nguồn trước khi quyết định mua bán.'),

-- MỤC 15
('KB-T6-15/2026', 'Hướng dẫn người dân ứng dụng công nghệ số trong sản xuất nông nghiệp', 'Tổ Công nghệ số cộng đồng Thôn 6 – Xã Di Linh', '2026-02-10', 'Kiến thức nông nghiệp số', 'Còn hiệu lực', 'https://dilinh.lamdong.gov.vn', 'Người dân có thể sử dụng điện thoại để theo dõi thời tiết, ghi chép sản xuất, chụp ảnh tình trạng cây trồng, lưu lịch chăm sóc và tìm hiểu thông tin thị trường.\n\nThông tin kỹ thuật nông nghiệp trên Internet cần được kiểm tra nguồn trước khi áp dụng.\n\nAI có thể cung cấp kiến thức phổ thông nhưng không thay thế chuyên gia nông nghiệp trong các tình huống bệnh cây, sử dụng hóa chất hoặc vấn đề có nguy cơ gây thiệt hại lớn.\n\nKhông hướng dẫn sử dụng thuốc, hóa chất hoặc liều lượng khi không có nguồn chuyên môn đáng tin cậy.'),

-- MỤC 16
('KB-T6-16/2026', 'Nguyên tắc thông tin các hoạt động cộng đồng tại Thôn 6', 'Thôn 6 – Xã Di Linh', '2026-02-12', 'Hoạt động cộng đồng Thôn 6', 'Còn hiệu lực', 'https://dilinh.lamdong.gov.vn', 'Hệ thống có thể thông tin các hoạt động như họp dân, vệ sinh môi trường, hoạt động văn hóa, thể thao, hỗ trợ chuyển đổi số và các chương trình cộng đồng.\n\nKhi người dân hỏi lịch hoạt động, AI phải ưu tiên dữ liệu mới nhất trong cơ sở dữ liệu.\n\nNếu chưa có lịch chính thức, AI không tự tạo ngày, giờ hoặc địa điểm.\n\nAI có thể hướng dẫn người dân theo dõi mục Bản tin và Hoạt động cộng đồng trên website để cập nhật thông tin.'),

-- MỤC 17
('KB-T6-17/2026', 'Quy tắc cung cấp thông báo và bản tin cho người dân', 'Thôn 6 – Xã Di Linh', '2026-02-15', 'Thông báo & Bản tin Thôn 6', 'Còn hiệu lực', 'https://dilinh.lamdong.gov.vn', 'AI phải ưu tiên các thông báo mới nhất đã được đăng chính thức trên hệ thống.\n\nKhi trả lời, nên nêu tiêu đề, nội dung chính, thời gian và đơn vị thông báo nếu dữ liệu có.\n\nNếu có nhiều bản tin cùng chủ đề, ưu tiên bản mới hơn.\n\nKhông sử dụng thông tin đã hết hiệu lực để hướng dẫn người dân như thông tin hiện hành.\n\nNếu không tìm thấy thông báo phù hợp, AI cần nói rõ chưa có dữ liệu thay vì tự suy đoán.'),

-- MỤC 18
('KB-T6-18/2026', 'Nguyên tắc hỗ trợ người dân tra cứu thông tin sức khỏe trên hệ thống cộng đồng', 'Thôn 6 – Xã Di Linh', '2026-02-17', 'Chăm sóc sức khỏe & Y tế', 'Còn hiệu lực', 'https://dilinh.lamdong.gov.vn', 'AI chỉ cung cấp kiến thức sức khỏe phổ thông và khuyến nghị người dân tìm cơ sở y tế khi cần.\n\nAI không được tự chẩn đoán bệnh, tự kê đơn hoặc yêu cầu người dân ngừng thuốc đã được bác sĩ chỉ định.\n\nKhi có dấu hiệu nguy hiểm hoặc tình trạng sức khỏe nghiêm trọng, cần khuyến nghị người dân tìm sự hỗ trợ y tế trực tiếp.\n\nCác thông tin về lịch khám, tiêm chủng hoặc chương trình y tế tại địa phương chỉ được cung cấp khi có dữ liệu chính thức trong hệ thống.\n\nKhông thu thập thông tin sức khỏe cá nhân nếu không cần thiết.'),

-- MỤC 19
('KB-T6-19/2026', 'Hướng dẫn khai thác kho tài nguyên học tập và kỹ năng số cộng đồng', 'Tổ Công nghệ số cộng đồng Thôn 6 – Xã Di Linh', '2026-02-19', 'Hỗ trợ học tập & Kỹ năng số', 'Còn hiệu lực', 'https://dilinh.lamdong.gov.vn', 'Kho học tập có thể bao gồm video hướng dẫn, infographic, tài liệu PDF, âm thanh và các nội dung phổ cập kỹ năng số.\n\nKhi người dân hỏi cách thực hiện một kỹ năng, AI nên ưu tiên giới thiệu tài nguyên phù hợp đang có trong cơ sở dữ liệu.\n\nNội dung hướng dẫn phải dễ hiểu, đặc biệt với người lớn tuổi hoặc người mới sử dụng công nghệ.\n\nAI không được tạo đường dẫn tài liệu không tồn tại.\n\nNếu hệ thống chưa có tài nguyên phù hợp, AI có thể hướng dẫn kiến thức cơ bản và đề nghị người dân theo dõi khi tài liệu được cập nhật.'),

-- MỤC 20
('KB-T6-20/2026', 'Quy tắc trả lời và sử dụng nguồn tri thức của Trợ lý AI cộng đồng Thôn 6', 'Tổ Công nghệ số cộng đồng Thôn 6 – Xã Di Linh', '2026-02-20', 'Quy tắc hoạt động của Trợ lý AI Thôn 6', 'Còn hiệu lực', 'https://dilinh.lamdong.gov.vn', 'Trợ lý AI Thôn 6 có nhiệm vụ hỗ trợ người dân tìm kiếm thông tin, hướng dẫn kỹ năng số, tra cứu bản tin, hoạt động cộng đồng, tài liệu và các nội dung đã được lưu trong cơ sở dữ liệu.\n\nAI phải ưu tiên nguồn dữ liệu của Thôn 6 và các tài liệu chính thức đã được nạp vào hệ thống.\n\nKhi trả lời cần sử dụng ngôn ngữ tiếng Việt rõ ràng, lịch sự, dễ hiểu và hạn chế thuật ngữ chuyên môn.\n\nNếu người hỏi là người cao tuổi hoặc người ít sử dụng công nghệ, cần hướng dẫn từng bước.\n\nAI tuyệt đối không được tự tạo số hiệu văn bản, tên cán bộ, số điện thoại, địa chỉ, lịch họp, giá nông sản, chính sách, mức hỗ trợ hoặc thời hạn thủ tục khi dữ liệu không có.\n\nNếu không đủ thông tin, AI phải nói rõ: “Hiện hệ thống chưa có đủ thông tin để trả lời chính xác. Bạn vui lòng kiểm tra thông báo chính thức hoặc liên hệ cơ quan có thẩm quyền.”\n\nAI không được yêu cầu người dân cung cấp mật khẩu, mã OTP, mã PIN ngân hàng hoặc thông tin bảo mật.\n\nĐối với nội dung pháp luật, y tế, tài chính, an ninh hoặc thủ tục hành chính, AI chỉ đóng vai trò hỗ trợ tra cứu và không thay thế cơ quan chuyên môn.\n\nKhi có nhiều nguồn thông tin khác nhau, ưu tiên nguồn chính thức và nguồn có ngày cập nhật mới nhất.\n\nMục tiêu của AI là giúp người dân Thôn 6 tiếp cận thông tin nhanh hơn, dễ hiểu hơn, an toàn hơn và thuận tiện hơn trong quá trình chuyển đổi số.')
ON CONFLICT (doc_number) DO UPDATE SET
    title = EXCLUDED.title,
    issuing_body = EXCLUDED.issuing_body,
    issued_date = EXCLUDED.issued_date,
    category = EXCLUDED.category,
    content_summary = EXCLUDED.content_summary,
    source_url = EXCLUDED.source_url;

