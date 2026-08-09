import { supabase } from './supabaseClient';

export const getCommunityActivities = async () => {
  try {
    const { data, error } = await supabase
      .from('community_activities')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching community activities:', error);
    return { data: [], error: error.message };
  }
};

export const createCommunityActivity = async (activityData) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    // Tìm tên người dùng nếu có
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
      participants_count: Number(activityData.participants_count || 1),
      assisted_count: Number(activityData.assisted_count || 0),
      results_summary: activityData.results_summary || '',
      author_name: authorName,
      status: 'approved', // Mặc định duyệt cho phản hồi nhanh
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
