import React from 'react';
import { X, Volume2, Download, Eye, Sparkles, User, ExternalLink, FileText, CheckCircle2 } from 'lucide-react';
import { TYPE_CONFIG } from './ResourceCard';
import { incrementViewCount } from '../../services/resourceService';

export default function ResourceDetailModal({ resource, onClose }) {
  if (!resource) return null;
  const config = TYPE_CONFIG[resource.type] || TYPE_CONFIG.document;
  const Icon = config.icon;

  // Tăng lượt xem trong Supabase
  incrementViewCount(resource.id, resource.view_count);

  const handleSpeak = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const textToRead = `${resource.title}. ${resource.description || ''}. Nguồn tài liệu từ ${resource.source_author || 'Tổ Công nghệ số Thôn 6'}`;
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.lang = 'vi-VN';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Hàm chuyển đổi các dạng URL Youtube (youtu.be, watch?v=) sang định dạng embed iframe chuẩn
  const getEmbedUrl = (url) => {
    if (!url) return '';
    if (url.includes('youtube.com/embed/')) return url;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2] && match[2].length === 11)
      ? `https://www.youtube.com/embed/${match[2]}`
      : url;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 relative overflow-hidden">
        
        {/* HEADER */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold ${config.color}`}>
              <Icon className="w-4 h-4" />
              {config.label}
            </span>
            <span className="text-xs font-bold text-slate-500 bg-slate-200 px-2.5 py-1 rounded-full">
              {resource.category}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CONTENT VIEW */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          
          {/* MEDIA PLAYER / DISPLAY BASED ON TYPE */}
          <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center min-h-[260px]">
            {resource.type === 'video' ? (
              resource.media_url.includes('youtube.com') || resource.media_url.includes('youtu.be') ? (
                <iframe
                  src={getEmbedUrl(resource.media_url)}
                  title={resource.title}
                  className="w-full h-80 sm:h-96 rounded-2xl"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : (
                <video
                  controls
                  autoPlay
                  src={resource.media_url}
                  className="w-full max-h-96 rounded-2xl"
                ></video>
              )
            ) : resource.type === 'audio' ? (
              <div className="w-full p-8 text-center bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-900 text-white flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center mb-4 ring-4 ring-purple-500/30">
                  <Volume2 className="w-8 h-8 animate-pulse" />
                </div>
                <h4 className="font-extrabold text-lg mb-2">Bản Phát Thanh / Podcast Ngắn</h4>
                <p className="text-xs text-purple-200 mb-6">Thù hợp cho người cao tuổi & người không tiện đọc chữ</p>
                <audio controls src={resource.media_url} className="w-full max-w-md"></audio>
              </div>
            ) : (
              <img
                src={resource.media_url}
                alt={resource.title}
                className="w-full max-h-[500px] object-contain rounded-2xl"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1595079672139-cee4c06cdc92?auto=format&fit=crop&w=1000&q=80';
                }}
              />
            )}
          </div>

          {/* TITLE & DESCRIPTION */}
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
              {resource.title}
            </h2>
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500 mt-2 pb-4 border-b border-slate-100">
              <span className="flex items-center gap-1">
                <User className="w-4 h-4 text-slate-400" />
                Nguồn: {resource.source_author || 'Tổ CNS cộng đồng Thôn 6'}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4 text-slate-400" />
                {(resource.view_count || 12) + 1} lượt xem
              </span>
              {resource.senior_friendly && (
                <span className="bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full font-extrabold">
                  👵 Dành cho Người cao tuổi
                </span>
              )}
            </div>

            <div className="mt-4">
              <h3 className="font-bold text-slate-800 text-sm mb-2">Mô tả chi tiết & Thao tác thực hiện:</h3>
              <p className="text-sm sm:text-base text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200 font-medium">
                {resource.description}
              </p>
            </div>
          </div>

        </div>

        {/* FOOTER ACTIONS */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            onClick={handleSpeak}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition shadow-md"
          >
            <Volume2 className="w-4 h-4 animate-pulse" />
            <span>Phát Giọng Nói (Đọc cho người già)</span>
          </button>

          <a
            href={resource.media_url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition shadow-sm"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Mở Nguồn / Tải Về</span>
          </a>
        </div>

      </div>
    </div>
  );
}
