
import React, { useState, useContext, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { getFinancialData, PROJECT_MILESTONES, getProjectSummaryPrompt } from '../constants';
import { generateTextWithThinking, generateGroundedText, generateFinancialData } from '../services/geminiService';
import { wsService } from '../services/webSocketService';
import { Milestone, FinancialData } from '../types';
import { AppContext } from '../contexts/AppContext';
import { useI18n } from '../hooks/useI18n';
import { SpeakerIcon } from './shared/SpeakerIcon';
import { Feedback } from './shared/Feedback';
import { Spinner } from './shared/Loading';
import { SkeletonLoader } from './shared/SkeletonLoader';
import { extractJson } from '../utils/helpers';
import { Activity } from 'lucide-react';

const COLORS = ['#0ea5e9', '#0369a1', '#f97316', '#f59e0b', '#8b5cf6'];

const DataCard: React.FC<{ title: string; value: string; description: string; icon: React.ReactNode; isLive?: boolean }> = ({ title, value, description, icon, isLive }) => (
  <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 transition-all duration-300 ease-in-out hover:scale-105 hover:bg-slate-700/50 hover:border-sky-500 cursor-pointer relative overflow-hidden">
    <div className="flex justify-between items-start relative z-10">
        <h3 className="text-sm font-medium text-sky-400 uppercase tracking-wider">{title}</h3>
        <div className="text-slate-600 relative">
            {icon}
            {isLive && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-slate-800 animate-pulse"></span>
            )}
        </div>
    </div>
    <p className="mt-2 text-3xl font-bold text-white tracking-tight relative z-10 font-mono">{value}</p>
    <p className="mt-2 text-xs text-slate-500 relative z-10 truncate">{description}</p>
  </div>
);

const ThinkingButton: React.FC<{ prompt: string, onResult: (result: string) => void }> = ({ prompt, onResult }) => {
    const [isLoading, setIsLoading] = useState(false);
    const { t } = useI18n();

    const handleClick = async () => {
        setIsLoading(true);
        const result = await generateTextWithThinking(prompt);
        onResult(result ? `${result}` : t('error_no_analysis'));
        setIsLoading(false);
    };

    return (
        <button
            onClick={handleClick}
            disabled={isLoading}
            className="flex items-center justify-center px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg transition-colors disabled:bg-sky-400 disabled:cursor-not-allowed shadow-lg shadow-sky-900/20"
        >
            {isLoading ? (
                <>
                    <Spinner size="sm" className="mr-3 text-white" />
                    {t('thinking')}
                </>
            ) : (
                <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                {t('generate_strategic_analysis')}
                </>
            )}
        </button>
    );
};

const MilestoneCard: React.FC<{ milestone: Milestone; isLast: boolean }> = ({ milestone, isLast }) => {
  const statusColor = {
    Completed: 'bg-teal-500',
    'In Progress': 'bg-sky-500',
    Planned: 'bg-amber-500',
  }[milestone.status];

  return (
    <div className="relative ps-8 group">
      <div className={`absolute top-1.5 start-0 w-3 h-3 rounded-full ${statusColor} transition-transform group-hover:scale-125`} title={milestone.status}></div>
      {!isLast && <div className="absolute top-5 start-[5px] w-px h-full bg-slate-700 group-hover:bg-slate-600 transition-colors"></div>}
      <p className="font-semibold text-white group-hover:text-sky-300 transition-colors">{milestone.title} <span className="text-slate-500 font-normal text-xs ml-2 border border-slate-700 rounded px-1.5 py-0.5">{milestone.date}</span></p>
      <p className="text-sm text-slate-400 mt-1 leading-relaxed">{milestone.description}</p>
    </div>
  );
};

interface ImpactMetric {
    metric: string;
    value: number | string;
    unit: string;
}

interface ImpactCategory {
    metrics: ImpactMetric[];
    narrative: string;
}

interface ImpactResults {
    economic: ImpactCategory;
    environmental: ImpactCategory;
    social: ImpactCategory;
}

const ImpactCard: React.FC<{ title: string; data: ImpactCategory; icon: React.ReactNode }> = ({ title, data, icon }) => {
    return (
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 h-full flex flex-col hover:border-slate-600 transition-colors">
            <h3 className="text-xl font-semibold text-sky-400 mb-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-900/50">{icon}</div>
                {title}
            </h3>
            <ul className="space-y-3 mb-4">
                {data.metrics.map((item, index) => (
                    <li key={index} className="flex justify-between items-baseline border-b border-slate-700/50 pb-2 last:border-0">
                        <span className="text-slate-300 text-sm">{item.metric}</span>
                        <span className="font-bold text-white text-lg">
                            {typeof item.value === 'number' ? item.value.toLocaleString() : item.value}
                            <span className="text-xs text-slate-500 ml-1 uppercase">{item.unit}</span>
                        </span>
                    </li>
                ))}
            </ul>
            <div className="mt-auto pt-4 border-t border-slate-700/50">
                <p className="text-sm text-slate-400 whitespace-pre-wrap flex items-start leading-relaxed">
                     <span className="flex-grow">{data.narrative}</span>
                     <SpeakerIcon text={data.narrative} />
                </p>
            </div>
        </div>
    );
};

const ImpactCalculator: React.FC = () => {
    const { t } = useI18n();
    const { lang } = useContext(AppContext)!;
    const [scale, setScale] = useState<number>(5);
    const [results, setResults] = useState<ImpactResults | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    
    useEffect(() => {
        setResults(null);
        setError(null);
    }, [lang]);

    const handleCalculate = async () => {
        setIsLoading(true);
        setError(null);
        setResults(null);

        const prompt = t('impact_generation_prompt', { scale });
        try {
            const result = await generateTextWithThinking(prompt);
            const parsed = extractJson(result);
            if (parsed && parsed.economic && parsed.environmental && parsed.social) {
                setResults(parsed);
            } else {
                throw new Error("Invalid format received from AI");
            }
        } catch (e: any) {
            setError(t('error_generating_impact_analysis'));
            console.error("Failed to parse impact JSON:", e);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="space-y-8 animate-fade-in">
            <h2 className="text-3xl font-bold text-white">{t('impact_calculator_title')}</h2>
             <p className="text-slate-400 max-w-3xl">
                {t('impact_calculator_description')}
            </p>
            
            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 space-y-4 flex flex-col md:flex-row items-center gap-6">
                 <div className="flex-grow w-full md:w-auto">
                    <label htmlFor="scale-slider" className="block text-sm font-medium text-slate-300 mb-2 flex justify-between">
                        {t('project_scale_mw')} 
                        <span className="font-bold text-sky-400 text-lg">{scale} MW</span>
                    </label>
                    <input 
                        id="scale-slider"
                        type="range"
                        min="1"
                        max="500"
                        step="1"
                        value={scale}
                        onChange={(e) => setScale(Number(e.target.value))}
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
                    />
                 </div>
                 <button 
                    onClick={handleCalculate} 
                    disabled={isLoading} 
                    className="w-full md:w-auto flex-shrink-0 px-8 py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg transition-all shadow-lg shadow-sky-900/20 disabled:bg-slate-800 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <div className="flex items-center gap-2">
                            <Spinner size="sm" className="text-white" />
                            {t('calculating')}
                        </div>
                    ) : t('calculate_impact')}
                 </button>
            </div>
            
            {error && <p className="text-red-400 text-center bg-red-900/10 p-2 rounded">{error}</p>}

            {isLoading && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <SkeletonLoader variant="card" count={3} height="200px" />
                </div>
            )}
            
            {results && (
                <div className="space-y-6 animate-pop-in">
                    <h3 className="text-2xl font-semibold text-white">{t('impact_results_for', { scale })}</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <ImpactCard 
                            title={t('economic_impact')} 
                            data={results.economic} 
                            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
                        />
                        <ImpactCard 
                            title={t('environmental_impact')} 
                            data={results.environmental}
                            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                        />
                        <ImpactCard 
                            title={t('social_impact')} 
                            data={results.social}
                            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
                        />
                    </div>
                     <Feedback sectionId={`impact-calculator-${scale}MW`} />
                </div>
            )}
        </div>
    );
};

const GMELStatementBanner = () => {
    const { t } = useI18n();
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const hasSeenStatement = sessionStorage.getItem('gmel_statement_seen');
        if (hasSeenStatement) {
            setIsVisible(false);
        }
    }, []);

    const handleDismiss = () => {
        sessionStorage.setItem('gmel_statement_seen', 'true');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-amber-500/30 rounded-2xl p-8 mb-8 relative animate-fade-in shadow-[0_0_30px_rgba(245,158,11,0.1)] overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
            
            <button onClick={handleDismiss} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors p-1 rounded-full hover:bg-white/5" aria-label="Dismiss">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            
            <div className="relative z-10">
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500 mb-6 tracking-tight flex items-center gap-3">
                    <span className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                        </svg>
                    </span>
                    {t('gmel_statement_title')}
                </h2>
                
                <div className="max-h-80 overflow-y-auto pr-4 text-slate-300 text-sm space-y-4 whitespace-pre-wrap leading-relaxed scrollbar-thin font-light">
                    <p className="first-letter:text-4xl first-letter:font-bold first-letter:text-amber-500 first-letter:mr-2 first-letter:float-left">
                        {t('gmel_statement_body')}
                    </p>
                </div>

                <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Signed</span>
                        <span className="font-serif text-lg text-white italic mt-1">Seyed Gino Ayyoubian</span>
                        <span className="text-[10px] text-sky-500 font-medium">Inventor & Founder</span>
                    </div>
                    <div className="opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                         {/* Placeholder for signature or stamp */}
                         <div className="border-2 border-slate-600 rounded-full w-12 h-12 flex items-center justify-center">
                            <span className="text-[8px] font-bold text-slate-500 transform -rotate-12">SEALED</span>
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


export const Dashboard: React.FC = () => {
    const { region, lang, setError } = useContext(AppContext)!;
    const { t } = useI18n();
    const [strategicAnalysis, setStrategicAnalysis] = useState('');
    const [summary, setSummary] = useState('');
    const [isSummaryLoading, setIsSummaryLoading] = useState(false);

    const [financialData, setFinancialData] = useState<FinancialData[]>([]);
    const [isFinancialLoading, setIsFinancialLoading] = useState(false);
    const [isLive, setIsLive] = useState(true);

    useEffect(() => {
        const fetchInitialData = async () => {
            setIsFinancialLoading(true);
            try {
                // If language is English, we can use the static data immediately, but async ensures consistency
                // Actually, to support 'language selection' properly, we should always try to generate if not English.
                if (lang === 'en') {
                    setFinancialData(getFinancialData(region));
                } else {
                    const data = await generateFinancialData(region, lang);
                    setFinancialData(data);
                }
            } catch (e: any) {
                console.error("Failed to fetch dashboard data", e);
                // Fallback
                setFinancialData(getFinancialData(region));
                if (lang !== 'en') {
                    setError("Could not retrieve localized financial data. Showing English fallback.");
                }
            } finally {
                setIsFinancialLoading(false);
            }
        };

        fetchInitialData();
        setSummary('');
        setStrategicAnalysis('');
    }, [region, lang]);

    // WebSocket Connection for Live Data
    useEffect(() => {
        if (!isLive) {
            wsService.disconnect();
            return;
        }

        wsService.connect(region);

        const handleUpdate = (updates: {id: string, value: number}[]) => {
            setFinancialData(prevData => prevData.map(item => {
                const update = updates.find(u => u.id === item.id);
                return update ? { ...item, value: update.value } : item;
            }));
        };

        wsService.subscribe('financial_update', handleUpdate);

        return () => {
            wsService.unsubscribe('financial_update', handleUpdate);
        };
    }, [region, isLive]);

    const fetchSummary = async () => {
        setIsSummaryLoading(true);
        try {
            const prompt = getProjectSummaryPrompt(region, lang);
            const result = await generateGroundedText(prompt);
            setSummary(result.text);
        } catch (e: any) {
            setError("Failed to generate summary.");
        } finally {
            setIsSummaryLoading(false);
        }
    };

    const chartData = useMemo(() => {
        return financialData
            .filter(d => ['capex', 'revenue', 'npv'].includes(d.id))
            .map(d => ({
                name: d.component.split(' ')[0], // Keep short name for X-axis
                fullName: d.component, // Full name for tooltip
                value: d.value,
                unit: d.unit,
                description: d.description
            }));
    }, [financialData]);

    const cardIcons: Record<string, React.ReactNode> = {
        'capex': <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
        'revenue': <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
        'payback': <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
        'roi': <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01" /><path strokeLinecap="round" strokeLinejoin="round" d="M16 12h.01" /><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 14v-4" /></svg>,
        'npv': <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    };

    const getIconForCard = (id: string) => {
        return cardIcons[id] || <Activity className="w-6 h-6" />;
    };

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700 p-3 rounded-lg shadow-xl text-sm z-50">
                    <p className="font-bold text-sky-400 mb-1">{data.fullName}</p>
                    <p className="text-white text-lg font-semibold">
                        {data.value.toLocaleString()} <span className="text-xs text-slate-400">{data.unit}</span>
                    </p>
                    <p className="text-slate-400 text-xs mt-2 italic border-t border-slate-700 pt-2">{data.description}</p>
                </div>
            );
        }
        return null;
    };
  
    return (
    <div className="space-y-8">
      <GMELStatementBanner />
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-3xl font-bold text-white tracking-tight">{t('dashboard_title', { region })}</h1>
          <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
                <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-slate-500'}`}></span>
                <label className="text-xs text-slate-400 font-medium cursor-pointer flex items-center gap-2 select-none">
                    <input 
                        type="checkbox" 
                        checked={isLive} 
                        onChange={(e) => setIsLive(e.target.checked)} 
                        className="rounded border-slate-600 bg-slate-700 text-sky-500 focus:ring-sky-500/50" 
                    />
                    Live Data
                </label>
            </div>
      </div>
      
      {isFinancialLoading && financialData.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              {[...Array(5)].map((_, i) => <SkeletonLoader key={i} variant="card" height="150px" />)}
          </div>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {financialData.map((item, index) => (
              <DataCard 
                key={item.id}
                title={item.component}
                value={`${item.value}${item.unit === 'Billion Toman' ? ' B' : ''}${item.unit === 'Years' ? ' Yrs' : ''}`}
                description={item.description}
                icon={getIconForCard(item.id)}
                isLive={isLive}
              />
            ))}
          </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        <div className="lg:col-span-3 space-y-8">
            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                <h2 className="text-xl font-semibold mb-4 text-white flex items-center">
                    {t('project_summary')}
                    <SpeakerIcon text={summary} />
                </h2>
                {isSummaryLoading ? (
                    <SkeletonLoader variant="text" count={4} />
                ) : summary ? (
                    <p className="text-slate-400 text-sm mb-6 whitespace-pre-wrap leading-relaxed">{summary}</p>
                ) : (
                     <div className="text-center py-4">
                        <p className="text-slate-500 mb-4">Click the button to generate a project summary for {region}.</p>
                        <button onClick={fetchSummary} className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg transition-colors">{t('generate_summary')}</button>
                    </div>
                )}

                {summary && !isSummaryLoading && (
                    <>
                        <ThinkingButton 
                            prompt={t('strategic_analysis_prompt', { region, summary: summary })}
                            onResult={setStrategicAnalysis}
                        />
                        <Feedback sectionId={`summary-${region}`} />
                    </>
                )}


                {strategicAnalysis && (
                    <div className="mt-6 p-4 bg-slate-900 rounded-lg border border-sky-500/30 animate-fade-in">
                         <h3 className="font-semibold text-sky-400 mb-2 flex items-center">
                            {t('generated_strategic_analysis')}
                            <SpeakerIcon text={strategicAnalysis} />
                         </h3>
                         <p className="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">{strategicAnalysis}</p>
                         <Feedback sectionId={`strategic-analysis-${region}`} />
                    </div>
                )}
            </div>
             <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                <h2 className="text-xl font-semibold mb-6 text-white">{t('project_milestones')}</h2>
                <div className="space-y-6">
                    {PROJECT_MILESTONES.map((milestone, index) => (
                        <MilestoneCard key={index} milestone={milestone} isLast={index === PROJECT_MILESTONES.length - 1} />
                    ))}
                </div>
            </div>
        </div>

        <div className="lg:col-span-2 bg-slate-800 p-6 rounded-lg border border-slate-700 h-full flex flex-col">
            <h2 className="text-xl font-semibold mb-4 text-white">{t('financial_overview')}</h2>
            <div className="flex-grow flex items-center" style={{ minHeight: '300px' }}>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#475569" vertical={false} />
                        <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} unit=" B" axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(255, 255, 255, 0.05)'}} />
                        <Legend wrapperStyle={{ color: '#94a3b8', paddingTop: '10px' }}/>
                        <Bar 
                            dataKey="value" 
                            name={t('financial_chart_legend')}
                            radius={[4, 4, 0, 0]}
                            isAnimationActive={!isLive}
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>

      <ImpactCalculator />
    </div>
  );
};
