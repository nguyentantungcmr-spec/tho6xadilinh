import React, { useState } from 'react';
import { X, HeartHandshake, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { createCommunityActivity } from '../../services/communityService';

export default function ActivityUploadModal({ isOpen, onClose, onSuccess }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [participantsCount, setParticipantsCount] = useState(5);
  const [assistedCount, setAssistedCount] = useState(10);
  const [resultsSummary, setResultsSummary] = useState('');
  const [authorName, setAuthorName] = useState('');
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
        media_urls: mediaUrl ? [mediaUrl] : [],
        participants_count: participantsCount,
        assisted_count: assistedCount,
        results_summary: resultsSummary,
        author_name: authorName || 'Đội Thanh Niên Thôn 6'
      };

      const { data, error } = await createCommunityActivity(payload);
      if (error) throw new Error(error);

      onSuccess(data);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Lỗi khi lưu bài đăng hoạt động cộng đồng');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative">
        
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-2">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">Báo Cáo Hoạt Động Cộng Đồng</h2>
          <p className="text-xs text-slate-500 mt-1">
            Đăng bài kết quả hỗ trợ số cho người dân Thôn 6 Xã Di Linh
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Tên hoạt động *</label>
            <input
              type="text"
              required
              placeholder="Ví dụ: Nhóm thanh niên hướng dẫn 8 người cao tuổi dùng Zalo"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Mô tả chi tiết *</label>
            <textarea
              required
              rows={3}
              placeholder="Mô tả cụ thể thời gian, địa điểm, nội dung hướng dẫn..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            ></textarea>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Số người hỗ trợ (Thành viên)</label>
              <input
                type="number"
                min={1}
                value={participantsCount}
                onChange={(e) => setParticipantsCount(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Số bà con được hỗ trợ</label>
              <input
                type="number"
                min={0}
                value={assistedCount}
                onChange={(e) => setAssistedCount(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Kết quả đạt được</label>
            <input
              type="text"
              placeholder="Ví dụ: 100% người dân tự thực hành quét mã BHYT thành thạo"
              value={resultsSummary}
              onChange={(e) => setResultsSummary(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Đường dẫn Hình ảnh / Video minh họa</label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/photo-..."
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Người đăng / Tổ chức</label>
            <input
              type="text"
              placeholder="Ví dụ: Nguyễn Văn Nam (Chi đoàn Thôn 6)"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition disabled:opacity-50"
          >
            {loading ? 'Đang gửi bài đăng...' : 'Đăng Báo Cáo Hoạt Động'}
          </button>
        </form>

      </div>
    </div>
  );
}
