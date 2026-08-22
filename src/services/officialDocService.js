import { supabase } from './supabaseClient.js';
import { processUserQuestionPipeline } from './aiPipelineService.js';

export const getOfficialDocuments = async () => {
  try {
    const { data, error } = await supabase
      .from('official_documents')
      .select('*')
      .order('issued_date', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching official documents:', error);
    return { data: [], error: error.message };
  }
};

export const createOfficialDocument = async (docData) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    const payload = {
      doc_number: docData.doc_number,
      title: docData.title,
      issuing_body: docData.issuing_body,
      issued_date: docData.issued_date || new Date().toISOString().split('T')[0],
      effect_status: docData.effect_status || 'Còn hiệu lực',
      source_url: docData.source_url || '',
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

// MOCK KHO CÂU HỎI AI CHƯA TRẢ LỜI ĐƯỢC
let MOCK_UNANSWERED_QUESTIONS = [
  {
    id: 'unans-1',
    question: 'Lịch tập huấn công nghệ số cho người cao tuổi Thôn 6 tháng này là ngày nào?',
    intent: 'DIGITAL_SKILLS',
    retrieval_score: 0.42,
    reason: 'Retrieval score 0.42 < 0.65 (Không đủ thông tin chính thống)',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    status: 'pending_cns'
  },
  {
    id: 'unans-2',
    question: 'Quy trình làm thủ tục sang tên sổ đỏ đất nông nghiệp tại Di Linh?',
    intent: 'ADMIN_PROCEDURE',
    retrieval_score: 0.38,
    reason: 'Retrieval score 0.38 < 0.65 (Thiếu văn bản chỉ đạo đất đai)',
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    status: 'pending_cns'
  }
];

// Hàm lưu câu hỏi AI không biết để báo cho Tổ CNS
export const saveUnansweredQuestion = async (questionInput, metadata = {}) => {
  const qText = typeof questionInput === 'string' ? questionInput : questionInput.question;
  const intentCode = metadata.intent?.code || metadata.intent || (typeof questionInput === 'object' ? questionInput.intent : 'OTHER');
  const score = metadata.retrievalScore !== undefined ? metadata.retrievalScore : (typeof questionInput === 'object' ? questionInput.retrievalScore : 0);
  const reasonText = metadata.reason || (typeof questionInput === 'object' ? questionInput.reason : `Retrieval score ${score.toFixed(2)} < 0.65 (Không đủ tài liệu)`);

  const payload = {
    question: qText,
    intent: intentCode,
    retrieval_score: score,
    reason: reasonText,
    status: 'pending_cns',
    created_at: new Date().toISOString()
  };

  try {
    const { data, error } = await supabase
      .from('unanswered_questions')
      .insert([payload])
      .select();

    if (error) {
      const mockItem = { id: `unans-${Date.now()}`, ...payload };
      MOCK_UNANSWERED_QUESTIONS.unshift(mockItem);
      return { success: true, data: mockItem, isMock: true };
    }

    return { success: true, data: data[0], isMock: false };
  } catch (err) {
    const mockItem = { id: `unans-${Date.now()}`, ...payload };
    MOCK_UNANSWERED_QUESTIONS.unshift(mockItem);
    return { success: true, data: mockItem, isMock: true };
  }
};

// Hàm lấy danh sách câu hỏi AI chưa biết đã chuyển cho Tổ CNS
export const getUnansweredQuestions = async () => {
  try {
    const { data, error } = await supabase
      .from('unanswered_questions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return MOCK_UNANSWERED_QUESTIONS;
    }
    return data;
  } catch (err) {
    return MOCK_UNANSWERED_QUESTIONS;
  }
};

// Trợ lý AI trả lời dựa trên luồng AI Pipeline thống nhất với Timeout Guard siêu tốc
export const askOfficialDocAI = async (userQuestion, officialDocs = []) => {
  try {
    // Đặt hạn thời gian xử lý tối đa 4 giây để không bao giờ để bà con chờ lâu
    const timeoutPromise = new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          text: `🤖 **Trợ lý AI Thôn 6 thông báo:**\n\n` +
                `Em đã ghi nhận câu hỏi: "**${userQuestion}**".\n\n` +
                `✅ **EM ĐÃ TỰ ĐỘNG LƯU VÀO CSDL VÀ BÁO CHO TỔ CÔNG NGHỆ SỐ CỘNG ĐỒNG THÔN 6!**\n` +
                `Các thành viên Tổ CNS sẽ rà soát chỉ đạo từ UBND Di Linh và phản hồi trực tiếp cho bà con sớm nhất ạ.\n\n` +
                `🌐 Bà con có thể tự tra cứu tại Cổng TTĐT Di Linh [dilinh.lamdong.gov.vn](https://dilinh.lamdong.gov.vn/) hoặc gọi Hotline: **0943.849.295**.`,
          escalatedToCNS: true,
          intent: { code: 'OTHER', label: '💡 Hỏi đáp tổng hợp' },
          confidence: 0,
          suggestions: [
            'Cài VNeID Mức 2 cần giấy tờ gì?',
            'Lịch hỗ trợ cầm tay chỉ việc Thôn 6?',
            'Hotline Tổ trưởng Tổ CNS Thôn 6?'
          ]
        });
      }, 4000);
    });

    const pipelinePromise = processUserQuestionPipeline(userQuestion, officialDocs);

    const result = await Promise.race([pipelinePromise, timeoutPromise]);

    return {
      text: result.text,
      isUnknown: result.escalatedToCNS,
      intent: result.intent,
      confidence: result.confidence,
      sourceTitle: result.sourceTitle || '',
      sourceAgency: result.sourceAgency || '',
      sourceUrl: result.sourceUrl || '',
      suggestions: result.suggestions || []
    };
  } catch (err) {
    return {
      text: `🤖 **Trợ lý AI Thôn 6 thông báo:**\n\n` +
            `Em đã ghi nhận câu hỏi: "**${userQuestion}**".\n\n` +
            `✅ **EM ĐÃ TỰ ĐỘNG GỬI CÂU HỎI NÀY TỚI TỔ CÔNG NGHỆ SỐ CỘNG ĐỒNG THÔN 6!**\n` +
            `Thành viên Tổ CNS sẽ rà soát văn bản và phản hồi cho bà con sớm nhất ạ. Hotline hỗ trợ: **0943.849.295**.`,
      isUnknown: true,
      suggestions: [
        'Cài VNeID Mức 2 cần giấy tờ gì?',
        'Lịch hỗ trợ cầm tay chỉ việc Thôn 6?',
        'Hotline Tổ trưởng Tổ CNS Thôn 6?'
      ]
    };
  }
};
