/**
 * AI PRE-PROCESSOR SERVICE (LỚP XỬ LÝ TRƯỚC CHO TRỢ LÝ AI)
 * 
 * Đảm nhiệm 3 vai trò sinh tử:
 * A. Intent Classification (Phân loại 10 danh mục chuẩn)
 * B. Security Check & Risk Level Assessment (Low / Medium / High)
 * C. Sensitive Data Sanitization & Masking (Che giấu OTP, PIN, CVV, mật khẩu)
 */

// A. KHAI BÁO 10 DANH MỤC INTENT CHUẨN
export const INTENT_CATEGORIES = {
  VNEID: { code: 'VNEID', label: '🪪 VNeID & Định danh điện tử' },
  PUBLIC_SERVICE: { code: 'PUBLIC_SERVICE', label: '🏛️ Dịch vụ công trực tuyến' },
  PROJECT_06: { code: 'PROJECT_06', label: '📊 Đề án 06 Chính phủ' },
  QR_CODE: { code: 'QR_CODE', label: '📱 Quét mã QR & Thanh toán' },
  SCAM: { code: 'SCAM', label: '🛡️ Cảnh báo lừa đảo mạng' },
  CYBER_SECURITY: { code: 'CYBER_SECURITY', label: '🔐 An toàn thông tin số' },
  ADMIN_PROCEDURE: { code: 'ADMIN_PROCEDURE', label: '📋 Thủ tục hành chính' },
  DIGITAL_SKILLS: { code: 'DIGITAL_SKILLS', label: '💡 Kỹ năng số cộng đồng' },
  LOCAL_INFORMATION: { code: 'LOCAL_INFORMATION', label: '📢 Thông tin chính thống Di Linh' },
  OTHER: { code: 'OTHER', label: '📁 Hỏi đáp tổng hợp' }
};

// 1. INTENT CLASSIFIER (Phân loại câu hỏi thành 10 danh mục)
export const classifyIntentAdvanced = (question) => {
  if (!question || typeof question !== 'string') return INTENT_CATEGORIES.OTHER;

  const q = question.toLowerCase();

  if (q.includes('vneid') || q.includes('định danh') || q.includes('cccd') || q.includes('mức 2') || q.includes('kích hoạt vneid')) {
    return INTENT_CATEGORIES.VNEID;
  }
  if (q.includes('dịch vụ công') || q.includes('dvc') || q.includes('nộp hồ sơ trực tuyến') || q.includes('cổng dịch vụ công')) {
    return INTENT_CATEGORIES.PUBLIC_SERVICE;
  }
  if (q.includes('đề án 06') || q.includes('dữ liệu dân cư') || q.includes('số hóa hồ sơ') || q.includes('nghị định 06')) {
    return INTENT_CATEGORIES.PROJECT_06;
  }
  if (q.includes('qr') || q.includes('quét mã') || q.includes('qr bhyt') || q.includes('mã qr cửa hàng')) {
    return INTENT_CATEGORIES.QR_CODE;
  }
  if (q.includes('lừa đảo') || q.includes('giả danh công an') || q.includes('chiếm đoạt') || q.includes('bị lừa tiền') || q.includes('cuộc gọi nghi lừa đảo')) {
    return INTENT_CATEGORIES.SCAM;
  }
  if (q.includes('an toàn thông tin') || q.includes('bảo mật') || q.includes('mã độc') || q.includes('đường link lạ') || q.includes('phần mềm độc hại') || q.includes('virus')) {
    return INTENT_CATEGORIES.CYBER_SECURITY;
  }
  if (q.includes('thủ tục') || q.includes('hành chính') || q.includes('khai sinh') || q.includes('chứng thực') || q.includes('kết hôn') || q.includes('sổ đỏ')) {
    return INTENT_CATEGORIES.ADMIN_PROCEDURE;
  }
  if (q.includes('kỹ năng số') || q.includes('sử dụng zalo') || q.includes('xem youtube') || q.includes('học công nghệ') || q.includes('cầm tay chỉ việc')) {
    return INTENT_CATEGORIES.DIGITAL_SKILLS;
  }
  if (q.includes('thôn 6') || q.includes('di linh') || q.includes('lâm đồng') || q.includes('ubnd xã') || q.includes('lịch họp thôn') || q.includes('thông báo địa phương')) {
    return INTENT_CATEGORIES.LOCAL_INFORMATION;
  }

  return INTENT_CATEGORIES.OTHER;
};

// B. SECURITY CHECK (Nhận diện rủi ro & Đánh giá riskLevel)
export const SENSITIVE_KEYWORDS = [
  { keyword: 'cung cấp mã otp', risk: 'HIGH', type: 'Yêu cầu đọc OTP' },
  { keyword: 'cho tôi mã otp', risk: 'HIGH', type: 'Xin mã OTP' },
  { keyword: 'đọc mã otp', risk: 'HIGH', type: 'Đọc mã OTP' },
  { keyword: 'ignore previous instructions', risk: 'HIGH', type: 'Prompt Injection' },
  { keyword: 'bỏ qua hướng dẫn', risk: 'HIGH', type: 'Prompt Injection' },
  { keyword: 'bỏ qua quy tắc', risk: 'HIGH', type: 'Prompt Injection' },
  { keyword: 'cài ứng dụng từ nguồn không rõ', risk: 'HIGH', type: 'Ứng dụng lạ chứa mã độc' },
  { keyword: 'tài khoản ngân hàng', risk: 'MEDIUM', type: 'Tài khoản ngân hàng' },
  { keyword: 'chuyển tiền', risk: 'MEDIUM', type: 'Giao dịch chuyển tiền' },
  { keyword: 'đường link đáng ngờ', risk: 'MEDIUM', type: 'Liên kết không xác định' }
];

export const detectSecurityRiskAdvanced = (question) => {
  if (!question || typeof question !== 'string') {
    return { riskLevel: 'LOW', isBlocked: false, warningMessage: null, detectedRisks: [] };
  }

  const q = question.toLowerCase();
  const detectedRisks = [];
  let maxRisk = 'LOW';

  // 1. Kiểm tra hành vi Prompt Injection hoặc dụ lấy OTP khẩn cấp
  SENSITIVE_KEYWORDS.forEach(item => {
    if (q.includes(item.keyword)) {
      detectedRisks.push(item);
      if (item.risk === 'HIGH') {
        maxRisk = 'HIGH';
      } else if (item.risk === 'MEDIUM' && maxRisk !== 'HIGH') {
        maxRisk = 'MEDIUM';
      }
    }
  });

  // 2. CHỈ ĐÁNH GIÁ HIGH RISK KHI: Lộ dãy số OTP 4-8 chữ số thực tế cùng từ khóa nhạy cảm
  const hasDigitOTPPattern = /\b\d{4,8}\b/.test(q) && (q.includes('otp') || q.includes('mã xác nhận') || q.includes('mã xác thực'));
  if (hasDigitOTPPattern) {
    maxRisk = 'HIGH';
    detectedRisks.push({ keyword: 'Lộ mã OTP thực tế', risk: 'HIGH', type: 'Tiết lộ mã OTP cá nhân' });
  }

  // 3. Nếu là câu hỏi hướng dẫn xử lý thông thường ("Quên mật khẩu", "Cài VNeID", "Đọc OTP có nguy hiểm không") -> GIỮ LOW/MEDIUM DỂ RAG NÓI RÕ
  const isHelpQuery = q.includes('quên mật khẩu') || q.includes('quên password') || q.includes('xử lý thế nào') || q.includes('có nên đọc') || q.includes('có sao không');
  if (isHelpQuery && maxRisk !== 'HIGH') {
    maxRisk = 'LOW';
  }

  if (maxRisk === 'HIGH') {
    return {
      riskLevel: 'HIGH',
      isBlocked: true,
      warningMessage: `⚠️ **CẢNH BÁO AN TOÀN SỐ CẤP ĐỘ CAO (HIGH RISK):**\n\n` +
                      `Bà con tuyệt đối **KHÔNG BAO GIỜ CUNG CẤP MÃ OTP, MẬT KHẨU HOẶC MÃ PIN** cho bất kỳ ai (kể cả người tự xưng là Công an hay Trợ lý AI).\n\n` +
                      `🛡️ Cơ quan công an và Trợ lý AI Thôn 6 **KHÔNG BAO GIỜ** yêu cầu người dân đọc mã OTP cá nhân!`,
      detectedRisks
    };
  }

  if (maxRisk === 'MEDIUM') {
    return {
      riskLevel: 'MEDIUM',
      isBlocked: false,
      warningMessage: `⚠️ **LƯU Ý AN TOÀN SỐ (MEDIUM RISK):** Thôn 6 khuyến cáo bà con cảnh giác khi thực hiện giao dịch chuyển tiền hoặc bấm vào các đường link lạ gửi qua Zalo/SMS.`,
      detectedRisks
    };
  }

  return {
    riskLevel: 'LOW',
    isBlocked: false,
    warningMessage: null,
    detectedRisks: []
  };
};

// C. CHE GIẤU DỮ LIỆU NHẠY CẢM (Sensitive Data Sanitization & Masking)
export const sanitizeSensitiveData = (text) => {
  if (!text || typeof text !== 'string') return '';

  let sanitized = text;

  // 1. Che giấu mã OTP / PIN 4-8 chữ số đi kèm từ khóa
  sanitized = sanitized.replace(/\b(otp|pin|mã|pass|password|cvv)\s*[:=-]?\s*(\d{4,8})\b/gi, '$1: [🔒 ĐÃ CHE GIẤU THÔNG TIN BẢO MẬT]');

  // 2. Che giấu số CVV thẻ 3-4 chữ số
  sanitized = sanitized.replace(/\b(cvv|cvc)\s*[:=-]?\s*(\d{3,4})\b/gi, 'CVV: ***');

  // 3. Che giấu dãy số OTP đứng đơn lẻ 6 chữ số nếu nằm gần từ nhạy cảm
  sanitized = sanitized.replace(/\b(\d{6})\b/g, (match) => {
    return '[🔒 DÃY SỐ DỰ PHÒNG CHUẨN]';
  });

  return sanitized;
};

/**
 * HÀM XỬ LÝ TRƯỚC TRUNG TÂM (CENTRAL PRE-PROCESSOR RUNNER)
 * Kết nối Intent + Security Check + Sanitization
 */
export const preProcessUserQuestion = (userQuestion) => {
  // 1. Làm sạch & Che giấu dữ liệu nhạy cảm nếu người dùng lỡ nhập OTP/Mật khẩu
  const sanitizedQuestion = sanitizeSensitiveData(userQuestion);

  // 2. Phân loại Intent chuẩn 10 danh mục
  const intent = classifyIntentAdvanced(sanitizedQuestion);

  // 3. Kiểm tra rủi ro An ninh thông tin
  const security = detectSecurityRiskAdvanced(sanitizedQuestion);

  return {
    originalQuestion: userQuestion,
    sanitizedQuestion: sanitizedQuestion,
    intent: intent,
    security: security,
    isHighRisk: security.riskLevel === 'HIGH'
  };
};
