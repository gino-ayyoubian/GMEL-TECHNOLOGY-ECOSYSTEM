import React, { useState, useContext, useEffect, useRef } from 'react';
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
import { Region } from './types';
import { KKM_LOGO_DATA_URL } from './constants';
// Fix: Import 'en' to use its keys for strong typing
import * as en from './i18n/en';

// --- KKM LOGO COMPONENT ---
const KkmLogo = () => (
    <img src={KKM_LOGO_DATA_URL} alt="KKM International Logo" className="h-12 w-auto" />
);

// --- APP ---
type View = 'dashboard' | 'ip' | 'financials' | 'technical' | 'benchmark' | 'image' | 'chat' | 'site' | 'comparison' | 'correspondence' | 'access';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('dashboard');
  const { region, setRegion, lang, setLang, supportedLangs } = useContext(AppContext)!;
  const { t } = useI18n();

  // Fix: Changed labelKey type from 'string' to 'keyof typeof en' to match the 't' function's expectation.
  const NavItem = ({ view, labelKey, icon }: { view: View; labelKey: keyof typeof en; icon: React.ReactNode }) => (
    <button
      onClick={() => setActiveView(view)}
      aria-label={t(labelKey)}
      className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
        activeView === view
          ? 'bg-amber-600 text-white'
          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
      }`}
    >
      {icon}
      <span className="ml-3">{t(labelKey)}</span>
    </button>
  );
  
  const renderView = () => {
    switch (activeView) {
      case 'dashboard': return <Dashboard />;
      case 'ip': return <IPRoadmap />;
      case 'financials': return <Financials />;
      case 'technical': return <Technical />;
      case 'benchmark': return <Benchmark />;
      case 'site': return <SiteAnalysis />;
      case 'comparison': return <Comparison />;
      case 'access': return <AccessControl />;
      case 'correspondence': return <Correspondence />;
      case 'image': return <ImageGenerator />;
      case 'chat': return <GeminiChat />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100" dir={lang === 'fa' ? 'rtl' : 'ltr'}>
      <aside className={`w-64 flex-shrink-0 bg-slate-800 p-4 border-slate-700 flex flex-col ${lang === 'fa' ? 'border-l' : 'border-r'}`}>
        <div className="flex items-center mb-8">
          <div className="p-1 bg-white rounded-lg">
            <KkmLogo />
          </div>
          <h1 className="mx-3 text-xl font-bold text-white">{t('app_title')}</h1>
        </div>
        <nav className="flex-grow space-y-2">
           <NavItem view="dashboard" labelKey="nav_dashboard" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>} />
          <NavItem view="ip" labelKey="nav_ip" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V7.618a1 1 0 01.553-.894L9 4l5.447 2.724A1 1 0 0115 7.618v8.764a1 1 0 01-.553.894L9 20z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l5.447-2.724A1 1 0 0115 7.618" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12V4" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.553 6.724L9 12" /></svg>} />
          <NavItem view="technical" labelKey="nav_technical" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 16v-2m0-8v-2m-8 4h2m16 0h-2m-7-7l1.414-1.414M5.636 5.636L7.05 7.05m12.728 9.9L16.95 16.95M5.636 18.364l1.414-1.414m11.314-11.314l-1.414 1.414" /></svg>} />
          <NavItem view="financials" labelKey="nav_financials" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>} />
          <NavItem view="benchmark" labelKey="nav_benchmark" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2h10a2 2 0 002-2v-1a2 2 0 012-2h1.945M7.737 10.512l3.428-3.428a.5.5 0 01.707 0l3.429 3.428m-11.314 0l3.428 3.428a.5.5 0 00.707 0l3.429-3.428" /></svg>} />
          <NavItem view="site" labelKey="nav_site" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>} />
          <NavItem view="comparison" labelKey="nav_comparison" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>} />
          <NavItem view="access" labelKey="nav_access_control" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.604-3.749m-15.01-1.548a11.959 11.959 0 0112.02-3.045c1.244.243 2.422.69 3.536 1.288" /></svg>} />
          <NavItem view="correspondence" labelKey="nav_correspondence" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>} />
          <NavItem view="image" labelKey="nav_concept" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} />
        </nav>
        <div className="mt-auto space-y-2">
            <a
                href="mailto:info@kkm-intl.xyz"
                aria-label={t('contact_us')}
                className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors`}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                <span className="mx-3">{t('contact_us')}</span>
            </a>
          <NavItem view="chat" labelKey="nav_assistant" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.837 8.837 0 01-4.43-1.232l-2.437.812a1 1 0 01-1.15-1.15l.812-2.437A8.837 8.837 0 012 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM4.706 14.706a.5.5 0 00.708 0l2.828-2.828a.5.5 0 000-.708l-2.828-2.828a.5.5 0 10-.708.708L6.293 11H4.5a.5.5 0 000 1h1.793l-1.587 1.586a.5.5 0 000 .708zM10.5 11.5a.5.5 0 000-1h-1.793l1.587-1.586a.5.5 0 000-.708l-2.828-2.828a.5.5 0 10-.708.708L8.207 9h-1.793a.5.5 0 000 1h1.793l-1.586 1.586a.5.5 0 00.707.707L10.5 11.5z" clipRule="evenodd" /></svg>} />
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto flex flex-col">
         <header className="flex-shrink-0 mb-8">
            <div className="flex justify-end items-center gap-6">
                <div className="flex items-center">
                    <label htmlFor="region-select" className="text-sm font-medium text-slate-400 mx-3">{t('proposal_for')}</label>
                    <select
                        id="region-select"
                        value={region}
                        onChange={(e) => setRegion(e.target.value as Region)}
                        className="bg-slate-700 border-slate-600 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 text-sm text-white font-semibold"
                    >
                        <option value="Qeshm Free Zone">Qeshm Free Zone</option>
                        <option value="Makoo Free Zone">Makoo Free Zone</option>
                    </select>
                </div>
                <div className="flex items-center">
                    <label htmlFor="lang-select" className="text-sm font-medium text-slate-400 mx-3">{t('language')}</label>
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