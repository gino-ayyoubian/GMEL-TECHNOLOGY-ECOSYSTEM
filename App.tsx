import React, { useState, useContext } from 'react';
import { AppContextProvider, AppContext } from './contexts/AppContext';
import { useI18n, Language } from './hooks/useI18n';
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
import { AccessControl } from './components/AccessControl';
import { VideoGenerator } from './components/VideoGenerator';
import { TechComparison } from './components/TechComparison';
import { Simulations } from './components/Simulations';
import { StrategyModeler } from './components/StrategyModeler';
import { ProposalGenerator } from './components/ProposalGenerator';
import { Region, View } from './types';
import { KKM_LOGO_DATA_URL } from './constants';
import * as en from './i18n/en';
import { GlobalSearch } from './components/shared/GlobalSearch';

// --- KKM LOGO COMPONENT ---
const KkmLogo = ({ className = 'h-12 w-auto' }: { className?: string }) => (
    <img src={KKM_LOGO_DATA_URL} alt="KKM International Logo" className={className} />
);

// --- APP ---
const App: React.FC = () => {
  const { activeView, setActiveView, region, setRegion, lang, setLang, supportedLangs, isAccessGranted } = useContext(AppContext)!;
  const { t } = useI18n();

  const NavItem = ({ view, labelKey, icon }: { view: View; labelKey: keyof typeof en; icon: React.ReactNode }) => (
    <button
      onClick={() => setActiveView(view)}
      aria-label={t(labelKey)}
      className={`flex items-center w-full px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
        activeView === view
          ? 'bg-amber-600 text-white'
          : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
      }`}
    >
      {icon}
      <span className="ml-3">{t(labelKey)}</span>
    </button>
  );

  const NavGroup: React.FC<{ titleKey: keyof typeof en; children: React.ReactNode }> = ({ titleKey, children }) => {
    const [isOpen, setIsOpen] = useState(true);
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
      case 'proposal_generator': return <ProposalGenerator />;
      case 'image': return <ImageGenerator />;
      case 'video': return <VideoGenerator />;
      case 'chat': return <GeminiChat activeView={activeView} />;
      default: return <Dashboard />;
    }
  };

  if (!isAccessGranted) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-900 text-slate-100 p-4" dir={lang === 'fa' ? 'rtl' : 'ltr'}>
            <div className="w-full max-w-5xl">
                <AccessControl />
            </div>
        </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100" dir={lang === 'fa' ? 'rtl' : 'ltr'}>
      <aside className={`w-64 flex-shrink-0 bg-slate-800 p-4 border-slate-700 flex flex-col ${lang === 'fa' ? 'border-l' : 'border-r'}`}>
        <div className="flex items-center mb-6">
          <div className="p-1 bg-white rounded-lg">
            <KkmLogo className="h-12 w-auto" />
          </div>
          <h1 className="mx-3 text-xl font-bold text-white">{t('app_title')}</h1>
        </div>
        <nav className="flex-grow space-y-1 overflow-y-auto pr-1">
            <NavGroup titleKey="nav_group_analysis">
                <NavItem view="dashboard" labelKey="nav_dashboard" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>} />
                <NavItem view="ip" labelKey="nav_ip" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V7.618a1 1 0 01.553-.894L9 4l5.447 2.724A1 1 0 0115 7.618v8.764a1 1 0 01-.553.894L9 20z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l5.447-2.724A1 1 0 0115 7.618" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12V4" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.553 6.724L9 12" /></svg>} />
                <NavItem view="technical" labelKey="nav_technical" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 16v-2m0-8v-2m-8 4h2m16 0h-2m-7-7l1.414-1.414M5.636 5.636L7.05 7.05m12.728 9.9L16.95 16.95M5.636 18.364l1.414-1.414m11.314-11.314l-1.414 1.414" /></svg>} />
                <NavItem view="financials" labelKey="nav_financials" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>} />
            </NavGroup>
            <NavGroup titleKey="nav_group_strategic">
                <NavItem view="tech_comparison" labelKey="nav_tech_comparison" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>} />
                <NavItem view="benchmark" labelKey="nav_benchmark" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2h10a2 2 0 002-2v-1a2 2 0 012-2h1.945M7.737 10.512l3.428-3.428a.5.5 0 01.707 0l3.429 3.428m-11.314 0l3.428 3.428a.5.5 0 00.707 0l3.429-3.428" /></svg>} />
                <NavItem view="site" labelKey="nav_site" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>} />
                <NavItem view="comparison" labelKey="nav_comparison" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>} />
                <NavItem view="simulations" labelKey="nav_simulations" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>} />
                <NavItem view="strategy_modeler" labelKey="nav_strategy_modeler" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2 1M4 7l2-1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" /></svg>} />
            </NavGroup>
            <NavGroup titleKey="nav_group_generative">
                <NavItem view="image" labelKey="nav_concept" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} />
                <NavItem view="video" labelKey="nav_video_generator" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>} />
                <NavItem view="chat" labelKey="nav_assistant" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.837 8.837 0 01-4.43-1.232l-2.437.812a1 1 0 01-1.15-1.15l.812-2.437A8.837 8.837 0 012 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM4.706 14.706a.5.5 0 00.708 0l2.828-2.828a.5.5 0 000-.708l-2.828-2.828a.5.5 0 10-.708.708L6.293 11H4.5a.5.5 0 000 1h1.793l-1.587 1.586a.5.5 0 000 .708zM10.5 11.5a.5.5 0 000-1h-1.793l1.587-1.586a.5.5 0 000-.708l-2.828-2.828a.5.5 0 10-.708.708L8.207 9h-1.793a.5.5 0 000 1h1.793l-1.586 1.586a.5.5 0 00.707.707L10.5 11.5z" clipRule="evenodd" /></svg>} />
             </NavGroup>
             <NavGroup titleKey="nav_group_official">
                <NavItem view="proposal_generator" labelKey="nav_proposal_generator" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>} />
                <NavItem view="correspondence" labelKey="nav_correspondence" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>} />
             </NavGroup>
        </nav>
        <div className="mt-auto space-y-2">
            <button
                onClick={() => setActiveView('correspondence')}
                aria-label={t('contact_us')}
                className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg text-slate-400 hover:bg-slate-700/50 hover:text-white transition-colors`}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                <span className="mx-3">{t('contact_us')}</span>
            </button>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto flex flex-col">
         <header className="flex-shrink-0 mb-8">
            <div className="flex justify-between items-center gap-6">
                <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="p-1 bg-white rounded-lg">
                        <KkmLogo className="h-12 w-auto" />
                    </div>
                    <h1 className="text-xl font-bold text-white whitespace-nowrap hidden lg:block">GeoMeta Energy Layer Vision</h1>
                </div>
                <div className="flex-grow min-w-0 px-4">
                    <GlobalSearch />
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="items-center hidden md:flex">
                        <label htmlFor="region-select" className="text-sm font-medium text-slate-400 mx-3">{t('proposal_for')}</label>
                        <select
                            id="region-select"
                            value={region}
                            onChange={(e) => setRegion(e.target.value as Region)}
                            className="bg-slate-700 border-slate-600 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 text-sm text-white font-semibold"
                        >
                            <option value="Qeshm Free Zone">Qeshm Free Zone</option>
                            <option value="Makoo Free Zone">Makoo Free Zone</option>
                            <option value="Kurdistan Region, Iraq">Kurdistan Region, Iraq</option>
                            <option value="Oman">Oman</option>
                            <option value="Saudi Arabia">Saudi Arabia</option>
                        </select>
                    </div>
                    <div className="flex items-center">
                        <label htmlFor="lang-select" className="sr-only">{t('language')}</label>
                        <select
                            id="lang-select"
                            value={lang}
                            onChange={(e) => setLang(e.target.value as Language)}
                             className="bg-slate-700 border-slate-600 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 text-sm text-white font-semibold"
                        >
                            {supportedLangs.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
                        </select>
                    </div>
                </div>
            </div>
        </header>
        <div className="flex-grow">
            {renderView()}
        </div>
        <Footer />
      </main>
    </div>
  );
};

const Footer = () => {
    const { t } = useI18n();
    const { isSpeaking, cancelNarration } = useContext(AppContext)!;
    return (
        <footer className="w-full text-center py-4 px-8 mt-auto flex justify-between items-center border-t border-slate-800 pt-4">
          <p className="text-xs text-slate-600 max-w-lg text-left">
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
                    <path d="M5 3.5h6A1.5 1.5 0 0 1 12.5 5v6a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 11V5A1.5 1.5 0 0 1 5 3.5z"/>
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