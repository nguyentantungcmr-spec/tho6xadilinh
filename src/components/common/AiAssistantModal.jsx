import React, { useState, useEffect } from 'react';
import { 
  X, Bot, Sparkles, Send, BookOpen, ShieldCheck, AlertCircle, 
  FileText, CheckCircle2, Clock, ArrowRight, ExternalLink, PhoneCall, 
  Video, HeartHandshake, Award, HelpCircle, FileCheck
} from 'lucide-react';
import { askOfficialDocAI, getUnansweredQuestions } from '../../services/officialDocService';
import { extractSuggestedActions, ACTION_TYPES } from '../../services/aiActionRoutingService';

export default function AiAssistantModal({ isOpen, onClose, officialDocs = [], onNavigate }) {
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'unanswered'
  const [question, setQuestion] = useState('');
  
  const initialWelcomeActions = extractSuggestedActions({
    text: 'Chào bác/anh/chị! Em là Trợ lý AI Chuyển đổi số Thôn 6 Xã Di Linh.'
  });

  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: '🤖 Chào bác/anh/chị! Em là Trợ lý AI Chuyển đổi số Thôn 6 Xã Di Linh.\nEm được huấn luyện từ Cổng TTĐT Di Linh (dilinh.lamdong.gov.vn) & Đề án 06.\n\nBác/anh/chị muốn hỏi điều gì ạ? Nếu câu hỏi nào em chưa biết, em sẽ tự động lưu lại và gửi tới Tổ Công nghệ số Thôn 6 hỗ trợ!',
      actions: initialWelcomeActions
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [unansweredList, setUnansweredList] = useState([]);

  useEffect(() => {
    if (isOpen) {
      loadUnanswered();
    }
  }, [isOpen]);

  const loadUnanswered = async () => {
    const data = await getUnansweredQuestions();
    setUnansweredList(data || []);
  };

  const [sampleQuestions, setSampleQuestions] = useState([
    'Tôi muốn hỏi cách cài VNeID Mức 2?',
    'Làm sao biết cuộc gọi là lừa đảo?',
    'Quét mã QR BHYT ở đâu tại Di Linh?',
    'Lịch đăng ký dịch vụ công Thôn 6 tuần này?'
  ]);

  if (!isOpen) return null;

  const handleActionClick = (act) => {
    if (act.type === ACTION_TYPES.INTERNAL_TAB) {
      setActiveTab(act.target);
    } else if (act.type === ACTION_TYPES.CALL) {
      window.location.href = act.target;
    } else if (act.type === ACTION_TYPES.LINK) {
      window.open(act.target, '_blank');
    } else if (onNavigate) {
      onNavigate(act.type, act.target, act.payload);
    }
  };

  const executeSendQuestion = async (userText) => {
    if (!userText || !userText.trim() || loading) return;

    setQuestion('');
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setLoading(true);

    try {
      const res = await askOfficialDocAI(userText, officialDocs);
      const aiReplyText = typeof res === 'string' ? res : res.text;
      const isUnknown = typeof res === 'object' && res.isUnknown;
      const sourceTitle = res.sourceTitle || (res.doc ? res.doc.title : '');
      const sourceAgency = res.sourceAgency || (res.doc ? res.doc.agency || res.doc.issuing_body : '');
      const sourceUrl = res.sourceUrl || (res.doc ? res.doc.sourceUrl || res.doc.source_url : '');

      if (res && res.suggestions && res.suggestions.length > 0) {
        // Giới hạn tối đa 3 câu gợi ý liên quan trực tiếp
        setSampleQuestions(res.suggestions.slice(0, 3));
      }

      // Tự động nhận diện các nút chức năng website liên quan
      const actionButtons = extractSuggestedActions({
        text: aiReplyText + ' ' + userText,
        intent: res.intent,
        isUnknown: isUnknown,
        needHuman: isUnknown || res.needHuman,
        doc: res.doc
      });

      setMessages(prev => [
        ...prev, 
        { 
          sender: 'ai', 
          text: aiReplyText,
          isUnknown: isUnknown,
          sourceTitle: sourceTitle,
          sourceAgency: sourceAgency,
          sourceUrl: sourceUrl,
          actions: actionButtons
        }
      ]);

      if (isUnknown) {
        await loadUnanswered();
      }
    } catch (err) {
      setMessages(prev => [
        ...prev, 
        { 
          sender: 'ai', 
          text: 'Có lỗi kết nối AI. Bà con thử hỏi lại sau nhé!',
          actions: extractSuggestedActions({ isUnknown: true })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    await executeSendQuestion(question);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full h-[85vh] flex flex-col shadow-2xl border border-slate-100 relative overflow-hidden">
        
        {/* HEADER */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-800 to-purple-800 text-white p-4 sm:p-5 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-white backdrop-blur-xs">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h2 className="font-bold text-base sm:text-lg leading-tight flex items-center gap-2">
                  Trợ Lý AI Cộng Đồng Thôn 6
                  <span className="bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded-md uppercase font-extrabold">
                    Tự Động Báo Tổ CNS
                  </span>
                </h2>
                <p className="text-xs text-blue-100 flex items-center gap-1 mt-0.5">
                  <span>Cổng TTĐT Di Linh:</span>
                  <a 
                    href="https://dilinh.lamdong.gov.vn/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="font-extrabold underline text-amber-300 hover:text-white transition"
                  >
                    dilinh.lamdong.gov.vn ↗
                  </a>
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

          {/* TAB SELECTION */}
          <div className="flex items-center gap-2 mt-3 pt-2 border-t border-white/10">
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 ${
                activeTab === 'chat' 
                  ? 'bg-white text-blue-900 shadow-xs' 
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>💬 Hỏi Đáp Với AI</span>
            </button>

            <button
              onClick={() => setActiveTab('unanswered')}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 ${
                activeTab === 'unanswered' 
                  ? 'bg-amber-400 text-slate-950 shadow-xs' 
                  : 'bg-white/10 hover:bg-white/20 text-amber-200'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>📋 Báo Cho Tổ CNS ({unansweredList.length})</span>
            </button>
          </div>
        </div>

        {/* TAB 1: CHAT INTERFACE */}
        {activeTab === 'chat' && (
          <>
            {/* CHAT MESSAGES BODY */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl p-4 text-sm leading-relaxed shadow-xs whitespace-pre-line ${
                      msg.sender === 'user'
                        ? 'bg-blue-600 text-white font-medium rounded-tr-none'
                        : msg.isUnknown 
                          ? 'bg-amber-50 text-slate-800 border-2 border-amber-300 rounded-tl-none'
                          : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                    }`}
                  >
                    {msg.text}

                    {/* HIỂN THỊ NGUỒN CHÍNH THỐNG KHI CÓ SOURCE TITLE & URL THỰC SỰ TRONG DATABASE */}
                    {msg.sender === 'ai' && msg.sourceTitle && (
                      <div className="mt-3 pt-3 border-t border-slate-200 bg-slate-50 p-3 rounded-xl space-y-1.5">
                        <div className="font-bold text-xs text-blue-900 flex items-center gap-1.5">
                          <span>📚 Nguồn:</span>
                          <span>{msg.sourceTitle}</span>
                        </div>
                        {msg.sourceAgency && (
                          <div className="text-[11px] text-slate-600 font-medium">
                            🏛️ Cơ quan: {msg.sourceAgency}
                          </div>
                        )}
                        {msg.sourceUrl && (
                          <a
                            href={msg.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs transition mt-1"
                          >
                            <span>Xem nguồn chính thống</span>
                            <span>↗</span>
                          </a>
                        )}
                      </div>
                    )}

                    {/* HIỂN THỊ CÁC NÚT CHỨC NĂNG GỢI Ý CỦA WEBSITE */}
                    {msg.sender === 'ai' && msg.actions && msg.actions.length > 0 && (
                      <div className="mt-3.5 pt-3 border-t border-slate-200 space-y-2">
                        <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-blue-700">
                            <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                            <span>Chuyển tới chức năng website liên quan:</span>
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold lowercase">
                            bấm để mở ngay
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          {msg.actions.map((act) => (
                            <button
                              key={act.id}
                              type="button"
                              onClick={() => handleActionClick(act)}
                              className={`
                                w-full p-2.5 rounded-xl bg-gradient-to-r ${act.color} 
                                shadow-xs hover:shadow-md transform hover:-translate-y-0.5 active:scale-98 
                                transition-all duration-150 text-left flex items-center justify-between 
                                group cursor-pointer border border-white/20
                              `}
                            >
                              <div className="min-w-0 pr-2">
                                <div className="font-extrabold text-xs leading-snug drop-shadow-xs flex items-center gap-1.5">
                                  <span>{act.label}</span>
                                </div>
                                <div className="text-[10px] opacity-90 truncate font-medium mt-0.5">
                                  {act.sublabel}
                                </div>
                              </div>
                              <span className="text-white/80 group-hover:text-white group-hover:translate-x-1 transition font-bold text-sm shrink-0">
                                ➔
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {(msg.isUnknown || msg.needHuman) && (
                      <div className="mt-3 pt-3 border-t border-amber-200 space-y-2">
                        <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>Đã lưu câu hỏi vào danh sách chờ Tổ CNS Thôn 6 rà soát!</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveTab('unanswered')}
                          className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <span>👨‍💼 Cần cán bộ hỗ trợ</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* TRẠNG THÁI ĐANG XỬ LÝ: “Đang tra cứu nguồn chính thống…” */}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-200 text-xs font-semibold text-slate-600 flex items-center gap-2.5 shadow-xs">
                    <Bot className="w-4 h-4 animate-spin text-blue-600 shrink-0" />
                    <span className="animate-pulse font-bold text-blue-900">Đang tra cứu nguồn chính thống…</span>
                  </div>
                </div>
              )}
            </div>

            {/* LINK BANNER CỔNG TTĐT DI LINH */}
            <div className="px-4 py-2 bg-gradient-to-r from-emerald-50 to-blue-50 border-t border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-slate-700 font-bold">
                <span className="text-emerald-600">🏛️</span>
                <span className="hidden sm:inline">Cổng chỉ đạo chính thống Huyện Di Linh:</span>
                <span className="sm:hidden">Cổng TTĐT Di Linh:</span>
              </div>
              <a
                href="https://dilinh.lamdong.gov.vn/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-lg shadow-xs transition flex items-center gap-1"
              >
                <span>dilinh.lamdong.gov.vn</span>
                <span>↗</span>
              </a>
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
                    onClick={() => executeSendQuestion(q)}
                    className="whitespace-nowrap text-xs bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 font-medium transition cursor-pointer"
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
                placeholder="Bà con muốn hỏi điều gì (ví dụ: 'Cách quét QR', 'Lịch họp thôn')..."
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
          </>
        )}

        {/* TAB 2: UNANSWERED QUESTIONS LOGGED FOR CNS TEAM */}
        {activeTab === 'unanswered' && (
          <div className="flex-1 p-5 overflow-y-auto bg-slate-50 space-y-4">
            <div className="bg-amber-100 border border-amber-300 rounded-2xl p-4 text-xs text-amber-900 font-medium leading-relaxed">
              <div className="font-extrabold text-sm mb-1 flex items-center gap-1.5 text-amber-950">
                <AlertCircle className="w-4 h-4 text-amber-700" />
                <span>Danh sách câu hỏi AI chưa biết - Đã báo cho Tổ CNS Thôn 6</span>
              </div>
              Mọi thắc mắc của người dân mà Trợ lý AI chưa có dữ liệu sẽ tự động lưu tại đây. Ban điều hành Tổ CNS sẽ rà soát văn bản và cập nhật câu trả lời chính thức cho bà con!
            </div>

            {unansweredList.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-sm font-medium">
                Chưa có câu hỏi nào bị tồn đọng! AI đã giải đáp trơn tru tất cả các câu hỏi.
              </div>
            ) : (
              <div className="space-y-3">
                {unansweredList.map((item, idx) => (
                  <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-bold text-sm text-slate-800 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                        <span>"{item.question}"</span>
                      </div>
                      <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded-md font-black shrink-0 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>Đã chuyển Tổ CNS</span>
                      </span>
                    </div>

                    <div className="text-xs text-slate-500 flex items-center justify-between pt-2 border-t border-slate-100">
                      <span>Thời gian gửi: {new Date(item.created_at).toLocaleString('vi-VN')}</span>
                      <span className="font-bold text-emerald-700">Tổ CNS Thôn 6 sẽ xử lý</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
