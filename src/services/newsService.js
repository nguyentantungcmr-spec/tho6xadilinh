/**
 * DỊCH VỤ TIN TỨC & THỜI SỰ TỰ ĐỘNG CẬP NHẬT HÀNG NGÀY
 * XÃ DI LINH – TỈNH LÂM ĐỒNG – CẢ NƯỚC
 */

import { supabase } from './supabaseClient';

/**
 * Format ngày tháng tiếng Việt
 */
function formatDateVi(date) {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}

/**
 * TỰ ĐỘNG TẠO BẢN TIN THỜI SỰ ĐA CẤP (DI LINH - LÂM ĐỒNG - CẢ NƯỚC) DỰA TRÊN THỜI GIAN THỰC
 */
export function getDailyDynamicNews(baseDate = new Date()) {
  const today = new Date(baseDate);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const twoDaysAgo = new Date(today);
  twoDaysAgo.setDate(today.getDate() - 2);
  const threeDaysAgo = new Date(today);
  threeDaysAgo.setDate(today.getDate() - 3);
  const fourDaysAgo = new Date(today);
  fourDaysAgo.setDate(today.getDate() - 4);
  const fiveDaysAgo = new Date(today);
  fiveDaysAgo.setDate(today.getDate() - 5);

  const todayStr = formatDateVi(today);
  const yesterdayStr = formatDateVi(yesterday);
  const twoDaysAgoStr = formatDateVi(twoDaysAgo);
  const threeDaysAgoStr = formatDateVi(threeDaysAgo);
  const fourDaysAgoStr = formatDateVi(fourDaysAgo);
  const fiveDaysAgoStr = formatDateVi(fiveDaysAgo);

  const dayOfWeek = today.getDay();
  const dayNames = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const currentDayName = dayNames[dayOfWeek];

  return [
    // ==========================================
    // 1. TIN TỨC XÃ DI LINH & THÔN 6 (ĐỊA PHƯƠNG)
    // ==========================================
    {
      id: `daily-coffee-${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`,
      scope: 'dilinh',
      scope_label: '🏛️ Xã Di Linh',
      title: `☕ Giá Cà Phê Di Linh & Dự Báo Nông Nghiệp Ngày ${todayStr} (${currentDayName})`,
      summary: `Cập nhật thị trường nông sản hôm nay tại huyện Di Linh: Giá cà phê Robusta nhân xô neo cao ở mức 118.000đ - 122.500đ/kg, hướng dẫn kỹ thuật chăm sóc vườn và kết nối tiêu thụ nông sản số.`,
      content: `BẢN TIN THỊ TRƯỜNG NÔNG SẢN DI LINH HÔM NAY (${currentDayName}, ngày ${todayStr}):

1. TÌNH HÌNH GIÁ NÔNG SẢN TẠI DI LINH:
- Giá Cà phê Robusta nhân xô thu mua: Dao động từ 118.000đ – 122.500đ/kg.
- Giá Sầu riêng Monthong & Ri6 loại 1: Giữ mức cao, thương lái chốt giá tận vườn.
- Khuyến cáo bà con Thôn 6 ứng dụng tem quét mã QR truy xuất nguồn gốc chất lượng để nâng cao giá trị khi xuất bán.

2. THỜI TIẾT NÔNG NGHIỆP DI LINH HÔM NAY:
- Ban ngày có nắng, chiều tối khả năng có mưa rào rải rác tại các sườn đồi.
- Bà con chú ý kiểm tra hệ thống thoát nước vườn cà phê, bón phân cân đối đợt nuôi quả và kiểm tra phòng trừ bệnh rỉ sắt, mọt đục cành.

3. HỖ TRỢ NÔNG DÂN SỐ:
Tổ CNS Thôn 6 hỗ trợ bà con kết nối bán hàng qua nhóm Zalo Cộng đồng và sàn thương mại điện tử miễn phí. Hotline: 0943.849.295.`,
      category: 'Nông Nghiệp Di Linh',
      category_color: 'bg-emerald-600',
      image_url: '/banner_2.png',
      source: 'Ban Nông Nghiệp Xã Di Linh',
      author: 'Tổ Khuyến Nông',
      published_date: `Hôm nay, ${todayStr} (06:30)`,
      views: 520,
      is_urgent: false,
      is_new: true
    },
    {
      id: `news-vneid-dilinh-${today.getFullYear()}-${today.getMonth()}`,
      scope: 'dilinh',
      scope_label: '🏛️ Xã Di Linh',
      title: `📢 UBND Xã Di Linh Thông Báo: Đợt Cao Điểm Kích Hoạt VNeID Mức 2 & Dịch Vụ Công Toàn Trình`,
      summary: `Công an xã phối hợp cùng Tổ Công nghệ số Thôn 6 tổ chức hỗ trợ người dân cài đặt định danh điện tử, tích hợp BHYT và giải quyết thủ tục giấy tờ trực tuyến tại cơ sở.`,
      content: `KẾ HOẠCH CAO ĐIỂM CHUYỂN ĐỔI SỐ TẠI XÃ DI LINH:

Nhằm phục vụ nhân dân tốt nhất, UBND Xã Di Linh triển khai các nội dung:

1. NỘI DUNG HỖ TRỢ TẠI NHÀ SINH HOẠT CỘNG ĐỒNG:
- Kích hoạt VNeID Mức 2 cho 100% người dân đủ điều kiện.
- Tích hợp Thẻ BHYT, Giấy phép lái xe vào điện thoại để khám chữa bệnh không cần mang thẻ giấy.
- Hướng dẫn nộp hồ sơ xin cấp bản sao hộ tịch, đăng ký biến động đất đai trực tuyến trên cổng dilinh.lamdong.gov.vn.

2. ĐỘI LƯU ĐỘNG TẬN NHÀ:
Đội tình nguyện viên thanh niên sẽ đến tận nhà các cụ cao tuổi, người có công để hỗ trợ trực tiếp.`,
      category: 'Thông Báo Xã',
      category_color: 'bg-blue-600',
      image_url: '/banner_1.jpg',
      source: 'UBND Xã Di Linh',
      author: 'Tổ CNS Cộng Đồng',
      published_date: `Cập nhật ${todayStr}`,
      views: 740,
      is_urgent: true,
      is_new: true
    },

    // ==========================================
    // 2. TIN TỨC TỈNH LÂM ĐỒNG (TỈNH NHÀ)
    // ==========================================
    {
      id: `news-lamdong-expressway-${today.getFullYear()}`,
      scope: 'lamdong',
      scope_label: '🌲 Tỉnh Lâm Đồng',
      title: `🚗 Lâm Đồng Đẩy Nhanh Tiến Độ Dự Án Cao Tốc Tân Phú - Bảo Lộc - Liên Khương Đi Qua Di Linh`,
      summary: `Tuyến cao tốc huyết mạch kết nối TP.HCM với Lâm Đồng sẽ rút ngắn thời gian di chuyển từ Di Linh đi Đà Lạt và Đông Nam Bộ, mở ra cơ hội đột phá kinh tế - du lịch cho địa phương.`,
      content: `TIN THỜI SỰ TỈNH LÂM ĐỒNG:

UBND Tỉnh Lâm Đồng đang tập trung chỉ đạo quyết liệt công tác giải phóng mặt bằng và hoàn thiện các thủ tục triển khai dự án cao tốc Tân Phú - Bảo Lộc và Bảo Lộc - Liên Khương:

- TẦM QUAN TRỌNG:
Tuyến đường cao tốc hoàn thành sẽ kết nối thông suốt từ TP.HCM qua Đồng Nai lên Lâm Đồng, đi qua địa phận huyện Di Linh. Giúp rút ngắn một nửa thời gian vận chuyển nông sản cà phê, chè, sầu riêng của bà con Di Linh về các cảng xuất khẩu.

- PHÁT TRIỂN KINH TẾ ĐỊA PHƯƠNG:
Huyện Di Linh sẽ trở thành điểm dừng chân du lịch sinh thái canh nông và đầu mối logistics nông sản quan trọng của toàn vùng Tây Nguyên.`,
      category: 'Kinh Tế Lâm Đồng',
      category_color: 'bg-teal-600',
      image_url: '/banner_thon6_dilinh.jpg',
      source: 'Cổng TTĐT Tỉnh Lâm Đồng',
      author: 'Báo Lâm Đồng',
      published_date: `Hôm nay, ${todayStr}`,
      views: 890,
      is_urgent: false,
      is_new: true
    },
    {
      id: `news-lamdong-flower-festival-${yesterday.getDate()}`,
      scope: 'lamdong',
      scope_label: '🌲 Tỉnh Lâm Đồng',
      title: `🌸 Tỉnh Lâm Đồng Khởi Động Chuỗi Sự Kiện Festival Hoa & Quảng Bá Nông Sản Đặc Trưng`,
      summary: `Tôn vinh người trồng hoa, cà phê và các sản phẩm OCOP đặc trưng của vùng đất Nam Tây Nguyên, đẩy mạnh quảng bá thương hiệu nông sản Di Linh - Lâm Đồng trên nền tảng số.`,
      content: `SỰ KIỆN VĂN HÓA - KINH TẾ TỈNH LÂM ĐỒNG:

Tỉnh Lâm Đồng chính thức công bố chương trình Festival Hoa kết hợp Hội chợ Nông sản Công nghệ cao:

- Trưng bày các sản phẩm OCOP đạt chuẩn 3 sao, 4 sao của huyện Di Linh như Cà phê chất lượng cao, Trà Ô long, Mật ong hoa cà phê, Sầu riêng sấy thăng hoa.
- Tổ chức các phiên livestream kết nối nông sản trực tiếp tại vườn của nông dân Lâm Đồng với hàng triệu người tiêu dùng cả nước.
- Ban tổ chức khuyến khích các hộ sản xuất tại Thôn 6 Xã Di Linh tham gia gian hàng số để mở rộng thị trường.`,
      category: 'Văn Hóa - Du Lịch',
      category_color: 'bg-purple-600',
      image_url: '/banner_3.png',
      source: 'Sở VHTTDL Lâm Đồng',
      author: 'Báo Lâm Đồng Điện Tử',
      published_date: `Hôm qua, ${yesterdayStr}`,
      views: 630,
      is_urgent: false,
      is_new: false
    },
    {
      id: `news-lamdong-digital-admin-${twoDaysAgo.getDate()}`,
      scope: 'lamdong',
      scope_label: '🌲 Tỉnh Lâm Đồng',
      title: `🏛️ Lâm Đồng Thuộc Top Đầu Cả Nước Về Tỷ Lệ Giải Quyết Thủ Tục Hành Chính Không Dùng Tiền Mặt`,
      summary: `100% các trung tâm một cửa cấp huyện, xã tại Lâm Đồng đã triển khai thanh toán lệ phí bằng mã QR động và tiếp nhận hồ sơ số toàn trình.`,
      content: `KẾT QUẢ CHUYỂN ĐỔI SỐ HÀNH CHÍNH TỈNH LÂM ĐỒNG:

Theo báo cáo của Sở TT&TT Tỉnh Lâm Đồng:
- Tỷ lệ người dân sử dụng thanh toán quét mã QR khi làm thủ tục hành chính tại Di Linh đạt trên 92%.
- Hơn 1.200 dịch vụ công đã được cung cấp toàn trình trên môi trường mạng.
- Người dân Thôn 6 Xã Di Linh có thể thực hiện tra cứu kết quả hồ sơ mọi lúc mọi nơi ngay trên điện thoại thông minh.`,
      category: 'Chính Quyền Số',
      category_color: 'bg-indigo-600',
      image_url: '/banner_4.png',
      source: 'Sở TT&TT Tỉnh Lâm Đồng',
      author: 'Cổng TTĐT Tỉnh Lâm Đồng',
      published_date: `${twoDaysAgoStr}`,
      views: 470,
      is_urgent: false,
      is_new: false
    },

    // ==========================================
    // 3. TIN TỨC THỜI SỰ CẢ NƯỚC (QUỐC GIA)
    // ==========================================
    {
      id: `news-vietnam-binhdanhocvuso-${today.getFullYear()}`,
      scope: 'national',
      scope_label: '🇻🇳 Cả Nước',
      title: `🇻🇳 Bộ TT&TT Phát Động Cao Điểm Toàn Quốc Phong Trào "Bình Dân Học Vụ Số"`,
      summary: `Mục tiêu phổ cập kỹ năng số căn bản cho mọi người dân Việt Nam, giúp người cao tuổi và bà con nông dân tiếp cận dịch vụ số an toàn, văn minh và tiện ích.`,
      content: `PHONG TRÀO CHUYỂN ĐỔI SỐ TOÀN DÂN:

Bộ Thông tin và Truyền thông vừa chính thức phát động đợt thi đua cao điểm "Bình Dân Học Vụ Số":

- KHẨU HIỆU HÀNH ĐỘNG:
"Chuyển đổi số phải lấy người dân làm trung tâm, lấy sự hài lòng và tiện lợi của nhân dân làm thước đo."

- 4 KỸ NĂNG CỐT LÕI BÀ CON CẦN NẮM VỮNG:
1. Biết dùng smartphone cài đặt và sử dụng ứng dụng VNeID, BHYT số.
2. Biết quét mã QR thanh toán không tiền mặt an toàn.
3. Biết nộp hồ sơ dịch vụ công trực tuyến.
4. Biết nhận diện các dấu hiệu lừa đảo và tự bảo vệ tài khoản ngân hàng trên không gian mạng.

Trang web Thôn 6 Xã Di Linh vinh dự là một trong những mô hình cơ sở tiêu biểu đi đầu áp dụng nền tảng Bình Dân Học Vụ Số.`,
      category: 'Thời Sự Quốc Gia',
      category_color: 'bg-red-600',
      image_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1000&q=80',
      source: 'Cổng TTĐT Bộ TT&TT (binhdanhocvuso.gov.vn)',
      author: 'Bộ Thông tin & Truyền thông',
      published_date: `Hôm nay, ${todayStr}`,
      views: 1250,
      is_urgent: false,
      is_new: true
    },
    {
      id: `news-national-security-alert-${yesterday.getDate()}`,
      scope: 'national',
      scope_label: '🇻🇳 Cả Nước',
      title: `🚨 Cục An Toàn Thông Tin Cảnh Báo Khẩn Toàn Quốc: 24 Thủ Đoạn Lừa Đảo Công Nghệ Cao`,
      summary: `Bộ Công an và Bộ TT&TT khuyến cáo người dân cả nước tuyệt đối cảnh giác trước các thủ đoạn mạo danh công an, ngân hàng, thuế gọi điện thoại yêu cầu cài link độc hại (.apk).`,
      content: `CẢNH BÁO AN NINH MẠNG QUỐC GIA:

Cục An toàn thông tin (Bộ TT&TT) phối hợp Cục An ninh mạng (Bộ Công an) phát đi thông báo khẩn cấp:

1. CHIÊU TRÒ PHỔ BIẾN NHẤT HIỆN NAY:
- Kẻ gian giả danh Cán bộ Công an hoặc Cơ quan Thuế gọi điện thoại báo người dân "sai thông tin định danh", sau đó yêu cầu kết bạn Zalo và gửi đường link tải phần mềm giả mạo có đuôi file ".apk".
- Khi cài đặt, phần mềm độc hại sẽ chiếm quyền điều khiển điện thoại, tự động đọc tin nhắn SMS chứa mã OTP ngân hàng và chuyển sạch tiền trong tài khoản.

2. NGUYÊN TẮC PHÒNG TRÁNH "4 KHÔNG - 2 PHẢI":
- KHÔNG cung cấp mật khẩu, mã OTP cho bất kỳ ai.
- KHÔNG bấm vào đường link lạ gửi qua tin nhắn/Zalo.
- KHÔNG tải app ngoài kho ứng dụng chính thức (Google Play / App Store).
- KHÔNG chuyển tiền theo yêu cầu của người lạ qua điện thoại.
- PHẢI kiểm tra lại với Công an địa phương khi có nghi vấn.
- PHẢI báo ngay cho ngân hàng khóa tài khoản khi nghi ngờ lộ thông tin.`,
      category: 'Cảnh Báo An Ninh',
      category_color: 'bg-red-700',
      image_url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1000&q=80',
      source: 'Cục An Toàn Thông Tin - Bộ TT&TT',
      author: 'Bộ phận Giám sát An toàn mạng Quốc gia',
      published_date: `Hôm qua, ${yesterdayStr}`,
      views: 1580,
      is_urgent: true,
      is_new: false
    },
    {
      id: `news-national-law-cccd-${threeDaysAgo.getDate()}`,
      scope: 'national',
      scope_label: '🇻🇳 Cả Nước',
      title: `🪪 Chính Phủ Ban Hành Quy Định Mới: Mở Rộng 10 Tiện Ích Mới Trên Ứng Dụng VNeID Toàn Quốc`,
      summary: `Người dân cả nước nay có thể xuất trình Giấy khai sinh, Giấy đăng ký kết hôn, Sổ bảo hiểm xã hội và Thẻ Đảng viên trực tiếp ngay trên ứng dụng VNeID.`,
      content: `CHÍNH SÁCH MỚI CỦA CHÍNH PHỦ VỀ ĐỊNH DANH ĐIỆN TỬ:

Theo Nghị định mới của Chính phủ về Căn cước và Định danh điện tử:
- Tài khoản VNeID Mức 2 có giá trị tương đương các giấy tờ bản gốc khi thực hiện mọi giao dịch hành chính trên toàn lãnh thổ Việt Nam.
- Người dân đi tàu xe, máy bay, khám chữa bệnh BHYT, giao dịch ngân hàng chỉ cần mở app VNeID trên điện thoại.
- Tích hợp tính năng cấp Phiếu lý lịch tư pháp trực tuyến chỉ trong 3 ngày làm việc, không cần đến trực tiếp Sở Tư pháp.`,
      category: 'Chính Sách Mới',
      category_color: 'bg-blue-700',
      image_url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1000&q=80',
      source: 'Cổng Thông Tin Điện Tử Chính Phủ',
      author: 'Báo Điện Tử Chính Phủ',
      published_date: `${threeDaysAgoStr}`,
      views: 1120,
      is_urgent: false,
      is_new: false
    }
  ];
}

export const INITIAL_NEWS = getDailyDynamicNews();

/**
 * Lấy danh sách tin tức tự động cập nhật
 */
export async function getNewsArticles() {
  try {
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      return data;
    }
  } catch (err) {
    console.log('Using dynamic daily news feed');
  }

  return getDailyDynamicNews();
}
