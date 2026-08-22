import React, { useState, useEffect } from 'react';
import { 
  Video, Image as ImageIcon, FileText, Volume2, Sparkles, Plus, 
  Search, Users, Lightbulb, ShieldCheck, HeartHandshake, BookOpen, 
  HelpCircle, CheckCircle2, PhoneCall, ExternalLink, RefreshCw
} from 'lucide-react';

// SERVICES SUPABASE
import { supabase } from './services/supabaseClient';
import { getLearningResources } from './services/resourceService';
import { getCommunityActivities } from './services/communityService';
import { getLearningModels } from './services/modelService';
import { getOfficialDocuments } from './services/officialDocService';
import { INITIAL_NEWS, getNewsArticles } from './services/newsService';

// COMMON COMPONENTS
import Header from './components/common/Header';
import Sidebar from './components/common/Sidebar';
import Footer from './components/common/Footer';
import RoleBadge from './components/common/RoleBadge';
import AuthModal from './components/common/AuthModal';
import AiAssistantModal from './components/common/AiAssistantModal';
import FloatingActionStickers from './components/common/FloatingActionStickers';
import LedTickerBar from './components/common/LedTickerBar';

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
import KnowledgeAdminModal from './components/admin/KnowledgeAdminModal';
import NewsCard from './components/features/NewsCard';
import NewsDetailModal from './components/features/NewsDetailModal';
import WeatherAgriWidget from './components/features/WeatherAgriWidget';

const INITIAL_RESOURCES = [
  {
    id: 'help-video-pu3ibvcnc9u',
    title: '🎥 Video Hướng Dẫn Kỹ Năng Số Cầm Tay Chỉ Việc - Phần 1',
    description: 'Cẩm nang video hướng dẫn chi tiết trực quan các thao tác công nghệ số thiết yếu, hỗ trợ bà con Thôn 6 xem và thực hành dễ dàng.',
    type: 'video',
    category: 'Tôi Muốn Học',
    media_url: 'https://www.youtube.com/embed/pu3IBvcnC9U',
    source_author: 'Tổ Công nghệ số Cộng đồng Thôn 6',
    view_count: 245,
    senior_friendly: true,
    status: 'published'
  },
  {
    id: 'help-video-hvslr4j1bay',
    title: '🎥 Video Hướng Dẫn Kỹ Năng Số Thực Hành Trực Quan - Phần 2',
    description: 'Video cẩm nang tiếp theo hướng dẫn chi tiết các thao tác công nghệ số thực tế, giúp người dân Thôn 6 làm chủ ứng dụng số dễ dàng.',
    type: 'video',
    category: 'Tôi Muốn Học',
    media_url: 'https://www.youtube.com/embed/HvSLR4j1baY',
    source_author: 'Tổ Công nghệ số Cộng đồng Thôn 6',
    view_count: 198,
    senior_friendly: true,
    status: 'published'
  },
  {
    id: 'help-video-hsmgjz4q6dm',
    title: '🎥 Video Hướng Dẫn Kỹ Năng Số Nâng Cao - Phần 3',
    description: 'Cẩm nang video thực hành chuyên sâu giúp người dân Thôn 6 tiếp cận nền tảng công nghệ và ứng dụng thông minh trong đời sống.',
    type: 'video',
    category: 'Tôi Muốn Học',
    media_url: 'https://www.youtube.com/embed/HSmgjZ4Q6dM',
    source_author: 'Tổ Công nghệ số Cộng đồng Thôn 6',
    view_count: 280,
    senior_friendly: true,
    status: 'published'
  },
  {
    id: 'help-video-vneid',
    title: '🎥 Video Hướng Dẫn Kích Hoạt VNeID Mức 2 & Tra Cứu Dịch Vụ Công',
    description: 'Hướng dẫn trực quan chi tiết từng nút bấm trên điện thoại giúp người dân kích hoạt tài khoản định danh điện tử VNeID.',
    type: 'video',
    category: 'VNeID & Dịch vụ công',
    media_url: 'https://www.youtube.com/embed/pu3IBvcnC9U',
    source_author: 'Công an Xã Di Linh - Tổ CNS',
    view_count: 312,
    senior_friendly: true,
    status: 'published'
  },
  {
    id: 'help-video-zalo',
    title: '🎥 Video Hướng Dẫn Gọi Điện Video Zalo Kết Nối Người Thân',
    description: 'Video thao tác màn hình lớn đơn giản giúp các bác cao tuổi tự tin gọi video trò chuyện với con cháu.',
    type: 'video',
    category: 'Sử dụng Zalo',
    media_url: 'https://www.youtube.com/embed/HvSLR4j1baY',
    source_author: 'Đoàn Thanh Niên Thôn 6',
    view_count: 175,
    senior_friendly: true,
    status: 'published'
  },
  {
    id: 'help-binhdanhocvuso',
    title: '🇻🇳 Cổng Học Tập "Bình Dân Học Vụ Số" Quốc Gia (binhdanhocvuso.gov.vn)',
    description: 'Chương trình quốc gia phổ cập kỹ năng số toàn dân do Bộ Thông tin và Truyền thông phát triển, cung cấp các khóa học và cẩm nang số miễn phí cho mọi lứa tuổi.',
    type: 'document',
    category: 'Tôi Muốn Học',
    media_url: 'https://www.binhdanhocvuso.gov.vn/',
    external_url: 'https://www.binhdanhocvuso.gov.vn/',
    thumbnail_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1000&q=80',
    source_author: 'Bộ Thông tin & Truyền thông',
    view_count: 520,
    senior_friendly: true,
    status: 'published'
  },
  {
    id: 'help-dilinh-gov',
    title: '🏛️ Cổng Thông Tin Điện Tử Huyện Di Linh (dilinh.lamdong.gov.vn)',
    description: 'Kênh thông tin chính thống của UBND Huyện Di Linh: Tra cứu văn bản chỉ đạo điều hành, dịch vụ công trực tuyến, lịch công tác và tin tức phát triển kinh tế - xã hội địa phương.',
    type: 'document',
    category: 'Tôi Muốn Học',
    media_url: 'https://dilinh.lamdong.gov.vn/',
    external_url: 'https://dilinh.lamdong.gov.vn/',
    thumbnail_url: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1000&q=80',
    source_author: 'UBND Huyện Di Linh',
    view_count: 680,
    senior_friendly: true,
    status: 'published'
  }
];

// DANH SÁCH ẢNH THỰC TẾ LUÂN PHIÊN TRÊN BANNER
const BANNER_SLIDES = [
  {
    url: '/banner_thon6_dilinh.jpg',
    caption: '📍 Toàn cảnh Núi Đồi & Hồ Nước Di Linh'
  },
  {
    url: '/banner_1.jpg',
    caption: '📍 Khuôn viên Hành chính Di Linh'
  },
  {
    url: '/banner_2.png',
    caption: '📍 Toàn cảnh Đô thị Cao nguyên Di Linh'
  },
  {
    url: '/banner_3.png',
    caption: '📍 Khu Hành chính Thôn 6, Xã Di Linh'
  },
  {
    url: '/banner_4.png',
    caption: '📍 Di tích & Công trình Văn hóa Di Linh'
  }
];

export default function App() {
  // STATE MANAGEMENT
  const [user, setUser] = useState(null);
  const [role, setRole] = useState('citizen');
  const [seniorMode, setSeniorMode] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpenMobileSidebar, setIsOpenMobileSidebar] = useState(false);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  // TỰ ĐỘNG CHUYỂN ẢNH BANNER MỖI 3.5 GIÂY
  useEffect(() => {
    const bannerTimer = setInterval(() => {
      setCurrentBannerIndex(prev => (prev + 1) % BANNER_SLIDES.length);
    }, 3500);
    return () => clearInterval(bannerTimer);
  }, []);

  // DATA STATES FROM SUPABASE (Khởi tạo sẵn với các bài học Video)
  const [resources, setResources] = useState(INITIAL_RESOURCES);
  const [newsList, setNewsList] = useState(INITIAL_NEWS);
  const [activities, setActivities] = useState([]);
  const [models, setModels] = useState([]);
  const [officialDocs, setOfficialDocs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newsCategory, setNewsCategory] = useState('all');
  const [isRefreshingNews, setIsRefreshingNews] = useState(false);

  // MODALS STATE
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [selectedNews, setSelectedNews] = useState(null);
  const [isUploadActivityOpen, setIsUploadActivityOpen] = useState(false);
  const [isUploadModelOpen, setIsUploadModelOpen] = useState(false);
  const [isUploadOfficialOpen, setIsUploadOfficialOpen] = useState(false);
  const [isUploadResourceOpen, setIsUploadResourceOpen] = useState(false);
  const [isNeedHelpOpen, setIsNeedHelpOpen] = useState(false);
  const [isMySkillsOpen, setIsMySkillsOpen] = useState(false);
  const [isKnowledgeAdminOpen, setIsKnowledgeAdminOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

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

    // Danh sách toàn bộ các bài học Video thực tế trong mục TÔI MUỐN HỌC
    const allHelpVideos = [
      {
        id: 'help-video-pu3ibvcnc9u',
        title: '🎥 Video Hướng Dẫn Kỹ Năng Số Cầm Tay Chỉ Việc - Phần 1',
        description: 'Cẩm nang video hướng dẫn chi tiết trực quan các thao tác công nghệ số thiết yếu, hỗ trợ bà con Thôn 6 xem và thực hành dễ dàng.',
        type: 'video',
        category: 'Tôi Muốn Học',
        media_url: 'https://www.youtube.com/embed/pu3IBvcnC9U',
        source_author: 'Tổ Công nghệ số Cộng đồng Thôn 6',
        view_count: 245,
        senior_friendly: true,
        status: 'published'
      },
      {
        id: 'help-video-hvslr4j1bay',
        title: '🎥 Video Hướng Dẫn Kỹ Năng Số Thực Hành Trực Quan - Phần 2',
        description: 'Video cẩm nang tiếp theo hướng dẫn chi tiết các thao tác công nghệ số thực tế, giúp người dân Thôn 6 làm chủ ứng dụng số dễ dàng.',
        type: 'video',
        category: 'Tôi Muốn Học',
        media_url: 'https://www.youtube.com/embed/HvSLR4j1baY',
        source_author: 'Tổ Công nghệ số Cộng đồng Thôn 6',
        view_count: 198,
        senior_friendly: true,
        status: 'published'
      },
      {
        id: 'help-video-hsmgjz4q6dm',
        title: '🎥 Video Hướng Dẫn Kỹ Năng Số Nâng Cao - Phần 3',
        description: 'Cẩm nang video thực hành chuyên sâu giúp người dân Thôn 6 tiếp cận nền tảng công nghệ và ứng dụng thông minh trong đời sống.',
        type: 'video',
        category: 'Tôi Muốn Học',
        media_url: 'https://www.youtube.com/embed/HSmgjZ4Q6dM',
        source_author: 'Tổ Công nghệ số Cộng đồng Thôn 6',
        view_count: 280,
        senior_friendly: true,
        status: 'published'
      },
      {
        id: 'help-video-vneid',
        title: '🎥 Video Hướng Dẫn Kích Hoạt VNeID Mức 2 & Tra Cứu Dịch Vụ Công',
        description: 'Hướng dẫn trực quan chi tiết từng nút bấm trên điện thoại giúp người dân kích hoạt tài khoản định danh điện tử VNeID.',
        type: 'video',
        category: 'VNeID & Dịch vụ công',
        media_url: 'https://www.youtube.com/embed/pu3IBvcnC9U',
        source_author: 'Công an Xã Di Linh - Tổ CNS',
        view_count: 312,
        senior_friendly: true,
        status: 'published'
      },
      {
        id: 'help-video-zalo',
        title: '🎥 Video Hướng Dẫn Gọi Điện Video Zalo Kết Nối Người Thân',
        description: 'Video thao tác màn hình lớn đơn giản giúp các bác cao tuổi tự tin gọi video trò chuyện với con cháu.',
        type: 'video',
        category: 'Sử dụng Zalo',
        media_url: 'https://www.youtube.com/embed/HvSLR4j1baY',
        source_author: 'Đoàn Thanh Niên Thôn 6',
        view_count: 175,
        senior_friendly: true,
        status: 'published'
      },
      {
        id: 'help-binhdanhocvuso',
        title: '🇻🇳 Cổng Học Tập "Bình Dân Học Vụ Số" Quốc Gia (binhdanhocvuso.gov.vn)',
        description: 'Chương trình quốc gia phổ cập kỹ năng số toàn dân do Bộ Thông tin và Truyền thông phát triển, cung cấp các khóa học và cẩm nang số miễn phí cho mọi lứa tuổi.',
        type: 'document',
        category: 'Tôi Muốn Học',
        media_url: 'https://www.binhdanhocvuso.gov.vn/',
        external_url: 'https://www.binhdanhocvuso.gov.vn/',
        thumbnail_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1000&q=80',
        source_author: 'Bộ Thông tin & Truyền thông',
        view_count: 520,
        senior_friendly: true,
        status: 'published'
      },
      {
        id: 'help-dilinh-gov',
        title: '🏛️ Cổng Thông Tin Điện Tử Huyện Di Linh (dilinh.lamdong.gov.vn)',
        description: 'Kênh thông tin chính thống của UBND Huyện Di Linh: Tra cứu văn bản chỉ đạo điều hành, dịch vụ công trực tuyến, lịch công tác và tin tức phát triển kinh tế - xã hội địa phương.',
        type: 'document',
        category: 'Tôi Muốn Học',
        media_url: 'https://dilinh.lamdong.gov.vn/',
        external_url: 'https://dilinh.lamdong.gov.vn/',
        thumbnail_url: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1000&q=80',
        source_author: 'UBND Huyện Di Linh',
        view_count: 680,
        senior_friendly: true,
        status: 'published'
      }
    ];

    let resourceList = resRes.data || [];
    // Thay thế bất kỳ video dQw4w9WgXcQ cũ nào
    resourceList = resourceList.filter(r => !(r.type === 'video' && r.media_url?.includes('dQw4w9WgXcQ')));

    // Bổ sung đầy đủ toàn bộ video bài học vào đầu danh sách Tôi Muốn Học
    allHelpVideos.forEach(v => {
      if (!resourceList.some(r => r.id === v.id || r.media_url === v.media_url)) {
        resourceList.unshift(v);
      }
    });

    setResources(resourceList);
    setActivities(resAct.data || []);
    setModels(resMod.data || []);
    setOfficialDocs(resDoc.data || []);

    try {
      const dailyNews = await getNewsArticles();
      if (dailyNews && dailyNews.length > 0) setNewsList(dailyNews);
    } catch (e) {
      console.log('Error fetching daily news', e);
    }

    setLoading(false);
  };

  // HÀM LÀM MỚI BẢN TIN TỰ ĐỘNG THEO THỜI GIAN THỰC
  const handleRefreshNews = async () => {
    setIsRefreshingNews(true);
    const updatedNews = await getNewsArticles();
    setNewsList(updatedNews);
    setTimeout(() => setIsRefreshingNews(false), 500);
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

  // ĐIỀU HƯỚNG TỪ NÚT GỢI Ý CỦA TRỢ LÝ AI TỚI CÁC TRANG & CHỨC NĂNG CỦA WEBSITE
  const handleAiNavigate = (actionType, target, payload) => {
    setIsAiAssistantOpen(false);
    if (actionType === 'tab') {
      setActiveTab(target);
      setTimeout(() => {
        const el = document.getElementById('main-content-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    } else if (actionType === 'modal') {
      if (target === 'need_help') setIsNeedHelpOpen(true);
      else if (target === 'my_skills') setIsMySkillsOpen(true);
      else if (target === 'upload_activity') setIsUploadActivityOpen(true);
      else if (target === 'upload_model') setIsUploadModelOpen(true);
      else if (target === 'upload_resource') setIsUploadResourceOpen(true);
      else if (target === 'upload_official') setIsUploadOfficialOpen(true);
      else if (target === 'auth') setIsAuthOpen(true);
      else if (target === 'knowledge_admin') setIsKnowledgeAdminOpen(true);
    } else if (actionType === 'resource') {
      const found = resources.find(r => r.id === target);
      if (found) {
        setSelectedResource(found);
      } else {
        setActiveTab('video');
        setTimeout(() => {
          const el = document.getElementById('main-content-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      }
    }
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
      
      {/* 1. HEADER NAVIGATION TRÊN CÙNG */}
      <Header
        user={user}
        role={role}
        onRoleChange={(newRole) => setRole(newRole)}
        seniorMode={seniorMode}
        setSeniorMode={setSeniorMode}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
        onOpenKnowledgeAdmin={() => setIsKnowledgeAdminOpen(true)}
        onToggleSidebar={() => setIsOpenMobileSidebar(!isOpenMobileSidebar)}
      />

      {/* 2. HERO BANNER THIẾT KẾ THEO CHUẨN CỔNG THÔNG TIN ĐIỆN TỬ CHÍNH THỐNG */}
      <section className="relative bg-gradient-to-r from-[#0156bb] via-[#006ee6] to-[#0152b5] text-white shadow-xl border-y-2 border-blue-300/40 overflow-hidden">
        
        {/* HỌA TIẾT CHÌM HOA VĂN TRỐNG ĐỒNG & ÁNH SÁNG */}
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(circle_at_20%_50%,rgba(255,255,255,0.3)_0%,transparent_60%)]"></div>
        <div className="absolute -left-20 -top-20 w-80 h-80 rounded-full border-8 border-dashed border-white/10 opacity-20 pointer-events-none"></div>

        <div className="w-full max-w-[1440px] mx-auto px-3 sm:px-5 lg:px-6 py-3 sm:py-4.5 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 sm:gap-4 lg:gap-5 items-center">
            
            {/* CỘT 1 (BÊN TRÁI): BIỂU TƯỢNG HUY HIỆU & NỘI DUNG CHÍNH THỐNG */}
            <div className="md:col-span-12 lg:col-span-5 flex items-center gap-3 sm:gap-4">
              
              {/* BIỂU TƯỢNG HUY HIỆU TRÒN CHÍNH THỐNG NỀN VÀNG HOA SEN / SAO VÀNG */}
              <div className="shrink-0 relative group">
                <div className="w-14 h-14 sm:w-18 sm:h-18 rounded-full bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-500 p-1 shadow-2xl ring-4 ring-white/95 flex items-center justify-center">
                  <div className="w-full h-full rounded-full bg-gradient-to-b from-amber-400 to-yellow-500 border-2 border-red-600 flex flex-col items-center justify-center text-center p-0.5 relative overflow-hidden">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-red-600 text-yellow-300 flex items-center justify-center font-black text-xs sm:text-sm shadow-xs">
                      ★
                    </div>
                    <span className="text-[7px] sm:text-[8px] font-black text-red-800 uppercase tracking-tighter mt-0.5 leading-none">
                      THÔN 6
                    </span>
                    <span className="text-[6px] sm:text-[7px] font-black text-slate-900 leading-none">
                      DI LINH
                    </span>
                  </div>
                </div>
              </div>

              {/* NỘI DUNG VĂN BẢN */}
              <div className="space-y-0.5 sm:space-y-1">
                <div className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-black tracking-widest text-amber-300 uppercase drop-shadow-md">
                  <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" />
                  <span>HỌC SỐ – GIÚP NHAU – LAN TỎA</span>
                </div>

                <h1 className="text-xl sm:text-3xl xl:text-[34px] font-black tracking-tight uppercase text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] leading-tight">
                  CỘNG ĐỒNG THÔN 6
                </h1>

                <div className="text-sm sm:text-xl xl:text-2xl font-black uppercase tracking-wide text-red-600 [text-shadow:_0_1.5px_0_#fff,_0_-1.5px_0_#fff,_1.5px_0_0_#fff,_-1.5px_0_0_#fff,_2px_2px_4px_rgba(0,0,0,0.5)]">
                  XÃ DI LINH – TỈNH LÂM ĐỒNG
                </div>
              </div>

            </div>

            {/* CỘT 2 (Ở GIỮA): KHUNG ẢNH TOÀN CẢNH DI LINH LUÂN PHIÊN CHUYỂN ĐỔI */}
            <div className="md:col-span-7 lg:col-span-4 relative group">
              <div className="relative h-36 sm:h-44 lg:h-38 xl:h-44 rounded-2xl overflow-hidden shadow-2xl border-4 border-white/95 ring-2 ring-blue-300/60 bg-slate-950">
                {BANNER_SLIDES.map((slide, idx) => (
                  <div
                    key={idx}
                    className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                      idx === currentBannerIndex 
                        ? 'opacity-100 scale-100 z-10' 
                        : 'opacity-0 scale-105 z-0 pointer-events-none'
                    }`}
                  >
                    <img
                      src={slide.url || slide}
                      alt="Hình ảnh Thôn 6 Xã Di Linh"
                      className="w-full h-full object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none"></div>
                  </div>
                ))}

                {/* DÒNG CHỮ ĐỊA DANH CỐ ĐỊNH */}
                <div className="absolute bottom-2 right-2.5 z-20 bg-slate-950/80 backdrop-blur-xs text-white text-[9px] sm:text-[11px] font-black px-2.5 py-0.5 rounded-full border border-white/30 shadow-md">
                  📍 Thôn 6, Xã Di Linh
                </div>

                {/* NÚT ĐIỀU HƯỚNG TRÁI / PHẢI */}
                <button
                  type="button"
                  onClick={() => setCurrentBannerIndex(prev => (prev - 1 + BANNER_SLIDES.length) % BANNER_SLIDES.length)}
                  className="absolute left-1.5 top-1/2 -translate-y-1/2 z-20 w-6 h-6 rounded-full bg-slate-900/60 hover:bg-slate-900/90 text-white flex items-center justify-center text-xs font-black opacity-0 group-hover:opacity-100 transition shadow-md cursor-pointer border border-white/30"
                  aria-label="Ảnh trước"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentBannerIndex(prev => (prev + 1) % BANNER_SLIDES.length)}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-slate-900/60 hover:bg-slate-900/90 text-white flex items-center justify-center text-xs font-black opacity-0 group-hover:opacity-100 transition shadow-md cursor-pointer border border-white/30"
                  aria-label="Ảnh sau"
                >
                  ›
                </button>

                {/* CHẤM TRÒN CHỈ SỐ SLIDE */}
                <div className="absolute top-2 right-2.5 z-20 flex items-center gap-1 bg-slate-950/50 backdrop-blur-xs px-1.5 py-0.5 rounded-full border border-white/20">
                  {BANNER_SLIDES.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCurrentBannerIndex(idx)}
                      className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                        idx === currentBannerIndex 
                          ? 'w-4 bg-amber-400' 
                          : 'w-1.5 bg-white/50 hover:bg-white/80'
                      }`}
                      aria-label={`Chuyển tới ảnh ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* CỘT 3 (SÁT MÉP PHẢI): THẺ MÃ QR QUÉT THAM GIA NHÓM ZALO CỘNG ĐỒNG THÔN 6 */}
            <div className="md:col-span-5 lg:col-span-3 flex justify-end items-center w-full">
              <div 
                onClick={() => setIsQrModalOpen(true)}
                className="bg-white/95 hover:bg-white text-slate-900 p-2.5 sm:p-3 rounded-2xl shadow-2xl border-2 border-amber-300/90 ring-2 ring-white/95 flex items-center gap-3 cursor-pointer transform hover:scale-102 transition duration-300 group ml-auto"
                title="Bấm để phóng to mã QR Zalo Thôn 6"
              >
                {/* ẢNH MÃ QR THÔN 6 */}
                <div className="relative w-18 h-18 sm:w-20 sm:h-20 bg-white rounded-xl p-1 shadow-inner border border-slate-200 shrink-0 overflow-hidden">
                  <img 
                    src="/qr_zalo_thon6.png" 
                    alt="Mã QR Zalo Cộng Đồng Thôn 6 Xã Di Linh" 
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://zalo.me/0943849295';
                    }}
                  />
                  <div className="absolute inset-0 bg-blue-600/15 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                    <span className="text-[10px] font-black bg-blue-600 text-white px-1.5 py-0.5 rounded shadow">Xem to</span>
                  </div>
                </div>

                {/* THÔNG TIN HƯỚNG DẪN QUÉT MÃ */}
                <div className="space-y-0.5 text-left">
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[10px] font-black uppercase tracking-tight">
                    <span>💬 ZALO THÔN 6</span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-black text-slate-900 leading-tight">
                    Quét Mã Tham Gia
                  </h4>
                  <p className="text-[11px] text-slate-600 font-medium leading-tight">
                    Cộng Đồng Thôn 6
                  </p>
                  <div className="text-[10px] text-blue-600 font-bold flex items-center gap-0.5 group-hover:underline pt-0.5">
                    <span>Chạm phóng to</span>
                    <span>🔍</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* DÒNG CHỮ LED ĐIỆN TỬ CHẠY Ở MÉP DƯỚI BANNER */}
        <LedTickerBar />
      </section>

      {/* 3. BỐ CỤC CHIA 2 CỘT PHÍA DƯỚI BANNER: SIDEBAR TRÁI & CARDS GRID PHẢI */}
      <div className="flex-1 max-w-7xl mx-auto w-full flex">
        
        {/* CỘT BÊN TRÁI: SIDEBAR MENU HÀNH ĐỘNG DỌC (6 THẺ MENU) */}
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

        {/* CỘT BÊN PHẢI: THANH TÌM KIẾM & CÁC THẺ CARDS */}
        <main id="main-content-section" className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 overflow-hidden scroll-mt-20">
          
          {/* SEARCH BAR & QUICK FILTERS TOOLBAR ĐƯỢC THIẾT KẾ KHOA HỌC & ĐỒNG BỘ */}
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            
            {/* HÀNG TRÊN: TÌM KIẾM THÔNG MINH & 2 CỔNG LIÊN KẾT CHÍNH THỐNG */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3.5">
              
              {/* SEARCH INPUT */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-4 top-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm: VNeID, Zalo, QR BHYT, dịch vụ công, cảnh báo lừa đảo..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/80 text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium transition placeholder:text-slate-400"
                />
              </div>

              {/* 2 CỔNG LIÊN KẾT CHÍNH THỐNG VỚI NÚT THIẾT KẾ TRANG TRỌNG */}
              <div className="flex items-center gap-2.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
                <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider hidden xl:inline-block shrink-0">
                  Cổng chính thống:
                </span>
                
                <a
                  href="https://www.binhdanhocvuso.gov.vn/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-red-600 via-amber-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-black text-xs shadow-xs hover:shadow-md transition shrink-0 whitespace-nowrap group cursor-pointer border border-white/20"
                  title="Mở Cổng Học Tập Bình Dân Học Vụ Số Quốc Gia (Bộ TT&TT)"
                >
                  <span className="text-sm">🇻🇳</span>
                  <span>Bình Dân Học Vụ Số</span>
                  <ExternalLink className="w-3.5 h-3.5 text-amber-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>

                <a
                  href="https://dilinh.lamdong.gov.vn/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-700 via-teal-700 to-emerald-700 hover:from-blue-800 hover:to-emerald-800 text-white font-black text-xs shadow-xs hover:shadow-md transition shrink-0 whitespace-nowrap group cursor-pointer border border-white/20"
                  title="Mở Cổng Thông Tin Điện Tử Huyện Di Linh (UBND Huyện Di Linh)"
                >
                  <span className="text-sm">🏛️</span>
                  <span>Cổng TTĐT Di Linh</span>
                  <ExternalLink className="w-3.5 h-3.5 text-cyan-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>
              </div>

            </div>

            {/* HÀNG DƯỚI: CÁC NÚT LỌC ĐỊNH DẠNG BÀI HỌC (ĐỒNG BỘ CHIỀU CAO & KHÔNG BỊ RỚT DÒNG) */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-2 border-t border-slate-100 scrollbar-none">
              <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider shrink-0 mr-1 hidden sm:inline-block">
                Định dạng:
              </span>

              {/* NÚT TẤT CẢ BÀI HỌC */}
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap shrink-0 cursor-pointer ${
                  activeTab === 'all'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Tất cả bài học</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${activeTab === 'all' ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  {resources.length}
                </span>
              </button>

              {/* NÚT VIDEO */}
              <button
                type="button"
                onClick={() => setActiveTab('video')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap shrink-0 cursor-pointer ${
                  activeTab === 'video'
                    ? 'bg-red-600 text-white shadow-md shadow-red-500/20'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                <span>Video Hướng Dẫn</span>
              </button>

              {/* NÚT INFOGRAPHIC */}
              <button
                type="button"
                onClick={() => setActiveTab('infographic')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap shrink-0 cursor-pointer ${
                  activeTab === 'infographic'
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-500/20'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Infographic Trực Quan</span>
              </button>

              {/* NÚT PODCAST */}
              <button
                type="button"
                onClick={() => setActiveTab('audio')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap shrink-0 cursor-pointer ${
                  activeTab === 'audio'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Podcast 2 Phút</span>
              </button>
            </div>

          </div>

          {/* CARDS DISPLAY AREA BELOW BANNER */}

          {/* 1. LEARNING RESOURCES CARDS (🎬 TÔI MUỐN HỌC) */}
          {(activeTab === 'all' || activeTab === 'video' || activeTab === 'infographic' || activeTab === 'audio' || activeTab === 'document' || activeTab === 'image') && (
            <section className="space-y-4">
              
              {/* CỤM BANNER NỔI BẬT: 2 CỔNG CHÍNH THỐNG */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* 1. BÌNH DÂN HỌC VỤ SỐ QUỐC GIA */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-red-600 via-amber-600 to-orange-600 text-white shadow-md flex flex-col justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-2xl shadow-inner shrink-0">
                      🇻🇳
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-black text-sm text-white">
                          Bình Dân Học Vụ Số
                        </h3>
                        <span className="bg-white/20 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase">
                          Quốc gia
                        </span>
                      </div>
                      <p className="text-xs text-amber-100 mt-1 leading-relaxed font-medium">
                        Phổ cập kỹ năng số toàn dân từ Bộ TT&TT – Học trực tuyến miễn phí cách dùng smartphone, an toàn mạng.
                      </p>
                    </div>
                  </div>
                  <a
                    href="https://www.binhdanhocvuso.gov.vn/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 rounded-xl bg-white text-red-700 hover:bg-amber-50 font-black text-xs shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Vào Học binhdanhocvuso.gov.vn</span>
                    <span>↗</span>
                  </a>
                </div>

                {/* 2. CỔNG TTĐT HUYỆN DI LINH */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-700 via-teal-700 to-emerald-700 text-white shadow-md flex flex-col justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-2xl shadow-inner shrink-0">
                      🏛️
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-black text-sm text-white">
                          Cổng TTĐT Huyện Di Linh
                        </h3>
                        <span className="bg-white/20 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase">
                          UBND Di Linh
                        </span>
                      </div>
                      <p className="text-xs text-blue-100 mt-1 leading-relaxed font-medium">
                        Trang thông tin chính thống: Tin chỉ đạo điều hành, nộp hồ sơ Dịch vụ công trực tuyến, tra cứu thủ tục.
                      </p>
                    </div>
                  </div>
                  <a
                    href="https://dilinh.lamdong.gov.vn/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 rounded-xl bg-white text-blue-800 hover:bg-blue-50 font-black text-xs shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Mở Cổng dilinh.lamdong.gov.vn</span>
                    <span>↗</span>
                  </a>
                </div>

              </div>

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

          {/* 2. BẢN TIN & THỜI SỰ: XÃ DI LINH – TỈNH LÂM ĐỒNG – CẢ NƯỚC (📰 TIN TỨC TỰ ĐỘNG CẬP NHẬT HÀNG NGÀY) */}
          {(activeTab === 'all' || activeTab === 'news') && (
            <section className="space-y-4 pt-4 border-t border-slate-200">
              
              {/* THANH TIÊU ĐỀ & NÚT LÀM MỚI TIN TỨC */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                      <span>📰 Bản Tin Thời Sự: Di Linh – Lâm Đồng – Cả Nước</span>
                      <span className="text-xs bg-amber-100 text-amber-900 font-black px-2.5 py-0.5 rounded-full">
                        {newsList.length} bản tin nóng
                      </span>
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5 flex items-center gap-1.5">
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Tự động cập nhật thời sự nóng nhất từ Xã Di Linh, Báo Lâm Đồng & Cổng TTĐT Quốc Gia</span>
                  </p>
                </div>

                {/* NÚT LÀM MỚI TIN TỨC */}
                <button
                  type="button"
                  onClick={handleRefreshNews}
                  disabled={isRefreshingNews}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200 shadow-xs transition shrink-0 cursor-pointer"
                  title="Cập nhật tin mới nhất ngay bây giờ"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-amber-600 ${isRefreshingNews ? 'animate-spin' : ''}`} />
                  <span>{isRefreshingNews ? 'Đang cập nhật...' : 'Làm mới tin tức'}</span>
                </button>
              </div>

              {/* WIDGET TIỆN ÍCH HÀNG NGÀY: THỜI TIẾT DI LINH & BẢNG GIÁ NÔNG SẢN CÀ PHÊ - SẦU RIÊNG */}
              <WeatherAgriWidget />

              {/* BỘ LỌC PHẠM VI & CHUYÊN MỤC TIN TỨC */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                <button
                  onClick={() => setNewsCategory('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${
                    newsCategory === 'all' 
                      ? 'bg-amber-600 text-white shadow-xs' 
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  Tất cả tin tức ({newsList.length})
                </button>
                <button
                  onClick={() => setNewsCategory('dilinh')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${
                    newsCategory === 'dilinh' 
                      ? 'bg-blue-600 text-white shadow-xs' 
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  🏛️ Xã Di Linh & Thôn 6
                </button>
                <button
                  onClick={() => setNewsCategory('lamdong')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${
                    newsCategory === 'lamdong' 
                      ? 'bg-teal-600 text-white shadow-xs' 
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  🌲 Tỉnh Lâm Đồng
                </button>
                <button
                  onClick={() => setNewsCategory('national')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${
                    newsCategory === 'national' 
                      ? 'bg-red-600 text-white shadow-xs' 
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  🇻🇳 Cả Nước
                </button>
                <button
                  onClick={() => setNewsCategory('agriculture')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${
                    newsCategory === 'agriculture' 
                      ? 'bg-emerald-600 text-white shadow-xs' 
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  ☕ Giá Cà phê & Nông sản
                </button>
                <button
                  onClick={() => setNewsCategory('security')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${
                    newsCategory === 'security' 
                      ? 'bg-rose-600 text-white shadow-xs' 
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  🚨 Cảnh Báo An Ninh
                </button>
              </div>

              {/* LƯỚI DANH SÁCH BÀI VIẾT TIN TỨC */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {newsList
                  .filter(news => {
                    if (newsCategory === 'all') return true;
                    if (newsCategory === 'dilinh') return news.scope === 'dilinh' || news.category?.includes('Di Linh') || news.category?.includes('Thôn');
                    if (newsCategory === 'lamdong') return news.scope === 'lamdong' || news.category?.includes('Lâm Đồng');
                    if (newsCategory === 'national') return news.scope === 'national' || news.category?.includes('Quốc Gia') || news.category?.includes('Chính Sách');
                    if (newsCategory === 'agriculture') return news.category?.includes('Nông Nghiệp');
                    if (newsCategory === 'security') return news.category?.includes('Cảnh Báo');
                    return true;
                  })
                  .map(news => (
                    <NewsCard 
                      key={news.id} 
                      news={news} 
                      onSelect={(item) => setSelectedNews(item)}
                    />
                  ))}
              </div>
            </section>
          )}

          {/* 3. COMMUNITY ACTIVITIES & SPREAD (🌱 HOẠT ĐỘNG LAN TỎA) */}
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
        resources={resources}
        onNavigate={handleAiNavigate}
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

      <KnowledgeAdminModal
        isOpen={isKnowledgeAdminOpen}
        onClose={() => setIsKnowledgeAdminOpen(false)}
      />

      <NewsDetailModal
        news={selectedNews}
        onClose={() => setSelectedNews(null)}
      />

      {/* CỤM STICKER NỔI GÓC MÀN HÌNH: ZALO 0943849295 & TRỢ LÝ AI */}
      <FloatingActionStickers
        onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
      />

      {/* MODAL PHÓNG TO MÃ QR ZALO THÔN 6 */}
      {isQrModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setIsQrModalOpen(false)}
        >
          <div 
            className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 text-center space-y-4 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* NÚT ĐÓNG */}
            <button
              onClick={() => setIsQrModalOpen(false)}
              className="absolute right-4 top-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-black cursor-pointer"
            >
              ✕
            </button>

            {/* TIÊU ĐỀ */}
            <div className="space-y-1 pt-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-black uppercase">
                💬 Zalo Cộng Đồng Số
              </span>
              <h3 className="text-xl font-black text-slate-900">
                Thôn 6 Xã Di Linh
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Mở ứng dụng Zalo trên điện thoại và quét mã QR dưới đây để tham gia nhóm cộng đồng:
              </p>
            </div>

            {/* ẢNH QR PHÓNG TO */}
            <div className="p-3 bg-slate-50 rounded-2xl border-2 border-dashed border-blue-300 flex justify-center">
              <img 
                src="/qr_zalo_thon6.png" 
                alt="Mã QR Zalo Thôn 6 Xã Di Linh" 
                className="w-56 h-56 object-contain rounded-xl shadow-sm"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://zalo.me/0943849295';
                }}
              />
            </div>

            {/* NÚT HÀNH ĐỘNG */}
            <div className="flex gap-2">
              <a
                href="https://zalo.me/0943849295"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Mở Zalo Trực Tiếp</span>
                <span>↗</span>
              </a>
              <button
                onClick={() => setIsQrModalOpen(false)}
                className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs transition cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
