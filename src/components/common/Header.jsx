import React, { useState } from 'react';
import { Type, Bot, LogIn, LogOut, UserCheck, ShieldAlert, Sparkles, PhoneCall } from 'lucide-react';
import RoleBadge from './RoleBadge';

export default function Header({ 
  user, 
  role, 
  onRoleChange, 
  seniorMode, 
  setSeniorMode, 
  onOpenAuth, 
  onLogout,
  onOpenAiAssistant 
}) {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex items-center justify-between gap-4">
          
          {/* LOGO THÔN 6 XÃ DI LINH */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-700 to-emerald-600 flex items-center justify-center text-white font-extrabold text-xl shadow-md transform hover:scale-105 transition">
              T6
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-black text-slate-900 text-lg sm:text-xl tracking-tight leading-none">
                  CHUYỂN ĐỔI SỐ CỘNG ĐỒNG
                </h1>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase">
                  Thôn 6 - Xã Di Linh
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Cầm tay chỉ việc • An toàn số • Học tập suốt đời
              </p>
            </div>
          </div>

          {/* ACTIONS & TOOLS */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* SENIOR MODE TOGGLE (CHẾ ĐỘ CHỮ LỚN CHO NGƯỜI CAO TUỔI) */}
            <button
              onClick={() => setSeniorMode(!seniorMode)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold border transition ${
                seniorMode 
                  ? 'bg-amber-500 text-white border-amber-600 shadow-md ring-2 ring-amber-300' 
                  : 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100'
              }`}
              title="Bật/Tắt chữ to dễ đọc cho Người cao tuổi"
            >
              <Type className="w-4 h-4" />
              <span>{seniorMode ? 'Chữ To (Đang bật)' : 'Bật Chữ To'}</span>
            </button>

            {/* AI ASSISTANT BUTTON */}
            <button
              onClick={onOpenAiAssistant}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs sm:text-sm font-bold shadow-md hover:opacity-95 transition"
            >
              <Sparkles className="w-4 h-4 animate-pulse" />
              <span>Hỏi Trợ Lý AI</span>
            </button>

            {/* ROLE SELECTOR (CHUYỂN ĐỔI VAI TRÒ THỬ NGHIỆM) */}
            <div className="hidden md:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <span className="text-[11px] font-bold text-slate-600 px-2">Vai trò:</span>
              <select
                value={role}
                onChange={(e) => onRoleChange(e.target.value)}
                className="bg-white text-xs font-semibold text-slate-800 py-1.5 px-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="citizen">👤 1. Người dân</option>
                <option value="supporter">🤝 2. Người hỗ trợ số</option>
                <option value="tech_team">👥 3. Tổ công nghệ số</option>
                <option value="admin">⚙️ 4. Quản trị viên</option>
              </select>
            </div>

            {/* AUTH BUTTONS */}
            {user ? (
              <div className="flex items-center gap-2">
                <div className="hidden lg:flex flex-col items-end">
                  <span className="text-xs font-bold text-slate-800">{user.email?.split('@')[0]}</span>
                  <RoleBadge role={role} />
                </div>
                <button
                  onClick={onLogout}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-600 transition border border-slate-200"
                  title="Đăng xuất"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold transition shadow-sm"
              >
                <LogIn className="w-4 h-4" />
                <span>Đăng ký / Đăng nhập</span>
              </button>
            )}

          </div>

        </div>
      </div>
    </header>
  );
}
