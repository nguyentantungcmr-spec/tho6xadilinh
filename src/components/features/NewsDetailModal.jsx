import React, { useState } from 'react';
import { X, Calendar, UserCheck, Volume2, VolumeX, Share2, ShieldAlert, Check } from 'lucide-react';

/**
 * COMPONENT NEWS DETAIL MODAL
 * Hộp thoại xem chi tiết bản tin, có giọng đọc tự động và nút chia sẻ
 */
export default function NewsDetailModal({ news, onClose }) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!news) return null;

  const handleToggleSpeech = () => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      window.speechSynthesis.cancel();
      const textToSpeak = `${news.title}. Tóm tắt: ${news.summary}. Nội dung chi tiết: ${news.content}`;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = 'vi-VN';
      utterance.rate = 0.9;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={() => {
        if ('speechSynthesis' in window) window.speechSynthesis.cancel();
        onClose();
      }}
    >
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER MODAL CÓ ẢNH BÌA */}
        <div className="relative h-48 sm:h-60 bg-slate-900 shrink-0">
          <img 
            src={news.image_url} 
            alt={news.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/40 to-transparent"></div>

          {/* NÚT ĐÓNG */}
          <button
            onClick={() => {
              if ('speechSynthesis' in window) window.speechSynthesis.cancel();
              onClose();
            }}
            className="absolute right-3 top-3 w-8 h-8 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-md transition cursor-pointer border border-white/20"
          >
            <X className="w-4 h-4" />
          </button>

          {/* NHÃN VÀ TIÊU ĐỀ TRÊN ẢNH */}
          <div className="absolute bottom-3 left-4 right-4 space-y-1.5 text-white">
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase text-white shadow ${news.category_color || 'bg-blue-600'}`}>
                {news.category}
              </span>
              {news.is_urgent && (
                <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[9px] font-black uppercase flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3" />
                  <span>Tin Khẩn Cấp</span>
                </span>
              )}
            </div>
            <h2 className="text-base sm:text-xl font-black leading-snug drop-shadow-md">
              {news.title}
            </h2>
          </div>
        </div>

        {/* THANH CÔNG CỤ NHANH: NGÀY THÁNG, NGUỒN VÀ NÚT NGHE ĐỌC */}
        <div className="px-4 sm:px-6 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-3 text-xs font-bold text-slate-600">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-amber-600" />
              <span>{news.published_date}</span>
            </span>
            <span className="flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>{news.source}</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleSpeech}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black transition cursor-pointer shadow-xs ${
                isSpeaking 
                  ? 'bg-amber-500 text-white animate-pulse' 
                  : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
              title="Đọc toàn bộ nội dung bản tin này"
            >
              {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-amber-600" />}
              <span>{isSpeaking ? 'Dừng Đọc' : 'Nghe Đọc'}</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="p-1.5 rounded-xl bg-white hover:bg-slate-200 text-slate-600 border border-slate-200 text-xs font-bold flex items-center gap-1 transition cursor-pointer"
              title="Sao chép liên kết"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* NỘI DUNG BÀI VIẾT */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-slate-800 text-sm leading-relaxed font-medium">
          <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200/70 font-semibold text-amber-900 text-xs sm:text-sm">
            💡 <strong>Tóm tắt:</strong> {news.summary}
          </div>

          <div className="whitespace-pre-line text-slate-700 text-xs sm:text-sm leading-loose">
            {news.content}
          </div>
        </div>

        {/* CHÂN MODAL */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2 shrink-0">
          <span className="text-xs text-slate-500 font-bold">
            Tác giả / Nguồn: <strong className="text-slate-800">{news.source || news.author}</strong>
          </span>
          <div className="flex items-center gap-2">
            {news.article_url && (
              <a
                href={news.article_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs transition flex items-center gap-1.5 shadow-sm"
              >
                <span>Xem tin gốc</span>
                <span className="text-xs">↗</span>
              </a>
            )}
            <button
              onClick={() => {
                if ('speechSynthesis' in window) window.speechSynthesis.cancel();
                onClose();
              }}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs transition cursor-pointer"
            >
              Đóng Lại
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
