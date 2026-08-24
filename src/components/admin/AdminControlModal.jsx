import React, { useState, useEffect } from 'react';
import { 
  X, ShieldCheck, UserPlus, Users, Trash2, Edit3, Key, CheckCircle, 
  AlertCircle, ShieldAlert, Sparkles, RefreshCw, Mail, Lock, User, 
  Search, Eye, Filter, Plus, BookOpen, Newspaper, CloudSun, HeartHandshake, 
  Lightbulb, FileText, HelpCircle, Database, ArrowRight, ExternalLink, Save,
  QrCode, Phone, PhoneCall, MessageSquare, MessageCircle, Building2, UserCheck, PlusCircle
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
import { 
  getVillageContactsConfig, updateVillageContactsConfig, DEFAULT_VILLAGE_CONTACTS 
} from '../../services/contactConfigService';

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

  // 5. FORM STATES (VĂN BẢN & TRI THỨC AI 12 TRỤ CỘT)
  const [docCategoryFilter, setDocCategoryFilter] = useState('all');
  const [docForm, setDocForm] = useState({
    id: null,
    doc_number: '',
    title: '',
    issuing_body: 'UBND Xã Di Linh',
    issued_date: new Date().toISOString().split('T')[0],
    category: 'VNeID & Định danh điện tử',
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

  // 8. CẤU HÌNH MÃ QR, SỐ ZALO & DANH BẠ BQT, TỔ CNS
  const [contactsConfig, setContactsConfig] = useState(DEFAULT_VILLAGE_CONTACTS);
  const [newBqtMember, setNewBqtMember] = useState({ name: '', role_title: '', phone: '', zalo: '', duty: '' });
  const [newCnsMember, setNewCnsMember] = useState({ name: '', role_title: '', phone: '', zalo: '', duty: '' });
  const [isAddingBqt, setIsAddingBqt] = useState(false);
  const [isAddingCns, setIsAddingCns] = useState(false);
  const [editingBqtId, setEditingBqtId] = useState(null);
  const [editingBqtData, setEditingBqtData] = useState({ name: '', role_title: '', phone: '', zalo: '', duty: '' });
  const [editingCnsId, setEditingCnsId] = useState(null);
  const [editingCnsData, setEditingCnsData] = useState({ name: '', role_title: '', phone: '', zalo: '', duty: '' });

  useEffect(() => {
    if (isOpen) {
      loadAllAdminData();
    }
  }, [isOpen]);

  const loadAllAdminData = async () => {
    setLoading(true);
    try {
      const [pRes, rRes, nRes, aRes, mRes, dRes, uRes, cConfig] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        getLearningResources(),
        getNewsArticles(),
        fetchLiveWeatherAgriData(),
        getLearningModels(),
        getOfficialDocuments(),
        getUnansweredQuestions(),
        getVillageContactsConfig()
      ]);

      if (pRes.data) setProfiles(pRes.data);
      if (rRes.data) setResourcesList(rRes.data);
      if (nRes) setNewsList(nRes);
      if (aRes) setAgriData(aRes);
      if (mRes.data) setModelsList(mRes.data);
      if (dRes.data) setDocsList(dRes.data);
      if (uRes) setUnansweredList(uRes);
      if (cConfig) setContactsConfig(cConfig);
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

  // ==========================================
  // XỬ LÝ 8: CẤU HÌNH LIÊN HỆ, MÃ QR & DANH BẠ
  // ==========================================
  const handleSaveContacts = async (e) => {
    if (e) e.preventDefault();
    const res = await updateVillageContactsConfig(contactsConfig);
    if (res.success) {
      showMsg('success', 'Đã lưu cấu hình Mã QR, Số Zalo và Danh bạ Thôn 6 thành công!');
      if (onRefreshAllData) onRefreshAllData();
    } else {
      showMsg('error', res.warning || 'Có lỗi khi lưu');
    }
  };

  const handleAddBqt = (e) => {
    e.preventDefault();
    if (!newBqtMember.name.trim() || !newBqtMember.phone.trim()) {
      showMsg('error', 'Vui lòng nhập họ tên và số điện thoại cán bộ Ban Quản Trị');
      return;
    }
    const member = {
      id: `admin-${Date.now()}`,
      ...newBqtMember,
      zalo: newBqtMember.zalo || newBqtMember.phone.replace(/[^0-9]/g, '')
    };
    const updated = {
      ...contactsConfig,
      management_board: [...(contactsConfig.management_board || []), member]
    };
    setContactsConfig(updated);
    setNewBqtMember({ name: '', role_title: '', phone: '', zalo: '', duty: '' });
    setIsAddingBqt(false);
    updateVillageContactsConfig(updated);
    showMsg('success', `Đã thêm ${member.name} vào danh bạ Ban Quản Trị!`);
  };

  const handleDeleteBqt = (id) => {
    const updated = {
      ...contactsConfig,
      management_board: (contactsConfig.management_board || []).filter(m => m.id !== id)
    };
    setContactsConfig(updated);
    updateVillageContactsConfig(updated);
    showMsg('success', 'Đã xóa cán bộ khỏi danh bạ Ban Quản Trị!');
  };

  const handleAddCns = (e) => {
    e.preventDefault();
    if (!newCnsMember.name.trim() || !newCnsMember.phone.trim()) {
      showMsg('error', 'Vui lòng nhập họ tên và số điện thoại thành viên Tổ CNS');
      return;
    }
    const member = {
      id: `cns-${Date.now()}`,
      ...newCnsMember,
      zalo: newCnsMember.zalo || newCnsMember.phone.replace(/[^0-9]/g, '')
    };
    const updated = {
      ...contactsConfig,
      cns_team: [...(contactsConfig.cns_team || []), member]
    };
    setContactsConfig(updated);
    setNewCnsMember({ name: '', role_title: '', phone: '', zalo: '', duty: '' });
    setIsAddingCns(false);
    updateVillageContactsConfig(updated);
    showMsg('success', `Đã thêm ${member.name} vào danh bạ Tổ Công Nghệ Số!`);
  };

  const handleDeleteCns = (id) => {
    const updated = {
      ...contactsConfig,
      cns_team: (contactsConfig.cns_team || []).filter(m => m.id !== id)
    };
    setContactsConfig(updated);
    updateVillageContactsConfig(updated);
    showMsg('success', 'Đã xóa thành viên khỏi danh bạ Tổ Công Nghệ Số!');
  };

  const handleSaveEditedBqt = (id) => {
    if (!editingBqtData.name.trim() || !editingBqtData.phone.trim()) {
      showMsg('error', 'Vui lòng nhập họ tên và số điện thoại cán bộ Ban Quản Trị');
      return;
    }
    const updated = {
      ...contactsConfig,
      management_board: (contactsConfig.management_board || []).map(m => m.id === id ? {
        ...m,
        ...editingBqtData,
        zalo: editingBqtData.zalo || editingBqtData.phone.replace(/[^0-9]/g, '')
      } : m)
    };
    setContactsConfig(updated);
    setEditingBqtId(null);
    updateVillageContactsConfig(updated);
    showMsg('success', `Đã cập nhật thông tin cán bộ ${editingBqtData.name}!`);
  };

  const handleSaveEditedCns = (id) => {
    if (!editingCnsData.name.trim() || !editingCnsData.phone.trim()) {
      showMsg('error', 'Vui lòng nhập họ tên và số điện thoại thành viên Tổ CNS');
      return;
    }
    const updated = {
      ...contactsConfig,
      cns_team: (contactsConfig.cns_team || []).map(m => m.id === id ? {
        ...m,
        ...editingCnsData,
        zalo: editingCnsData.zalo || editingCnsData.phone.replace(/[^0-9]/g, '')
      } : m)
    };
    setContactsConfig(updated);
    setEditingCnsId(null);
    updateVillageContactsConfig(updated);
    showMsg('success', `Đã cập nhật thông tin thành viên ${editingCnsData.name}!`);
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
            { id: 'contacts_qr', label: '📱 Cấu Hình Hotline & QR Zalo', count: (contactsConfig.management_board?.length || 0) + (contactsConfig.cns_team?.length || 0) },
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

          {/* TAB MỚI: CẤU HÌNH MÃ QR, SỐ ZALO & DANH BẠ BQT / TỔ CNS */}
          {activeTab === 'contacts_qr' && (
            <div className="space-y-6">
              
              {/* THANH ĐIỀU KHIỂN & NÚT LƯU CẤU HÌNH TRÊN CÙNG */}
              <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 text-white p-5 rounded-3xl shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-blue-400/30">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase">
                    📱 Trung Tâm Cấu Hình Liên Hệ
                  </div>
                  <h3 className="text-lg font-black tracking-tight">
                    Cấu Hình Mã QR Zalo, Hotline & Danh Bạ Thôn 6
                  </h3>
                  <p className="text-xs text-blue-200 max-w-2xl">
                    Mọi thay đổi tại đây (Mã QR, Hotline Zalo, Danh bạ Ban Quản Trị, Cán bộ Tổ CNS) sẽ được cập nhật tự động lên toàn bộ Banner, Menu, Hotline và Cửa sổ hỗ trợ người dân trên website.
                  </p>
                </div>
                <button
                  onClick={handleSaveContacts}
                  className="px-6 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-lg hover:shadow-xl transition flex items-center gap-2 cursor-pointer shrink-0"
                >
                  <Save className="w-4 h-4" />
                  <span>💾 Lưu Toàn Bộ Cấu Hình</span>
                </button>
              </div>

              {/* KHỐI 1: CẤU HÌNH MÃ QR & LINK ZALO */}
              <div className="bg-white p-5 rounded-2xl border-2 border-blue-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="font-black text-sm text-slate-900 uppercase flex items-center gap-2">
                    <QrCode className="w-5 h-5 text-blue-600" />
                    <span>1. Cấu Hình Mã QR Nhóm Zalo Thôn 6</span>
                  </h3>
                  <span className="text-[11px] text-blue-700 font-bold bg-blue-50 px-2.5 py-0.5 rounded-md">
                    Hiển thị trên Banner & Cửa sổ Quét QR
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                  
                  {/* PREVIEW ẢNH QR TRỰC QUAN */}
                  <div className="md:col-span-4 flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                    <div className="w-32 h-32 bg-white rounded-xl p-2 shadow-md border border-slate-200 flex items-center justify-center overflow-hidden mb-2">
                      <img 
                        src={contactsConfig.qr_zalo_image || '/qr_zalo_thon6.png'} 
                        alt="Xem trước mã QR Zalo" 
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(contactsConfig.zalo_community_link || 'https://zalo.me/0903382277')}`;
                        }}
                      />
                    </div>
                    <span className="text-xs font-black text-slate-800">{contactsConfig.qr_zalo_title || 'Nhóm Zalo Thôn 6'}</span>
                    <span className="text-[10px] text-slate-500 line-clamp-1">{contactsConfig.qr_zalo_description || 'Cộng đồng Chuyển đổi số Thôn 6'}</span>
                    <a
                      href={contactsConfig.zalo_community_link || 'https://zalo.me/0903382277'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 text-[10px] text-blue-600 font-bold hover:underline flex items-center gap-1"
                    >
                      <span>Mở link Zalo thử nghiệm</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  {/* CÁC Ô NHẬP LIỆU */}
                  <div className="md:col-span-8 space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Đường dẫn file ảnh QR (URL ảnh hoặc /qr_zalo_thon6.png) *
                      </label>
                      <input
                        type="text"
                        value={contactsConfig.qr_zalo_image || ''}
                        onChange={(e) => setContactsConfig({ ...contactsConfig, qr_zalo_image: e.target.value })}
                        placeholder="/qr_zalo_thon6.png hoặc link ảnh online"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Link tham gia nhóm Zalo / SĐT Zalo *
                      </label>
                      <input
                        type="text"
                        value={contactsConfig.zalo_community_link || ''}
                        onChange={(e) => setContactsConfig({ ...contactsConfig, zalo_community_link: e.target.value })}
                        placeholder="https://zalo.me/0903382277 hoặc https://zalo.me/g/..."
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Tiêu đề khối QR *
                        </label>
                        <input
                          type="text"
                          value={contactsConfig.qr_zalo_title || ''}
                          onChange={(e) => setContactsConfig({ ...contactsConfig, qr_zalo_title: e.target.value })}
                          placeholder="Quét Mã Tham Gia"
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Mô tả phụ *
                        </label>
                        <input
                          type="text"
                          value={contactsConfig.qr_zalo_description || ''}
                          onChange={(e) => setContactsConfig({ ...contactsConfig, qr_zalo_description: e.target.value })}
                          placeholder="Cộng Đồng Thôn 6"
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* KHỐI 2: CẤU HÌNH NÚT CHAT BOX ZALO NỔI GÓC MÀN HÌNH */}
              <div className="bg-white p-5 rounded-2xl border-2 border-sky-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="font-black text-sm text-slate-900 uppercase flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-sky-600" />
                    <span>2. Cấu Hình Nút Chat Box Zalo Nổi (Góc Màn Hình)</span>
                  </h3>
                  <span className="text-[11px] text-sky-800 font-bold bg-sky-50 px-2.5 py-0.5 rounded-md">
                    Sticker nổi hỗ trợ người dân 24/7
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-center">
                  
                  {/* CỘT TRÁI: FORM NHẬP THÔNG TIN CHAT BOX ZALO */}
                  <div className="lg:col-span-2 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Số điện thoại Zalo Chat *
                        </label>
                        <input
                          type="text"
                          value={contactsConfig.chat_zalo_phone || ''}
                          onChange={(e) => {
                            const newPhone = e.target.value;
                            setContactsConfig({
                              ...contactsConfig,
                              chat_zalo_phone: newPhone,
                              chat_zalo_subtitle: (contactsConfig.chat_zalo_subtitle === contactsConfig.chat_zalo_phone || !contactsConfig.chat_zalo_subtitle) ? newPhone : contactsConfig.chat_zalo_subtitle,
                              chat_zalo_link: `https://zalo.me/${newPhone.replace(/[^0-9]/g, '')}`
                            });
                          }}
                          placeholder="0903.382.277"
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-sky-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Link mở Chat Zalo *
                        </label>
                        <input
                          type="text"
                          value={contactsConfig.chat_zalo_link || ''}
                          onChange={(e) => setContactsConfig({ ...contactsConfig, chat_zalo_link: e.target.value })}
                          placeholder="https://zalo.me/0903382277"
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Tiêu đề nút Chat *
                        </label>
                        <input
                          type="text"
                          value={contactsConfig.chat_zalo_title || ''}
                          onChange={(e) => setContactsConfig({ ...contactsConfig, chat_zalo_title: e.target.value })}
                          placeholder="Chat Zalo Hỗ Trợ"
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Phụ đề hiển thị trên nút *
                        </label>
                        <input
                          type="text"
                          value={contactsConfig.chat_zalo_subtitle || ''}
                          onChange={(e) => setContactsConfig({ ...contactsConfig, chat_zalo_subtitle: e.target.value })}
                          placeholder="0903.382.277 hoặc Trực tuyến 24/7"
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* CỘT PHẢI: PREVIEW NÚT CHAT ZALO THỜI GIAN THỰC */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col items-center justify-center space-y-2 text-center">
                    <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-tight">
                      Xem Trước Nút Nổi Thực Tế
                    </span>
                    <a
                      href={contactsConfig.chat_zalo_link || `https://zalo.me/${(contactsConfig.chat_zalo_phone || '').replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-gradient-to-r from-[#0068FF] to-[#0089e8] text-white shadow-md border-2 border-white pointer-events-auto hover:opacity-95 transition"
                    >
                      <span className="relative flex h-2.5 w-2.5 shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-200 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
                      </span>
                      <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-[#0068FF] font-black text-[10px] shadow-xs shrink-0">
                        Zalo
                      </div>
                      <div className="text-left pr-1">
                        <div className="text-[9px] font-extrabold uppercase tracking-wider text-sky-100 leading-none">
                          {contactsConfig.chat_zalo_title || 'Chat Zalo Hỗ Trợ'}
                        </div>
                        <div className="text-[11px] font-black text-white mt-0.5 leading-none tracking-tight">
                          {contactsConfig.chat_zalo_subtitle || contactsConfig.chat_zalo_phone || '0903.382.277'}
                        </div>
                      </div>
                    </a>
                    <span className="text-[10px] text-slate-400 font-medium">Bấm vào để thử mở Zalo chat</span>
                  </div>

                </div>
              </div>

              {/* KHỐI 3: CẤU HÌNH HOTLINE CẦM TAY CHỈ VIỆC */}
              <div className="bg-white p-5 rounded-2xl border-2 border-emerald-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="font-black text-sm text-slate-900 uppercase flex items-center gap-2">
                    <PhoneCall className="w-5 h-5 text-emerald-600" />
                    <span>3. Cấu Hình Số Hotline Cầm Tay Chỉ Việc 24/7</span>
                  </h3>
                  <span className="text-[11px] text-emerald-800 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-md">
                    Hiển thị chân trang & thanh menu bên trái
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Số điện thoại Hotline chính *
                    </label>
                    <input
                      type="text"
                      value={contactsConfig.hotline_main || ''}
                      onChange={(e) => setContactsConfig({ ...contactsConfig, hotline_main: e.target.value })}
                      placeholder="0903.382.277"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-emerald-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Tên Hotline *
                    </label>
                    <input
                      type="text"
                      value={contactsConfig.hotline_title || ''}
                      onChange={(e) => setContactsConfig({ ...contactsConfig, hotline_title: e.target.value })}
                      placeholder="Hotline Cầm Tay Chỉ Việc"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Mô tả dịch vụ trực *
                    </label>
                    <input
                      type="text"
                      value={contactsConfig.hotline_description || ''}
                      onChange={(e) => setContactsConfig({ ...contactsConfig, hotline_description: e.target.value })}
                      placeholder="Hỗ trợ kỹ năng số, VNeID 24/7"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* KHỐI 4: DANH BẠ BAN QUẢN TRỊ THÔN 6 */}
              <div className="bg-white p-5 rounded-2xl border-2 border-purple-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-purple-700" />
                    <h3 className="font-black text-sm text-slate-900 uppercase">
                      4. Danh Bạ Ban Quản Trị Thôn 6 ({(contactsConfig.management_board || []).length} Cán Bộ)
                    </h3>
                  </div>
                  <button
                    onClick={() => setIsAddingBqt(!isAddingBqt)}
                    className="px-3 py-1.5 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-900 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>{isAddingBqt ? 'Đóng form thêm' : '+ Thêm Cán Bộ BQT'}</span>
                  </button>
                </div>

                {/* FORM THÊM THÀNH VIÊN BQT */}
                {isAddingBqt && (
                  <form onSubmit={handleAddBqt} className="p-4 bg-purple-50 rounded-2xl border border-purple-200 space-y-3">
                    <h4 className="font-black text-xs text-purple-950 uppercase">Thêm Cán Bộ Vào Ban Quản Trị Thôn 6:</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Họ và tên cán bộ *</label>
                        <input
                          type="text"
                          required
                          placeholder="Ví dụ: Nguyễn Văn Đạt"
                          value={newBqtMember.name}
                          onChange={(e) => setNewBqtMember({ ...newBqtMember, name: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Chức danh / Vị trí *</label>
                        <input
                          type="text"
                          required
                          placeholder="Trưởng Thôn 6 / Bí thư..."
                          value={newBqtMember.role_title}
                          onChange={(e) => setNewBqtMember({ ...newBqtMember, role_title: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Số điện thoại liên hệ *</label>
                        <input
                          type="text"
                          required
                          placeholder="0903.382.277"
                          value={newBqtMember.phone}
                          onChange={(e) => setNewBqtMember({ ...newBqtMember, phone: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Số Zalo (nếu có)</label>
                        <input
                          type="text"
                          placeholder="0903382277"
                          value={newBqtMember.zalo}
                          onChange={(e) => setNewBqtMember({ ...newBqtMember, zalo: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium bg-white"
                        />
                      </div>
                      <div className="sm:col-span-2 lg:col-span-4">
                        <label className="block text-xs font-bold text-slate-700 mb-1">Nhiệm vụ phụ trách</label>
                        <input
                          type="text"
                          placeholder="Chỉ đạo phong trào, phụ trách chung các hoạt động..."
                          value={newBqtMember.duty}
                          onChange={(e) => setNewBqtMember({ ...newBqtMember, duty: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium bg-white"
                        />
                      </div>
                      <div className="sm:col-span-2 lg:col-span-4">
                        <button
                          type="submit"
                          className="w-full py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-black text-xs shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Thêm Vào Danh Sách Ban Quản Trị</span>
                        </button>
                      </div>
                    </div>
                  </form>
                )}

                {/* DANH SÁCH THÀNH VIÊN BQT */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {(contactsConfig.management_board || []).map((m) => (
                    <div key={m.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-purple-300 transition space-y-2 flex flex-col justify-between">
                      {editingBqtId === m.id ? (
                        /* CHẾ ĐỘ CHỈNH SỬA TRỰC TIẾP TẠI CHỖ */
                        <div className="space-y-2">
                          <div className="flex items-center justify-between pb-1 border-b border-purple-200">
                            <span className="text-[11px] font-black uppercase text-purple-900">✏️ Chỉnh Sửa Cán Bộ BQT</span>
                            <button
                              onClick={() => setEditingBqtId(null)}
                              className="text-slate-400 hover:text-slate-700 text-xs font-bold"
                            >
                              ✕
                            </button>
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Chức danh / Vị trí</label>
                            <input
                              type="text"
                              value={editingBqtData.role_title}
                              onChange={(e) => setEditingBqtData({ ...editingBqtData, role_title: e.target.value })}
                              className="w-full px-2.5 py-1.5 rounded-lg border border-purple-300 text-xs font-bold bg-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Họ và tên</label>
                            <input
                              type="text"
                              value={editingBqtData.name}
                              onChange={(e) => setEditingBqtData({ ...editingBqtData, name: e.target.value })}
                              className="w-full px-2.5 py-1.5 rounded-lg border border-purple-300 text-xs font-bold bg-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Số điện thoại</label>
                              <input
                                type="text"
                                value={editingBqtData.phone}
                                onChange={(e) => setEditingBqtData({ ...editingBqtData, phone: e.target.value })}
                                className="w-full px-2.5 py-1.5 rounded-lg border border-purple-300 text-xs font-medium bg-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Số Zalo</label>
                              <input
                                type="text"
                                value={editingBqtData.zalo}
                                onChange={(e) => setEditingBqtData({ ...editingBqtData, zalo: e.target.value })}
                                className="w-full px-2.5 py-1.5 rounded-lg border border-purple-300 text-xs font-medium bg-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Nhiệm vụ phụ trách</label>
                            <input
                              type="text"
                              value={editingBqtData.duty}
                              onChange={(e) => setEditingBqtData({ ...editingBqtData, duty: e.target.value })}
                              className="w-full px-2.5 py-1.5 rounded-lg border border-purple-300 text-xs font-medium bg-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                            />
                          </div>
                          <div className="flex gap-2 pt-1">
                            <button
                              onClick={() => handleSaveEditedBqt(m.id)}
                              className="flex-1 py-1.5 rounded-lg bg-purple-700 hover:bg-purple-800 text-white font-black text-xs flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                            >
                              <Save className="w-3.5 h-3.5" />
                              <span>Lưu</span>
                            </button>
                            <button
                              onClick={() => setEditingBqtId(null)}
                              className="px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs cursor-pointer"
                            >
                              Hủy
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* CHẾ ĐỘ XEM BÌNH THƯỜNG */
                        <>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-black uppercase bg-purple-100 text-purple-800 px-2 py-0.5 rounded-md">
                                {m.role_title}
                              </span>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => {
                                    setEditingBqtId(m.id);
                                    setEditingBqtData({
                                      name: m.name,
                                      role_title: m.role_title,
                                      phone: m.phone,
                                      zalo: m.zalo || '',
                                      duty: m.duty || ''
                                    });
                                  }}
                                  className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                                  title="Chỉnh sửa thông tin cán bộ này"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteBqt(m.id)}
                                  className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                                  title="Xóa cán bộ này"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                            <h4 className="font-bold text-xs text-slate-900">{m.name}</h4>
                            <div className="flex items-center gap-2 text-xs font-mono text-slate-700 font-bold pt-1">
                              <Phone className="w-3.5 h-3.5 text-purple-700" />
                              <span>{m.phone}</span>
                            </div>
                            {m.duty && (
                              <p className="text-[11px] text-slate-500 line-clamp-2 pt-0.5">
                                {m.duty}
                              </p>
                            )}
                          </div>

                          <div className="flex gap-2 pt-2 border-t border-slate-200/60">
                            <a
                              href={`tel:${m.phone.replace(/[^0-9]/g, '')}`}
                              className="flex-1 py-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold text-[11px] text-center transition flex items-center justify-center gap-1"
                            >
                              <PhoneCall className="w-3 h-3 text-emerald-700" />
                              <span>Gọi Điện</span>
                            </a>
                            <a
                              href={`https://zalo.me/${m.zalo || m.phone.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 py-1.5 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-900 font-bold text-[11px] text-center transition flex items-center justify-center gap-1"
                            >
                              <MessageSquare className="w-3 h-3 text-blue-700" />
                              <span>Chat Zalo</span>
                            </a>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* KHỐI 5: DANH BẠ TỔ CÔNG NGHỆ SỐ CỘNG ĐỒNG (CNS) */}
              <div className="bg-white p-5 rounded-2xl border-2 border-amber-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-amber-700" />
                    <h3 className="font-black text-sm text-slate-900 uppercase">
                      5. Danh Bạ Nhóm Tổ Công Nghệ Số Cộng Đồng ({(contactsConfig.cns_team || []).length} Thành Viên)
                    </h3>
                  </div>
                  <button
                    onClick={() => setIsAddingCns(!isAddingCns)}
                    className="px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>{isAddingCns ? 'Đóng form thêm' : '+ Thêm Cán Bộ Tổ CNS'}</span>
                  </button>
                </div>

                {/* FORM THÊM CÁN BỘ CNS */}
                {isAddingCns && (
                  <form onSubmit={handleAddCns} className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-3">
                    <h4 className="font-black text-xs text-amber-950 uppercase">Thêm Thành Viên Vào Tổ Công Nghệ Số:</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Họ và tên thành viên *</label>
                        <input
                          type="text"
                          required
                          placeholder="Ví dụ: Nguyễn Tấn Tùng"
                          value={newCnsMember.name}
                          onChange={(e) => setNewCnsMember({ ...newCnsMember, name: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Vị trí / Phụ trách xóm *</label>
                        <input
                          type="text"
                          required
                          placeholder="Tổ trưởng / Phụ trách Xóm 1..."
                          value={newCnsMember.role_title}
                          onChange={(e) => setNewCnsMember({ ...newCnsMember, role_title: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Số điện thoại liên hệ *</label>
                        <input
                          type="text"
                          required
                          placeholder="0903.382.277"
                          value={newCnsMember.phone}
                          onChange={(e) => setNewCnsMember({ ...newCnsMember, phone: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Số Zalo hỗ trợ</label>
                        <input
                          type="text"
                          placeholder="0903382277"
                          value={newCnsMember.zalo}
                          onChange={(e) => setNewCnsMember({ ...newCnsMember, zalo: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium bg-white"
                        />
                      </div>
                      <div className="sm:col-span-2 lg:col-span-4">
                        <label className="block text-xs font-bold text-slate-700 mb-1">Nhiệm vụ hỗ trợ trực tiếp</label>
                        <input
                          type="text"
                          placeholder="Cầm tay chỉ việc VNeID, BHYT, nộp hồ sơ dịch vụ công..."
                          value={newCnsMember.duty}
                          onChange={(e) => setNewCnsMember({ ...newCnsMember, duty: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium bg-white"
                        />
                      </div>
                      <div className="sm:col-span-2 lg:col-span-4">
                        <button
                          type="submit"
                          className="w-full py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Thêm Vào Tổ Công Nghệ Số</span>
                        </button>
                      </div>
                    </div>
                  </form>
                )}

                {/* DANH SÁCH THÀNH VIÊN CNS */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  {(contactsConfig.cns_team || []).map((m) => (
                    <div key={m.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-amber-300 transition space-y-2 flex flex-col justify-between">
                      {editingCnsId === m.id ? (
                        /* CHẾ ĐỘ CHỈNH SỬA TRỰC TIẾP TỔ CNS */
                        <div className="space-y-2">
                          <div className="flex items-center justify-between pb-1 border-b border-amber-200">
                            <span className="text-[11px] font-black uppercase text-amber-900">✏️ Chỉnh Sửa Tổ CNS</span>
                            <button
                              onClick={() => setEditingCnsId(null)}
                              className="text-slate-400 hover:text-slate-700 text-xs font-bold"
                            >
                              ✕
                            </button>
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Vị trí / Phụ trách</label>
                            <input
                              type="text"
                              value={editingCnsData.role_title}
                              onChange={(e) => setEditingCnsData({ ...editingCnsData, role_title: e.target.value })}
                              className="w-full px-2.5 py-1.5 rounded-lg border border-amber-300 text-xs font-bold bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Họ và tên</label>
                            <input
                              type="text"
                              value={editingCnsData.name}
                              onChange={(e) => setEditingCnsData({ ...editingCnsData, name: e.target.value })}
                              className="w-full px-2.5 py-1.5 rounded-lg border border-amber-300 text-xs font-bold bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Số điện thoại</label>
                              <input
                                type="text"
                                value={editingCnsData.phone}
                                onChange={(e) => setEditingCnsData({ ...editingCnsData, phone: e.target.value })}
                                className="w-full px-2.5 py-1.5 rounded-lg border border-amber-300 text-xs font-medium bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Số Zalo</label>
                              <input
                                type="text"
                                value={editingCnsData.zalo}
                                onChange={(e) => setEditingCnsData({ ...editingCnsData, zalo: e.target.value })}
                                className="w-full px-2.5 py-1.5 rounded-lg border border-amber-300 text-xs font-medium bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Nhiệm vụ hỗ trợ</label>
                            <input
                              type="text"
                              value={editingCnsData.duty}
                              onChange={(e) => setEditingCnsData({ ...editingCnsData, duty: e.target.value })}
                              className="w-full px-2.5 py-1.5 rounded-lg border border-amber-300 text-xs font-medium bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                            />
                          </div>
                          <div className="flex gap-2 pt-1">
                            <button
                              onClick={() => handleSaveEditedCns(m.id)}
                              className="flex-1 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-black text-xs flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                            >
                              <Save className="w-3.5 h-3.5" />
                              <span>Lưu</span>
                            </button>
                            <button
                              onClick={() => setEditingCnsId(null)}
                              className="px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs cursor-pointer"
                            >
                              Hủy
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* CHẾ ĐỘ XEM BÌNH THƯỜNG */
                        <>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-black uppercase bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md">
                                {m.role_title}
                              </span>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => {
                                    setEditingCnsId(m.id);
                                    setEditingCnsData({
                                      name: m.name,
                                      role_title: m.role_title,
                                      phone: m.phone,
                                      zalo: m.zalo || '',
                                      duty: m.duty || ''
                                    });
                                  }}
                                  className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                                  title="Chỉnh sửa thông tin thành viên này"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteCns(m.id)}
                                  className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                                  title="Xóa thành viên này"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                            <h4 className="font-bold text-xs text-slate-900">{m.name}</h4>
                            <div className="flex items-center gap-2 text-xs font-mono text-slate-700 font-bold pt-1">
                              <Phone className="w-3.5 h-3.5 text-amber-700" />
                              <span>{m.phone}</span>
                            </div>
                            {m.duty && (
                              <p className="text-[11px] text-slate-500 line-clamp-2 pt-0.5">
                                {m.duty}
                              </p>
                            )}
                          </div>

                          <div className="flex gap-2 pt-2 border-t border-slate-200/60">
                            <a
                              href={`tel:${m.phone.replace(/[^0-9]/g, '')}`}
                              className="flex-1 py-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold text-[11px] text-center transition flex items-center justify-center gap-1"
                            >
                              <PhoneCall className="w-3 h-3 text-emerald-700" />
                              <span>Gọi</span>
                            </a>
                            <a
                              href={`https://zalo.me/${m.zalo || m.phone.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 py-1.5 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-900 font-bold text-[11px] text-center transition flex items-center justify-center gap-1"
                            >
                              <MessageSquare className="w-3 h-3 text-blue-700" />
                              <span>Zalo</span>
                            </a>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* NÚT LƯU CẤU HÌNH DƯỚI CÙNG */}
              <div className="flex justify-end pt-2">
                <button
                  onClick={handleSaveContacts}
                  className="px-8 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm shadow-xl hover:shadow-2xl transition flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-5 h-5" />
                  <span>Lưu Thay Đổi & Áp Dụng Toàn Hệ Thống</span>
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
              {/* THANH ĐỒNG BỘ TIN TỨC TRỰC TUYẾN TỰ ĐỘNG */}
              <div className="bg-gradient-to-r from-red-600 via-amber-600 to-orange-600 text-white p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <h4 className="font-black text-xs sm:text-sm uppercase flex items-center gap-1.5">
                    <span>⚡ Thu Thập Tin Tức Trực Tuyến 24h Tự Động</span>
                  </h4>
                  <p className="text-[11px] text-amber-100">
                    Tự động lấy tin thời sự 24h mới nhất từ <strong>VietNamNet (vietnamnet.vn/thoi-su)</strong>, <strong>Báo Lâm Đồng</strong> và <strong>Cổng TTĐT Xã Di Linh</strong> nạp vào Database.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    setLoading(true);
                    const { syncLiveNewsToDatabase } = await import('../../services/newsService');
                    const res = await syncLiveNewsToDatabase();
                    setLoading(false);
                    if (res.success) {
                      showMsg('success', `Đã đồng bộ thành công các bản tin thời sự mới nhất vào CSDL Supabase!`);
                      loadAllAdminData();
                      if (onRefreshAllData) onRefreshAllData();
                    } else {
                      showMsg('error', res.error || 'Lỗi đồng bộ tin tức');
                    }
                  }}
                  className="px-4 py-2 bg-white text-slate-900 font-black text-xs rounded-xl shadow hover:bg-amber-100 transition flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  <span>Quét & Nạp Tin Mới Ngay</span>
                </button>
              </div>

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

          {/* TAB 7: VĂN BẢN & TRI THỨC AI 20 MỤC (BỘ NÃO TRỢ LÝ SỐ THÔN 6) */}
          {activeTab === 'docs' && (
            <div className="space-y-6">
              {/* BANNER 20 MỤC TRI THỨC */}
              <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 text-white p-5 rounded-3xl shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-indigo-500/30">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase">
                    🧠 BỘ NÃO TRỢ LÝ SỐ THÔN 6 XÃ DI LINH (KB-T6-01 ĐẾN KB-T6-20)
                  </div>
                  <h3 className="text-base sm:text-lg font-black">Kho Tri Thức Chuẩn Hóa 20 Mục Huấn Luyện AI (RAG Grounding)</h3>
                  <p className="text-xs text-indigo-200 max-w-2xl leading-relaxed">
                    Bao gồm 20 chủ đề thiết yếu: VNeID • Phòng chống lừa đảo • Hỗ trợ người cao tuổi • Dịch vụ công • Quét mã QR • Thanh toán điện tử • Bảo vệ dữ liệu • Nhận biết tin giả • Phản ánh kiến nghị • Môi trường • An toàn giao thông • PCCC gia đình • Phòng chống thiên tai • Giá nông sản • Nông nghiệp số • Hoạt động cộng đồng • Bản tin thông báo • Y tế sức khỏe • Học tập số • Quy tắc hoạt động AI.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    setLoading(true);
                    const { seed20PillarsKnowledgeToDatabase } = await import('../../services/officialDocService');
                    const res = await seed20PillarsKnowledgeToDatabase();
                    setLoading(false);
                    if (res.success) {
                      showMsg('success', 'Đã nạp và đồng bộ đủ 20 Mục Tri thức chuẩn (KB-T6-01 -> KB-T6-20) vào CSDL Supabase!');
                      loadAllAdminData();
                      if (onRefreshAllData) onRefreshAllData();
                    } else {
                      showMsg('error', res.error || 'Lỗi nạp tri thức');
                    }
                  }}
                  className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-2xl shadow-md transition flex items-center gap-2 cursor-pointer shrink-0"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  <span>⚡ Nạp Đủ 20 Mục Tri Thức Chuẩn</span>
                </button>
              </div>

              {/* BỘ LỌC 20 CHỦ ĐỀ TRI THỨC */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2.5">
                <div className="text-xs font-bold text-slate-700">Lọc theo chủ đề tri thức ({docsList.length} văn bản):</div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[
                    { id: 'all', label: '🌟 Tất Cả (20)' },
                    { id: 'VNeID & Định danh điện tử', label: '🪪 01. VNeID' },
                    { id: 'Phòng chống lừa đảo trực tuyến', label: '🚨 02. Chống Lừa Đảo' },
                    { id: 'Hỗ trợ người cao tuổi', label: '👵 03. Người Cao Tuổi' },
                    { id: 'Dịch vụ công trực tuyến', label: '🏛️ 04. Dịch Vụ Công' },
                    { id: 'Quét mã QR an toàn', label: '📱 05. Mã QR' },
                    { id: 'Thanh toán không dùng tiền mặt', label: '💳 06. Thanh Toán Số' },
                    { id: 'Bảo vệ thông tin cá nhân', label: '🔒 07. Bảo Vệ Dữ Liệu' },
                    { id: 'Nhận biết tin giả & Tin xấu độc', label: '📰 08. Nhận Biết Tin Giả' },
                    { id: 'Phản ánh kiến nghị của người dân', label: '📝 09. Phản Ánh Kiến Nghị' },
                    { id: 'Vệ sinh môi trường', label: '🌳 10. Môi Trường' },
                    { id: 'An toàn giao thông', label: '🚦 11. An Toàn Giao Thông' },
                    { id: 'Phòng cháy chữa cháy gia đình', label: '🚒 12. PCCC Gia Đình' },
                    { id: 'Phòng chống thiên tai & Thời tiết nguy hiểm', label: '⛈️ 13. Phòng Chống Thiên Tai' },
                    { id: 'Thông tin giá nông sản', label: '☕ 14. Giá Nông Sản' },
                    { id: 'Kiến thức nông nghiệp số', label: '🌱 15. Nông Nghiệp Số' },
                    { id: 'Hoạt động cộng đồng Thôn 6', label: '🤝 16. Hoạt Động Thôn 6' },
                    { id: 'Thông báo & Bản tin Thôn 6', label: '📢 17. Thông Báo & Bản Tin' },
                    { id: 'Chăm sóc sức khỏe & Y tế', label: '🏥 18. Y Tế & Sức Khỏe' },
                    { id: 'Hỗ trợ học tập & Kỹ năng số', label: '🎓 19. Kỹ Năng Số' },
                    { id: 'Quy tắc hoạt động của Trợ lý AI Thôn 6', label: '⚖️ 20. Quy Tắc AI' }
                  ].map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setDocCategoryFilter(cat.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                        docCategoryFilter === cat.id
                          ? 'bg-indigo-700 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* FORM THÊM / SỬA VĂN BẢN VÀO BỘ NÃO AI */}
              <div className="bg-white p-5 rounded-2xl border-2 border-indigo-200 shadow-xs space-y-4">
                <h3 className="font-black text-sm text-slate-900 uppercase flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-700" />
                  <span>{isEditingDoc ? 'Sửa Văn Bản Tri Thức' : 'Thêm Văn Bản Nạp Vào Bộ Não Trợ Lý AI'}</span>
                </h3>
                <form onSubmit={handleSaveDoc} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Số hiệu văn bản *</label>
                    <input
                      type="text"
                      required
                      placeholder="KB-T6-01/2026 hoặc 24/KH-UBND"
                      value={docForm.doc_number}
                      onChange={e => setDocForm({ ...docForm, doc_number: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Cơ quan ban hành *</label>
                    <input
                      type="text"
                      required
                      placeholder="Tổ Công nghệ số cộng đồng Thôn 6 – Xã Di Linh"
                      value={docForm.issuing_body}
                      onChange={e => setDocForm({ ...docForm, issuing_body: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Chủ đề tri thức (1 trong 20 Mục) *</label>
                    <select
                      value={docForm.category || 'VNeID & Định danh điện tử'}
                      onChange={e => setDocForm({ ...docForm, category: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-slate-50"
                    >
                      <option value="VNeID & Định danh điện tử">🪪 01. VNeID & Định danh điện tử</option>
                      <option value="Phòng chống lừa đảo trực tuyến">🚨 02. Phòng chống lừa đảo trực tuyến</option>
                      <option value="Hỗ trợ người cao tuổi">👵 03. Hỗ trợ người cao tuổi</option>
                      <option value="Dịch vụ công trực tuyến">🏛️ 04. Dịch vụ công trực tuyến</option>
                      <option value="Quét mã QR an toàn">📱 05. Quét mã QR an toàn</option>
                      <option value="Thanh toán không dùng tiền mặt">💳 06. Thanh toán không dùng tiền mặt</option>
                      <option value="Bảo vệ thông tin cá nhân">🔒 07. Bảo vệ thông tin cá nhân</option>
                      <option value="Nhận biết tin giả & Tin xấu độc">📰 08. Nhận biết tin giả & Tin xấu độc</option>
                      <option value="Phản ánh kiến nghị của người dân">📝 09. Phản ánh kiến nghị của người dân</option>
                      <option value="Vệ sinh môi trường">🌳 10. Vệ sinh môi trường</option>
                      <option value="An toàn giao thông">🚦 11. An toàn giao thông</option>
                      <option value="Phòng cháy chữa cháy gia đình">🚒 12. Phòng cháy chữa cháy gia đình</option>
                      <option value="Phòng chống thiên tai & Thời tiết nguy hiểm">⛈️ 13. Phòng chống thiên tai & Thời tiết</option>
                      <option value="Thông tin giá nông sản">☕ 14. Thông tin giá nông sản</option>
                      <option value="Kiến thức nông nghiệp số">🌱 15. Kiến thức nông nghiệp số</option>
                      <option value="Hoạt động cộng đồng Thôn 6">🤝 16. Hoạt động cộng đồng Thôn 6</option>
                      <option value="Thông báo & Bản tin Thôn 6">📢 17. Thông báo & Bản tin Thôn 6</option>
                      <option value="Chăm sóc sức khỏe & Y tế">🏥 18. Chăm sóc sức khỏe & Y tế</option>
                      <option value="Hỗ trợ học tập & Kỹ năng số">🎓 19. Hỗ trợ học tập & Kỹ năng số</option>
                      <option value="Quy tắc hoạt động của Trợ lý AI Thôn 6">⚖️ 20. Quy tắc hoạt động của Trợ lý AI</option>
                    </select>
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
                    <label className="block text-xs font-bold text-slate-700 mb-1">Nội dung chi tiết huấn luyện AI RAG (Nguyên văn & Hướng dẫn cụ thể) *</label>
                    <textarea
                      rows={5}
                      required
                      placeholder="Ghi rõ quy định, các bước thực hiện, địa điểm, hồ sơ cần mang theo để AI trả lời chính xác và không bịa chính sách..."
                      value={docForm.content_summary}
                      onChange={e => setDocForm({ ...docForm, content_summary: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium leading-relaxed"
                    />
                  </div>
                  <div className="sm:col-span-3 flex items-center gap-2">
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>{isEditingDoc ? 'Cập Nhật Văn Bản Tri Thức' : 'Lưu & Nạp Vào Bộ Não AI'}</span>
                    </button>
                    {isEditingDoc && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditingDoc(false);
                          setDocForm({
                            id: null,
                            doc_number: '',
                            title: '',
                            issuing_body: 'UBND Xã Di Linh',
                            issued_date: new Date().toISOString().split('T')[0],
                            category: 'VNeID & Định danh điện tử',
                            effect_status: 'Còn hiệu lực',
                            source_url: 'https://dilinh.lamdong.gov.vn',
                            content_summary: ''
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

              {/* DANH SÁCH VĂN BẢN TRONG CSDL */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="font-black text-sm text-slate-900">
                    Danh Sách Tri Thức Trong CSDL RAG ({docsList.filter(d => docCategoryFilter === 'all' || d.category === docCategoryFilter).length})
                  </h3>
                  <span className="text-xs text-slate-500 font-bold">
                    Phục vụ đối chiếu trực tiếp cho Trợ lý AI
                  </span>
                </div>

                <div className="divide-y divide-slate-100">
                  {docsList
                    .filter(doc => docCategoryFilter === 'all' || doc.category === docCategoryFilter)
                    .map(doc => (
                      <div key={doc.id || doc.doc_number} className="py-3 flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-black uppercase bg-indigo-100 text-indigo-900 px-2 py-0.5 rounded">
                              {doc.doc_number}
                            </span>
                            {doc.category && (
                              <span className="text-[10px] font-black bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                                {doc.category}
                              </span>
                            )}
                            <span className="text-[11px] text-slate-500 font-bold">{doc.issuing_body}</span>
                          </div>
                          <h4 className="font-bold text-xs text-slate-900">{doc.title}</h4>
                          <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed whitespace-pre-line font-medium">
                            {doc.content_summary}
                          </p>
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
