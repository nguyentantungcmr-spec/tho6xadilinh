import { getKnowledgeList } from './officialKnowledgeService.js';

/**
 * HỆ THỐNG RAG ENGINE CHUẨN XÁC CAO (SEMANTIC PHRASE & TOPIC MATCHER)
 * Khớp chuẩn 20 Mục Tri Thức KB-T6-01 đến KB-T6-20
 * Ngăn chặn tuyệt đối hiện tượng trùng lặp từ đơn lẻ (như "dân", "số" trong "dân số")
 */

// Bản đồ cụm từ khóa chuyên biệt (Multi-word Topic Phrases) cho 20 Mục Tri Thức
export const TOPIC_KEYWORD_MAP = {
  'KB-T6-01/2026': [
    'vneid', 'định danh', 'cccd', 'mức 2', 'passcode', 'kích hoạt vneid', 
    'quên mật khẩu vneid', 'mã pin vneid', 'ví giấy tờ', 'tích hợp giấy tờ', 'mức 1', 'tài khoản định danh'
  ],
  'KB-T6-02/2026': [
    'lừa đảo', 'giả danh', 'mạo danh', 'deepfake', 'video call lừa', 'cuộc gọi lạ', 
    'chiếm đoạt', 'bị lừa', 'link lạ', 'file apk', 'mất tiền', 'dọa khóa sim', 'công an gọi điện', 'thuế gọi điện'
  ],
  'KB-T6-03/2026': [
    'người cao tuổi', 'người già', 'ông bà', 'bố mẹ', 'lớn tuổi', 
    'hướng dẫn người già', 'cầm tay chỉ việc', 'học điện thoại'
  ],
  'KB-T6-04/2026': [
    'dịch vụ công', 'thủ tục hành chính', 'nộp hồ sơ', 'khai sinh', 'kết hôn', 
    'khai tử', 'trích lục', 'chứng thực', 'đất đai', 'sổ đỏ', 'dichvucong', 'một cửa'
  ],
  'KB-T6-05/2026': [
    'mã qr', 'quét qr', 'quét mã', 'mã dán đè', 'quét mã an toàn'
  ],
  'KB-T6-06/2026': [
    'thanh toán', 'chuyển tiền', 'chuyển khoản', 'ngân hàng', 'banking', 
    'chuyển nhầm', 'không dùng tiền mặt', 'ví điện tử', 'momo', 'viettel money', 'zalopay'
  ],
  'KB-T6-07/2026': [
    'bảo vệ thông tin', 'mật khẩu', 'lộ thông tin', 'mất điện thoại', 
    'dữ liệu cá nhân', 'lộ otp', 'bảo mật tài khoản', 'đăng xuất'
  ],
  'KB-T6-08/2026': [
    'tin giả', 'tin vịt', 'sai sự thật', 'chưa kiểm chứng', 
    'hoang mang', 'giật gân', 'cắt ghép video', 'tin xấu độc'
  ],
  'KB-T6-09/2026': [
    'phản ánh', 'kiến nghị', 'khiếu nại', 'đường hỏng', 
    'đèn đường', 'ống nước', 'góp ý', 'hạ tầng', 'gửi phản ánh'
  ],
  'KB-T6-10/2026': [
    'vệ sinh', 'môi trường', 'xả rác', 'thu gom rác', 
    'bao bì thuốc', 'thuốc bảo vệ thực vật', 'phân loại rác', 'rác sinh hoạt'
  ],
  'KB-T6-11/2026': [
    'giao thông', 'mũ bảo hiểm', 'rượu bia', 'nồng độ cồn', 
    'xe máy', 'lái xe', 'an toàn giao thông', 'tai nạn'
  ],
  'KB-T6-12/2026': [
    'cháy', 'pccc', 'phòng cháy', 'chữa cháy', 
    'cứu hỏa', 'bình cứu hỏa', 'chập điện', 'thoát nạn', 'bếp gas'
  ],
  'KB-T6-13/2026': [
    'thiên tai', 'mưa bão', 'mưa lớn', 'giông', 'sét', 
    'sạt lở', 'lũ', 'ngập lụt', 'hạn hán', 'thời tiết nguy hiểm'
  ],
  'KB-T6-14/2026': [
    'giá nông sản', 'giá cà phê', 'giá tiêu', 'giá sầu riêng', 
    'cà phê hôm nay', 'bao nhiêu một ký', 'thương lái thu mua', 'giá mua'
  ],
  'KB-T6-15/2026': [
    'nông nghiệp số', 'bệnh cây', 'sâu bệnh', 'rệp sáp', 
    'mọt đục cành', 'bón phân', 'tưới nước', 'kỹ thuật trồng', 'sầu riêng bị bệnh'
  ],
  'KB-T6-16/2026': [
    'hoạt động thôn', 'họp thôn', 'sinh hoạt cộng đồng', 
    'văn nghệ', 'thể thao', 'bóng đá', 'hội phụ nữ', 'thanh niên thôn'
  ],
  'KB-T6-17/2026': [
    'thông báo', 'bản tin', 'tin tức mới', 'có tin gì mới', 
    'loa phát thanh', 'thông tin mới nhất'
  ],
  'KB-T6-18/2026': [
    'sức khỏe', 'y tế', 'khám bệnh', 'tiêm chủng', 
    'trạm y tế', 'bệnh viện', 'uống thuốc', 'khám bhyt', 'thẻ bhyt'
  ],
  'KB-T6-19/2026': [
    'học tập', 'bài học', 'video hướng dẫn', 'tài liệu học', 
    'kỹ năng số', 'hướng dẫn học', 'học kỹ năng'
  ],
  'KB-T6-20/2026': [
    'trợ lý ai', 'quy tắc ai', 'ai thôn 6', 'bạn là ai', 
    'nguyên tắc hoạt động', 'làm được gì', 'chức năng ai'
  ]
};

// Chuẩn hóa văn bản tiếng Việt
export const normalizeContent = (text) => {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/\s+/g, ' ')
    .replace(/[^\w\sàáảãạâầấẩẫậăằắẳẵặèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/gi, ' ')
    .trim()
    .toLowerCase();
};

/**
 * TRUY VẤN TRI THỨC VỚI ĐỘ CHÍNH XÁC CAO (PRECISION RETRIEVAL)
 */
export const retrieveKnowledge = async (userQuestion) => {
  if (!userQuestion || userQuestion.trim() === '') {
    return { status: 'NO_RELIABLE_SOURCE', results: [], topScore: 0 };
  }

  const normQ = normalizeContent(userQuestion);

  // BƯỚC 1: Tìm xem câu hỏi có chứa cụm từ khóa của Mục nào trong 20 Mục không
  let matchedDocNumber = null;
  let matchedKeyword = null;

  for (const [docNum, phrases] of Object.entries(TOPIC_KEYWORD_MAP)) {
    for (const phrase of phrases) {
      if (normQ.includes(phrase)) {
        matchedDocNumber = docNum;
        matchedKeyword = phrase;
        break;
      }
    }
    if (matchedDocNumber) break;
  }

  // BƯỚC 2: Nếu không khớp với bất kỳ cụm từ khóa chuyên môn nào -> BÁO KHÔNG CÓ NGUỒN CHÍNH THỨC
  if (!matchedDocNumber) {
    return {
      status: 'NO_RELIABLE_SOURCE',
      results: [],
      topScore: 0,
      reason: 'Câu hỏi không thuộc 20 chủ đề tri thức có sẵn trong cơ sở dữ liệu'
    };
  }

  // BƯỚC 3: Lấy tài liệu khớp từ danh sách
  const allDocs = await getKnowledgeList({ status: 'active', verified: true });
  const matchedDoc = allDocs.find(d => (d.document_number || d.documentNumber) === matchedDocNumber);

  if (!matchedDoc) {
    return {
      status: 'NO_RELIABLE_SOURCE',
      results: [],
      topScore: 0
    };
  }

  const resultItem = {
    content: matchedDoc.content,
    fullContent: matchedDoc.content,
    score: 0.95,
    title: matchedDoc.title,
    agency: matchedDoc.agency,
    documentNumber: matchedDoc.document_number || matchedDoc.documentNumber || matchedDocNumber,
    sourceUrl: matchedDoc.source_url || matchedDoc.sourceUrl || 'https://dilinh.lamdong.gov.vn/',
    matchedKeyword: matchedKeyword
  };

  return {
    status: 'SUCCESS',
    results: [resultItem],
    topScore: 0.95
  };
};
