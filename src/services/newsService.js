import { supabase } from './supabaseClient';
import { REAL_INITIAL_DATA } from './dbSeederService';

/**
 * SERVICE QUẢN LÝ BẢN TIN THỜI SỰ & NÔNG NGHIỆP DI LINH (SUPABASE POSTGRESQL)
 */

export const INITIAL_NEWS = REAL_INITIAL_DATA.news_articles;

export async function getNewsArticles() {
  try {
    const { data, error } = await supabase
      .from('news_articles')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      return data;
    }
  } catch (err) {
    console.error('Error fetching news from database:', err);
  }

  return REAL_INITIAL_DATA.news_articles;
}

export async function createNewsArticle(newsData) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const payload = {
      title: newsData.title,
      summary: newsData.summary || '',
      content: newsData.content || '',
      category: newsData.category || 'Thông Báo Xã',
      category_color: newsData.category_color || 'bg-blue-600',
      scope: newsData.scope || 'dilinh',
      scope_label: newsData.scope === 'national' ? '🇻🇳 Cả Nước' : newsData.scope === 'lamdong' ? '🌲 Tỉnh Lâm Đồng' : '🏛️ Xã Di Linh',
      image_url: newsData.image_url || '/banner_1.jpg',
      source: newsData.source || 'UBND Xã Di Linh',
      author: newsData.author || 'Tổ CNS Cộng Đồng',
      published_date: newsData.published_date || new Date().toLocaleDateString('vi-VN'),
      is_urgent: Boolean(newsData.is_urgent),
      is_new: true,
      created_by: user ? user.id : null
    };

    const { data, error } = await supabase
      .from('news_articles')
      .insert([payload])
      .select();

    if (error) throw error;
    return { data: data[0], error: null };
  } catch (err) {
    console.error('Error creating news article:', err);
    return { data: null, error: err.message };
  }
}

export async function updateNewsArticle(id, newsData) {
  try {
    const { data, error } = await supabase
      .from('news_articles')
      .update({
        ...newsData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select();

    if (error) throw error;
    return { data: data[0], error: null };
  } catch (err) {
    console.error('Error updating news article:', err);
    return { data: null, error: err.message };
  }
}

export async function deleteNewsArticle(id) {
  try {
    const { error } = await supabase
      .from('news_articles')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true, error: null };
  } catch (err) {
    console.error('Error deleting news article:', err);
    return { success: false, error: err.message };
  }
}
