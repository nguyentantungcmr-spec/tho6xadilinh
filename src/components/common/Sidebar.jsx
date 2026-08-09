import React from 'react';
import { 
  BookOpen, Video, Sparkles, Image as ImageIcon, FileText, Volume2, 
  Users, Lightbulb, ShieldCheck, Plus, Bot, User, CheckCircle2, X, PhoneCall 
} from 'lucide-react';
import RoleBadge from './RoleBadge';

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  role, 
  onRoleChange,
  onOpenUploadResource,
  onOpenUploadActivity,
  onOpenUploadModel,
  onOpenUploadOfficial,
  onOpenAiAssistant,
  isOpenMobile,
  onCloseMobile
}) {
  const menuItems = [
    { id: 'all', label: 'Tất cả bài viết', icon: BookOpen, count: null, color: 'text-blue-600' },
    { id: 'video', label: 'Video Cầm tay chỉ việc', icon: Video, count: null, color: 'text-red-500' },
    { id: 'infographic', label: 'Infographic Trực quan', icon: Sparkles, count: null, color: 'text-amber-500' },
    { id: 'image', label: 'Ảnh minh họa từng bước', icon: ImageIcon, count: null, color: 'text-emerald-500' },
    { id: 'document', label: 'Tài liệu & Cẩm nang', icon: FileText, count: null, color: 'text-indigo-500' },
    { id: 'audio', label: 'Podcast 2 phút đọc chữ', icon: Volume2, count: null, color: 'text-purple-500' },
    { id: 'activities', label: 'Hoạt động cộng đồng', icon: Users, count: null, color: 'text-emerald-600' },
    { id: 'models', label: 'Mô hình học tập hay (AI)', icon: Lightbulb, count: null, color: 'text-amber-600' },
    { id: 'official', label: 'Nguồn AI Reference chính thống', icon: ShieldCheck, count: null, color: 'text-purple-700' }
  ];

  return (
    <>
      {/* MOBILE BACKDROP OVERLAY */}
      {isOpenMobile && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
        ></div>
      )}

      {/* SIDEBAR PANEL DỌC BÊN TRÁI */}
      <aside className={`
        fixed lg:sticky top-0 lg:top-[65px] left-0 z-50 lg:z-30 
        w-72 sm:w-80 h-full lg:h-[calc(100vh-65px)] 
        bg-white border-r border-slate-200 
        flex flex-col justify-between 
        p-4 sm:p-5 transition-transform duration-300 shadow-xl lg:shadow-none
        ${isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        
        <div className="space-y-5 overflow-y-auto pr-1">
          
          {/* HEADER ON MOBILE SIDEBAR */}
          <div className="flex items-center justify-between lg:hidden border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-extrabold flex items-center justify-center text-sm">
                T6
              </div>
              <span className="font-extrabold text-slate-900 text-sm">Danh Mục Chuyển Đổi Số</span>
            </div>
            <button
              onClick={onCloseMobile}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* SỐ DI LỆNH BANNER BOX */}
          <div className="bg-gradient-to-br from-blue-900 to-indigo-950 text-white p-4 rounded-2xl shadow-sm relative overflow-hidden">
            <div className="relative z-10">
              <span className="bg-emerald-500 text-slate-950 font-black text-[10px] uppercase px-2 py-0.5 rounded-md inline-block mb-1">
                Thôn 6 Xã Di Linh
              </span>
              <h3 className="font-extrabold text-sm leading-snug text-white">
                Học số – Giúp nhau – Lan tỏa
              </h3>
              <p className="text-[11px] text-slate-300 mt-1 font-medium">
                Tổ CNS hỗ trợ cầm tay chỉ việc người dân 24/7.
              </p>
            </div>
          </div>

          {/* DANH MỤC MENU DỌC (VERTICAL NAVIGATION MENU) */}
          <div>
            <div className="text-[11px] font-black uppercase text-slate-400 tracking-wider mb-2.5 px-2">
              Danh Mục Nội Dung
            </div>
            <nav className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      if (onCloseMobile) onCloseMobile();
                    }}
                    className={`
                      w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl 
                      text-xs sm:text-sm font-extrabold transition-all duration-200
                      ${isActive 
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 translate-x-1' 
                        : 'text-slate-700 hover:bg-slate-100 hover:text-blue-600'}
                    `}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : item.color}`} />
                      <span className="truncate">{item.label}</span>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* QUẢN LÝ VAI TRÒ DỌC (RBAC SELECTION) */}
          <div className="pt-3 border-t border-slate-100">
            <div className="text-[11px] font-black uppercase text-slate-400 tracking-wider mb-2 px-2">
              Phân Quyền Vai Trò
            </div>
            <select
              value={role}
              onChange={(e) => onRoleChange(e.target.value)}
              className="w-full py-2.5 px-3 rounded-xl border border-slate-300 text-xs font-bold bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="citizen">👤 1. Người dân Thôn 6</option>
              <option value="supporter">🤝 2. Người hỗ trợ số</option>
              <option value="tech_team">👥 3. Tổ công nghệ số</option>
              <option value="admin">⚙️ 4. Quản trị viên Xã</option>
            </select>
            <div className="mt-2 px-1">
              <RoleBadge role={role} showDesc={true} />
            </div>
          </div>

          {/* NÚT THAO TÁC NHANH VÀO CSDL */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <div className="text-[11px] font-black uppercase text-slate-400 tracking-wider mb-2 px-2">
              Thao Tác Nhanh
            </div>

            <button
              onClick={onOpenAiAssistant}
              className="w-full py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:opacity-95 transition"
            >
              <Bot className="w-4 h-4 text-emerald-300 animate-bounce" />
              <span>Hỏi Trợ Lý AI Cộng Đồng</span>
            </button>

            {(role === 'tech_team' || role === 'admin' || role === 'supporter') && (
              <button
                onClick={onOpenUploadResource}
                className="w-full py-2.5 px-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-sm"
              >
                <Plus className="w-4 h-4 text-blue-400" />
                <span>Đăng Tài Nguyên Mới</span>
              </button>
            )}

            <button
              onClick={onOpenUploadActivity}
              className="w-full py-2.5 px-3.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs flex items-center justify-center gap-2 transition"
            >
              <Plus className="w-4 h-4 text-emerald-600" />
              <span>Đăng Báo Cáo Hoạt Động</span>
            </button>

            <button
              onClick={onOpenUploadModel}
              className="w-full py-2.5 px-3.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold text-xs flex items-center justify-center gap-2 transition"
            >
              <Lightbulb className="w-4 h-4 text-amber-600" />
              <span>Gửi Cách Làm Hay (AI 4 Bước)</span>
            </button>

            {(role === 'admin' || role === 'tech_team') && (
              <button
                onClick={onOpenUploadOfficial}
                className="w-full py-2.5 px-3.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 font-bold text-xs flex items-center justify-center gap-2 transition"
              >
                <ShieldCheck className="w-4 h-4 text-purple-600" />
                <span>Tải Nguồn Chính Thống Cho AI</span>
              </button>
            )}
          </div>

        </div>

        {/* FOOTER HELPLINE IN SIDEBAR */}
        <div className="pt-3 border-t border-slate-100 text-center">
          <a 
            href="tel:0912345678"
            className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 hover:underline bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 w-full justify-center"
          >
            <PhoneCall className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            <span>Hotline Hỗ Trợ: 0912.345.678</span>
          </a>
        </div>

      </aside>
    </>
  );
}
