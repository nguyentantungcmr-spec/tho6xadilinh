import React from 'react';
import { Heart, MapPin, Phone, ShieldCheck, Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white mt-16 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* CỘT 1: GIỚI THIỆU */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-emerald-500 flex items-center justify-center font-black text-lg">
                T6
              </div>
              <h3 className="font-extrabold text-lg text-white">
                Chuyển Đổi Số Cộng Đồng
              </h3>
            </div>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-4">
              Nền tảng hỗ trợ người dân Thôn 6 Xã Di Linh tiếp cận công nghệ thông tin, cẩm nang dịch vụ công, an toàn số và ứng dụng AI trong đời sống hàng ngày.
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Dữ liệu thực kết nối Supabase Postgres</span>
            </div>
          </div>

          {/* CỘT 2: ĐỊA CHỈ & LIÊN HỆ */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-slate-200 uppercase tracking-wider">
              Tổ Công Nghệ Số Cộng Đồng Thôn 6
            </h4>
            <div className="flex items-start gap-2 text-xs text-slate-300">
              <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <span>Nhà văn hóa Thôn 6, Xã Di Linh, Huyện Di Linh, Tỉnh Lâm Đồng</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Đường dây nóng hỗ trợ số: 0943.849.295 (Tổ trưởng Tổ CNS)</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Hỗ trợ cầm tay chỉ việc sáng Thứ 7 hàng tuần</span>
            </div>
          </div>

          {/* CỘT 3: CAM KẾT VÌ CỘNG ĐỒNG */}
          <div>
            <h4 className="font-bold text-sm text-slate-200 uppercase tracking-wider mb-3">
              Mục Tiêu Chuyển Đổi Số
            </h4>
            <ul className="text-xs text-slate-400 space-y-2">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                <span>100% người dân biết sử dụng Zalo & quét mã QR</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Tất cả người cao tuổi có tài khoản VNeID Mức 2</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                <span>Không có người dân bị lừa đảo qua mạng</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                <span>Mỗi gia đình có ít nhất 1 người hỗ trợ số</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="border-t border-slate-800 mt-10 pt-6 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Phong trào Chuyển đổi số Thôn 6 Xã Di Linh.</p>
          <div className="flex items-center gap-1">
            <span>Xây dựng vì cộng đồng với</span>
            <Heart className="w-4 h-4 text-red-500 fill-red-500" />
            <span>và Trí Tuệ Nhân Tạo</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
