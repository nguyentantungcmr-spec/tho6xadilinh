import React from 'react';
import { Calendar, Eye, Volume2, ShieldAlert, ArrowRight, UserCheck } from 'lucide-react';

/**
 * COMPONENT NEWS CARD
 * Hiển thị thẻ tin tức, thông báo chính thức của Thôn 6 Xã Di Linh
 */
export default function NewsCard({ news, onSelect }) {
  const handleSpeak = (e) => {
    e.stopPropagation();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const textToSpeak = `${news.title}. ${news.summary}`;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = 'vi-VN';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <article 
      onClick={() => onSelect && onSelect(news)}
      className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-xl hover:border-blue-400 transition-all duration-300 overflow-hidden flex flex-col justify-between group cursor-pointer"
    >
      {/* ẢNH BÌA TIN TỨC */}
      <div className="relative h-44 sm:h-48 overflow-hidden bg-slate-100">
        <img 
          src={news.image_url} 
          alt={news.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent"></div>

        {/* NHÃN PHẠM VI & DANH MỤC TRẠNG THÁI */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap max-w-[85%]">
          {news.scope_label && (
            <span className="px-2.5 py-1 rounded-full bg-slate-950/85 backdrop-blur-xs text-amber-300 border border-amber-400/40 text-[10px] font-black uppercase shadow-md">
              {news.scope_label}
            </span>
          )}
          <span className={`px-2.5 py-1 rounded-full text-white text-[10px] font-black uppercase shadow-md ${news.category_color || 'bg-blue-600'}`}>
            {news.category}
          </span>
          {news.is_new && (
            <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] font-black uppercase shadow-md animate-bounce flex items-center gap-0.5">
              <span>🔥 MỚI HÔM NAY</span>
            </span>
          )}
          {news.is_urgent && (
            <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[9px] font-black uppercase shadow animate-pulse flex items-center gap-0.5">
              <ShieldAlert className="w-2.5 h-2.5" />
              <span>Quan trọng</span>
            </span>
          )}
        </div>

        {/* NÚT ĐỌC BẰNG GIỌNG NÓI */}
        <button
          type="button"
          onClick={handleSpeak}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-900/70 hover:bg-amber-600 text-white flex items-center justify-center transition shadow-md cursor-pointer border border-white/30"
          title="Bấm để nghe đọc bản tin này"
        >
          <Volume2 className="w-4 h-4" />
        </button>

        {/* NGÀY ĐĂNG */}
        <div className="absolute bottom-2.5 left-3 text-white text-[11px] font-bold flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5 text-amber-300" />
          <span>{news.published_date}</span>
        </div>
      </div>

      {/* NỘI DUNG TÓM TẮT */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-2">
          <h3 className="font-black text-sm sm:text-base text-slate-900 line-clamp-2 leading-snug group-hover:text-blue-600 transition">
            {news.title}
          </h3>
          <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed font-medium">
            {news.summary}
          </p>
        </div>

        {/* CHÂN THẺ */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500">
          <span className="flex items-center gap-1 text-slate-700">
            <UserCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>{news.source}</span>
          </span>
          <span className="flex items-center gap-1 text-blue-600 font-black group-hover:translate-x-1 transition-transform">
            <span>Đọc tiếp</span>
            <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </article>
  );
}
