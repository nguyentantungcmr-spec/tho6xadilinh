import { getKnowledgeList } from './officialKnowledgeService.js';

/**
 * HỆ THỐNG RAG ENGINE CHUẨN XÁC CAO (PRECISION RETRIEVAL-AUGMENTED GENERATION ENGINE)
 * Khớp chuẩn 20 Mục Tri Thức KB-T6-01 đến KB-T6-20, loại bỏ hoàn toàn hiện tượng lệch nguồn
 */

// Danh sách từ dừng (Stop Words) không dùng để so khớp độ liên quan
const STOP_WORDS = new Set([
  'thôn', '6', 'thon', 'xã', 'xa', 'di', 'linh', 'lâm', 'đồng', 'tôi', 'bác', 'em', 'cho', 'hỏi', 
  'như', 'thế', 'nào', 'ở', 'đâu', 'là', 'gì', 'và', 'các', 'của', 'có', 'được', 'không', 'với',
  'về', 'trong', 'để', 'khi', 'này', 'đó', 'một', 'những', 'ra', 'sao', 'làm'
]);

// Bản đồ từ khóa đặc trưng cho 20 Mục Tri Thức
const TOPIC_KEYWORD_MAP = {
  'KB-T6-01/2026': ['vneid', 'định danh', 'cccd', 'mức 2', 'passcode', 'kích hoạt vneid', 'quên mật khẩu vneid', 'mã pin'],
  'KB-T6-02/2026': ['lừa đảo', 'giả danh', 'mạo danh', 'deepfake', 'video call', 'cuộc gọi lạ', 'chiếm đoạt', 'bị lừa', 'link lạ', 'file apk', 'mất tiền'],
  'KB-T6-03/2026': ['người cao tuổi', 'người già', 'ông bà', 'bố mẹ', 'lớn tuổi', 'chậm', 'khó dùng', 'cầm tay chỉ việc'],
  'KB-T6-04/2026': ['dịch vụ công', 'thủ tục', 'hành chính', 'khai sinh', 'kết hôn', 'khai tử', 'trích lục', 'chứng thực', 'đất đai', 'dichvucong'],
  'KB-T6-05/2026': ['qr', 'mã qr', 'quét qr', 'dán đè', 'quét mã'],
  'KB-T6-06/2026': ['thanh toán', 'chuyển tiền', 'chuyển khoản', 'ngân hàng', 'banking', 'chuyển nhầm', 'không dùng tiền mặt', 'ví điện tử'],
  'KB-T6-07/2026': ['bảo vệ thông tin', 'mật khẩu', 'lộ thông tin', 'mất điện thoại', 'dữ liệu cá nhân', 'lộ otp', 'bảo mật'],
  'KB-T6-08/2026': ['tin giả', 'tin vịt', 'sai sự thật', 'chưa kiểm chứng', 'hoang mang', 'giật gân', 'cắt ghép', 'tin xấu'],
  'KB-T6-09/2026': ['phản ánh', 'kiến nghị', 'khiếu nại', 'đường hỏng', 'đèn đường', 'ống nước', 'góp ý', 'hạ tầng'],
  'KB-T6-10/2026': ['vệ sinh', 'môi trường', 'xả rác', 'rác', 'thu gom rác', 'bao bì thuốc', 'thuốc trừ sâu', 'phân loại rác'],
  'KB-T6-11/2026': ['giao thông', 'mũ bảo hiểm', 'rượu bia', 'nồng độ cồn', 'xe máy', 'lái xe', 'an toàn giao thông', 'đường xá'],
  'KB-T6-12/2026': ['cháy', 'pccc', 'phòng cháy', 'chữa cháy', 'cứu hỏa', 'bình cứu hỏa', 'chập điện', 'thoát nạn'],
  'KB-T6-13/2026': ['thiên tai', 'bão', 'mưa lớn', 'giông', 'sét', 'sạt lở', 'lũ', 'ngập lụt', 'hạn hán', 'mưa bão'],
  'KB-T6-14/2026': ['giá nông sản', 'giá cà phê', 'giá tiêu', 'giá sầu riêng', 'cà phê hôm nay', 'bao nhiêu một ký', 'thương lái'],
  'KB-T6-15/2026': ['nông nghiệp số', 'bệnh cây', 'sâu bệnh', 'rệp sáp', 'mọt đục cành', 'bón phân', 'tưới nước', 'kỹ thuật trồng'],
  'KB-T6-16/2026': ['hoạt động thôn', 'họp thôn', 'sinh hoạt', 'văn nghệ', 'thể thao', 'bóng đá', 'hội phụ nữ', 'thanh niên'],
  'KB-T6-17/2026': ['thông báo', 'bản tin', 'tin tức mới', 'có tin gì', 'loa phát thanh', 'thông tin mới'],
  'KB-T6-18/2026': ['sức khỏe', 'y tế', 'khám bệnh', 'tiêm chủng', 'trạm y tế', 'bệnh viện', 'uống thuốc', 'khám bhyt'],
  'KB-T6-19/2026': ['học tập', 'bài học', 'video hướng dẫn', 'tài liệu', 'kỹ năng số', 'hướng dẫn học', 'học kỹ năng'],
  'KB-T6-20/2026': ['trợ lý ai', 'quy tắc ai', 'ai thôn 6', 'bạn là ai', 'nguyên tắc hoạt động', 'làm được gì']
};

// 1. Chuẩn hóa nội dung tài liệu (Content Normalization)
export const normalizeContent = (text) => {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/\s+/g, ' ')
    .replace(/[^\w\sàáảãạâầấẩẫậăằắẳẵặèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/gi, ' ')
    .trim()
    .toLowerCase();
};

// 2. Chia tài liệu thành các đoạn hợp lý (Document Chunking)
export const chunkDocument = (content, chunkSize = 150, overlap = 30) => {
  if (!content) return [];
  const words = content.split(' ');
  const chunks = [];

  for (let i = 0; i < words.length; i += (chunkSize - overlap)) {
    const chunkWords = words.slice(i, i + chunkSize);
    if (chunkWords.length > 10) {
      chunks.push(chunkWords.join(' '));
    }
  }

  return chunks.length > 0 ? chunks : [content];
};

// 3. Tạo Embedding từ vựng (Word Frequency Vector) có lọc Stop Words
export const generateEmbedding = (text) => {
  const words = normalizeContent(text).split(' ');
  const freqMap = {};
  words.forEach(w => {
    if (w.length > 1 && !STOP_WORDS.has(w)) {
      freqMap[w] = (freqMap[w] || 0) + 1;
    }
  });
  return freqMap;
};

// Hàm tính khoảng cách Cosine Similarity giữa 2 vector từ vựng
export const calculateCosineSimilarity = (vecA, vecB) => {
  const keysA = Object.keys(vecA);
  const keysB = Object.keys(vecB);

  if (keysA.length === 0 || keysB.length === 0) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  keysA.forEach(key => {
    const valA = vecA[key];
    normA += valA * valA;
    if (vecB[key]) {
      dotProduct += valA * vecB[key];
    }
  });

  keysB.forEach(key => {
    const valB = vecB[key];
    normB += valB * valB;
  });

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

/**
 * 4. TRUY VẤN KHO TRI THỨC ĐA TẦNG (MULTI-LAYER PRECISION RETRIEVAL)
 */
export const retrieveKnowledge = async (userQuestion, topK = 5, minScoreThreshold = 0.25) => {
  if (!userQuestion || userQuestion.trim() === '') {
    return { status: 'NO_RELIABLE_SOURCE', results: [], topScore: 0 };
  }

  // BƯỚC 1: Lấy toàn bộ 20 mục tri thức
  const activeVerifiedDocs = await getKnowledgeList({ status: 'active', verified: true });

  if (!activeVerifiedDocs || activeVerifiedDocs.length === 0) {
    return { status: 'NO_RELIABLE_SOURCE', results: [], topScore: 0 };
  }

  const normQ = normalizeContent(userQuestion);
  const questionEmbedding = generateEmbedding(userQuestion);
  const candidateChunks = [];

  // BƯỚC 2: Kiểm tra khớp từ khóa chuyên biệt theo từng mục
  let matchedDocNumber = null;
  for (const [docNum, keywords] of Object.entries(TOPIC_KEYWORD_MAP)) {
    const isDirectMatch = keywords.some(k => normQ.includes(k));
    if (isDirectMatch) {
      matchedDocNumber = docNum;
      break;
    }
  }

  // BƯỚC 3: Duyệt từng tài liệu và tính điểm tương đồng
  for (const doc of activeVerifiedDocs) {
    const docNum = doc.document_number || doc.documentNumber || '';
    const normTitle = normalizeContent(doc.title);
    const chunks = chunkDocument(doc.content);

    for (const chunkText of chunks) {
      const chunkEmbedding = generateEmbedding(`${doc.title} ${chunkText}`);
      const cosineScore = calculateCosineSimilarity(questionEmbedding, chunkEmbedding);

      // Điểm từ vựng có ý nghĩa (bỏ stop words)
      const qWords = normQ.split(' ').filter(w => w.length >= 2 && !STOP_WORDS.has(w));
      let matchedWordCount = 0;
      qWords.forEach(w => {
        if (normTitle.includes(w) || normalizeContent(chunkText).includes(w)) {
          matchedWordCount++;
        }
      });

      const keywordRatio = qWords.length > 0 ? (matchedWordCount / qWords.length) : 0;
      let finalScore = (cosineScore * 0.4) + (keywordRatio * 0.6);

      // Nếu khớp đúng chuyên mục chủ đề theo bảng TOPIC_KEYWORD_MAP -> Thưởng điểm vượt trội
      if (matchedDocNumber && docNum === matchedDocNumber) {
        finalScore = Math.max(finalScore, 0.88) + 0.10;
      }

      candidateChunks.push({
        content: chunkText,
        fullContent: doc.content,
        score: Math.min(finalScore, 0.99),
        title: doc.title,
        agency: doc.agency,
        documentNumber: docNum,
        sourceUrl: doc.source_url || doc.sourceUrl || 'https://dilinh.lamdong.gov.vn/',
        lastUpdated: doc.last_updated || doc.lastUpdated || new Date().toISOString()
      });
    }
  }

  // BƯỚC 4: Sắp xếp theo score giảm dần và lấy Top K
  candidateChunks.sort((a, b) => b.score - a.score);
  const topResults = candidateChunks.slice(0, topK);
  const topScore = topResults.length > 0 ? topResults[0].score : 0;

  if (topScore < minScoreThreshold) {
    return {
      status: 'NO_RELIABLE_SOURCE',
      results: [],
      topScore: topScore
    };
  }

  return {
    status: 'SUCCESS',
    results: topResults,
    topScore: topScore
  };
};
