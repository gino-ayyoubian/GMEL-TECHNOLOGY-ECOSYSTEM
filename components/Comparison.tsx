import React, { useState, useEffect } from 'react';
import { generateTextWithThinking } from '../services/geminiService';
import { useI18n } from '../hooks/useI18n';
import { SpeakerIcon } from './shared/SpeakerIcon';

interface ComparisonData {
    metric: string;
    qeshm: string;
    makoo: string;
}

export const Comparison: React.FC = () => {
    const { t } = useI18n();
    const [comparisonData, setComparisonData] = useState<ComparisonData[]>([]);
    const [narrative, setNarrative] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchComparison = async () => {
            setIsLoading(true);
            const prompt = t('comparison_prompt');
            const result = await generateTextWithThinking(prompt);
            
            try {
                const parsedResult = JSON.parse(result);
                setComparisonData(parsedResult.table || []);
                setNarrative(parsedResult.narrative || '');
            } catch (error) {
                console.error("Failed to parse comparison JSON:", error);
                setNarrative(t('error_comparison_generation'));
                setComparisonData([]);
            }

            setIsLoading(false);
        };
        fetchComparison();
    }, [t]);

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-white">{t('comparison_title')}</h1>
            <p className="text-slate-400 max-w-3xl">
                {t('comparison_description')}
            </p>

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
            ) : (
                <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
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
                                    <td className="px-6 py-4 whitespace-pre-wrap text-sm text-slate-400">{row.qeshm}</td>
                                    <td className="px-6 py-4 whitespace-pre-wrap text-sm text-slate-400">{row.makoo}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            
            {narrative && !isLoading && (
                 <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                    <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                        {t('narrative_summary')}
                        <SpeakerIcon text={narrative} />
                    </h2>
                     <p className="text-slate-300 whitespace-pre-wrap">{narrative}</p>
                </div>
            )}

        </div>
    );
};
