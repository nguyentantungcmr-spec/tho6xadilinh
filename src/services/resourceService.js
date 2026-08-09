import { supabase } from './supabaseClient';

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
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching resources:', error);
    return { data: [], error: error.message };
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
