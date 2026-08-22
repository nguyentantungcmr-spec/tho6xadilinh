import { supabase } from './supabaseClient';

const MOCK_RESOURCES = [
  {
    id: 'res-video-1',
    title: '🎥 Video Hướng Dẫn Kỹ Năng Số Cầm Tay Chỉ Việc - Phần 1',
    description: 'Video cẩm nang trực quan từng bước hướng dẫn sử dụng các tiện ích công nghệ số thiết yếu cho người dân.',
    type: 'video',
    category: 'Tôi Muốn Học',
    media_url: 'https://www.youtube.com/embed/pu3IBvcnC9U',
    source_author: 'Tổ Công nghệ số Cộng đồng Thôn 6',
    view_count: 245,
    senior_friendly: true,
    status: 'published'
  },
  {
    id: 'res-video-2',
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
    id: 'res-video-3',
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
    id: 'res-video-4',
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
    id: 'res-video-5',
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
    id: 'res-info-1',
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
    id: 'res-info-2',
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
    id: 'res-audio-1',
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
];

export const getLearningResources = async (filterType = 'all', searchQuery = '') => {
  try {
    let query = supabase
      .from('learning_resources')
      .select('*')
      .order('created_at', { ascending: false });

    if (filterType && filterType !== 'all') {
      query = query.eq('type', filterType);
    }

    if (searchQuery) {
      query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,category.ilike.%${searchQuery}%`);
    }

    const { data, error } = await query;
    let finalData = (error || !data || data.length === 0) ? MOCK_RESOURCES : data;

    // Loại bỏ bài video Rick Roll cũ nếu có
    finalData = finalData.filter(r => !(r.type === 'video' && (r.media_url?.includes('dQw4w9WgXcQ') || !r.media_url)));

    // Luôn chèn các video bài học mới nhất pu3IBvcnC9U, HvSLR4j1baY, HSmgjZ4Q6dM vào đầu mảng
    const video1 = MOCK_RESOURCES[0];
    const video2 = MOCK_RESOURCES[1];
    const video3 = MOCK_RESOURCES[2];

    if (!finalData.some(r => r.media_url && r.media_url.includes('pu3IBvcnC9U'))) {
      finalData.unshift(video1);
    }
    if (!finalData.some(r => r.media_url && r.media_url.includes('HvSLR4j1baY'))) {
      finalData.splice(1, 0, video2);
    }
    if (!finalData.some(r => r.media_url && r.media_url.includes('HSmgjZ4Q6dM'))) {
      finalData.splice(2, 0, video3);
    }

    if (filterType && filterType !== 'all') {
      finalData = finalData.filter(r => r.type === filterType);
    }

    return { data: finalData, error: null };
  } catch (error) {
    console.error('Error fetching resources:', error);
    let filteredMock = MOCK_RESOURCES;
    if (filterType && filterType !== 'all') {
      filteredMock = filteredMock.filter(r => r.type === filterType);
    }
    return { data: filteredMock, error: null };
  }
};

export const createLearningResource = async (resourceData) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const payload = {
      ...resourceData,
      created_by: user ? user.id : null,
      status: 'published'
    };

    const { data, error } = await supabase
      .from('learning_resources')
      .insert([payload])
      .select();

    if (error) throw error;
    return { data: data[0], error: null };
  } catch (error) {
    console.error('Error creating resource:', error);
    return { data: null, error: error.message };
  }
};

export const incrementViewCount = async (id, currentViews = 0) => {
  try {
    await supabase
      .from('learning_resources')
      .update({ view_count: currentViews + 1 })
      .eq('id', id);
  } catch (err) {
    console.error('View count increment error:', err);
  }
};
