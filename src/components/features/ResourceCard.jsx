import React from 'react';
import { Video, Image as ImageIcon, FileText, Volume2, Eye, Sparkles, User, Play, Download } from 'lucide-react';

export const TYPE_CONFIG = {
  video: { label: 'Video Hướng dẫn', color: 'bg-red-500 text-white', icon: Video },
  image: { label: 'Ảnh minh họa', color: 'bg-emerald-500 text-white', icon: ImageIcon },
  infographic: { label: 'Infographic Trực quan', color: 'bg-blue-600 text-white', icon: Sparkles },
  document: { label: 'Tài liệu học tập', color: 'bg-amber-600 text-white', icon: FileText },
  audio: { label: 'Podcast / Âm thanh', color: 'bg-purple-600 text-white', icon: Volume2 }
};

export default function ResourceCard({ resource, onSelect, onSpeechText }) {
  const config = TYPE_CONFIG[resource.type] || TYPE_CONFIG.document;
  const Icon = config.icon;

  const handleSpeak = (e) => {
    e.stopPropagation();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Dừng câu cũ
      const textToRead = `${resource.title}. ${resource.description || ''}`;
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.lang = 'vi-VN';
      utterance.rate = 0.9; // Đọc chậm rãi cho người lớn tuổi
      window.speechSynthesis.speak(utterance);
      if (onSpeechText) onSpeechText(textToRead);
    } else {
      alert('Trình duyệt của bác không hỗ trợ đọc giọng nói tự động.');
    }
  };

  return (
    <div 
      onClick={() => onSelect(resource)}
      className="group bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col cursor-pointer transform hover:-translate-y-1"
    >
      {/* THUMBNAIL / MEDIA PREVIEW */}
      <div className="relative h-48 sm:h-52 bg-slate-900 overflow-hidden">
        <img
          src={resource.thumbnail_url || resource.media_url}
          alt={resource.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1000&q=80';
          }}
        />

        {/* OVERLAY BADGE TYPE */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold shadow-md ${config.color}`}>
            <Icon className="w-3.5 h-3.5" />
            {config.label}
          </span>
          {resource.senior_friendly && (
            <span className="bg-amber-400 text-slate-900 text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">
              👵 Dễ đọc/Nhìn
            </span>
          )}
        </div>

        {/* PLAY / VIEW OVERLAY ICON */}
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-12 h-12 rounded-full bg-white/90 text-slate-900 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition">
            {resource.type === 'video' || resource.type === 'audio' ? (
              <Play className="w-6 h-6 fill-slate-900 ml-0.5" />
            ) : (
              <Eye className="w-6 h-6" />
            )}
          </div>
        </div>

        {/* BOTTOM METADATA ON IMAGE */}
        <div className="absolute bottom-2 right-2 bg-slate-900/70 backdrop-blur-xs text-white text-[11px] px-2 py-0.5 rounded-md font-semibold flex items-center gap-1">
          <Eye className="w-3 h-3" />
          <span>{resource.view_count || 12} lượt xem</span>
        </div>
      </div>

      {/* CARD CONTENT */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="text-xs font-bold text-blue-600 mb-1 tracking-wide uppercase">
            Chủ đề: {resource.category}
          </div>
          <h3 className="font-extrabold text-slate-900 text-base sm:text-lg line-clamp-2 group-hover:text-blue-600 transition leading-snug">
            {resource.title}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 line-clamp-2 leading-relaxed">
            {resource.description}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span className="truncate max-w-[120px]">{resource.source_author || 'Tổ CNS Thôn 6'}</span>
          </div>

          {/* BUTTON PHÁT GIỌNG NÓI CHO NGƯỜI CAO TUỔI */}
          <button
            onClick={handleSpeak}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition border border-indigo-200"
            title="Đọc nội dung này bằng giọng nói cho cụ bà/cụ ông nghe"
          >
            <Volume2 className="w-3.5 h-3.5 animate-pulse" />
            <span>Đọc Hướng Dẫn</span>
          </button>
        </div>
      </div>
    </div>
  );
}
