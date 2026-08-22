import { supabase } from './supabaseClient.js';
import { processUserQuestionPipeline } from './aiPipelineService.js';

/**
 * BỘ NÃO TRI THỨC 20 MỤC CHUẨN HÓA CỦA TRỢ LÝ SỐ THÔN 6 XÃ DI LINH (RAG GROUNDING KNOWLEDGE BASE)
 * Quy định số hiệu, cơ quan ban hành, tên văn bản và nội dung cốt lõi huấn luyện AI RAG
 */
export const OFFICIAL_20_PILLARS_KNOWLEDGE = [
  // MỤC 01 – HƯỚNG DẪN VNeID
  {
    doc_number: 'KB-T6-01/2026',
    title: 'Hướng dẫn người dân cài đặt, kích hoạt và sử dụng ứng dụng VNeID',
    issuing_body: 'Tổ Công nghệ số cộng đồng Thôn 6 – Xã Di Linh',
    issued_date: '2026-01-05',
    category: 'VNeID & Định danh điện tử',
    effect_status: 'Còn hiệu lực',
    source_url: 'https://dilinh.lamdong.gov.vn',
    content_summary: `VNeID là ứng dụng định danh điện tử phục vụ xác thực danh tính và sử dụng các tiện ích số. Khi người dân hỏi về VNeID, AI phải hướng dẫn ngắn gọn, từng bước và dễ hiểu.

Người dân nên tải VNeID từ kho ứng dụng chính thức trên điện thoại, không tải ứng dụng từ đường link lạ hoặc file cài đặt do người không rõ danh tính gửi.

Khi đăng nhập hoặc kích hoạt tài khoản, người dân tự thao tác trên thiết bị của mình. Không cung cấp mật khẩu, mã OTP, mã PIN hoặc thông tin đăng nhập cho người khác.

Nếu quên mật khẩu, sử dụng chức năng khôi phục mật khẩu của ứng dụng và thực hiện xác minh theo hướng dẫn trên màn hình.

Nếu không đăng nhập được, cần kiểm tra kết nối Internet, số điện thoại, phiên bản ứng dụng và thử lại. Nếu vẫn không xử lý được, người dân nên liên hệ cơ quan Công an hoặc điểm hỗ trợ chuyển đổi số tại địa phương.

AI không được tự suy đoán về hồ sơ, thời hạn, mức phí hoặc thủ tục khi chưa có nguồn thông tin chính thức.`
  },

  // MỤC 02 – PHÒNG TRÁNH LỪA ĐẢO TRỰC TUYẾN
  {
    doc_number: 'KB-T6-02/2026',
    title: 'Hướng dẫn nhận biết và phòng tránh các hình thức lừa đảo trên không gian mạng',
    issuing_body: 'Tổ Công nghệ số cộng đồng Thôn 6 – Xã Di Linh',
    issued_date: '2026-01-08',
    category: 'Phòng chống lừa đảo trực tuyến',
    effect_status: 'Còn hiệu lực',
    source_url: 'https://dilinh.lamdong.gov.vn',
    content_summary: `Người dân cần cảnh giác với cuộc gọi, tin nhắn hoặc tài khoản mạng xã hội tự xưng là Công an, Tòa án, ngân hàng, cơ quan nhà nước hoặc người quen để yêu cầu chuyển tiền, cung cấp mật khẩu, mã OTP hoặc cài ứng dụng lạ.

Không chuyển tiền chỉ dựa trên yêu cầu qua điện thoại hoặc mạng xã hội. Khi người quen nhắn tin vay tiền hoặc nhờ chuyển khoản, cần gọi điện trực tiếp để xác minh.

Không bấm vào đường link lạ, không cài file APK hoặc ứng dụng không rõ nguồn gốc.

Không chia sẻ OTP, mật khẩu ngân hàng, mã PIN, mật khẩu VNeID hoặc thông tin đăng nhập.

Nếu nghi ngờ bị lừa đảo, cần dừng giao dịch, lưu lại bằng chứng và liên hệ ngân hàng hoặc cơ quan Công an để được hướng dẫn.

AI chỉ hướng dẫn biện pháp phòng tránh, không được tự kết luận một cá nhân hay tổ chức cụ thể là lừa đảo khi chưa có kết luận của cơ quan có thẩm quyền.`
  },

  // MỤC 03 – HỖ TRỢ NGƯỜI CAO TUỔI SỬ DỤNG CÔNG NGHỆ
  {
    doc_number: 'KB-T6-03/2026',
    title: 'Hướng dẫn hỗ trợ người cao tuổi tiếp cận điện thoại thông minh và dịch vụ số',
    issuing_body: 'Tổ Công nghệ số cộng đồng Thôn 6 – Xã Di Linh',
    issued_date: '2026-01-10',
    category: 'Hỗ trợ người cao tuổi',
    effect_status: 'Còn hiệu lực',
    source_url: 'https://dilinh.lamdong.gov.vn',
    content_summary: `Khi hướng dẫn người cao tuổi, AI phải sử dụng câu ngắn, từ dễ hiểu và chia thao tác thành từng bước.

Các nội dung ưu tiên gồm: gọi điện, nhắn tin, sử dụng Zalo, quét mã QR, VNeID, dịch vụ công, tra cứu thông tin và nhận biết lừa đảo.

Không hướng dẫn người cao tuổi đưa mật khẩu, OTP hoặc tài khoản ngân hàng cho người khác.

Khi cần thao tác nhạy cảm, nên để chính người dân thực hiện trên điện thoại của mình.

Nếu người dân chưa hiểu một thao tác liên quan đến tiền hoặc thông tin cá nhân, cần dừng và giải thích rõ trước khi tiếp tục.`
  },

  // MỤC 04 – DỊCH VỤ CÔNG TRỰC TUYẾN
  {
    doc_number: 'KB-T6-04/2026',
    title: 'Hướng dẫn người dân tiếp cận và sử dụng dịch vụ công trực tuyến',
    issuing_body: 'Tổ Công nghệ số cộng đồng Thôn 6 – Xã Di Linh',
    issued_date: '2026-01-12',
    category: 'Dịch vụ công trực tuyến',
    effect_status: 'Còn hiệu lực',
    source_url: 'https://dichvucong.gov.vn',
    content_summary: `Dịch vụ công trực tuyến giúp người dân thực hiện một số thủ tục hành chính qua môi trường mạng.

Khi người dân cần thực hiện thủ tục, AI cần hỏi rõ loại thủ tục trước khi hướng dẫn.

AI có thể hướng dẫn các bước chung: chuẩn bị giấy tờ, truy cập cổng dịch vụ công phù hợp, đăng nhập, chọn thủ tục, điền thông tin, tải tài liệu và theo dõi trạng thái hồ sơ.

Đối với thành phần hồ sơ, mức phí, lệ phí, thời gian giải quyết hoặc cơ quan tiếp nhận, AI chỉ được trả lời khi có dữ liệu chính thức trong hệ thống.

Nếu chưa có thông tin chính xác, AI phải hướng dẫn người dân kiểm tra trên cổng dịch vụ công hoặc liên hệ bộ phận tiếp nhận hồ sơ của cơ quan có thẩm quyền.`
  },

  // MỤC 05 – QUÉT MÃ QR AN TOÀN
  {
    doc_number: 'KB-T6-05/2026',
    title: 'Hướng dẫn sử dụng và quét mã QR an toàn',
    issuing_body: 'Tổ Công nghệ số cộng đồng Thôn 6 – Xã Di Linh',
    issued_date: '2026-01-15',
    category: 'Quét mã QR an toàn',
    effect_status: 'Còn hiệu lực',
    source_url: 'https://dilinh.lamdong.gov.vn',
    content_summary: `Mã QR có thể dùng để mở trang thông tin, tài liệu, bản đồ, biểu mẫu hoặc thực hiện thanh toán.

Trước khi tiếp tục sau khi quét QR, người dân cần kiểm tra tên trang web hoặc thông tin người nhận.

Không quét hoặc làm theo mã QR dán đè, mã QR không rõ nguồn gốc hoặc mã được gửi bởi người lạ.

Khi thanh toán, phải kiểm tra đúng tên người nhận và số tiền trước khi xác nhận.

Không nhập mật khẩu ngân hàng, OTP hoặc thông tin nhạy cảm trên trang web đáng ngờ.`
  },

  // MỤC 06 – THANH TOÁN KHÔNG DÙNG TIỀN MẶT
  {
    doc_number: 'KB-T6-06/2026',
    title: 'Hướng dẫn người dân thanh toán điện tử an toàn',
    issuing_body: 'Tổ Công nghệ số cộng đồng Thôn 6 – Xã Di Linh',
    issued_date: '2026-01-18',
    category: 'Thanh toán không dùng tiền mặt',
    effect_status: 'Còn hiệu lực',
    source_url: 'https://dilinh.lamdong.gov.vn',
    content_summary: `Người dân có thể sử dụng ứng dụng ngân hàng hoặc phương thức thanh toán điện tử phù hợp để thanh toán.

Trước khi chuyển tiền phải kiểm tra tên người nhận, số tài khoản hoặc mã QR và số tiền.

Không chia sẻ mật khẩu, mã PIN hoặc OTP.

Không cho người khác điều khiển điện thoại từ xa để thực hiện giao dịch.

Khi chuyển nhầm tiền hoặc phát hiện giao dịch bất thường, cần liên hệ ngân hàng càng sớm càng tốt.

AI không được yêu cầu người dân cung cấp số tài khoản đầy đủ, mật khẩu, OTP hoặc thông tin bảo mật ngân hàng.`
  },

  // MỤC 07 – BẢO VỆ THÔNG TIN CÁ NHÂN
  {
    doc_number: 'KB-T6-07/2026',
    title: 'Hướng dẫn bảo vệ thông tin cá nhân trong môi trường số',
    issuing_body: 'Tổ Công nghệ số cộng đồng Thôn 6 – Xã Di Linh',
    issued_date: '2026-01-20',
    category: 'Bảo vệ thông tin cá nhân',
    effect_status: 'Còn hiệu lực',
    source_url: 'https://dilinh.lamdong.gov.vn',
    content_summary: `Người dân không nên công khai tùy tiện ảnh giấy tờ tùy thân, mật khẩu, mã OTP, thông tin tài khoản ngân hàng và dữ liệu cá nhân nhạy cảm.

Nên sử dụng mật khẩu khó đoán và không dùng cùng một mật khẩu cho nhiều tài khoản quan trọng.

Không đưa mật khẩu cho người hỗ trợ kỹ thuật.

Cần đăng xuất tài khoản khi sử dụng thiết bị công cộng hoặc thiết bị của người khác.

Khi mất điện thoại, cần nhanh chóng bảo vệ các tài khoản quan trọng và liên hệ nhà cung cấp dịch vụ khi cần thiết.

AI phải hạn chế yêu cầu người dân cung cấp dữ liệu cá nhân không cần thiết.`
  },

  // MỤC 08 – NHẬN BIẾT TIN GIẢ
  {
    doc_number: 'KB-T6-08/2026',
    title: 'Hướng dẫn nhận biết và xử lý thông tin chưa được kiểm chứng trên mạng xã hội',
    issuing_body: 'Tổ Công nghệ số cộng đồng Thôn 6 – Xã Di Linh',
    issued_date: '2026-01-22',
    category: 'Nhận biết tin giả & Tin xấu độc',
    effect_status: 'Còn hiệu lực',
    source_url: 'https://dilinh.lamdong.gov.vn',
    content_summary: `Không nên chia sẻ ngay các thông tin gây hoang mang, giật gân hoặc chưa rõ nguồn.

Cần kiểm tra nguồn đăng, thời gian đăng và xem thông tin có được cơ quan chính thức xác nhận hay không.

Ảnh và video trên mạng có thể bị cắt ghép hoặc sử dụng sai bối cảnh.

Khi chưa kiểm chứng được, người dân không nên tiếp tục phát tán.

AI phải phân biệt rõ giữa thông tin chính thức, thông tin tham khảo và thông tin chưa xác minh.`
  },

  // MỤC 09 – PHẢN ÁNH, KIẾN NGHỊ CỦA NGƯỜI DÂN
  {
    doc_number: 'KB-T6-09/2026',
    title: 'Hướng dẫn tiếp nhận phản ánh và kiến nghị của người dân',
    issuing_body: 'Thôn 6 – Xã Di Linh',
    issued_date: '2026-01-25',
    category: 'Phản ánh kiến nghị của người dân',
    effect_status: 'Còn hiệu lực',
    source_url: 'https://dilinh.lamdong.gov.vn',
    content_summary: `Người dân có thể gửi phản ánh về môi trường, đường giao thông, an ninh, điện, nước, hạ tầng hoặc các vấn đề cộng đồng.

Nội dung phản ánh nên mô tả rõ sự việc, thời gian, khu vực và hình ảnh nếu có.

AI cần phân loại phản ánh theo nhóm để hỗ trợ chuyển đến bộ phận phù hợp.

AI không được hứa chắc thời gian xử lý nếu chưa có thông tin từ cơ quan tiếp nhận.

Các trạng thái có thể sử dụng trong hệ thống gồm: mới tiếp nhận, đang xử lý, đã xử lý và cần bổ sung thông tin.`
  },

  // MỤC 10 – VỆ SINH MÔI TRƯỜNG
  {
    doc_number: 'KB-T6-10/2026',
    title: 'Hướng dẫn giữ gìn vệ sinh và bảo vệ môi trường cộng đồng',
    issuing_body: 'Thôn 6 – Xã Di Linh',
    issued_date: '2026-01-28',
    category: 'Vệ sinh môi trường',
    effect_status: 'Còn hiệu lực',
    source_url: 'https://dilinh.lamdong.gov.vn',
    content_summary: `Người dân cần giữ gìn vệ sinh khu dân cư, không xả rác bừa bãi và thực hiện thu gom rác theo hướng dẫn của địa phương.

Khuyến khích giảm sử dụng đồ nhựa dùng một lần và giữ sạch khu vực trước nhà.

Khi phát hiện điểm tập kết rác không phù hợp hoặc vấn đề môi trường ảnh hưởng cộng đồng, người dân có thể phản ánh để địa phương kiểm tra.

Không tự ý đốt các loại rác có nguy cơ gây ô nhiễm hoặc mất an toàn.

AI cần ưu tiên các giải pháp bảo vệ sức khỏe, cảnh quan và môi trường cộng đồng.`
  },

  // MỤC 11 – AN TOÀN GIAO THÔNG
  {
    doc_number: 'KB-T6-11/2026',
    title: 'Khuyến nghị bảo đảm an toàn giao thông trong khu dân cư',
    issuing_body: 'Thôn 6 – Xã Di Linh',
    issued_date: '2026-02-01',
    category: 'An toàn giao thông',
    effect_status: 'Còn hiệu lực',
    source_url: 'https://dilinh.lamdong.gov.vn',
    content_summary: `Người dân cần tuân thủ quy định giao thông, đội mũ bảo hiểm khi đi mô tô hoặc xe máy và không điều khiển phương tiện sau khi sử dụng rượu bia.

Phụ huynh cần quan tâm đến an toàn giao thông của trẻ em và học sinh.

Khi đi qua khu dân cư, trường học hoặc khu vực đông người cần giảm tốc độ và chú ý quan sát.

Nếu phát hiện điểm giao thông có nguy cơ mất an toàn, người dân có thể phản ánh cho địa phương.

AI không được hướng dẫn hành vi né tránh kiểm tra hoặc vi phạm quy định giao thông.`
  },

  // MỤC 12 – PHÒNG CHÁY CHỮA CHÁY GIA ĐÌNH
  {
    doc_number: 'KB-T6-12/2026',
    title: 'Hướng dẫn nâng cao ý thức phòng cháy chữa cháy trong hộ gia đình',
    issuing_body: 'Thôn 6 – Xã Di Linh',
    issued_date: '2026-02-03',
    category: 'Phòng cháy chữa cháy gia đình',
    effect_status: 'Còn hiệu lực',
    source_url: 'https://dilinh.lamdong.gov.vn',
    content_summary: `Người dân cần kiểm tra hệ thống điện, thiết bị sinh nhiệt và nguồn lửa trong gia đình.

Không để vật liệu dễ cháy sát bếp, ổ điện hoặc thiết bị tỏa nhiệt.

Khi ra khỏi nhà cần kiểm tra các thiết bị có nguy cơ gây cháy.

Không cản trở lối thoát nạn.

Nếu phát hiện cháy, ưu tiên cảnh báo mọi người, di chuyển đến nơi an toàn và liên hệ lực lượng chức năng.

AI không hướng dẫn người dân tự xử lý đám cháy lớn hoặc tình huống vượt quá khả năng an toàn.`
  },

  // MỤC 13 – PHÒNG CHỐNG THIÊN TAI VÀ THỜI TIẾT NGUY HIỂM
  {
    doc_number: 'KB-T6-13/2026',
    title: 'Khuyến nghị chủ động ứng phó mưa lớn, giông, sét và thời tiết nguy hiểm',
    issuing_body: 'Thôn 6 – Xã Di Linh',
    issued_date: '2026-02-05',
    category: 'Phòng chống thiên tai & Thời tiết nguy hiểm',
    effect_status: 'Còn hiệu lực',
    source_url: 'https://dilinh.lamdong.gov.vn',
    content_summary: `Người dân cần theo dõi dự báo và cảnh báo thời tiết từ các nguồn đáng tin cậy.

Khi xảy ra mưa lớn, giông sét hoặc gió mạnh, nên hạn chế đi lại ở khu vực nguy hiểm.

Không trú dưới cây cao khi có giông sét.

Cần kiểm tra mái nhà, cây cối, hệ thống thoát nước và khu vực có nguy cơ mất an toàn.

Khi có cảnh báo chính thức của địa phương, người dân cần thực hiện theo hướng dẫn của cơ quan chức năng.

AI không được tự đưa ra cảnh báo thiên tai như một nguồn chính thức nếu chưa có dữ liệu xác nhận.`
  },

  // MỤC 14 – THÔNG TIN GIÁ NÔNG SẢN
  {
    doc_number: 'KB-T6-14/2026',
    title: 'Nguyên tắc cung cấp thông tin giá nông sản cho người dân',
    issuing_body: 'Tổ Công nghệ số cộng đồng Thôn 6 – Xã Di Linh',
    issued_date: '2026-02-08',
    category: 'Thông tin giá nông sản',
    effect_status: 'Còn hiệu lực',
    source_url: 'https://dilinh.lamdong.gov.vn',
    content_summary: `Giá nông sản có thể thay đổi theo thời gian, chất lượng sản phẩm, khu vực và đơn vị thu mua.

Khi cung cấp giá, AI phải nêu rõ thời điểm cập nhật và nguồn dữ liệu nếu có.

Không được khẳng định giá tham khảo là mức giá bắt buộc hoặc chắc chắn được thương lái thu mua.

Nếu dữ liệu đã cũ, AI phải thông báo cho người dân biết.

Khuyến khích người dân tham khảo nhiều nguồn trước khi quyết định mua bán.`
  },

  // MỤC 15 – KIẾN THỨC NÔNG NGHIỆP SỐ
  {
    doc_number: 'KB-T6-15/2026',
    title: 'Hướng dẫn người dân ứng dụng công nghệ số trong sản xuất nông nghiệp',
    issuing_body: 'Tổ Công nghệ số cộng đồng Thôn 6 – Xã Di Linh',
    issued_date: '2026-02-10',
    category: 'Kiến thức nông nghiệp số',
    effect_status: 'Còn hiệu lực',
    source_url: 'https://dilinh.lamdong.gov.vn',
    content_summary: `Người dân có thể sử dụng điện thoại để theo dõi thời tiết, ghi chép sản xuất, chụp ảnh tình trạng cây trồng, lưu lịch chăm sóc và tìm hiểu thông tin thị trường.

Thông tin kỹ thuật nông nghiệp trên Internet cần được kiểm tra nguồn trước khi áp dụng.

AI có thể cung cấp kiến thức phổ thông nhưng không thay thế chuyên gia nông nghiệp trong các tình huống bệnh cây, sử dụng hóa chất hoặc vấn đề có nguy cơ gây thiệt hại lớn.

Không hướng dẫn sử dụng thuốc, hóa chất hoặc liều lượng khi không có nguồn chuyên môn đáng tin cậy.`
  },

  // MỤC 16 – HOẠT ĐỘNG CỘNG ĐỒNG THÔN 6
  {
    doc_number: 'KB-T6-16/2026',
    title: 'Nguyên tắc thông tin các hoạt động cộng đồng tại Thôn 6',
    issuing_body: 'Thôn 6 – Xã Di Linh',
    issued_date: '2026-02-12',
    category: 'Hoạt động cộng đồng Thôn 6',
    effect_status: 'Còn hiệu lực',
    source_url: 'https://dilinh.lamdong.gov.vn',
    content_summary: `Hệ thống có thể thông tin các hoạt động như họp dân, vệ sinh môi trường, hoạt động văn hóa, thể thao, hỗ trợ chuyển đổi số và các chương trình cộng đồng.

Khi người dân hỏi lịch hoạt động, AI phải ưu tiên dữ liệu mới nhất trong cơ sở dữ liệu.

Nếu chưa có lịch chính thức, AI không tự tạo ngày, giờ hoặc địa điểm.

AI có thể hướng dẫn người dân theo dõi mục Bản tin và Hoạt động cộng đồng trên website để cập nhật thông tin.`
  },

  // MỤC 17 – THÔNG BÁO VÀ BẢN TIN THÔN 6
  {
    doc_number: 'KB-T6-17/2026',
    title: 'Quy tắc cung cấp thông báo và bản tin cho người dân',
    issuing_body: 'Thôn 6 – Xã Di Linh',
    issued_date: '2026-02-15',
    category: 'Thông báo & Bản tin Thôn 6',
    effect_status: 'Còn hiệu lực',
    source_url: 'https://dilinh.lamdong.gov.vn',
    content_summary: `AI phải ưu tiên các thông báo mới nhất đã được đăng chính thức trên hệ thống.

Khi trả lời, nên nêu tiêu đề, nội dung chính, thời gian và đơn vị thông báo nếu dữ liệu có.

Nếu có nhiều bản tin cùng chủ đề, ưu tiên bản mới hơn.

Không sử dụng thông tin đã hết hiệu lực để hướng dẫn người dân như thông tin hiện hành.

Nếu không tìm thấy thông báo phù hợp, AI cần nói rõ chưa có dữ liệu thay vì tự suy đoán.`
  },

  // MỤC 18 – CHĂM SÓC SỨC KHỎE VÀ THÔNG TIN Y TẾ
  {
    doc_number: 'KB-T6-18/2026',
    title: 'Nguyên tắc hỗ trợ người dân tra cứu thông tin sức khỏe trên hệ thống cộng đồng',
    issuing_body: 'Thôn 6 – Xã Di Linh',
    issued_date: '2026-02-17',
    category: 'Chăm sóc sức khỏe & Y tế',
    effect_status: 'Còn hiệu lực',
    source_url: 'https://dilinh.lamdong.gov.vn',
    content_summary: `AI chỉ cung cấp kiến thức sức khỏe phổ thông và khuyến nghị người dân tìm cơ sở y tế khi cần.

AI không được tự chẩn đoán bệnh, tự kê đơn hoặc yêu cầu người dân ngừng thuốc đã được bác sĩ chỉ định.

Khi có dấu hiệu nguy hiểm hoặc tình trạng sức khỏe nghiêm trọng, cần khuyến nghị người dân tìm sự hỗ trợ y tế trực tiếp.

Các thông tin về lịch khám, tiêm chủng hoặc chương trình y tế tại địa phương chỉ được cung cấp khi có dữ liệu chính thức trong hệ thống.

Không thu thập thông tin sức khỏe cá nhân nếu không cần thiết.`
  },

  // MỤC 19 – HỖ TRỢ HỌC TẬP VÀ KỸ NĂNG SỐ
  {
    doc_number: 'KB-T6-19/2026',
    title: 'Hướng dẫn khai thác kho tài nguyên học tập và kỹ năng số cộng đồng',
    issuing_body: 'Tổ Công nghệ số cộng đồng Thôn 6 – Xã Di Linh',
    issued_date: '2026-02-19',
    category: 'Hỗ trợ học tập & Kỹ năng số',
    effect_status: 'Còn hiệu lực',
    source_url: 'https://dilinh.lamdong.gov.vn',
    content_summary: `Kho học tập có thể bao gồm video hướng dẫn, infographic, tài liệu PDF, âm thanh và các nội dung phổ cập kỹ năng số.

Khi người dân hỏi cách thực hiện một kỹ năng, AI nên ưu tiên giới thiệu tài nguyên phù hợp đang có trong cơ sở dữ liệu.

Nội dung hướng dẫn phải dễ hiểu, đặc biệt với người lớn tuổi hoặc người mới sử dụng công nghệ.

AI không được tạo đường dẫn tài liệu không tồn tại.

Nếu hệ thống chưa có tài nguyên phù hợp, AI có thể hướng dẫn kiến thức cơ bản và đề nghị người dân theo dõi khi tài liệu được cập nhật.`
  },

  // MỤC 20 – QUY TẮC HOẠT ĐỘNG CỦA TRỢ LÝ AI THÔN 6
  {
    doc_number: 'KB-T6-20/2026',
    title: 'Quy tắc trả lời và sử dụng nguồn tri thức của Trợ lý AI cộng đồng Thôn 6',
    issuing_body: 'Tổ Công nghệ số cộng đồng Thôn 6 – Xã Di Linh',
    issued_date: '2026-02-20',
    category: 'Quy tắc hoạt động của Trợ lý AI Thôn 6',
    effect_status: 'Còn hiệu lực',
    source_url: 'https://dilinh.lamdong.gov.vn',
    content_summary: `Trợ lý AI Thôn 6 có nhiệm vụ hỗ trợ người dân tìm kiếm thông tin, hướng dẫn kỹ năng số, tra cứu bản tin, hoạt động cộng đồng, tài liệu và các nội dung đã được lưu trong cơ sở dữ liệu.

AI phải ưu tiên nguồn dữ liệu của Thôn 6 và các tài liệu chính thức đã được nạp vào hệ thống.

Khi trả lời cần sử dụng ngôn ngữ tiếng Việt rõ ràng, lịch sự, dễ hiểu và hạn chế thuật ngữ chuyên môn.

Nếu người hỏi là người cao tuổi hoặc người ít sử dụng công nghệ, cần hướng dẫn từng bước.

AI tuyệt đối không được tự tạo số hiệu văn bản, tên cán bộ, số điện thoại, địa chỉ, lịch họp, giá nông sản, chính sách, mức hỗ trợ hoặc thời hạn thủ tục khi dữ liệu không có.

Nếu không đủ thông tin, AI phải nói rõ: “Hiện hệ thống chưa có đủ thông tin để trả lời chính xác. Bạn vui lòng kiểm tra thông báo chính thức hoặc liên hệ cơ quan có thẩm quyền.”

AI không được yêu cầu người dân cung cấp mật khẩu, mã OTP, mã PIN ngân hàng hoặc thông tin bảo mật.

Đối với nội dung pháp luật, y tế, tài chính, an ninh hoặc thủ tục hành chính, AI chỉ đóng vai trò hỗ trợ tra cứu và không thay thế cơ quan chuyên môn.

Khi có nhiều nguồn thông tin khác nhau, ưu tiên nguồn chính thức và nguồn có ngày cập nhật mới nhất.

Mục tiêu của AI là giúp người dân Thôn 6 tiếp cận thông tin nhanh hơn, dễ hiểu hơn, an toàn hơn và thuận tiện hơn trong quá trình chuyển đổi số.`
  }
];

export const getOfficialDocuments = async (categoryFilter = 'all') => {
  try {
    let query = supabase
      .from('official_documents')
      .select('*')
      .order('doc_number', { ascending: true });

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

  let fallback = OFFICIAL_20_PILLARS_KNOWLEDGE;
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
      category: docData.category || 'VNeID & Định danh điện tử',
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
 * HÀM NẠP TOÀN BỘ 20 MỤC TRI THỨC VÀO DATABASE SUPABASE (1-CLICK ADMIN)
 */
export const seed12PillarsKnowledgeToDatabase = async () => {
  try {
    let inserted = 0;
    for (const doc of OFFICIAL_20_PILLARS_KNOWLEDGE) {
      const { error } = await supabase
        .from('official_documents')
        .upsert(doc, { onConflict: 'doc_number' });
      if (!error) inserted++;
    }
    return { success: true, count: inserted };
  } catch (err) {
    console.error('Error seeding 20 pillars knowledge:', err);
    return { success: false, error: err.message };
  }
};

export const seed20PillarsKnowledgeToDatabase = seed12PillarsKnowledgeToDatabase;

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
