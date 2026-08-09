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
import Sidebar from './components/common/Sidebar';
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
import NeedHelpModal from './components/features/NeedHelpModal';
import MySkillsModal from './components/features/MySkillsModal';

export default function App() {
  // STATE MANAGEMENT
  const [user, setUser] = useState(null);
  const [role, setRole] = useState('citizen');
  const [seniorMode, setSeniorMode] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpenMobileSidebar, setIsOpenMobileSidebar] = useState(false);

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
  const [isNeedHelpOpen, setIsNeedHelpOpen] = useState(false);
  const [isMySkillsOpen, setIsMySkillsOpen] = useState(false);

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
        onToggleSidebar={() => setIsOpenMobileSidebar(!isOpenMobileSidebar)}
      />

      {/* MAIN CONTAINER WITH 6 ACTION CARDS SIDEBAR */}
      <div className="flex-1 max-w-7xl mx-auto w-full flex">
        
        {/* SIDEBAR DỌC BÊN TRÁI 6 THẺ MENU */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          role={role}
          onRoleChange={(newRole) => setRole(newRole)}
          onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
          onOpenNeedHelp={() => setIsNeedHelpOpen(true)}
          onOpenUploadActivity={() => setIsUploadActivityOpen(true)}
          onOpenMySkills={() => setIsMySkillsOpen(true)}
          isOpenMobile={isOpenMobileSidebar}
          onCloseMobile={() => setIsOpenMobileSidebar(false)}
        />

        {/* CỘT NỘI DUNG BÊN PHẢI (HERO BANNER & CARDS GRID) */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 overflow-hidden">
          
          {/* HERO BANNER SECTION */}
          <section className="relative bg-slate-900 text-white rounded-3xl overflow-hidden shadow-xl border border-slate-800">
            
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
            <div className="p-6 sm:p-10 relative z-10 space-y-5">
              
              {/* SLOGAN BADGE */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-emerald-500/20 border border-amber-400/40 backdrop-blur-md shadow-md">
                <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                <span className="text-xs font-black tracking-wider text-amber-300 uppercase">
                  Học số – Giúp nhau – Lan tỏa
                </span>
              </div>

              {/* MAIN TITLE BANNER */}
              <div>
                <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-none text-white drop-shadow-md">
                  CỘNG ĐỒNG THÔN 6 <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300">
                    XÃ DI LINH
                  </span>
                </h1>
                <p className="text-amber-400 font-extrabold text-sm sm:text-lg mt-2.5 tracking-wide flex items-center gap-2">
                  <span>✨ Nền tảng Chuyển đổi số & Học tập Cộng đồng</span>
                </p>
              </div>

              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-xl font-medium">
                Cầm tay chỉ việc cho bà con: Video quét QR, dùng Zalo, định danh VNeID, nhận biết lừa đảo mạng và ứng dụng AI vào đời sống hàng ngày.
              </p>

              {/* QUICK ACTION BUTTONS */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  onClick={() => setIsAiAssistantOpen(true)}
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-black text-xs sm:text-sm shadow-lg transform hover:-translate-y-0.5 transition flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4 fill-slate-950" />
                  <span>Hỏi Trợ Lý AI Ngay</span>
                </button>

                <button
                  onClick={() => setIsNeedHelpOpen(true)}
                  className="px-5 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs sm:text-sm shadow-lg transform hover:-translate-y-0.5 transition flex items-center gap-2"
                >
                  <span>🆘 Bác Cần Hỗ Trợ Số Tại Nhà</span>
                </button>
              </div>

            </div>
          </section>

          {/* QUICK SEARCH & TABS FILTER */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition ${
                  activeTab === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                Tất cả bài học
              </button>
              <button
                onClick={() => setActiveTab('video')}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition ${
                  activeTab === 'video' ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                🎥 Video
              </button>
              <button
                onClick={() => setActiveTab('infographic')}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition ${
                  activeTab === 'infographic' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                ✨ Infographic
              </button>
              <button
                onClick={() => setActiveTab('audio')}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition ${
                  activeTab === 'audio' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                🎙️ Podcast 2 phút
              </button>
            </div>

            {/* SEARCH INPUT */}
            <div className="relative w-full sm:w-72">
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

          {/* CARDS DISPLAY AREA BELOW BANNER */}

          {/* 1. LEARNING RESOURCES CARDS (🎬 TÔI MUỐN HỌC) */}
          {(activeTab === 'all' || activeTab === 'video' || activeTab === 'infographic' || activeTab === 'audio' || activeTab === 'document' || activeTab === 'image') && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <span>🎬 Kho Bài Học Cầm Tay Chỉ Việc (TÔI MUỐN HỌC)</span>
                  <span className="text-xs bg-blue-100 text-blue-800 font-extrabold px-2.5 py-0.5 rounded-full">
                    {filteredResources.length} bài học
                  </span>
                </h2>

                {(role === 'tech_team' || role === 'admin' || role === 'supporter') && (
                  <button
                    onClick={() => setIsUploadResourceOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Đăng Bài Học Mới</span>
                  </button>
                )}
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {[1, 2, 3].map(n => (
                    <div key={n} className="bg-white h-72 rounded-2xl border border-slate-200 animate-pulse p-4"></div>
                  ))}
                </div>
              ) : filteredResources.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {filteredResources.map(res => (
                    <ResourceCard
                      key={res.id}
                      resource={res}
                      onSelect={(selected) => setSelectedResource(selected)}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white p-10 rounded-3xl border border-slate-200 text-center">
                  <HelpCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <h3 className="font-bold text-slate-700 text-sm">Chưa có bài học phù hợp</h3>
                  <p className="text-xs text-slate-500 mt-1">Bà con thử bấm các Thẻ Menu ở Sidebar bên trái nhé.</p>
                </div>
              )}
            </section>
          )}

          {/* 2. COMMUNITY ACTIVITIES & SPREAD (🌱 HOẠT ĐỘNG LAN TỎA) */}
          {(activeTab === 'all' || activeTab === 'activities') && (
            <section className="space-y-4 pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <span>🌱 Nhật Ký HOẠT ĐỘNG LAN TỎA Cộng Đồng</span>
                  <span className="text-xs bg-emerald-100 text-emerald-800 font-extrabold px-2.5 py-0.5 rounded-full">
                    {activities.length} kết quả
                  </span>
                </h2>

                <button
                  onClick={() => setIsUploadActivityOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Đăng Báo Cáo Lan Tỏa</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {activities.map(act => (
                  <ActivityCard key={act.id} activity={act} />
                ))}
              </div>
            </section>
          )}

          {/* 3. LEARNING MODELS */}
          {(activeTab === 'all' || activeTab === 'models') && (
            <section className="space-y-4 pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <span>💡 Mô Hình Học Tập Từ Người Dân (AI Biên Tập 4 Bước)</span>
                  <span className="text-xs bg-amber-100 text-amber-900 font-extrabold px-2.5 py-0.5 rounded-full">
                    {models.length} mô hình
                  </span>
                </h2>

                <button
                  onClick={() => setIsUploadModelOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Gửi Cách Làm Hay</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {models.map(mod => (
                  <LearningModelCard key={mod.id} model={mod} />
                ))}
              </div>
            </section>
          )}

          {/* 4. OFFICIAL DOCUMENTS */}
          {(activeTab === 'all' || activeTab === 'official') && (
            <section className="space-y-4 pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <span>🏛️ Nguồn Văn Bản Chính Thống Cho AI Reference</span>
                  <span className="text-xs bg-purple-100 text-purple-800 font-extrabold px-2.5 py-0.5 rounded-full">
                    {officialDocs.length} văn bản
                  </span>
                </h2>

                {(role === 'admin' || role === 'tech_team') && (
                  <button
                    onClick={() => setIsUploadOfficialOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs transition shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tải Nguồn Cho AI</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {officialDocs.map(doc => (
                  <OfficialDocCard key={doc.id} doc={doc} />
                ))}
              </div>
            </section>
          )}

        </main>

      </div>

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

      <NeedHelpModal
        isOpen={isNeedHelpOpen}
        onClose={() => setIsNeedHelpOpen(false)}
      />

      <MySkillsModal
        isOpen={isMySkillsOpen}
        onClose={() => setIsMySkillsOpen(false)}
        user={user}
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
