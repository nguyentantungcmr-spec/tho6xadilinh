import React from 'react';
import { User, HeartHandshake, Users, ShieldCheck } from 'lucide-react';

export const ROLE_DETAILS = {
  citizen: {
    label: '👤 Người dân',
    name: 'Người dân',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    icon: User,
    desc: 'Học tập kỹ năng, gửi báo cáo & mô hình hay'
  },
  supporter: {
    label: '🤝 Người hỗ trợ số',
    name: 'Người hỗ trợ số',
    color: 'bg-blue-100 text-blue-800 border-blue-300',
    icon: HeartHandshake,
    desc: 'Trực tiếp hướng dẫn bà con cầm tay chỉ việc'
  },
  tech_team: {
    label: '👥 Tổ công nghệ số',
    name: 'Tổ công nghệ số',
    color: 'bg-amber-100 text-amber-800 border-amber-300',
    icon: Users,
    desc: 'Duyệt bài đăng, biên tập tài liệu địa phương'
  },
  admin: {
    label: '⚙️ Quản trị viên',
    name: 'Quản trị viên',
    color: 'bg-purple-100 text-purple-800 border-purple-300',
    icon: ShieldCheck,
    desc: 'Đăng tải văn bản chính thống, quản trị hệ thống'
  }
};

export default function RoleBadge({ role = 'citizen', showDesc = false }) {
  const info = ROLE_DETAILS[role] || ROLE_DETAILS.citizen;
  const Icon = info.icon;

  return (
    <div className="inline-flex flex-col">
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold shadow-xs ${info.color}`}>
        <Icon className="w-4 h-4" />
        {info.name}
      </span>
      {showDesc && (
        <span className="text-[11px] text-slate-500 mt-0.5">{info.desc}</span>
      )}
    </div>
  );
}
