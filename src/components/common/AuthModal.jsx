import React, { useState } from 'react';
import { X, Mail, Lock, User, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';
import { ROLE_DETAILS } from './RoleBadge';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedRole, setSelectedRole] = useState('citizen');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (isSignUp) {
        // Đăng ký Supabase Auth với metadata role
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName || email.split('@')[0],
              role: selectedRole
            }
          }
        });

        if (error) throw error;
        setSuccessMsg('Đăng ký thành công! Đã kết nối cơ sở dữ liệu Supabase.');
        setTimeout(() => {
          onAuthSuccess(data.user, selectedRole);
          onClose();
        }, 1200);

      } else {
        // Đăng nhập Supabase Auth
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) throw error;

        // Lấy profile thực tế từ CSDL Supabase
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();

        const userRole = profile ? profile.role : selectedRole;
        setSuccessMsg('Đăng nhập thành công!');
        setTimeout(() => {
          onAuthSuccess(data.user, userRole);
          onClose();
        }, 1000);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Có lỗi xảy ra khi xác thực với Supabase');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative">
        
        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mx-auto mb-3">
            <User className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">
            {isSignUp ? 'Đăng Ký Tài Khoản' : 'Đăng Nhập Hệ Thống'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Nền tảng Chuyển đổi số & Học tập Cộng đồng Thôn 6 Xã Di Linh
          </p>
        </div>

        {/* NOTIFICATION MESSAGES */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Họ và tên</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  required={isSignUp}
                  placeholder="Ví dụ: Nguyen Van A"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email liên hệ</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="email"
                required
                placeholder="nguoidan@thon6.vn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Mật khẩu</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* CHỌN VAI TRÒ */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Chọn Vai trò trong Hệ thống:
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full py-2.5 px-3 rounded-xl border border-slate-300 text-sm font-semibold bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="citizen">👤 1. Người dân Thôn 6</option>
              <option value="supporter">🤝 2. Người hỗ trợ số (Thanh niên/Tình nguyện viên)</option>
              <option value="tech_team">👥 3. Cán bộ Tổ công nghệ số cộng đồng</option>
              <option value="admin">⚙️ 4. Quản trị viên (Cán bộ Xã Di Linh)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition disabled:opacity-50"
          >
            {loading ? 'Đang xác thực Supabase...' : (isSignUp ? 'Đăng Ký Tài Khoản' : 'Đăng Nhập')}
          </button>
        </form>

        <div className="mt-6 text-center border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className="text-xs font-bold text-blue-600 hover:underline"
          >
            {isSignUp ? 'Đã có tài khoản? Đăng nhập ngay' : 'Chưa có tài khoản? Đăng ký tại đây'}
          </button>
        </div>

      </div>
    </div>
  );
}
