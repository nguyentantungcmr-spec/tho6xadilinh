import React, { useState, useEffect } from 'react';
import { X, Plus, Search, CheckCircle, ShieldCheck, ShieldAlert, Edit, Trash2, Power, Filter, ExternalLink, Save, BookOpen } from 'lucide-react';
import {
  getKnowledgeList,
  createKnowledge,
  updateKnowledge,
  deleteKnowledge,
  toggleKnowledgeStatus,
  toggleKnowledgeVerified
} from '../../services/officialKnowledgeService';

const CATEGORIES = [
  { code: 'ALL', label: 'Tất cả danh mục' },
  { code: 'VNEID', label: '🪪 VNeID & Định danh' },
  { code: 'PUBLIC_SERVICE', label: '🏛️ Dịch vụ công' },
  { code: 'PROJECT_06', label: '📊 Đề án 06' },
  { code: 'QR_CODE', label: '📱 Quét mã QR' },
  { code: 'SCAM', label: '🛡️ Phòng lừa đảo' },
  { code: 'CYBER_SECURITY', label: '🔐 An toàn thông tin' },
  { code: 'ADMIN_PROCEDURE', label: '📋 Thủ tục hành chính' },
  { code: 'DIGITAL_SKILLS', label: '💡 Kỹ năng số' },
  { code: 'LOCAL_INFORMATION', label: '📢 Thông tin địa phương' },
  { code: 'OTHER', label: '📁 Danh mục khác' }
];

export default function KnowledgeAdminModal({ isOpen, onClose }) {
  const [mainTab, setMainTab] = useState('repository'); // 'repository' | 'unanswered'
  const [knowledgeList, setKnowledgeList] = useState([]);
  const [unansweredList, setUnansweredList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(''); // '' | 'active' | 'inactive'

  // STATE FORM THÊM / SỬA TÀI LIỆU
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingDoc, setEditingDoc] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    category: 'VNEID',
    agency: 'UBND Huyện Di Linh',
    documentNumber: '',
    issueDate: new Date().toISOString().split('T')[0],
    effectiveDate: new Date().toISOString().split('T')[0],
    sourceUrl: 'https://dilinh.lamdong.gov.vn/',
    locality: 'Di Linh, Lâm Đồng',
    content: '',
    verified: true,
    status: 'active'
  });

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, selectedCategory, statusFilter, searchTerm]);

  const loadData = async () => {
    setLoading(true);
    const data = await getKnowledgeList({
      category: selectedCategory,
      status: statusFilter,
      search: searchTerm
    });
    setKnowledgeList(data || []);
    setLoading(false);
  };

  if (!isOpen) return null;

  const handleOpenAddForm = () => {
    setEditingDoc(null);
    setFormData({
      title: '',
      category: 'VNEID',
      agency: 'UBND Huyện Di Linh',
      documentNumber: '',
      issueDate: new Date().toISOString().split('T')[0],
      effectiveDate: new Date().toISOString().split('T')[0],
      sourceUrl: 'https://dilinh.lamdong.gov.vn/',
      locality: 'Di Linh, Lâm Đồng',
      content: '',
      verified: true,
      status: 'active'
    });
    setShowFormModal(true);
  };

  const handleOpenEditForm = (doc) => {
    setEditingDoc(doc);
    setFormData({
      title: doc.title || '',
      category: doc.category || 'VNEID',
      agency: doc.agency || 'UBND Huyện Di Linh',
      documentNumber: doc.document_number || doc.documentNumber || '',
      issueDate: doc.issue_date || doc.issueDate || new Date().toISOString().split('T')[0],
      effectiveDate: doc.effective_date || doc.effectiveDate || new Date().toISOString().split('T')[0],
      sourceUrl: doc.source_url || doc.sourceUrl || 'https://dilinh.lamdong.gov.vn/',
      locality: doc.locality || 'Di Linh, Lâm Đồng',
      content: doc.content || '',
      verified: doc.verified !== undefined ? doc.verified : true,
      status: doc.status || 'active'
    });
    setShowFormModal(true);
  };

  const handleSaveDoc = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) return;

    if (editingDoc) {
      await updateKnowledge(editingDoc.id, formData);
    } else {
      await createKnowledge(formData);
    }

    setShowFormModal(false);
    loadData();
  };

  const handleDeleteDoc = async (id) => {
    if (window.confirm('Thầy/Cô có chắc chắn muốn xóa tài liệu chính thống này?')) {
      await deleteKnowledge(id);
      loadData();
    }
  };

  const handleToggleStatus = async (doc) => {
    await toggleKnowledgeStatus(doc.id, doc.status);
    loadData();
  };

  const handleToggleVerified = async (doc) => {
    await toggleKnowledgeVerified(doc.id, doc.verified);
    loadData();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl max-w-5xl w-full h-[90vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden">
        
        {/* HEADER */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 text-white p-5 shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-amber-300">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-bold text-lg leading-tight flex items-center gap-2">
                  Trang Quản Trị Tri Thức RAG & Cán Bổ Hỗ Trợ
                  <span className="bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded-md uppercase font-extrabold">
                    Tổ CNS Thôn 6
                  </span>
                </h2>
                <p className="text-xs text-blue-200">
                  Quản lý kho tài liệu RAG & Rà soát xử lý danh sách các câu hỏi AI chưa trả lời được.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleOpenAddForm}
                className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-extrabold rounded-xl shadow-md transition flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm Tài Liệu Mới</span>
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/20 text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* MAIN TABS */}
          <div className="flex items-center gap-2 pt-2 border-t border-white/10">
            <button
              onClick={() => setMainTab('repository')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-2 ${
                mainTab === 'repository' 
                  ? 'bg-white text-blue-900 shadow-sm' 
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <span>📚 Kho Dữ Liệu RAG</span>
            </button>

            <button
              onClick={() => setMainTab('unanswered')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-2 ${
                mainTab === 'unanswered' 
                  ? 'bg-amber-400 text-slate-950 shadow-sm' 
                  : 'bg-white/10 text-amber-200 hover:bg-white/20'
              }`}
            >
              <span>📋 Câu Hỏi AI Chưa Trả Lời Được ({unansweredList.length})</span>
            </button>
          </div>
        </div>

        {/* SEARCH & FILTER BAR */}
        <div className="p-4 bg-slate-100 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-[240px]">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Tìm kiếm tài liệu theo tiêu đề, số hiệu, nội dung..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto">
            {/* FILTER CATEGORY */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-700"
            >
              {CATEGORIES.map(cat => (
                <option key={cat.code} value={cat.code}>{cat.label}</option>
              ))}
            </select>

            {/* FILTER STATUS */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-700"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="active">🟢 Đang hoạt động (Active)</option>
              <option value="inactive">🔴 Đã tắt (Inactive)</option>
            </select>
          </div>
        </div>

        {/* DOCUMENT LIST / UNANSWERED LIST BODY */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto bg-slate-50 space-y-3">
          {loading ? (
            <div className="text-center py-12 text-slate-400 text-sm font-semibold">
              Đang tải dữ liệu hệ thống...
            </div>
          ) : mainTab === 'repository' ? (
            knowledgeList.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm font-medium">
                Không tìm thấy tài liệu phù hợp trong kho tri thức RAG.
              </div>
            ) : (
              knowledgeList.map((doc) => (
                <div
                  key={doc.id}
                  className={`bg-white p-4 sm:p-5 rounded-2xl border transition shadow-xs flex flex-col sm:flex-row items-start justify-between gap-4 ${
                    doc.status === 'active' && doc.verified
                      ? 'border-slate-200 hover:border-blue-300'
                      : 'border-amber-200 bg-amber-50/30'
                  }`}
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="bg-blue-100 text-blue-800 text-[10px] px-2.5 py-0.5 rounded-md font-extrabold uppercase">
                        {doc.category || 'OTHER'}
                      </span>

                      <button
                        onClick={() => handleToggleStatus(doc)}
                        className={`text-[10px] px-2.5 py-0.5 rounded-md font-black flex items-center gap-1 cursor-pointer transition ${
                          doc.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        }`}
                      >
                        <Power className="w-3 h-3" />
                        <span>{doc.status === 'active' ? 'ACTIVE' : 'INACTIVE'}</span>
                      </button>

                      <button
                        onClick={() => handleToggleVerified(doc)}
                        className={`text-[10px] px-2.5 py-0.5 rounded-md font-black flex items-center gap-1 cursor-pointer transition ${
                          doc.verified
                            ? 'bg-emerald-500 text-white'
                            : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                        }`}
                      >
                        {doc.verified ? <ShieldCheck className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
                        <span>{doc.verified ? 'ĐÃ XÁC MINH' : 'CHƯA XÁC MINH'}</span>
                      </button>
                    </div>

                    <h3 className="font-bold text-sm text-slate-900 leading-snug">
                      {doc.title}
                    </h3>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {doc.content}
                    </p>

                    <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 font-medium">
                      <span><strong>Số hiệu:</strong> {doc.document_number || doc.documentNumber || 'N/A'}</span>
                      <span><strong>Cơ quan:</strong> {doc.agency || 'UBND Di Linh'}</span>
                      <span><strong>Ban hành:</strong> {doc.issue_date || doc.issueDate}</span>
                      <a
                        href={doc.source_url || doc.sourceUrl || 'https://dilinh.lamdong.gov.vn/'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 font-bold hover:underline flex items-center gap-0.5"
                      >
                        <span>Nguồn dilinh.lamdong.gov.vn</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => handleOpenEditForm(doc)}
                      className="p-2 bg-slate-100 hover:bg-blue-50 text-blue-700 rounded-xl transition border border-slate-200"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteDoc(doc.id)}
                      className="p-2 bg-slate-100 hover:bg-red-50 text-red-600 rounded-xl transition border border-slate-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )
          ) : (
            /* TAB CÂU HỎI AI CHƯA TRẢ LỜI ĐƯỢC */
            unansweredList.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm font-medium">
                Chưa có câu hỏi nào bị tồn đọng! Tất cả câu hỏi đều đã được giải đáp có căn cứ chính thống.
              </div>
            ) : (
              unansweredList.map((item) => (
                <div key={item.id} className="bg-white p-5 rounded-2xl border border-amber-200 shadow-xs space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2">
                    <div className="flex items-center gap-2">
                      <span className="bg-blue-100 text-blue-900 text-[10px] px-2.5 py-0.5 rounded-md font-extrabold uppercase">
                        {item.intent || 'OTHER'}
                      </span>
                      <span className="bg-amber-100 text-amber-900 text-[10px] px-2.5 py-0.5 rounded-md font-black">
                        SCORE: {typeof item.retrieval_score === 'number' ? item.retrieval_score.toFixed(2) : (item.retrieval_score || '0.00')}
                      </span>
                    </div>

                    <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2.5 py-0.5 rounded-md font-black uppercase">
                      TRẠNG THÁI: {item.status === 'resolved' ? '✅ ĐÃ XỬ LÝ' : '⏳ CHỜ TỔ CNS BỔ SUNG'}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 leading-snug">
                      ❓ Câu hỏi: "{item.question}"
                    </h4>
                    <p className="text-xs text-amber-800 font-medium mt-1 bg-amber-50 p-2.5 rounded-xl border border-amber-100">
                      ⚠️ <strong>Lý do chưa trả lời:</strong> {item.reason || 'Retrieval score < 0.65 (Chưa có tài liệu chính thống đủ tin cậy)'}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-slate-500 border-t border-slate-100">
                    <span><strong>Thời gian:</strong> {new Date(item.created_at).toLocaleString('vi-VN')}</span>

                    <button
                      onClick={() => {
                        setEditingDoc(null);
                        setFormData({
                          title: item.question,
                          category: item.intent || 'OTHER',
                          agency: 'UBND Huyện Di Linh',
                          documentNumber: '',
                          issueDate: new Date().toISOString().split('T')[0],
                          effectiveDate: new Date().toISOString().split('T')[0],
                          sourceUrl: 'https://dilinh.lamdong.gov.vn/',
                          locality: 'Di Linh, Lâm Đồng',
                          content: '',
                          verified: true,
                          status: 'active'
                        });
                        setShowFormModal(true);
                      }}
                      className="px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-black rounded-xl shadow-xs transition flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>➕ Bổ sung tài liệu vào Kho RAG</span>
                    </button>
                  </div>
                </div>
              ))
            )
          )}
        </div>

      </div>

      {/* FORM MODAL THÊM / SỬA TÀI LIỆU */}
      {showFormModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base text-slate-900">
                {editingDoc ? '✏️ Chỉnh Sửa Tài Liệu Chính Thống' : '➕ Thêm Tài Liệu Chính Thống Mới'}
              </h3>
              <button onClick={() => setShowFormModal(false)} className="p-1 rounded-full hover:bg-slate-100">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleSaveDoc} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tên / Tiêu đề văn bản *</label>
                <input
                  type="text"
                  required
                  placeholder="Nhập tiêu đề văn bản chỉ đạo..."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Danh mục (Category) *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold"
                  >
                    {CATEGORIES.filter(c => c.code !== 'ALL').map(c => (
                      <option key={c.code} value={c.code}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Số hiệu văn bản *</label>
                  <input
                    type="text"
                    placeholder="15/KH-UBND"
                    value={formData.documentNumber}
                    onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Cơ quan ban hành *</label>
                  <input
                    type="text"
                    value={formData.agency}
                    onChange={(e) => setFormData({ ...formData, agency: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Đường dẫn nguồn chính thống (sourceUrl)</label>
                  <input
                    type="url"
                    value={formData.sourceUrl}
                    onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ngày ban hành (issueDate)</label>
                  <input
                    type="date"
                    value={formData.issueDate}
                    onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ngày có hiệu lực (effectiveDate)</label>
                  <input
                    type="date"
                    value={formData.effectiveDate}
                    onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nội dung trích dẫn chi tiết (Dùng cho AI trả lời) *</label>
                <textarea
                  rows={5}
                  required
                  placeholder="Nhập chi tiết các hướng dẫn, quy định trong văn bản để AI sử dụng..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
                />
              </div>

              <div className="flex items-center gap-6 pt-2 border-t">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.verified}
                    onChange={(e) => setFormData({ ...formData, verified: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span>Đã xác minh (Verified)</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.status === 'active'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.checked ? 'active' : 'inactive' })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span>Kích hoạt sử dụng (Active)</span>
                </label>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-extrabold rounded-xl transition shadow-md flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingDoc ? 'Lưu Thay Đổi' : 'Tạo Tài Liệu'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
