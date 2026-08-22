import { supabase } from './supabaseClient';
import { REAL_INITIAL_DATA } from './dbSeederService';

/**
 * SERVICE QUẢN LÝ KHO BÀI HỌC KỸ NĂNG SỐ (SUPABASE POSTGRESQL)
 */

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

    if (!error && data && data.length > 0) {
      return { data, error: null };
    }

    // Nếu database mới khởi tạo chưa có dữ liệu, trả về dữ liệu chuẩn
    let fallback = REAL_INITIAL_DATA.learning_resources;
    if (filterType && filterType !== 'all') {
      fallback = fallback.filter(r => r.type === filterType);
    }
    return { data: fallback, error: null };
  } catch (error) {
    console.error('Error fetching resources:', error);
    return { data: REAL_INITIAL_DATA.learning_resources, error: null };
  }
};

export const createLearningResource = async (resourceData) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const payload = {
      title: resourceData.title,
      description: resourceData.description || '',
      type: resourceData.type || 'video',
      category: resourceData.category || 'Tôi Muốn Học',
      media_url: resourceData.media_url,
      thumbnail_url: resourceData.thumbnail_url || null,
      source_author: resourceData.source_author || 'Tổ Công nghệ số Cộng đồng Thôn 6',
      senior_friendly: resourceData.senior_friendly !== false,
      status: resourceData.status || 'published',
      created_by: user ? user.id : null
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

export const updateLearningResource = async (id, resourceData) => {
  try {
    const { data, error } = await supabase
      .from('learning_resources')
      .update({
        ...resourceData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select();

    if (error) throw error;
    return { data: data[0], error: null };
  } catch (error) {
    console.error('Error updating resource:', error);
    return { data: null, error: error.message };
  }
};

export const deleteLearningResource = async (id) => {
  try {
    const { error } = await supabase
      .from('learning_resources')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    console.error('Error deleting resource:', error);
    return { success: false, error: error.message };
  }
};

export const incrementViewCount = async (id, currentViews = 0) => {
  try {
    await supabase
      .from('learning_resources')
      .update({ view_count: (currentViews || 0) + 1 })
      .eq('id', id);
  } catch (err) {
    console.error('View count increment error:', err);
  }
};
