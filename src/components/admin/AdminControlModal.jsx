import React, { useState, useEffect } from 'react';
import { 
  X, ShieldCheck, UserPlus, Users, Trash2, Key, CheckCircle, 
  AlertCircle, ShieldAlert, Sparkles, RefreshCw, Mail, Lock, User, 
  Search, Eye, Filter
} from 'lucide-react';
import { supabase } from '../../services/supabaseClient';
import RoleBadge, { ROLE_DETAILS } from '../common/RoleBadge';

export default function AdminControlModal({ 
  isOpen, 
  onClose, 
  activities = [], 
  onDeleteActivity,
  onRefreshActivities 
}) {
  const [activeTab, setActiveTab] = useState('members'); // 'members' | 'posts'
  
  // STATE CẤP TÀI KHOẢN MỚI
  const [newFullName, setNewFullName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('Thon6@2026');
  const [newRole, setNewRole] = useState('tech_team');
  const [isCreating, setIsCreating] = useState(false);
  const [createMsg, setCreateMsg] = useState({ type: '', text: '' });

  // STATE DANH SÁCH THÀNH VIÊN
  const [profiles, setProfiles] = useState([]);
  const [loadingProfiles, setLoadingProfiles] = useState(false);
  const [searchMember, setSearchMember] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  // STATE XÓA BÀI ĐĂNG
  const [searchPost, setSearchPost] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadProfiles();
    }
  }, [isOpen]);

  // 1. LẤY DANH SÁCH THÀNH VIÊN ĐÃ ĐƯỢC CẤP TÀI KHOẢN
  const loadProfiles = async () => {
    setLoadingProfiles(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProfiles(data || []);
    } catch (err) {
      console.error('Lỗi tải danh sách profiles:', err);
    } finally {
      setLoadingProfiles(false);
    }
  };

  // 2. QUẢN TRỊ VIÊN CẤP TÀI KHOẢN CHO THÀNH VIÊN MỚI
  const handleGrantAccount = async (e) => {
    e.preventDefault();
    setIsCreating(true);
    setCreateMsg({ type: '', text: '' });

    try {
      if (!newEmail || !newPassword || !newFullName) {
        throw new Error('Vui lòng điền đầy đủ Họ tên, Email và Mật khẩu.');
      }

      // Tạo tài khoản Auth qua Supabase SignUp
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

      // Cập nhật hoặc chèn vào bảng profiles
      if (data?.user) {
        await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            email: newEmail,
            full_name: newFullName,
            role: newRole,
            updated_at: new Date().toISOString()
          });
      }

      setCreateMsg({
        type: 'success',
        text: `Đã cấp thành công tài khoản cho "${newFullName}" (${newEmail}) với vai trò ${ROLE_DETAILS[newRole]?.name || newRole}!`
      });

      // Reset form
      setNewFullName('');
      setNewEmail('');
      setNewPassword('Thon6@2026');
      setNewRole('tech_team');
      loadProfiles();
    } catch (err) {
      setCreateMsg({
        type: 'error',
        text: err.message || 'Không thể tạo tài khoản. Vui lòng kiểm tra lại cấu hình Supabase.'
      });
    } finally {
      setIsCreating(false);
    }
  };

  // 3. ĐỔI VAI TRÒ CỦA THÀNH VIÊN
  const handleChangeMemberRole = async (userId, targetRole) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: targetRole, updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (error) throw error;
      setProfiles(prev => prev.map(p => p.id === userId ? { ...p, role: targetRole } : p));
    } catch (err) {
      alert('Không thể đổi vai trò: ' + err.message);
    }
  };

  // 4. XÓA BÀI ĐĂNG (ĐẶC QUYỀN CỦA ADMIN)
  const handleDeletePost = async (act) => {
    const confirmDelete = window.confirm(`Thầy/Cô có chắc chắn muốn xóa bài đăng: "${act.title}" không? Hành động này không thể hoàn tác!`);
    if (!confirmDelete) return;

    setDeletingId(act.id);
    try {
      if (onDeleteActivity) {
        await onDeleteActivity(act);
      }
      if (onRefreshActivities) {
        await onRefreshActivities();
      }
    } catch (err) {
      alert('Lỗi khi xóa bài đăng: ' + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  if (!isOpen) return null;

  const filteredMembers = profiles.filter(p => {
    const matchName = (p.full_name || '').toLowerCase().includes(searchMember.toLowerCase()) || 
                      (p.email || '').toLowerCase().includes(searchMember.toLowerCase());
    const matchRole = filterRole === 'all' || p.role === filterRole;
    return matchName && matchRole;
  });

  const filteredActivities = activities.filter(a => 
    (a.title || '').toLowerCase().includes(searchPost.toLowerCase()) ||
    (a.description || '').toLowerCase().includes(searchPost.toLowerCase()) ||
    (a.author_name || '').toLowerCase().includes(searchPost.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl max-w-4xl w-full h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden relative">
        
        {/* HEADER QUẢN TRỊ */}
        <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-white backdrop-blur-xs">
              <ShieldCheck className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-black text-base sm:text-lg leading-tight">
                  Trung Tâm Quản Trị Hệ Thống Thôn 6
                </h2>
                <span className="bg-amber-400 text-slate-950 text-[10px] px-2 py-0.5 rounded-md font-black uppercase shadow-xs">
                  Dành Riêng Admin
                </span>
              </div>
              <p className="text-xs text-purple-200 mt-0.5">
                Đặc quyền: Cấp tài khoản cho thành viên & Xóa bài đăng vi phạm
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/20 text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* TAB NAVIGATION */}
        <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 pt-3 pb-2 bg-slate-100 border-b border-slate-200 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('members')}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 sm:gap-2 cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'members'
                ? 'bg-white text-purple-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <UserPlus className="w-4 h-4 text-purple-600 shrink-0" />
            <span>1. Cấp Tài Khoản ({profiles.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('posts')}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 sm:gap-2 cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'posts'
                ? 'bg-white text-red-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Trash2 className="w-4 h-4 text-red-600 shrink-0" />
            <span>2. Xóa Bài Đăng ({activities.length})</span>
          </button>
        </div>

        {/* TAB 1: CẤP & QUẢN LÝ TÀI KHOẢN */}
        {activeTab === 'members' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50">
            
            {/* FORM CẤP TÀI KHOẢN MỚI */}
            <div className="bg-white p-5 rounded-2xl border-2 border-purple-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-purple-700" />
                  <h3 className="font-black text-sm text-slate-900 uppercase tracking-tight">
                    Cấp Tài Khoản Mới Cho Thành Viên
                  </h3>
                </div>
                <span className="text-[11px] text-purple-700 font-bold bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200">
                  Thành viên không thể tự đăng ký
                </span>
              </div>

              {createMsg.text && (
                <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                  createMsg.type === 'success' 
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                  {createMsg.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  <span>{createMsg.text}</span>
                </div>
              )}

              <form onSubmit={handleGrantAccount} className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Họ và tên thành viên *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: Nguyễn Văn Tuấn"
                      value={newFullName}
                      onChange={(e) => setNewFullName(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email đăng nhập *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type="email"
                      required
                      placeholder="tuan.thon6@dilinh.vn"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mật khẩu khởi tạo *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="Thon6@2026"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Vai trò được cấp *
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full py-2 px-3 rounded-xl border border-slate-300 text-xs font-bold bg-slate-50 focus:ring-2 focus:ring-purple-500 focus:outline-none cursor-pointer"
                  >
                    <option value="tech_team">👥 Tổ công nghệ số (Biên tập, duyệt nội dung)</option>
                    <option value="supporter">🤝 Người hỗ trợ số (Cầm tay chỉ việc)</option>
                    <option value="citizen">👤 Người dân Thôn 6 (Chia sẻ mô hình)</option>
                    <option value="admin">⚙️ Quản trị viên (Toàn quyền hệ thống)</option>
                  </select>
                </div>

                <div className="sm:col-span-2 pt-1">
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="w-full py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-black text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>{isCreating ? 'Đang cấp tài khoản trên Supabase...' : '➕ Cấp Tài Khoản & Phân Quyền Ngay'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* DANH SÁCH TÀI KHOẢN ĐÃ CẤP */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-700" />
                    <span>Danh Sách Thành Viên Đã Được Cấp Quyền ({filteredMembers.length})</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Quản trị viên có thể đổi vai trò hoặc thu hồi tài khoản bất kỳ lúc nào
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Tìm tên hoặc email..."
                      value={searchMember}
                      onChange={(e) => setSearchMember(e.target.value)}
                      className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-purple-500 w-40 sm:w-48"
                    />
                  </div>

                  <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="py-1.5 px-2 rounded-lg border border-slate-300 text-xs font-bold bg-slate-50 cursor-pointer"
                  >
                    <option value="all">Tất cả vai trò</option>
                    <option value="admin">Quản trị viên</option>
                    <option value="tech_team">Tổ công nghệ số</option>
                    <option value="supporter">Người hỗ trợ</option>
                    <option value="citizen">Người dân</option>
                  </select>

                  <button
                    type="button"
                    onClick={loadProfiles}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
                    title="Tải lại danh sách"
                  >
                    <RefreshCw className={`w-4 h-4 ${loadingProfiles ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {filteredMembers.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs font-medium">
                  {loadingProfiles ? 'Đang tải danh sách thành viên...' : 'Chưa có thành viên nào khớp với bộ lọc.'}
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {filteredMembers.map((member) => (
                    <div key={member.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 px-2 rounded-xl transition">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-black text-xs shrink-0">
                          {(member.full_name || member.email || 'U')[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-xs text-slate-900 flex items-center gap-2">
                            <span>{member.full_name || 'Chưa đặt tên'}</span>
                            <RoleBadge role={member.role} />
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            {member.email || member.id}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <span className="text-[10px] text-slate-400 font-medium">Đổi vai trò:</span>
                        <select
                          value={member.role || 'citizen'}
                          onChange={(e) => handleChangeMemberRole(member.id, e.target.value)}
                          className="py-1 px-2 rounded-lg border border-slate-200 text-xs font-bold bg-white focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer shadow-xs"
                        >
                          <option value="admin">Quản trị viên</option>
                          <option value="tech_team">Tổ công nghệ số</option>
                          <option value="supporter">Người hỗ trợ số</option>
                          <option value="citizen">Người dân</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 2: QUẢN LÝ & XÓA BÀI ĐĂNG */}
        {activeTab === 'posts' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50">
            
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-xs text-red-900 leading-relaxed flex items-start gap-2.5">
              <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-black block text-red-950">Đặc quyền Xóa bài đăng của Quản trị viên:</span>
                <span>Quản trị viên có toàn quyền xóa các bài đăng sai lệch, nội dung vi phạm hoặc bài kiểm thử để giữ gìn không gian số Thôn 6 luôn văn minh, chuẩn mực.</span>
              </div>
            </div>

            {/* TÌM KIẾM BÀI ĐĂNG */}
            <div className="flex items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm bài đăng theo tiêu đề, nội dung hoặc tác giả..."
                  value={searchPost}
                  onChange={(e) => setSearchPost(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>

              <button
                type="button"
                onClick={onRefreshActivities}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                title="Làm mới danh sách"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {/* DANH SÁCH BÀI ĐĂNG */}
            <div className="space-y-3">
              {filteredActivities.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs font-medium">
                  Không tìm thấy bài đăng nào!
                </div>
              ) : (
                filteredActivities.map((act) => (
                  <div 
                    key={act.id} 
                    className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-red-300 transition"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-black bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md">
                          Tác giả: {act.author_name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold">
                          {new Date(act.created_at || Date.now()).toLocaleDateString('vi-VN')}
                        </span>
                      </div>

                      <h4 className="font-extrabold text-sm text-slate-900 leading-snug">
                        {act.title}
                      </h4>
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {act.description}
                      </p>
                    </div>

                    <div className="shrink-0 flex sm:flex-col items-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleDeletePost(act)}
                        disabled={deletingId === act.id}
                        className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs shadow-md hover:shadow-lg transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{deletingId === act.id ? 'Đang xóa...' : 'Xóa Bài Này'}</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
