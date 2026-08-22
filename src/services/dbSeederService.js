import { supabase } from './supabaseClient';

/**
 * SERVICE TỰ ĐỘNG KHỞI TẠO & ĐỒNG BỘ DỮ LIỆU THỰC TẾ VÀO SUPABASE
 */

export const REAL_INITIAL_DATA = {
  // 1. GIÁ NÔNG SẢN
  agri_market_prices: [
    {
      id: 'coffee-robusta',
      name: 'Cà phê Robusta (Nhân xô)',
      unit: 'kg',
      price_str: '119.500 – 122.000',
      avg_price: 121000,
      trend: 'up',
      change_str: '+1.500 đ/kg',
      note: 'Đạt mức giá cao kỷ lục, thương lái thu mua mạnh',
      icon: '☕',
      sort_order: 1
    },
    {
      id: 'coffee-fresh',
      name: 'Cà phê quả tươi chín (Hái chọn)',
      unit: 'kg',
      price_str: '24.000 – 26.500',
      avg_price: 25000,
      trend: 'up',
      change_str: '+500 đ/kg',
      note: 'Ưu tiên vườn hái chín trên 90%',
      icon: '🍒',
      sort_order: 2
    },
    {
      id: 'durian-monthong',
      name: 'Sầu riêng Monthong (Loại 1)',
      unit: 'kg',
      price_str: '85.000 – 95.000',
      avg_price: 90000,
      trend: 'stable',
      change_str: 'Ổn định',
      note: 'Cắt tại vườn, thương lái đóng thùng xuất khẩu',
      icon: '🍈',
      sort_order: 3
    },
    {
      id: 'durian-ri6',
      name: 'Sầu riêng Ri6 (Loại 1)',
      unit: 'kg',
      price_str: '60.000 – 68.000',
      avg_price: 65000,
      trend: 'stable',
      change_str: 'Ổn định',
      note: 'Cơm vàng hạt lép, chất lượng đồng đều',
      icon: '🍈',
      sort_order: 4
    },
    {
      id: 'pepper-black',
      name: 'Hồ tiêu đen Di Linh',
      unit: 'kg',
      price_str: '148.000 – 152.000',
      avg_price: 150000,
      trend: 'up',
      change_str: '+2.000 đ/kg',
      note: 'Dung tích hạt chắc, tiêu khô bảo quản tốt',
      icon: '🌿',
      sort_order: 5
    },
    {
      id: 'macadamia',
      name: 'Hạt Mắc ca tươi (Vỏ xanh)',
      unit: 'kg',
      price_str: '75.000 – 82.000',
      avg_price: 78000,
      trend: 'stable',
      change_str: 'Ổn định',
      note: 'Thu mua chế biến sấy nứt vỏ chất lượng cao',
      icon: '🌰',
      sort_order: 6
    }
  ],

  // 2. THỜI TIẾT DI LINH
  weather_daily: [
    {
      id: 'current_weather',
      location: 'Huyện Di Linh, Tỉnh Lâm Đồng',
      temp_current: 24,
      temp_min: 19,
      temp_max: 29,
      humidity: 78,
      rain_probability: 45,
      wind_speed: '12 km/h',
      uv_index: 6,
      condition: 'Mây thay đổi, ngày nắng, chiều tối có mưa rào rải rác',
      icon: '⛅',
      advice: 'Thời tiết thích hợp để bón phân đợt cuối và tỉa cành thông thoáng. Tránh xịt thuốc phòng nấm khi trời chuyển mây đen chiều tối.',
      forecast: [
        { time: 'Sáng', temp: '22°C', icon: '🌤️', desc: 'Nắng nhẹ, gió mát' },
        { time: 'Trưa', temp: '28°C', icon: '☀️', desc: 'Nắng ấm ráo' },
        { time: 'Chiều', temp: '25°C', icon: '🌦️', desc: 'Mưa rào cục bộ' },
        { time: 'Tối', temp: '20°C', icon: '🌙', desc: 'Trời mát mẻ, se lạnh' }
      ]
    }
  ],

  // 3. KHO BÀI HỌC KỸ NĂNG SỐ
  learning_resources: [
    {
      title: '🎥 Video Hướng Dẫn Kỹ Năng Số Cầm Tay Chỉ Việc - Phần 1',
      description: 'Cẩm nang video hướng dẫn chi tiết trực quan các thao tác công nghệ số thiết yếu, hỗ trợ bà con Thôn 6 xem và thực hành dễ dàng.',
      type: 'video',
      category: 'Tôi Muốn Học',
      media_url: 'https://www.youtube.com/embed/pu3IBvcnC9U',
      source_author: 'Tổ Công nghệ số Cộng đồng Thôn 6',
      view_count: 245,
      senior_friendly: true,
      status: 'published'
    },
    {
      title: '🎥 Video Hướng Dẫn Kỹ Năng Số Thực Hành Trực Quan - Phần 2',
      description: 'Video cẩm nang tiếp theo hướng dẫn chi tiết các thao tác công nghệ số thực tế, giúp người dân Thôn 6 làm chủ ứng dụng số dễ dàng.',
      type: 'video',
      category: 'Tôi Muốn Học',
      media_url: 'https://www.youtube.com/embed/HvSLR4j1baY',
      source_author: 'Tổ Công nghệ số Cộng đồng Thôn 6',
      view_count: 198,
      senior_friendly: true,
      status: 'published'
    },
    {
      title: '🎥 Video Hướng Dẫn Kỹ Năng Số Nâng Cao - Phần 3',
      description: 'Cẩm nang video thực hành chuyên sâu giúp người dân Thôn 6 tiếp cận nền tảng công nghệ và ứng dụng thông minh trong đời sống.',
      type: 'video',
      category: 'Tôi Muốn Học',
      media_url: 'https://www.youtube.com/embed/HSmgjZ4Q6dM',
      source_author: 'Tổ Công nghệ số Cộng đồng Thôn 6',
      view_count: 280,
      senior_friendly: true,
      status: 'published'
    },
    {
      title: '🎥 Video Hướng Dẫn Kích Hoạt VNeID Mức 2 & Tra Cứu Dịch Vụ Công',
      description: 'Hướng dẫn trực quan chi tiết từng nút bấm trên điện thoại giúp người dân kích hoạt tài khoản định danh điện tử VNeID.',
      type: 'video',
      category: 'VNeID & Dịch vụ công',
      media_url: 'https://www.youtube.com/embed/pu3IBvcnC9U',
      source_author: 'Công an Xã Di Linh - Tổ CNS',
      view_count: 312,
      senior_friendly: true,
      status: 'published'
    },
    {
      title: '🎥 Video Hướng Dẫn Gọi Điện Video Zalo Kết Nối Người Thân',
      description: 'Video thao tác màn hình lớn đơn giản giúp các bác cao tuổi tự tin gọi video trò chuyện với con cháu.',
      type: 'video',
      category: 'Sử dụng Zalo',
      media_url: 'https://www.youtube.com/embed/HvSLR4j1baY',
      source_author: 'Đoàn Thanh Niên Thôn 6',
      view_count: 175,
      senior_friendly: true,
      status: 'published'
    },
    {
      title: '✨ Hướng dẫn 4 bước quét mã QR thanh toán & Dịch vụ công',
      description: 'Thao tác cầm tay chỉ việc chi tiết từng bước mở camera hoặc ứng dụng Zalo để quét QR an toàn.',
      type: 'infographic',
      category: 'Quét QR',
      media_url: 'https://images.unsplash.com/photo-1595079672139-cee4c06cdc92?auto=format&fit=crop&w=1000&q=80',
      source_author: 'Tổ Công nghệ số cộng đồng Thôn 6',
      view_count: 98,
      senior_friendly: true,
      status: 'published'
    },
    {
      title: '🛡️ 5 Dấu hiệu nhận biết lừa đảo qua cuộc gọi & tin nhắn',
      description: 'Tài liệu infographic trực quan giúp người cao tuổi phòng tránh bị chiếm đoạt tài khoản ngân hàng.',
      type: 'infographic',
      category: 'An toàn số',
      media_url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1000&q=80',
      source_author: 'Cục An toàn thông tin - Bộ TT&TT',
      view_count: 210,
      senior_friendly: true,
      status: 'published'
    },
    {
      title: '🎙️ Podcast 2 phút: Cảnh báo chiêu trò giả danh VNeID',
      description: 'Bản thu âm ngắn truyền thanh cho người dân không tiện đọc chữ, phân tích thủ đoạn lừa đảo.',
      type: 'audio',
      category: 'An toàn số',
      media_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      source_author: 'Đài Truyền thanh Xã Di Linh',
      view_count: 85,
      senior_friendly: true,
      status: 'published'
    }
  ],

  // 4. BẢN TIN THỜI SỰ & NÔNG NGHIỆP
  news_articles: [
    {
      title: '☕ Giá Cà Phê Di Linh & Dự Báo Nông Nghiệp Hôm Nay',
      summary: 'Cập nhật thị trường nông sản hôm nay tại huyện Di Linh: Giá cà phê Robusta nhân xô neo cao ở mức 118.000đ - 122.500đ/kg, hướng dẫn kỹ thuật chăm sóc vườn và kết nối tiêu thụ nông sản số.',
      content: `BẢN TIN THỊ TRƯỜNG NÔNG SẢN DI LINH HÔM NAY:

1. TÌNH HÌNH GIÁ NÔNG SẢN:
- Giá Cà phê Robusta nhân xô thu mua: Dao động từ 118.000đ – 122.500đ/kg.
- Giá Sầu riêng Monthong & Ri6 loại 1 giữ mức cao.
- Khuyến cáo bà con Thôn 6 ứng dụng tem quét mã QR truy xuất nguồn gốc chất lượng để nâng cao giá trị khi xuất bán.

2. HỖ TRỢ NÔNG DÂN SỐ:
Tổ CNS Thôn 6 hỗ trợ bà con kết nối bán hàng qua nhóm Zalo Cộng đồng và sàn thương mại điện tử miễn phí. Hotline: 0903.382.277.`,
      category: 'Nông Nghiệp Di Linh',
      category_color: 'bg-emerald-600',
      scope: 'dilinh',
      scope_label: '🏛️ Xã Di Linh',
      image_url: '/banner_2.png',
      source: 'Ban Nông Nghiệp Xã Di Linh',
      author: 'Tổ Khuyến Nông',
      published_date: 'Cập nhật hôm nay',
      views: 520,
      is_urgent: false,
      is_new: true
    },
    {
      title: '📢 UBND Xã Di Linh Thông Báo: Đợt Cao Điểm Kích Hoạt VNeID Mức 2 & Dịch Vụ Công Toàn Trình',
      summary: 'Công an xã phối hợp cùng Tổ Công nghệ số Thôn 6 tổ chức hỗ trợ người dân cài đặt định danh điện tử, tích hợp BHYT và giải quyết thủ tục giấy tờ trực tuyến tại cơ sở.',
      content: `KẾ HOẠCH CAO ĐIỂM CHUYỂN ĐỔI SỐ TẠI XÃ DI LINH:

Nhằm phục vụ nhân dân tốt nhất, UBND Xã Di Linh triển khai:
1. Hỗ trợ kích hoạt VNeID Mức 2 cho 100% người dân.
2. Tích hợp Thẻ BHYT, Giấy phép lái xe vào điện thoại.
3. Đội tình nguyện viên lưu động đến tận nhà hỗ trợ các cụ cao tuổi.`,
      category: 'Thông Báo Xã',
      category_color: 'bg-blue-600',
      scope: 'dilinh',
      scope_label: '🏛️ Xã Di Linh',
      image_url: '/banner_1.jpg',
      source: 'UBND Xã Di Linh',
      author: 'Tổ CNS Cộng Đồng',
      published_date: 'Cập nhật hôm nay',
      views: 740,
      is_urgent: true,
      is_new: true
    },
    {
      title: '🚗 Lâm Đồng Đẩy Nhanh Tiến Độ Dự Án Cao Tốc Tân Phú - Bảo Lộc - Liên Khương Đi Qua Di Linh',
      summary: 'Tuyến cao tốc huyết mạch kết nối TP.HCM với Lâm Đồng sẽ rút ngắn thời gian di chuyển từ Di Linh đi Đà Lạt và Đông Nam Bộ, mở ra cơ hội đột phá kinh tế - du lịch cho địa phương.',
      content: `TIN THỜI SỰ TỈNH LÂM ĐỒNG:
Tuyến đường cao tốc hoàn thành sẽ kết nối thông suốt từ TP.HCM qua Đồng Nai lên Lâm Đồng, đi qua địa phận huyện Di Linh. Giúp rút ngắn một nửa thời gian vận chuyển nông sản cà phê, chè, sầu riêng của bà con Di Linh về các cảng xuất khẩu.`,
      category: 'Kinh Tế Lâm Đồng',
      category_color: 'bg-teal-600',
      scope: 'lamdong',
      scope_label: '🌲 Tỉnh Lâm Đồng',
      image_url: '/banner_thon6_dilinh.jpg',
      source: 'Cổng TTĐT Tỉnh Lâm Đồng',
      author: 'Báo Lâm Đồng',
      published_date: 'Hôm nay',
      views: 890,
      is_urgent: false,
      is_new: true
    },
    {
      title: '🚨 Cục An Toàn Thông Tin Cảnh Báo Khẩn Toàn Quốc: 24 Thủ Đoạn Lừa Đảo Công Nghệ Cao',
      summary: 'Bộ Công an và Bộ TT&TT khuyến cáo người dân cả nước tuyệt đối cảnh giác trước các thủ đoạn mạo danh công an, ngân hàng, thuế gọi điện thoại yêu cầu cài link độc hại (.apk).',
      content: `CẢNH BÁO AN NINH MẠNG QUỐC GIA:

Tuyệt đối ghi nhớ nguyên tắc "4 KHÔNG - 2 PHẢI":
- KHÔNG cung cấp mật khẩu, mã OTP cho bất kỳ ai.
- KHÔNG bấm vào đường link lạ gửi qua tin nhắn/Zalo.
- KHÔNG tải app ngoài kho ứng dụng chính thức.
- KHÔNG chuyển tiền theo yêu cầu của người lạ qua điện thoại.
- PHẢI kiểm tra lại với Công an địa phương khi có nghi vấn.
- PHẢI báo ngay cho ngân hàng khóa tài khoản khi nghi ngờ lộ thông tin.`,
      category: 'Cảnh Báo An Ninh',
      category_color: 'bg-red-700',
      scope: 'national',
      scope_label: '🇻🇳 Cả Nước',
      image_url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1000&q=80',
      source: 'Cục An Toàn Thông Tin - Bộ TT&TT',
      author: 'Bộ TT&TT',
      published_date: 'Hôm qua',
      views: 1580,
      is_urgent: true,
      is_new: false
    }
  ],

  // 5. HOẠT ĐỘNG LAN TỎA
  community_activities: [
    {
      title: '📰 Báo Lâm Đồng: Xã Di Linh – Để Đại hội Đảng thật sự là ngày hội lớn của toàn dân',
      description: 'Bài báo trên Báo Lâm Đồng ghi nhận khí thế thi đua sôi nổi tại xã Di Linh: Phát huy sức mạnh khối đại đoàn kết toàn dân, đẩy mạnh các công trình dân sinh, chuyển đổi số cộng đồng, nâng cao đời sống vật chất và tinh thần cho nhân dân toàn xã.',
      media_urls: [
        'https://baolamdong.vn/file/e7837c02876411cd0187645a2551378a/dataimages/202410/original/images2482348_1.jpg',
        '/banner_thon6_dilinh.jpg'
      ],
      article_url: 'https://baolamdong.vn/xa-di-linh-de-dai-hoi-dang-that-su-la-ngay-hoi-lon-cua-toan-dan-383069.html',
      source_name: 'Báo Lâm Đồng (baolamdong.vn)',
      participants_count: 1250,
      assisted_count: 580,
      results_summary: 'Lan tỏa sâu rộng tinh thần đoàn kết, thi đua lập thành tích chào mừng Đại hội Đảng các cấp, gắn liền với phong trào Chuyển đổi số cộng đồng và xây dựng Nông thôn mới kiểu mẫu tại Xã Di Linh.',
      author_name: 'Báo Lâm Đồng',
      status: 'approved',
      is_featured: true
    },
    {
      title: '🌱 Ra Quân Hỗ Trợ 85 Hộ Dân Thôn 6 Kích Hoạt VNeID & BHYT Số',
      description: 'Đoàn thanh niên phối hợp cùng Chi hội Phụ nữ Thôn 6 đã đến từng hộ gia đình hướng dẫn các cô chú lớn tuổi cài đặt VNeID Mức 2 và tra cứu thẻ BHYT điện tử trên smartphone.',
      media_urls: ['/banner_1.jpg'],
      participants_count: 15,
      assisted_count: 85,
      results_summary: '100% các hộ được hỗ trợ đã nắm vững cách tra cứu thẻ BHYT trên điện thoại khi đi khám bệnh.',
      author_name: 'Tổ CNS Cộng Đồng Thôn 6',
      status: 'approved',
      is_featured: false
    },
    {
      title: '🤝 Hướng Dẫn Nông Dân Tạo Mã QR Truy Xuất Nguồn Gốc Cà Phê & Sầu Riêng',
      description: 'Buổi tập huấn thực hành cầm tay chỉ việc cho các hộ nông dân Thôn 6 biết cách tạo mã QR tem nhãn cho sản phẩm nông sản sạch để xuất bán cho thương lái và sàn thương mại điện tử.',
      media_urls: ['/banner_2.png'],
      participants_count: 28,
      assisted_count: 45,
      results_summary: 'Đã tạo thành công 15 mã QR tem truy xuất nguồn gốc cho các vườn mẫu tại Thôn 6.',
      author_name: 'Hội Nông Dân Thôn 6',
      status: 'approved',
      is_featured: false
    }
  ],

  // 6. VĂN BẢN CHÍNH THỐNG
  official_documents: [
    {
      doc_number: '06/QĐ-TTg',
      title: 'Đề án Phát triển ứng dụng dữ liệu về dân cư, định danh và xác thực điện tử phục vụ chuyển đổi số quốc gia (Đề án 06)',
      issuing_body: 'Thủ tướng Chính phủ',
      issued_date: '2022-01-06',
      effect_status: 'Còn hiệu lực',
      source_url: 'https://chinhphu.vn',
      content_summary: 'Quy định mục tiêu tích hợp định danh điện tử VNeID thay thế thẻ BHYT giấy, sổ hộ khẩu giấy, giải quyết dịch vụ công trực tuyến và tạo lập công dân số.'
    },
    {
      doc_number: '24/KH-UBND',
      title: 'Kế hoạch Triển khai Phong trào "Bình dân học vụ số" và Hoạt động Tổ công nghệ số cộng đồng năm 2026',
      issuing_body: 'UBND Xã Di Linh',
      issued_date: '2026-01-15',
      effect_status: 'Còn hiệu lực',
      source_url: 'https://dilinh.lamdong.gov.vn',
      content_summary: 'Phổ cập kỹ năng số toàn diện cho người dân Thôn 6: Quét mã QR, thanh toán không tiền mặt, tra cứu thông tin đất đai, nộp hồ sơ trực tuyến và nhận diện lừa đảo trên mạng.'
    },
    {
      doc_number: '18/TB-UBND',
      title: 'Thông báo Lịch hỗ trợ kích hoạt tài khoản định danh điện tử VNeID Mức 2 lưu động tại Thôn 6',
      issuing_body: 'UBND Xã Di Linh - Công an Xã',
      issued_date: '2026-02-10',
      effect_status: 'Còn hiệu lực',
      source_url: 'https://dilinh.lamdong.gov.vn',
      content_summary: 'Tổ chức các điểm hỗ trợ lưu động tại Nhà sinh hoạt cộng đồng Thôn 6 từ 08h00 - 20h00 các ngày trong tuần. Hướng dẫn công dân mang CCCD gắn chip để được kích hoạt miễn phí.'
    }
  ]
};

/**
 * HÀM NẠP TẤT CẢ DỮ LIỆU GỐC VÀO SUPABASE (CHẠY 1-CLICK TỪ ADMIN CMS)
 */
export async function seedAllDatabaseTables(onProgress) {
  const results = {
    agri: false,
    weather: false,
    resources: false,
    news: false,
    activities: false,
    docs: false,
    errors: []
  };

  try {
    if (onProgress) onProgress('Đang nạp bảng giá nông sản...');
    const { error: errAgri } = await supabase
      .from('agri_market_prices')
      .upsert(REAL_INITIAL_DATA.agri_market_prices);
    if (!errAgri) results.agri = true;
    else results.errors.push(`Bảng giá nông sản: ${errAgri.message}`);

    if (onProgress) onProgress('Đang nạp dữ liệu thời tiết Di Linh...');
    const { error: errWeather } = await supabase
      .from('weather_daily')
      .upsert(REAL_INITIAL_DATA.weather_daily);
    if (!errWeather) results.weather = true;
    else results.errors.push(`Thời tiết: ${errWeather.message}`);

    if (onProgress) onProgress('Đang nạp kho bài học kỹ năng số...');
    const { error: errRes } = await supabase
      .from('learning_resources')
      .insert(REAL_INITIAL_DATA.learning_resources);
    if (!errRes) results.resources = true;
    else results.errors.push(`Bài học: ${errRes.message}`);

    if (onProgress) onProgress('Đang nạp bản tin thời sự Di Linh...');
    const { error: errNews } = await supabase
      .from('news_articles')
      .insert(REAL_INITIAL_DATA.news_articles);
    if (!errNews) results.news = true;
    else results.errors.push(`Bản tin: ${errNews.message}`);

    if (onProgress) onProgress('Đang nạp hoạt động lan tỏa cộng đồng...');
    const { error: errAct } = await supabase
      .from('community_activities')
      .insert(REAL_INITIAL_DATA.community_activities);
    if (!errAct) results.activities = true;
    else results.errors.push(`Hoạt động: ${errAct.message}`);

    if (onProgress) onProgress('Đang nạp văn bản chính thống & tri thức RAG...');
    const { error: errDoc } = await supabase
      .from('official_documents')
      .insert(REAL_INITIAL_DATA.official_documents);
    if (!errDoc) results.docs = true;
    else results.errors.push(`Văn bản: ${errDoc.message}`);

    return { success: results.errors.length === 0, results };
  } catch (err) {
    results.errors.push(err.message);
    return { success: false, results };
  }
}
