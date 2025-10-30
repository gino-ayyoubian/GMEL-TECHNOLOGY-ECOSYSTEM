import React, { useState, useContext, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { getFinancialData, PROJECT_MILESTONES, getProjectSummaryPrompt } from '../constants';
import { generateTextWithThinking, generateGroundedText, generateJsonWithThinking } from '../services/geminiService';
import { Milestone } from '../types';
import { AppContext } from '../contexts/AppContext';
import { useI18n } from '../hooks/useI18n';
import { SpeakerIcon } from './shared/SpeakerIcon';
import { Feedback } from './shared/Feedback';

const COLORS = ['#0ea5e9', '#0369a1', '#f97316', '#f59e0b', '#8b5cf6'];

// Helper to extract a JSON object from a string that might contain markdown or other text.
const extractJson = (text: string): any | null => {
    const firstBrace = text.indexOf('{');
    const firstBracket = text.indexOf('[');
    let start = -1;

    if (firstBrace === -1 && firstBracket === -1) return null;
    if (firstBrace === -1) start = firstBracket;
    else if (firstBracket === -1) start = firstBrace;
    else start = Math.min(firstBrace, firstBracket);
    
    const lastBrace = text.lastIndexOf('}');
    const lastBracket = text.lastIndexOf(']');
    let end = -1;
    
    if (lastBrace === -1 && lastBracket === -1) return null;
    if (lastBrace === -1) end = lastBracket;
    else if (lastBracket === -1) end = lastBrace;
    else end = Math.max(lastBrace, lastBracket);
    
    if (start === -1 || end === -1 || end < start) return null;

    const jsonString = text.substring(start, end + 1);
    try {
        return JSON.parse(jsonString);
    } catch (error) {
        console.error("Failed to parse extracted JSON string:", jsonString, error);
        return null;
    }
};

const DataCard: React.FC<{ title: string; value: string; description: string; icon: React.ReactNode; }> = ({ title, value, description, icon }) => (
  <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 transition-all duration-300 ease-in-out hover:scale-105 hover:bg-slate-700/50 hover:border-sky-500 cursor-pointer">
    <div className="flex justify-between items-start">
        <h3 className="text-sm font-medium text-sky-400 uppercase tracking-wider">{title}</h3>
        <span className="text-slate-600">{icon}</span>
    </div>
    <p className="mt-2 text-4xl font-bold text-white tracking-tight">{value}</p>
    <p className="mt-2 text-xs text-slate-500">{description}</p>
  </div>
);

const ThinkingButton: React.FC<{ prompt: string, onResult: (result: string) => void, onError: (error: string) => void }> = ({ prompt, onResult, onError }) => {
    const [isLoading, setIsLoading] = useState(false);
    const { t } = useI18n();

    const handleClick = async () => {
        setIsLoading(true);
        onError('');
        try {
            const result = await generateTextWithThinking(prompt);
            onResult(result);
        } catch (e: any) {
            onError(e.message || t('error_no_analysis'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleClick}
            disabled={isLoading}
            className="flex items-center justify-center px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg transition-colors disabled:bg-sky-400 disabled:cursor-not-allowed"
        >
            {isLoading ? (
                <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
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
    const getStatusIcon = (status: Milestone['status']) => {
        switch (status) {
            case 'Completed':
                return (
                    <div className="bg-teal-500 rounded-full p-1 milestone-completed">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    </div>
                );
            case 'In Progress':
                return (
                    <div className="bg-sky-500 rounded-full p-1">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0 3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                );
            case 'Planned':
                return (
                     <div className="bg-amber-500 rounded-full p-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                );
        }
    };

    return (
        <div className="relative ps-10">
            <div className="absolute top-0 start-0 w-6 h-6 flex items-center justify-center" title={milestone.status}>
                {getStatusIcon(milestone.status)}
            </div>
            {!isLast && <div className="absolute top-6 start-[11px] w-px h-full bg-slate-600"></div>}
            <p className="font-semibold text-white">{milestone.title} - <span className="text-slate-400 font-normal">{milestone.date}</span></p>
            <p className="text-sm text-slate-500 mt-1">{milestone.description}</p>
        </div>
    );
};


// --- Impact Calculator Components ---

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
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 h-full flex flex-col">
            <h3 className="text-xl font-semibold text-sky-400 mb-4 flex items-center gap-3">
                {icon}
                {title}
            </h3>
            <ul className="space-y-3 mb-4">
                {data.metrics.map((item, index) => (
                    <li key={index} className="flex justify-between items-baseline">
                        <span className="text-slate-300">{item.metric}</span>
                        <span className="font-bold text-white text-lg">
                            {typeof item.value === 'number' ? item.value.toLocaleString() : item.value}
                            <span className="text-sm text-slate-400 ml-1">{item.unit}</span>
                        </span>
                    </li>
                ))}
            </ul>
            <div className="mt-auto pt-4 border-t border-slate-700/50">
                <p className="text-sm text-slate-400 whitespace-pre-wrap flex items-start">
                     <span className="flex-grow">{data.narrative}</span>
                     <SpeakerIcon text={data.narrative} />
                </p>
            </div>
        </div>
    );
};


const ImpactCalculator: React.FC = () => {
    const { t } = useI18n();
    const [scale, setScale] = useState<number>(5);
    const [results, setResults] = useState<ImpactResults | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    
    const handleCalculate = async () => {
        setIsLoading(true);
        setError(null);
        setResults(null);

        const prompt = t('impact_generation_prompt', { scale });
        
        try {
            const result = await generateJsonWithThinking(prompt);
            const parsed = extractJson(result);
            if (parsed && parsed.economic && parsed.environmental && parsed.social) {
                setResults(parsed);
            } else {
                throw new Error("Invalid format received from API");
            }
        } catch (e: any) {
            setError(e.message || t('error_generating_impact_analysis'));
            console.error("Failed to parse impact JSON:", e);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold text-white">{t('impact_calculator_title')}</h2>
             <p className="text-slate-400 max-w-3xl">
                {t('impact_calculator_description')}
            </p>
            
            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 space-y-4 flex flex-col md:flex-row items-center gap-6">
                 <div className="flex-grow w-full md:w-auto">
                    <label htmlFor="scale-slider" className="block text-sm font-medium text-slate-300 mb-2">
                        {t('project_scale_mw')}: <span className="font-bold text-white text-lg">{scale} MW</span>
                    </label>
                    <input 
                        id="scale-slider"
                        type="range"
                        min="1"
                        max="500"
                        step="1"
                        value={scale}
                        onChange={(e) => setScale(Number(e.target.value))}
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                    />
                 </div>
                 <button 
                    onClick={handleCalculate} 
                    disabled={isLoading} 
                    className="w-full md:w-auto flex-shrink-0 px-8 py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg transition-colors disabled:bg-sky-800 disabled:cursor-not-allowed"
                >
                    {isLoading ? t('calculating') : t('calculate_impact')}
                 </button>
            </div>
            
            {error && <p className="text-red-400 text-center">{error}</p>}

            {isLoading && (
                <div className="text-center py-10">
                    <svg className="animate-spin h-8 w-8 text-white mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="mt-4 text-slate-400">{t('calculating_impact')}</p>
                </div>
            )}
            
            {results && (
                <div className="space-y-6">
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
        <div className="bg-slate-800 border border-sky-500/30 rounded-lg p-6 mb-8 relative animate-fade-in-down">
            <button onClick={handleDismiss} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors" aria-label="Dismiss">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <h2 className="text-2xl font-bold text-sky-400 mb-4">{t('gmel_statement_title')}</h2>
            <div className="max-h-64 overflow-y-auto pr-4 text-slate-300 text-sm space-y-4 whitespace-pre-wrap">
                <p>{t('gmel_statement_body')}</p>
            </div>
        </div>
    );
};


export const Dashboard: React.FC = () => {
    const { region } = useContext(AppContext)!;
    const { t } = useI18n();
    const [strategicAnalysis, setStrategicAnalysis] = useState('');
    const [summary, setSummary] = useState('');
    const [isSummaryLoading, setIsSummaryLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const financialData = useMemo(() => getFinancialData(region), [region]);

    const fetchSummary = async () => {
        setIsSummaryLoading(true);
        setError(null);
        try {
            const prompt = getProjectSummaryPrompt(region);
            const result = await generateGroundedText(prompt);
            setSummary(result.text);
        } catch (e: any) {
            setError(e.message || 'Failed to fetch summary.');
        } finally {
            setIsSummaryLoading(false);
        }
    };
    
    useEffect(() => {
        setSummary('');
        setStrategicAnalysis('');
        setError(null);
    }, [region]);

    const chartData = financialData.filter(d => d.unit !== 'Years' && d.unit !== 'Countries').map(d => ({
        name: d.component.split(' ')[0],
        value: d.value,
    }));

    const cardIcons: { [key: string]: React.ReactNode } = {
        'Pilot CAPEX (5MW)': <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
        'Annual Revenue (5MW)': <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
        'Payback Period': <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
        'Return on Investment (ROI)': <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01" /><path strokeLinecap="round" strokeLinejoin="round" d="M16 12h.01" /><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 14v-4" /></svg>,
        '10-Year NPV': <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    };
  
    return (
    <div className="space-y-8">
      <GMELStatementBanner />
      <h1 className="text-3xl font-bold text-white">{t('dashboard_title', { region })}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {financialData.map((item, index) => (
          <DataCard 
            key={index}
            title={item.component}
            value={`${item.value}${item.unit === 'Billion Toman' ? ' B' : ''}${item.unit === 'Years' ? ' Yrs' : ''}`}
            description={item.description}
            icon={cardIcons[item.component] || <div />}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        <div className="lg:col-span-3 space-y-8">
            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                <h2 className="text-xl font-semibold mb-4 text-white flex items-center">
                    {t('project_summary')}
                    <SpeakerIcon text={summary} />
                </h2>
                {isSummaryLoading ? (
                    <div className="space-y-2">
                        <div className="h-4 bg-slate-700 rounded w-full animate-pulse"></div>
                        <div className="h-4 bg-slate-700 rounded w-full animate-pulse"></div>
                        <div className="h-4 bg-slate-700 rounded w-3/4 animate-pulse"></div>
                    </div>
                ) : summary ? (
                    <p className="text-slate-400 text-sm mb-6 whitespace-pre-wrap">{summary}</p>
                ) : (
                     <div className="text-center py-4">
                        <p className="text-slate-500 mb-4">Click the button to generate a project summary for {region}.</p>
                        <button onClick={fetchSummary} className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg transition-colors">{t('generate_summary')}</button>
                    </div>
                )}

                {summary && !isSummaryLoading && (
                    <>
                        <ThinkingButton 
                            prompt={t('strategic_analysis_prompt', { region })}
                            onResult={setStrategicAnalysis}
                            onError={setError}
                        />
                        <Feedback sectionId={`summary-${region}`} />
                    </>
                )}

                {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

                {strategicAnalysis && (
                    <div className="mt-6 p-4 bg-slate-900 rounded-lg border border-sky-500/30">
                         <h3 className="font-semibold text-sky-400 mb-2 flex items-center">
                            {t('generated_strategic_analysis')}
                            <SpeakerIcon text={strategicAnalysis} />
                         </h3>
                         <p className="text-slate-300 text-sm whitespace-pre-wrap">{strategicAnalysis}</p>
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

        <div className="lg:col-span-2 bg-slate-800 p-6 rounded-lg border border-slate-700 h-full">
            <h2 className="text-xl font-semibold mb-4 text-white">{t('financial_overview')}</h2>
            <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                    <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                        <XAxis dataKey="name" tick={{ fill: '#94a3b8' }} />
                        <YAxis tick={{ fill: '#94a3b8' }} unit=" B" />
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
                        <Legend wrapperStyle={{ color: '#94a3b8' }}/>
                        <Bar dataKey="value" name={t('financial_chart_legend')}>
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