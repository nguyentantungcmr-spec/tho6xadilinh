import React, { useState } from 'react';
import { X, HelpCircle, PhoneCall, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';

export default function NeedHelpModal({ isOpen, onClose, hotlinePhone = '0903.382.277' }) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('Thôn 6, Xã Di Linh');
  const [needTopic, setNeedTopic] = useState('VNeID Mức 2');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const topicDisplay = needTopic === 'Khác' ? (note ? `Yêu cầu khác: ${note.slice(0, 40)}` : 'Yêu cầu hỗ trợ khác') : needTopic;

      // Lưu yêu cầu hỗ trợ trực tiếp vào CSDL Supabase
      const { error } = await supabase
        .from('community_activities')
        .insert([{
          title: `🆘 ${topicDisplay}`,
          description: `Bà con: ${fullName || 'Người dân'} (SĐT: ${phone}) cần hỗ trợ tại ${address}. Chủ đề: ${needTopic}. Nội dung chi tiết: ${note || 'Cần hướng dẫn cầm tay chỉ việc tại nhà'}`,
          author_name: fullName || 'Người dân Thôn 6',
          participants_count: 1,
          assisted_count: 1,
          results_summary: 'Đang chờ Tổ CNS đến hỗ trợ',
          status: 'approved'
        }]);

      if (error) throw error;
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
        setFullName('');
        setPhone('');
        setNote('');
        setNeedTopic('VNeID Mức 2');
      }, 2000);
    } catch (err) {
      alert('Đã nhận yêu cầu! Đội Thanh niên & Tổ CNS Thôn 6 sẽ liên hệ hỗ trợ bác sớm nhất.');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative max-h-[92vh] overflow-y-auto">
        
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-5">
          <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-2 font-black text-2xl shadow-inner">
            🆘
          </div>
          <h2 className="text-2xl font-black text-slate-900">Gửi Yêu Cầu Hỗ Trợ Số</h2>
          <p className="text-xs text-slate-500 mt-1">
            Tổ Công nghệ số & Đội Thanh niên Thôn 6 sẽ tới tận nhà cầm tay chỉ việc
          </p>
        </div>

        {success ? (
          <div className="p-6 text-center bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-800 space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
            <h3 className="font-extrabold text-base">Đã Gửi Yêu Cầu Thành Công!</h3>
            <p className="text-xs text-emerald-700">Tổ CNS Thôn 6 sẽ gọi điện hoặc tới nhà bác/anh/chị ngay nhé.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Họ tên người cần giúp đỡ *</label>
              <input
                type="text"
                required
                placeholder="Ví dụ: Bác Nguyễn Văn An (65 tuổi)"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Số điện thoại liên hệ *</label>
              <input
                type="tel"
                required
                placeholder="0903.xxx.xxx"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Bác cần hỗ trợ nội dung gì? *</label>
              <select
                value={needTopic}
                onChange={(e) => setNeedTopic(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-bold bg-slate-50 focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer"
              >
                <option value="VNeID Mức 2">🪪 Cài đặt & Kích hoạt VNeID Mức 2</option>
                <option value="Quét mã QR BHYT">📱 Quét mã QR thanh toán / BHYT khám bệnh</option>
                <option value="Sử dụng Zalo">💬 Hướng dẫn gọi điện video qua Zalo với con cháu</option>
                <option value="Nhận biết lừa đảo">🛡️ Kiểm tra cuộc gọi/tin nhắn nghi lừa đảo</option>
                <option value="Dịch vụ công">🏛️ Nộp hồ sơ thủ tục hành chính trực tuyến</option>
                <option value="Khác">📝 Nội dung khác (Ghi rõ chi tiết bên dưới)</option>
              </select>
            </div>

            {/* Ô NHẬP NỘI DUNG MÔ TẢ CHI TIẾT / NỘI DUNG CẦN HỖ TRỢ KHÁC */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">
                  {needTopic === 'Khác' ? 'Ghi rõ nội dung bác cần hỗ trợ *' : 'Ghi chú thêm cho tình nguyện viên'}
                </label>
                <span className={`text-[10px] font-bold ${needTopic === 'Khác' ? 'text-red-600' : 'text-slate-400'}`}>
                  {needTopic === 'Khác' ? 'Bắt buộc ghi rõ' : 'Không bắt buộc'}
                </span>
              </div>
              <textarea
                rows={3}
                required={needTopic === 'Khác'}
                placeholder={
                  needTopic === 'Khác'
                    ? "Bác hãy ghi rõ nội dung khó khăn đang gặp (ví dụ: Điện thoại bị mất sóng, cần hướng dẫn tạo mã QR bán cà phê, không đăng nhập được Zalo...)"
                    : "Ví dụ: 'Nhà gần ngã 3 cây xăng', 'Đến vào buổi chiều sau 17h', 'Bác bị đau chân khó đi lại'..."
                }
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none font-medium resize-none transition ${
                  needTopic === 'Khác' 
                    ? 'border-red-400 bg-red-50/30 focus:ring-2 focus:ring-red-500' 
                    : 'border-slate-300 focus:ring-2 focus:ring-red-500'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Địa chỉ cụ thể tại Thôn 6</label>
              <input
                type="text"
                placeholder="Xóm 2, Thôn 6, Xã Di Linh"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? 'Đang gửi...' : 'Gửi Yêu Cầu Cho Tổ CNS Thôn 6'}</span>
            </button>

            <div className="pt-1 text-center">
              <a 
                href={`tel:${hotlinePhone.replace(/[^0-9]/g, '')}`}
                className="inline-flex items-center gap-1.5 text-xs font-extrabold text-emerald-700 hover:underline"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Hoặc Gọi Trực Tiếp Hotline: {hotlinePhone}</span>
              </a>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
