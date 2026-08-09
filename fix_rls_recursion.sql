-- ==============================================================================
-- SỬA LỖI INFINITE RECURSION DETECTED IN POLICY FOR RELATION "PROFILES"
-- SỬ DỤNG SECURITY DEFINER FUNCTION KHÔNG BỊ ĐỆ QUY RLS
-- ==============================================================================

-- 1. TẠO HÀM KIỂM TRA ROLE KHÔNG BỊ ĐỆ QUY (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT AS $$
DECLARE
    user_role TEXT;
BEGIN
    IF auth.uid() IS NULL THEN
        RETURN 'anon';
    END IF;
    
    SELECT role INTO user_role FROM public.profiles WHERE id = auth.uid();
    RETURN COALESCE(user_role, 'citizen');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


-- 2. SỬA RLS POLICY BẢNG PROFILES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Mọi người đã đăng nhập có thể xem profiles" ON public.profiles;
DROP POLICY IF EXISTS "Người dùng tự cập nhật profile của mình" ON public.profiles;
DROP POLICY IF EXISTS "Admin có toàn quyền quản lý profiles" ON public.profiles;
DROP POLICY IF EXISTS "Mọi người có thể xem profiles" ON public.profiles;
DROP POLICY IF EXISTS "Người dùng tự sửa profile hoặc Admin sửa" ON public.profiles;

-- Policy đọc profiles: Cho phép xem công khai (Select public)
CREATE POLICY "Mọi người có thể xem profiles" 
ON public.profiles FOR SELECT 
USING (TRUE);

-- Policy thêm mới profile: Cho phép người dùng hoặc trigger tạo mới
CREATE POLICY "Cho phép tạo mới profile" 
ON public.profiles FOR INSERT 
WITH CHECK (TRUE);

-- Policy sửa profile: Người dùng tự sửa của mình hoặc Admin
CREATE POLICY "Người dùng tự sửa profile của mình" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id OR public.get_my_role() = 'admin');

-- Policy xóa profile: Chỉ Admin
CREATE POLICY "Admin có quyền quản lý toàn bộ profiles" 
ON public.profiles FOR ALL 
USING (public.get_my_role() = 'admin');


-- 3. SỬA RLS POLICY CHO BẢNG LEARNING_RESOURCES
ALTER TABLE public.learning_resources ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Mọi người (kể cả khách) có thể xem tài nguyên đã xuất bản" ON public.learning_resources;
DROP POLICY IF EXISTS "Tổ công nghệ số và Admin có quyền quản lý tài nguyên học tập" ON public.learning_resources;
DROP POLICY IF EXISTS "Mọi người có thể xem tài nguyên đã xuất bản" ON public.learning_resources;
DROP POLICY IF EXISTS "Tổ CNS và Admin quản lý tài nguyên" ON public.learning_resources;

CREATE POLICY "Mọi người có thể xem tài nguyên học tập" 
ON public.learning_resources FOR SELECT 
USING (status = 'published' OR public.get_my_role() IN ('tech_team', 'admin'));

CREATE POLICY "Tổ CNS và Admin quản lý tài nguyên" 
ON public.learning_resources FOR ALL 
USING (public.get_my_role() IN ('tech_team', 'admin'));


-- 4. SỬA RLS POLICY CHO BẢNG COMMUNITY_ACTIVITIES
ALTER TABLE public.community_activities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Mọi người có thể xem hoạt động đã được duyệt" ON public.community_activities;
DROP POLICY IF EXISTS "Người dùng đã đăng nhập có thể đăng bài hoạt động cộng đồng" ON public.community_activities;
DROP POLICY IF EXISTS "Tổ công nghệ số và Admin được duyệt và xóa bài hoạt động" ON public.community_activities;
DROP POLICY IF EXISTS "Xem hoạt động cộng đồng đã duyệt" ON public.community_activities;
DROP POLICY IF EXISTS "Đăng bài hoạt động cộng đồng" ON public.community_activities;
DROP POLICY IF EXISTS "Duyệt hoạt động cộng đồng" ON public.community_activities;

CREATE POLICY "Mọi người xem hoạt động cộng đồng" 
ON public.community_activities FOR SELECT 
USING (TRUE);

CREATE POLICY "Cho phép đăng bài hoạt động cộng đồng" 
ON public.community_activities FOR INSERT 
WITH CHECK (TRUE);

CREATE POLICY "Tổ CNS và Admin duyệt bài hoạt động" 
ON public.community_activities FOR ALL 
USING (public.get_my_role() IN ('tech_team', 'admin'));


-- 5. SỬA RLS POLICY CHO BẢNG LEARNING_MODELS
ALTER TABLE public.learning_models ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Mọi người có thể xem mô hình học tập đã được duyệt" ON public.learning_models;
DROP POLICY IF EXISTS "Người dân có thể đăng tải mô hình học tập mới" ON public.learning_models;
DROP POLICY IF EXISTS "Tổ công nghệ số và Admin duyệt mô hình học tập" ON public.learning_models;
DROP POLICY IF EXISTS "Xem mô hình học tập" ON public.learning_models;
DROP POLICY IF EXISTS "Đăng mô hình học tập" ON public.learning_models;
DROP POLICY IF EXISTS "Duyệt mô hình" ON public.learning_models;

CREATE POLICY "Mọi người xem mô hình học tập" 
ON public.learning_models FOR SELECT 
USING (TRUE);

CREATE POLICY "Cho phép đăng mô hình học tập" 
ON public.learning_models FOR INSERT 
WITH CHECK (TRUE);

CREATE POLICY "Tổ CNS và Admin duyệt mô hình" 
ON public.learning_models FOR ALL 
USING (public.get_my_role() IN ('tech_team', 'admin'));


-- 6. SỬA RLS POLICY CHO BẢNG OFFICIAL_DOCUMENTS
ALTER TABLE public.official_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Mọi người có thể xem tài liệu chính thống" ON public.official_documents;
DROP POLICY IF EXISTS "Chỉ Admin và Tổ công nghệ số mới được thêm/sửa tài liệu chính thống" ON public.official_documents;
DROP POLICY IF EXISTS "Xem tài liệu chính thống" ON public.official_documents;
DROP POLICY IF EXISTS "Admin thêm tài liệu chính thống" ON public.official_documents;

CREATE POLICY "Mọi người xem văn bản chính thống" 
ON public.official_documents FOR SELECT 
USING (TRUE);

CREATE POLICY "Tổ CNS và Admin quản lý văn bản chính thống" 
ON public.official_documents FOR ALL 
USING (public.get_my_role() IN ('tech_team', 'admin'));
