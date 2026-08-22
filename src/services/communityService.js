import { supabase } from './supabaseClient';

export const INITIAL_ACTIVITIES = [
  {
    id: 'act-baolamdong-daihoidang',
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
    created_at: new Date().toISOString(),
    status: 'approved',
    is_featured: true
  },
  {
    id: 'act-vneid-support',
    title: '🌱 Ra Quân Hỗ Trợ 85 Hộ Dân Thôn 6 Kích Hoạt VNeID & BHYT Số',
    description: 'Đoàn thanh niên phối hợp cùng Chi hội Phụ nữ Thôn 6 đã đến từng hộ gia đình hướng dẫn các cô chú lớn tuổi cài đặt VNeID Mức 2 và tra cứu thẻ BHYT điện tử trên smartphone.',
    media_urls: ['/banner_1.jpg'],
    participants_count: 15,
    assisted_count: 85,
    results_summary: '100% các hộ được hỗ trợ đã nắm vững cách tra cứu thẻ BHYT trên điện thoại khi đi khám bệnh.',
    author_name: 'Tổ CNS Cộng Đồng Thôn 6',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    status: 'approved'
  },
  {
    id: 'act-qr-agriculture',
    title: '🤝 Hướng Dẫn Nông Dân Tạo Mã QR Truy Xuất Nguồn Gốc Cà Phê & Sầu Riêng',
    description: 'Buổi tập huấn thực hành cầm tay chỉ việc cho các hộ nông dân Thôn 6 biết cách tạo mã QR tem nhãn cho sản phẩm nông sản sạch để xuất bán cho thương lái và sàn thương mại điện tử.',
    media_urls: ['/banner_2.png'],
    participants_count: 28,
    assisted_count: 45,
    results_summary: 'Đã tạo thành công 15 mã QR tem truy xuất nguồn gốc cho các vườn mẫu tại Thôn 6.',
    author_name: 'Hội Nông Dân Thôn 6',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    status: 'approved'
  }
];

export const getCommunityActivities = async () => {
  try {
    const { data, error } = await supabase
      .from('community_activities')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      // Đảm bảo bài viết Báo Lâm Đồng luôn xuất hiện ở đầu
      const hasBaoLamDong = data.some(a => a.article_url?.includes('baolamdong.vn'));
      if (!hasBaoLamDong) {
        return { data: [INITIAL_ACTIVITIES[0], ...data], error: null };
      }
      return { data, error: null };
    }
  } catch (error) {
    console.error('Error fetching community activities:', error);
  }

  return { data: INITIAL_ACTIVITIES, error: null };
};

export const createCommunityActivity = async (activityData) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    let authorName = activityData.author_name || 'Người dân Thôn 6';
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();
      if (profile && profile.full_name) {
        authorName = profile.full_name;
      }
    }

    const payload = {
      title: activityData.title,
      description: activityData.description,
      media_urls: activityData.media_urls || [],
      article_url: activityData.article_url || null,
      source_name: activityData.source_name || null,
      participants_count: Number(activityData.participants_count || 1),
      assisted_count: Number(activityData.assisted_count || 0),
      results_summary: activityData.results_summary || '',
      author_name: authorName,
      status: 'approved',
      created_by: user ? user.id : null
    };

    const { data, error } = await supabase
      .from('community_activities')
      .insert([payload])
      .select();

    if (error) throw error;
    return { data: data[0], error: null };
  } catch (error) {
    console.error('Error creating activity:', error);
    return { data: null, error: error.message };
  }
};

export const deleteCommunityActivity = async (id) => {
  try {
    const { error } = await supabase
      .from('community_activities')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    console.error('Error deleting activity:', error);
    return { success: false, error: error.message };
  }
};

