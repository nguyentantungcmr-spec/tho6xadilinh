import React, { useState, useEffect } from 'react';
import { Sparkles, BellRing, Clock } from 'lucide-react';
import { getDynamicLedMessages } from '../../services/ledTickerService';

/**
 * COMPONENT LED TICKER BAR
 * Bảng chữ LED điện tử chạy chữ tự động ở mép dưới Banner.
 * Nội dung tự động thay đổi theo giờ, buổi, ngày trong tuần và ngày lễ lớn của Việt Nam.
 */
export default function LedTickerBar() {
  const [messages, setMessages] = useState([]);
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    // Cập nhật thông điệp theo thời gian
    const updateContent = () => {
      const now = new Date();
      setMessages(getDynamicLedMessages(now));

      const timeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const dateStr = now.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
      setCurrentTime(`${timeStr} - ${dateStr}`);
    };

    updateContent();
    const timer = setInterval(updateContent, 1000);
    return () => clearInterval(timer);
  }, []);

  const [isPaused, setIsPaused] = useState(false);

  const fullLedText = messages.join('   ✦✦✦   ');

  return (
    <div 
      className="bg-slate-950 border-t-2 border-amber-400/60 text-amber-300 overflow-hidden shadow-2xl relative select-none cursor-pointer"
      onClick={() => setIsPaused(!isPaused)}
      title="Bấm để tạm dừng hoặc tiếp tục chạy chữ LED"
    >
      
      {/* HIỆU ỨNG ÁNH SÁNG LED NỀN */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:8px_8px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto flex items-center h-9 sm:h-10 px-2 sm:px-4 relative z-10">
        
        {/* BADGE TIÊU ĐỀ BẢNG TIN LED (CỐ ĐỊNH BÊN TRÁI) */}
        <div className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gradient-to-r from-red-600 via-red-700 to-rose-700 text-white font-black text-[10px] sm:text-xs shadow-md uppercase tracking-wider border border-red-400/50 mr-2 sm:mr-3 z-20">
          <span className="relative flex h-2 w-2">
            <span className={`absolute inline-flex h-full w-full rounded-full bg-yellow-300 ${isPaused ? '' : 'animate-ping opacity-80'}`}></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-400"></span>
          </span>
          <span className="hidden xs:inline">BẢNG TIN SỐ</span>
          <span className="xs:hidden">TIN SỐ</span>
          {isPaused && (
            <span className="text-[9px] bg-black/40 px-1 rounded text-yellow-300 font-bold ml-0.5">
              ĐANG DỪNG
            </span>
          )}
        </div>

        {/* DÒNG CHỮ LED CHẠY TỰ ĐỘNG LIỀN MẠCH KHÔNG KHOẢNG TRỐNG */}
        <div className="flex-1 overflow-hidden relative flex items-center">
          <div 
            className={`animate-led-marquee font-extrabold text-xs sm:text-sm text-yellow-300 tracking-wide [text-shadow:_0_0_8px_rgba(251,191,36,0.6)] py-0.5 ${
              isPaused ? 'led-paused' : ''
            }`}
          >
            <span className="pr-16 shrink-0">{fullLedText}   ✦✦✦   </span>
            <span className="pr-16 shrink-0">{fullLedText}   ✦✦✦   </span>
          </div>
        </div>

        {/* HƯỚNG DẪN NHỎ & ĐỒNG HỒ THỜI GIAN THỰC */}
        <div className="shrink-0 hidden md:flex items-center gap-2 pl-3 border-l border-slate-800 text-[11px] font-bold text-slate-300 z-20">
          <span className="text-[10px] text-slate-400 italic">
            ({isPaused ? 'Đã dừng - Bấm để tiếp tục' : 'Bấm để dừng đọc'})
          </span>
          <Clock className="w-3.5 h-3.5 text-amber-400 ml-1" />
          <span className="font-mono text-amber-200">{currentTime}</span>
        </div>

      </div>

    </div>
  );
}
