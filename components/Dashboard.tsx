
import React, { useState, useContext, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { getFinancialData, PROJECT_MILESTONES, getProjectSummaryPrompt } from '../constants';
import { generateTextWithThinking, generateGroundedText, generateFinancialData, generateLocalizedMilestones } from '../services/geminiService';
import { Milestone, FinancialData } from '../types';
import { AppContext } from '../contexts/AppContext';
import { useI18n } from '../hooks/useI18n';
import { SpeakerIcon } from './shared/SpeakerIcon';
import { Feedback } from './shared/Feedback';
import { Spinner } from './shared/Loading';
import { SkeletonLoader } from './shared/SkeletonLoader';
import { extractJson } from '../utils/helpers';
import { Activity, ChevronDown, ChevronUp } from 'lucide-react';

const COLORS = ['#0ea5e9', '#0369a1', '#f97316', '#f59e0b', '#8b5cf6'];

const DataCard: React.FC<{ title: string; subtitle?: string; value: string; description: string; icon: React.ReactNode; }> = ({ title, subtitle, value, description, icon }) => {
  const { theme } = useContext(AppContext)!;
  return (
    <div className={`group relative bg-slate-900/60 backdrop-blur-xl p-6 rounded-2xl border border-white/10 transition-all duration-300 ease-in-out hover:scale-105 hover:bg-slate-800/80 hover:shadow-[0_0_30px_-10px_rgba(14,165,233,0.3)] hover:border-sky-500/30 cursor-pointer overflow-hidden`}>
      <div className="absolute inset-0 bg-gradient-to-br from-sky-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
      
      <div className="flex justify-between items-start relative z-10">
          <div className="flex-1">
              <h3 className={`text-sm font-bold ${theme.textAccent} uppercase tracking-wider`}>{title}</h3>
              {subtitle && <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wide font-medium">{subtitle}</p>}
          </div>
          <div className="p-2.5 rounded-xl bg-white/5 text-slate-400 group-hover:text-white group-hover:bg-sky-500/20 transition-all duration-300 shadow-inner">
            {icon}
          </div>
      </div>
      <p className="mt-4 text-3xl font-extrabold text-white tracking-tight relative z-10">{value}</p>
      <p className="mt-2 text-xs text-slate-400 truncate relative z-10">{description}</p>
      
      <div className={`opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 w-64 bg-slate-950/90 backdrop-blur-md border border-slate-700 p-3 rounded-lg shadow-2xl z-50 pointer-events-none`}>
        <p className={`text-xs font-bold text-sky-400 mb-1`}>{title}</p>
        <p className="text-xs text-slate-300 leading-relaxed">{description}</p>
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-[1px] w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-slate-950/90"></div>
      </div>
    </div>
  );
};

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
            className={`flex items-center justify-center px-4 py-2 bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-500 hover:to-sky-600 border border-sky-500/30 text-white font-semibold rounded-lg transition-all shadow-lg shadow-sky-900/20 disabled:opacity-70 disabled:cursor-not-allowed`}
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
    Completed: 'bg-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.5)]',
    'In Progress': 'bg-sky-500 shadow-[0_0_10px_rgba(14,165,233,0.5)]',
    Planned: 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]',
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
    const { theme } = useContext(AppContext)!;
    return (
        <div className="bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-white/5 h-full flex flex-col hover:border-white/10 transition-colors">
            <h3 className={`text-xl font-semibold ${theme.textAccent} mb-4 flex items-center gap-3`}>
                <div className="p-2 rounded-lg bg-white/5">
                    {icon}
                </div>
                {title}
            </h3>
            <ul className="space-y-3 mb-4">
                {data.metrics.map((item, index) => (
                    <li key={index} className="flex justify-between items-baseline border-b border-white/5 pb-2 last:border-0">
                        <span className="text-slate-400 text-sm">{item.metric}</span>
                        <span className="font-bold text-white text-lg">
                            {typeof item.value === 'number' ? item.value.toLocaleString() : item.value}
                            <span className="text-xs text-slate-500 ml-1 uppercase">{item.unit}</span>
                        </span>
                    </li>
                ))}
            </ul>
            <div className="mt-auto pt-4 border-t border-white/5">
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
            
            <div className="bg-slate-900/60 backdrop-blur-md p-8 rounded-2xl border border-white/10 space-y-6 flex flex-col md:flex-row items-center gap-8">
                 <div className="flex-grow w-full md:w-auto">
                    <label htmlFor="scale-slider" className="block text-sm font-medium text-slate-300 mb-4 flex justify-between">
                        {t('project_scale_mw')} 
                        <span className="font-bold text-sky-400 text-xl">{scale} MW</span>
                    </label>
                    <input 
                        id="scale-slider"
                        type="range"
                        min="1"
                        max="500"
                        step="1"
                        value={scale}
                        onChange={(e) => setScale(Number(e.target.value))}
                        className="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500 hover:accent-sky-400 transition-all"
                    />
                 </div>
                 <button 
                    onClick={handleCalculate} 
                    disabled={isLoading} 
                    className={`w-full md:w-auto flex-shrink-0 px-8 py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-sky-900/20 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed`}
                >
                    {isLoading ? (
                        <div className="flex items-center gap-2">
                            <Spinner size="sm" className="text-white" />
                            {t('calculating')}
                        </div>
                    ) : t('calculate_impact')}
                 </button>
            </div>
            
            {error && <p className="text-red-400 text-center bg-red-900/10 p-3 rounded-lg border border-red-900/30">{error}</p>}

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
    const [isVisible, setIsVisible] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        const hasSeenStatement = sessionStorage.getItem('gmel_statement_seen');
        if (!hasSeenStatement) {
            setIsVisible(true);
        }
    }, []);

    const handleDismiss = () => {
        sessionStorage.setItem('gmel_statement_seen', 'true');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className={`bg-[#0f172a] bg-gradient-to-r from-slate-900 to-slate-950 border border-sky-500/30 rounded-2xl p-8 mb-8 relative animate-pop-in shadow-[0_0_50px_-20px_rgba(14,165,233,0.3)] overflow-hidden transition-all duration-500`}>
            {/* Background decoration */}
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>
            
            <button onClick={handleDismiss} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors" aria-label="Dismiss">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            
            <h2 className={`text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-300 mb-6 tracking-tight font-serif`}>
                {t('gmel_statement_title')}
            </h2>
            
            <div className={`relative overflow-hidden transition-all duration-500 ${isExpanded ? 'max-h-[1000px]' : 'max-h-32'}`}>
                <div className="text-slate-300 text-sm leading-7 space-y-4 whitespace-pre-wrap font-light tracking-wide text-justify border-l-2 border-sky-500/30 pl-6">
                    {t('gmel_statement_body')}
                </div>
                {!isExpanded && (
                    <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#0f172a] to-transparent pointer-events-none" />
                )}
            </div>
            
            <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-4 flex items-center gap-2 text-sky-400 text-sm font-medium hover:text-sky-300 transition-colors"
            >
                {isExpanded ? (
                    <>Show Less <ChevronUp className="w-4 h-4" /></>
                ) : (
                    <>Read Full Manifesto <ChevronDown className="w-4 h-4" /></>
                )}
            </button>
        </div>
    );
};


export const Dashboard: React.FC = () => {
    const { region, lang, theme, setActiveView, setError } = useContext(AppContext)!;
    const { t } = useI18n();
    const [strategicAnalysis, setStrategicAnalysis] = useState('');
    const [summary, setSummary] = useState('');
    const [isSummaryLoading, setIsSummaryLoading] = useState(false);

    const [financialData, setFinancialData] = useState<FinancialData[]>([]);
    const [isFinancialLoading, setIsFinancialLoading] = useState(false);
    const [milestones, setMilestones] = useState<Milestone[]>(PROJECT_MILESTONES);

    useEffect(() => {
        const fetchInitialData = async () => {
            setFinancialData([]); 
            setIsFinancialLoading(true);
            try {
                if (lang === 'en') {
                    setFinancialData(getFinancialData(region));
                } else {
                    const data = await generateFinancialData(region, lang);
                    setFinancialData(data);
                }

                const localMilestones = await generateLocalizedMilestones(lang);
                setMilestones(localMilestones);

            } catch (e: any) {
                console.error("Failed to fetch initial dashboard data", e);
                setFinancialData(getFinancialData(region));
                if (lang !== 'en') {
                    setError("Could not retrieve localized data. Displaying English fallback.");
                }
            } finally {
                setIsFinancialLoading(false);
            }
        };

        fetchInitialData();
        setSummary('');
        setStrategicAnalysis('');
    }, [region, lang]); 

    const handleRefreshData = async () => {
        setIsFinancialLoading(true);
        setError(null);
        try {
            const data = await generateFinancialData(region, lang);
            setFinancialData(data);
        } catch (e: any) {
            setError(e.message || "Failed to refresh financial data.");
        } finally {
            setIsFinancialLoading(false);
        }
    };

    const fetchSummary = async () => {
        setIsSummaryLoading(true);
        const prompt = getProjectSummaryPrompt(region, lang);
        const result = await generateGroundedText(prompt);
        setSummary(result.text);
        setIsSummaryLoading(false);
    };

    const chartData = useMemo(() => {
        return financialData
            .filter(d => d.id !== 'payback' && d.id !== 'roi') 
            .map(d => ({
            name: d.component.split(' ')[0],
            fullName: d.component,
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
        return cardIcons[id] || cardIcons['revenue'];
    };

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className={`bg-slate-900/90 backdrop-blur-md border border-slate-700 p-4 rounded-lg shadow-2xl max-w-xs z-50`}>
                    <p className={`font-bold text-sky-400 mb-1`}>{data.fullName}</p>
                    <p className="text-white text-lg font-semibold">
                        {data.value.toLocaleString()} <span className="text-sm text-slate-400">{data.unit.replace('Billion Toman', 'B').replace('Million USD', 'M')}</span>
                    </p>
                    <p className="text-slate-400 text-xs mt-2 italic border-t border-slate-700 pt-2">{data.description}</p>
                </div>
            );
        }
        return null;
    };

    const axisUnit = chartData.length > 0 && chartData[0].unit?.includes('USD') ? " M" : " B";
  
    return (
    <div className="space-y-8">
      <GMELStatementBanner />
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-3xl font-bold text-white tracking-tight">{t('dashboard_title', { region })}</h1>
          <button
              onClick={handleRefreshData}
              disabled={isFinancialLoading}
              className={`flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-white/10 text-white font-medium rounded-lg transition-all text-sm disabled:opacity-70 disabled:cursor-not-allowed ${isFinancialLoading ? 'animate-pulse border-sky-500/30' : ''}`}
          >
              {isFinancialLoading ? (
                  <Spinner size="sm" className="text-sky-400" />
              ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
              )}
              Refresh Data
          </button>
      </div>
      
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-sky-400" />
            Geothermal Potential Metrics
            {isFinancialLoading && financialData.length > 0 && <Spinner size="sm" className="ml-2 text-slate-400" />}
        </h2>
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 ${isFinancialLoading && financialData.length > 0 ? 'opacity-60 transition-opacity duration-300' : ''}`}>
            {isFinancialLoading && financialData.length === 0 ? (
                [...Array(5)].map((_, i) => (
                    <div key={i} className="bg-slate-900/60 p-6 rounded-2xl border border-white/5 h-48 flex flex-col justify-between">
                        <SkeletonLoader variant="text" />
                        <SkeletonLoader variant="rect" height="40px" className="mt-4" />
                        <SkeletonLoader variant="text" width="80%" className="mt-2" />
                    </div>
                ))
            ) : (
                financialData.map((item, index) => (
                <DataCard 
                    key={item.id}
                    title={item.component}
                    subtitle="Regional Economic Indicators"
                    value={`${item.value}${item.unit === 'Billion Toman' ? ' B' : ''}${item.unit === 'Years' ? ' Yrs' : ''}`}
                    description={item.description}
                    icon={getIconForCard(item.id)}
                />
                ))
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        <div className="lg:col-span-3 space-y-8">
            <div className="bg-slate-900/60 backdrop-blur-xl p-8 rounded-2xl border border-white/10 shadow-lg">
                <h2 className="text-xl font-semibold mb-6 text-white flex items-center">
                    {t('project_summary')}
                    <SpeakerIcon text={summary} />
                </h2>
                {isSummaryLoading ? (
                    <SkeletonLoader variant="text" count={4} />
                ) : summary ? (
                    <p className="text-slate-300 text-sm mb-8 leading-relaxed">{summary}</p>
                ) : (
                     <div className="text-center py-8 bg-slate-800/30 rounded-xl border border-dashed border-slate-700">
                        <p className="text-slate-400 mb-4 text-sm">Generate a comprehensive AI summary for {region}.</p>
                        <button onClick={fetchSummary} className={`px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-lg transition-all shadow-lg shadow-sky-900/20 text-sm`}>{t('generate_summary')}</button>
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
                    <div className={`mt-8 p-6 bg-slate-800/50 rounded-xl border border-white/5 animate-fade-in`}>
                         <h3 className={`font-semibold text-amber-400 mb-3 flex items-center`}>
                            {t('generated_strategic_analysis')}
                            <SpeakerIcon text={strategicAnalysis} />
                         </h3>
                         <p className="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">{strategicAnalysis}</p>
                         <Feedback sectionId={`strategic-analysis-${region}`} />
                    </div>
                )}
            </div>
             <div className="bg-slate-900/60 backdrop-blur-xl p-8 rounded-2xl border border-white/10 shadow-lg">
                <h2 className="text-xl font-semibold mb-6 text-white">{t('project_milestones')}</h2>
                <div className="space-y-8">
                    {milestones.map((milestone, index) => (
                        <MilestoneCard key={index} milestone={milestone} isLast={index === milestones.length - 1} />
                    ))}
                </div>
            </div>
        </div>

        <div className="lg:col-span-2 bg-slate-900/60 backdrop-blur-xl p-6 rounded-2xl border border-white/10 h-full shadow-lg flex flex-col">
            <h2 className="text-xl font-semibold mb-6 text-white">{t('financial_overview')}</h2>
            <div className="flex-grow flex items-center justify-center" style={{ minHeight: '300px' }}>
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                        <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} interval={0} />
                        <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} unit={axisUnit} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(255, 255, 255, 0.05)'}} />
                        <Legend wrapperStyle={{ color: '#94a3b8', paddingTop: '10px' }}/>
                        <Bar 
                            dataKey="value" 
                            name={t('financial_chart_legend')}
                            onClick={() => setActiveView('financials')}
                            radius={[4, 4, 0, 0]}
                        >
                            {chartData.map((entry, index) => (
                                <Cell 
                                    key={`cell-${index}`} 
                                    fill={theme.chartColors[index % theme.chartColors.length]} 
                                    className="cursor-pointer hover:opacity-80 transition-opacity"
                                />
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
