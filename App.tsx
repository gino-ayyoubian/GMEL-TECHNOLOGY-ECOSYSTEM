
import React, { useState, useContext, useEffect, useRef } from 'react';
import { AppContext, AppContextProvider } from './contexts/AppContext';
import { Dashboard } from './components/Dashboard';
import { IPRoadmap } from './components/IPRoadmap';
import { Financials } from './components/Financials';
import { Technical } from './components/Technical';
import { Benchmark } from './components/Benchmark';
import { SiteAnalysis } from './components/SiteAnalysis';
import { Comparison } from './components/Comparison';
import { TechComparison } from './components/TechComparison';
import { Simulations } from './components/Simulations';
import { StrategyModeler } from './components/StrategyModeler';
import { Correspondence } from './components/Correspondence';
import { ProposalGenerator } from './components/ProposalGenerator';
import { ImageGenerator } from './components/ImageGenerator';
import { VideoGenerator } from './components/VideoGenerator';
import { GeminiChat } from './components/GeminiChat';
import { Login } from './components/auth/Login';
import { TwoFactorAuth } from './components/auth/TwoFactorAuth';
import { NDAScreen } from './components/auth/NDAScreen';
import { PasswordReset } from './components/auth/PasswordReset';
import { GlobalErrorDisplay } from './components/shared/GlobalErrorDisplay';
import { ErrorBoundary } from './components/shared/ErrorBoundary';
import { GlobalSearch } from './components/shared/GlobalSearch';
import { AuditLogViewer } from './components/shared/AuditLogViewer';
import { KKM_LOGO_DATA_URL, REGION_THEME_MAP } from './constants';
import { useI18n, Language } from './hooks/useI18n';
import { 
  LayoutDashboard, FileText, Activity, Globe, Map, Scale, 
  FlaskConical, PenTool, Lightbulb, Video, MessageSquare, 
  Menu, X, ShieldCheck, Mail, FileCode, Cpu, LogOut, ClipboardList
} from 'lucide-react';
import { View, Region } from './types';
import { hasPermission } from './utils/permissions';

const LanguageSwitcher = () => {
    const { lang, setLang, supportedLangs } = useContext(AppContext)!;
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const currentLangName = supportedLangs.find(l => l.code === lang)?.name.split(' ')[0] || 'English';

    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors text-sm font-medium"
            >
                <Globe className="w-4 h-4" />
                <span>{currentLangName}</span>
            </button>
            
            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden">
                    {supportedLangs.map((l) => (
                        <button
                            key={l.code}
                            onClick={() => {
                                setLang(l.code);
                                setIsOpen(false);
                            }}
                            className={`w-full text-left px-4 py-3 text-sm hover:bg-slate-700 transition-colors ${lang === l.code ? 'bg-slate-700/50 text-white font-semibold' : 'text-slate-400'}`}
                        >
                            {l.name}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

const AuthScreen = () => {
  const { authStep } = useContext(AppContext)!;
  
  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans`} style={{ backgroundColor: '#020617' }}>
       <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#020617] to-black z-0"></div>
       <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-0 mix-blend-overlay"></div>
       
       <div className="z-10 w-full max-w-md relative animate-fade-in">
          <div className="flex justify-center mb-8">
              <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/20 shadow-2xl">
                  <img src={KKM_LOGO_DATA_URL} alt="KKM Logo" className="h-16 w-auto" />
              </div>
          </div>

          <div className="auth-step-container">
            {authStep === 'login' && <Login />}
            {authStep === '2fa' && <TwoFactorAuth />}
            {authStep === 'nda' && <NDAScreen />}
            {authStep === 'resetPassword' && <PasswordReset />}
          </div>
       </div>
    </div>
  );
};

const SidebarItem = ({ view, label, icon: Icon, activeView, setActiveView, hasAccess }: any) => {
    if (!hasAccess) return null;
    
    return (
        <button
            onClick={() => setActiveView(view)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                activeView === view 
                ? 'bg-slate-800 text-white shadow-lg border border-slate-700/50' 
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
            }`}
        >
            <Icon className={`w-5 h-5 ${activeView === view ? 'text-sky-400' : ''}`} />
            <span className="font-medium text-sm">{label}</span>
        </button>
    );
};

const MainAppLayout = () => {
    const { activeView, setActiveView, region, setRegion, currentUser, userRole, setCurrentUser, setUserRole, setAuthStep, allowedRegions, theme } = useContext(AppContext)!;
    const { t } = useI18n();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);

    const handleLogout = () => {
        setCurrentUser(null);
        setUserRole(null);
        setAuthStep('login');
    };

    const navigation = [
        { group: 'Overview', items: [
            { view: 'dashboard', label: t('nav_dashboard'), icon: LayoutDashboard },
        ]},
        { group: t('nav_group_analysis'), items: [
            { view: 'ip', label: t('nav_ip'), icon: FileCode },
            { view: 'technical', label: t('nav_technical'), icon: Cpu },
            { view: 'financials', label: t('nav_financials'), icon: Activity },
            { view: 'benchmark', label: t('nav_benchmark'), icon: Globe },
            { view: 'site', label: t('nav_site'), icon: Map },
            { view: 'comparison', label: t('nav_comparison'), icon: Scale },
            { view: 'tech_comparison', label: t('nav_tech_comparison'), icon: FlaskConical },
        ]},
        { group: t('nav_group_strategic'), items: [
            { view: 'simulations', label: t('nav_simulations'), icon: Lightbulb },
            { view: 'strategy_modeler', label: t('nav_strategy_modeler'), icon: PenTool },
        ]},
        { group: t('nav_group_generative'), items: [
            { view: 'image', label: t('nav_concept'), icon: PenTool },
            { view: 'video', label: t('nav_video_generator'), icon: Video },
        ]},
        { group: t('nav_group_official'), items: [
            { view: 'proposal_generator', label: t('nav_proposal_generator'), icon: FileText },
            { view: 'correspondence', label: t('nav_correspondence'), icon: Mail },
            { view: 'audit_logs', label: t('nav_audit_logs'), icon: ClipboardList },
            { view: 'access_control', label: t('nav_access_control'), icon: ShieldCheck },
            { view: 'contact', label: t('contact_us'), icon: MessageSquare },
        ]}
    ];

    const availableRegions: Region[] = allowedRegions || [
        'Qeshm Free Zone', 'Makoo Free Zone', 'Chabahar Free Zone', 
        'Iranian Kurdistan', 'Mahabad', 'Kurdistan Region, Iraq', 
        'Oman', 'Saudi Arabia', 'United Arab Emirates', 'Qatar'
    ];

    return (
        <div className="flex h-screen bg-slate-900 text-slate-100 overflow-hidden font-sans">
            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
            )}

            {/* Sidebar */}
            <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800 transform transition-transform duration-300 lg:transform-none ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}>
                <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/10 p-2 rounded-lg">
                            <img src={KKM_LOGO_DATA_URL} alt="KKM" className="h-8 w-auto" />
                        </div>
                        <div>
                            <h1 className="font-bold text-white tracking-tight">GMEL Vision</h1>
                            <p className="text-xs text-slate-500 font-mono">Rev 2.0</p>
                        </div>
                    </div>
                    <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden text-slate-400">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8 scrollbar-thin scrollbar-thumb-slate-700">
                    {navigation.map((group, idx) => {
                        const accessibleItems = group.items.filter(item => hasPermission(userRole, item.view as View));
                        if (accessibleItems.length === 0) return null;

                        return (
                            <div key={idx}>
                                {group.group !== 'Overview' && (
                                    <h3 className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                                        {group.group}
                                    </h3>
                                )}
                                <div className="space-y-1">
                                    {accessibleItems.map(item => (
                                        <SidebarItem 
                                            key={item.view}
                                            {...item}
                                            activeView={activeView}
                                            setActiveView={(v: View) => {
                                                setActiveView(v);
                                                setIsMobileMenuOpen(false);
                                            }}
                                            hasAccess={true}
                                        />
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="p-4 border-t border-slate-800">
                    <div className="flex items-center gap-3 px-4 py-3 bg-slate-800/50 rounded-lg mb-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-500 flex items-center justify-center text-white font-bold text-xs">
                            {currentUser?.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-medium text-white truncate">{currentUser}</p>
                            <p className="text-xs text-slate-500 capitalize">{userRole}</p>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                {/* Header */}
                <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md flex items-center justify-between px-6 z-10">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden text-slate-400 hover:text-white">
                            <Menu className="w-6 h-6" />
                        </button>
                        <GlobalSearch />
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <LanguageSwitcher />
                        <div className="h-6 w-px bg-slate-800"></div>
                        <select 
                            value={region} 
                            onChange={(e) => setRegion(e.target.value as Region)} 
                            className="bg-slate-800 border-none text-sm text-slate-300 font-medium rounded-lg focus:ring-0 cursor-pointer py-2 pl-3 pr-8"
                        >
                            {availableRegions.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </div>
                </header>

                {/* Content Area */}
                <main className="flex-1 overflow-auto p-6 lg:p-8 scroll-smooth" id="main-content">
                    <div className="max-w-7xl mx-auto space-y-8 pb-20">
                        {activeView === 'dashboard' && <Dashboard />}
                        {activeView === 'ip' && <IPRoadmap />}
                        {activeView === 'financials' && <Financials />}
                        {activeView === 'technical' && <Technical />}
                        {activeView === 'benchmark' && <Benchmark />}
                        {activeView === 'site' && <SiteAnalysis />}
                        {activeView === 'comparison' && <Comparison />}
                        {activeView === 'tech_comparison' && <TechComparison />}
                        {activeView === 'simulations' && <Simulations />}
                        {activeView === 'strategy_modeler' && <StrategyModeler />}
                        {activeView === 'correspondence' && <Correspondence />}
                        {activeView === 'proposal_generator' && <ProposalGenerator />}
                        {activeView === 'image' && <ImageGenerator />}
                        {activeView === 'video' && <VideoGenerator />}
                        {activeView === 'access_control' && <NDAScreen />}
                        {activeView === 'audit_logs' && <AuditLogViewer />}
                        {activeView === 'chat' && <GeminiChat activeView={activeView} />}
                        {activeView === 'contact' && (
                            <div className="bg-slate-800 p-8 rounded-lg border border-slate-700">
                                <h2 className="text-2xl font-bold text-white mb-6">{t('contact_title')}</h2>
                                <p className="text-slate-400 mb-8">{t('contact_description')}</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold text-sky-400">{t('direct_contact_info')}</h3>
                                        <div className="p-4 bg-slate-900 rounded-lg">
                                            <p className="text-slate-400 text-sm">{t('contact_phone')}</p>
                                            <p className="text-white font-mono">+98 912 345 6789</p>
                                        </div>
                                        <div className="p-4 bg-slate-900 rounded-lg">
                                            <p className="text-slate-400 text-sm">{t('contact_direct_email')}</p>
                                            <p className="text-white font-mono">gino.ayyoubian@kkm-intl.xyz</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold text-sky-400">Social & Web</h3>
                                        <a href="#" className="block p-4 bg-slate-900 rounded-lg hover:bg-slate-700 transition-colors">
                                            <p className="text-white font-medium">{t('contact_gino_linkedin')}</p>
                                        </a>
                                        <a href="#" className="block p-4 bg-slate-900 rounded-lg hover:bg-slate-700 transition-colors">
                                            <p className="text-white font-medium">{t('contact_kkm_linkedin')}</p>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </main>

                {/* Chat Widget Toggle */}
                <div className="absolute bottom-6 right-6 z-30">
                    <button 
                        onClick={() => setIsChatOpen(!isChatOpen)}
                        className={`p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 ${isChatOpen ? 'bg-red-500 rotate-45' : 'bg-sky-600'}`}
                    >
                        {isChatOpen ? <X className="text-white" /> : <MessageSquare className="text-white" />}
                    </button>
                </div>

                {/* Floating Chat Window */}
                <div className={`absolute bottom-24 right-6 w-96 h-[600px] bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 transform transition-all duration-300 origin-bottom-right z-20 ${isChatOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}>
                    <GeminiChat activeView={activeView} onClose={() => setIsChatOpen(false)} />
                </div>
            </div>
        </div>
    );
};

const AppContent = () => {
    const { authStep } = useContext(AppContext)!;
    // Skip 'language' step (welcome page) logic is handled by setting default state in context, 
    // but just in case, we render AuthScreen for all auth steps.
    return authStep === 'granted' ? <MainAppLayout /> : <AuthScreen />;
}

const AppWrapper = () => (
    <ErrorBoundary>
        <AppContextProvider>
            <AppContent />
            <GlobalErrorDisplay />
        </AppContextProvider>
    </ErrorBoundary>
);

export default AppWrapper;
