
import React, { useState, useEffect, useContext } from 'react';
import { generateTextWithThinking, generateJsonWithThinking } from '../services/geminiService';
import { useI18n } from '../hooks/useI18n';
import { SpeakerIcon } from './shared/SpeakerIcon';
import { Feedback } from './shared/Feedback';
import { extractJson } from '../utils/helpers';
import { AppContext } from '../contexts/AppContext';
import ExportButtons from './shared/ExportButtons';

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
    return String(content);
};

export const Comparison: React.FC = () => {
    const { t } = useI18n();
    const { setError, lang } = useContext(AppContext)!;
    const [comparisonData, setComparisonData] = useState<ComparisonData[]>([]);
    const [narrative, setNarrative] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [strategicInsights, setStrategicInsights] = useState<string>('');
    const [isInsightsLoading, setIsInsightsLoading] = useState<boolean>(false);

    useEffect(() => {
        setComparisonData([]);
        setNarrative('');
        setStrategicInsights('');
        setError(null);
    }, [lang, setError]);

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
            if (parsedResult && parsedResult.table && parsedResult.narrative) {
                setComparisonData(parsedResult.table);
                setNarrative(parsedResult.narrative);
            } else {
                 throw new Error("Invalid format received");
            }
        } catch (e: any) {
            console.error("Failed to parse comparison JSON:", e);
            setError(e.message || t('error_comparison_generation'));
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
        } catch (e: any) {
             setError(e.message || 'Failed to generate insights.');
        } finally {
            setIsInsightsLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-white">{t('comparison_title')}</h1>
            <p className="text-slate-400 max-w-3xl">
                {t('comparison_description')}
            </p>
            
            {!comparisonData.length && !isLoading && (
                 <div className="text-center py-6">
                    <button onClick={fetchComparison} className="px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg transition-colors">
                        {t('generate_analysis')}
                    </button>
                </div>
            )}

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
            ) : comparisonData.length > 0 && (
                <div className="bg-slate-800 rounded-lg border border-slate-700">
                    <div className="p-4 flex justify-end">
                       <ExportButtons content={`Comparison Table:\n${JSON.stringify(comparisonData, null, 2)}\n\nNarrative:\n${narrative}`} title="Qeshm_vs_Makoo_Comparison" />
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-700">
                            <thead className="bg-slate-700/50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">{t('metric')}</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Qeshm Free Zone</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Makoo Free Zone</th>
                                </tr>
                            </thead>
                            <tbody className="bg-slate-800 divide-y divide-slate-700">
                                {comparisonData.map((row, index) => (
                                    <tr key={index} className="hover:bg-slate-700/50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{row.metric}</td>
                                        <td className="px-6 py-4 whitespace-pre-wrap text-sm text-slate-400">{renderCellContent(row.qeshm)}</td>
                                        <td className="px-6 py-4 whitespace-pre-wrap text-sm text-slate-400">{renderCellContent(row.makoo)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            
            {narrative && !isLoading && (
                 <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                    <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                        {t('narrative_summary')}
                        <SpeakerIcon text={narrative} />
                    </h2>
                     <p className="text-slate-300 whitespace-pre-wrap mb-4">{narrative}</p>
                     
                     <button onClick={handleGenerateInsights} disabled={isInsightsLoading} className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:bg-sky-400">
                        {isInsightsLoading ? t('analyzing') : t('generate_deep_analysis')}
                     </button>

                     {strategicInsights && (
                        <div className="mt-6 p-4 bg-slate-900 rounded-lg border border-sky-500/30">
                            <h3 className="font-semibold text-sky-400 mb-2 flex items-center">
                                {t('strategic_implications_title')}
                                <SpeakerIcon text={strategicInsights} />
                            </h3>
                            <p className="text-slate-300 text-sm whitespace-pre-wrap">{strategicInsights}</p>
                            <Feedback sectionId="strategic-comparison-insights" />
                        </div>
                     )}
                </div>
            )}

        </div>
    );
};
