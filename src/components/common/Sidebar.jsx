import React from 'react';
import { 
  Bot, HeartHandshake, Award, Sparkles, PhoneCall, X, Plus, ShieldCheck, User 
} from 'lucide-react';
import RoleBadge from './RoleBadge';

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  role, 
  onRoleChange,
  onOpenAiAssistant,
  onOpenNeedHelp,
  onOpenUploadActivity,
  onOpenMySkills,
  isOpenMobile,
  onCloseMobile
}) {
  // 6 THẺ MENU THEO ĐÚNG YÊU CẦU: TIN TỨC THÔN 6 NẰM TRÊN ĐẦU
  const actionCards = [
    {
      id: 'news',
      title: 'TIN TỨC',
      icon: '📰',
      badge: 'Di Linh • Lâm Đồng • Cả Nước',
      color: 'from-amber-600 to-orange-600 text-white shadow-amber-500/20',
      action: () => {
        setActiveTab('news');
        if (onCloseMobile) onCloseMobile();
      }
    },
    {
      id: 'learn',
      title: 'TÔI MUỐN HỌC',
      icon: '🎬',
      badge: 'Video & Bình Dân Học Vụ Số',
      color: 'from-blue-600 to-indigo-600 text-white shadow-blue-500/20',
      action: () => {
        setActiveTab('all');
        if (onCloseMobile) onCloseMobile();
      }
    },
    {
      id: 'ai',
      title: 'TÔI MUỐN HỎI AI',
      icon: '🤖',
      badge: 'Giải đáp chính thống',
      color: 'from-indigo-600 to-purple-600 text-white shadow-purple-500/20',
      action: () => {
        onOpenAiAssistant();
        if (onCloseMobile) onCloseMobile();
      }
    },
    {
      id: 'help',
      title: 'TÔI CẦN HỖ TRỢ',
      icon: '🆘',
      badge: 'Cầm tay chỉ việc',
      color: 'from-red-600 to-rose-600 text-white shadow-red-500/20',
      action: () => {
        onOpenNeedHelp();
        if (onCloseMobile) onCloseMobile();
      }
    },
    {
      id: 'volunteer',
      title: 'TÔI CÓ THỂ GIÚP',
      icon: '🤝',
      badge: 'Tình nguyện viên',
      color: 'from-emerald-600 to-teal-600 text-white shadow-emerald-500/20',
      action: () => {
        onOpenUploadActivity();
        if (onCloseMobile) onCloseMobile();
      }
    },
    {
      id: 'spread',
      title: 'HOẠT ĐỘNG LAN TỎA',
      icon: '🌱',
      badge: 'Kết quả cộng đồng',
      color: 'from-teal-600 to-cyan-600 text-white shadow-teal-500/20',
      action: () => {
        setActiveTab('activities');
        if (onCloseMobile) onCloseMobile();
      }
    }
  ];

  return (
    <>
      {/* MOBILE OVERLAY */}
      {isOpenMobile && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
        ></div>
      )}

      {/* SIDEBAR DỌC BÊN TRÁI HÌNH THỨC CÁC THẺ CARD NỔI BẬT */}
      <aside className={`
        fixed lg:sticky top-0 lg:top-[65px] left-0 z-50 lg:z-30 
        w-72 sm:w-80 h-full lg:h-[calc(100vh-65px)] 
        bg-white border-r border-slate-200 
        flex flex-col justify-between 
        p-4 sm:p-5 transition-transform duration-300 shadow-xl lg:shadow-none
        ${isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        
        <div className="space-y-4 overflow-y-auto pr-1">
          
          {/* HEADER DI ĐỘNG */}
          <div className="flex items-center justify-between lg:hidden border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-extrabold flex items-center justify-center text-sm">
                T6
              </div>
              <span className="font-extrabold text-slate-900 text-sm">Menu Thao Tác</span>
            </div>
            <button
              onClick={onCloseMobile}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="text-[11px] font-black uppercase text-slate-400 tracking-wider px-1">
            Menu Hành Động Số Thôn 6
          </div>

          {/* DANH SÁCH 6 THẺ MENU NỔI BẬT */}
          <div className="space-y-2.5">
            {actionCards.map((card) => (
              <button
                key={card.id}
                onClick={card.action}
                className={`
                  w-full p-3.5 rounded-2xl bg-gradient-to-r ${card.color} 
                  shadow-md hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 
                  flex items-center justify-between text-left group border border-white/20 cursor-pointer
                `}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl group-hover:scale-110 transition-transform duration-200">
                    {card.icon}
                  </span>
                  <div>
                    <h3 className="font-black text-sm tracking-tight text-white leading-snug">
                      {card.title}
                    </h3>
                    <span className="text-[10px] font-bold text-white/80 uppercase">
                      {card.badge}
                    </span>
                  </div>
                </div>
                <span className="text-white/70 group-hover:text-white group-hover:translate-x-1 transition font-bold text-lg">
                  ›
                </span>
              </button>
            ))}
          </div>

          {/* PHÂN QUYỀN VAI TRÒ */}
          <div className="pt-3 border-t border-slate-100">
            <div className="text-[11px] font-black uppercase text-slate-400 tracking-wider mb-2 px-1">
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

        </div>

        {/* HOTLINE CẦM TAY CHỈ VIỆC */}
        <div className="pt-3 border-t border-slate-100 text-center">
          <a 
            href="tel:0943849295"
            className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-800 bg-emerald-100 hover:bg-emerald-200 px-3 py-2 rounded-xl border border-emerald-300 w-full justify-center shadow-xs transition"
          >
            <PhoneCall className="w-4 h-4 text-emerald-700 animate-pulse" />
            <span>Hotline Cầm Tay Chỉ Việc: 0943.849.295</span>
          </a>
        </div>

      </aside>
    </>
  );
}
