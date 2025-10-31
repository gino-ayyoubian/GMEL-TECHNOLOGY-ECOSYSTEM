import React, { useState, useMemo, useContext, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getFinancialData, WATERMARK_TEXT, KKM_LOGO_DATA_URL } from '../constants';
import { generateGroundedText, generateJsonWithThinking } from '../services/geminiService';
import { AppContext } from '../contexts/AppContext';
import { useI18n } from '../hooks/useI18n';
import { Feedback } from './shared/Feedback';
import { SpeakerIcon } from './shared/SpeakerIcon';

const COLORS = ['#0ea5e9', '#0369a1', '#f97316', '#f59e0b', '#8b5cf6', '#10b981', '#6366f1'];

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null; // Don't render label for very small slices

    return (
        <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="12" fontWeight="bold">
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
};

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

interface IPOData {
    projected_date: string;
    pre_ipo_valuation: string;
    expected_market_cap: string;
    narrative: string;
}

const IPOAnalysis: React.FC = () => {
    const { region } = useContext(AppContext)!;
    const { t } = useI18n();
    const financialData = useMemo(() => getFinancialData(region), [region]);
    const [ipoData, setIpoData] = useState<IPOData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        setIsLoading(true);
        setError(null);
        setIpoData(null);
        try {
            const prompt = t('ipo_analysis_prompt', {
                region: region,
                npv: financialData.find(d => d.component === '10-Year NPV')?.value || 0,
                revenue: financialData.find(d => d.component === 'Annual Revenue (5MW)')?.value || 0,
                roi: financialData.find(d => d.component === 'Return on Investment (ROI)')?.value || 0,
                payback: financialData.find(d => d.component === 'Payback Period')?.value || 0,
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
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
            <h2 className="text-xl font-semibold mb-2 text-white">{t('ipo_analysis_title')}</h2>
            <p className="text-sm text-slate-400 mb-4">{t('ipo_analysis_desc')}</p>
            {!ipoData && (
                <button onClick={handleGenerate} disabled={isLoading} className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:bg-sky-400">
                    {isLoading ? t('analyzing') : t('generate_ipo_analysis')}
                </button>
            )}
            {isLoading && <p className="mt-4 text-slate-400">{t('analyzing')}...</p>}
            {error && <p className="mt-4 text-red-400">{error}</p>}
            {ipoData && (
                 <div className="mt-6 space-y-6 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-slate-900 p-4 rounded-lg">
                            <h4 className="text-sm font-medium text-sky-400">{t('projected_ipo_date')}</h4>
                            <p className="text-2xl font-bold text-white mt-1">{ipoData.projected_date}</p>
                        </div>
                         <div className="bg-slate-900 p-4 rounded-lg">
                            <h4 className="text-sm font-medium text-sky-400">{t('pre_ipo_valuation')}</h4>
                            <p className="text-2xl font-bold text-white mt-1">{ipoData.pre_ipo_valuation}</p>
                        </div>
                         <div className="bg-slate-900 p-4 rounded-lg">
                            <h4 className="text-sm font-medium text-sky-400">{t('expected_market_cap')}</h4>
                            <p className="text-2xl font-bold text-white mt-1">{ipoData.expected_market_cap}</p>
                        </div>
                    </div>
                     <div>
                        <h4 className="text-lg font-semibold text-white mb-2 flex items-center">{t('analyst_narrative')} <SpeakerIcon text={ipoData.narrative} /></h4>
                        <p className="text-slate-300 text-sm whitespace-pre-wrap">{ipoData.narrative}</p>
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
    const { region } = useContext(AppContext)!;
    const { t } = useI18n();
    const financialData = useMemo(() => getFinancialData(region), [region]);
    const [data, setData] = useState<RevenueStreamsData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        setIsLoading(true);
        setError(null);
        setData(null);

        const annualRevenue = financialData.find(d => d.component === 'Annual Revenue (5MW)')?.value || 390;
        const prompt = t('revenue_streams_prompt', { region, revenue: annualRevenue });
        
        try {
            const result = await generateJsonWithThinking(prompt);
            const parsed = extractJson(result);
            if (parsed && parsed.table && parsed.narrative) {
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
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
            <h2 className="text-xl font-semibold mb-2 text-white">{t('revenue_streams_title')}</h2>
            <p className="text-sm text-slate-400 mb-4">{t('revenue_streams_desc', { region })}</p>
            {!data && (
                <button onClick={handleGenerate} disabled={isLoading} className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:bg-sky-400">
                    {isLoading ? t('analyzing') : t('generate_revenue_breakdown')}
                </button>
            )}
            {isLoading && <p className="mt-4 text-slate-400">{t('analyzing')}...</p>}
            {error && <p className="mt-4 text-red-400">{error}</p>}

            {data && (
                <div className="mt-6 space-y-6 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                        <div>
                            <h3 className="text-lg font-semibold text-white mb-4">{t('revenue_stream_chart_title')}</h3>
                             <div style={{ width: '100%', height: 250 }}>
                                <ResponsiveContainer>
                                    <PieChart>
                                        <Pie data={data.table} dataKey="percentage" nameKey="stream" cx="50%" cy="50%" outerRadius="80%" labelLine={false} label={renderCustomizedLabel}>
                                            {data.table.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                        </Pie>
                                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} formatter={(value: number) => `${value.toFixed(1)}%`} />
                                        <Legend wrapperStyle={{fontSize: '12px'}}/>
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                        <div>
                             <h3 className="text-lg font-semibold text-white mb-2 flex items-center">{t('narrative_summary')} <SpeakerIcon text={data.narrative} /></h3>
                             <p className="text-slate-300 text-sm whitespace-pre-wrap">{data.narrative}</p>
                        </div>
                    </div>
                    <div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-700 text-sm">
                                <thead className="bg-slate-700/50">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">{t('stream')}</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">{t('contribution')}</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">{t('projected_value')}</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-slate-300 uppercase tracking-wider w-2/5">{t('assumptions')}</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-slate-800 divide-y divide-slate-700">
                                    {data.table.map((row, index) => (
                                        <tr key={index}>
                                            <td className="px-4 py-3 whitespace-nowrap font-medium text-white">{row.stream}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-slate-300">{row.percentage.toFixed(1)}%</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-slate-300">{row.value.toFixed(1)}</td>
                                            <td className="px-4 py-3 text-slate-400">{row.assumptions}</td>
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


export const Financials: React.FC = () => {
    const { region, lang } = useContext(AppContext)!;
    const { t } = useI18n();
    const [analysis, setAnalysis] = useState<{text: string; sources: any[]}>({text: '', sources: []});
    const [isLoading, setIsLoading] = useState(false);
    
    const financialData = useMemo(() => getFinancialData(region), [region]);

    const baseInitialInvestment = financialData.find(d => d.component === 'Pilot CAPEX (5MW)')?.value || 575;
    const baseAnnualRevenue = financialData.find(d => d.component === 'Annual Revenue (5MW)')?.value || 390;
    
    const [energyPriceModifier, setEnergyPriceModifier] = useState(0); // in percent
    const [opExModifier, setOpExModifier] = useState(0); // in percent

    useEffect(() => {
        setEnergyPriceModifier(0);
        setOpExModifier(0);
    }, [region]);

    const modifiedCapex = useMemo(() => baseInitialInvestment * (1 + opExModifier / 100), [baseInitialInvestment, opExModifier]);
    const modifiedRevenue = useMemo(() => baseAnnualRevenue * (1 + energyPriceModifier / 100), [baseAnnualRevenue, energyPriceModifier]);
    
    const calculatedPayback = useMemo(() => (modifiedRevenue > 0 ? (modifiedCapex / modifiedRevenue) : Infinity), [modifiedCapex, modifiedRevenue]);
    const calculatedROI = useMemo(() => (modifiedCapex > 0 ? (modifiedRevenue / modifiedCapex) * 100 : Infinity), [modifiedCapex, modifiedRevenue]);
    

    const costData = financialData.filter(d => d.component.includes('Cost') || d.component.includes('CAPEX')).map(d => ({ name: d.component, value: d.value }));
    const revenueData = financialData.filter(d => d.component.includes('Revenue')).map(d => ({ name: d.component, value: d.value }));

    const pieData = [...costData, ...revenueData].map(d => ({ name: d.name, value: d.value }));
    
    const projectionData = useMemo(() => {
        const data = [];
        const optimisticRevenue = modifiedRevenue * 1.2;
        const pessimisticRevenue = modifiedRevenue * 0.8;
        const optimisticInvestment = modifiedCapex * 0.9;
        const pessimisticInvestment = modifiedCapex * 1.1;

        for (let i = 0; i < 11; i++) { // From year 0 to 10
            data.push({ 
                year: i,
                baseline: (modifiedRevenue * i) - modifiedCapex,
                optimistic: (optimisticRevenue * i) - optimisticInvestment,
                pessimistic: (pessimisticRevenue * i) - pessimisticInvestment,
            });
        }
        return data;
    }, [modifiedRevenue, modifiedCapex]);

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="p-2 bg-slate-900 border border-slate-700 rounded-md shadow-lg text-sm">
                    <p className="label text-slate-300 font-bold">{`Year ${label}`}</p>
                    {payload.map((p: any) => (
                         <p key={p.name} style={{ color: p.color }}>
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
        const prompt = t('market_analysis_prompt', { region });
        const result = await generateGroundedText(prompt);
        setAnalysis({
            text: result.text ? `${result.text}` : t('error_no_analysis'),
            sources: result.sources
        });
        setIsLoading(false);
    }

    const handleExport = async () => {
        const doc = new jsPDF();
        
        if (lang === 'fa') {
            doc.setFont('Amiri', 'normal');
            doc.setR2L(true);
        }

        const tableData = financialData.map(row => [row.component, row.value, row.unit, row.description]);
        const tableHeaders = ["Component", "Value", "Unit", "Description"];

        autoTable(doc, {
            head: [tableHeaders],
            body: tableData,
            startY: 20,
            styles: { font: lang === 'fa' ? 'Amiri' : 'helvetica' },
            headStyles: { halign: 'center' },
            didDrawPage: (data) => {
                doc.setFontSize(18);
                doc.setTextColor(40);
                doc.text("GMEL Geothermal Vision - Financial Data", data.settings.margin.left, 15);
            },
            didParseCell: function (data) {
                if (lang === 'fa' && data.section === 'body') {
                    data.cell.styles.halign = 'right';
                }
            }
        });

        const totalPages = (doc as any).internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            doc.saveGraphicsState();
            doc.setGState(new (doc as any).GState({ opacity: 0.08 }));
            doc.setFontSize(45);
            doc.setTextColor(150);
            const text = "KKM Int'l | Seyed Gino Ayyoubian | info@kkm-intl.xyz";
            const centerX = doc.internal.pageSize.getWidth() / 2;
            const centerY = doc.internal.pageSize.getHeight() / 2;
            doc.text(text, centerX, centerY, { align: 'center', angle: 45 });
            if (KKM_LOGO_DATA_URL) {
                doc.addImage(KKM_LOGO_DATA_URL, 'JPEG', centerX - 50, centerY - 90, 100, 100, undefined, 'FAST');
            }
            doc.restoreGraphicsState();
            doc.setFontSize(8);
            doc.setTextColor(100);
            doc.text(`Generated on: ${new Date().toLocaleString()} | Page ${i} of ${totalPages}`, 14, doc.internal.pageSize.getHeight() - 10);
        }
        doc.setProperties({
            title: 'GMEL Financial Data (Confidential)',
            creator: 'KKM International Group',
        });
        doc.save(`KKM_GMEL_Financials_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">{t('financial_analysis_title')}</h1>
                <button onClick={handleExport} className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded-lg text-sm flex items-center gap-2 transition-colors">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    {t('export_secure_pdf')}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                    <h2 className="text-xl font-semibold mb-4 text-white">{t('cost_revenue_breakdown')}</h2>
                    <div style={{ width: '100%', height: 350 }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie 
                                    data={pieData} 
                                    dataKey="value" 
                                    nameKey="name" 
                                    cx="50%" 
                                    cy="50%" 
                                    outerRadius="80%" 
                                    labelLine={false}
                                    label={renderCustomizedLabel}
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
                                <Legend wrapperStyle={{fontSize: '12px'}}/>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 space-y-4">
                    <h2 className="text-xl font-semibold text-white">{t('interactive_financial_model_title')}</h2>
                    <p className="text-sm text-slate-400 -mt-2">{t('interactive_financial_model_desc')}</p>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300">{t('energy_price_modifier')}: <span className="font-bold text-sky-400">{energyPriceModifier.toFixed(0)}%</span></label>
                            <input type="range" min="-50" max="50" value={energyPriceModifier} onChange={(e) => setEnergyPriceModifier(Number(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer" />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-300">{t('opex_modifier')}: <span className="font-bold text-amber-400">{opExModifier.toFixed(0)}%</span></label>
                            <input type="range" min="-20" max="20" value={opExModifier} onChange={(e) => setOpExModifier(Number(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-2">
                        <div className="bg-slate-900 p-3 rounded-lg text-center">
                            <p className="text-xs text-slate-400">{t('calculated_roi')}</p>
                            <p className="text-2xl font-bold text-white">{isFinite(calculatedROI) ? `${calculatedROI.toFixed(1)}%` : 'N/A'}</p>
                        </div>
                        <div className="bg-slate-900 p-3 rounded-lg text-center">
                            <p className="text-xs text-slate-400">{t('calculated_payback')}</p>
                            <p className="text-2xl font-bold text-white">{isFinite(calculatedPayback) ? `${calculatedPayback.toFixed(1)} Yrs` : 'N/A'}</p>
                        </div>
                    </div>
                    <div style={{ width: '100%', height: 200 }}>
                         <ResponsiveContainer>
                            <LineChart data={projectionData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                                <XAxis dataKey="year" tick={{ fill: '#94a3b8' }} unit=" yr"/>
                                <YAxis tick={{ fill: '#94a3b8' }} unit=" B"/>
                                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#f97316', strokeWidth: 1, strokeDasharray: '3 3' }} />
                                <Legend />
                                <Line type="monotone" dataKey="pessimistic" name={t('pessimistic_scenario')} stroke="#f43f5e" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                                <Line type="monotone" dataKey="baseline" name={t('baseline_scenario')} stroke="#3b82f6" strokeWidth={2} dot={{r: 4}} />
                                <Line type="monotone" dataKey="optimistic" name={t('optimistic_scenario')} stroke="#22c55e" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <RevenueStreamsAnalysis />

            <IPOAnalysis />

            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                 <h2 className="text-xl font-semibold mb-4 text-white">{t('market_analysis_for', { region })}</h2>
                 <p className="text-sm text-slate-400 mb-4">{t('market_analysis_description')}</p>
                 <button onClick={handleAnalysis} disabled={isLoading} className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:bg-sky-400">
                    {isLoading ? t('analyzing') : t('generate_analysis')}
                 </button>
                 {analysis.text && (
                     <div className="mt-6 p-4 bg-slate-900 rounded-lg">
                         <p className="text-slate-300 whitespace-pre-wrap">{analysis.text}</p>
                         {analysis.sources.length > 0 && (
                            <div className="mt-4">
                                <h4 className="text-sm font-semibold text-slate-400">{t('sources')}:</h4>
                                <ul className="list-disc list-inside mt-2 text-xs text-slate-500 space-y-1">
                                {analysis.sources.map((source, i) => (
                                    <li key={i}>
                                        <a href={source.web?.uri} target="_blank" rel="noopener noreferrer" className="hover:text-sky-400 hover:underline">
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
        </div>
    );
};