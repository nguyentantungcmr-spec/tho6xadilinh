import React, { useState } from 'react';
import { X, Upload, Video, Image as ImageIcon, FileText, Volume2, Sparkles, AlertCircle } from 'lucide-react';
import { createLearningResource } from '../../services/resourceService';

export default function UploadResourceModal({ isOpen, onClose, onSuccess }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('infographic');
  const [category, setCategory] = useState('VNeID');
  const [mediaUrl, setMediaUrl] = useState('');
  const [sourceAuthor, setSourceAuthor] = useState('');
  const [seniorFriendly, setSeniorFriendly] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const payload = {
        title,
        description,
        type,
        category,
        media_url: mediaUrl,
        source_author: sourceAuthor || 'Tổ Công nghệ số Thôn 6',
        senior_friendly: seniorFriendly
      };

      const { data, error } = await createLearningResource(payload);
      if (error) throw new Error(error);

      onSuccess(data);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Lỗi khi đăng tài nguyên học tập');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto">
        
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center mx-auto mb-2">
            <Upload className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">Đăng Tài Nguyên Học Tập Mới</h2>
          <p className="text-xs text-slate-500 mt-1">
            Đăng tải Video, Infographic, Ảnh minh họa, Audio Podcast hoặc Tài liệu Cẩm nang
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Loại tài nguyên *</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-bold bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="infographic">✨ Infographic Trực quan</option>
                <option value="video">🎥 Video Hướng dẫn (MP4/Youtube)</option>
                <option value="image">🖼️ Ảnh minh họa từng bước</option>
                <option value="document">📄 Tài liệu Cẩm nang (PDF/DOC)</option>
                <option value="audio">🎙️ Podcast / Giọng nói (MP3)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Chủ đề *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-bold bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="VNeID">VNeID Định danh</option>
                <option value="Zalo">Sử dụng Zalo</option>
                <option value="Quét QR">Quét mã QR</option>
                <option value="An toàn số">An toàn số & Cảnh báo</option>
                <option value="Gõ tiếng Việt">Gõ Tiếng Việt</option>
                <option value="AI">Sử dụng AI</option>
                <option value="Phổ cập tin học">Phổ cập Tin học</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Tiêu đề hướng dẫn *</label>
            <input
              type="text"
              required
              placeholder="Ví dụ: 4 bước quét QR an toàn cho người cao tuổi"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Mô tả nội dung chi tiết *</label>
            <textarea
              required
              rows={3}
              placeholder="Tóm tắt rõ ràng các bước thực hiện để đọc tự động bằng giọng nói..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Đường dẫn tệp / Media URL (MP4, MP3, JPG, PDF) *</label>
            <input
              type="url"
              required
              placeholder="https://images.unsplash.com/... hoặc link MP4/MP3"
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Nguồn tài liệu rõ ràng *</label>
            <input
              type="text"
              required
              placeholder="Ví dụ: Cục An toàn thông tin - Bộ TT&TT hoặc Tổ CNS Thôn 6"
              value={sourceAuthor}
              onChange={(e) => setSourceAuthor(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="seniorFriendly"
              checked={seniorFriendly}
              onChange={(e) => setSeniorFriendly(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded-md focus:ring-blue-500 cursor-pointer"
            />
            <label htmlFor="seniorFriendly" className="text-xs font-bold text-slate-700 cursor-pointer">
              👵 Phù hợp & Tối ưu cho Người cao tuổi (Dễ nhìn, dễ nghe)
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition disabled:opacity-50"
          >
            {loading ? 'Đang cập nhật CSDL Supabase...' : 'Đăng Tài Nguyên Mới'}
          </button>
        </form>

      </div>
    </div>
  );
}
