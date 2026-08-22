/**
 * AI ACTION ROUTING SERVICE
 * 
 * Tự động phân tích câu hỏi người dân, phản hồi của AI và Intent để
 * tạo danh sách các Nút Chức Năng (Action Buttons) chuyển hướng trực tiếp
 * tới các trang/mục/modal của Website Thôn 6 Xã Di Linh.
 */

export const ACTION_TYPES = {
  TAB: 'tab',
  MODAL: 'modal',
  RESOURCE: 'resource',
  CALL: 'call',
  LINK: 'link',
  INTERNAL_TAB: 'internal_tab'
};

export const extractSuggestedActions = ({
  text = '',
  intent = null,
  isUnknown = false,
  needHuman = false,
  doc = null
}) => {
  const actions = [];
  const normalizedText = (text || '').toLowerCase();
  let intentCode = '';
  if (intent && typeof intent === 'object') {
    intentCode = String(intent.code || '').toUpperCase();
  } else if (typeof intent === 'string') {
    intentCode = intent.toUpperCase();
  }

  // 1. TRƯỜNG HỢP CÂU HỎI CHƯA BIẾT / CẦN TỔ CNS RÀ SOÁT
  if (isUnknown || needHuman || normalizedText.includes('báo cho tổ công nghệ số') || normalizedText.includes('chưa tìm thấy văn bản') || normalizedText.includes('không đủ thông tin')) {
    actions.push({
      id: 'action-unanswered-tab',
      label: '📋 Xem Báo Cáo Tổ CNS',
      sublabel: 'Xem danh sách câu hỏi đang chờ xử lý',
      type: ACTION_TYPES.INTERNAL_TAB,
      target: 'unanswered',
      color: 'from-amber-500 to-orange-500 text-slate-950',
      badge: 'Tab AI'
    });

    actions.push({
      id: 'action-need-help-direct',
      label: '🆘 Bác Cần Hỗ Trợ Số Tại Nhà',
      sublabel: 'Nhờ tình nguyện viên đến tận nhà chỉ dẫn',
      type: ACTION_TYPES.MODAL,
      target: 'need_help',
      color: 'from-red-600 to-rose-600 text-white',
      badge: 'Trang Hỗ Trợ'
    });

    actions.push({
      id: 'action-call-hotline',
      label: '📞 Gọi Hotline 0903.382.277',
      sublabel: 'Tổ trưởng Tổ CNS Thôn 6',
      type: ACTION_TYPES.CALL,
      target: 'tel:0903382277',
      color: 'from-emerald-600 to-teal-600 text-white',
      badge: 'Gọi Ngay'
    });

    return actions;
  }

  // 2. PHÂN TÍCH THEO INTENT & NỘI DUNG

  // 2.1 VNEID & ĐỊNH DANH ĐIỆN TỬ
  if (intentCode === 'VNEID' || normalizedText.includes('vneid') || normalizedText.includes('định danh') || normalizedText.includes('cccd')) {
    actions.push({
      id: 'action-vneid-video',
      label: '🎥 Xem Video Cài VNeID Mức 2',
      sublabel: 'Bài học video cầm tay chỉ việc trên điện thoại',
      type: ACTION_TYPES.RESOURCE,
      target: 'help-video-vneid',
      color: 'from-blue-600 to-indigo-600 text-white',
      badge: 'Tôi Muốn Học'
    });

    actions.push({
      id: 'action-vneid-help',
      label: '🆘 Nhờ Hỗ Trợ Kích Hoạt VNeID',
      sublabel: 'Tổ CNS đến nhà hỗ trợ kích hoạt Mức 2',
      type: ACTION_TYPES.MODAL,
      target: 'need_help',
      color: 'from-red-600 to-rose-600 text-white',
      badge: 'Tôi Cần Hỗ Trợ'
    });

    actions.push({
      id: 'action-official-doc-vneid',
      label: '🏛️ Tra Cứu Văn Bản Đề Án 06',
      sublabel: 'Các quyết định chỉ đạo của UBND Di Linh',
      type: ACTION_TYPES.TAB,
      target: 'official',
      color: 'from-indigo-600 to-purple-600 text-white',
      badge: 'Văn Bản Số'
    });
  }

  // 2.2 CẢNH BÁO LỪA ĐẢO & AN TOÀN MẠNG
  else if (intentCode === 'SCAM' || intentCode === 'CYBER_SECURITY' || normalizedText.includes('lừa đảo') || normalizedText.includes('giả danh') || normalizedText.includes('otp') || normalizedText.includes('mất tiền')) {
    actions.push({
      id: 'action-scam-help',
      label: '🆘 Báo Cáo Sự Cố & Cần Giúp Đỡ',
      sublabel: 'Gửi yêu cầu khẩn cho Tổ CNS Thôn 6',
      type: ACTION_TYPES.MODAL,
      target: 'need_help',
      color: 'from-red-600 to-rose-600 text-white',
      badge: 'Khẩn Cấp'
    });

    actions.push({
      id: 'action-scam-call',
      label: '📞 Gọi Hotline Khẩn Cấp (0903.382.277)',
      sublabel: 'Tổ trưởng CNS hỗ trợ ngăn chặn lừa đảo',
      type: ACTION_TYPES.CALL,
      target: 'tel:0903382277',
      color: 'from-emerald-600 to-teal-600 text-white',
      badge: 'Hotline 24/7'
    });

    actions.push({
      id: 'action-scam-video',
      label: '🎥 Xem Video Kỹ Năng Phòng Tránh',
      sublabel: 'Kho bài học video an toàn mạng Thôn 6',
      type: ACTION_TYPES.TAB,
      target: 'video',
      color: 'from-blue-600 to-indigo-600 text-white',
      badge: 'Tôi Muốn Học'
    });
  }

  // 2.3 QUÉT MÃ QR & BHYT & THANH TOÁN
  else if (intentCode === 'QR_CODE' || normalizedText.includes('qr') || normalizedText.includes('bhyt') || normalizedText.includes('thanh toán')) {
    actions.push({
      id: 'action-qr-video',
      label: '🎥 Xem Video Hướng Dẫn Quét QR',
      sublabel: 'Hướng dẫn quét QR BHYT, Điện nước & Zalo',
      type: ACTION_TYPES.TAB,
      target: 'video',
      color: 'from-blue-600 to-indigo-600 text-white',
      badge: 'Tôi Muốn Học'
    });

    actions.push({
      id: 'action-qr-help',
      label: '🆘 Nhờ Hướng Dẫn Quét QR Tại Nhà',
      sublabel: 'Tình nguyện viên tới nhà cầm tay chỉ việc',
      type: ACTION_TYPES.MODAL,
      target: 'need_help',
      color: 'from-red-600 to-rose-600 text-white',
      badge: 'Tôi Cần Hỗ Trợ'
    });

    actions.push({
      id: 'action-skills-check',
      label: '🪪 Đánh Giá Kỹ Năng Quét QR',
      sublabel: 'Tự tích điểm vào Hộ Chiếu Kỹ Năng Số',
      type: ACTION_TYPES.MODAL,
      target: 'my_skills',
      color: 'from-amber-600 to-orange-600 text-white',
      badge: 'Kỹ Năng Của Tôi'
    });
  }

  // 2.4 DỊCH VỤ CÔNG & THỦ TỤC HÀNH CHÍNH
  else if (intentCode === 'PUBLIC_SERVICE' || intentCode === 'ADMIN_PROCEDURE' || intentCode === 'PROJECT_06' || normalizedText.includes('thủ tục') || normalizedText.includes('dịch vụ công') || normalizedText.includes('hành chính') || normalizedText.includes('khai sinh')) {
    actions.push({
      id: 'action-official-tab',
      label: '🏛️ Xem Nguồn Văn Bản Chính Thống',
      sublabel: 'Quy trình, quyết định hành chính xã Di Linh',
      type: ACTION_TYPES.TAB,
      target: 'official',
      color: 'from-indigo-600 to-purple-700 text-white',
      badge: 'Văn Bản Số'
    });

    actions.push({
      id: 'action-dvc-help',
      label: '🆘 Nhờ Tổ CNS Nộp Hồ Sơ Giúp',
      sublabel: 'Đăng ký hỗ trợ thủ tục dịch vụ công tại nhà',
      type: ACTION_TYPES.MODAL,
      target: 'need_help',
      color: 'from-red-600 to-rose-600 text-white',
      badge: 'Tôi Cần Hỗ Trợ'
    });

    actions.push({
      id: 'action-dvc-external',
      label: '🌐 Vào Cổng TTĐT dilinh.lamdong.gov.vn',
      sublabel: 'Nộp hồ sơ trực tuyến huyện Di Linh',
      type: ACTION_TYPES.LINK,
      target: 'https://dilinh.lamdong.gov.vn/',
      color: 'from-emerald-600 to-teal-600 text-white',
      badge: 'Cổng TTĐT'
    });
  }

  // 2.5 KỸ NĂNG SỐ / ZALO / HỌC CÔNG NGHỆ
  else if (intentCode === 'DIGITAL_SKILLS' || normalizedText.includes('zalo') || normalizedText.includes('kỹ năng') || normalizedText.includes('gọi video') || normalizedText.includes('bài học')) {
    actions.push({
      id: 'action-zalo-video',
      label: '🎥 Xem Video Hướng Dẫn Zalo',
      sublabel: 'Video gọi video, đọc tin tức thôn trên Zalo',
      type: ACTION_TYPES.RESOURCE,
      target: 'help-video-zalo',
      color: 'from-blue-600 to-indigo-600 text-white',
      badge: 'Tôi Muốn Học'
    });

    actions.push({
      id: 'action-skills-modal',
      label: '🪪 Mở Hộ Chiếu Kỹ Năng Của Tôi',
      sublabel: 'Ghi nhận và tích điểm thành thạo kỹ năng',
      type: ACTION_TYPES.MODAL,
      target: 'my_skills',
      color: 'from-amber-600 to-orange-600 text-white',
      badge: 'Kỹ Năng Của Tôi'
    });

    actions.push({
      id: 'action-skills-help',
      label: '🆘 Bác Cần Hỗ Trợ Số Tại Nhà',
      sublabel: 'Tổ CNS tới tận nhà cầm tay chỉ việc',
      type: ACTION_TYPES.MODAL,
      target: 'need_help',
      color: 'from-red-600 to-rose-600 text-white',
      badge: 'Tôi Cần Hỗ Trợ'
    });
  }

  // 2.6 MÔ HÌNH HỌC TẬP & CÁCH LÀM HAY
  else if (normalizedText.includes('mô hình') || normalizedText.includes('cách làm hay') || normalizedText.includes('kinh nghiệm') || normalizedText.includes('sáng kiến')) {
    actions.push({
      id: 'action-models-tab',
      label: '💡 Xem Mô Hình Học Tập Số',
      sublabel: 'Cách làm hay từ chính bà con Thôn 6',
      type: ACTION_TYPES.TAB,
      target: 'models',
      color: 'from-amber-600 to-orange-600 text-white',
      badge: 'Mô Hình Học Tập'
    });

    actions.push({
      id: 'action-upload-model',
      label: '✨ Gửi Cách Làm Hay Của Tôi',
      sublabel: 'Đóng góp mô hình mới có AI biên tập 4 bước',
      type: ACTION_TYPES.MODAL,
      target: 'upload_model',
      color: 'from-blue-600 to-indigo-600 text-white',
      badge: 'Đóng Góp'
    });
  }

  // 2.7 HOẠT ĐỘNG LAN TỎA & TÌNH NGUYỆN VIÊN
  else if (normalizedText.includes('lan tỏa') || normalizedText.includes('tình nguyện') || normalizedText.includes('tôi có thể giúp') || normalizedText.includes('kết quả')) {
    actions.push({
      id: 'action-activities-tab',
      label: '🌱 Xem Nhật Ký Hoạt Động Lan Tỏa',
      sublabel: 'Kết quả số hóa cộng đồng Thôn 6',
      type: ACTION_TYPES.TAB,
      target: 'activities',
      color: 'from-teal-600 to-emerald-700 text-white',
      badge: 'Hoạt Động Lan Tỏa'
    });

    actions.push({
      id: 'action-upload-activity',
      label: '🤝 Đăng Báo Cáo Lan Tỏa Mới',
      sublabel: 'Tình nguyện viên ghi nhận người đã hỗ trợ',
      type: ACTION_TYPES.MODAL,
      target: 'upload_activity',
      color: 'from-emerald-600 to-teal-600 text-white',
      badge: 'Tôi Có Thể Giúp'
    });
  }

  // 2.8 DEFAULT MẶC ĐỊNH / CÂU CHÀO BAN ĐẦU
  else {
    actions.push({
      id: 'action-default-learn',
      label: '🎬 Kho Bài Học Cầm Tay Chỉ Việc',
      sublabel: 'Xem các video, infographic hướng dẫn số',
      type: ACTION_TYPES.TAB,
      target: 'all',
      color: 'from-blue-600 to-indigo-600 text-white',
      badge: 'Tôi Muốn Học'
    });

    actions.push({
      id: 'action-default-help',
      label: '🆘 Bác Cần Hỗ Trợ Số Tại Nhà',
      sublabel: 'Đăng ký nhờ tình nguyện viên đến tận nhà',
      type: ACTION_TYPES.MODAL,
      target: 'need_help',
      color: 'from-red-600 to-rose-600 text-white',
      badge: 'Tôi Cần Hỗ Trợ'
    });

    actions.push({
      id: 'action-default-skills',
      label: '🪪 Hộ Chiếu Kỹ Năng Của Tôi',
      sublabel: 'Kiểm tra kỹ năng công dân số Thôn 6',
      type: ACTION_TYPES.MODAL,
      target: 'my_skills',
      color: 'from-amber-600 to-orange-600 text-white',
      badge: 'Kỹ Năng'
    });
  }

  return actions;
};
