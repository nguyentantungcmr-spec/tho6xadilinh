import { supabase } from './supabaseClient.js';

/**
 * MOCK OFFICIAL KNOWLEDGE REPOSITORY
 * Kho dữ liệu chính thống chuẩn hóa phục vụ giải đáp trực tiếp cho bà con Thôn 6 Xã Di Linh
 */
const INITIAL_KNOWLEDGE_REPO = [
  {
    id: 'know-bhyt-qr',
    title: 'Hướng dẫn quét mã QR thẻ BHYT trên ứng dụng VNeID và VssID khi khám chữa bệnh tại Di Linh',
    category: 'QR_CODE',
    agency: 'Bảo hiểm Xã hội Huyện Di Linh & Trung tâm Y tế Huyện Di Linh',
    document_number: '05/HD-BHXH-TTYT',
    issue_date: '2026-01-15',
    effective_date: '2026-01-15',
    source_url: 'https://dilinh.lamdong.gov.vn/',
    locality: 'Di Linh, Lâm Đồng',
    content: 'Địa điểm quét mã QR BHYT: Bà con Thôn 6 có thể sử dụng mã QR BHYT để khám chữa bệnh tại Trung tâm Y tế Huyện Di Linh, Trạm Y tế Xã Di Linh và tất cả các bệnh viện, phòng khám BHYT trên toàn tỉnh Lâm Đồng mà không cần mang theo thẻ BHYT giấy.\n\nCác bước thực hiện trên điện thoại:\n1. Mở ứng dụng VNeID (đã kích hoạt Mức 2) hoặc ứng dụng VssID (BHXH số).\n2. Vào mục "Ví giấy tờ" -> Chọn mục "Thẻ BHYT" -> Nhập mã Passcode 6 số để mở thẻ.\n3. Đưa mã QR hiển thị trên màn hình cho cán bộ y tế tại Quầy Tiếp Đón để quét vào hệ thống.\n\nLưu ý: Nếu chưa tích hợp BHYT vào VNeID, bà con mang CCCD và thẻ BHYT giấy đến Công an Xã Di Linh hoặc liên hệ Tổ CNS Thôn 6 (Hotline: 0943.849.295) để được hỗ trợ tích hợp miễn phí tận nhà.',
    verified: true,
    status: 'active',
    last_updated: '2026-01-15T08:00:00.000Z'
  },
  {
    id: 'know-vneid-level2',
    title: 'Kế hoạch triển khai Định danh điện tử VNeID Mức 2 trên địa bàn Xã Di Linh năm 2026',
    category: 'VNEID',
    agency: 'UBND Huyện Di Linh & Công an Xã Di Linh',
    document_number: '15/KH-UBND',
    issue_date: '2026-01-10',
    effective_date: '2026-01-15',
    source_url: 'https://dilinh.lamdong.gov.vn/',
    locality: 'Di Linh, Lâm Đồng',
    content: 'Tất cả công dân từ đủ 14 tuổi trở lên cư trú tại Thôn 6 Xã Di Linh được hướng dẫn đăng ký, kích hoạt tài khoản định danh điện tử VNeID Mức 2.\n\nĐịa điểm làm thủ tục: Trụ sở Công an Xã Di Linh hoặc các buổi lưu động tại Nhà sinh hoạt cộng đồng Thôn 6.\n\nGiấy tờ cần mang theo: Thẻ CCCD gắn chip và điện thoại có số thuê bao chính chủ.\n\nQuy trình 3 bước:\n1. Cán bộ Công an thu nhận dấu vân tay và chụp ảnh chân dung.\n2. Hệ thống gửi tin nhắn SMS từ VNeID có chứa liên kết và mã kích hoạt.\n3. Mở ứng dụng VNeID, nhập mã xác thực, tạo mật khẩu và mã passcode 6 số.\nSau khi kích hoạt Mức 2, tài khoản có thể dùng thay thế thẻ CCCD, thẻ BHYT, Giấy phép lái xe và thực hiện Dịch vụ công trực tuyến 24/7.',
    verified: true,
    status: 'active',
    last_updated: '2026-01-15T08:00:00.000Z'
  },
  {
    id: 'know-scam-alert',
    title: 'Hướng dẫn nhận biết và phòng chống các thủ đoạn lừa đảo chiếm đoạt tài sản trên không gian mạng',
    category: 'SCAM',
    agency: 'Công an Huyện Di Linh & Tổ CNS Cộng đồng Thôn 6',
    document_number: '02/TB-CAH',
    issue_date: '2026-02-01',
    effective_date: '2026-02-01',
    source_url: 'https://dilinh.lamdong.gov.vn/',
    locality: 'Di Linh, Lâm Đồng',
    content: 'Cảnh báo 5 thủ đoạn lừa đảo phổ biến tại Di Linh:\n1. Cuộc gọi mạo danh Công an, Tòa án, Viện kiểm sát đe dọa liên quan vi phạm và yêu cầu chuyển tiền vào "tài khoản an toàn".\n2. Mạo danh cán bộ hướng dẫn cập nhật VNeID Mức 2 bằng cách gửi đường link tải ứng dụng lạ (file .apk) chứa mã độc chiếm đoạt tài khoản ngân hàng.\n3. Tin nhắn báo trúng thưởng, quà tặng tri ân hoặc tuyển cộng tác viên làm việc online thu nhập cao.\n4. Giả danh người thân dùng công nghệ Deepfake gọi video mượn tiền cấp cứu.\n5. Cuộc gọi dọa khóa SIM điện thoại sau 2 giờ nếu không cung cấp thông tin.\n\nNGUYÊN TẮC VÀNG:\n- Cơ quan Công an và cơ quan nhà nước KHÔNG BAO GIỜ làm việc qua điện thoại và KHÔNG BAO GIỜ yêu cầu chuyển tiền.\n- Tuyệt đối KHÔNG cung cấp mã OTP, mật khẩu hay mã PIN cho bất kỳ ai.\n- Khi có dấu hiệu nghi ngờ, gọi ngay Hotline Tổ CNS Thôn 6: 0943.849.295 hoặc đến Công an Xã Di Linh.',
    verified: true,
    status: 'active',
    last_updated: '2026-02-01T09:15:00.000Z'
  },
  {
    id: 'know-qr-payment',
    title: 'Hướng dẫn thanh toán không dùng tiền mặt và quét mã QR An toàn tại Thôn 6',
    category: 'QR_CODE',
    agency: 'Tổ Công nghệ số Cộng đồng Thôn 6',
    document_number: '01/HD-CNS6',
    issue_date: '2026-01-20',
    effective_date: '2026-01-20',
    source_url: 'https://dilinh.lamdong.gov.vn/',
    locality: 'Di Linh, Lâm Đồng',
    content: 'Bà con Thôn 6 có thể dùng ứng dụng Ngân hàng (Vietcombank, Agribank, BIDV, MBBank...) hoặc Ví điện tử (Viettel Money, MoMo, ZaloPay) để quét mã QR thanh toán tiền điện, tiền nước sinh hoạt, mua bán phân bón, nông sản và tạp hóa trong thôn.\n\nCác bước thực hiện:\n1. Mở ứng dụng ngân hàng hoặc ví điện tử trên điện thoại.\n2. Chọn biểu tượng "Quét mã QR".\n3. Hướng camera vào mã QR của cửa hàng hoặc trên hóa đơn tiền điện, nước.\n4. Kiểm tra kỹ tên người nhận và số tiền trước khi bấm xác nhận chuyển tiền.',
    verified: true,
    status: 'active',
    last_updated: '2026-01-20T14:20:00.000Z'
  },
  {
    id: 'know-dvc-procedure',
    title: 'Quy trình nộp hồ sơ thủ tục hành chính trực tuyến trên Cổng Dịch vụ công',
    category: 'PUBLIC_SERVICE',
    agency: 'Bộ phận Một cửa UBND Xã Di Linh',
    document_number: '08/HD-UBND',
    issue_date: '2026-01-05',
    effective_date: '2026-01-05',
    source_url: 'https://dilinh.lamdong.gov.vn/',
    locality: 'Di Linh, Lâm Đồng',
    content: 'Người dân có thể nộp trực tuyến 24/7 các thủ tục hành chính như: Đăng ký khai sinh, Chứng thực bản sao điện tử, Đăng ký kết hôn, Cấp đổi giấy phép lái xe, Thông báo lưu trú...\n\nQuy trình 4 bước:\nBước 1: Truy cập Cổng Dịch vụ công tại địa chỉ dichvucong.gov.vn hoặc dilinh.lamdong.gov.vn.\nBước 2: Đăng nhập bằng tài khoản VNeID Mức 2.\nBước 3: Chọn thủ tục cần nộp, điền tờ khai và đính kèm ảnh chụp giấy tờ.\nBước 4: Nhận mã hồ sơ để tra cứu tiến độ, nhận kết quả tại nhà qua bưu điện hoặc tại Bộ phận Một cửa UBND Xã Di Linh.',
    verified: true,
    status: 'active',
    last_updated: '2026-01-05T11:00:00.000Z'
  },
  {
    id: 'know-zalo-skills',
    title: 'Cẩm nang kỹ năng số: Hướng dẫn người dân sử dụng Zalo gọi điện video và đọc tin tức Thôn 6',
    category: 'DIGITAL_SKILLS',
    agency: 'Đoàn Thanh Niên & Tổ CNS Cộng đồng Thôn 6',
    document_number: '03/HD-DTN',
    issue_date: '2026-01-18',
    effective_date: '2026-01-18',
    source_url: 'https://dilinh.lamdong.gov.vn/',
    locality: 'Di Linh, Lâm Đồng',
    content: 'Hướng dẫn bà con Thôn 6 sử dụng Zalo kết nối người thân và nhận tin tức thôn:\n1. Cách gọi video miễn phí: Mở Zalo -> Vào mục Danh bạ -> Chọn tên con/cháu/người thân -> Bấm vào biểu tượng Máy quay phim (ở góc trên cùng bên phải) để trò chuyện thấy hình ảnh.\n2. Cách tham gia nhóm Zalo Thôn 6: Quét mã QR nhóm thôn hoặc nhờ Tổ CNS thêm số điện thoại vào nhóm "Cộng Đồng Thôn 6 Xã Di Linh" để nhận thông báo lịch họp, lịch tiêm phòng, giá nông sản và cảnh báo an ninh trật tự.',
    verified: true,
    status: 'active',
    last_updated: '2026-01-18T09:00:00.000Z'
  },
  {
    id: 'know-cns-training',
    title: 'Kế hoạch hỗ trợ chuyển đổi số và lịch cầm tay chỉ việc cho người dân Thôn 6',
    category: 'DIGITAL_SKILLS',
    agency: 'Tổ Công nghệ số Cộng đồng Thôn 6 Xã Di Linh',
    document_number: '04/KH-CNS6',
    issue_date: '2026-02-05',
    effective_date: '2026-02-05',
    source_url: 'https://dilinh.lamdong.gov.vn/',
    locality: 'Di Linh, Lâm Đồng',
    content: 'Lịch hỗ trợ người dân Thôn 6:\n- Địa điểm tập trung: Nhà sinh hoạt cộng đồng Thôn 6 vào các ngày Thứ Bảy và Chủ Nhật hàng tuần (Sáng: 8h00 - 11h00, Chiều: 14h00 - 17h00).\n- Hỗ trợ tại nhà: Đội tình nguyện viên thanh niên sẵn sàng đến tận nhà hỗ trợ các bác cao tuổi, người neo đơn hoặc khuyết tật.\n- Nội dung hỗ trợ: Kích hoạt VNeID Mức 2, tích hợp BHYT, cài đặt ví điện tử thanh toán tiền điện nước, tạo mã QR nông sản và hướng dẫn nhận biết thủ đoạn lừa đảo.\n- Hotline hỗ trợ khẩn cấp: 0943.849.295 (Tổ trưởng Tổ CNS Thôn 6).',
    verified: true,
    status: 'active',
    last_updated: '2026-02-05T08:30:00.000Z'
  }
];

let mockStore = [...INITIAL_KNOWLEDGE_REPO];

// 1. LẤY DANH SÁCH TÀI LIỆU (Có bộ lọc và Timeout chống treo mạng)
export const getKnowledgeList = async (filters = {}) => {
  try {
    let query = supabase.from('official_knowledge_repository').select('*');

    if (filters.category && filters.category !== 'ALL') {
      query = query.eq('category', filters.category);
    }
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.verified !== undefined && filters.verified !== null) {
      query = query.eq('verified', filters.verified);
    }

    // Đặt timeout 400ms để nếu Supabase chậm hoặc chưa kết nối DB thì fallback ngay về mockStore
    const fetchPromise = query.order('last_updated', { ascending: false });
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 400));

    const { data, error } = await Promise.race([fetchPromise, timeoutPromise]);

    if (!error && data && data.length > 0) {
      return data;
    }
  } catch (err) {
    // Dùng dữ liệu chuẩn hóa mockStore
  }

  let filtered = [...mockStore];
  if (filters.category && filters.category !== 'ALL') {
    filtered = filtered.filter(item => item.category === filters.category);
  }
  if (filters.status) {
    filtered = filtered.filter(item => item.status === filters.status);
  }
  if (filters.verified !== undefined && filters.verified !== null) {
    filtered = filtered.filter(item => item.verified === filters.verified);
  }
  if (filters.search) {
    const s = filters.search.toLowerCase();
    filtered = filtered.filter(item => 
      item.title.toLowerCase().includes(s) || 
      item.content.toLowerCase().includes(s) ||
      item.document_number.toLowerCase().includes(s)
    );
  }
  return filtered;
};

// 2. THÊM TÀI LIỆU MỚI (Create)
export const createKnowledge = async (docData) => {
  const payload = {
    title: docData.title,
    category: docData.category || 'OTHER',
    agency: docData.agency || 'UBND Huyện Di Linh',
    document_number: docData.documentNumber || docData.document_number || '15/UBND',
    issue_date: docData.issueDate || docData.issue_date || new Date().toISOString().split('T')[0],
    effective_date: docData.effectiveDate || docData.effective_date || new Date().toISOString().split('T')[0],
    source_url: docData.sourceUrl || docData.source_url || 'https://dilinh.lamdong.gov.vn/',
    locality: docData.locality || 'Di Linh, Lâm Đồng',
    content: docData.content,
    verified: docData.verified !== undefined ? docData.verified : true,
    status: docData.status || 'active',
    last_updated: new Date().toISOString()
  };

  try {
    const { data, error } = await supabase
      .from('official_knowledge_repository')
      .insert([payload])
      .select();

    if (error || !data) {
      const newItem = { id: `know-${Date.now()}`, ...payload };
      mockStore.unshift(newItem);
      return { success: true, data: newItem };
    }

    return { success: true, data: data[0] };
  } catch (err) {
    const newItem = { id: `know-${Date.now()}`, ...payload };
    mockStore.unshift(newItem);
    return { success: true, data: newItem };
  }
};

// 3. SỬA TÀI LIỆU (Update)
export const updateKnowledge = async (id, docData) => {
  const payload = {
    ...docData,
    last_updated: new Date().toISOString()
  };

  try {
    const { data, error } = await supabase
      .from('official_knowledge_repository')
      .update(payload)
      .eq('id', id)
      .select();

    if (error || !data) {
      const idx = mockStore.findIndex(item => item.id === id);
      if (idx !== -1) {
        mockStore[idx] = { ...mockStore[idx], ...payload };
        return { success: true, data: mockStore[idx] };
      }
    }
    return { success: true, data: data ? data[0] : null };
  } catch (err) {
    const idx = mockStore.findIndex(item => item.id === id);
    if (idx !== -1) {
      mockStore[idx] = { ...mockStore[idx], ...payload };
      return { success: true, data: mockStore[idx] };
    }
    return { success: false, error: err.message };
  }
};

// 4. XÓA TÀI LIỆU (Delete)
export const deleteKnowledge = async (id) => {
  try {
    const { error } = await supabase
      .from('official_knowledge_repository')
      .delete()
      .eq('id', id);

    mockStore = mockStore.filter(item => item.id !== id);
    return { success: true };
  } catch (err) {
    mockStore = mockStore.filter(item => item.id !== id);
    return { success: true };
  }
};

// 5. BẬT/TẮT TÀI LIỆU (Status Active/Inactive)
export const toggleKnowledgeStatus = async (id, currentStatus) => {
  const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
  return await updateKnowledge(id, { status: newStatus });
};

// 6. ĐÁNH DẤU "ĐÃ XÁC MINH" (Verified True/False)
export const toggleKnowledgeVerified = async (id, currentVerified) => {
  return await updateKnowledge(id, { verified: !currentVerified });
};
