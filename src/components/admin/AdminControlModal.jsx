import React, { useState, useEffect } from 'react';
import { 
  X, ShieldCheck, UserPlus, Users, Trash2, Edit3, Key, CheckCircle, 
  AlertCircle, ShieldAlert, Sparkles, RefreshCw, Mail, Lock, User, 
  Search, Eye, Filter, Plus, BookOpen, Newspaper, CloudSun, HeartHandshake, 
  Lightbulb, FileText, HelpCircle, Database, ArrowRight, ExternalLink, Save
} from 'lucide-react';
import { supabase } from '../../services/supabaseClient';
import RoleBadge, { ROLE_DETAILS } from '../common/RoleBadge';
import { 
  getLearningResources, createLearningResource, updateLearningResource, deleteLearningResource 
} from '../../services/resourceService';
import { 
  getNewsArticles, createNewsArticle, updateNewsArticle, deleteNewsArticle 
} from '../../services/newsService';
import { 
  fetchLiveWeatherAgriData, updateAgriPriceItem, updateWeatherDaily 
} from '../../services/weatherAgriService';
import { 
  getOfficialDocuments, createOfficialDocument, updateOfficialDocument, deleteOfficialDocument,
  getUnansweredQuestions, answerUnansweredQuestion 
} from '../../services/officialDocService';
import { 
  getLearningModels, createLearningModel, updateLearningModel, deleteLearningModel 
} from '../../services/modelService';
import { seedAllDatabaseTables } from '../../services/dbSeederService';

export default function AdminControlModal({ 
  isOpen, 
  onClose, 
  activities = [], 
  onDeleteActivity,
  onRefreshActivities,
  onRefreshAllData 
}) {
  const [activeTab, setActiveTab] = useState('overview'); 
  // 'overview' | 'members' | 'resources' | 'news' | 'agri' | 'activities' | 'models' | 'docs' | 'unanswered' | 'sql'

  const [loading, setLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState({ type: '', text: '' });

  // 1. DATA STATES
  const [profiles, setProfiles] = useState([]);
  const [resourcesList, setResourcesList] = useState([]);
  const [newsList, setNewsList] = useState([]);
  const [agriData, setAgriData] = useState({ weather: {}, agriPrices: { items: [] } });
  const [modelsList, setModelsList] = useState([]);
  const [docsList, setDocsList] = useState([]);
  const [unansweredList, setUnansweredList] = useState([]);

  // 2. FORM STATES (CẤP TÀI KHOẢN)
  const [newFullName, setNewFullName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('Thon6@2026');
  const [newRole, setNewRole] = useState('tech_team');
  const [searchMember, setSearchMember] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  // 3. FORM STATES (BÀI HỌC)
  const [resForm, setResForm] = useState({
    id: null,
    title: '',
    description: '',
    type: 'video',
    category: 'Tôi Muốn Học',
    media_url: '',
    source_author: 'Tổ Công nghệ số Cộng đồng Thôn 6',
    senior_friendly: true
  });
  const [isEditingRes, setIsEditingRes] = useState(false);

  // 4. FORM STATES (BẢN TIN)
  const [newsForm, setNewsForm] = useState({
    id: null,
    title: '',
    summary: '',
    content: '',
    category: 'Thông Báo Xã',
    scope: 'dilinh',
    image_url: '/banner_1.jpg',
    source: 'UBND Xã Di Linh',
    author: 'Tổ CNS Cộng Đồng',
    is_urgent: false
  });
  const [isEditingNews, setIsEditingNews] = useState(false);

  // 5. FORM STATES (VĂN BẢN)
  const [docForm, setDocForm] = useState({
    id: null,
    doc_number: '',
    title: '',
    issuing_body: 'UBND Xã Di Linh',
    issued_date: new Date().toISOString().split('T')[0],
    effect_status: 'Còn hiệu lực',
    source_url: 'https://dilinh.lamdong.gov.vn',
    content_summary: ''
  });
  const [isEditingDoc, setIsEditingDoc] = useState(false);

  // 6. FORM STATES (TRẢ LỜI CÂU HỎI)
  const [answeringQuestionId, setAnsweringQuestionId] = useState(null);
  const [answerText, setAnswerText] = useState('');

  // 7. SEEDING STATE
  const [seedingProgress, setSeedingProgress] = useState('');
  const [isSeeding, setIsSeeding] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadAllAdminData();
    }
  }, [isOpen]);

  const loadAllAdminData = async () => {
    setLoading(true);
    try {
      const [pRes, rRes, nRes, aRes, mRes, dRes, uRes] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        getLearningResources(),
        getNewsArticles(),
        fetchLiveWeatherAgriData(),
        getLearningModels(),
        getOfficialDocuments(),
        getUnansweredQuestions()
      ]);

      if (pRes.data) setProfiles(pRes.data);
      if (rRes.data) setResourcesList(rRes.data);
      if (nRes) setNewsList(nRes);
      if (aRes) setAgriData(aRes);
      if (mRes.data) setModelsList(mRes.data);
      if (dRes.data) setDocsList(dRes.data);
      if (uRes) setUnansweredList(uRes);
    } catch (err) {
      console.error('Lỗi tải dữ liệu quản trị:', err);
    } finally {
      setLoading(false);
    }
  };

  const showMsg = (type, text) => {
    setActionMsg({ type, text });
    setTimeout(() => setActionMsg({ type: '', text: '' }), 4000);
  };

  // ==========================================
  // XỬ LÝ 1: NẠP & ĐỒNG BỘ CSDL SUPABASE TỰ ĐỘNG
  // ==========================================
  const handleSeedDatabase = async () => {
    const confirm = window.confirm('Hành động này sẽ nạp và đồng bộ toàn bộ dữ liệu mẫu thực tế của Thôn 6 vào các bảng trong cơ sở dữ liệu Supabase. Thầy/Cô có muốn tiếp tục không?');
    if (!confirm) return;

    setIsSeeding(true);
    const { success, results } = await seedAllDatabaseTables((msg) => setSeedingProgress(msg));
    setIsSeeding(false);
    setSeedingProgress('');

    if (success) {
      showMsg('success', 'Đã nạp và đồng bộ 100% dữ liệu thực tế vào CSDL Supabase thành công!');
      loadAllAdminData();
      if (onRefreshAllData) onRefreshAllData();
    } else {
      showMsg('error', `Có lỗi xảy ra: ${results.errors.join(', ')}`);
    }
  };

  // ==========================================
  // XỬ LÝ 2: THÀNH VIÊN (PROFILES)
  // ==========================================
  const handleGrantAccount = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase.auth.signUp({
        email: newEmail,
        password: newPassword,
        options: {
          data: {
            full_name: newFullName,
            role: newRole
          }
        }
      });

      if (error) throw error;

      if (data?.user) {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          email: newEmail,
          full_name: newFullName,
          role: newRole,
          updated_at: new Date().toISOString()
        });
      }

      showMsg('success', `Đã cấp tài khoản cho ${newFullName} (${newEmail}) vai trò ${ROLE_DETAILS[newRole]?.name}!`);
      setNewFullName('');
      setNewEmail('');
      setNewPassword('Thon6@2026');
      loadAllAdminData();
    } catch (err) {
      showMsg('error', err.message || 'Lỗi cấp tài khoản');
    }
  };

  const handleChangeRole = async (userId, targetRole) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: targetRole, updated_at: new Date().toISOString() })
        .eq('id', userId);
      if (error) throw error;
      setProfiles(prev => prev.map(p => p.id === userId ? { ...p, role: targetRole } : p));
      showMsg('success', 'Đã cập nhật phân quyền vai trò!');
    } catch (err) {
      showMsg('error', err.message);
    }
  };

  // ==========================================
  // XỬ LÝ 3: BÀI HỌC KỸ NĂNG SỐ (RESOURCES)
  // ==========================================
  const handleSaveResource = async (e) => {
    e.preventDefault();
    try {
      if (isEditingRes && resForm.id) {
        await updateLearningResource(resForm.id, resForm);
        showMsg('success', 'Đã cập nhật bài học thành công!');
      } else {
        await createLearningResource(resForm);
        showMsg('success', 'Đã thêm bài học mới vào CSDL Supabase!');
      }
      setResForm({
        id: null,
        title: '',
        description: '',
        type: 'video',
        category: 'Tôi Muốn Học',
        media_url: '',
        source_author: 'Tổ Công nghệ số Cộng đồng Thôn 6',
        senior_friendly: true
      });
      setIsEditingRes(false);
      loadAllAdminData();
      if (onRefreshAllData) onRefreshAllData();
    } catch (err) {
      showMsg('error', err.message);
    }
  };

  const handleDeleteResource = async (id, title) => {
    if (!window.confirm(`Thầy/Cô có chắc muốn xóa bài học: "${title}"?`)) return;
    const res = await deleteLearningResource(id);
    if (res.success) {
      showMsg('success', 'Đã xóa bài học khỏi cơ sở dữ liệu!');
      loadAllAdminData();
      if (onRefreshAllData) onRefreshAllData();
    } else {
      showMsg('error', res.error);
    }
  };

  // ==========================================
  // XỬ LÝ 4: BẢN TIN THỜI SỰ (NEWS)
  // ==========================================
  const handleSaveNews = async (e) => {
    e.preventDefault();
    try {
      if (isEditingNews && newsForm.id) {
        await updateNewsArticle(newsForm.id, newsForm);
        showMsg('success', 'Đã cập nhật bài viết bản tin thành công!');
      } else {
        await createNewsArticle(newsForm);
        showMsg('success', 'Đã đăng bài viết bản tin mới lên hệ thống!');
      }
      setNewsForm({
        id: null,
        title: '',
        summary: '',
        content: '',
        category: 'Thông Báo Xã',
        scope: 'dilinh',
        image_url: '/banner_1.jpg',
        source: 'UBND Xã Di Linh',
        author: 'Tổ CNS Cộng Đồng',
        is_urgent: false
      });
      setIsEditingNews(false);
      loadAllAdminData();
      if (onRefreshAllData) onRefreshAllData();
    } catch (err) {
      showMsg('error', err.message);
    }
  };

  const handleDeleteNews = async (id, title) => {
    if (!window.confirm(`Thầy/Cô có chắc muốn xóa bản tin: "${title}"?`)) return;
    const res = await deleteNewsArticle(id);
    if (res.success) {
      showMsg('success', 'Đã xóa bản tin thành công!');
      loadAllAdminData();
      if (onRefreshAllData) onRefreshAllData();
    } else {
      showMsg('error', res.error);
    }
  };

  // ==========================================
  // XỬ LÝ 5: GIÁ NÔNG SẢN & THỜI TIẾT
  // ==========================================
  const handleUpdatePrice = async (item, newPriceStr, newAvg, newTrend, newChangeStr) => {
    const res = await updateAgriPriceItem(item.id, {
      price_str: newPriceStr,
      avg_price: Number(newAvg),
      trend: newTrend,
      change_str: newChangeStr
    });
    if (res.error) showMsg('error', res.error);
    else {
      showMsg('success', `Đã cập nhật giá ${item.name}!`);
      loadAllAdminData();
    }
  };

  // ==========================================
  // XỬ LÝ 6: VĂN BẢN PHÁP QUY & AI RAG (DOCUMENTS)
  // ==========================================
  const handleSaveDoc = async (e) => {
    e.preventDefault();
    try {
      if (isEditingDoc && docForm.id) {
        await updateOfficialDocument(docForm.id, docForm);
        showMsg('success', 'Đã cập nhật văn bản chính thống!');
      } else {
        await createOfficialDocument(docForm);
        showMsg('success', 'Đã thêm văn bản và nạp tri thức cho AI!');
      }
      setDocForm({
        id: null,
        doc_number: '',
        title: '',
        issuing_body: 'UBND Xã Di Linh',
        issued_date: new Date().toISOString().split('T')[0],
        effect_status: 'Còn hiệu lực',
        source_url: 'https://dilinh.lamdong.gov.vn',
        content_summary: ''
      });
      setIsEditingDoc(false);
      loadAllAdminData();
    } catch (err) {
      showMsg('error', err.message);
    }
  };

  const handleDeleteDoc = async (id, title) => {
    if (!window.confirm(`Xóa văn bản: "${title}"?`)) return;
    const res = await deleteOfficialDocument(id);
    if (res.success) {
      showMsg('success', 'Đã xóa văn bản!');
      loadAllAdminData();
    }
  };

  // ==========================================
  // XỬ LÝ 7: TRẢ LỜI CÂU HỎI AI CHƯA BIẾT
  // ==========================================
  const handleAnswerQuestion = async (qId) => {
    if (!answerText.trim()) return;
    const res = await answerUnansweredQuestion(qId, answerText);
    if (res.error) showMsg('error', res.error);
    else {
      showMsg('success', 'Đã trả lời câu hỏi và cập nhật vào kho hỗ trợ!');
      setAnsweringQuestionId(null);
      setAnswerText('');
      loadAllAdminData();
    }
  };

  if (!isOpen) return null;

  const filteredMembers = profiles.filter(p => {
    const matchName = (p.full_name || '').toLowerCase().includes(searchMember.toLowerCase()) || 
                      (p.email || '').toLowerCase().includes(searchMember.toLowerCase());
    const matchRole = filterRole === 'all' || p.role === filterRole;
    return matchName && matchRole;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl max-w-6xl w-full h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden relative">
        
        {/* HEADER QUẢN TRỊ TOÀN DIỆN */}
        <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-indigo-950 text-white p-4 sm:p-5 flex items-center justify-between shadow-md border-b border-purple-800/40">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md ring-2 ring-white/20">
              <Database className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-black text-base sm:text-lg tracking-tight">
                  CỔNG QUẢN TRỊ CƠ SỞ DỮ LIỆU THÔN 6 XÃ DI LINH
                </h2>
                <span className="bg-amber-400 text-slate-950 text-[10px] px-2 py-0.5 rounded-md font-black uppercase shadow-xs hidden sm:inline">
                  Admin CMS Portal
                </span>
              </div>
              <p className="text-xs text-purple-200 mt-0.5">
                Toàn quyền quản lý dữ liệu thực tế: Thành viên • Bài học • Bản tin • Nông sản • Văn bản RAG
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSeedDatabase}
              disabled={isSeeding}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-black text-xs shadow-md transition cursor-pointer disabled:opacity-50"
              title="Khởi tạo hoặc nạp lại toàn bộ dữ liệu mẫu thực tế vào Supabase"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSeeding ? 'animate-spin' : ''}`} />
              <span>{isSeeding ? (seedingProgress || 'Đang nạp DB...') : '⚡ Đồng Bộ CSDL Thực Tế'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/20 text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* THÔNG BÁO TRẠNG THÁI */}
        {actionMsg.text && (
          <div className={`px-4 py-2 text-xs font-bold flex items-center gap-2 ${
            actionMsg.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
          }`}>
            {actionMsg.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{actionMsg.text}</span>
          </div>
        )}

        {/* BẢNG ĐIỀU HƯỚNG TABS QUẢN TRỊ */}
        <div className="flex items-center gap-1.5 px-3 sm:px-6 py-2.5 bg-slate-100 border-b border-slate-200 overflow-x-auto scrollbar-none">
          {[
            { id: 'overview', label: '📊 Tổng Quan Số Liệu', count: null },
            { id: 'members', label: '👥 Thành Viên & Cấp Quyền', count: profiles.length },
            { id: 'resources', label: '🎬 Bài Học & Video', count: resourcesList.length },
            { id: 'news', label: '📰 Bản Tin & Thời Sự', count: newsList.length },
            { id: 'agri', label: '☕ Giá Nông Sản & Thời Tiết', count: agriData.agriPrices?.items?.length || 6 },
            { id: 'activities', label: '🌱 Hoạt Động Lan Tỏa', count: activities.length },
            { id: 'models', label: '💡 Mô Hình Số', count: modelsList.length },
            { id: 'docs', label: '📜 Văn Bản & Tri Thức AI', count: docsList.length },
            { id: 'unanswered', label: '❓ Nhật Ký Hỏi AI', count: unansweredList.length },
            { id: 'sql', label: '🗄️ SQL Schema CSDL', count: null }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-purple-900 text-white shadow-md'
                  : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeTab === tab.id ? 'bg-white/30 text-white' : 'bg-slate-200 text-slate-800'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* NỘI DUNG TỪNG TAB */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50">
          
          {/* TAB 1: TỔNG QUAN HỆ THỐNG */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="text-xs font-bold text-slate-500">Tài khoản thành viên</div>
                  <div className="text-2xl font-black text-purple-700 mt-1">{profiles.length}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Quản trị & Cán bộ Tổ CNS</div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="text-xs font-bold text-slate-500">Kho bài học & Video</div>
                  <div className="text-2xl font-black text-blue-700 mt-1">{resourcesList.length}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Hướng dẫn cầm tay chỉ việc</div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="text-xs font-bold text-slate-500">Bản tin & Cảnh báo</div>
                  <div className="text-2xl font-black text-amber-700 mt-1">{newsList.length}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Di Linh • Lâm Đồng • Cả Nước</div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="text-xs font-bold text-slate-500">Văn bản & Tri thức RAG</div>
                  <div className="text-2xl font-black text-emerald-700 mt-1">{docsList.length}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Dữ liệu nguồn huấn luyện AI</div>
                </div>
              </div>

              {/* CARD ĐỒNG BỘ CƠ SỞ DỮ LIỆU */}
              <div className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white p-6 rounded-3xl shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase">
                    ⚡ Đồng Bộ CSDL Supabase
                  </div>
                  <h3 className="text-lg font-black">Nạp Toàn Bộ Dữ Liệu Thực Tế Vào Database</h3>
                  <p className="text-xs text-purple-200 max-w-xl">
                    Chỉ với 1 click, hệ thống sẽ tự động khởi tạo và chèn dữ liệu thực tế chuẩn cho Giá nông sản Di Linh, Dự báo thời tiết, 8 bài học video, 4 bản tin chính thống và các văn bản chỉ đạo.
                  </p>
                </div>
                <button
                  onClick={handleSeedDatabase}
                  disabled={isSeeding}
                  className="px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-lg transition flex items-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
                >
                  <RefreshCw className={`w-4 h-4 ${isSeeding ? 'animate-spin' : ''}`} />
                  <span>{isSeeding ? (seedingProgress || 'Đang xử lý...') : 'Thực Hiện Đồng Bộ Ngay'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: QUẢN LÝ THÀNH VIÊN */}
          {activeTab === 'members' && (
            <div className="space-y-6">
              {/* FORM CẤP TÀI KHOẢN MỚI */}
              <div className="bg-white p-5 rounded-2xl border-2 border-purple-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="font-black text-sm text-slate-900 uppercase flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-purple-700" />
                    <span>Cấp Tài Khoản Mới Cho Thành Viên</span>
                  </h3>
                  <span className="text-[11px] text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded-md">
                    Thành viên không thể tự đăng ký ngoài trang chủ
                  </span>
                </div>
                <form onSubmit={handleGrantAccount} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Họ và tên *</label>
                    <input
                      type="text"
                      required
                      placeholder="Nguyễn Văn A"
                      value={newFullName}
                      onChange={e => setNewFullName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="a.thon6@dilinh.vn"
                      value={newEmail}
                      onChange={e => setNewEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Mật khẩu ban đầu *</label>
                    <input
                      type="text"
                      required
                      placeholder="Thon6@2026"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Vai trò cấp *</label>
                    <select
                      value={newRole}
                      onChange={e => setNewRole(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-slate-50 focus:ring-2 focus:ring-purple-500 focus:outline-none cursor-pointer"
                    >
                      <option value="tech_team">👥 Tổ công nghệ số</option>
                      <option value="supporter">🤝 Người hỗ trợ số</option>
                      <option value="citizen">👤 Người dân Thôn 6</option>
                      <option value="admin">⚙️ Quản trị viên</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2 lg:col-span-4">
                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-black text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Cấp Tài Khoản & Lưu Vào Supabase</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* DANH SÁCH THÀNH VIÊN */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-700" />
                    <span>Danh Sách Thành Viên ({filteredMembers.length})</span>
                  </h3>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Tìm tên hoặc email..."
                      value={searchMember}
                      onChange={e => setSearchMember(e.target.value)}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium w-48"
                    />
                    <select
                      value={filterRole}
                      onChange={e => setFilterRole(e.target.value)}
                      className="px-2 py-1.5 rounded-lg border border-slate-300 text-xs font-bold bg-slate-50"
                    >
                      <option value="all">Tất cả vai trò</option>
                      <option value="admin">Quản trị viên</option>
                      <option value="tech_team">Tổ CNS</option>
                      <option value="supporter">Người hỗ trợ</option>
                      <option value="citizen">Người dân</option>
                    </select>
                  </div>
                </div>

                <div className="divide-y divide-slate-100">
                  {filteredMembers.map(member => (
                    <div key={member.id} className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50 px-2 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-black text-xs">
                          {(member.full_name || member.email || 'U')[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-xs text-slate-900 flex items-center gap-2">
                            <span>{member.full_name || 'Chưa đặt tên'}</span>
                            <RoleBadge role={member.role} />
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">{member.email}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-400 font-medium">Đổi vai trò:</span>
                        <select
                          value={member.role || 'citizen'}
                          onChange={e => handleChangeRole(member.id, e.target.value)}
                          className="py-1 px-2 rounded-lg border border-slate-200 text-xs font-bold bg-white cursor-pointer shadow-xs"
                        >
                          <option value="admin">Quản trị viên</option>
                          <option value="tech_team">Tổ CNS</option>
                          <option value="supporter">Người hỗ trợ</option>
                          <option value="citizen">Người dân</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: BÀI HỌC KỸ NĂNG SỐ */}
          {activeTab === 'resources' && (
            <div className="space-y-6">
              {/* FORM THÊM / SỬA BÀI HỌC */}
              <div className="bg-white p-5 rounded-2xl border-2 border-blue-200 shadow-xs space-y-4">
                <h3 className="font-black text-sm text-slate-900 uppercase flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-700" />
                  <span>{isEditingRes ? 'Sửa Bài Học Kỹ Năng Số' : 'Thêm Bài Học Mới Vào Database'}</span>
                </h3>
                <form onSubmit={handleSaveResource} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Tiêu đề bài học *</label>
                    <input
                      type="text"
                      required
                      placeholder="🎥 Video Hướng Dẫn..."
                      value={resForm.title}
                      onChange={e => setResForm({ ...resForm, title: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Loại bài học *</label>
                    <select
                      value={resForm.type}
                      onChange={e => setResForm({ ...resForm, type: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-slate-50"
                    >
                      <option value="video">🎥 Video hướng dẫn</option>
                      <option value="infographic">✨ Infographic hình ảnh</option>
                      <option value="document">📄 Tài liệu / Cẩm nang</option>
                      <option value="audio">🎙️ Audio podcast</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Link Media (Youtube Embed / Ảnh / Audio) *</label>
                    <input
                      type="text"
                      required
                      placeholder="https://www.youtube.com/embed/pu3IBvcnC9U"
                      value={resForm.media_url}
                      onChange={e => setResForm({ ...resForm, media_url: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Chủ đề bài học</label>
                    <input
                      type="text"
                      placeholder="Tôi Muốn Học / VNeID / Zalo"
                      value={resForm.category}
                      onChange={e => setResForm({ ...resForm, category: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Mô tả tóm tắt</label>
                    <textarea
                      rows={2}
                      placeholder="Tóm tắt ngắn gọn nội dung hướng dẫn..."
                      value={resForm.description}
                      onChange={e => setResForm({ ...resForm, description: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium"
                    />
                  </div>
                  <div className="sm:col-span-3 flex items-center gap-2">
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>{isEditingRes ? 'Cập Nhật Bài Học' : 'Lưu Vào CSDL Supabase'}</span>
                    </button>
                    {isEditingRes && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditingRes(false);
                          setResForm({
                            id: null,
                            title: '',
                            description: '',
                            type: 'video',
                            category: 'Tôi Muốn Học',
                            media_url: '',
                            source_author: 'Tổ Công nghệ số Cộng đồng Thôn 6',
                            senior_friendly: true
                          });
                        }}
                        className="px-4 py-2.5 rounded-xl bg-slate-200 text-slate-700 font-bold text-xs"
                      >
                        Hủy Sửa
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* DANH SÁCH BÀI HỌC HIỆN TẠI TRONG CSDL */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <h3 className="font-black text-sm text-slate-900 pb-2 border-b border-slate-100">
                  Danh Sách Bài Học Trong Database ({resourcesList.length})
                </h3>
                <div className="divide-y divide-slate-100">
                  {resourcesList.map(res => (
                    <div key={res.id} className="py-3 flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                            {res.type}
                          </span>
                          <span className="text-[11px] text-slate-400 font-bold">{res.category}</span>
                        </div>
                        <h4 className="font-bold text-xs text-slate-900">{res.title}</h4>
                        <p className="text-[11px] text-slate-500 line-clamp-1">{res.description}</p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => {
                            setResForm(res);
                            setIsEditingRes(true);
                          }}
                          className="p-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs"
                          title="Sửa bài học"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteResource(res.id, res.title)}
                          className="p-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 font-bold text-xs"
                          title="Xóa bài học"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: BẢN TIN THỜI SỰ */}
          {activeTab === 'news' && (
            <div className="space-y-6">
              {/* FORM THÊM / SỬA BẢN TIN */}
              <div className="bg-white p-5 rounded-2xl border-2 border-amber-200 shadow-xs space-y-4">
                <h3 className="font-black text-sm text-slate-900 uppercase flex items-center gap-2">
                  <Newspaper className="w-5 h-5 text-amber-700" />
                  <span>{isEditingNews ? 'Sửa Bài Viết Bản Tin' : 'Đăng Bản Tin Mới Lên Database'}</span>
                </h3>
                <form onSubmit={handleSaveNews} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Tiêu đề bản tin *</label>
                    <input
                      type="text"
                      required
                      placeholder="Tiêu đề bài báo hoặc thông báo..."
                      value={newsForm.title}
                      onChange={e => setNewsForm({ ...newsForm, title: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Phạm vi tin tức *</label>
                    <select
                      value={newsForm.scope}
                      onChange={e => setNewsForm({ ...newsForm, scope: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-slate-50"
                    >
                      <option value="dilinh">🏛️ Xã Di Linh</option>
                      <option value="lamdong">🌲 Tỉnh Lâm Đồng</option>
                      <option value="national">🇻🇳 Cả Nước</option>
                    </select>
                  </div>
                  <div className="sm:col-span-3">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Tóm tắt bài viết *</label>
                    <textarea
                      rows={2}
                      required
                      placeholder="Tóm tắt nội dung bài viết..."
                      value={newsForm.summary}
                      onChange={e => setNewsForm({ ...newsForm, summary: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Nội dung chi tiết *</label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Nội dung đầy đủ của bản tin..."
                      value={newsForm.content}
                      onChange={e => setNewsForm({ ...newsForm, content: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium"
                    />
                  </div>
                  <div className="sm:col-span-3 flex items-center gap-2">
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>{isEditingNews ? 'Cập Nhật Bản Tin' : 'Đăng Lên CSDL Supabase'}</span>
                    </button>
                    {isEditingNews && (
                      <button
                        type="button"
                        onClick={() => setIsEditingNews(false)}
                        className="px-4 py-2.5 rounded-xl bg-slate-200 text-slate-700 font-bold text-xs"
                      >
                        Hủy Sửa
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* DANH SÁCH BẢN TIN TRONG CSDL */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <h3 className="font-black text-sm text-slate-900 pb-2 border-b border-slate-100">
                  Bản Tin Đang Hoạt Động ({newsList.length})
                </h3>
                <div className="divide-y divide-slate-100">
                  {newsList.map(news => (
                    <div key={news.id} className="py-3 flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                            {news.category || 'Tin tức'}
                          </span>
                          <span className="text-[11px] text-slate-400 font-bold">{news.published_date}</span>
                        </div>
                        <h4 className="font-bold text-xs text-slate-900">{news.title}</h4>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => {
                            setNewsForm(news);
                            setIsEditingNews(true);
                          }}
                          className="p-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 font-bold text-xs"
                          title="Sửa bản tin"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteNews(news.id, news.title)}
                          className="p-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 font-bold text-xs"
                          title="Xóa bản tin"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: GIÁ NÔNG SẢN & THỜI TIẾT */}
          {activeTab === 'agri' && (
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <h3 className="font-black text-sm text-slate-900 uppercase flex items-center gap-2">
                  <CloudSun className="w-5 h-5 text-emerald-700" />
                  <span>Quản Lý & Cập Nhật Bảng Giá Nông Sản Di Linh</span>
                </h3>
                <div className="divide-y divide-slate-100">
                  {agriData.agriPrices?.items?.map(item => (
                    <div key={item.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">{item.icon || '☕'}</span>
                        <div>
                          <div className="font-bold text-xs text-slate-900">{item.name}</div>
                          <div className="text-[11px] text-slate-500 font-medium">{item.note}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          defaultValue={item.price_str}
                          id={`price-str-${item.id}`}
                          className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold w-36"
                          placeholder="120.000 – 122.000"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newPrice = document.getElementById(`price-str-${item.id}`).value;
                            handleUpdatePrice(item, newPrice, item.avg_price, item.trend, item.change_str);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-xs cursor-pointer"
                        >
                          Lưu Giá
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: HOẠT ĐỘNG LAN TỎA */}
          {activeTab === 'activities' && (
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <h3 className="font-black text-sm text-slate-900 pb-2 border-b border-slate-100 flex items-center justify-between">
                  <span>Danh Sách Hoạt Động Lan Tỏa ({activities.length})</span>
                </h3>
                <div className="divide-y divide-slate-100">
                  {activities.map(act => (
                    <div key={act.id} className="py-3 flex items-center justify-between gap-4">
                      <div>
                        <h4 className="font-bold text-xs text-slate-900">{act.title}</h4>
                        <p className="text-[11px] text-slate-500 line-clamp-1">{act.description}</p>
                      </div>
                      <button
                        onClick={() => {
                          if (onDeleteActivity) onDeleteActivity(act);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Xóa Bài</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: VĂN BẢN PHÁP QUY & RAG */}
          {activeTab === 'docs' && (
            <div className="space-y-6">
              {/* FORM THÊM / SỬA VĂN BẢN */}
              <div className="bg-white p-5 rounded-2xl border-2 border-indigo-200 shadow-xs space-y-4">
                <h3 className="font-black text-sm text-slate-900 uppercase flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-700" />
                  <span>{isEditingDoc ? 'Sửa Văn Bản Chính Thống' : 'Thêm Văn Bản Nạp Tri Thức Cho AI'}</span>
                </h3>
                <form onSubmit={handleSaveDoc} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Số hiệu văn bản *</label>
                    <input
                      type="text"
                      required
                      placeholder="06/QĐ-TTg hoặc 24/KH-UBND"
                      value={docForm.doc_number}
                      onChange={e => setDocForm({ ...docForm, doc_number: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Cơ quan ban hành *</label>
                    <input
                      type="text"
                      required
                      placeholder="UBND Xã Di Linh / Thủ tướng Chính phủ"
                      value={docForm.issuing_body}
                      onChange={e => setDocForm({ ...docForm, issuing_body: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Tên văn bản / Trích yếu *</label>
                    <input
                      type="text"
                      required
                      placeholder="Kế hoạch triển khai phong trào..."
                      value={docForm.title}
                      onChange={e => setDocForm({ ...docForm, title: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Nội dung cốt lõi huấn luyện AI RAG *</label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Quy định chi tiết giúp AI giải đáp chính xác cho người dân..."
                      value={docForm.content_summary}
                      onChange={e => setDocForm({ ...docForm, content_summary: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>{isEditingDoc ? 'Cập Nhật Văn Bản' : 'Lưu & Nạp Vào AI RAG'}</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* DANH SÁCH VĂN BẢN TRONG CSDL */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <h3 className="font-black text-sm text-slate-900 pb-2 border-b border-slate-100">
                  Văn Bản Đang Phục Vụ Tra Cứu ({docsList.length})
                </h3>
                <div className="divide-y divide-slate-100">
                  {docsList.map(doc => (
                    <div key={doc.id} className="py-3 flex items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase bg-indigo-100 text-indigo-900 px-2 py-0.5 rounded">
                            {doc.doc_number}
                          </span>
                          <span className="text-[11px] text-slate-500 font-bold">{doc.issuing_body}</span>
                        </div>
                        <h4 className="font-bold text-xs text-slate-900 mt-1">{doc.title}</h4>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => {
                            setDocForm(doc);
                            setIsEditingDoc(true);
                          }}
                          className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold text-xs"
                          title="Sửa văn bản"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteDoc(doc.id, doc.title)}
                          className="p-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 font-bold text-xs"
                          title="Xóa văn bản"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: NHẬT KÝ CÂU HỎI AI CHƯA BIẾT */}
          {activeTab === 'unanswered' && (
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <h3 className="font-black text-sm text-slate-900 uppercase flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-red-600" />
                  <span>Nhật Ký Câu Hỏi Người Dân Cần Giải Đáp ({unansweredList.length})</span>
                </h3>
                <div className="divide-y divide-slate-100">
                  {unansweredList.map(q => (
                    <div key={q.id} className="py-3 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-black uppercase bg-red-100 text-red-800 px-2 py-0.5 rounded">
                            Chưa có câu trả lời
                          </span>
                          <h4 className="font-bold text-xs text-slate-900 mt-1">"{q.question}"</h4>
                        </div>
                        <button
                          onClick={() => {
                            setAnsweringQuestionId(q.id);
                            setAnswerText(q.answer || '');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer shrink-0"
                        >
                          Trả Lời & Lưu
                        </button>
                      </div>

                      {answeringQuestionId === q.id && (
                        <div className="p-3 bg-blue-50 rounded-xl space-y-2 border border-blue-200">
                          <label className="block text-xs font-bold text-blue-900">Nhập câu trả lời chuẩn từ Tổ CNS:</label>
                          <textarea
                            rows={2}
                            value={answerText}
                            onChange={e => setAnswerText(e.target.value)}
                            placeholder="Nhập hướng dẫn chính xác để gửi cho người dân..."
                            className="w-full p-2 text-xs rounded-lg border border-blue-300 font-medium"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleAnswerQuestion(q.id)}
                              className="px-4 py-1.5 rounded-lg bg-blue-600 text-white font-bold text-xs cursor-pointer"
                            >
                              Lưu Câu Trả Lời
                            </button>
                            <button
                              onClick={() => setAnsweringQuestionId(null)}
                              className="px-3 py-1.5 rounded-lg bg-slate-200 text-slate-700 font-bold text-xs"
                            >
                              Đóng
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: SQL SCHEMA CSDL */}
          {activeTab === 'sql' && (
            <div className="space-y-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-sm text-slate-900 uppercase">
                  Câu Lệnh SQL Khởi Tạo Toàn Bộ Bảng Database Supabase
                </h3>
                <span className="text-xs font-mono bg-purple-100 text-purple-900 px-2 py-0.5 rounded font-bold">
                  supabase_full_database.sql
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Thầy/Cô có thể copy toàn bộ câu lệnh SQL dưới đây và dán vào <strong>Supabase SQL Editor</strong> rồi nhấn <strong>Run</strong> để tự động tạo 9 bảng và nạp 100% dữ liệu thực tế:
              </p>
              <pre className="bg-slate-950 text-emerald-400 p-4 rounded-xl text-xs font-mono max-h-96 overflow-y-auto leading-relaxed select-all">
                {`-- Vui lòng xem file: supabase_full_database.sql trong thư mục mã nguồn`}
              </pre>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
