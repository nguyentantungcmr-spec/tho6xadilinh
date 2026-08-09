import React from 'react';
import { ShieldCheck, Calendar, Building, FileText, CheckCircle, ExternalLink, Bot } from 'lucide-react';

export default function OfficialDocCard({ doc }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-lg transition duration-300 p-5 flex flex-col justify-between relative overflow-hidden">
      
      {/* RIBBON STAMP */}
      <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-wider flex items-center gap-1 shadow-sm">
        <Bot className="w-3 h-3" />
        Nguồn Chuẩn AI
      </div>

      <div>
        {/* NUMBER & ISSUING BODY */}
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="bg-slate-900 text-white font-extrabold text-xs px-2.5 py-0.5 rounded-md">
            Số: {doc.doc_number}
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
            <Building className="w-3.5 h-3.5" />
            {doc.issuing_body}
          </span>
        </div>

        <h3 className="font-extrabold text-slate-900 text-base sm:text-lg mb-2 leading-snug">
          {doc.title}
        </h3>

        {/* ISSUED DATE & EFFECT STATUS */}
        <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 mb-3">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            Ban hành: {doc.issued_date}
          </span>
          <span className="inline-flex items-center gap-1 text-emerald-700 font-extrabold">
            <CheckCircle className="w-3.5 h-3.5" />
            {doc.effect_status}
          </span>
        </div>

        {/* CONTENT SUMMARY FOR AI */}
        <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
          <span className="font-bold text-slate-900 block mb-1 text-xs uppercase tracking-wide">
            📌 Trích yếu nội dung chính (AI Reference):
          </span>
          {doc.content_summary}
        </div>
      </div>

      {/* FOOTER ACTIONS */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        <span className="text-[11px] text-slate-400 font-semibold">
          Quản trị viên đã kiểm duyệt
        </span>

        {doc.source_url && (
          <a
            href={doc.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline"
          >
            <span>Văn bản gốc</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>

    </div>
  );
}
