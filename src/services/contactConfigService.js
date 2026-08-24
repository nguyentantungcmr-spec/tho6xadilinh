import { supabase } from './supabaseClient';

/**
 * SERVICE QUẢN LÝ CẤU HÌNH LIÊN HỆ, MÃ QR & DANH BẠ BQT / TỔ CNS THÔN 6
 */

export const DEFAULT_VILLAGE_CONTACTS = {
  // 1. Cấu hình Mã QR Zalo Thôn 6
  qr_zalo_image: '/qr_zalo_thon6.png',
  qr_zalo_title: 'Nhóm Zalo Cộng Đồng Thôn 6',
  qr_zalo_description: 'Cộng đồng Chuyển đổi số Thôn 6 Xã Di Linh',
  zalo_community_link: 'https://zalo.me/0903382277',
  
  // 2. Cấu hình Nút Chat Box Zalo nổi góc màn hình
  chat_zalo_phone: '0903.382.277',
  chat_zalo_title: 'Chat Zalo Hỗ Trợ',
  chat_zalo_subtitle: '0903.382.277',
  chat_zalo_link: 'https://zalo.me/0903382277',

  // 3. Hotline Cầm tay chỉ việc
  hotline_main: '0903.382.277',
  hotline_title: 'Hotline Cầm Tay Chỉ Việc Thôn 6',
  hotline_description: 'Hỗ trợ kỹ năng số, VNeID, dịch vụ công trực tuyến 24/7',
  
  // 3. Danh bạ Ban Quản Trị Thôn 6
  management_board: [
    {
      id: 'admin-1',
      name: 'Nguyễn Văn Đạt',
      role_title: 'Trưởng Thôn 6',
      phone: '0903.382.277',
      zalo: '0903382277',
      duty: 'Chỉ đạo chung phong trào chuyển đổi số & tiếp nhận ý kiến bà con'
    },
    {
      id: 'admin-2',
      name: 'Trần Thị Mai',
      role_title: 'Phó Trưởng Thôn & Chi hội Phụ nữ',
      phone: '0912.456.789',
      zalo: '0912456789',
      duty: 'Phụ trách phong trào phổ cập số cho phụ nữ & người cao tuổi'
    },
    {
      id: 'admin-3',
      name: 'Lê Hoàng Nam',
      role_title: 'Bí thư Chi bộ Thôn 6',
      phone: '0988.123.456',
      zalo: '0988123456',
      duty: 'Định hướng công tác tuyên truyền & chuyển đổi số toàn diện'
    }
  ],
  
  // 4. Danh bạ Tổ Công Nghệ Số (CNS) Cộng Đồng
  cns_team: [
    {
      id: 'cns-1',
      name: 'Nguyễn Tấn Tùng',
      role_title: 'Tổ trưởng Tổ CNS Cộng đồng',
      phone: '0903.382.277',
      zalo: '0903382277',
      duty: 'Điều phối hỗ trợ công nghệ, hướng dẫn VNeID, BHYT & AI'
    },
    {
      id: 'cns-2',
      name: 'Phạm Minh Đức',
      role_title: 'Tổ phó Tổ CNS - Đoàn Thanh Niên',
      phone: '0934.567.890',
      zalo: '0934567890',
      duty: 'Hỗ trợ kỹ thuật thực hành trực tiếp tại Nhà văn hóa thôn'
    },
    {
      id: 'cns-3',
      name: 'Vũ Thị Lan',
      role_title: 'Thành viên Tổ CNS (Phụ trách Xóm 1 & 2)',
      phone: '0977.654.321',
      zalo: '0977654321',
      duty: 'Cầm tay chỉ việc quét mã QR, thanh toán tiền điện tại nhà'
    },
    {
      id: 'cns-4',
      name: 'Hoàng Văn Tuấn',
      role_title: 'Thành viên Tổ CNS (Phụ trách Xóm 3 & 4)',
      phone: '0945.112.233',
      zalo: '0945112233',
      duty: 'Hướng dẫn cài đặt ứng dụng nông nghiệp, theo dõi giá cà phê'
    }
  ]
};

const STORAGE_KEY = 'thon6_village_contacts_config';

/**
 * Lấy toàn bộ cấu hình liên hệ, QR và danh bạ Thôn 6
 */
export async function getVillageContactsConfig() {
  try {
    // 1. Thử lấy từ Supabase bảng village_settings
    const { data, error } = await supabase
      .from('village_settings')
      .select('*')
      .eq('id', 'contact_config')
      .single();

    if (!error && data && data.config_data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data.config_data));
      return data.config_data;
    }
  } catch (e) {
    console.log('Chưa có bảng village_settings trong Supabase, dùng dữ liệu lưu trữ cục bộ:', e.message);
  }

  // 2. Fallback: Lấy từ LocalStorage
  const localCached = localStorage.getItem(STORAGE_KEY);
  if (localCached) {
    try {
      return JSON.parse(localCached);
    } catch (e) {
      console.error('Lỗi parse contact config từ local storage', e);
    }
  }

  // 3. Fallback: Dùng mặc định
  return DEFAULT_VILLAGE_CONTACTS;
}

/**
 * Cập nhật cấu hình liên hệ, QR và danh bạ Thôn 6 (Lưu Supabase & LocalStorage)
 */
export async function updateVillageContactsConfig(newConfig) {
  try {
    // Lưu vào LocalStorage ngay lập tức
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));

    // Thử cập nhật lên Supabase
    const { data, error } = await supabase
      .from('village_settings')
      .upsert({
        id: 'contact_config',
        config_data: newConfig,
        updated_at: new Date().toISOString()
      })
      .select();

    // Bắn sự kiện để tất cả các component trên web cập nhật theo thời gian thực
    window.dispatchEvent(new CustomEvent('village_contacts_updated', { detail: newConfig }));

    if (error) {
      console.warn('Lưu vào Supabase chưa thành công, đã lưu vào LocalStorage:', error.message);
      return { success: true, warning: 'Đã lưu cấu hình trên trình duyệt (Cần tạo bảng village_settings trong Supabase để đồng bộ mọi máy)' };
    }

    return { success: true, data: data?.[0] };
  } catch (err) {
    console.error('Lỗi lưu cấu hình liên hệ:', err);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
    window.dispatchEvent(new CustomEvent('village_contacts_updated', { detail: newConfig }));
    return { success: true, warning: 'Đã lưu cục bộ' };
  }
}
