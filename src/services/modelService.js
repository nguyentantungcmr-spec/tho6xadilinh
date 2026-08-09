import { supabase } from './supabaseClient';

export const getLearningModels = async () => {
  try {
    const { data, error } = await supabase
      .from('learning_models')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching learning models:', error);
    return { data: [], error: error.message };
  }
};

// Giả lập/Tích hợp AI Biên tập mô hình chuẩn 4 bước dành cho người cao tuổi & cộng đồng
export const formatModelWithAI = (rawContent, title) => {
  // Trích xuất tự động thành cấu trúc chuẩn 4 bước
  return {
    target: `Hướng dẫn người dân Thôn 6 thực hành cách làm "${title}" một cách đơn giản, dễ nhớ.`,
    preparation: `Chuẩn bị 1 điện thoại thông minh (có kết nối 4G/Wifi), kính đọc chữ (nếu cần) và 10-15 phút rảnh rỗi.`,
    steps: [
      `Bước 1: Mở điện thoại và truy cập vào ứng dụng/chức năng theo hướng dẫn ban đầu.`,
      `Bước 2: Nắm rõ 1 thao tác cốt lõi: ${rawContent.slice(0, 100)}...`,
      `Bước 3: Thực hành lại 2-3 lần cho quen tay, nhờ con cháu hoặc Người hỗ trợ số kiểm tra giúp.`
    ],
    result: `Tiết kiệm thời gian, tự chủ thao tác chuyển đổi số mà không phụ thuộc vào người khác.`
  };
};

export const createLearningModel = async (modelData) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    let authorName = modelData.author_name || 'Người dân Thôn 6';
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

    // Biên tập bằng thuật toán AI
    const aiFormatted = formatModelWithAI(modelData.raw_content, modelData.title);

    const payload = {
      title: modelData.title,
      raw_content: modelData.raw_content,
      ai_formatted_content: aiFormatted,
      media_urls: modelData.media_urls || [],
      author_name: authorName,
      status: 'approved',
      created_by: user ? user.id : null
    };

    const { data, error } = await supabase
      .from('learning_models')
      .insert([payload])
      .select();

    if (error) throw error;
    return { data: data[0], error: null };
  } catch (error) {
    console.error('Error creating learning model:', error);
    return { data: null, error: error.message };
  }
};
