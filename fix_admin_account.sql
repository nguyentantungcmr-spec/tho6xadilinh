-- ==============================================================================
-- KÍCH HOẠT VÀ NÂNG TÀI KHOẢN TANTUNG08@GMAIL.COM LÊN QUẢN TRỊ VIÊN (ADMIN)
-- ==============================================================================

-- 1. Kích hoạt Email trực tiếp trong auth.users (Không cần bấm xác nhận Email)
UPDATE auth.users
SET email_confirmed_at = NOW(),
    updated_at = NOW()
WHERE email = 'tantung08@gmail.com';

-- 2. Đảm bảo vai trò trong bảng public.profiles là 'admin'
INSERT INTO public.profiles (id, email, full_name, role)
SELECT 
    id, 
    email, 
    COALESCE(raw_user_meta_data->>'full_name', 'Quản trị viên Di Linh'), 
    'admin'
FROM auth.users
WHERE email = 'tantung08@gmail.com'
ON CONFLICT (id) 
DO UPDATE SET role = 'admin', updated_at = NOW();

-- 3. Kiểm tra kết quả
SELECT id, email, role, created_at FROM public.profiles WHERE email = 'tantung08@gmail.com';
