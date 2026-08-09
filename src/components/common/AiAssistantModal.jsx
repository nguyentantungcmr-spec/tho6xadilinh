import React, { useState } from 'react';
import { X, Bot, Sparkles, Send, BookOpen, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { askOfficialDocAI } from '../../services/officialDocService';

export default function AiAssistantModal({ isOpen, onClose, officialDocs = [] }) {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: '🤖 Chào bác/anh/chị! Em là Trợ lý AI Chuyển đổi số Thôn 6 Xã Di Linh.\nEm được huấn luyện từ các văn bản chính thống của UBND Xã & Đề án 06 Chính phủ.\n\nBác/anh/chị muốn hỏi điều gì về VNeID, quét mã QR, hay phòng tránh lừa đảo ạ?'
    }
  ]);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (e) => {
    e.preventDefault();
    if (!question.trim() || loading) return;

    const userText = question;
    setQuestion('');
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setLoading(true);

    try {
      const aiReply = await askOfficialDocAI(userText, officialDocs);
      setMessages(prev => [...prev, { sender: 'ai', text: aiReply }]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'ai', text: 'Có lỗi kết nối AI. Bà con thử hỏi lại sau nhé!' }]);
    } finally {
      setLoading(false);
    }
  };

  const sampleQuestions = [
    'Tôi muốn hỏi cách cài VNeID Mức 2?',
    'Làm sao biết cuộc gọi là lừa đảo?',
    'Số hiệu Đề án 06 quy định gì về định danh?',
    'Quét mã QR thanh toán có an toàn không?'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full h-[85vh] flex flex-col shadow-2xl border border-slate-100 relative overflow-hidden">
        
        {/* HEADER */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-5 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-white backdrop-blur-xs">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="font-bold text-lg leading-tight flex items-center gap-2">
                Trợ Lý AI Cộng Đồng Thôn 6
                <span className="bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded-md uppercase font-extrabold">
                  Nguồn Chính Thống
                </span>
              </h2>
              <p className="text-xs text-blue-100">
                Giải đáp Dịch vụ công • VNeID • An toàn số • Cầm tay chỉ việc
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/20 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CHAT MESSAGES BODY */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed shadow-xs whitespace-pre-line ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white font-medium rounded-tr-none'
                    : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-200 text-xs font-semibold text-slate-500 flex items-center gap-2">
                <Bot className="w-4 h-4 animate-spin text-blue-600" />
                <span>AI đang đối chiếu văn bản chính thống...</span>
              </div>
            </div>
          )}
        </div>

        {/* SAMPLE QUESTIONS */}
        <div className="p-3 bg-white border-t border-slate-200 overflow-x-auto">
          <div className="text-[11px] font-bold text-slate-500 mb-1.5 flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Gợi ý câu hỏi bà con hay thắc mắc:</span>
          </div>
          <div className="flex items-center gap-2">
            {sampleQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => setQuestion(q)}
                className="whitespace-nowrap text-xs bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 font-medium transition"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* INPUT FORM */}
        <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-200 flex items-center gap-2">
          <input
            type="text"
            placeholder="Bà con muốn hỏi điều gì (ví dụ: 'Cách quét QR', 'Lừa đảo gọi điện')..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="flex-1 px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          />
          <button
            type="submit"
            disabled={loading || !question.trim()}
            className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center gap-1.5 transition shadow-md disabled:opacity-50"
          >
            <span>Gửi</span>
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
}
