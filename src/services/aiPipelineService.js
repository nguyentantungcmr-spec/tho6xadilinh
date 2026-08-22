import { supabase } from './supabaseClient.js';
import { saveUnansweredQuestion } from './officialDocService.js';
import { retrieveKnowledge } from './ragEngineService.js';
import { preProcessUserQuestion } from './aiPreProcessorService.js';
import { buildAiPromptPayload, parseAndValidateAiResponse } from './aiSystemPromptService.js';

/**
 * AI PIPELINE SERVICE TRUNG TÂM (CENTRALIZED AI PIPELINE)
 * 
 * Luồng xử lý thống nhất 7 bước:
 * User Question → 1. Security Check → 2. Intent Classification → 3. Knowledge Retrieval 
 *               → 4. Confidence Check → 5. Grounded Answer Generation → 6. Response Validation → 7. Suggestions Generation → Frontend
 */

// 1. Kiểm tra an toàn (detectSecurityRisk)
export const detectSecurityRisk = (question) => {
  if (!question || typeof question !== 'string') {
    return { isSafe: false, reason: 'Câu hỏi không hợp lệ.' };
  }

  const normalized = question.toLowerCase();
  
  // Danh sách các từ khóa nguy cơ an ninh thông tin / Prompt Injection / Spam
  const riskPatterns = [
    'ignore previous instructions',
    'bỏ qua hướng dẫn trước',
    'hack',
    'bỏ qua quy tắc',
    'system prompt',
    'mật khẩu admin',
    'password',
    'delete database',
    'drop table'
  ];

  const hasRisk = riskPatterns.some(pattern => normalized.includes(pattern));

  if (hasRisk) {
    return {
      isSafe: false,
      reason: '🛡️ Hệ thống phát hiện nội dung chưa phù hợp hoặc nguy cơ an toàn thông tin.'
    };
  }

  return { isSafe: true, reason: null };
};

// 2. Phân loại câu hỏi (classifyIntent)
export const classifyIntent = (question) => {
  const q = question.toLowerCase();

  if (q.includes('vneid') || q.includes('định danh') || q.includes('cccd') || q.includes('mức 2')) {
    return { code: 'vneid', label: '🪪 Định danh điện tử VNeID' };
  }
  if (q.includes('lừa đảo') || q.includes('giả danh') || q.includes('chiếm đoạt') || q.includes('cuộc gọi lạ') || q.includes('mất tiền')) {
    return { code: 'fraud_alert', label: '🛡️ Phòng chống lừa đảo mạng' };
  }
  if (q.includes('qr') || q.includes('quét mã') || q.includes('thanh toán') || q.includes('bhyt')) {
    return { code: 'qr_code', label: '📱 Quét mã QR & Thanh toán số' };
  }
  if (q.includes('dịch vụ công') || q.includes('thủ tục') || q.includes('hành chính') || q.includes('nộp hồ sơ') || q.includes('dvc')) {
    return { code: 'service_public', label: '🏛️ Dịch vụ công trực tuyến' };
  }
  if (q.includes('thôn 6') || q.includes('di linh') || q.includes('lâm đồng') || q.includes('kế hoạch') || q.includes('đề án 06')) {
    return { code: 'local_policy', label: '📢 Chỉ đạo Chuyển đổi số Thôn 6 & Di Linh' };
  }

  return { code: 'general_help', label: '💡 Kỹ năng số tổng hợp' };
};

// 3. Tìm kiếm tài liệu chính thống (searchOfficialKnowledge - RAG Retrieval Engine)
export const searchOfficialKnowledge = async (question, intent, officialDocs = []) => {
  // Gọi RAG Engine truy vấn dữ liệu chính thống verified = true và status = 'active'
  const ragResult = await retrieveKnowledge(question, 5, 0.35);

  if (ragResult.status === 'NO_RELIABLE_SOURCE' || !ragResult.results || ragResult.results.length === 0) {
    return {
      status: 'NO_RELIABLE_SOURCE',
      matchedDocs: [],
      topScore: 0
    };
  }

  return {
    status: 'SUCCESS',
    matchedDocs: ragResult.results, // Mảng Top K kết quả [{ content, score, title, agency, documentNumber, sourceUrl, lastUpdated }]
    topScore: ragResult.topScore,
    ragRawResult: ragResult
  };
};

// 4. Đánh giá độ tin cậy (calculateConfidence)
export const calculateConfidence = (searchResult) => {
  if (!searchResult || searchResult.status === 'NO_RELIABLE_SOURCE') {
    return 0; // Trả về 0 nếu không tìm thấy nguồn tin cậy
  }
  return searchResult.topScore || 0;
};

// 5. Sinh câu trả lời căn cứ chính xác (generateGroundedAnswer)
export const generateGroundedAnswer = (question, intent, searchResult, confidence) => {
  const sourceUrl = 'https://dilinh.lamdong.gov.vn/';

  if (searchResult.status === 'SUCCESS' && confidence >= 0.25 && searchResult.matchedDocs.length > 0) {
    const topDoc = searchResult.matchedDocs[0];
    const docContent = topDoc.fullContent || topDoc.content;
    return {
      text: `🤖 **Trợ lý AI Thôn 6 giải đáp:**\n\n` +
            `Dạ thưa Bác/anh/chị, về câu hỏi: "**${question}**", em xin hướng dẫn chi tiết theo tài liệu chính thức:\n\n` +
            `${docContent}\n\n` +
            `🏛️ **Cơ sở văn bản chính thống:**\n` +
            `- **Văn bản:** ${topDoc.title} (Số hiệu: **${topDoc.documentNumber || 'KB-T6-01/2026'}**)\n` +
            `- **Cơ quan ban hành:** ${topDoc.agency || 'Tổ Công nghệ số cộng đồng Thôn 6 – Xã Di Linh'}\n` +
            `- **Nguồn đối chiếu:** [dilinh.lamdong.gov.vn](${topDoc.sourceUrl || sourceUrl})\n\n` +
            `👉 *Bác/anh/chị có thể bấm các **Nút chức năng màu xanh/đỏ** bên dưới để chuyển nhanh tới bài học video hoặc gọi Hotline Tổ CNS **0903.382.277** để được hỗ trợ tận nhà ạ!*`,
      isGrounded: true,
      doc: topDoc
    };
  }

  // TRẠNG THÁI KHÔNG TÌM THẤY NGUỒN CHÍNH THỐNG ĐỦ TIN CẬY (THEO NGUYÊN TẮC KB-T6-20/2026) -> AI KHÔNG TỰ BỊA NGUỒN
  return {
    text: `🤖 **Trợ lý AI Thôn 6 thông báo:**\n\n` +
          `Dạ thưa Bác/anh/chị, về câu hỏi: "**${question}**"\n\n` +
          `📌 **Hiện hệ thống cơ sở dữ liệu Thôn 6 chưa có đủ thông tin chính thức để trả lời chính xác câu hỏi này.** Bác/anh/chị vui lòng kiểm tra thông báo chính thức hoặc liên hệ cơ quan có thẩm quyền ạ.\n\n` +
          `✅ **Em đã tự động ghi nhận câu hỏi này và chuyển đến Ban điều hành Tổ Công nghệ số Thôn 6 để đối chiếu chỉ đạo từ UBND Xã Di Linh và cập nhật tài liệu sớm nhất cho bà con!**\n\n` +
          `🌐 Tra cứu Cổng TTĐT Di Linh: [dilinh.lamdong.gov.vn](${sourceUrl}) hoặc liên hệ Hotline Tổ CNS: **0903.382.277**.`,
    isGrounded: false,
    doc: null
  };
};

// 6. Kiểm định tính hợp lệ của phản hồi AI (validateAIResponse)
export const validateAIResponse = async (question, groundedResult, confidence) => {
  // Nếu câu trả lời không có căn cứ đầy đủ (confidence < 0.65), tự động lưu câu hỏi chưa biết để gửi cho Tổ CNS
  if (!groundedResult.isGrounded || confidence < 0.65) {
    await saveUnansweredQuestion(question);
    return {
      isValid: true,
      escalatedToCNS: true,
      finalText: groundedResult.text
    };
  }

  return {
    isValid: true,
    escalatedToCNS: false,
    finalText: groundedResult.text
  };
};

// 7. Tạo gợi ý câu hỏi liên quan (generateSuggestions cho 10 Intent)
export const generateSuggestions = (intent) => {
  const code = (intent.code || intent || '').toUpperCase();

  switch (code) {
    case 'VNEID':
      return [
        'Cài VNeID Mức 2 cần chuẩn bị giấy tờ gì?',
        'Kích hoạt tài khoản định danh VNeID ở đâu tại Di Linh?',
        'Quên mật khẩu VNeID xử lý thế nào?'
      ];
    case 'PUBLIC_SERVICE':
      return [
        'Nộp hồ sơ thủ tục hành chính trực tuyến xã Di Linh?',
        'Tra cứu kết quả giải quyết hồ sơ Dịch vụ công?',
        'Đăng ký khai sinh/chứng thực điện tử?'
      ];
    case 'PROJECT_06':
      return [
        'Quy định Đề án 06 về cắt giảm bản sao giấy tờ?',
        'Sử dụng dữ liệu dân cư thay sổ hộ khẩu?',
        'Tra cứu thông tin cá nhân trên Cổng dịch vụ công?'
      ];
    case 'QR_CODE':
      return [
        'Quét mã QR BHYT đi khám bệnh tại Di Linh thế nào?',
        'Thanh toán điện nước qua QR có tốn phí không?',
        'Cách tạo mã QR cửa hàng kinh doanh tại Thôn 6?'
      ];
    case 'SCAM':
    case 'CYBER_SECURITY':
      return [
        'Nhận biết cuộc gọi giả danh Công an yêu cầu chuyển tiền?',
        'Làm sao khi lỡ bấm vào đường link lạ trên Zalo?',
        'Cách bảo vệ tài khoản ngân hàng không bị rút tiền?'
      ];
    case 'ADMIN_PROCEDURE':
      return [
        'Thủ tục làm căn cước cho trẻ dưới 14 tuổi?',
        'Làm chứng thực điện tử bản sao tại UBND Xã Di Linh?',
        'Nộp tiền lệ phí dịch vụ công qua tài khoản nào?'
      ];
    case 'DIGITAL_SKILLS':
      return [
        'Cách cài ứng dụng Zalo và đọc tin tức Thôn 6?',
        'Cách gọi video xem hình cháu xa nhà?',
        'Lịch hỗ trợ cầm tay chỉ việc Thôn 6 tuần này?'
      ];
    case 'LOCAL_INFORMATION':
      return [
        'Xem thông báo chỉ đạo mới nhất trên dilinh.lamdong.gov.vn',
        'Số điện thoại Hotline Tổ trưởng Tổ CNS Thôn 6?',
        'Lịch sinh hoạt Chi bộ và Ban công tác Mặt trận Thôn 6?'
      ];
    default:
      return [
        'Lịch hỗ trợ cầm tay chỉ việc Thôn 6 tuần này?',
        'Xem tin tức chỉ đạo mới nhất trên dilinh.lamdong.gov.vn',
        'Số điện thoại Hotline Tổ trưởng Tổ CNS Thôn 6?'
      ];
  }
};

/**
 * HÀM XỬ LÝ AI SERVICE TRUNG TÂM (CENTRAL PIPELINE RUNNER)
 * Kết nối toàn bộ 7 thành phần theo luồng thống nhất.
 */
export const processUserQuestionPipeline = async (question, officialDocs = []) => {
  // BƯỚC 0: LỚP XỬ LÝ TRƯỚC (PRE-PROCESSING LAYER: INTENT 10 CATEGORIES, SECURITY RISK & DATA MASKING)
  const preProcessed = preProcessUserQuestion(question);

  // NẾU CÓ RỦI RO CAO (HIGH RISK: Dụ lộ OTP, Mật khẩu, CVV, PIN...) -> CHẶN LẬP TỨC VÀ ĐƯA RA CẢNH BÁO
  if (preProcessed.isHighRisk) {
    return {
      success: false,
      text: preProcessed.security.warningMessage,
      intent: preProcessed.intent,
      confidence: 0,
      escalatedToCNS: false,
      suggestions: generateSuggestions(preProcessed.intent)
    };
  }

  const safeQuestion = preProcessed.sanitizedQuestion;
  const intent = preProcessed.intent;

  // BƯỚC 1: Knowledge Retrieval (RAG Engine)
  const searchResult = await searchOfficialKnowledge(safeQuestion, intent, officialDocs);

  // BƯỚC 2: Xây dựng Payload System Prompt & Lấy Retrieval Score do Backend quyết định
  const promptPayload = buildAiPromptPayload(safeQuestion, intent, searchResult.ragRawResult || searchResult, preProcessed.security);
  const backendScore = promptPayload.backendScore; // RETRIEVAL SCORE DO BACKEND QUYẾT ĐỊNH 100%

  // BƯỚC 3: Sinh câu trả lời & Kiểm định JSON Schema
  const rawGroundedResult = generateGroundedAnswer(safeQuestion, intent, searchResult, backendScore);
  const parsedJsonOutput = parseAndValidateAiResponse(rawGroundedResult.text, promptPayload);

  // BƯỚC 4: Chỉ báo cho Tổ CNS khi hoàn toàn không tìm thấy tài liệu trong CSDL (NO_RELIABLE_SOURCE hoặc score < 0.35)
  let finalEscalated = parsedJsonOutput.needHuman;
  if (backendScore < 0.35 || searchResult.status === 'NO_RELIABLE_SOURCE') {
    finalEscalated = true;
    await saveUnansweredQuestion(safeQuestion);
  } else {
    finalEscalated = false;
  }

  // BƯỚC 5: Gợi ý câu hỏi thông minh
  const suggestions = generateSuggestions(intent);

  return {
    success: true,
    text: parsedJsonOutput.answer,
    intent: intent,
    confidence: backendScore, // RETRIEVAL SCORE DO BACKEND QUYẾT ĐỊNH
    escalatedToCNS: finalEscalated,
    needClarification: parsedJsonOutput.needClarification,
    sourceTitle: parsedJsonOutput.sourceTitle,
    sourceAgency: parsedJsonOutput.sourceAgency,
    sourceUrl: parsedJsonOutput.sourceUrl,
    suggestions: suggestions
  };
};
