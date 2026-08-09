import React, { useState, useEffect } from 'react';
import { 
  Video, Image as ImageIcon, FileText, Volume2, Sparkles, Plus, 
  Search, Users, Lightbulb, ShieldCheck, HeartHandshake, BookOpen, 
  HelpCircle, CheckCircle2, PhoneCall 
} from 'lucide-react';

// SERVICES SUPABASE
import { supabase } from './services/supabaseClient';
import { getLearningResources } from './services/resourceService';
import { getCommunityActivities } from './services/communityService';
import { getLearningModels } from './services/modelService';
import { getOfficialDocuments } from './services/officialDocService';

// COMMON COMPONENTS
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import RoleBadge from './components/common/RoleBadge';
import AuthModal from './components/common/AuthModal';
import AiAssistantModal from './components/common/AiAssistantModal';

// FEATURE COMPONENTS
import ResourceCard from './components/features/ResourceCard';
import ResourceDetailModal from './components/features/ResourceDetailModal';
import ActivityCard from './components/features/ActivityCard';
import ActivityUploadModal from './components/features/ActivityUploadModal';
import LearningModelCard from './components/features/LearningModelCard';
import LearningModelUploadModal from './components/features/LearningModelUploadModal';
import OfficialDocCard from './components/features/OfficialDocCard';
import OfficialDocUploadModal from './components/features/OfficialDocUploadModal';
import UploadResourceModal from './components/features/UploadResourceModal';

export default function App() {
  // STATE MANAGEMENT
  const [user, setUser] = useState(null);
  const [role, setRole] = useState('citizen');
  const [seniorMode, setSeniorMode] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // DATA STATES FROM SUPABASE
  const [resources, setResources] = useState([]);
  const [activities, setActivities] = useState([]);
  const [models, setModels] = useState([]);
  const [officialDocs, setOfficialDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  // MODALS STATE
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [isUploadActivityOpen, setIsUploadActivityOpen] = useState(false);
  const [isUploadModelOpen, setIsUploadModelOpen] = useState(false);
  const [isUploadOfficialOpen, setIsUploadOfficialOpen] = useState(false);
  const [isUploadResourceOpen, setIsUploadResourceOpen] = useState(false);

  useEffect(() => {
    fetchInitialData();
    checkUserSession();
  }, []);

  const checkUserSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser(session.user);
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();
      if (profile) setRole(profile.role);
    }
  };

  const fetchInitialData = async () => {
    setLoading(true);
    const [resRes, resAct, resMod, resDoc] = await Promise.all([
      getLearningResources(),
      getCommunityActivities(),
      getLearningModels(),
      getOfficialDocuments()
    ]);

    setResources(resRes.data || []);
    setActivities(resAct.data || []);
    setModels(resMod.data || []);
    setOfficialDocs(resDoc.data || []);
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRole('citizen');
  };

  const handleAuthSuccess = (authUser, userRole) => {
    setUser(authUser);
    setRole(userRole || 'citizen');
  };

  // FILTERED RESOURCES
  const filteredResources = resources.filter(res => {
    const matchesTab = activeTab === 'all' || activeTab === 'resources' || res.type === activeTab;
    const matchesSearch = !searchQuery || 
      res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className={`min-h-screen bg-slate-50 flex flex-col ${seniorMode ? 'senior-mode' : ''}`}>
      
      {/* HEADER NAVIGATION */}
      <Header
        user={user}
        role={role}
        onRoleChange={(newRole) => setRole(newRole)}
        seniorMode={seniorMode}
        setSeniorMode={setSeniorMode}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
      />

      {/* HERO BANNER SECTION */}
      <section className="relative bg-slate-900 text-white overflow-hidden shadow-xl">
        
        {/* BANNER BACKGROUND IMAGE */}
        <div className="absolute inset-0 z-0 opacity-40 mix-blend-luminosity hover:mix-blend-normal transition duration-700">
          <img 
            src="/banner_thon6_dilinh.jpg" 
            alt="Banner Cộng đồng Thôn 6 Xã Di Linh" 
            className="w-full h-full object-cover object-center scale-105"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-blue-950/80"></div>
        </div>

        {/* BANNER CONTENT */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-8 space-y-6">
              
              {/* SLOGAN BADGE */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-emerald-500/20 border border-amber-400/40 backdrop-blur-md shadow-md">
                <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                <span className="text-xs sm:text-sm font-black tracking-wider text-amber-300 uppercase">
                  Học số – Giúp nhau – Lan tỏa
                </span>
              </div>

              {/* MAIN TITLE BANNER */}
              <div>
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-none text-white drop-shadow-md">
                  CỘNG ĐỒNG THÔN 6 <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300">
                    XÃ DI LINH
                  </span>
                </h1>
                <p className="text-amber-400 font-extrabold text-lg sm:text-xl mt-3 tracking-wide flex items-center gap-2">
                  <span>✨ Nền tảng Chuyển đổi số & Học tập Cộng đồng</span>
                </p>
              </div>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl font-medium">
                Nơi cầm tay chỉ việc cho bà con: Video quét QR, dùng Zalo, định danh VNeID, nhận biết lừa đảo mạng và ứng dụng AI vào đời sống hàng ngày.
              </p>

              {/* ACTION BUTTONS & ROLE DISPLAY */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => setIsAiAssistantOpen(true)}
                  className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-black text-sm shadow-xl transform hover:-translate-y-0.5 transition flex items-center gap-2"
                >
                  <Sparkles className="w-5 h-5 fill-slate-950" />
                  <span>Hỏi Trợ Lý AI Cộng Đồng</span>
                </button>

                {role === 'citizen' && (
                  <button
                    onClick={() => setIsUploadModelOpen(true)}
                    className="px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 backdrop-blur-md transition flex items-center gap-2"
                  >
                    <Lightbulb className="w-4 h-4 text-amber-400" />
                    <span>Gửi Ý Tưởng / Mô Hình Hay</span>
                  </button>
                )}

                {(role === 'tech_team' || role === 'admin' || role === 'supporter') && (
                  <button
                    onClick={() => setIsUploadResourceOpen(true)}
                    className="px-5 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-md transition flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Đăng Tài Nguyên Mới</span>
                  </button>
                )}
              </div>

              {/* CURRENT ROLE NOTIFICATION */}
              <div className="pt-1 flex items-center gap-2 text-xs text-slate-400">
                <span>Đang truy cập dưới quyền:</span>
                <RoleBadge role={role} />
              </div>
            </div>

            {/* QUICK STATS CARD */}
            <div className="lg:col-span-4">
              <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-2xl space-y-4">
                <h3 className="font-extrabold text-white text-base flex items-center gap-2 border-b border-white/10 pb-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span>Phong Trào Số Thôn 6</span>
                </h3>

                <div className="grid grid-cols-2 gap-3 text-white">
                  <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10">
                    <div className="text-2xl font-black text-emerald-400">100%</div>
                    <div className="text-[11px] text-slate-300 font-medium">Nguồn rõ ràng</div>
                  </div>
                  <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10">
                    <div className="text-2xl font-black text-cyan-400">500+</div>
                    <div className="text-[11px] text-slate-300 font-medium">Bà con đã tham gia</div>
                  </div>
                  <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10">
                    <div className="text-2xl font-black text-amber-400">8 Nhóm</div>
                    <div className="text-[11px] text-slate-300 font-medium">Nội dung học tập</div>
                  </div>
                  <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10">
                    <div className="text-2xl font-black text-purple-400">24/7</div>
                    <div className="text-[11px] text-slate-300 font-medium">Trợ lý AI chính thống</div>
                  </div>
                </div>

                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs p-3 rounded-xl flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Đồng bộ CSDL Supabase Realtime</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 w-full space-y-8">
        
        {/* CATEGORY FILTER TABS & SEARCH */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          
          {/* TABS */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 scrollbar-none">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold whitespace-nowrap transition ${
                activeTab === 'all'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              📚 Tất cả bài viết
            </button>
            <button
              onClick={() => setActiveTab('video')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-extrabold whitespace-nowrap transition ${
                activeTab === 'video'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              🎥 Video Cầm tay
            </button>
            <button
              onClick={() => setActiveTab('infographic')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-extrabold whitespace-nowrap transition ${
                activeTab === 'infographic'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              ✨ Infographic
            </button>
            <button
              onClick={() => setActiveTab('audio')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-extrabold whitespace-nowrap transition ${
                activeTab === 'audio'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              🎙️ Podcast 2 phút
            </button>
            <button
              onClick={() => setActiveTab('activities')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-extrabold whitespace-nowrap transition ${
                activeTab === 'activities'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              🤝 Hoạt động cộng đồng ({activities.length})
            </button>
            <button
              onClick={() => setActiveTab('models')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-extrabold whitespace-nowrap transition ${
                activeTab === 'models'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              💡 Mô hình học tập ({models.length})
            </button>
            <button
              onClick={() => setActiveTab('official')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-extrabold whitespace-nowrap transition ${
                activeTab === 'official'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              🏛️ Nguồn AI Reference ({officialDocs.length})
            </button>
          </div>

          {/* SEARCH INPUT */}
          <div className="relative w-full lg:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm Zalo, VNeID, QR, lừa đảo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            />
          </div>

        </div>

        {/* SECTION 1: LEARNING RESOURCES (VIDEO, IMAGE, INFOGRAPHIC, DOCUMENT, AUDIO) */}
        {(activeTab === 'all' || activeTab === 'resources' || activeTab === 'video' || activeTab === 'infographic' || activeTab === 'audio') && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <span>Kho Cẩm Nang & Video Cầm Tay Chỉ Việc</span>
                  <span className="text-xs bg-blue-100 text-blue-800 font-extrabold px-2.5 py-0.5 rounded-full">
                    {filteredResources.length} tài nguyên
                  </span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                  Bấm nút "Đọc Hướng Dẫn" để phát giọng nói tự động cho Người cao tuổi nghe
                </p>
              </div>

              {(role === 'tech_team' || role === 'admin' || role === 'supporter') && (
                <button
                  onClick={() => setIsUploadResourceOpen(true)}
                  className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Đăng Tài Nguyên Mới</span>
                </button>
              )}
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(n => (
                  <div key={n} className="bg-white h-72 rounded-2xl border border-slate-200 animate-pulse p-4"></div>
                ))}
              </div>
            ) : filteredResources.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredResources.map(res => (
                  <ResourceCard
                    key={res.id}
                    resource={res}
                    onSelect={(selected) => setSelectedResource(selected)}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center">
                <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="font-bold text-slate-700 text-base">Chưa có bài viết phù hợp</h3>
                <p className="text-xs text-slate-500 mt-1">Bà con thử đổi từ khóa tìm kiếm hoặc chọn danh mục khác nhé.</p>
              </div>
            )}
          </section>
        )}

        {/* SECTION 2: COMMUNITY ACTIVITIES */}
        {(activeTab === 'all' || activeTab === 'activities') && (
          <section className="space-y-4 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <span>🤝 Nhật Ký Hoạt Động Cộng Đồng</span>
                  <span className="text-xs bg-emerald-100 text-emerald-800 font-extrabold px-2.5 py-0.5 rounded-full">
                    {activities.length} bài đăng
                  </span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                  Hình ảnh & kết quả thực tế hướng dẫn số trực tiếp tại các hộ gia đình Thôn 6
                </p>
              </div>

              <button
                onClick={() => setIsUploadActivityOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm transition shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Đăng Báo Cáo Hoạt Động</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activities.map(act => (
                <ActivityCard key={act.id} activity={act} />
              ))}
            </div>
          </section>
        )}

        {/* SECTION 3: LEARNING MODELS FROM CITIZENS */}
        {(activeTab === 'all' || activeTab === 'models') && (
          <section className="space-y-4 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <span>💡 Mô Hình Học Tập Từ Người Dân</span>
                  <span className="text-xs bg-amber-100 text-amber-900 font-extrabold px-2.5 py-0.5 rounded-full">
                    AI Biên Tập 4 Bước
                  </span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                  Các sáng kiến cách làm hay do chính người dân đóng góp và được AI chuẩn hóa
                </p>
              </div>

              <button
                onClick={() => setIsUploadModelOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm transition shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Gửi Cách Làm Hay</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {models.map(mod => (
                <LearningModelCard key={mod.id} model={mod} />
              ))}
            </div>
          </section>
        )}

        {/* SECTION 4: OFFICIAL DOCUMENTS FOR AI REFERENCE */}
        {(activeTab === 'all' || activeTab === 'official') && (
          <section className="space-y-4 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <span>🏛️ Nguồn Văn Bản Chính Thống Cho AI Reference</span>
                  <span className="text-xs bg-purple-100 text-purple-800 font-extrabold px-2.5 py-0.5 rounded-full">
                    Cán bộ & Admin
                  </span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                  Tài liệu quy phạm, chỉ đạo Đề án 06 và thông báo làm nguồn tri thức đối chiếu cho Trợ lý AI
                </p>
              </div>

              {(role === 'admin' || role === 'tech_team') && (
                <button
                  onClick={() => setIsUploadOfficialOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs sm:text-sm transition shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tải Nguồn Chính Thống</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {officialDocs.map(doc => (
                <OfficialDocCard key={doc.id} doc={doc} />
              ))}
            </div>
          </section>
        )}

      </main>

      {/* FOOTER */}
      <Footer />

      {/* MODALS */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      <AiAssistantModal
        isOpen={isAiAssistantOpen}
        onClose={() => setIsAiAssistantOpen(false)}
        officialDocs={officialDocs}
      />

      <ResourceDetailModal
        resource={selectedResource}
        onClose={() => setSelectedResource(null)}
      />

      <ActivityUploadModal
        isOpen={isUploadActivityOpen}
        onClose={() => setIsUploadActivityOpen(false)}
        onSuccess={(newAct) => setActivities([newAct, ...activities])}
      />

      <LearningModelUploadModal
        isOpen={isUploadModelOpen}
        onClose={() => setIsUploadModelOpen(false)}
        onSuccess={(newMod) => setModels([newMod, ...models])}
      />

      <OfficialDocUploadModal
        isOpen={isUploadOfficialOpen}
        onClose={() => setIsUploadOfficialOpen(false)}
        onSuccess={(newDoc) => setOfficialDocs([newDoc, ...officialDocs])}
      />

      <UploadResourceModal
        isOpen={isUploadResourceOpen}
        onClose={() => setIsUploadResourceOpen(false)}
        onSuccess={(newRes) => setResources([newRes, ...resources])}
      />

    </div>
  );
}
