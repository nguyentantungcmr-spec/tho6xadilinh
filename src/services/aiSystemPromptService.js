/**
 * AI SYSTEM PROMPT SERVICE (HỆ THỐNG SYSTEM PROMPT CHÍNH & JSON SCHEMA ENGINE)
 * 
 * Đóng gói 8 nguyên tắc ứng xử tuyệt đối + JSON Schema đầu ra nghiêm ngặt + Logic Retrieval Score do Backend quyết định.
 */

export const COMMUNITY_AI_SYSTEM_PROMPT = `
Bạn là Trợ lý AI Cộng đồng Thôn 6 Xã Di Linh, Huyện Di Linh, Tỉnh Lâm Đồng.
Nhiệm vụ của bạn là hỗ trợ người dân giải đáp các thắc mắc về VNeID, Đề án 06, Dịch vụ công trực tuyến, Mã QR, Phòng chống lừa đảo, Thủ tục hành chính và Tin tức chính thống của địa phương.

BẠN BẮT BUỘC TUÂN THỦ NGUYÊN TẮC TỐI CAO SAU:
1. UY TIÊN TUYỆT ĐỐI tài liệu chính thống được cung cấp trong phần OFFICIAL_CONTEXT.
2. KHÔNG TỰ TẠO (BỊA):
   - Số hiệu văn bản
   - Quy định pháp lý
   - Mức phí/lệ phí
   - Thời hạn giải quyết
   - Số điện thoại hotline
   - Địa chỉ cơ quan
   - Đường dẫn URL
   - Tên cơ quan ban hành.
3. NẾU TÀI LIỆU KHÔNG ĐỦ CĂN CỨ: Tuyệt đối không được suy đoán.
4. NẾU CÂU HỎI CHƯA RÕ: Đặt câu hỏi lịch sự để làm rõ ý người dân (needClarification = true).
5. NẾU CÓ DẤU HIỆU LỪA ĐẢO/RỦI RO: Ưu tiên đưa ra cảnh báo an toàn số ngay lập tức.
6. NGÔN NGỮ & VĂN PHONG:
   - Tiếng Việt chuẩn mực, dễ hiểu, thân thiện.
   - Phù hợp cả với người lớn tuổi.
   - Luôn xưng "Em" và gọi người dân là "Bác/anh/chị".
7. HƯỚNG DẪN THỦ TỤC: Trình bày từng bước 1, 2, 3 ngắn gọn, trực quan.
8. HIỂN THỊ NGUỒN: Cuối câu trả lời phải trích dẫn rõ Tiêu đề văn bản, Cơ quan phát hành và Nguồn dilinh.lamdong.gov.vn nếu có.

ĐẦU RÀ BẮT BUỘC LÀ MỘT CHUỖI JSON HỢP LỆ THEO SCHEMA NÀY (KHÔNG KÈM TEXT NGOÀI BẢNG JSON):
{
  "intent": "VNEID | PUBLIC_SERVICE | PROJECT_06 | QR_CODE | SCAM | CYBER_SECURITY | ADMIN_PROCEDURE | DIGITAL_SKILLS | LOCAL_INFORMATION | OTHER",
  "confidence": 0.85,
  "answer": "Nội dung câu trả lời hướng dẫn...",
  "sourceTitle": "Tiêu đề văn bản chính thống",
  "sourceAgency": "UBND Huyện Di Linh",
  "sourceUrl": "https://dilinh.lamdong.gov.vn/",
  "riskLevel": "LOW | MEDIUM | HIGH",
  "needHuman": false,
  "needClarification": false,
  "suggestions": ["Gợi ý câu hỏi 1", "Gợi ý câu hỏi 2"]
}
`;

/**
 * XÂY DỰNG PROMPT VÀ ÁP DỤNG LOGIC RETRIEVAL SCORE DO BACKEND QUYẾT ĐỊNH
 * 
 * Quy tắc gán Score từ Backend:
 * - retrievalScore >= 0.85: AI được trả lời dựa trên tài liệu.
 * - 0.65 <= retrievalScore < 0.85: Chỉ trả lời phần chắc chắn hoặc hỏi thêm người dân.
 * - retrievalScore < 0.65 hoặc NO_RELIABLE_SOURCE: Không kết luận; needHuman = true.
 */
export const buildAiPromptPayload = (userQuestion, intentInfo, ragResult, securityInfo) => {
  const backendScore = ragResult && ragResult.status === 'SUCCESS' ? (ragResult.topScore || 0) : 0;
  const isNoSource = !ragResult || ragResult.status === 'NO_RELIABLE_SOURCE' || !ragResult.results || ragResult.results.length === 0;

  let needHuman = false;
  let needClarification = false;
  let decisionInstruction = '';

  if (isNoSource || backendScore < 0.65) {
    needHuman = true;
    decisionInstruction = `MỨC RETRIEVAL SCORE HIỆN TẠI LÀ ${backendScore.toFixed(2)} (< 0.65 HOẶC KHÔNG CÓ NGUỒN CHÍNH THỨC).\n` +
                          `YÊU CẦU: Không đưa ra kết luận. Gán needHuman = true. Thông báo cho Bác/anh/chị biết em đã tự động lưu câu hỏi và chuyển cho Tổ Công nghệ số Thôn 6 rà soát.`;
  } else if (backendScore >= 0.65 && backendScore < 0.85) {
    decisionInstruction = `MỨC RETRIEVAL SCORE HIỆN TẠI LÀ ${backendScore.toFixed(2)} (Từ 0.65 đến dưới 0.85).\n` +
                          `YÊU CẦU: Chỉ trả lời những phần chắc chắn có trong tài liệu. Nếu câu hỏi còn điểm chưa rõ, hãy hỏi lại Bác/anh/chị (needClarification = true).`;
  } else {
    // backendScore >= 0.85
    decisionInstruction = `MỨC RETRIEVAL SCORE HIỆN TẠI LÀ ${backendScore.toFixed(2)} (>= 0.85 - ĐỘ TIN CẬY CAO).\n` +
                          `YÊU CẦU: Trả lời đầy đủ, chi tiết từng bước dựa trên OFFICIAL_CONTEXT. Gán needHuman = false.`;
  }

  const officialContextText = !isNoSource
    ? ragResult.results.map((doc, idx) => `[TÀI LIỆU ${idx + 1}]\n- Tiêu đề: ${doc.title}\n- Cơ quan: ${doc.agency}\n- Số hiệu: ${doc.documentNumber}\n- Nguồn: ${doc.sourceUrl}\n- Nội dung: ${doc.content}`).join('\n\n')
    : 'KHÔNG CÓ TÀI LIỆU CHÍNH THỨC NÀO ĐỦ KHỚP NGHĨA';

  const userPrompt = `
[THÔNG TIN TỪ BACKEND RAG ENGINE]
- Retrieval Score (Backend quyết định): ${backendScore.toFixed(2)}
- Intent Code: ${intentInfo.code} (${intentInfo.label})
- Risk Level: ${securityInfo.riskLevel}

[CHỈ ĐỊNH XỬ LÝ THEO SCORE]
${decisionInstruction}

[OFFICIAL_CONTEXT - KHO TÀI LIỆU CHÍNH THỐNG THÔN 6 & DI LINH]
${officialContextText}

[CÂU HỎI CỦA NGƯỜI DÂN]
"${userQuestion}"

Hãy tạo chuỗi JSON phản hồi chính xác theo Schema. LƯU Ý: Giá trị trường "confidence" trong JSON BẮT BUỘC PHẢI BẰNG ĐÚNG giá trị Backend Retrieval Score là ${backendScore.toFixed(2)}. Không được tự ý thay đổi confidence.
`;

  return {
    systemPrompt: COMMUNITY_AI_SYSTEM_PROMPT,
    userPrompt: userPrompt,
    backendScore: backendScore,
    needHuman: needHuman,
    needClarification: needClarification
  };
};

/**
 * PARSE & KIỂM ĐỊNH JSON OUTPUT TRẢ VỀ CHO FRONTEND
 */
export const parseAndValidateAiResponse = (rawResponseText, payload) => {
  const sourceUrlDefault = 'https://dilinh.lamdong.gov.vn/';
  const backendScore = payload.backendScore;

  try {
    // Tìm đoạn JSON trong response
    const jsonMatch = rawResponseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);

      // Ép confidence bằng đúng backendScore do Backend quyết định
      parsed.confidence = backendScore;

      if (backendScore < 0.65 || payload.needHuman) {
        parsed.needHuman = true;
      }

      return {
        intent: parsed.intent || payload.intentInfo?.code || 'OTHER',
        confidence: backendScore,
        answer: parsed.answer,
        sourceTitle: parsed.sourceTitle || '',
        sourceAgency: parsed.sourceAgency || '',
        sourceUrl: parsed.sourceUrl || sourceUrlDefault,
        riskLevel: parsed.riskLevel || 'LOW',
        needHuman: parsed.needHuman,
        needClarification: parsed.needClarification || false,
        suggestions: parsed.suggestions || []
      };
    }
  } catch (e) {
    // Fallback an toàn nếu lỗi parse
  }

  // Trả về câu trả lời đã sinh đầy đủ từ kho kiến thức
  const isNoSource = backendScore < 0.35;
  const isNeedHuman = isNoSource || payload.needHuman;

  return {
    intent: payload.intentInfo?.code || 'OTHER',
    confidence: backendScore,
    answer: rawResponseText,
    sourceTitle: isNoSource ? '' : 'Văn bản chỉ đạo UBND Huyện Di Linh',
    sourceAgency: 'UBND Huyện Di Linh',
    sourceUrl: sourceUrlDefault,
    riskLevel: 'LOW',
    needHuman: isNeedHuman,
    needClarification: payload.needClarification || false,
    suggestions: [
      'Cài VNeID Mức 2 cần giấy tờ gì?',
      'Lịch hỗ trợ cầm tay chỉ việc Thôn 6?',
      'Hotline Tổ trưởng Tổ CNS Thôn 6?'
    ]
  };
};
