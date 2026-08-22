import React from 'react';
import { Home, Newspaper, BookOpen, Sparkles, Menu, ShieldCheck } from 'lucide-react';

export default function MobileBottomNav({
  activeTab,
  setActiveTab,
  role = 'citizen',
  onOpenAiAssistant,
  onToggleSidebar
}) {
  return (
    <nav 
      aria-label="Thanh điều hướng dưới cùng cho điện thoại"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] lg:hidden px-2 py-1.5 flex items-center justify-around select-none safe-area-inset-bottom"
    >
      {/* 1. TRANG CHỦ */}
      <button
        type="button"
        onClick={() => {
          setActiveTab('all');
          const el = document.getElementById('main-content-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-200 cursor-pointer min-w-[58px] ${
          activeTab === 'all'
            ? 'text-blue-600 font-black scale-105'
            : 'text-slate-500 hover:text-slate-800 font-medium'
        }`}
      >
        <div className={`p-1 rounded-xl transition ${activeTab === 'all' ? 'bg-blue-100 text-blue-700' : ''}`}>
          <Home className="w-5 h-5" />
        </div>
        <span className="text-[10px] mt-0.5 tracking-tight">Trang Chủ</span>
      </button>

      {/* 2. TIN TỨC THÔN 6 */}
      <button
        type="button"
        onClick={() => {
          setActiveTab('news');
          const el = document.getElementById('main-content-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-200 cursor-pointer min-w-[58px] ${
          activeTab === 'news'
            ? 'text-amber-600 font-black scale-105'
            : 'text-slate-500 hover:text-slate-800 font-medium'
        }`}
      >
        <div className={`p-1 rounded-xl transition ${activeTab === 'news' ? 'bg-amber-100 text-amber-700' : ''}`}>
          <Newspaper className="w-5 h-5" />
        </div>
        <span className="text-[10px] mt-0.5 tracking-tight">Tin Tức</span>
      </button>

      {/* 3. NÚT TRUNG TÂM NỔI BẬT: HỎI TRỢ LÝ AI */}
      <button
        type="button"
        onClick={onOpenAiAssistant}
        className="flex flex-col items-center justify-center py-0.5 px-2 -mt-5 transition transform active:scale-95 cursor-pointer"
        title="Hỏi Trợ Lý AI Chuyển Đổi Số"
      >
        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 border-2 border-white ring-2 ring-blue-400/40 animate-pulse">
          <Sparkles className="w-6 h-6 text-amber-300" />
        </div>
        <span className="text-[10px] font-black text-indigo-900 mt-1 tracking-tight">
          Hỏi AI
        </span>
      </button>

      {/* 4. HỌC TẬP SỐ */}
      <button
        type="button"
        onClick={() => {
          setActiveTab('video');
          const el = document.getElementById('main-content-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-200 cursor-pointer min-w-[58px] ${
          activeTab === 'video' || activeTab === 'resources'
            ? 'text-red-600 font-black scale-105'
            : 'text-slate-500 hover:text-slate-800 font-medium'
        }`}
      >
        <div className={`p-1 rounded-xl transition ${activeTab === 'video' || activeTab === 'resources' ? 'bg-red-100 text-red-700' : ''}`}>
          <BookOpen className="w-5 h-5" />
        </div>
        <span className="text-[10px] mt-0.5 tracking-tight">Học Tập</span>
      </button>

      {/* 5. MENU THAO TÁC / QUẢN TRỊ */}
      <button
        type="button"
        onClick={onToggleSidebar}
        className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-200 text-slate-500 hover:text-slate-800 font-medium cursor-pointer min-w-[58px]"
      >
        <div className="p-1 rounded-xl text-slate-700 bg-slate-100">
          {role === 'admin' ? (
            <ShieldCheck className="w-5 h-5 text-purple-700" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </div>
        <span className="text-[10px] mt-0.5 tracking-tight">
          {role === 'admin' ? 'Quản Trị' : 'Menu'}
        </span>
      </button>
    </nav>
  );
}
