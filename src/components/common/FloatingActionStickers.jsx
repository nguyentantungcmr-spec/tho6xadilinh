import React from 'react';
import { Sparkles, MessageCircle, Phone } from 'lucide-react';

/**
 * COMPONENT FLOATING ACTION STICKERS
 * Cụm 2 sticker nổi cố định ở góc dưới màn hình:
 * 1. Sticker Chat Zalo (0943.849.295)
 * 2. Sticker Trợ Lý AI Cộng Đồng Thôn 6
 */
export default function FloatingActionStickers({ onOpenAiAssistant }) {
  return (
    <aside 
      aria-label="Cụm nút hỗ trợ nhanh"
      className="fixed bottom-5 right-4 sm:right-6 z-40 flex flex-col items-end gap-2.5 pointer-events-none select-none animate-fade-in"
    >
      {/* 1. STICKER CHAT ZALO (0943.849.295) */}
      <a
        href="https://zalo.me/0943849295"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Liên hệ Zalo Tổ CNS Thôn 6: 0943.849.295"
        title="Bấm để mở Zalo chat trực tiếp với Tổ CNS: 0943.849.295"
        className="pointer-events-auto group flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-gradient-to-r from-[#0068FF] to-[#0089e8] text-white shadow-xl hover:shadow-2xl hover:shadow-blue-500/40 transform hover:-translate-y-1 hover:scale-105 active:scale-95 transition-all duration-200 border-2 border-white/90 cursor-pointer backdrop-blur-xs"
      >
        <span className="relative flex h-3 w-3 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-200 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
        </span>

        {/* LOGO ZALO */}
        <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-[#0068FF] font-black text-[11px] shadow-xs tracking-tighter shrink-0">
          Zalo
        </div>

        <div className="text-left pr-1">
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-sky-100 leading-none">
            Chat Zalo Hỗ Trợ
          </div>
          <div className="text-xs font-black text-white mt-0.5 leading-none tracking-tight">
            0943.849.295
          </div>
        </div>
      </a>

      {/* 2. STICKER TRỢ LÝ AI CỘNG ĐỒNG */}
      <button
        type="button"
        onClick={onOpenAiAssistant}
        aria-label="Mở Trợ lý AI Cộng đồng Thôn 6"
        title="Hỏi Trợ lý AI Cộng đồng Thôn 6"
        className="pointer-events-auto group flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-gradient-to-r from-emerald-500 via-teal-600 to-blue-600 text-white shadow-2xl hover:shadow-emerald-500/40 transform hover:-translate-y-1 hover:scale-105 active:scale-95 transition-all duration-200 border-2 border-white/90 cursor-pointer"
      >
        <div className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shrink-0 shadow-inner">
          <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
        </div>

        <div className="text-left pr-1">
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-200 leading-none flex items-center gap-1">
            <span>Trợ Lý AI Thôn 6</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-ping"></span>
          </div>
          <div className="text-xs font-black text-white mt-0.5 leading-none tracking-tight">
            Hỏi Đáp Số 24/7
          </div>
        </div>
      </button>
    </aside>
  );
}
