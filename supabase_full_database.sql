-- ==============================================================================
-- NỀN TẢNG CHUYỂN ĐỔI SỐ & HỌC TẬP CỘNG ĐỒNG (THÔN 6 XÃ DI LINH)
-- FIX LỖI "INFINITE RECURSION" TRONG RLS POLICY BẰNG SECURITY DEFINER FUNCTION
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

-- Tự động bổ sung cột nếu bảng đã tồn tại từ trước
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone_number TEXT DEFAULT '0903.382.277';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'citizen';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS hamlet_address TEXT DEFAULT 'Thôn 6, Xã Di Linh';

-- ==============================================================================
-- CÁC HÀM BẢO MẬT (SECURITY DEFINER) ĐỂ TRÁNH LỖI VÒNG LẶP VÔ TẬN (INFINITE RECURSION)
-- ==============================================================================
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

-- BẬT RLS CHO PROFILES
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


-- 6. BẢNG OFFICIAL_DOCUMENTS (VĂN BẢN PHÁP QUY & RAG AI)
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
