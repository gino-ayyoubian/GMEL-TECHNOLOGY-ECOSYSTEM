import React, { useState, useMemo, useContext } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FINANCIAL_DATA, WATERMARK_TEXT, KKM_LOGO_DATA_URL } from '../constants';
import { generateGroundedText } from '../services/geminiService';
import { AppContext } from '../contexts/AppContext';
import { useI18n } from '../hooks/useI18n';
import { Feedback } from './shared/Feedback';

const COLORS = ['#0ea5e9', '#06b6d4', '#f59e0b', '#f97316', '#8b5cf6'];

export const Financials: React.FC = () => {
    const { region } = useContext(AppContext)!;
    const { t } = useI18n();
    const [analysis, setAnalysis] = useState<{text: string; sources: any[]}>({text: '', sources: []});
    const [isLoading, setIsLoading] = useState(false);
    
    const initialInvestment = (FINANCIAL_DATA.find(d => d.component === 'Qeshm Pilot Implementation Cost')?.value || 80) + 
                              (FINANCIAL_DATA.find(d => d.component === 'Initial R&D and Registration Cost')?.value || 5);
    const annualRevenue = FINANCIAL_DATA.find(d => d.component === 'Annual Pilot Revenue')?.value || 45;
    
    // Sensitivity states
    const [revenueSensitivity, setRevenueSensitivity] = useState(20); // +/- 20%
    const [investmentSensitivity, setInvestmentSensitivity] = useState(15); // +/- 15%

    const costData = FINANCIAL_DATA.filter(d => d.component.includes('Cost')).map(d => ({ name: d.component, value: d.value }));
    const revenueData = FINANCIAL_DATA.filter(d => d.component.includes('Revenue')).map(d => ({ name: d.component, value: d.value }));

    const pieData = [...costData, ...revenueData].map(d => ({ name: d.name, value: d.value }));
    
    const projectionData = useMemo(() => {
        const scenarios = { optimistic: [], baseline: [], pessimistic: [] };

        const optimisticRevenue = annualRevenue * (1 + revenueSensitivity / 100);
        const pessimisticRevenue = annualRevenue * (1 - revenueSensitivity / 100);
        
        const optimisticInvestment = initialInvestment * (1 - investmentSensitivity / 100);
        const pessimisticInvestment = initialInvestment * (1 + investmentSensitivity / 100);

        for (let i = 0; i < 10; i++) {
            const year = i + 1;
            scenarios.optimistic.push({ year, net: (optimisticRevenue * year) - optimisticInvestment });
            scenarios.baseline.push({ year, net: (annualRevenue * year) - initialInvestment });
            scenarios.pessimistic.push({ year, net: (pessimisticRevenue * year) - pessimisticInvestment });
        }
        
        const combinedData = scenarios.baseline.map((item, i) => ({
            year: item.year,
            optimistic: scenarios.optimistic[i].net,
            baseline: item.net,
            pessimistic: scenarios.pessimistic[i].net,
        }));

        return combinedData;
    }, [annualRevenue, initialInvestment, revenueSensitivity, investmentSensitivity]);


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
        try {
            const logoDataUrl = KKM_LOGO_DATA_URL;
            const doc = new jsPDF();
            
            const tableData = FINANCIAL_DATA.map(row => [row.component, row.value, row.unit, row.description]);
            const tableHeaders = ["Component", "Value", "Unit", "Description"];
    
            autoTable(doc, {
                head: [tableHeaders],
                body: tableData,
                didDrawPage: (data) => {
                    // Watermark
                    doc.saveGraphicsState();
                    doc.setGState(new (doc as any).GState({opacity: 0.05}));
                    
                    const pageWidth = doc.internal.pageSize.getWidth();
                    const pageHeight = doc.internal.pageSize.getHeight();
                    const centerX = pageWidth / 2;
                    const centerY = pageHeight / 2;

                    if (logoDataUrl) {
                        doc.addImage(logoDataUrl, 'JPEG', centerX - 50, centerY - 50, 100, 100);
                    }
                    
                    doc.setFontSize(20);
                    doc.setTextColor(150);
                    doc.text("KKM International Group - Confidential", centerX, centerY + 60, { align: 'center' });

                    doc.restoreGraphicsState();
                }
            });
            
            doc.setProperties({
                title: 'GMEL Financial Data',
                creator: 'KKM International Group',
            });
            doc.save('gmel_financial_data_secure.pdf');

        } catch (error) {
            console.error("Failed to generate PDF:", error);
            alert("An error occurred while creating the PDF file.");
        }
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
                                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120} label>
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                    <h2 className="text-xl font-semibold mb-4 text-white">{t('sensitivity_analysis')}</h2>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label htmlFor="revenueSensitivity" className="block text-sm font-medium text-slate-400">{t('revenue_variation')} (+/- {revenueSensitivity}%)</label>
                            <input
                                type="range"
                                id="revenueSensitivity"
                                min="0"
                                max="50"
                                value={revenueSensitivity}
                                onChange={(e) => setRevenueSensitivity(Number(e.target.value))}
                                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>
                         <div>
                            <label htmlFor="investmentSensitivity" className="block text-sm font-medium text-slate-400">{t('investment_variation')} (+/- {investmentSensitivity}%)</label>
                            <input
                                type="range"
                                id="investmentSensitivity"
                                min="0"
                                max="50"
                                value={investmentSensitivity}
                                onChange={(e) => setInvestmentSensitivity(Number(e.target.value))}
                                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>
                    </div>
                    <div style={{ width: '100%', height: 250 }}>
                         <ResponsiveContainer>
                            <LineChart data={projectionData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                                <XAxis dataKey="year" tick={{ fill: '#94a3b8' }} unit=" yr"/>
                                <YAxis tick={{ fill: '#94a3b8' }} unit=" B"/>
                                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
                                <Legend />
                                <Line type="monotone" dataKey="optimistic" name={t('optimistic_scenario')} stroke="#22c55e" strokeWidth={2} dot={false} />
                                <Line type="monotone" dataKey="baseline" name={t('baseline_scenario')} stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" />
                                <Line type="monotone" dataKey="pessimistic" name={t('pessimistic_scenario')} stroke="#ef4444" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

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