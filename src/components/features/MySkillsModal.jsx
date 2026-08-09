import React, { useState } from 'react';
import { X, Award, CheckCircle2, ShieldCheck, Sparkles, User } from 'lucide-react';

export default function MySkillsModal({ isOpen, onClose, user }) {
  const [completedSkills, setCompletedSkills] = useState({
    qr: true,
    zalo: true,
    vneid: true,
    typing: true,
    safety: true,
    ai: false
  });

  if (!isOpen) return null;

  const toggleSkill = (key) => {
    setCompletedSkills(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const skillsList = [
    { key: 'qr', title: 'Quét mã QR Thanh toán & BHYT', icon: '📱', desc: 'Thành thạo mở camera quét mã QR dịch vụ công' },
    { key: 'zalo', title: 'Gọi video & Tin nhắn Zalo', icon: '💬', desc: 'Biết gọi điện video kết nối con cháu' },
    { key: 'vneid', title: 'Kích hoạt VNeID Mức 2', icon: '🪪', desc: 'Đã định danh điện tử trên điện thoại' },
    { key: 'typing', title: 'Gõ tiếng Việt có dấu', icon: '⌨️', desc: 'Bật bàn phím Telex nhập tiếng Việt có dấu' },
    { key: 'safety', title: 'An toàn số & Phòng lừa đảo', icon: '🛡️', desc: 'Nhận biết 5 chiêu trò lừa đảo cuộc gọi giả danh' },
    { key: 'ai', title: 'Sử dụng Trợ lý AI Cộng đồng', icon: '🤖', desc: 'Hỏi đáp tra cứu thông tin với Trợ lý AI' }
  ];

  const passedCount = Object.values(completedSkills).filter(Boolean).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative">
        
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-5">
          <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center mx-auto mb-2 font-black text-2xl shadow-inner">
            🪪
          </div>
          <h2 className="text-2xl font-black text-slate-900">Hộ Chiếu Kỹ Năng Số</h2>
          <p className="text-xs text-slate-500 mt-1">
            Bảng theo dõi các kỹ năng chuyển đổi số của người dân Thôn 6
          </p>
        </div>

        {/* PROGRESS BAR */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-4 rounded-2xl mb-4 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Tiến Độ Đạt Được</span>
            </span>
            <span className="text-xs font-extrabold text-emerald-400">{passedCount} / {skillsList.length} Kỹ năng</span>
          </div>
          <div className="w-full bg-white/20 h-3 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-emerald-400 to-cyan-400 h-full transition-all duration-500"
              style={{ width: `${(passedCount / skillsList.length) * 100}%` }}
            ></div>
          </div>
          <p className="text-[11px] text-slate-300 mt-2">
            {passedCount >= 5 ? '🌟 Tuyệt vời! Bác là Công dân số tiêu biểu Thôn 6' : '💪 Hãy tiếp tục thực hành để đạt 100% kỹ năng số!'}
          </p>
        </div>

        {/* SKILLS CHECKLIST */}
        <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
          {skillsList.map((skill) => {
            const isPassed = completedSkills[skill.key];
            return (
              <div
                key={skill.key}
                onClick={() => toggleSkill(skill.key)}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                  isPassed 
                    ? 'bg-emerald-50 border-emerald-300 text-slate-900' 
                    : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{skill.icon}</span>
                  <div>
                    <h4 className="font-extrabold text-xs sm:text-sm text-slate-900">{skill.title}</h4>
                    <p className="text-[11px] text-slate-500 font-medium">{skill.desc}</p>
                  </div>
                </div>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                  isPassed ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'
                }`}>
                  {isPassed ? '✓' : ''}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-5 pt-3 border-t border-slate-100 text-center">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition"
          >
            Đóng Bảng Kỹ Năng
          </button>
        </div>

      </div>
    </div>
  );
}
