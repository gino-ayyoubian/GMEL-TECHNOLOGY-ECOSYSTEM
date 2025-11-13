import React, { useState, useContext } from 'react';
import { AppContextProvider, AppContext } from './contexts/AppContext';
import { useI18n, Language } from './hooks/useI18n';
import { hasPermission } from './utils/permissions';

// Auth Components
import { LanguageSelection } from './components/auth/LanguageSelection';
import { Login } from './components/auth/Login';
import { TwoFactorAuth } from './components/auth/TwoFactorAuth';
import { NDAScreen } from './components/auth/NDAScreen';

// Main App Components
import { Dashboard } from './components/Dashboard';
import { IPRoadmap } from './components/IPRoadmap';
import { Financials } from './components/Financials';
import { GeminiChat } from './components/GeminiChat';
import { Technical } from './components/Technical';
import { Benchmark } from './components/Benchmark';
import { ImageGenerator } from './components/ImageGenerator';
import { SiteAnalysis } from './components/SiteAnalysis';
import { Comparison } from './components/Comparison';
import { Correspondence } from './components/Correspondence';
import { VideoGenerator } from './components/VideoGenerator';
import { TechComparison } from './components/TechComparison';
import { Simulations } from './components/Simulations';
import { StrategyModeler } from './components/StrategyModeler';
import { ProposalGenerator } from './components/ProposalGenerator';
import { Region, View } from './types';
import { KKM_LOGO_DATA_URL } from './constants';
import * as en from './i18n/en';
import { GlobalSearch } from './components/shared/GlobalSearch';

// --- INQUIRIES & CONTRIBUTIONS COMPONENT ---
const InquiriesAndContributions: React.FC = () => {
    const { t } = useI18n();

    const ContactCard: React.FC<{ href: string; icon: React.ReactNode; title: string; detail: string }> = ({ href, icon, title, detail }) => (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-slate-800 p-6 rounded-lg border border-slate-700 flex items-center gap-4 transition-all duration-300 ease-in-out hover:scale-105 hover:bg-slate-700/50 hover:border-sky-500"
        >
            <div className="p-3 bg-slate-700 rounded-full group-hover:bg-sky-500/20 transition-colors">
                {icon}
            </div>
            <div>
                <h4 className="font-semibold text-white group-hover:text-sky-400 transition-colors">{title}</h4>
                <p className="text-sm text-slate-400">{detail}</p>
            </div>
        </a>
    );

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-white">{t('contact_title')}</h1>
            <p className="text-slate-400 max-w-3xl">{t('contact_description')}</p>
            <div className="mt-8">
                <h2 className="text-2xl font-bold text-white mb-6 text-center">{t('direct_contact_info')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                    <ContactCard 
                        href="tel:+982128424630" 
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-300 group-hover:text-sky-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>}
                        title={t('contact_phone')}
                        detail="+98 21 2842 4630"
                    />
                     <ContactCard 
                        href="https://www.linkedin.com/in/gino-ayyoubian" 
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-300 group-hover:text-sky-400 transition-colors" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>}
                        title={t('contact_gino_linkedin')}
                        detail="linkedin.com/in/gino-ayyoubian"
                    />
                     <ContactCard 
                        href="https://www.linkedin.com/company/kkm-intl-co/" 
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-300 group-hover:text-sky-400 transition-colors" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>}
                        title={t('contact_kkm_linkedin')}
                        detail="linkedin.com/company/kkm-intl-co"
                    />
                     <ContactCard 
                        href="mailto:info@kkm-intl.org" 
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-300 group-hover:text-sky-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
                        title={t('contact_general_email')}
                        detail="info@kkm-intl.org"
                    />
                    <ContactCard 
                        href="mailto:g.ayyoubian@kkm-intl.org" 
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-300 group-hover:text-sky-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" /></svg>}
                        title={t('contact_direct_email')}
                        detail="g.ayyoubian@kkm-intl.org"
                    />
                    <ContactCard 
                        href="mailto:g.ayyoubian@kkm-intl.org?subject=Technical/IP Inquiry regarding GMEL Project" 
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-300 group-hover:text-sky-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V7.618a1 1 0 01.553-.894L9 4l5.447 2.724A1 1 0 0115 7.618v8.764a1 1 0 01-.553.894L9 20z" /><path d="M9 12l6-3" /></svg>}
                        title={t('contact_technical_ip')}
                        detail="g.ayyoubian@kkm-intl.org"
                    />
                </div>
            </div>
        </div>
    );
}


// --- KKM LOGO COMPONENT ---
const KkmLogo = ({ className = 'h-12 w-auto' }: { className?: string }) => (
    <img src={KKM_LOGO_DATA_URL} alt="KKM International Logo" className={className} />
);

// --- MAIN APP LAYOUT (shown after successful login) ---
const MainAppLayout: React.FC = () => {
    const { activeView, setActiveView, region, setRegion, lang, userRole, allowedRegions } = useContext(AppContext)!;
    const { t } = useI18n();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const isRtl = lang === 'fa' || lang === 'ar' || lang === 'ku';

    const NavItem = ({ view, labelKey, icon }: { view: View; labelKey: keyof typeof en; icon: React.ReactNode }) => (
        <button
            onClick={() => {
                setActiveView(view);
                setIsSidebarOpen(false);
            }}
            aria-label={t(labelKey)}
            className={`flex items-center w-full px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${activeView === view
                    ? 'bg-amber-600 text-white'
                    : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                }`}
        >
            {icon}
            <span className={isRtl ? "mr-3" : "ml-3"}>{t(labelKey)}</span>
        </button>
    );

    const NavGroup: React.FC<{ titleKey: keyof typeof en; children: React.ReactNode }> = ({ titleKey, children }) => {
        const [isOpen, setIsOpen] = useState(true);
        const childrenArray = React.Children.toArray(children);
        if (childrenArray.every(child => child === null)) {
            return null; // Don't render group if all children are hidden
        }
        return (
            <div className="mt-4 first:mt-0">
                <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between px-3 mb-2 text-xs font-semibold uppercase text-slate-500 tracking-wider hover:text-slate-400 transition-colors">
                    <span>{t(titleKey)}</span>
                    <svg className={`w-4 h-4 transform transition-transform ${isOpen ? 'rotate-180' : 'rotate-0'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
                {isOpen && <div className="space-y-1">{children}</div>}
            </div>
        )
    };

    const renderView = () => {
        if (!hasPermission(userRole, activeView)) {
            return (
                <div className="text-center text-slate-400">
                    <h2 className="text-2xl font-bold">Access Denied</h2>
                    <p>Your user role does not have permission to view this module.</p>
                </div>
            );
        }

        switch (activeView) {
            case 'dashboard': return <Dashboard />;
            case 'ip': return <IPRoadmap />;
            case 'financials': return <Financials />;
            case 'technical': return <Technical />;
            case 'benchmark': return <Benchmark />;
            case 'site': return <SiteAnalysis />;
            case 'comparison': return <Comparison />;
            case 'tech_comparison': return <TechComparison />;
            case 'simulations': return <Simulations />;
            case 'strategy_modeler': return <StrategyModeler />;
            case 'correspondence': return <Correspondence />;
            case 'contact': return <InquiriesAndContributions />;
            case 'proposal_generator': return <ProposalGenerator />;
            case 'image': return <ImageGenerator />;
            case 'video': return <VideoGenerator />;
            case 'chat': return <GeminiChat activeView={activeView} />;
            default: return <Dashboard />;
        }
    };
    
    const sidebarContent = (
        <>
            <div className="flex items-center mb-6">
                <div className="p-1 bg-white rounded-lg">
                    <KkmLogo className="h-12 w-auto" />
                </div>
                <h1 className={isRtl ? "mx-3 text-xl font-bold text-white" : "ml-3 text-xl font-bold text-white"}>{t('app_title')}</h1>
            </div>
            <nav className="flex-grow space-y-1 overflow-y-auto pr-1">
                <NavGroup titleKey="nav_group_analysis">
                    {hasPermission(userRole, 'dashboard') && <NavItem view="dashboard" labelKey="nav_dashboard" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>} />}
                    {hasPermission(userRole, 'ip') && <NavItem view="ip" labelKey="nav_ip" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V7.618a1 1 0 01.553-.894L9 4l5.447 2.724A1 1 0 0115 7.618v8.764a1 1 0 01-.553.894L9 20z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l5.447-2.724A1 1 0 0115 7.618" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12V4" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.553 6.724L9 12" /></svg>} />}
                    {hasPermission(userRole, 'technical') && <NavItem view="technical" labelKey="nav_technical" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 16v-2m0-8v-2m-8 4h2m16 0h-2m-7-7l1.414-1.414M5.636 5.636L7.05 7.05m12.728 9.9L16.95 16.95M5.636 18.364l1.414-1.414m11.314-11.314l-1.414 1.414" /></svg>} />}
                    {hasPermission(userRole, 'financials') && <NavItem view="financials" labelKey="nav_financials" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>} />}
                </NavGroup>
                <NavGroup titleKey="nav_group_strategic">
                    {hasPermission(userRole, 'tech_comparison') && <NavItem view="tech_comparison" labelKey="nav_tech_comparison" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>} />}
                    {hasPermission(userRole, 'benchmark') && <NavItem view="benchmark" labelKey="nav_benchmark" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2h10a2 2 0 002-2v-1a2 2 0 012-2h1.945M7.737 10.512l3.428-3.428a.5.5 0 01.707 0l3.429 3.428m-11.314 0l3.428 3.428a.5.5 0 00.707 0l3.429-3.428" /></svg>} />}
                    {hasPermission(userRole, 'site') && <NavItem view="site" labelKey="nav_site" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>} />}
                    {hasPermission(userRole, 'comparison') && <NavItem view="comparison" labelKey="nav_comparison" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>} />}
                    {hasPermission(userRole, 'simulations') && <NavItem view="simulations" labelKey="nav_simulations" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>} />}
                    {hasPermission(userRole, 'strategy_modeler') && <NavItem view="strategy_modeler" labelKey="nav_strategy_modeler" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2 1M4 7l2-1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" /></svg>} />}
                </NavGroup>
                <NavGroup titleKey="nav_group_generative">
                    {hasPermission(userRole, 'image') && <NavItem view="image" labelKey="nav_concept" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} />}
                    {hasPermission(userRole, 'video') && <NavItem view="video" labelKey="nav_video_generator" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>} />}
                </NavGroup>
                <NavGroup titleKey="nav_group_official">
                    {hasPermission(userRole, 'proposal_generator') && <NavItem view="proposal_generator" labelKey="nav_proposal_generator" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>} />}
                    {hasPermission(userRole, 'correspondence') && <NavItem view="correspondence" labelKey="nav_correspondence" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>} />}
                </NavGroup>
            </nav>
            <div className="mt-auto space-y-2">
                <button
                    onClick={() => {
                        setActiveView('contact');
                        setIsSidebarOpen(false);
                    }}
                    aria-label={t('contact_us')}
                    className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg text-slate-400 hover:bg-slate-700/50 hover:text-white transition-colors`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                    <span className={isRtl ? "mr-3" : "ml-3"}>{t('contact_us')}</span>
                </button>
            </div>
        </>
    );

    const ALL_REGIONS: Region[] = ['Qeshm Free Zone', 'Makoo Free Zone', 'Chabahar Free Zone', 'Iranian Kurdistan', 'Mahabad', 'Kurdistan Region, Iraq', 'Oman', 'Saudi Arabia', 'United Arab Emirates', 'Qatar'];
    const displayRegions = allowedRegions || ALL_REGIONS;

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100" dir={isRtl ? 'rtl' : 'ltr'}>
            
            {/* Overlay for mobile */}
            {isSidebarOpen && <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black/60 z-30 lg:hidden"></div>}

            {/* Sidebar */}
            <aside className={`fixed inset-y-0 ${isRtl ? 'right-0 border-l' : 'left-0 border-r'} z-40 w-64 bg-slate-800 p-4 border-slate-700 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : (isRtl ? 'translate-x-full' : '-translate-x-full')}`}>
                {sidebarContent}
            </aside>
            
            <main className={`flex-1 p-4 sm:p-8 flex flex-col min-h-screen ${isRtl ? 'lg:mr-64' : 'lg:ml-64'}`}>
                <header className="flex-shrink-0 mb-4 sm:mb-8">
                    <div className="flex justify-between items-center gap-6">
                        <div className="flex items-center gap-2">
                             <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 rounded-md text-slate-400 hover:bg-slate-700 lg:hidden">
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                             </button>
                            <div className="p-1 bg-white rounded-lg hidden sm:block">
                                <KkmLogo className="h-12 w-auto" />
                            </div>
                            <h1 className="text-lg sm:text-xl font-bold text-white whitespace-nowrap hidden md:block">GeoMeta Energy Layer</h1>
                        </div>
                        <div className="flex-grow min-w-0 px-4">
                            <GlobalSearch />
                        </div>
                        <div className="items-center hidden md:flex">
                            <label htmlFor="region-select" className={`text-sm font-medium text-slate-400 ${isRtl ? 'ml-3' : 'mr-3'}`}>{t('proposal_for')}</label>
                            <select
                                id="region-select"
                                value={region}
                                onChange={(e) => setRegion(e.target.value as Region)}
                                className="bg-slate-700 border-slate-600 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 text-sm text-white font-semibold"
                            >
                                {displayRegions.map(r => (
                                    <option key={r} value={r}>{r}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </header>
                <div className="flex-grow">
                    {renderView()}
                </div>
                <Footer />
            </main>

            {/* Chat Feature */}
            {hasPermission(userRole, 'chat') && (
                <>
                    {!isChatOpen && (
                        <button
                            onClick={() => setIsChatOpen(true)}
                            className={`fixed bottom-8 ${isRtl ? 'left-8' : 'right-8'} bg-sky-600 hover:bg-sky-700 text-white p-4 rounded-full shadow-lg z-50 transition-transform hover:scale-110 animate-pop-in`}
                            aria-label={t('nav_assistant')}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.837 8.837 0 01-4.43-1.232l-2.437.812a1 1 0 01-1.15-1.15l.812-2.437A8.837 8.837 0 012 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM4.706 14.706a.5.5 0 00.708 0l2.828-2.828a.5.5 0 000-.708l-2.828-2.828a.5.5 0 10-.708.708L6.293 11H4.5a.5.5 0 000 1h1.793l-1.587 1.586a.5.5 0 000 .708zM10.5 11.5a.5.5 0 000-1h-1.793l1.587-1.586a.5.5 0 000-.708l-2.828-2.828a.5.5 0 10-.708.708L8.207 9h-1.793a.5.5 0 000 1h1.793l-1.586 1.586a.5.5 0 00.707.707L10.5 11.5z" clipRule="evenodd" /></svg>
                        </button>
                    )}
                    
                    {isChatOpen && <div className="fixed inset-0 bg-black/60 z-40 sm:hidden" onClick={() => setIsChatOpen(false)}></div>}

                    <div className={`fixed bottom-0 ${isRtl ? 'left-0 sm:left-8' : 'right-0 sm:right-8'} z-50 transition-all duration-300 ease-in-out ${isChatOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full pointer-events-none'} sm:bottom-8`}>
                        <div className="h-screen w-screen sm:h-[70vh] sm:max-h-[600px] sm:w-[400px] sm:max-w-[90vw] bg-slate-800 sm:rounded-lg shadow-2xl flex flex-col border border-slate-700">
                           <GeminiChat activeView={activeView} onClose={() => setIsChatOpen(false)} />
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

// --- APP ---
const App: React.FC = () => {
    const { authStep, lang } = useContext(AppContext)!;

    // Use a wrapper div for consistent styling across auth flow
    const AuthWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
        <div className="flex items-center justify-center min-h-screen bg-slate-900 text-slate-100 p-4" dir={lang === 'fa' || lang === 'ar' || lang === 'ku' ? 'rtl' : 'ltr'}>
            <div className="w-full max-w-5xl">
                {children}
            </div>
        </div>
    );

    switch (authStep) {
        case 'language':
            return <LanguageSelection />;
        case 'login':
            return <AuthWrapper><Login /></AuthWrapper>;
        case '2fa':
            return <AuthWrapper><TwoFactorAuth /></AuthWrapper>;
        case 'nda':
            return <AuthWrapper><NDAScreen /></AuthWrapper>;
        case 'granted':
            return <MainAppLayout />;
        default:
            return <LanguageSelection />;
    }
};

const Footer = () => {
    const { t } = useI18n();
    const { isSpeaking, cancelNarration } = useContext(AppContext)!;
    return (
        <footer className="w-full text-center py-4 px-2 sm:px-8 mt-auto flex flex-col sm:flex-row justify-between items-center border-t border-slate-800 pt-4 gap-4">
            <p className="text-xs text-slate-600 max-w-lg text-center sm:text-left">
                {t('footer_disclaimer')}
            </p>
            <div className="flex items-center justify-center gap-4">
                <p className="text-xs text-slate-500">{t('narrator')}</p>
                <button
                    onClick={cancelNarration}
                    disabled={!isSpeaking}
                    className="disabled:opacity-50 text-slate-400 hover:text-white transition-colors"
                    aria-label={t('stop_narration')}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M5 3.5h6A1.5 1.5 0 0 1 12.5 5v6a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 11V5A1.5 1.5 0 0 1 5 3.5z" />
                    </svg>
                </button>
            </div>
        </footer>
    );
}


const AppWrapper = () => (
    <AppContextProvider>
        <App />
    </AppContextProvider>
);

export default AppWrapper;