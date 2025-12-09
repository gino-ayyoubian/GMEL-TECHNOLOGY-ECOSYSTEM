
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
import { Login } from './components/auth/Login';
import { TwoFactorAuth } from './components/auth/TwoFactorAuth';
import { NDAScreen } from './components/auth/NDAScreen';
import { PasswordReset } from './components/auth/PasswordReset';
import { GlobalErrorDisplay } from './components/shared/GlobalErrorDisplay';
import { ErrorBoundary } from './components/shared/ErrorBoundary';
import { GlobalSearch } from './components/shared/GlobalSearch';
import { AuditLogViewer } from './components/shared/AuditLogViewer';
import { UserManagement } from './components/admin/UserManagement';
import { KKM_LOGO_DATA_URL, REGION_THEME_MAP, ALL_REGIONS } from './constants';
import { useI18n, Language } from './hooks/useI18n';
import { Spinner } from './components/shared/Loading';
import { 
  LayoutDashboard, FileText, Activity, Globe, Map, Scale, 
  FlaskConical, PenTool, Lightbulb, Video, MessageSquare, 
  Menu, X, ShieldCheck, Mail, FileCode, Cpu, LogOut, ClipboardList, Lock, UserCog
} from 'lucide-react';
import { View, Region } from './types';
import { hasPermission } from './utils/permissions';
import { AuthService } from './services/authService';

export const LanguageSwitcher = () => {
    const { lang, setLang, supportedLangs } = useContext(AppContext)!;
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    const currentLangName = supportedLangs.find(l => l.code === lang)?.name.split(' ')[0] || 'English';

    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 transition-all text-sm font-medium backdrop-blur-md shadow-sm"
            >
                <Globe className="w-4 h-4" />
                <span>{currentLangName}</span>
            </button>
            
            {isOpen && (
                <div className="absolute end-0 mt-2 w-48 bg-slate-900/95 border border-white/10 rounded-lg shadow-2xl backdrop-blur-xl z-[100] overflow-hidden transform origin-top-end transition-all animate-pop-in">
                    {supportedLangs.map((l) => (
                        <button
                            key={l.code}
                            onClick={() => {
                                setLang(l.code);
                                setIsOpen(false);
                            }}
                            className={`w-full text-start px-4 py-3 text-sm hover:bg-white/5 transition-colors ${lang === l.code ? 'text-sky-400 font-semibold bg-white/5' : 'text-slate-400'}`}
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
       {/* Sophisticated Background */}
       <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,_#1e293b_0%,_#020617_40%)] z-0"></div>
       <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-0 mix-blend-overlay"></div>
       
       <div className="absolute top-6 end-6 z-20">
           <LanguageSwitcher />
       </div>

       <div className="z-10 w-full max-w-md relative animate-pop-in">
          <div className="flex justify-center mb-10">
              <div className="bg-white/5 p-5 rounded-2xl backdrop-blur-2xl border border-white/10 shadow-[0_0_40px_-10px_rgba(14,165,233,0.3)]">
                  <img src={KKM_LOGO_DATA_URL} alt="KKM Logo" className="h-16 w-auto drop-shadow-lg" />
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
    
    const isActive = activeView === view;
    
    return (
        <button
            onClick={() => setActiveView(view)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group ${
                isActive
                ? 'bg-gradient-to-r from-sky-600/20 to-sky-400/5 text-sky-400 border border-sky-500/30 shadow-[0_0_15px_-3px_rgba(14,165,233,0.2)]' 
                : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent'
            }`}
        >
            <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 rtl:rotate-180 ${isActive ? 'text-sky-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
            <span className={`font-medium text-sm ${isActive ? 'font-semibold' : ''}`}>{label}</span>
            {isActive && <div className="ms-auto w-1.5 h-1.5 rounded-full bg-sky-400 shadow-[0_0_8px_2px_rgba(56,189,248,0.6)]"></div>}
        </button>
    );
};

const MainAppLayout = () => {
    const { activeView, setActiveView, region, setRegion, currentUser, userRole, setCurrentUser, setUserRole, setAuthStep, allowedRegions, lang, sessionToken, setSessionToken, setAllowedRegions, setError } = useContext(AppContext)!;
    const { t } = useI18n();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        if (sessionToken) {
            AuthService.logout(sessionToken);
        }
        setSessionToken(null);
        setCurrentUser(null);
        setUserRole(null);
        setAllowedRegions(null);
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
            { view: 'user_management', label: 'User Management', icon: UserCog },
            { view: 'access_control', label: t('nav_access_control'), icon: ShieldCheck },
            { view: 'contact', label: t('contact_us'), icon: MessageSquare },
        ] }
    ];

    const availableRegions: Region[] = allowedRegions || ALL_REGIONS;
    const isRtl = lang === 'fa' || lang === 'ar' || lang === 'ku';
    const isViewAllowed = hasPermission(userRole, activeView);

    return (
        <div className="flex h-screen bg-[#020617] text-slate-100 overflow-hidden font-sans relative" dir={isRtl ? 'rtl' : 'ltr'}>
            
            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 bg-black/80 z-[60] lg:hidden backdrop-blur-sm transition-opacity" onClick={() => setIsMobileMenuOpen(false)} />
            )}

            {/* Sidebar */}
            <aside className={`fixed lg:static inset-y-0 start-0 z-[70] w-72 bg-slate-900/90 backdrop-blur-xl border-e border-white/5 transform transition-transform duration-300 lg:transform-none ${isMobileMenuOpen ? 'translate-x-0' : (isRtl ? 'translate-x-full' : '-translate-x-full')} flex flex-col shadow-2xl`}>
                <div className="p-6 border-b border-white/5 bg-gradient-to-b from-slate-800/50 to-transparent">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/5 p-2 rounded-xl border border-white/10 shadow-inner">
                            <img src={KKM_LOGO_DATA_URL} alt="KKM" className="h-8 w-auto" />
                        </div>
                        <div>
                            <h1 className="font-bold text-white tracking-tight leading-none text-lg">GMEL Vision</h1>
                            <p className="text-[10px] text-sky-400 font-mono mt-1 opacity-80">Rev 2.0 // Enterprise</p>
                        </div>
                    </div>
                    <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden absolute top-6 end-4 text-slate-400 hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8 scrollbar-thin scrollbar-thumb-slate-700/50 scrollbar-track-transparent">
                    {navigation.map((group, idx) => {
                        const accessibleItems = group.items.filter(item => hasPermission(userRole, item.view as View));
                        if (accessibleItems.length === 0) return null;

                        return (
                            <div key={idx}>
                                {group.group !== 'Overview' && (
                                    <h3 className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 select-none">
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

                <div className="p-4 border-t border-white/5 bg-slate-900/50">
                    <div className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-xl mb-3 border border-white/5 shadow-sm">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-lg ring-2 ring-white/10">
                            {currentUser?.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-medium text-white truncate">{currentUser}</p>
                            <p className="text-xs text-slate-400 capitalize flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                {userRole}
                            </p>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors group">
                        <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-1 rtl:group-hover:translate-x-1" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative z-10">
                {/* Header */}
                <header className="h-16 border-b border-white/5 bg-slate-900/60 backdrop-blur-md flex items-center justify-between px-6 z-30 sticky top-0">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden text-slate-400 hover:text-white transition-colors">
                            <Menu className="w-6 h-6" />
                        </button>
                        <GlobalSearch />
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <LanguageSwitcher />
                        <div className="h-6 w-px bg-white/10"></div>
                        <div className="relative">
                            <select 
                                value={region} 
                                onChange={(e) => setRegion(e.target.value as Region)} 
                                className="appearance-none bg-white/5 border border-white/10 text-sm text-slate-300 font-medium rounded-lg hover:bg-white/10 hover:border-white/20 focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50 cursor-pointer py-2 ps-3 pe-8 backdrop-blur-sm transition-all shadow-sm max-w-[200px] truncate"
                            >
                                {availableRegions.map(r => <option key={r} value={r} className="bg-slate-900">{r}</option>)}
                            </select>
                            <div className="absolute inset-y-0 end-0 flex items-center px-2 pointer-events-none text-slate-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <main className="flex-1 overflow-auto p-6 lg:p-8 scroll-smooth scrollbar-thin scrollbar-thumb-slate-700/30" id="main-content" key={lang}>
                    <div className="max-w-7xl mx-auto space-y-8 pb-20 animate-fade-in">
                        {!isViewAllowed ? (
                            <div className="flex flex-col items-center justify-center h-[60vh] text-slate-500">
                                <div className="p-6 bg-slate-900/50 rounded-full mb-6 border border-white/5 shadow-2xl">
                                    <Lock className="w-16 h-16 text-slate-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-2">Access Restricted</h2>
                                <p className="text-slate-400 text-center max-w-md">
                                    Your current role ({userRole}) does not have permission to view this section. 
                                    Please contact an administrator if you believe this is an error.
                                </p>
                            </div>
                        ) : (
                            <>
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
                                {activeView === 'user_management' && <UserManagement />}
                                {activeView === 'contact' && (
                                    <div className="bg-slate-800/60 backdrop-blur-xl p-8 rounded-2xl border border-white/10 shadow-xl">
                                        <h2 className="text-2xl font-bold text-white mb-6">{t('contact_title')}</h2>
                                        <p className="text-slate-400 mb-8 max-w-2xl">{t('contact_description')}</p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-4">
                                                <h3 className="text-lg font-semibold text-sky-400">{t('direct_contact_info')}</h3>
                                                <div className="p-5 bg-white/5 border border-white/5 rounded-xl hover:border-white/10 transition-colors">
                                                    <p className="text-slate-400 text-xs uppercase tracking-wide mb-1">{t('contact_phone')}</p>
                                                    <p className="text-white font-mono text-lg" dir="ltr">+98 21 2842 4430</p>
                                                </div>
                                                <div className="p-5 bg-white/5 border border-white/5 rounded-xl hover:border-white/10 transition-colors">
                                                    <p className="text-slate-400 text-xs uppercase tracking-wide mb-1">{t('contact_direct_email')}</p>
                                                    <div className="space-y-1">
                                                        <p className="text-white font-mono text-sm">INFO@KKM-INTL.ORG</p>
                                                        <p className="text-white font-mono text-sm">G.AYYOUBIAN@KKM-INTL.ORG</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <h3 className="text-lg font-semibold text-sky-400">Social & Web</h3>
                                                <div className="space-y-3">
                                                    <a href="https://www.linkedin.com/company/kkm-intl-co" target="_blank" rel="noopener noreferrer" className="block p-4 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 hover:border-sky-500/30 transition-all group">
                                                        <div className="flex items-center justify-between">
                                                            <p className="text-white font-medium">KKM International (LinkedIn)</p>
                                                            <svg className="w-5 h-5 text-slate-500 group-hover:text-sky-400 transition-colors rtl:rotate-180" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                                                        </div>
                                                    </a>
                                                    <a href="https://www.linkedin.com/company/GINO-AYYOUBIAN" target="_blank" rel="noopener noreferrer" className="block p-4 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 hover:border-sky-500/30 transition-all group">
                                                        <div className="flex items-center justify-between">
                                                            <p className="text-white font-medium">GINO.AYYOUBIAN (LinkedIn)</p>
                                                            <svg className="w-5 h-5 text-slate-500 group-hover:text-sky-400 transition-colors rtl:rotate-180" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                                                        </div>
                                                    </a>
                                                    <a href="https://t.me/kkm_intl" target="_blank" rel="noopener noreferrer" className="block p-4 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 hover:border-sky-500/30 transition-all group">
                                                        <div className="flex items-center justify-between">
                                                            <p className="text-white font-medium">Telegram Channel (@kkm_intl)</p>
                                                            <svg className="w-5 h-5 text-slate-500 group-hover:text-sky-400 transition-colors rtl:rotate-180" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                                                        </div>
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

const AppContent = () => {
    const { authStep } = useContext(AppContext)!;
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
