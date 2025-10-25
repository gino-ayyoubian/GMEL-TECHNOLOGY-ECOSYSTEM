import React, { useState, useEffect, useContext } from 'react';
import { generateGroundedText } from '../services/geminiService';
import { AppContext } from '../contexts/AppContext';
import { useI18n } from '../hooks/useI18n';

const baseRegions = ["Iceland", "Turkey (Denizli/Aydin)", "USA (California's Salton Sea)", "Germany (Bavaria)"];

const BenchmarkCard: React.FC<{ region: string; content: string; sources: any[] }> = ({ region, content, sources }) => {
    const { t } = useI18n();
    return (
    <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
        <h3 className="text-xl font-semibold text-sky-400 mb-3">{region}</h3>
        <p className="text-sm text-slate-300 whitespace-pre-wrap">{content}</p>
        {sources.length > 0 && (
            <div className="mt-4">
                <h4 className="text-xs font-semibold text-slate-500">{t('sources')}:</h4>
                <ul className="list-disc list-inside mt-1 text-xs text-slate-500 space-y-1">
                    {sources.map((source, i) => (
                         <li key={i}>
                            <a href={source.web?.uri} target="_blank" rel="noopener noreferrer" className="hover:text-sky-400 hover:underline">
                                {source.web?.title || source.web?.uri}
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        )}
    </div>
)};

export const Benchmark: React.FC = () => {
    const { region } = useContext(AppContext)!;
    const { t } = useI18n();
    const [benchmarks, setBenchmarks] = useState<Record<string, {text: string, sources: any[]}>>({});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchBenchmarks = async () => {
            setIsLoading(true);
            const regionsToFetch = [...baseRegions, region];
            const results: Record<string, {text: string, sources: any[]}> = {};
            
            const promises = regionsToFetch.map(async (r) => {
                const prompt = t('benchmark_prompt', { region: r });
                const result = await generateGroundedText(prompt);
                results[r] = result;
            });

            await Promise.all(promises);

            setBenchmarks(results);
            setIsLoading(false);
        };

        fetchBenchmarks();
    }, [region, t]);

    const regionsToDisplay = [...baseRegions, region];

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-white">{t('benchmark_title')}</h1>
            <p className="text-slate-400 max-w-3xl">
                {t('benchmark_description', { region })}
            </p>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {regionsToDisplay.map(r => (
                        <div key={r} className="bg-slate-800 p-6 rounded-lg border border-slate-700 animate-pulse">
                             <div className="h-6 bg-slate-700 rounded w-1/3 mb-4"></div>
                             <div className="h-4 bg-slate-700 rounded w-full mb-2"></div>
                             <div className="h-4 bg-slate-700 rounded w-full mb-2"></div>
                             <div className="h-4 bg-slate-700 rounded w-3/4"></div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {regionsToDisplay.map((r) => {
                        const data = benchmarks[r];
                        if (!data) return null;
                        return <BenchmarkCard key={r} region={r} content={data.text} sources={data.sources} />;
                    })}
                </div>
            )}
        </div>
    );
};