
import React, { useState, useContext, useEffect, useRef } from 'react';
import { AppContextProvider, AppContext } from './contexts/AppContext';
import { useI18n } from './hooks/useI18n';
import { hasPermission } from './utils/permissions';

// Auth Components
import { LanguageSelection } from './components/auth/LanguageSelection';
import { Login } from './components/auth/Login';
import { TwoFactorAuth } from './components/auth/TwoFactorAuth';
import { NDAScreen } from './components/auth/NDAScreen';
import { PasswordReset } from './components/auth/PasswordReset';

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
import { GlobalErrorDisplay } from './components/shared/GlobalErrorDisplay';
import { ErrorBoundary } from './components/shared/ErrorBoundary';

// --- INQUIRIES & CONTRIBUTIONS COMPONENT ---
const InquiriesAndContributions: React.FC = () => {
    const { t } = useI18n();
    const { theme } = useContext(AppContext)!;

    const ContactCard: React.FC<{ href: string; icon: React.ReactNode; title: string; detail: string }> = ({ href, icon, title, detail }) => (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={`group bg-slate-800 p-6 rounded-lg border border-slate-700 transition-all duration-300 ease-in-out hover:scale-105 hover:bg-slate-700/50 hover:${theme.borderAccent}`}
        >
            <div className="p-3 bg-slate-700 rounded-full group-hover:bg-opacity-20 transition-colors">
                {icon}
            </div>
            <div>
                <h4 className={`font-semibold text-white group-hover:${theme.textAccent} transition-colors`}>{title}</h4>
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
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 text-slate-300 group-hover:${theme.textAccent} transition-colors`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>}
                        title={t('contact_phone')}
                        detail="+98 21 2842 4630"
                    />
                     <ContactCard 
                        href="https://www.linkedin.com/in/gino-ayyoubian" 
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 text-slate-300 group-hover:${theme.textAccent} transition-colors`} viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>}
                        title={t('contact_gino_linkedin')}
                        detail="linkedin.com/in/gino-ayyoubian"
                    />
                     <ContactCard 
                        href="https://www.linkedin.com/company/kkm-intl-co/" 
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 text-slate-300 group-hover:${theme.textAccent} transition-colors`} viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>}
                        title={t('contact_kkm_linkedin')}
                        detail="linkedin.com/company/kkm-intl-co"
                    />
                     <ContactCard 
                        href="mailto:info@kkm-intl.org" 
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 text-slate-300 group-hover:${theme.textAccent} transition-colors`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
                        title={t('contact_general_email')}
                        detail="info@kkm-intl.org"
                    />
                    <ContactCard 
                        href="mailto:g.ayyoubian@kkm-intl.org" 
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 text-slate-300 group-hover:${theme.textAccent} transition-colors`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" /></svg>}
                        title={t('contact_direct_email')}
                        detail="g.ayyoubian@kkm-intl.org"
                    />
                    <ContactCard 
                        href="mailto:g.ayyoubian@kkm-intl.org?subject=Technical/IP Inquiry regarding GMEL Project" 
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 text-slate-300 group-hover:${theme.textAccent} transition-colors`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V7.618a1 1 0 01.553-.894L9 4l5.447 2.724A1 1 0 0115 7.618v8.764a1 1 0 01-.553.894L9 20z" /><path d="M9 12l6-3" /></svg>}
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

// --- LANGUAGE SWITCHER COMPONENT ---
const LanguageSwitcher: React.FC = () => {
    const { lang, setLang, supportedLangs, theme } = useContext(AppContext)!;
    const { t } = useI18n();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Determine border color based on theme if available, otherwise default
    const borderColor = theme ? `focus-within:${theme.borderAccent}` : 'focus-within:border-sky-500';

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-1.5 hover:border-slate-500 transition-colors focus:ring-2 focus:ring-opacity-50 focus:outline-none ${borderColor}`}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
                <span className="text-sm font-medium text-white mr-2">{supportedLangs.find(l => l.code === lang)?.name}</span>
                <svg className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            
            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden animate-fade-in-down" role="listbox">
                    {supportedLangs.map((l) => (
                        <button
                            key={l.code}
                            role="option"
                            aria-selected={lang === l.code}
                            onClick={() => {
                                setLang(l.code);
                                setIsOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-700 transition-colors flex items-center justify-between ${lang === l.code ? 'text-sky-400 bg-slate-700/50' : 'text-slate-200'}`}
                        >
                            <span>{l.name}</span>
                            {lang === l.code && <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

// --- MAIN APP LAYOUT (shown after successful login) ---
const MainAppLayout: React.FC = () => {
    const { activeView, setActiveView, region, setRegion, lang, userRole, allowedRegions, theme } = useContext(AppContext)!;
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
                    ? theme.activeNav
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
        const hasVisibleChildren = childrenArray.some(child => child); // Ensure at least one child is rendered

        if (!hasVisibleChildren) {
            return null;
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
                     {hasPermission(userRole, 'site') && <NavItem view="site" labelKey="nav_site" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>} />}
                </NavGroup>
                <NavGroup titleKey="nav_group_strategic">
                     {hasPermission(userRole, 'comparison') && <NavItem view="comparison" labelKey="nav_comparison" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>} />}
                    {hasPermission(userRole, 'benchmark') && <NavItem view="benchmark" labelKey="nav_benchmark" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11.686a.5.5 0 01.69.043l3.25 3.5a.5.5 0 01-.345.871H3.5a.5.5 0 01-.5-.5v-3.5a.5.5 0 01.055-.228zM15 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1V4zM4 15a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM15 15a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-3z" /></svg>} />}
                    {hasPermission(userRole, 'tech_comparison') && <NavItem view="tech_comparison" labelKey="nav_tech_comparison" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>} />}
                    {hasPermission(userRole, 'simulations') && <NavItem view="simulations" labelKey="nav_simulations" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2 1M4 7l2-1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" /></svg>} />}
                    {hasPermission(userRole, 'strategy_modeler') && <NavItem view="strategy_modeler" labelKey="nav_strategy_modeler" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V5a1 1 0 00-1.447-.894l-4 2A1 1 0 0011 7v10zM4 17a1 1 0 001.447.894l4-2A1 1 0 0010 15V5a1 1 0 00-1.447-.894l-4 2A1 1 0 004 7v10z" /></svg>} />}
                </NavGroup>
                <NavGroup titleKey="nav_group_generative">
                    {hasPermission(userRole, 'image') && <NavItem view="image" labelKey="nav_concept" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} />}
                    {hasPermission(userRole, 'video') && <NavItem view="video" labelKey="nav_video_generator" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>} />}
                    {hasPermission(userRole, 'chat') && <NavItem view="chat" labelKey="nav_assistant" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>} />}
                </NavGroup>
                 <NavGroup titleKey="nav_group_official">
                     {hasPermission(userRole, 'correspondence') && <NavItem view="correspondence" labelKey="nav_correspondence" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>} />}
                     {hasPermission(userRole, 'proposal_generator') && <NavItem view="proposal_generator" labelKey="nav_proposal_generator" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>} />}
                     {hasPermission(userRole, 'contact') && <NavItem view="contact" labelKey="contact_us" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>} />}
                </NavGroup>
            </nav>
        </>
    );

    return (
        <div className={`min-h-screen bg-slate-900 text-slate-100 font-sans ${isRtl ? 'rtl' : 'ltr'}`}>
             <div className="flex">
                {/* Desktop Sidebar */}
                <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-slate-800 p-4 border-r border-slate-700 h-screen fixed">
                    {sidebarContent}
                </aside>

                {/* Mobile Sidebar */}
                <div className={`fixed inset-0 z-40 flex lg:hidden ${isSidebarOpen ? '' : 'pointer-events-none'}`}>
                     <div onClick={() => setIsSidebarOpen(false)} className={`absolute inset-0 bg-black/60 transition-opacity ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}></div>
                     <aside className={`relative flex flex-col w-64 bg-slate-800 p-4 border-r border-slate-700 h-full transform transition-transform ${isSidebarOpen ? (isRtl ? 'translate-x-0' : 'translate-x-0') : (isRtl ? 'translate-x-full' : '-translate-x-full')}`}>
                        {sidebarContent}
                    </aside>
                </div>

                <div className={isRtl ? "lg:mr-64 flex-1" : "lg:ml-64 flex-1"}>
                    <header className="sticky top-0 z-30 bg-slate-900/70 backdrop-blur-sm border-b border-slate-700/50 p-4 flex items-center justify-between">
                        <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-slate-400 hover:text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
                        </button>
                        <GlobalSearch />
                        <div className="flex items-center gap-4">
                             <LanguageSwitcher />
                             <div className="relative">
                                <label htmlFor="region-selector" className="sr-only">{t('proposal_for')}</label>
                                 <select 
                                    id="region-selector" 
                                    value={region} 
                                    onChange={e => setRegion(e.target.value as Region)}
                                    className={`bg-slate-700 border-slate-600 rounded-md py-1.5 pl-3 pr-8 text-sm text-white font-semibold focus:ring-2 focus:${theme.borderAccent}`}
                                >
                                    {allowedRegions ? (
                                        allowedRegions.map(r => <option key={r} value={r}>{r}</option>)
                                    ) : (
                                        <>
                                            <option value="Qeshm Free Zone">Qeshm Free Zone</option>
                                            <option value="Makoo Free Zone">Makoo Free Zone</option>
                                            <option value="Chabahar Free Zone">Chabahar Free Zone</option>
                                            <option value="Iranian Kurdistan">Iranian Kurdistan</option>
                                            <option value="Mahabad">Mahabad</option>
                                            <option value="Kurdistan Region, Iraq">Kurdistan Region, Iraq</option>
                                            <option value="Oman">Oman</option>
                                            <option value="Saudi Arabia">Saudi Arabia</option>
                                            <option value="United Arab Emirates">United Arab Emirates</option>
                                            <option value="Qatar">Qatar</option>
                                        </>
                                    )}
                                </select>
                            </div>
                            <button onClick={() => setIsChatOpen(!isChatOpen)} className={`p-2 rounded-full bg-slate-700 text-slate-300 hover:${theme.button} hover:text-white transition-colors`} aria-label="Open Project Assistant Chat">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                            </button>
                        </div>
                    </header>
                    <main className="p-4 sm:p-6 lg:p-8">
                        {renderView()}
                    </main>
                </div>
            </div>

            {/* Chat Overlay */}
            {isChatOpen && (
                <div className="fixed bottom-0 right-0 z-50 p-4 w-full max-w-lg h-full md:h-2/3">
                    <GeminiChat activeView={activeView} onClose={() => setIsChatOpen(false)} />
                </div>
            )}
        </div>
    );
};

// --- AUTH FLOW COMPONENTS ---

const ProgressIndicator: React.FC<{ currentStep: number; totalSteps: number; stepNames: string[] }> = ({ currentStep, totalSteps, stepNames }) => {
    return (
        <div className="flex items-center justify-between mb-8 px-4">
            {Array.from({ length: totalSteps }).map((_, index) => (
                <React.Fragment key={index}>
                    <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${index + 1 <= currentStep ? 'bg-sky-600 border-sky-600' : 'bg-slate-700 border-slate-600'}`}>
                            <span className={`font-bold ${index + 1 <= currentStep ? 'text-white' : 'text-slate-400'}`}>{index + 1}</span>
                        </div>
                        <span className={`mt-2 text-xs font-semibold ${index + 1 <= currentStep ? 'text-white' : 'text-slate-400'}`}>{stepNames[index]}</span>
                    </div>
                    {index < totalSteps - 1 && <div className="flex-1 h-0.5 mx-4 bg-slate-600" />}
                </React.Fragment>
            ))}
        </div>
    );
};

const AuthScreen: React.FC = () => {
    const { authStep, userRole } = useContext(AppContext)!;
    const { t } = useI18n();

    const isResetFlow = authStep === 'resetPassword';

    const steps = ['login', '2fa', 'nda'];
    const stepNames = [t('login_button'), t('two_factor_title'), t('nda_title')];
    
    // Admin and guest roles skip 2FA and NDA.
    const relevantSteps = userRole === 'admin' || userRole === 'guest' ? ['login'] : steps;
    const currentStepIndex = relevantSteps.indexOf(authStep);

    const renderAuthStep = () => {
        switch (authStep) {
            case 'login': return <Login />;
            case '2fa': return <TwoFactorAuth />;
            case 'nda': return <NDAScreen />;
            case 'resetPassword': return <PasswordReset />;
            default: return <Login />;
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-slate-100 p-4 relative">
            <div className="auth-background"></div>
            
            {/* Language Switcher added for access during Auth flow */}
            <div className="absolute top-4 right-4 z-20">
                <LanguageSwitcher />
            </div>

            <div className="w-full max-w-md mx-auto relative">
                 <div className="text-center mb-8">
                    <img src={KKM_LOGO_DATA_URL} alt="KKM International Logo" className="h-20 mx-auto mb-4 bg-white rounded-2xl p-2" />
                    <h1 className="text-2xl font-bold text-white">{isResetFlow ? t('password_reset_title') : t('login_title')}</h1>
                </div>
                {!isResetFlow && currentStepIndex !== -1 && (
                    <ProgressIndicator 
                        currentStep={currentStepIndex + 1} 
                        totalSteps={relevantSteps.length} 
                        stepNames={stepNames}
                    />
                )}
                <div key={authStep} className="auth-step-container">
                    {renderAuthStep()}
                </div>
            </div>
        </div>
    );
};


// --- APP ROUTER ---
const App: React.FC = () => {
    const { authStep, lang } = useContext(AppContext)!;

    useEffect(() => {
        document.documentElement.lang = lang;
        document.documentElement.dir = lang === 'fa' || lang === 'ar' || lang === 'ku' ? 'rtl' : 'ltr';
    }, [lang]);

    switch (authStep) {
        case 'language':
            return <LanguageSelection />;
        case 'login':
        case '2fa':
        case 'nda':
        case 'resetPassword':
            return <AuthScreen />;
        case 'granted':
            return <MainAppLayout />;
        default:
            return <LanguageSelection />;
    }
};

// --- APP WRAPPER (provides context) ---
export const AppWrapper: React.FC = () => {
    return (
        <AppContextProvider>
            <ErrorBoundary>
                <App />
                <GlobalErrorDisplay />
            </ErrorBoundary>
        </AppContextProvider>
    );
};
