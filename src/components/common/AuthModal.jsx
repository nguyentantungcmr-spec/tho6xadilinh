import React, { useState } from 'react';
import { X, Mail, Lock, User, CheckCircle, AlertCircle, ShieldAlert, KeyRound } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      // Đăng nhập Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại hoặc liên hệ Quản trị viên Thôn 6 để được cấp lại tài khoản.');
        }
        if (error.message.includes('Email not confirmed')) {
          throw new Error('Email chưa được kích hoạt trên hệ thống Supabase. Vui lòng liên hệ Quản trị viên Thôn 6 để được hỗ trợ.');
        }
        throw error;
      }

      // Lấy profile và vai trò thực tế từ CSDL Supabase
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, full_name')
        .eq('id', data.user.id)
        .single();

      const userRole = profile?.role || 'citizen';
      const roleDisplayName = 
        userRole === 'admin' ? 'Quản trị viên' :
        userRole === 'tech_team' ? 'Tổ công nghệ số' :
        userRole === 'supporter' ? 'Người hỗ trợ số' : 'Người dân Thôn 6';

      setSuccessMsg(`Đăng nhập thành công! Chào mừng ${profile?.full_name || email} (${roleDisplayName}).`);
      setTimeout(() => {
        onAuthSuccess(data.user, userRole);
        onClose();
      }, 1000);
    } catch (err) {
      setErrorMsg(err.message || 'Có lỗi xảy ra khi đăng nhập vào hệ thống');
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
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-5">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mx-auto mb-3">
            <KeyRound className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">
            Đăng Nhập Thành Viên
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Cổng Thông Tin Chuyển Đổi Số Thôn 6 Xã Di Linh
          </p>
        </div>

        {/* THÔNG BÁO BẢO MẬT: CHỈ QUẢN TRỊ VIÊN MỚI CÓ QUYỀN CẤP TÀI KHOẢN */}
        <div className="mb-4 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-black block text-amber-950">Quy định bảo mật hệ thống:</span>
            <span>Các thành viên và người dân không có chức năng tự đăng ký. Tài khoản thành viên do <strong>Quản trị viên</strong> trực tiếp tạo và cấp quyền trong hệ thống.</span>
          </div>
        </div>

        {/* NOTIFICATION MESSAGES */}
        {errorMsg && (
          <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold space-y-1">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email được cấp</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="email"
                required
                placeholder="Ví dụ: tantung08@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
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
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Đang xác thực hệ thống...' : 'Đăng Nhập'}
          </button>
        </form>

        <div className="mt-5 text-center border-t border-slate-100 pt-3 text-xs text-slate-500 font-medium">
          Chưa được cấp tài khoản? Liên hệ Quản trị viên qua Hotline: <strong className="text-emerald-700 font-black">0903.382.277</strong>
        </div>

      </div>
    </div>
  );
}
