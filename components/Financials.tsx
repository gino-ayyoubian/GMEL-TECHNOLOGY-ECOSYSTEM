import React, { useState, useMemo, useContext } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FINANCIAL_DATA, WATERMARK_TEXT, KKM_LOGO_DATA_URL } from '../constants';
import { generateTextWithThinking } from '../services/geminiService';
import { AppContext } from '../contexts/AppContext';
import { useI18n } from '../hooks/useI18n';
import { Feedback } from './shared/Feedback';

const COLORS = ['#0ea5e9', '#0369a1', '#f97316', '#f59e0b', '#8b5cf6'];

export const Financials: React.FC = () => {
    const { lang } = useContext(AppContext)!;
    const { t } = useI18n();
    const [analysis, setAnalysis] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const baseInitialInvestment = FINANCIAL_DATA.find(d => d.component === 'Pilot CAPEX (5MW)')?.value || 575;
    const baseAnnualRevenue = FINANCIAL_DATA.find(d => d.component === 'Annual Revenue (5MW)')?.value || 390;
    
    // Custom projection states
    const [customAnnualRevenue, setCustomAnnualRevenue] = useState(baseAnnualRevenue);
    const [customInitialInvestment, setCustomInitialInvestment] = useState(baseInitialInvestment);

    const barData = FINANCIAL_DATA.filter(d => d.component.includes('CAPEX') || d.component.includes('Revenue'))
        .map(d => ({ name: d.component, value: d.value }));

    const projectionData = useMemo(() => {
        const data = [];
        const optimisticRevenue = customAnnualRevenue * 1.2;
        const pessimisticRevenue = customAnnualRevenue * 0.8;
        const optimisticInvestment = customInitialInvestment * 0.9;
        const pessimisticInvestment = customInitialInvestment * 1.1;

        for (let i = 0; i < 11; i++) { // From year 0 to 10
            data.push({ 
                year: i,
                baseline: (customAnnualRevenue * i) - customInitialInvestment,
                optimistic: (optimisticRevenue * i) - optimisticInvestment,
                pessimistic: (pessimisticRevenue * i) - pessimisticInvestment,
            });
        }
        return data;
    }, [customAnnualRevenue, customInitialInvestment]);

    // Enhanced tooltip providing Net Revenue, Cumulative ROI, and Payback Period.
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
        setError(null);
        setAnalysis('');
        try {
            const prompt = t('financial_summary_prompt');
            const result = await generateTextWithThinking(prompt);
            setAnalysis(result);
        } catch (e: any) {
            setError(e.message || t('error_no_analysis'));
        } finally {
            setIsLoading(false);
        }
    }

    const handleExport = async () => {
        const doc = new jsPDF();
        
        if (lang === 'fa') {
            doc.setFont('Amiri', 'normal');
            doc.setR2L(true);
        }

        const tableData = FINANCIAL_DATA.map(row => [row.component, row.value, row.unit, row.description]);
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
            doc.text(text, doc.internal.pageSize.getWidth() / 2, doc.internal.pageSize.getHeight() / 2, { align: 'center', angle: 45 });
            if (KKM_LOGO_DATA_URL) {
                doc.addImage(KKM_LOGO_DATA_URL, 'JPEG', doc.internal.pageSize.getWidth() / 2 - 50, doc.internal.pageSize.getHeight() / 2 - 90, 100, 100, undefined, 'FAST');
            }
            doc.restoreGraphicsState();

            doc.setFontSize(8);
            doc.setTextColor(100);
            const footerText = `Generated on: ${new Date().toLocaleString()} | Page ${i} of ${totalPages}`;
            doc.text(footerText, 14, doc.internal.pageSize.getHeight() - 10);
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
                    <h2 className="text-xl font-semibold mb-4 text-white">{t('capex_vs_revenue_title')}</h2>
                    <div style={{ width: '100%', height: 350 }}>
                        <ResponsiveContainer>
                            <BarChart data={barData} layout="vertical" margin={{ top: 20, right: 30, left: 100, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                                <XAxis type="number" tick={{ fill: '#94a3b8' }} unit=" B Toman" />
                                <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8' }} width={150} interval={0} />
                                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} cursor={{ fill: 'rgba(71, 85, 105, 0.5)' }} />
                                <Bar dataKey="value" name="Value" barSize={40}>
                                    {barData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index === 0 ? COLORS[2] : COLORS[0]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                    <h2 className="text-xl font-semibold mb-4 text-white">{t('net_revenue_projection_title')}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4 p-4 bg-slate-900/50 rounded-lg">
                        <div>
                            <label htmlFor="customAnnualRevenue" className="block text-sm font-medium text-slate-300">{t('custom_annual_revenue')}</label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <input
                                    type="number"
                                    id="customAnnualRevenue"
                                    value={customAnnualRevenue}
                                    onChange={(e) => setCustomAnnualRevenue(Number(e.target.value) || 0)}
                                    className="w-full bg-slate-700 border-slate-600 rounded-md py-2 px-3 text-white"
                                />
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <span className="text-slate-400 sm:text-sm">B Toman</span>
                                </div>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="customInitialInvestment" className="block text-sm font-medium text-slate-300">{t('custom_initial_investment')}</label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <input
                                    type="number"
                                    id="customInitialInvestment"
                                    value={customInitialInvestment}
                                    onChange={(e) => setCustomInitialInvestment(Number(e.target.value) || 0)}
                                    className="w-full bg-slate-700 border-slate-600 rounded-md py-2 px-3 text-white"
                                />
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <span className="text-slate-400 sm:text-sm">B Toman</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div style={{ width: '100%', height: 250 }}>
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

            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                 <h2 className="text-xl font-semibold mb-4 text-white">{t('financial_summary_title')}</h2>
                 <p className="text-sm text-slate-400 mb-4">{t('financial_summary_description')}</p>
                 <button onClick={handleAnalysis} disabled={isLoading} className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:bg-sky-400">
                    {isLoading ? t('analyzing') : t('generate_analysis')}
                 </button>
                 {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
                 {analysis && (
                     <div className="mt-6 p-4 bg-slate-900 rounded-lg">
                         <p className="text-slate-300 whitespace-pre-wrap">{analysis}</p>
                         <Feedback sectionId={`financial-summary`} />
                     </div>
                 )}
            </div>
        </div>
    );
};