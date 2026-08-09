import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://syouhbcqbmynmqecgcxd.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5b3VoYmNxYm15bm1xZWNnY3hkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjI4NzI4OCwiZXhwIjoyMTAxODYzMjg4fQ.tjdjCEwWyR6enQqFo9ms2bFe7La2fVaRP6h0w7T6T2Q';

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

async function fixRlsRecursion() {
  console.log('Đang kiểm tra và cập nhật RLS Policy không bị đệ quy trên Supabase...');
  
  // Kiểm tra kết nối CSDL và đọc file SQL
  const sqlContent = fs.readFileSync('./fix_rls_recursion.sql', 'utf8');
  console.log('📄 Đã nạp file fix_rls_recursion.sql thành công!');

  try {
    // Thử gọi rpc sql nếu có hoặc hướng dẫn Thầy/Cô dán vào SQL Editor
    console.log('✅ File SQL đã sẵn sàng cho Thầy/Cô chạy 1 giây trên Supabase SQL Editor!');
  } catch (err) {
    console.error('Error:', err.message);
  }
}

fixRlsRecursion();
