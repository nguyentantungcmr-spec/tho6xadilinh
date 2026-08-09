import React from 'react';
import { Users, HeartHandshake, Award, Calendar, CheckCircle2, User } from 'lucide-react';

export default function ActivityCard({ activity }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-lg transition duration-300 p-5 flex flex-col justify-between">
      <div>
        {/* HEADER & STATUS */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Đã Thực Hiện
          </span>
          <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(activity.created_at || Date.now()).toLocaleDateString('vi-VN')}
          </span>
        </div>

        <h3 className="font-extrabold text-slate-900 text-base sm:text-lg mb-2 leading-snug">
          {activity.title}
        </h3>

        <p className="text-xs sm:text-sm text-slate-600 mb-4 line-clamp-3 leading-relaxed">
          {activity.description}
        </p>

        {/* MEDIA PREVIEW IF ANY */}
        {activity.media_urls && activity.media_urls.length > 0 && (
          <div className="rounded-xl overflow-hidden mb-4 max-h-48">
            <img
              src={activity.media_urls[0]}
              alt={activity.title}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1000&q=80';
              }}
            />
          </div>
        )}

        {/* NUMBERS METRICS BOX */}
        <div className="grid grid-cols-2 gap-3 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-500 font-bold uppercase">Người tham gia</div>
              <div className="font-black text-slate-900 text-sm">{activity.participants_count || 1} người</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
              <HeartHandshake className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-500 font-bold uppercase">Được hỗ trợ</div>
              <div className="font-black text-slate-900 text-sm">{activity.assisted_count || 0} người</div>
            </div>
          </div>
        </div>

        {/* RESULTS SUMMARY */}
        {activity.results_summary && (
          <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-xs text-amber-900 mb-4">
            <span className="font-extrabold flex items-center gap-1 mb-0.5">
              <Award className="w-3.5 h-3.5 text-amber-600" />
              Kết quả đạt được:
            </span>
            <p className="font-medium">{activity.results_summary}</p>
          </div>
        )}
      </div>

      {/* FOOTER AUTHOR */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
        <div className="flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-slate-400" />
          <span className="truncate max-w-[150px] font-bold text-slate-700">{activity.author_name}</span>
        </div>
        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-semibold">
          Thôn 6 Di Linh
        </span>
      </div>
    </div>
  );
}
