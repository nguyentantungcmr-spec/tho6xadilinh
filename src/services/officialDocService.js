import { supabase } from './supabaseClient';

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

// Trợ lý AI trả lời dựa trên kho văn bản chính thống
export const askOfficialDocAI = async (userQuestion, officialDocs = []) => {
  if (!userQuestion || userQuestion.trim() === '') {
    return 'Vui lòng nhập câu hỏi của bác/anh/chị.';
  }

  const normalizedQuestion = userQuestion.toLowerCase();
  
  // Tìm kiếm văn bản có liên quan nhất trong CSDL
  const matchedDoc = officialDocs.find(doc => 
    doc.title.toLowerCase().includes(normalizedQuestion) ||
    doc.content_summary.toLowerCase().includes(normalizedQuestion) ||
    normalizedQuestion.includes('vneid') ||
    normalizedQuestion.includes('đề án 06') ||
    normalizedQuestion.includes('lừa đảo') ||
    normalizedQuestion.includes('chuyển đổi số')
  );

  if (matchedDoc) {
    return `🤖 **Trợ lý AI Thôn 6 giải đáp (Trích xuất từ Nguồn chính thống):**\n\n` +
           `📌 **Văn bản tham chiếu:** ${matchedDoc.title} (Số hiệu: ${matchedDoc.doc_number})\n` +
           `🏛️ **Cơ quan ban hành:** ${matchedDoc.issuing_body} (Ngày: ${matchedDoc.issued_date})\n` +
           `✅ **Trạng thái:** ${matchedDoc.effect_status}\n\n` +
           `💡 **Nội dung trả lời:** ${matchedDoc.content_summary}\n\n` +
           `👉 **Khuyên dùng cho người dân:** Bà con hãy yên tâm làm theo hướng dẫn của văn bản trên. Nếu cần trợ giúp trực tiếp, hãy tới Nhà văn hóa Thôn 6 vào sáng Thứ 7 để Tổ CNS cầm tay chỉ việc!`;
  }

  return `🤖 **Trợ lý AI Thôn 6 giải đáp:**\n\n` +
         `Chào bác/anh/chị! Hiện tại kho văn bản chính thống đã cập nhật các chỉ đạo về Đề án 06, định danh VNeID và Phong trào Chuyển đổi số cộng đồng Thôn 6.\n\n` +
         `Để được hướng dẫn chi tiết về câu hỏi "${userQuestion}", bà con vui lòng liên hệ trực tiếp Tổ Công nghệ số cộng đồng Thôn 6 Xã Di Linh hoặc xem mục Video Cầm tay chỉ việc trên ứng dụng này nhé!`;
};
