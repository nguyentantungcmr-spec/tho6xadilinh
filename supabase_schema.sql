-- ==============================================================================
-- NỀN TẢNG CHUYỂN ĐỔI SỐ & HỌC TẬP CỘNG ĐỒNG (THÔN 6 XÃ DI LINH)
-- DATABASE SCHEMA SỬ DỤNG CHO SUPABASE POSTGRESQL
-- ==============================================================================

-- 1. BẢNG PROFILES (LƯU THÔNG TIN NGƯỜI DÙNG & PHÂN QUYỀN 4 ROLES)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone_number TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'citizen' CHECK (role IN ('citizen', 'supporter', 'tech_team', 'admin')),
    hamlet_address TEXT DEFAULT 'Thôn 6, Xã Di Linh',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bật RLS cho profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy đọc profiles: Đã đăng nhập đều xem được profile của nhau (hoặc tự xem của mình)
CREATE POLICY "Mọi người đã đăng nhập có thể xem profiles" 
ON public.profiles FOR SELECT 
USING (auth.role() = 'authenticated');

-- Policy sửa profile: Người dùng tự sửa của mình
CREATE POLICY "Người dùng tự cập nhật profile của mình" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- Policy Admin: Admin có thể update mọi profile (bao gồm thay đổi role)
CREATE POLICY "Admin có toàn quyền quản lý profiles" 
ON public.profiles FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
);

-- TRIGGER TỰ ĐỘNG TẠO PROFILE KHI ĐĂNG KÝ USER MỚI QUA AUTH
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'role', 'citizen')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 2. BẢNG LEARNING_RESOURCES (8 NHÓM TÀI NGUYÊN HỌC TẬP: VIDEO, IMAGE, INFOGRAPHIC, DOCUMENT, AUDIO)
CREATE TABLE IF NOT EXISTS public.learning_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('video', 'image', 'infographic', 'document', 'audio')),
    category TEXT NOT NULL, -- Ví dụ: 'VNeID', 'Zalo', 'An toàn số', 'AI', 'Quét QR', 'Gõ tiếng Việt'
    media_url TEXT NOT NULL, -- Link MP4, Youtube, PDF, JPG, MP3
    thumbnail_url TEXT,
    source_author TEXT, -- Nguồn tài liệu rõ ràng
    view_count INT DEFAULT 0,
    senior_friendly BOOLEAN DEFAULT TRUE, -- Phù hợp cho người cao tuổi
    status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'pending', 'published')),
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.learning_resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Mọi người (kể cả khách) có thể xem tài nguyên đã xuất bản" 
ON public.learning_resources FOR SELECT 
USING (status = 'published');

CREATE POLICY "Tổ công nghệ số và Admin có quyền quản lý tài nguyên học tập" 
ON public.learning_resources FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() AND profiles.role IN ('tech_team', 'admin')
    )
);


-- 3. BẢNG COMMUNITY_ACTIVITIES (BÁO CÁO HOẠT ĐỘNG CỘNG ĐỒNG TỪ NGƯỜI DÂN & NGƯỜI HỖ TRỢ SỐ)
CREATE TABLE IF NOT EXISTS public.community_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    media_urls TEXT[], -- Danh sách ảnh/video
    participants_count INT DEFAULT 1, -- Số người tham gia
    assisted_count INT DEFAULT 0, -- Số người được hỗ trợ
    results_summary TEXT, -- Kết quả đạt được
    author_name TEXT NOT NULL,
    status TEXT DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.community_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Mọi người có thể xem hoạt động đã được duyệt" 
ON public.community_activities FOR SELECT 
USING (status = 'approved' OR auth.uid() = created_by);

CREATE POLICY "Người dùng đã đăng nhập có thể đăng bài hoạt động cộng đồng" 
ON public.community_activities FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Tổ công nghệ số và Admin được duyệt và xóa bài hoạt động" 
ON public.community_activities FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() AND profiles.role IN ('tech_team', 'admin')
    )
);


-- 4. BẢNG LEARNING_MODELS (MÔ HÌNH HỌC TẬP TỪ NGƯỜI DÂN + AI BIÊN TẬP)
CREATE TABLE IF NOT EXISTS public.learning_models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    raw_content TEXT NOT NULL, -- Nội dung thô do người dân nhập
    ai_formatted_content JSONB, -- Nội dung đã được AI biên tập chuẩn 4 bước (Mục tiêu, Chuẩn bị, Thao tác, Kết quả)
    media_urls TEXT[],
    author_name TEXT NOT NULL,
    likes_count INT DEFAULT 0,
    status TEXT DEFAULT 'approved' CHECK (status IN ('draft', 'pending', 'approved')),
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.learning_models ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Mọi người có thể xem mô hình học tập đã được duyệt" 
ON public.learning_models FOR SELECT 
USING (status = 'approved' OR auth.uid() = created_by);

CREATE POLICY "Người dân có thể đăng tải mô hình học tập mới" 
ON public.learning_models FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Tổ công nghệ số và Admin duyệt mô hình học tập" 
ON public.learning_models FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() AND profiles.role IN ('tech_team', 'admin')
    )
);


-- 5. BẢNG OFFICIAL_DOCUMENTS (TÀI LIỆU CHÍNH THỐNG DÙNG LÀM NGUỒN THAM CHIẾU CHO AI RAG)
CREATE TABLE IF NOT EXISTS public.official_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doc_number TEXT NOT NULL, -- Số hiệu văn bản (vd: 12/2024/UBND)
    title TEXT NOT NULL,
    issuing_body TEXT NOT NULL, -- Cơ quan ban hành (vd: UBND Xã Di Linh, Bộ TH&TT)
    issued_date DATE NOT NULL, -- Ngày ban hành
    effect_status TEXT NOT NULL DEFAULT 'Còn hiệu lực' CHECK (effect_status IN ('Còn hiệu lực', 'Hết hiệu lực', 'Đã sửa đổi')),
    source_url TEXT,
    file_url TEXT,
    content_summary TEXT NOT NULL, -- Trích yếu / Nội dung tóm tắt cho AI học
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.official_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Mọi người có thể xem tài liệu chính thống" 
ON public.official_documents FOR SELECT 
USING (TRUE);

CREATE POLICY "Chỉ Admin và Tổ công nghệ số mới được thêm/sửa tài liệu chính thống" 
ON public.official_documents FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() AND profiles.role IN ('tech_team', 'admin')
    )
);


-- 6. CHÈN DỮ LIỆU BAN ĐẦU (INITIAL REAL SEED DATA)

-- Tài nguyên học tập mẫu thực tế
INSERT INTO public.learning_resources (title, description, type, category, media_url, source_author, senior_friendly, status) VALUES
('Hướng dẫn 4 bước quét mã QR thanh toán & Dịch vụ công', 'Thao tác cầm tay chỉ việc chi tiết từng bước mở camera hoặc ứng dụng Zalo để quét QR an toàn.', 'infographic', 'Quét QR', 'https://images.unsplash.com/photo-1595079672139-cee4c06cdc92?auto=format&fit=crop&w=1000&q=80', 'Tổ Công nghệ số cộng đồng Thôn 6', true, 'published'),

('Video Hướng dẫn cài đặt và đăng nhập VNeID Mức 2', 'Video trực quan từng bước kích hoạt tài khoản định danh điện tử VNeID trên điện thoại.', 'video', 'VNeID', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'Bộ Công An - Cục C06', true, 'published'),

('5 Dấu hiệu nhận biết lừa đảo qua cuộc gọi & tin nhắn', 'Tài liệu infographic trực quan giúp người cao tuổi phòng tránh bị chiếm đoạt tài khoản ngân hàng.', 'infographic', 'An toàn số', 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1000&q=80', 'Cục An toàn thông tin - Bộ TT&TT', true, 'published'),

('Hướng dẫn gõ Tiếng Việt có dấu trên điện thoại Android & iPhone', 'Hình ảnh chụp màn hình từng nút bấm bật bàn phím Telex đơn giản nhất.', 'image', 'Gõ tiếng Việt', 'https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?auto=format&fit=crop&w=1000&q=80', 'Hội Người cao tuổi Xã Di Linh', true, 'published'),

('Podcast 2 phút: Cảnh báo chiêu trò giả danh Công an yêu cầu cập nhật VNeID', 'Bản thu âm ngắn truyền thanh cho người dân không tiện đọc chữ, phân tích thủ đoạn lừa đảo.', 'audio', 'An toàn số', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', 'Đài Truyền thanh Xã Di Linh', true, 'published'),

('Cẩm nang Phổ cập Kỹ năng số Cộng đồng 2026', 'Tài liệu cẩm nang tổng hợp các kỹ năng số thiết yếu dành cho người dân nông thôn.', 'document', 'Phổ cập tin học', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'UBND Xã Di Linh', true, 'published');

-- Hoạt động cộng đồng mẫu thực tế
INSERT INTO public.community_activities (title, description, media_urls, participants_count, assisted_count, results_summary, author_name, status) VALUES
('Nhóm Thanh niên hỗ trợ 15 người cao tuổi cài đặt Zalo & VNeID', 'Sáng thứ 7 tại Nhà văn hóa Thôn 6, Đội thanh niên xung kích đã trực tiếp cầm tay chỉ việc cho các bác trong thôn.', ARRAY['https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1000&q=80'], 6, 15, '100% các bác đã biết tự gọi video cho con cháu và quét mã BHYT.', 'Nguyễn Văn Nam (Đoàn Thanh Niên)', 'approved'),

('Buổi tập huấn nhận diện lừa đảo không gian mạng cho Hội Phụ Nữ', 'Tổ CNS cộng đồng phối hợp cùng Công an xã hướng dẫn bà con cách tạo mật khẩu mạnh và không nhấp vào liên kết lạ.', ARRAY['https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1000&q=80'], 12, 40, 'Bà con nắm rõ 5 nguyên tắc an toàn khi nghe điện thoại số lạ.', 'Trần Thị Hoa (Chi hội Phụ nữ Thôn 6)', 'approved');

-- Mô hình học tập mẫu từ người dân
INSERT INTO public.learning_models (title, raw_content, ai_formatted_content, media_urls, author_name, status) VALUES
('Mô hình "Mỗi gia đình một người hỗ trợ số"', 'Tôi dạy cho đứa cháu ngoại 12 tuổi cách tra cứu thông tin tiền điện và quét mã QR. Sau đó cháu hướng dẫn lại cho 2 vợ chồng tôi mỗi tối 15 phút.', 
'{"target": "Giúp người cao tuổi học kỹ năng số thông qua con cháu trong nhà", "preparation": "1 điện thoại thông minh có kết nối Wifi/4G, tạo không khí học thoải mái mỗi tối", "steps": ["Bước 1: Cháu nhỏ đóng vai thầy giáo hướng dẫn 1 thao tác duy nhất (ví dụ mở ứng dụng Zalo)", "Bước 2: Ông bà thực hành lại 3 lần ngay tại chỗ", "Bước 3: Ghi chép lại nút bấm chính vào sổ tay chữ to"], "result": "Gia đình gắn kết hơn, người lớn tuổi tiếp thu tự nhiên không bị áp lực"}',
ARRAY['https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1000&q=80'], 'Bác Lê Văn Đức (68 tuổi, Thôn 6)', 'approved');

-- Tài liệu chính thống mẫu làm tham chiếu cho AI RAG
INSERT INTO public.official_documents (doc_number, title, issuing_body, issued_date, effect_status, source_url, content_summary) VALUES
('06/NQ-CP', 'Đề án phát triển ứng dụng dữ liệu về dân cư, định danh và xác thực điện tử (Đề án 06)', 'Thủ tướng Chính phủ', '2022-01-06', 'Còn hiệu lực', 'https://vanban.chinhphu.vn', 'Quy định về việc sử dụng tài khoản VNeID thay thế cho CMND/CCCD giấy trong các thủ tục hành chính, bảo hiểm y tế và dịch vụ công trực tuyến toàn quốc.'),

('15/UBND-VX', 'Kế hoạch triển khai Phong trào Chuyển đổi số cộng đồng Thôn 6 năm 2026', 'UBND Xã Di Linh', '2026-01-15', 'Còn hiệu lực', 'https://dilinh.lamdong.gov.vn', 'Mục tiêu 100% hộ gia đình Thôn 6 có ít nhất 1 người thành thạo dịch vụ công trực tuyến, quét mã QR thanh toán không dùng tiền mặt và cài đặt ứng dụng cảnh báo lừa đảo.');
