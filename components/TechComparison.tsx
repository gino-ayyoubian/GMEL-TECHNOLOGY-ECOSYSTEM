import React, { useState, useEffect } from 'react';
import { generateTextWithThinking } from '../services/geminiService';
import { useI18n } from '../hooks/useI18n';
import { SpeakerIcon } from './shared/SpeakerIcon';
import { Feedback } from './shared/Feedback';

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

const gmelTechnologies = {
    "GMEL-CLG": "Advanced Closed-Loop Geothermal System",
    "GMEL-ThermoFluid": "Nanocomposite Thermal Fluid",
    "GMEL-ORC Compact": "High-Efficiency Portable Converter",
    "GMEL-DrillX": "Autonomous Smart Drilling",
};

const benchmarkRegions = ["Iceland", "Turkey (Denizli/Aydin)", "USA (California's Salton Sea)", "Germany (Bavaria)"];

interface ComparisonResult {
    table: {
        metric: string;
        gmel_spec: string;
        benchmark_spec: string;
    }[];
    narrative: string;
}

export const TechComparison: React.FC = () => {
    const { t } = useI18n();
    const [selectedTech, setSelectedTech] = useState<string>("GMEL-CLG");
    const [selectedRegion, setSelectedRegion] = useState<string>("Iceland");
    const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleCompare = async () => {
        setIsLoading(true);
        setError(null);
        setComparisonResult(null);

        const gmel_tech_name = `${selectedTech}: ${gmelTechnologies[selectedTech as keyof typeof gmelTechnologies]}`;
        const prompt = t('tech_comparison_prompt', { gmel_tech_name, benchmark_region: selectedRegion });

        const result = await generateTextWithThinking(prompt);
        
        try {
            const parsed = extractJson(result);

            if (parsed && parsed.table && parsed.narrative) {
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

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-white">{t('tech_comparison_title')}</h1>
            <p className="text-slate-400 max-w-3xl">
                {t('tech_comparison_description')}
            </p>

            <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 flex flex-col md:flex-row items-center justify-center gap-4">
                <div>
                    <label htmlFor="gmelTech" className="text-sm font-medium text-slate-400 mr-2">{t('select_gmel_tech')}:</label>
                    <select id="gmelTech" value={selectedTech} onChange={e => setSelectedTech(e.target.value)} className="bg-slate-700 border-slate-600 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 text-sm text-white font-semibold">
                        {Object.entries(gmelTechnologies).map(([code, name]) => <option key={code} value={code}>{name}</option>)}
                    </select>
                </div>
                <span className="text-slate-400 font-bold">VS</span>
                 <div>
                    <label htmlFor="benchmarkRegion" className="text-sm font-medium text-slate-400 mr-2">{t('select_benchmark_region')}:</label>
                    <select id="benchmarkRegion" value={selectedRegion} onChange={e => setSelectedRegion(e.target.value)} className="bg-slate-700 border-slate-600 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 text-sm text-white font-semibold">
                        {benchmarkRegions.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                </div>
                <button onClick={handleCompare} disabled={isLoading} className="px-6 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg transition-colors disabled:bg-sky-400">
                    {isLoading ? t('analyzing') : t('compare_technologies')}
                </button>
            </div>

            {error && <p className="text-red-400 text-center">{error}</p>}

            {isLoading && (
                 <div className="w-full bg-slate-800 rounded-lg p-6 border border-slate-700 animate-pulse">
                    <div className="h-6 bg-slate-700 rounded w-1/3 mb-6"></div>
                    <div className="space-y-4">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="grid grid-cols-3 gap-4">
                                <div className="h-4 bg-slate-700 rounded col-span-1"></div>
                                <div className="h-4 bg-slate-700 rounded col-span-1"></div>
                                <div className="h-4 bg-slate-700 rounded col-span-1"></div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {comparisonResult ? (
                <div className="space-y-8">
                    <h2 className="text-2xl font-semibold text-white">{t('comparison_between', { region1: gmelTechnologies[selectedTech as keyof typeof gmelTechnologies], region2: selectedRegion })}</h2>
                    <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
                         <table className="min-w-full divide-y divide-slate-700">
                            <thead className="bg-slate-700/50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">{t('metric')}</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">{t('gmel_specifications')}</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">{t('benchmark_specifications')}</th>
                                </tr>
                            </thead>
                            <tbody className="bg-slate-800 divide-y divide-slate-700">
                                {comparisonResult.table.map((row, index) => (
                                    <tr key={index} className="hover:bg-slate-700/50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{row.metric}</td>
                                        <td className="px-6 py-4 whitespace-pre-wrap text-sm text-slate-300">{row.gmel_spec}</td>
                                        <td className="px-6 py-4 whitespace-pre-wrap text-sm text-slate-400">{row.benchmark_spec}</td>
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
                         <Feedback sectionId={`tech-comparison-${selectedTech}-vs-${selectedRegion}`} />
                    </div>
                </div>
            ) : !isLoading && (
                 <div className="text-center py-10 text-slate-500">
                    <p>Select a technology and region, then click "Compare Technologies" to generate an analysis.</p>
                </div>
            )}
        </div>
    );
};