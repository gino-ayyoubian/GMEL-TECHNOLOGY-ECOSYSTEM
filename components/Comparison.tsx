
import React, { useState, useEffect, useContext } from 'react';
import { generateTextWithThinking, generateJsonWithThinking } from '../services/geminiService';
import { useI18n } from '../hooks/useI18n';
import { SpeakerIcon } from './shared/SpeakerIcon';
import { Feedback } from './shared/Feedback';
import { extractJson } from '../utils/helpers';
import { AppContext } from '../contexts/AppContext';
import { SkeletonLoader } from './shared/SkeletonLoader';
import { AuditService } from '../services/auditService';

interface ComparisonData {
    metric: string;
    qeshm: string | { [key: string]: any };
    makoo: string | { [key: string]: any };
}

// Helper to safely render content that might be an object
const renderCellContent = (content: any): string => {
    if (typeof content === 'object' && content !== null) {
        if (typeof content.value === 'string') {
            return content.value;
        }
        return JSON.stringify(content);
    }
    return String(content || '-');
};

export const Comparison: React.FC = () => {
    const { t } = useI18n();
    const { lang, currentUser } = useContext(AppContext)!;
    const [comparisonData, setComparisonData] = useState<ComparisonData[]>([]);
    const [narrative, setNarrative] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [strategicInsights, setStrategicInsights] = useState<string>('');
    const [isInsightsLoading, setIsInsightsLoading] = useState<boolean>(false);

    // Reset data when language changes to allow regeneration in the new language
    useEffect(() => {
        setComparisonData([]);
        setNarrative('');
        setStrategicInsights('');
        setError(null);
    }, [lang]);

    const fetchComparison = async () => {
        setIsLoading(true);
        setError(null);
        setComparisonData([]);
        setNarrative('');
        setStrategicInsights('');
        
        try {
            const prompt = t('comparison_prompt');
            const result = await generateJsonWithThinking(prompt);
            const parsedResult = extractJson(result);
            
            if (parsedResult && Array.isArray(parsedResult.table) && parsedResult.narrative) {
                setComparisonData(parsedResult.table);
                setNarrative(parsedResult.narrative);
                AuditService.log(currentUser || 'user', 'STRATEGIC_COMPARISON', 'Generated comparison analysis');
            } else {
                 console.error("Invalid comparison format:", parsedResult);
                 throw new Error("The AI response did not match the expected format. Please try again.");
            }
        } catch (e: any) {
            console.error("Failed to generate comparison:", e);
            setError(e.message || t('error_generating_comparison'));
            AuditService.log(currentUser || 'user', 'STRATEGIC_COMPARISON_FAILED', e.message, 'FAILURE');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateInsights = async () => {
        if (!narrative || comparisonData.length === 0) return;
        setIsInsightsLoading(true);
        setError(null);
        try {
            const context = `
                Based on the following comparison data:
                Table: ${JSON.stringify(comparisonData)}
                Narrative: ${narrative}

                Generate a deeper strategic analysis. For each region (Qeshm and Makoo), elaborate on the primary risks, hidden opportunities, and long-term strategic implications for KKM International. Go beyond the information already provided and infer potential outcomes. Structure your response in well-defined paragraphs.
            `;
            const result = await generateTextWithThinking(context);
            setStrategicInsights(result);
            AuditService.log(currentUser || 'user', 'STRATEGIC_INSIGHTS', 'Generated deep insights');
        } catch (e: any) {
             setError(e.message || 'Failed to generate insights.');
        } finally {
            setIsInsightsLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <h1 className="text-3xl font-bold text-white">{t('comparison_title')}</h1>
            <p className="text-slate-400 max-w-3xl">
                {t('comparison_description')}
            </p>
            
            {!comparisonData.length && !isLoading && (
                 <div className="text-center py-12 bg-slate-900/60 rounded-2xl border border-white/10 border-dashed">
                    <p className="text-slate-400 mb-6">Click below to generate a comprehensive AI comparison between Qeshm and Makoo Free Zones.</p>
                    <button onClick={fetchComparison} className="px-8 py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-sky-900/30 hover:scale-105">
                        {t('generate_analysis')}
                    </button>
                </div>
            )}

            {error && (
                <div className="bg-red-900/20 border border-red-500/50 p-4 rounded-xl text-center">
                    <p className="text-red-400 mb-3">{error}</p>
                    <button onClick={fetchComparison} className="text-sm text-white bg-red-600/80 hover:bg-red-500 px-4 py-2 rounded-lg transition-colors">
                        Retry Analysis
                    </button>
                </div>
            )}

            {isLoading && (
                <div className="w-full bg-slate-900/60 backdrop-blur-md rounded-2xl p-8 border border-white/10">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="h-8 bg-slate-700/50 rounded w-1/3 animate-pulse"></div>
                    </div>
                    <SkeletonLoader variant="table" count={1} />
                    <div className="mt-8 space-y-4">
                        <SkeletonLoader variant="text" count={3} />
                    </div>
                </div>
            )}

            {!isLoading && comparisonData.length > 0 && (
                <div className="space-y-8">
                    <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden shadow-xl">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-700/50">
                                <thead className="bg-slate-800/50">
                                    <tr>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">{t('metric')}</th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-sky-400 uppercase tracking-wider">Qeshm Free Zone</th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-amber-400 uppercase tracking-wider">Makoo Free Zone</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-transparent divide-y divide-slate-700/50">
                                    {comparisonData.map((row, index) => (
                                        <tr key={index} className="hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white bg-slate-800/20">{row.metric}</td>
                                            <td className="px-6 py-4 whitespace-pre-wrap text-sm text-slate-300 leading-relaxed">{renderCellContent(row.qeshm)}</td>
                                            <td className="px-6 py-4 whitespace-pre-wrap text-sm text-slate-300 leading-relaxed">{renderCellContent(row.makoo)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    
                    {narrative && (
                        <div className="bg-slate-900/60 backdrop-blur-md p-8 rounded-2xl border border-white/10 shadow-lg">
                            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
                                {t('narrative_summary')}
                                <SpeakerIcon text={narrative} />
                            </h2>
                            <p className="text-slate-300 whitespace-pre-wrap mb-8 leading-relaxed border-l-2 border-sky-500/30 pl-6">{narrative}</p>
                            
                            {!strategicInsights && !isInsightsLoading && (
                                <button onClick={handleGenerateInsights} className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-lg transition-all shadow-lg shadow-purple-900/20 hover:scale-105">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                                    </svg>
                                    {t('generate_deep_analysis')}
                                </button>
                            )}

                            {isInsightsLoading && (
                                <div className="mt-6">
                                    <SkeletonLoader variant="text" count={4} />
                                </div>
                            )}

                            {strategicInsights && (
                                <div className="mt-8 p-6 bg-slate-800/50 rounded-xl border border-purple-500/20 animate-fade-in">
                                    <h3 className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-4 flex items-center text-lg">
                                        {t('strategic_implications_title')}
                                        <SpeakerIcon text={strategicInsights} />
                                    </h3>
                                    <p className="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">{strategicInsights}</p>
                                    <Feedback sectionId="strategic-comparison-insights" />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
