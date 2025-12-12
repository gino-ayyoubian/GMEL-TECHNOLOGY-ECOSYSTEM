
import React, { useState, useMemo, useContext, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getFinancialData, KKM_LOGO_DATA_URL } from '../constants';
import { generateGroundedText, generateJsonWithThinking, generateFinancialData } from '../services/geminiService';
import { wsService } from '../services/webSocketService';
import { FinancialData } from '../types';
import { AppContext } from '../contexts/AppContext';
import { useI18n } from '../hooks/useI18n';
import { Feedback } from './shared/Feedback';
import { SpeakerIcon } from './shared/SpeakerIcon';
import ExportButtons from './shared/ExportButtons';
import { extractJson } from '../utils/helpers';
import { Spinner } from './shared/Loading';
import { SkeletonLoader } from './shared/SkeletonLoader';
import { Activity, Radio } from 'lucide-react';

const COLORS = ['#0ea5e9', '#0369a1', '#f97316', '#f59e0b', '#8b5cf6', '#10b981', '#6366f1'];

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null;

    return (
        <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="11" fontWeight="bold">
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
};

interface IPOData {
    projected_date: string;
    pre_ipo_valuation: string;
    expected_market_cap: string;
    narrative: string;
}

const IPOAnalysis: React.FC = () => {
    const { region, setError, supportedLangs, lang } = useContext(AppContext)!;
    const { t } = useI18n();
    const financialData = useMemo(() => getFinancialData(region), [region]);
    const [ipoData, setIpoData] = useState<IPOData | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setIpoData(null);
        setError(null);
    }, [region, lang, setError]);

    const handleGenerate = async () => {
        setIsLoading(true);
        setError(null);
        setIpoData(null);
        const langName = supportedLangs.find(l => l.code === lang)?.name || 'English';
        try {
            const prompt = t('ipo_analysis_prompt', {
                region: region,
                npv: financialData.find(d => d.id === 'npv')?.value || 0,
                revenue: financialData.find(d => d.id === 'revenue')?.value || 0,
                roi: financialData.find(d => d.id === 'roi')?.value || 0,
                payback: financialData.find(d => d.id === 'payback')?.value || 0,
                language: langName
            });
            const result = await generateJsonWithThinking(prompt);
            const parsed = extractJson(result);
            if(parsed && parsed.projected_date) {
                setIpoData(parsed);
            } else {
                throw new Error("Invalid format received from AI.");
            }
        } catch (e: any) {
            setError(e.message || "Failed to generate IPO analysis.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-slate-900/60 backdrop-blur-xl p-8 rounded-2xl border border-white/10">
            <h2 className="text-xl font-semibold mb-2 text-white">{t('ipo_analysis_title')}</h2>
            <p className="text-sm text-slate-400 mb-6">{t('ipo_analysis_desc')}</p>
            
            {!ipoData && (
                <button 
                    onClick={handleGenerate} 
                    disabled={isLoading}
                    className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-2 px-6 rounded-lg transition-colors disabled:bg-sky-800 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {isLoading ? <Spinner size="sm" className="text-white" /> : null}
                    {isLoading ? t('generating') : t('generate_ipo_analysis')}
                </button>
            )}
            
            {isLoading && !ipoData && (
                <div className="mt-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <SkeletonLoader variant="card" height="120px" count={3} />
                    </div>
                    <SkeletonLoader variant="text" count={3} />
                </div>
            )}

            {ipoData && (
                 <div className="mt-6 space-y-6 animate-fade-in">
                    <ExportButtons content={JSON.stringify(ipoData, null, 2)} title={`IPO_Forecast_${region}`} isJson={true} />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-slate-800/50 p-6 rounded-xl border border-white/5">
                            <h4 className="text-xs uppercase tracking-wide font-bold text-sky-400 mb-2">{t('projected_ipo_date')}</h4>
                            <p className="text-2xl font-bold text-white">{ipoData.projected_date}</p>
                        </div>
                         <div className="bg-slate-800/50 p-6 rounded-xl border border-white/5">
                            <h4 className="text-xs uppercase tracking-wide font-bold text-sky-400 mb-2">{t('pre_ipo_valuation')}</h4>
                            <p className="text-2xl font-bold text-white">{ipoData.pre_ipo_valuation}</p>
                        </div>
                         <div className="bg-slate-800/50 p-6 rounded-xl border border-white/5">
                            <h4 className="text-xs uppercase tracking-wide font-bold text-sky-400 mb-2">{t('expected_market_cap')}</h4>
                            <p className="text-2xl font-bold text-white">{ipoData.expected_market_cap}</p>
                        </div>
                    </div>
                     <div className="bg-slate-800/30 p-6 rounded-xl border border-white/5">
                        <h4 className="text-lg font-semibold text-white mb-2 flex items-center">{t('analyst_narrative')} <SpeakerIcon text={ipoData.narrative} /></h4>
                        <p className="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">{ipoData.narrative}</p>
                    </div>
                    <Feedback sectionId={`ipo-analysis-${region}`} />
                 </div>
            )}
        </div>
    );
};

interface RevenueStream {
    stream: string;
    percentage: number;
    value: number;
    assumptions: string;
}

interface RevenueStreamsData {
    table: RevenueStream[];
    narrative: string;
}

const RevenueStreamsAnalysis: React.FC = () => {
    const { region, setError, supportedLangs, lang } = useContext(AppContext)!;
    const { t } = useI18n();
    const financialData = useMemo(() => getFinancialData(region), [region]);
    const [data, setData] = useState<RevenueStreamsData | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setData(null);
        setError(null);
    }, [region, lang, setError]);

    const handleGenerate = async () => {
        setIsLoading(true);
        setError(null);
        setData(null);
        const langName = supportedLangs.find(l => l.code === lang)?.name || 'English';
        const annualRevenue = financialData.find(d => d.id === 'revenue')?.value || 390;
        const prompt = t('revenue_streams_prompt', { region, revenue: annualRevenue, language: langName });
        
        try {
            const result = await generateJsonWithThinking(prompt);
            const parsed = extractJson(result);
            if (parsed && parsed.table && parsed.narrative) {
                // Sanitize numeric values to avoid .toFixed() errors on strings
                parsed.table = parsed.table.map((item: any) => ({
                    ...item,
                    percentage: typeof item.percentage === 'string' ? parseFloat(item.percentage.replace(/[^0-9.-]/g, '')) || 0 : Number(item.percentage) || 0,
                    value: typeof item.value === 'string' ? parseFloat(item.value.replace(/[^0-9.-]/g, '')) || 0 : Number(item.value) || 0,
                }));
                setData(parsed);
            } else {
                throw new Error("Invalid format received from AI.");
            }
        } catch (e: any) {
            setError(e.message || "Failed to generate revenue breakdown.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-slate-900/60 backdrop-blur-xl p-8 rounded-2xl border border-white/10">
            <h2 className="text-xl font-semibold mb-2 text-white">{t('revenue_streams_title')}</h2>
            <p className="text-sm text-slate-400 mb-6">{t('revenue_streams_desc', { region })}</p>
            
            {!data && (
                <button 
                    onClick={handleGenerate} 
                    disabled={isLoading}
                    className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-2 px-6 rounded-lg transition-colors disabled:bg-sky-800 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {isLoading ? <Spinner size="sm" className="text-white" /> : null}
                    {isLoading ? t('generating') : t('generate_revenue_breakdown')}
                </button>
            )}

            {isLoading && !data && (
                <div className="mt-6 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                        <SkeletonLoader variant="circle" width="250px" height="250px" className="mx-auto" />
                        <SkeletonLoader variant="text" count={6} />
                    </div>
                    <SkeletonLoader variant="table" />
                </div>
            )}

            {data && (
                <div className="mt-6 space-y-8 animate-fade-in">
                    <ExportButtons content={JSON.stringify(data, null, 2)} title={`Revenue_Streams_${region}`} isJson={true} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                        <div className="bg-slate-800/30 p-4 rounded-xl border border-white/5">
                            <h3 className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wide text-center">{t('revenue_stream_chart_title')}</h3>
                             <div style={{ width: '100%', height: 250 }}>
                                <ResponsiveContainer>
                                    <PieChart>
                                        <Pie data={data.table} dataKey="percentage" nameKey="stream" cx="50%" cy="50%" outerRadius="70%" labelLine={false} label={renderCustomizedLabel}>
                                            {data.table.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0.5)" />)}
                                        </Pie>
                                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }} formatter={(value: number) => `${value.toFixed(1)}%`} />
                                        <Legend wrapperStyle={{fontSize: '12px'}}/>
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                        <div>
                             <h3 className="text-lg font-semibold text-white mb-3 flex items-center">{t('narrative_summary')} <SpeakerIcon text={data.narrative} /></h3>
                             <p className="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">{data.narrative}</p>
                        </div>
                    </div>
                    <div>
                        <div className="overflow-x-auto rounded-lg border border-slate-700">
                            <table className="min-w-full divide-y divide-slate-700">
                                <thead className="bg-slate-800/80">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">{t('stream')}</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">{t('contribution')}</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">{t('projected_value')}</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-300 uppercase tracking-wider w-2/5">{t('assumptions')}</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-slate-900/40 divide-y divide-slate-800/50">
                                    {data.table.map((row, index) => (
                                        <tr key={index} className="hover:bg-slate-800/30 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap font-medium text-white">{row.stream}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-slate-300">
                                                {typeof row.percentage === 'number' ? row.percentage.toFixed(1) : row.percentage}%
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sky-400 font-mono">
                                                {typeof row.value === 'number' ? row.value.toFixed(1) : row.value}
                                            </td>
                                            <td className="px-6 py-4 text-slate-400 text-sm">{row.assumptions}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                     <Feedback sectionId={`revenue-streams-${region}`} />
                </div>
            )}
        </div>
    );
}

const FundingSourcesAnalysis: React.FC = () => {
    const { region, setError, supportedLangs, lang, userRole } = useContext(AppContext)!;
    const { t } = useI18n();
    const [fundingData, setFundingData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    if (userRole !== 'admin') {
        return null;
    }

    useEffect(() => {
        setFundingData(null);
        setError(null);
    }, [region, lang, setError]);

    const handleGenerate = async () => {
        setIsLoading(true);
        setError(null);
        setFundingData(null);
        const langName = supportedLangs.find(l => l.code === lang)?.name || 'English';
        try {
            const prompt = t('funding_prompt', { region, language: langName });
            const result = await generateGroundedText(prompt);
            const parsed = extractJson(result.text);
            if (parsed && parsed.venture_capital) {
                setFundingData(parsed);
            } else {
                throw new Error("Invalid funding data format received from AI.");
            }
        } catch (e: any) {
            setError(e.message || "Failed to research funding sources.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const FundingCategory: React.FC<{ title: string; sources: any[]; color: string }> = ({ title, sources, color }) => (
        <div className="bg-slate-800/30 p-6 rounded-xl border border-white/5">
            <h3 className={`text-xl font-semibold mb-4 ${color}`}>{title}</h3>
            <div className="space-y-4">
                {sources.map((source, index) => (
                    <div key={index} className="bg-slate-900/50 p-4 rounded-lg border border-white/5 hover:border-white/10 transition-colors">
                        <h4 className="font-bold text-white text-lg">{source.name}</h4>
                        <div className="mt-2 space-y-1">
                            <p className="text-sm text-slate-300"><span className="text-slate-500 font-medium uppercase text-xs mr-2">{t('focus')}:</span> {source.focus}</p>
                            <p className="text-sm text-slate-300"><span className="text-slate-500 font-medium uppercase text-xs mr-2">{t('potential_fit')}:</span> {source.potential_fit}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="bg-slate-900/60 backdrop-blur-xl p-8 rounded-2xl border border-white/10">
            <h2 className="text-2xl font-bold text-white">{t('funding_sources_title')}</h2>
            <p className="text-slate-400 mt-2 mb-6 max-w-3xl">{t('funding_sources_desc')}</p>
            
            {!fundingData && (
                <button 
                    onClick={handleGenerate} 
                    disabled={isLoading}
                    className="px-6 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg transition-colors disabled:bg-sky-800 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {isLoading ? <Spinner size="sm" className="text-white" /> : null}
                    {isLoading ? t('analyzing') : t('research_funding')}
                </button>
            )}

            {isLoading && !fundingData && (
                <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <SkeletonLoader variant="card" count={3} height="300px" />
                </div>
            )}
            
            {fundingData && (
                <div className="mt-8 space-y-6 animate-fade-in">
                    <ExportButtons content={JSON.stringify(fundingData, null, 2)} title={`Funding_Sources_${region}`} isJson={true} />
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <FundingCategory title={t('venture_capital')} sources={fundingData.venture_capital} color="text-teal-400" />
                        <FundingCategory title={t('government_grants')} sources={fundingData.government_grants} color="text-sky-400" />
                        <FundingCategory title={t('international_funds')} sources={fundingData.international_funds} color="text-amber-400" />
                    </div>
                    <Feedback sectionId={`funding-analysis-${region}`} />
                </div>
            )}
        </div>
    );
};


export const Financials: React.FC = () => {
    const { region, lang, userRole, setError, supportedLangs } = useContext(AppContext)!;
    const { t } = useI18n();
    const [analysis, setAnalysis] = useState<{text: string; sources: any[]}>({text: '', sources: []});
    const [isLoading, setIsLoading] = useState(false);
    const [financialData, setFinancialData] = useState<FinancialData[]>(() => getFinancialData(region));
    const [isLive, setIsLive] = useState(true);
    
    useEffect(() => {
        const fetchInitialData = async () => {
            if (lang === 'en') {
                setFinancialData(getFinancialData(region));
            } else {
                try {
                    const data = await generateFinancialData(region, lang);
                    setFinancialData(data);
                } catch (e) {
                    console.error("Failed to translate financials", e);
                    setFinancialData(getFinancialData(region));
                }
            }
        };
        fetchInitialData();
        setAnalysis({text: '', sources: []});
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

    // Initialize state with values, will be updated by useEffect below
    const [customAnnualRevenue, setCustomAnnualRevenue] = useState(0);
    const [customInitialInvestment, setCustomInitialInvestment] = useState(0);
    const [inputErrors, setInputErrors] = useState({ investment: '', revenue: '' });

    // Sync state for interactive inputs when financialData updates (from region change or WebSocket)
    useEffect(() => {
        const currentInvestment = financialData.find(d => d.id === 'capex')?.value || 575;
        const currentRevenue = financialData.find(d => d.id === 'revenue')?.value || 390;
        
        // Only update if not currently editing (basic heuristic, could be improved)
        if (isLive) {
            setCustomInitialInvestment(currentInvestment);
            setCustomAnnualRevenue(currentRevenue);
        }
    }, [financialData, isLive]);
    
    const handleInvestmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setIsLive(false); // Pause live updates when user interacts
        const value = e.target.value;
        if (value === '') {
            setCustomInitialInvestment(0);
            setInputErrors(prev => ({ ...prev, investment: '' }));
            return;
        }
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
            if (numValue < 0) {
                setInputErrors(prev => ({ ...prev, investment: t('error_negative_value') }));
            } else {
                setCustomInitialInvestment(numValue);
                setInputErrors(prev => ({ ...prev, investment: '' }));
            }
        }
    };

    const handleRevenueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setIsLive(false); // Pause live updates when user interacts
        const value = e.target.value;
        if (value === '') {
            setCustomAnnualRevenue(0);
            setInputErrors(prev => ({ ...prev, revenue: '' }));
            return;
        }
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
            if (numValue < 0) {
                setInputErrors(prev => ({ ...prev, revenue: t('error_negative_value') }));
            } else {
                setCustomAnnualRevenue(numValue);
                setInputErrors(prev => ({ ...prev, revenue: '' }));
            }
        }
    };
    
    const calculatedPayback = useMemo(() => (customAnnualRevenue > 0 ? (customInitialInvestment / customAnnualRevenue) : Infinity), [customInitialInvestment, customAnnualRevenue]);
    const calculatedROI = useMemo(() => (customInitialInvestment > 0 ? (customAnnualRevenue / customInitialInvestment) * 100 : Infinity), [customInitialInvestment, customAnnualRevenue]);
    
    // Fix: Use IDs for filtering to handle translated data correctly
    const barChartData = useMemo(() => {
        return financialData
            .filter(d => ['capex', 'revenue', 'npv'].includes(d.id))
            .map(d => ({
                name: d.component.split('(')[0].trim(),
                value: d.value,
            }));
    }, [financialData]);

    // Fix: Use IDs for filtering pie chart data to handle translations
    const pieData = useMemo(() => {
        const costs = financialData.filter(d => d.id === 'capex').map(d => ({ name: d.component, value: d.value }));
        const revs = financialData.filter(d => d.id === 'revenue').map(d => ({ name: d.component, value: d.value }));
        return [...costs, ...revs];
    }, [financialData]);
    
    const projectionData = useMemo(() => {
        const data = [];
        const optimisticRevenue = customAnnualRevenue * 1.2;
        const pessimisticRevenue = customAnnualRevenue * 0.8;
        const optimisticInvestment = customInitialInvestment * 0.9;
        const pessimisticInvestment = customInitialInvestment * 1.1;

        for (let i = 0; i < 11; i++) {
            data.push({ 
                year: i,
                baseline: (customAnnualRevenue * i) - customInitialInvestment,
                optimistic: (optimisticRevenue * i) - optimisticInvestment,
                pessimistic: (pessimisticRevenue * i) - pessimisticInvestment,
            });
        }
        return data;
    }, [customAnnualRevenue, customInitialInvestment]);

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="p-3 bg-slate-900/90 backdrop-blur border border-slate-700 rounded-lg shadow-xl text-sm">
                    <p className="label text-slate-300 font-bold mb-1">{`Year ${label}`}</p>
                    {payload.map((p: any) => (
                         <p key={p.name} style={{ color: p.color }} className="font-mono">
                            {p.name}: {p.value.toFixed(1)} B Toman
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    const handleAnalysis = async () => {
        setIsLoading(true);
        setError(null);
        const langName = supportedLangs.find(l => l.code === lang)?.name || 'English';
        try {
            const prompt = t('market_analysis_prompt', { region, language: langName });
            const result = await generateGroundedText(prompt);
            setAnalysis({
                text: result.text ? `${result.text}` : t('error_no_analysis'),
                sources: result.sources
            });
        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsLoading(false);
        }
    }

    const handleExport = () => {
        const doc = new jsPDF();
        
        // Simple header
        doc.setFontSize(18);
        doc.text(`Financial Analysis: ${region}`, 14, 22);
        
        doc.setFontSize(12);
        doc.text("Core Financial Metrics", 14, 32);
        
        // Prepare table data
        const tableData = financialData.map(item => [
            item.component,
            `${item.value} ${item.unit}`,
            item.description
        ]);
        
        autoTable(doc, {
            startY: 36,
            head: [['Metric', 'Value', 'Description']],
            body: tableData,
        });
        
        // Custom scenario data
        const finalY = (doc as any).lastAutoTable.finalY + 10;
        doc.text("Interactive Scenario Parameters", 14, finalY);
        
        autoTable(doc, {
            startY: finalY + 4,
            head: [['Parameter', 'Value']],
            body: [
                ['Custom Initial Investment', `${customInitialInvestment} B Toman`],
                ['Custom Annual Revenue', `${customAnnualRevenue} B Toman`],
                ['Calculated ROI', isFinite(calculatedROI) ? `${calculatedROI.toFixed(1)}%` : 'N/A'],
                ['Calculated Payback', isFinite(calculatedPayback) ? `${calculatedPayback.toFixed(1)} Years` : 'N/A']
            ]
        });

        doc.save(`GMEL_Financial_Analysis_${region.replace(/\s/g, '_')}.pdf`);
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">{t('financial_analysis_title')}</h1>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
                        <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-slate-500'}`}></span>
                        <label className="text-xs text-slate-400 font-medium cursor-pointer flex items-center gap-2 select-none">
                            <input 
                                type="checkbox" 
                                checked={isLive} 
                                onChange={(e) => setIsLive(e.target.checked)} 
                                className="rounded border-slate-600 bg-slate-700 text-sky-500 focus:ring-sky-500/50" 
                            />
                            Live Market Data
                        </label>
                    </div>
                    {userRole === 'admin' && (
                        <div className="flex items-center gap-2">
                             <button 
                                onClick={handleExport}
                                className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium text-white transition-colors"
                             >
                                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                 PDF Export
                             </button>
                             <ExportButtons content={JSON.stringify(financialData, null, 2)} title={`Financial_Data_${region}`} isJson={true} />
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-slate-900/60 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-lg">
                    <h2 className="text-xl font-semibold mb-4 text-white">Key Financial Metrics</h2>
                    <div style={{ width: '100%', height: 350 }}>
                        <ResponsiveContainer>
                            <BarChart data={barChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} angle={-15} textAnchor="end" height={50} interval={0} />
                                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} unit={financialData[0]?.unit.includes('Toman') ? " B" : " M"} />
                                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }} cursor={{fill: 'rgba(255, 255, 255, 0.05)'}}/>
                                <Bar 
                                    dataKey="value" 
                                    name={financialData[0]?.unit} 
                                    radius={[4, 4, 0, 0]}
                                    isAnimationActive={!isLive} // Reduce jitter
                                >
                                    {barChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="bg-slate-900/60 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-lg space-y-6">
                    <div>
                        <h2 className="text-xl font-semibold text-white">{t('interactive_financial_model_title')}</h2>
                        <p className="text-sm text-slate-400 mt-1">{t('interactive_financial_model_desc')}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="relative group">
                            <label htmlFor="customInitialInvestment" className="block text-sm font-medium text-slate-300 mb-2">{t('custom_initial_investment')}</label>
                            <input
                                type="number"
                                id="customInitialInvestment"
                                value={customInitialInvestment}
                                onChange={handleInvestmentChange}
                                className={`w-full bg-slate-800 border rounded-lg py-3 px-3 text-white font-mono text-lg transition-all focus:ring-2 focus:ring-sky-500 focus:border-sky-500 hover:border-slate-500 ${inputErrors.investment ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-600'}`}
                                min="0"
                            />
                            {inputErrors.investment && <p className="mt-1 text-xs text-red-400">{inputErrors.investment}</p>}
                        </div>
                        <div className="relative group">
                            <label htmlFor="customAnnualRevenue" className="block text-sm font-medium text-slate-300 mb-2">{t('custom_annual_revenue')}</label>
                            <input
                                type="number"
                                id="customAnnualRevenue"
                                value={customAnnualRevenue}
                                onChange={handleRevenueChange}
                                className={`w-full bg-slate-800 border rounded-lg py-3 px-3 text-white font-mono text-lg transition-all focus:ring-2 focus:ring-sky-500 focus:border-sky-500 hover:border-slate-500 ${inputErrors.revenue ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-600'}`}
                                min="0"
                            />
                             {inputErrors.revenue && <p className="mt-1 text-xs text-red-400">{inputErrors.revenue}</p>}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5 text-center transition-transform hover:scale-105 duration-300">
                            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">{t('calculated_roi')}</p>
                            <p className="text-3xl font-bold text-teal-400 font-mono">{isFinite(calculatedROI) ? `${calculatedROI.toFixed(1)}%` : 'N/A'}</p>
                        </div>
                        <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5 text-center transition-transform hover:scale-105 duration-300">
                            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">{t('calculated_payback')}</p>
                            <p className="text-3xl font-bold text-sky-400 font-mono">{isFinite(calculatedPayback) ? `${calculatedPayback.toFixed(1)} Yrs` : 'N/A'}</p>
                        </div>
                    </div>
                    <div style={{ width: '100%', height: 200 }}>
                         <ResponsiveContainer>
                            <LineChart data={projectionData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                <XAxis dataKey="year" tick={{ fill: '#94a3b8', fontSize: 11 }} unit=" yr" axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} unit=" B" axisLine={false} tickLine={false} />
                                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#f97316', strokeWidth: 1, strokeDasharray: '3 3' }} />
                                <Legend />
                                <Line type="monotone" dataKey="pessimistic" name={t('pessimistic_scenario')} stroke="#f43f5e" strokeWidth={2} dot={false} strokeDasharray="5 5" activeDot={{ r: 6 }} />
                                <Line type="monotone" dataKey="baseline" name={t('baseline_scenario')} stroke="#3b82f6" strokeWidth={3} dot={{r: 4, strokeWidth: 0, fill: '#3b82f6'}} activeDot={{ r: 6 }} />
                                <Line type="monotone" dataKey="optimistic" name={t('optimistic_scenario')} stroke="#22c55e" strokeWidth={2} dot={false} strokeDasharray="5 5" activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <RevenueStreamsAnalysis />

            <IPOAnalysis />

            <div className="bg-slate-900/60 backdrop-blur-xl p-8 rounded-2xl border border-white/10">
                 <h2 className="text-xl font-semibold mb-4 text-white">{t('market_analysis_for', { region })}</h2>
                 <p className="text-sm text-slate-400 mb-6">{t('market_analysis_description')}</p>
                 {!analysis.text && (
                    <button 
                        onClick={handleAnalysis} 
                        disabled={isLoading}
                        className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-2 px-6 rounded-lg transition-colors disabled:bg-sky-800 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isLoading ? <Spinner size="sm" className="text-white" /> : null}
                        {isLoading ? t('analyzing') : t('generate_analysis')}
                    </button>
                 )}
                 {isLoading && !analysis.text && <SkeletonLoader variant="text" count={6} className="mt-6" />}
                 {analysis.text && (
                     <div className="mt-6 p-6 bg-slate-800/50 rounded-xl border border-white/5 animate-fade-in">
                         <ExportButtons content={analysis.text} title={`Market_Analysis_${region}`} />
                         <p className="text-slate-300 whitespace-pre-wrap mt-4 leading-relaxed">{analysis.text}</p>
                         {analysis.sources.length > 0 && (
                            <div className="mt-6 pt-4 border-t border-white/5">
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">{t('sources')}:</h4>
                                <ul className="space-y-2">
                                {analysis.sources.map((source, i) => (
                                    <li key={i} className="text-xs text-slate-400 flex items-start gap-2">
                                        <span className="text-sky-500 mt-0.5">•</span>
                                        <a href={source.web?.uri} target="_blank" rel="noopener noreferrer" className="hover:text-sky-400 hover:underline transition-colors">
                                            {source.web?.title || source.web?.uri}
                                        </a>
                                    </li>
                                ))}
                                </ul>
                            </div>
                         )}
                         <Feedback sectionId={`market-analysis-${region}`} />
                     </div>
                 )}
            </div>

            <FundingSourcesAnalysis />
        </div>
    );
};
