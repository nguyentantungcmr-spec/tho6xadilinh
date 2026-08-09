import React, { useState } from 'react';
import { X, ShieldCheck, FileText, AlertCircle } from 'lucide-react';
import { createOfficialDocument } from '../../services/officialDocService';

export default function OfficialDocUploadModal({ isOpen, onClose, onSuccess }) {
  const [docNumber, setDocNumber] = useState('');
  const [title, setTitle] = useState('');
  const [issuingBody, setIssuingBody] = useState('');
  const [issuedDate, setIssuedDate] = useState(new Date().toISOString().split('T')[0]);
  const [effectStatus, setEffectStatus] = useState('Còn hiệu lực');
  const [sourceUrl, setSourceUrl] = useState('');
  const [contentSummary, setContentSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const payload = {
        doc_number: docNumber,
        title,
        issuing_body: issuingBody,
        issued_date: issuedDate,
        effect_status: effectStatus,
        source_url: sourceUrl,
        content_summary: contentSummary
      };

      const { data, error } = await createOfficialDocument(payload);
      if (error) throw new Error(error);

      onSuccess(data);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Lỗi khi lưu tài liệu chính thống');
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
          <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center mx-auto mb-2">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">Tải Nguồn Chính Thống Cho AI</h2>
          <p className="text-xs text-slate-500 mt-1">
            Dành cho Quản trị viên & Tổ công nghệ số cung cấp tri thức chuẩn cho AI
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
              <label className="block text-xs font-bold text-slate-700 mb-1">Số hiệu văn bản *</label>
              <input
                type="text"
                required
                placeholder="Ví dụ: 12/2026/NQ-CP"
                value={docNumber}
                onChange={(e) => setDocNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Cơ quan ban hành *</label>
              <input
                type="text"
                required
                placeholder="Ví dụ: UBND Xã Di Linh"
                value={issuingBody}
                onChange={(e) => setIssuingBody(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Tên văn bản / Thông báo *</label>
            <input
              type="text"
              required
              placeholder="Ví dụ: Kế hoạch Chuyển đổi số cộng đồng năm 2026"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Ngày ban hành</label>
              <input
                type="date"
                value={issuedDate}
                onChange={(e) => setIssuedDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Trạng thái hiệu lực</label>
              <select
                value={effectStatus}
                onChange={(e) => setEffectStatus(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold"
              >
                <option value="Còn hiệu lực">✅ Còn hiệu lực</option>
                <option value="Đã sửa đổi">⚠️ Đã sửa đổi</option>
                <option value="Hết hiệu lực">❌ Hết hiệu lực</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Trích yếu nội dung chính (Cho AI đọc) *</label>
            <textarea
              required
              rows={4}
              placeholder="Tóm tắt rõ ràng các quy định, thời hạn, điều kiện để AI tham chiếu trả lời người dân..."
              value={contentSummary}
              onChange={(e) => setContentSummary(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            ></textarea>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Link nguồn gốc văn bản (Nếu có)</label>
            <input
              type="url"
              placeholder="https://vanban.chinhphu.vn/..."
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-sm shadow-md transition disabled:opacity-50"
          >
            {loading ? 'Đang cập nhật CSDL...' : 'Lưu Vào Tri Thức AI'}
          </button>
        </form>

      </div>
    </div>
  );
}
