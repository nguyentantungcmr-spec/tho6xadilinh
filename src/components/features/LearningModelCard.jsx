import React, { useState } from 'react';
import { Lightbulb, Sparkles, User, ThumbsUp, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';

export default function LearningModelCard({ model }) {
  const [showAiDetail, setShowAiDetail] = useState(false);
  const aiFormatted = model.ai_formatted_content;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-lg transition duration-300 p-5 flex flex-col justify-between">
      <div>
        {/* HEADER BADGE */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-extrabold border border-amber-300">
            <Lightbulb className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
            Mô Hình Sáng Tạo Từ Người Dân
          </span>
          <span className="bg-indigo-100 text-indigo-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-indigo-600" />
            AI Biên Tập
          </span>
        </div>

        <h3 className="font-extrabold text-slate-900 text-base sm:text-lg mb-2 leading-snug">
          {model.title}
        </h3>

        {/* NỘI DUNG GÓC NGƯỜI DÂN */}
        <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl mb-3 text-xs sm:text-sm text-slate-700 leading-relaxed italic">
          "{model.raw_content}"
        </div>

        {/* NÚT XEM BẢN AI BIÊN TẬP 4 BƯỚC */}
        <button
          onClick={() => setShowAiDetail(!showAiDetail)}
          className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 text-blue-800 text-xs font-bold flex items-center justify-between transition hover:bg-blue-100 mb-3"
        >
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" />
            <span>Xem Mô Hình Chuẩn 4 Bước (AI Biên Tập)</span>
          </span>
          {showAiDetail ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {/* CHI TIẾT AI BIÊN TẬP (MỤC TIÊU - CHUẨN BỊ - CÁC BƯỚC - KẾT QUẢ) */}
        {showAiDetail && aiFormatted && (
          <div className="bg-gradient-to-br from-blue-950 to-slate-900 text-white p-4 rounded-xl text-xs space-y-3 shadow-inner mb-4 animate-fade-in">
            <div>
              <span className="font-extrabold text-blue-400 block uppercase mb-0.5">🎯 1. Mục tiêu mô hình:</span>
              <p className="text-slate-200 leading-relaxed">{aiFormatted.target || 'Tự chủ kỹ năng số đơn giản tại nhà.'}</p>
            </div>

            <div>
              <span className="font-extrabold text-amber-400 block uppercase mb-0.5">🛠️ 2. Chuẩn bị:</span>
              <p className="text-slate-200 leading-relaxed">{aiFormatted.preparation || '1 điện thoại thông minh + 15 phút rảnh rỗi.'}</p>
            </div>

            {aiFormatted.steps && (
              <div>
                <span className="font-extrabold text-emerald-400 block uppercase mb-1">📋 3. Thao tác thực hiện:</span>
                <ul className="space-y-1.5 text-slate-300">
                  {aiFormatted.steps.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-1.5 bg-white/10 p-2 rounded-lg">
                      <span className="font-black text-emerald-400 shrink-0">•</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <span className="font-extrabold text-purple-400 block uppercase mb-0.5">🏆 4. Kết quả mong đợi:</span>
              <p className="text-slate-200 leading-relaxed">{aiFormatted.result || 'Thực hành thành thạo không bị áp lực.'}</p>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER AUTHOR */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1.5 font-bold text-slate-700">
          <User className="w-3.5 h-3.5 text-slate-400" />
          <span>Tác giả: {model.author_name}</span>
        </div>
        <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
          Có thể áp dụng ngay
        </span>
      </div>
    </div>
  );
}
