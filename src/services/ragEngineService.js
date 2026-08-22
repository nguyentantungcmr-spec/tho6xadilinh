import { getKnowledgeList } from './officialKnowledgeService.js';

/**
 * HỆ THỐNG RAG ENGINE (RETRIEVAL-AUGMENTED GENERATION ENGINE)
 * Chịu trách nhiệm Chunking, Vector Matching & Grounded Retrieval
 */

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

// 3. Tạo Embedding giả lập / Cosine Vector Simulation (hoặc OpenAI/Gemini Embeddings API)
export const generateEmbedding = (text) => {
  const words = normalizeContent(text).split(' ');
  const freqMap = {};
  words.forEach(w => {
    if (w.length > 1) {
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
 * 4 & 5. TRUY VẤN KHO TRI THỨC (RETRIEVAL PIPELINE)
 * Chỉ tìm trong tài liệu: verified = true VÀ status = 'active'
 * Lấy Top K (Top 5 kết quả) kèm similarity score & metadata nguồn
 */
export const retrieveKnowledge = async (userQuestion, topK = 5, minScoreThreshold = 0.35) => {
  if (!userQuestion || userQuestion.trim() === '') {
    return { status: 'NO_RELIABLE_SOURCE', results: [], topScore: 0 };
  }

  // BƯỚC 1: Lấy tài liệu ĐÃ XÁC MINH (verified = true) VÀ ĐANG HOẠT ĐỘNG (status = 'active')
  const activeVerifiedDocs = await getKnowledgeList({ status: 'active', verified: true });

  if (!activeVerifiedDocs || activeVerifiedDocs.length === 0) {
    return { status: 'NO_RELIABLE_SOURCE', results: [], topScore: 0 };
  }

  // BƯỚC 2: Tạo Vector Embedding cho câu hỏi người dân
  const questionEmbedding = generateEmbedding(userQuestion);

  const candidateChunks = [];

  // BƯỚC 3: Chunking & Vector Matching
  for (const doc of activeVerifiedDocs) {
    const chunks = chunkDocument(doc.content);

    for (const chunkText of chunks) {
      const chunkEmbedding = generateEmbedding(`${doc.title} ${chunkText}`);
      const cosineScore = calculateCosineSimilarity(questionEmbedding, chunkEmbedding);

      // Thưởng điểm thông minh theo từ khóa nghiệp vụ chuyển đổi số
      let finalScore = cosineScore;
      const normQ = normalizeContent(userQuestion);
      const normTitle = normalizeContent(doc.title);
      const normContent = normalizeContent(chunkText);

      const qWords = normQ.split(' ').filter(w => w.length >= 2);
      let matchedWordCount = 0;
      qWords.forEach(w => {
        if (normTitle.includes(w) || normContent.includes(w)) {
          matchedWordCount++;
        }
      });

      const keywordRatio = qWords.length > 0 ? (matchedWordCount / qWords.length) : 0;
      finalScore = (cosineScore * 0.4) + (keywordRatio * 0.6);

      // Thưởng thêm nếu khớp từ khóa chuyên biệt (BHYT, VNeID, QR, lừa đảo...)
      const specializedKeywords = ['bhyt', 'vneid', 'qr', 'định danh', 'lừa đảo', 'dịch vụ công', 'khai sinh', 'zalo', 'tiền điện', 'thôn 6', 'di linh'];
      const hasSpecializedMatch = specializedKeywords.some(k => normQ.includes(k) && (normTitle.includes(k) || normContent.includes(k)));
      if (hasSpecializedMatch) {
        finalScore = Math.max(finalScore, 0.75) + 0.15;
      }

      candidateChunks.push({
        content: chunkText,
        score: Math.min(finalScore, 0.99),
        title: doc.title,
        agency: doc.agency,
        documentNumber: doc.document_number || doc.documentNumber,
        sourceUrl: doc.source_url || doc.sourceUrl || 'https://dilinh.lamdong.gov.vn/',
        lastUpdated: doc.last_updated || doc.lastUpdated || new Date().toISOString()
      });
    }
  }

  // BƯỚC 4: Sắp xếp theo score giảm dần và lấy Top K
  candidateChunks.sort((a, b) => b.score - a.score);
  const topResults = candidateChunks.slice(0, topK);

  const topScore = topResults.length > 0 ? topResults[0].score : 0;

  // BƯỚC 5: Nếu điểm tương quan quá thấp (< threshold) -> Trả về NO_RELIABLE_SOURCE
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
