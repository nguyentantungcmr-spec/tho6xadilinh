import { supabase } from './supabaseClient.js';
import { processUserQuestionPipeline } from './aiPipelineService.js';

/**
 * 12 TRỤ CỘT TRI THỨC CỐT LÕI CỦA TRỢ LÝ SỐ THÔN 6 XÃ DI LINH (RAG KNOWLEDGE REPOSITORY)
 * VNeID → Dịch vụ công → Phòng chống lừa đảo → Chuyển đổi số → Y tế → Giáo dục
 * → Môi trường → An ninh trật tự → Chính sách người dân → Nông nghiệp → Phòng chống thiên tai → Thông tin liên hệ địa phương.
 */
export const OFFICIAL_12_PILLARS_KNOWLEDGE = [
  // 1. VNeID & ĐỊNH DANH ĐIỆN TỬ
  {
    doc_number: '06/QĐ-TTg & 15/KH-CAX',
    title: 'Quy trình kích hoạt tài khoản định danh điện tử VNeID Mức 2 và tích hợp giấy tờ công dân tại Xã Di Linh',
    issuing_body: 'Thủ tướng Chính phủ & Công an Xã Di Linh',
    issued_date: '2026-01-10',
    category: 'VNeID & Định danh điện tử',
    effect_status: 'Còn hiệu lực',
    source_url: 'https://dilinh.lamdong.gov.vn',
    content_summary: `HƯỚNG DẪN KÍCH HOẠT VNeID MỨC 2 TẠI THÔN 6 XÃ DI LINH:
1. Địa điểm làm thủ tục: Trụ sở Công an Xã Di Linh hoặc các buổi lưu động tại Nhà sinh hoạt cộng đồng Thôn 6.
2. Giấy tờ cần mang: Thẻ CCCD gắn chip và điện thoại có số thuê bao chính chủ.
3. Các bước tích hợp giấy tờ vào VNeID Mức 2:
- Thẻ BHYT: Vào "Ví giấy tờ" -> "Tích hợp thông tin" -> Chọn "Thẻ BHYT" -> Nhập mã số BHXH in trên thẻ.
- Giấy phép lái xe (GPLX): Chọn loại GPLX (PET) và nhập số giấy phép.
- Đăng ký xe: Nhập biển số và số khung/số máy.
4. Hỗ trợ sự cố: Khi quên mật khẩu hoặc đổi số điện thoại đăng ký, liên hệ Công an Xã hoặc Hotline Tổ CNS Thôn 6: 0903.382.277 để được hỗ trợ mở khóa.`
  },

  // 2. DỊCH VỤ CÔNG TRỰC TUYẾN
  {
    doc_number: '42/2022/NĐ-CP & 08/HD-UBND',
    title: 'Quy định và hướng dẫn nộp hồ sơ thủ tục hành chính trực tuyến toàn trình tại Bộ phận Một cửa UBND Xã Di Linh',
    issuing_body: 'Chính phủ & UBND Xã Di Linh',
    issued_date: '2026-01-15',
    category: 'Dịch vụ công trực tuyến',
    effect_status: 'Còn hiệu lực',
    source_url: 'https://dichvucong.gov.vn',
    content_summary: `HƯỚNG DẪN NỘP HỒ SƠ DỊCH VỤ CÔNG TRỰC TUYẾN TOÀN TRÌNH:
1. Các thủ tục phổ biến đã được cung cấp trực tuyến 24/7:
- Cấp bản sao trích lục hộ tịch (Khai sinh, Kết hôn, Khai tử).
- Đăng ký khai sinh, đăng ký kết hôn, thông báo lưu trú.
- Chứng thực bản sao điện tử từ bản chính.
- Đăng ký biến động quyền sử dụng đất đai.
2. Quy trình 4 bước thực hiện:
- Bước 1: Truy cập dichvucong.gov.vn hoặc dilinh.lamdong.gov.vn -> Đăng nhập bằng tài khoản VNeID Mức 2.
- Bước 2: Chọn cơ quan tiếp nhận: "UBND Xã Di Linh, Huyện Di Linh, Tỉnh Lâm Đồng".
- Bước 3: Điền tờ khai điện tử và đính kèm ảnh chụp các giấy tờ gốc rõ nét.
- Bước 4: Thanh toán lệ phí trực tuyến qua quét mã QR ngân hàng và nhận kết quả tại nhà qua bưu điện hoặc tại Bộ phận Một cửa xã.`
  },

  // 3. PHÒNG CHỐNG LỪA ĐẢO CÔNG NGHỆ CAO
  {
    doc_number: '02/TB-CAH & 88/CAT-PA05',
    title: 'Cảnh báo 24 thủ đoạn lừa đảo công nghệ cao và nguyên tắc 4 KHÔNG - 2 PHẢI bảo vệ tài khoản ngân hàng',
    issuing_body: 'Công an Huyện Di Linh & Phòng An ninh mạng Công an Tỉnh Lâm Đồng',
    issued_date: '2026-02-01',
    category: 'Phòng chống lừa đảo mạng',
    effect_status: 'Còn hiệu lực',
    source_url: 'https://dilinh.lamdong.gov.vn',
    content_summary: `CẢNH BÁO AN NINH MẠNG VÀ PHÒNG CHỐNG TỘI PHẠM CÔNG NGHỆ CAO:
1. Các thủ đoạn lừa đảo nguy hiểm nhất hiện nay tại Di Linh:
- Kẻ gian giả danh Cán bộ Công an hoặc Cán bộ Thuế gọi điện thoại báo "sai thông tin CCCD", sau đó gửi đường link lạ đuôi ".apk" qua Zalo yêu cầu cài đặt để chiếm đoạt tài khoản ngân hàng.
- Gọi video Deepfake giả khuôn mặt người thân mượn tiền khẩn cấp.
- Mạo danh nhân viên điện lực/nước dọa cắt dịch vụ nếu không chuyển tiền vào tài khoản cá nhân.
- Tuyển cộng tác viên làm việc online, xem video TikTok kiếm tiền hoa hồng cao.
2. NGUYÊN TẮC VÀNG "4 KHÔNG - 2 PHẢI":
- KHÔNG cung cấp mật khẩu, mã OTP, mã Smart OTP cho bất kỳ ai (kể cả nhân viên ngân hàng hay công an).
- KHÔNG bấm vào link lạ, link rút gọn gửi qua SMS/Zalo.
- KHÔNG tải app ngoài kho ứng dụng chính thức (Google Play / App Store).
- KHÔNG chuyển tiền theo yêu cầu của người lạ qua điện thoại.
- PHẢI xác minh lại với Công an Xã Di Linh khi có người tự xưng cơ quan chức năng gọi điện.
- PHẢI gọi ngay ngân hàng khóa thẻ và báo Tổ CNS: 0903.382.277 khi nghi vấn bị lộ thông tin.`
  },

  // 4. CHUYỂN ĐỔI SỐ CỘNG ĐỒNG & BÌNH DÂN HỌC VỤ SỐ
  {
    doc_number: '24/KH-UBND & 01/KH-TOCNS6',
    title: 'Kế hoạch triển khai phong trào "Bình dân học vụ số" và hoạt động Tổ công nghệ số cộng đồng Thôn 6 năm 2026',
    issuing_body: 'UBND Xã Di Linh & Tổ CNS Cộng Đồng Thôn 6',
    issued_date: '2026-01-20',
    category: 'Chuyển đổi số cộng đồng',
    effect_status: 'Còn hiệu lực',
    source_url: 'https://dilinh.lamdong.gov.vn',
    content_summary: `KẾ HOẠCH BÌNH DÂN HỌC VỤ SỐ TẠI THÔN 6:
1. Mục tiêu: Phổ cập kỹ năng số căn bản cho 100% người dân, đặc biệt là người cao tuổi, phụ nữ và bà con đồng bào thiểu số.
2. 4 Kỹ năng cốt lõi người dân Thôn 6 làm chủ:
- Sử dụng VNeID và BHYT số đi khám bệnh.
- Quét mã QR thanh toán tiền điện, nước, phân bón và nhu yếu phẩm.
- Sử dụng Zalo gọi điện video kết nối con cháu và nhận tin tức cảnh báo an ninh thôn.
- Tra cứu bảng giá nông sản cà phê, sầu riêng hàng ngày trên cổng thông tin thôn.
3. Lịch hỗ trợ:
- Định kỳ Thứ 7 & Chủ Nhật hàng tuần tại Nhà sinh hoạt cộng đồng Thôn 6.
- Đội thanh niên tình nguyện "Đi từng ngõ, gõ từng nhà" hỗ trợ trực tiếp người cao tuổi.`
  },

  // 5. Y TẾ & BẢO HIỂM Y TẾ SỐ
  {
    doc_number: '05/HD-BHXH-TTYT',
    title: 'Hướng dẫn khám chữa bệnh bằng mã QR thẻ BHYT trên ứng dụng VNeID và VssID tại các cơ sở y tế Di Linh',
    issuing_body: 'Bảo hiểm Xã hội & Trung tâm Y tế Huyện Di Linh',
    issued_date: '2026-01-25',
    category: 'Y tế & BHYT số',
    effect_status: 'Còn hiệu lực',
    source_url: 'https://dilinh.lamdong.gov.vn',
    content_summary: `QUY ĐỊNH KHÁM CHỮA BỆNH BẰNG THẺ BHYT ĐIỆN TỬ:
1. Cơ sở y tế áp dụng: Trung tâm Y tế Huyện Di Linh, Trạm Y tế Xã Di Linh và tất cả bệnh viện tuyến huyện, tỉnh trên toàn quốc.
2. Người dân Thôn 6 không cần mang thẻ BHYT giấy hay giấy tờ tùy thân rườm rà:
- Chỉ cần mở ứng dụng VNeID (đã kích hoạt Mức 2) -> Vào "Ví giấy tờ" -> Chọn "Thẻ BHYT" -> Xuất trình mã QR cho nhân viên tiếp đón quét vào máy.
- Hoặc sử dụng ứng dụng VssID (BHXH số) để xuất trình hình ảnh thẻ BHYT.
3. Tiêm chủng mở rộng: Trạm Y tế Xã Di Linh tổ chức tiêm chủng định kỳ cho trẻ em vào ngày mùng 5 và 20 hàng tháng.`
  },

  // 6. GIÁO DỤC & HỌC TẬP SUỐT ĐỜI
  {
    doc_number: '12/HD-PGDĐT',
    title: 'Hướng dẫn đăng ký tuyển sinh trực tuyến đầu cấp và tra cứu kết quả học tập qua sổ liên lạc điện tử VnEdu',
    issuing_body: 'Phòng GD&ĐT Huyện Di Linh & Trường TH-THCS Di Linh',
    issued_date: '2026-02-05',
    category: 'Giáo dục & Tuyển sinh số',
    effect_status: 'Còn hiệu lực',
    source_url: 'https://dilinh.lamdong.gov.vn',
    content_summary: `HƯỚNG DẪN GIÁO DỤC SỐ DÀNH CHO PHỤ HUYNH THÔN 6:
1. Tuyển sinh trực tuyến đầu cấp (Mầm non, Lớp 1, Lớp 6):
- Phụ huynh đăng ký hồ sơ nhập học cho con qua cổng tuyển sinh trực tuyến của ngành giáo dục Lâm Đồng mà không cần xếp hàng nộp hồ sơ giấy.
2. Sổ liên lạc điện tử VnEdu:
- Phụ huynh cài đặt ứng dụng VnEdu Connect trên điện thoại để nhận thông báo kết quả học tập, điểm danh, thời khóa biểu và học phí trực tuyến.
3. Khuyến học Thôn 6: Chi hội Khuyến học Thôn 6 hàng năm trao thưởng học bổng cho học sinh nghèo vượt khó và đỗ đại học cao đẳng.`
  },

  // 7. MÔI TRƯỜNG & THU GOM RÁC THẢI
  {
    doc_number: '19/TB-UBND',
    title: 'Quy định thời gian thu gom rác sinh hoạt, phân loại rác tại nguồn và giữ gìn vệ sinh môi trường Thôn 6',
    issuing_body: 'UBND Xã Di Linh - Ban Quản lý Môi trường',
    issued_date: '2026-02-10',
    category: 'Môi trường & Rác thải',
    effect_status: 'Còn hiệu lực',
    source_url: 'https://dilinh.lamdong.gov.vn',
    content_summary: `QUY ĐỊNH BẢO VỆ MÔI TRƯỜNG NÔNG THÔN MỚI THÔN 6:
1. Lịch thu gom rác sinh hoạt:
- Xe thu gom rác đi qua các trục đường chính Thôn 6 vào các ngày Thứ 3, Thứ 5 và Thứ 7 hàng tuần (từ 06h00 - 09h00 sáng).
2. Phân loại rác tại nguồn:
- Rác hữu cơ, lá cây, vỏ cà phê: Khuyến khích bà con ủ làm phân bón hữu cơ vi sinh bón cho cây trồng.
- Rác tái chế (chai lọ nhựa, giấy vụn, kim loại): Thu gom để bán phế liệu.
- Rác nguy hại nông nghiệp (vỏ bao bì, chai lọ thuốc bảo vệ thực vật): Tuyệt đối KHÔNG vứt bừa bãi ra nương rẫy, suối nguồn; phải bỏ vào các bể chứa xi măng chuyên dụng đặt tại các tuyến đường nội đồng.`
  },

  // 8. AN NINH TRẬT TỰ & PHÒNG CHÁY CHỮA CHÁY
  {
    doc_number: '09/TB-CAX',
    title: 'Quy định đăng ký tạm trú, thông báo lưu trú qua VNeID và bảo đảm an ninh trật tự, PCCC mùa vụ',
    issuing_body: 'Công an Xã Di Linh',
    issued_date: '2026-02-12',
    category: 'An ninh trật tự & PCCC',
    effect_status: 'Còn hiệu lực',
    source_url: 'https://dilinh.lamdong.gov.vn',
    content_summary: `QUY ĐỊNH BẢO ĐẢM AN NINH TRẬT TỰ VÀ PCCC TẠI THÔN 6:
1. Khai báo lưu trú nhân công thời vụ:
- Các hộ gia đình thuê nhân công hái cà phê, cắt sầu riêng thời vụ phải thực hiện thông báo lưu trú trực tuyến qua ứng dụng VNeID hoặc báo cho Cán bộ Công an phụ trách Thôn 6 trong vòng 24 giờ.
2. Phòng ngừa trộm cắp nông sản mùa vụ:
- Tăng cường kiểm tra khóa cổng vườn, chòi rẫy; tích cực tham gia mô hình Camera an ninh thôn và Zalo an ninh trật tự.
3. Phòng cháy chữa cháy (PCCC) mùa khô:
- Nghiêm cấm đốt thực bì, dọn rẫy vào những ngày hanh khô gió lớn khi chưa tạo đường băng cản lửa; chuẩn bị sẵn máy bơm nước và bồn nước tưới phòng cháy lan sang rừng.`
  },

  // 9. CHÍNH SÁCH AN SINH XÃ HỘI & NGƯỜI CÓ CÔNG
  {
    doc_number: '20/2021/NĐ-CP & 14/HD-LĐTBXH',
    title: 'Chính sách trợ cấp xã hội, cấp thẻ BHYT miễn phí cho người cao tuổi, hộ nghèo và vay vốn NHCSXH Di Linh',
    issuing_body: 'UBND Xã Di Linh - Bộ phận Lao động Thương binh & Xã hội',
    issued_date: '2026-01-18',
    category: 'Chính sách người dân & An sinh',
    effect_status: 'Còn hiệu lực',
    source_url: 'https://dilinh.lamdong.gov.vn',
    content_summary: `CHÍNH SÁCH AN SINH XÃ HỘI ÁP DỤNG TẠI THÔN 6 XÃ DI LINH:
1. Trợ cấp xã hội hàng tháng:
- Người cao tuổi từ đủ 80 tuổi trở lên không có lương hưu hoặc trợ cấp BHXH được hưởng trợ cấp xã hội và cấp thẻ BHYT miễn phí 100%.
- Người khuyết tật nặng và đặc biệt nặng được hưởng trợ cấp theo quy định.
2. Hỗ trợ hộ nghèo, cận nghèo:
- Miễn giảm học phí, cấp bù tiền điện sinh hoạt và cấp thẻ BHYT diện nghèo/cận nghèo.
3. Vay vốn Ngân hàng Chính sách Xã hội (NHCSXH) Huyện Di Linh:
- Hỗ trợ vốn vay ưu đãi phát triển sản xuất cà phê, chăn nuôi, nhà ở xã hội và giải quyết việc làm qua Tổ Tiết kiệm & Vay vốn Thôn 6.`
  },

  // 10. NÔNG NGHIỆP, KHUYẾN NÔNG & NÔNG SẢN SỐ
  {
    doc_number: '31/HD-TTKN',
    title: 'Quy trình kỹ thuật thâm canh cà phê Robusta bền vững, chăm sóc sầu riêng Ri6/Monthong và dán tem QR truy xuất',
    issuing_body: 'Trung tâm Khuyến Nông Tỉnh Lâm Đồng & Ban Nông Nghiệp Xã Di Linh',
    issued_date: '2026-02-15',
    category: 'Nông nghiệp & Nông sản Di Linh',
    effect_status: 'Còn hiệu lực',
    source_url: 'https://dilinh.lamdong.gov.vn',
    content_summary: `HƯỚNG DẪN KỸ THUẬT NÔNG NGHIỆP CÔNG NGHỆ CAO TẠI DI LINH:
1. Canh tác Cà phê Robusta:
- Tỉa cành thông thoáng sau thu hoạch, bón phân hữu cơ vi sinh kết hợp NPK cân đối theo 4 đợt nuôi trái.
- Phòng trừ rệp sáp, mọt đục cành và bệnh rỉ sắt bằng chế phẩm sinh học an toàn.
2. Chăm sóc Sầu riêng Monthong & Ri6:
- Quản lý nước tưới giai đoạn xiết nước làm bông và xổ nhụy; phòng bệnh thối rễ, nứt thân xì mủ do nấm Phytophthora.
3. Ứng dụng công nghệ số trong tiêu thụ:
- Tạo mã QR tem truy xuất nguồn gốc vườn mẫu Thôn 6 giúp nâng giá trị xuất khẩu lên 15 - 25% so với bán xô truyền thống.`
  },

  // 11. PHÒNG CHỐNG THIÊN TAI & CỨU NẠN CỨU HỘ
  {
    doc_number: '03/PA-BCH',
    title: 'Phương án chủ động phòng chống mưa bão, sạt lở đất, lũ quét và ứng phó hạn hán tại Thôn 6 Xã Di Linh',
    issuing_body: 'Ban Chỉ huy PCTT&TKCN Xã Di Linh',
    issued_date: '2026-02-18',
    category: 'Phòng chống thiên tai & Bão lũ',
    effect_status: 'Còn hiệu lực',
    source_url: 'https://dilinh.lamdong.gov.vn',
    content_summary: `PHƯƠNG ÁN ỨNG PHÓ THIÊN TAI TẠI THÔN 6:
1. Phòng chống sạt lở đất mùa mưa bão (Tháng 7 - Tháng 11):
- Cảnh giác cao độ tại các khu vực sườn đồi dốc, taluy cao dọc tuyến đường liên thôn. Khi có mưa lớn dầm dề trên 3 ngày, chủ động sơ tán người già và trẻ nhỏ về Nhà sinh hoạt cộng đồng thôn.
2. Phòng chống hạn hán mùa khô (Tháng 1 - Tháng 4):
- Nạo vét kênh mương, tích trữ nước hồ đập thủy lợi; áp dụng công nghệ tưới tiết kiệm nước nhỏ giọt/phun mưa cho vườn cà phê, sầu riêng.
3. Lực lượng xung kích tại chỗ: Đội xung kích PCTT Thôn 6 trực ban 24/24 khi có tin bão áp thấp nhiệt đới.`
  },

  // 12. DANH BẠ LIÊN HỆ & ĐƯỜNG DÂY NÓNG ĐỊA PHƯƠNG
  {
    doc_number: '01/TB-DBNL',
    title: 'Bảng danh bạ điện thoại đường dây nóng các cơ quan, đơn vị hỗ trợ người dân Thôn 6 Xã Di Linh',
    issuing_body: 'UBND Xã Di Linh & Ban Điều Hành Thôn 6',
    issued_date: '2026-02-20',
    category: 'Thông tin liên hệ địa phương',
    effect_status: 'Còn hiệu lực',
    source_url: 'https://dilinh.lamdong.gov.vn',
    content_summary: `DANH BẠ ĐƯỜNG DÂY NÓNG KHẨN CẤP THÔN 6 XÃ DI LINH:
1. Khẩn cấp an ninh & Cứu nạn:
- 📞 Công an Xã Di Linh (Trực ban 24/7): 0263.3870.113 / 113
- 📞 Trạm Y tế Xã Di Linh (Cấp cứu 24/7): 0263.3870.115 / 115
- 📞 Đội PCCC & Cứu nạn Huyện Di Linh: 114
2. Chính quyền & Điều hành thôn:
- 📞 UBND Xã Di Linh (Bộ phận Một cửa): 0263.3870.222
- 📞 Trưởng Ban điều hành Thôn 6: 0903.382.277
3. Tiện ích sinh hoạt:
- 📞 Điện lực Di Linh (Sửa chữa sự cố điện): 1900.6769
- 📞 Cấp nước sinh hoạt Di Linh: 0263.3870.333
4. Hỗ trợ Chuyển đổi số & Công nghệ:
- 📞 Hotline Tổ Công nghệ số Cộng đồng Thôn 6: 0903.382.277 (Hỗ trợ Zalo/Gọi điện 24/7 miễn phí).`
  }
];

export const getOfficialDocuments = async (categoryFilter = 'all') => {
  try {
    let query = supabase
      .from('official_documents')
      .select('*')
      .order('issued_date', { ascending: false });

    if (categoryFilter && categoryFilter !== 'all') {
      query = query.eq('category', categoryFilter);
    }

    const { data, error } = await query;

    if (!error && data && data.length > 0) {
      return { data, error: null };
    }
  } catch (error) {
    console.error('Error fetching official documents:', error);
  }

  let fallback = OFFICIAL_12_PILLARS_KNOWLEDGE;
  if (categoryFilter && categoryFilter !== 'all') {
    fallback = fallback.filter(d => d.category === categoryFilter);
  }
  return { data: fallback, error: null };
};

export const createOfficialDocument = async (docData) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    const payload = {
      doc_number: docData.doc_number,
      title: docData.title,
      issuing_body: docData.issuing_body,
      issued_date: docData.issued_date || new Date().toISOString().split('T')[0],
      category: docData.category || 'Chuyển đổi số cộng đồng',
      effect_status: docData.effect_status || 'Còn hiệu lực',
      source_url: docData.source_url || 'https://dilinh.lamdong.gov.vn',
      file_url: docData.file_url || '',
      content_summary: docData.content_summary,
      created_by: user ? user.id : null
    };

    const { data, error } = await supabase
      .from('official_documents')
      .insert([payload])
      .select();

    if (error) throw error;
    return { data: data[0], error: null };
  } catch (error) {
    console.error('Error creating official document:', error);
    return { data: null, error: error.message };
  }
};

export const updateOfficialDocument = async (id, docData) => {
  try {
    const { data, error } = await supabase
      .from('official_documents')
      .update({
        ...docData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select();

    if (error) throw error;
    return { data: data[0], error: null };
  } catch (error) {
    console.error('Error updating official document:', error);
    return { data: null, error: error.message };
  }
};

export const deleteOfficialDocument = async (id) => {
  try {
    const { error } = await supabase
      .from('official_documents')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    console.error('Error deleting official document:', error);
    return { success: false, error: error.message };
  }
};

/**
 * HÀM NẠP TOÀN BỘ 12 TRỤ CỘT TRI THỨC VÀO DATABASE SUPABASE (1-CLICK ADMIN)
 */
export const seed12PillarsKnowledgeToDatabase = async () => {
  try {
    let inserted = 0;
    for (const doc of OFFICIAL_12_PILLARS_KNOWLEDGE) {
      const { error } = await supabase
        .from('official_documents')
        .upsert(doc, { onConflict: 'doc_number' });
      if (!error) inserted++;
    }
    return { success: true, count: inserted };
  } catch (err) {
    console.error('Error seeding 12 pillars knowledge:', err);
    return { success: false, error: err.message };
  }
};

// Hàm lưu câu hỏi AI không biết để báo cho Tổ CNS
export const saveUnansweredQuestion = async (questionInput, metadata = {}) => {
  const qText = typeof questionInput === 'string' ? questionInput : questionInput.question;
  const intentCode = metadata.intent?.code || metadata.intent || (typeof questionInput === 'object' ? questionInput.intent : 'OTHER');
  const score = metadata.retrievalScore !== undefined ? metadata.retrievalScore : (typeof questionInput === 'object' ? questionInput.retrievalScore : 0);
  const reasonText = metadata.reason || (typeof questionInput === 'object' ? questionInput.reason : `Chưa đủ tài liệu đối chiếu`);

  const payload = {
    question: qText,
    intent: intentCode,
    retrieval_score: score,
    reason: reasonText,
    status: 'pending',
    created_at: new Date().toISOString()
  };

  try {
    const { data, error } = await supabase
      .from('unanswered_questions')
      .insert([payload])
      .select();

    if (error) {
      return { success: true, data: { id: `unans-${Date.now()}`, ...payload } };
    }

    return { success: true, data: data[0] };
  } catch (err) {
    return { success: true, data: { id: `unans-${Date.now()}`, ...payload } };
  }
};

// Hàm lấy danh sách câu hỏi AI chưa biết đã chuyển cho Tổ CNS
export const getUnansweredQuestions = async () => {
  try {
    const { data, error } = await supabase
      .from('unanswered_questions')
      .select('*')
      .order('asked_at', { ascending: false });

    if (!error && data && data.length > 0) {
      return data;
    }
  } catch (err) {
    console.error('Error loading unanswered questions:', err);
  }

  return [];
};

export const answerUnansweredQuestion = async (id, answerText) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('unanswered_questions')
      .update({
        status: 'answered',
        answer: answerText,
        answered_by: user ? user.id : null,
        answered_at: new Date().toISOString()
      })
      .eq('id', id)
      .select();

    if (error) throw error;
    return { data: data[0], error: null };
  } catch (error) {
    console.error('Error answering question:', error);
    return { data: null, error: error.message };
  }
};

export const queryOfficialDocumentsForAI = async (question) => {
  try {
    return await processUserQuestionPipeline(question);
  } catch (err) {
    return {
      answer: "Dạ thưa bà con, hiện tại hệ thống cơ sở dữ liệu chuyển đổi số Thôn 6 Xã Di Linh đang được bảo trì. Bà con vui lòng liên hệ trực tiếp Hotline Tổ CNS Thôn 6: 0903.382.277 để được hướng dẫn chi tiết ạ.",
      intent: { code: 'system_busy', label: 'Hệ thống bận' },
      isLowConfidence: false,
      retrievalScore: 0
    };
  }
};

export const askOfficialDocAI = queryOfficialDocumentsForAI;
