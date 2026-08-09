import React, { useState } from 'react';
import { X, Lightbulb, Sparkles, AlertCircle } from 'lucide-react';
import { createLearningModel, formatModelWithAI } from '../../services/modelService';

export default function LearningModelUploadModal({ isOpen, onClose, onSuccess }) {
  const [title, setTitle] = useState('');
  const [rawContent, setRawContent] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [aiPreview, setAiPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handlePreviewAI = () => {
    if (!rawContent.trim()) {
      setErrorMsg('Vui lòng nhập nội dung cách làm hay trước khi thử nghiệm AI biên tập.');
      return;
    }
    setErrorMsg('');
    const preview = formatModelWithAI(rawContent, title || 'Cách làm chuyển đổi số hay');
    setAiPreview(preview);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const payload = {
        title,
        raw_content: rawContent,
        author_name: authorName || 'Bác nông dân Thôn 6'
      };

      const { data, error } = await createLearningModel(payload);
      if (error) throw new Error(error);

      onSuccess(data);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Lỗi khi lưu mô hình học tập');
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
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto mb-2">
            <Lightbulb className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">Chia Sẻ Mô Hình Học Tập Hay</h2>
          <p className="text-xs text-slate-500 mt-1">
            Nhập cách làm đơn giản tại gia đình - AI sẽ tự động biên tập chuẩn hóa
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
            <label className="block text-xs font-bold text-slate-700 mb-1">Tên mô hình / Ý tưởng hay *</label>
            <input
              type="text"
              required
              placeholder="Ví dụ: Mỗi gia đình một người hỗ trợ số"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Ghi chép cách làm thực tế của bác/anh/chị *
            </label>
            <textarea
              required
              rows={4}
              placeholder="Ví dụ: Mỗi tối tôi dành 15 phút nhờ đứa cháu ngoại hướng dẫn quét mã QR, sau đó ghi chú vào sổ tay..."
              value={rawContent}
              onChange={(e) => setRawContent(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            ></textarea>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Tên tác giả / Người chia sẻ</label>
            <input
              type="text"
              placeholder="Ví dụ: Bác Lê Văn Đức (68 tuổi, Thôn 6)"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* NÚT AI THỬ BIÊN TẬP */}
          <button
            type="button"
            onClick={handlePreviewAI}
            className="w-full py-2.5 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 text-xs font-bold flex items-center justify-center gap-2 transition border border-indigo-200"
          >
            <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse" />
            <span>Thử Nghiệm AI Biên Tập 4 Bước</span>
          </button>

          {aiPreview && (
            <div className="bg-slate-900 text-white p-3.5 rounded-xl text-xs space-y-1.5 border border-slate-700">
              <span className="text-emerald-400 font-bold block">✨ Xem trước bản AI biên tập:</span>
              <p>• <strong>Mục tiêu:</strong> {aiPreview.target}</p>
              <p>• <strong>Chuẩn bị:</strong> {aiPreview.preparation}</p>
              <p>• <strong>Các bước:</strong> {aiPreview.steps.join(' → ')}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-md transition disabled:opacity-50"
          >
            {loading ? 'Đang gửi bài...' : 'Đăng Mô Hình Học Tập'}
          </button>
        </form>

      </div>
    </div>
  );
}
