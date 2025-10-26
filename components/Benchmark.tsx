import React, { useState, useEffect, useContext } from 'react';
import { generateTextWithThinking } from '../services/geminiService';
import { AppContext } from '../contexts/AppContext';
import { useI18n } from '../hooks/useI18n';
import { SpeakerIcon } from './shared/SpeakerIcon';
import { Feedback } from './shared/Feedback';

const baseRegions = ["Iceland", "Turkey (Denizli/Aydin)", "USA (California's Salton Sea)", "Germany (Bavaria)"];
const comparisonRegions = ["Qeshm Free Zone", "Makoo Free Zone", ...baseRegions];

interface ComparisonResult {
    table: {
        metric: string;
        region1: string | { [key: string]: any };
        region2: string | { [key: string]: any };
    }[];
    narrative: string;
}

// Helper to safely render content that might be an object
const renderCellContent = (content: any): string => {
    if (typeof content === 'object' && content !== null) {
        if (typeof content.value === 'string') {
            return content.value;
        }
        return JSON.stringify(content);
    }
    return String(content);
};


export const Benchmark: React.FC = () => {
    const { region: projectRegion } = useContext(AppContext)!; // Not used directly, but keeps regions consistent if needed later
    const { t } = useI18n();
    
    const [region1, setRegion1] = useState<string>('Qeshm Free Zone');
    const [region2, setRegion2] = useState<string>('Iceland');
    const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const handleCompare = async (r1: string, r2: string) => {
        if (r1 === r2) {
            setError(t('error_select_different_regions'));
            return;
        }
        setIsLoading(true);
        setError(null);
        setComparisonResult(null);

        const prompt = t('benchmark_comparison_prompt', { region1: r1, region2: r2 });
        const result = await generateTextWithThinking(prompt);
        
        try {
            // Gemini sometimes wraps the JSON in markdown, so we need to clean it
            const cleanResult = result.replace(/```json/g, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(cleanResult);

            if (parsed.table && parsed.narrative) {
                setComparisonResult(parsed);
            } else {
                throw new Error("Invalid format received from API");
            }
        } catch (e) {
            setError(t('error_generating_comparison'));
            console.error("Failed to parse comparison JSON:", e, "Raw result:", result);
        } finally {
            setIsLoading(false);
        }
    };

    // Load initial comparison on component mount
    useEffect(() => {
        handleCompare(region1, region2);
    }, [t]); // Depend on 't' to re-fetch if language changes, ensuring prompt is correct

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-white">{t('benchmark_title')}</h1>
            <p className="text-slate-400 max-w-3xl">
                {t('benchmark_description')}
            </p>

            <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 flex flex-col md:flex-row items-center justify-center gap-4">
                <div>
                    <label htmlFor="region1" className="sr-only">{t('select_region_1')}</label>
                    <select id="region1" value={region1} onChange={e => setRegion1(e.target.value)} className="bg-slate-700 border-slate-600 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 text-sm text-white font-semibold">
                        {comparisonRegions.map(r => <option key={`r1-${r}`} value={r}>{r}</option>)}
                    </select>
                </div>
                <span className="text-slate-400 font-bold">VS</span>
                <div>
                     <label htmlFor="region2" className="sr-only">{t('select_region_2')}</label>
                    <select id="region2" value={region2} onChange={e => setRegion2(e.target.value)} className="bg-slate-700 border-slate-600 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 text-sm text-white font-semibold">
                        {comparisonRegions.map(r => <option key={`r2-${r}`} value={r}>{r}</option>)}
                    </select>
                </div>
                <button onClick={() => handleCompare(region1, region2)} disabled={isLoading} className="px-6 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg transition-colors disabled:bg-sky-400">
                    {isLoading ? t('analyzing') : t('compare_regions')}
                </button>
            </div>
            
            {error && <p className="text-red-400 text-center">{error}</p>}

            {isLoading ? (
                 <div className="w-full bg-slate-800 rounded-lg p-6 border border-slate-700 animate-pulse">
                    <div className="h-6 bg-slate-700 rounded w-1/4 mb-6"></div>
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="grid grid-cols-3 gap-4">
                                <div className="h-4 bg-slate-700 rounded col-span-1"></div>
                                <div className="h-4 bg-slate-700 rounded col-span-1"></div>
                                <div className="h-4 bg-slate-700 rounded col-span-1"></div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : comparisonResult && (
                <div className="space-y-8">
                    <h2 className="text-2xl font-semibold text-white">{t('comparison_between', { region1, region2 })}</h2>
                    <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
                         <table className="min-w-full divide-y divide-slate-700">
                            <thead className="bg-slate-700/50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">{t('metric')}</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">{region1}</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">{region2}</th>
                                </tr>
                            </thead>
                            <tbody className="bg-slate-800 divide-y divide-slate-700">
                                {comparisonResult.table.map((row, index) => (
                                    <tr key={index} className="hover:bg-slate-700/50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{row.metric}</td>
                                        <td className="px-6 py-4 whitespace-pre-wrap text-sm text-slate-400">{renderCellContent(row.region1)}</td>
                                        <td className="px-6 py-4 whitespace-pre-wrap text-sm text-slate-400">{renderCellContent(row.region2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                     <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                        <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                            {t('narrative_summary')}
                            <SpeakerIcon text={comparisonResult.narrative} />
                        </h2>
                         <p className="text-slate-300 whitespace-pre-wrap">{comparisonResult.narrative}</p>
                         <Feedback sectionId={`benchmark-comparison-${region1}-vs-${region2}`} />
                    </div>
                </div>
            )}
        </div>
    );
};