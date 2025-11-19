import React, { useState, useEffect, useContext, useRef } from 'react';
import { generateJsonWithThinking, generateGroundedText } from '../services/geminiService';
import { AppContext } from '../contexts/AppContext';
import { useI18n } from '../hooks/useI18n';
import { SpeakerIcon } from './shared/SpeakerIcon';
import { Feedback } from './shared/Feedback';
import ExportButtons from './shared/ExportButtons';

// Declare Leaflet's global 'L' to TypeScript
declare var L: any;

// Helper to extract a JSON object from a string that might contain markdown or other text.
const extractJson = (text: string): any | null => {
    // First, try to find a JSON markdown block
    const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (match && match[1]) {
        try {
            return JSON.parse(match[1]);
        } catch (error) {
            console.error("Failed to parse JSON from markdown block:", match[1], error);
        }
    }
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

const baseRegions = ["Iceland", "Turkey (Denizli/Aydin)", "USA (California's Salton Sea)", "Germany (Bavaria)"];
const comparisonRegions = ["Qeshm Free Zone", "Makoo Free Zone", "Chabahar Free Zone", "Iranian Kurdistan", "Mahabad", "Kurdistan Region, Iraq", "Oman", "Saudi Arabia", ...baseRegions];

const regionCoordinates: Record<string, [number, number]> = {
    'Qeshm Free Zone': [26.9581, 56.2718],
    'Makoo Free Zone': [39.3330, 44.5160],
    'Chabahar Free Zone': [25.2915, 60.6431],
    'Iranian Kurdistan': [35.4330, 46.9831],
    'Mahabad': [36.7633, 45.7201],
    'Kurdistan Region, Iraq': [36.1911, 44.0094],
    'Oman': [23.5859, 58.3816],
    'Saudi Arabia': [24.7136, 46.6753],
    'Iceland': [64.9631, -19.0208],
    "Turkey (Denizli/Aydin)": [37.838, 28.536],
    "USA (California's Salton Sea)": [33.328, -115.844],
    "Germany (Bavaria)": [48.7904, 11.4979]
};


interface ComparisonResult {
    table: {
        metric: string;
        region1: string | { [key: string]: any };
        region2: string | { [key: string]: any };
    }[];
    narrative: string;
}

interface TechComparisonResult {
    table: {
        metric: string;
        gmel_spec: string | { [key: string]: any };
        benchmark_spec: string | { [key: string]: any };
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

const TechSpecComparison: React.FC<{ benchmarkRegion: string }> = ({ benchmarkRegion }) => {
    const { t } = useI18n();
    const { setError } = useContext(AppContext)!;
    const [techComparison, setTechComparison] = useState<TechComparisonResult | null>(null);
    const [isTechLoading, setIsTechLoading] = useState(false);

    useEffect(() => {
        setTechComparison(null);
        setError(null);
    }, [benchmarkRegion, setError]);

    const handleTechCompare = async () => {
        setIsTechLoading(true);
        setError(null);
        setTechComparison(null);

        const prompt = t('benchmark_tech_comparison_prompt', {
            gmel_tech: 'GMEL-DrillX Autonomous Smart Drilling',
            benchmark_region: benchmarkRegion
        });
        
        try {
            const result = await generateJsonWithThinking(prompt);
            const parsed = extractJson(result);

            if (parsed && parsed.table && parsed.narrative) {
                setTechComparison(parsed);
            } else {
                throw new Error("Invalid format received from API for tech comparison.");
            }
        } catch (e: any) {
            setError(e.message || t('error_generating_comparison'));
            console.error("Failed to parse tech comparison JSON:", e);
        } finally {
            setIsTechLoading(false);
        }
    };

    return (
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
            <h2 className="text-xl font-semibold text-white mb-2">{t('tech_spec_comparison_title')}</h2>
            <p className="text-sm text-slate-400 mb-4">{t('tech_spec_comparison_desc')}</p>
            
            {!techComparison && !isTechLoading && (
                <button onClick={handleTechCompare} disabled={isTechLoading} className="px-6 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg transition-colors disabled:bg-sky-400">
                    {isTechLoading ? t('analyzing') : t('generate_tech_comparison')}
                </button>
            )}

            {isTechLoading && (
                <div className="w-full bg-slate-900 rounded-lg p-6 animate-pulse mt-4">
                    <div className="h-5 bg-slate-700 rounded w-1/3 mb-4"></div>
                    <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="grid grid-cols-3 gap-4">
                                <div className="h-4 bg-slate-700 rounded col-span-1"></div>
                                <div className="h-4 bg-slate-700 rounded col-span-1"></div>
                                <div className="h-4 bg-slate-700 rounded col-span-1"></div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {techComparison && (
                 <div className="space-y-6 mt-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-white">{t('comparison_between', { region1: 'GMEL-DrillX', region2: `${benchmarkRegion} Tech` })}</h3>
                        <ExportButtons content={JSON.stringify(techComparison, null, 2)} title={`Tech_Comparison_DrillX_vs_${benchmarkRegion}`} />
                    </div>
                    <div className="overflow-hidden border border-slate-700 rounded-lg">
                         <table className="min-w-full divide-y divide-slate-700">
                            <thead className="bg-slate-700/50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">{t('metric')}</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">{t('gmel_drillx_specs')}</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">{t('benchmark_specifications_in_region', { region: benchmarkRegion })}</th>
                                </tr>
                            </thead>
                            <tbody className="bg-slate-800 divide-y divide-slate-700">
                                {techComparison.table.map((row, index) => (
                                    <tr key={index} className="hover:bg-slate-700/50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white align-top">{row.metric}</td>
                                        <td className="px-6 py-4 text-sm text-slate-300 align-top whitespace-pre-wrap">{renderCellContent(row.gmel_spec)}</td>
                                        <td className="px-6 py-4 text-sm text-slate-400 align-top whitespace-pre-wrap">{renderCellContent(row.benchmark_spec)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
                            {t('narrative_summary')}
                            <SpeakerIcon text={techComparison.narrative} />
                        </h3>
                         <p className="text-slate-300 whitespace-pre-wrap">{techComparison.narrative}</p>
                         <Feedback sectionId={`benchmark-tech-comparison-${benchmarkRegion}`} />
                    </div>
                 </div>
            )}
        </div>
    );
};

const CompetitorAnalysis: React.FC = () => {
    const { t } = useI18n();
    const { setError } = useContext(AppContext)!;
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerate = async () => {
        setIsLoading(true);
        setError(null);
        setData(null);
        try {
            const prompt = t('competitor_prompt');
            const result = await generateGroundedText(prompt);
            const parsed = extractJson(result.text);
            if (parsed && parsed.competitors) {
                setData(parsed);
            } else {
                throw new Error("Invalid competitor data format received.");
            }
        } catch (e: any) {
            setError(e.message || "Failed to analyze competitors.");
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
            <h2 className="text-2xl font-bold text-white">{t('competitor_analysis_title')}</h2>
            <p className="text-slate-400 mt-2 mb-4 max-w-3xl">{t('competitor_analysis_desc')}</p>
            <button onClick={handleGenerate} disabled={isLoading} className="px-6 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg transition-colors disabled:bg-sky-800">
                {isLoading ? t('analyzing') : t('analyze_competitors')}
            </button>
            {isLoading && <p className="mt-4 text-slate-400">{t('analyzing')}...</p>}
            {data && (
                <div className="mt-6 space-y-6">
                    <ExportButtons content={JSON.stringify(data, null, 2)} title="Competitor_Analysis" />
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-700">
                            <thead className="bg-slate-700/50">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">{t('company_name')}</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">{t('technology_focus')}</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">{t('market_position')}</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">{t('key_differentiator')}</th>
                                </tr>
                            </thead>
                            <tbody className="bg-slate-800 divide-y divide-slate-700">
                                {data.competitors.map((row: any, i: number) => (
                                    <tr key={i}>
                                        <td className="px-4 py-3 font-medium text-white">{row.company_name}</td>
                                        <td className="px-4 py-3 text-slate-300">{row.technology_focus}</td>
                                        <td className="px-4 py-3 text-slate-300">{row.market_position}</td>
                                        <td className="px-4 py-3 text-slate-400">{row.key_differentiator}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-2 flex items-center">{t('narrative_summary')} <SpeakerIcon text={data.summary_narrative} /></h3>
                        <p className="text-slate-300 whitespace-pre-wrap">{data.summary_narrative}</p>
                    </div>
                    <Feedback sectionId="competitor-analysis" />
                </div>
            )}
        </div>
    );
};


export const Benchmark: React.FC = () => {
    const { t } = useI18n();
    const { setError } = useContext(AppContext)!;
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<any>(null);
    const markersRef = useRef<any[]>([]);
    
    const [region1, setRegion1] = useState<string>('Qeshm Free Zone');
    const [region2, setRegion2] = useState<string>('Iceland');
    const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);

     // Map initialization
    useEffect(() => {
        if (mapContainerRef.current && !mapRef.current) {
            mapRef.current = L.map(mapContainerRef.current).setView([30, 20], 2); // Global view
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(mapRef.current);
        }
        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []);

    // Update map when regions change
    useEffect(() => {
        if (mapRef.current) {
            // Clear existing markers
            markersRef.current.forEach(marker => mapRef.current.removeLayer(marker));
            markersRef.current = [];

            const coords1 = regionCoordinates[region1];
            const coords2 = regionCoordinates[region2];
            
            if (coords1) {
                const marker1 = L.marker(coords1).addTo(mapRef.current).bindPopup(`<b>${region1}</b>`);
                markersRef.current.push(marker1);
            }
             if (coords2) {
                const marker2 = L.marker(coords2).addTo(mapRef.current).bindPopup(`<b>${region2}</b>`);
                markersRef.current.push(marker2);
            }

            if (coords1 && coords2) {
                const bounds = L.latLngBounds([coords1, coords2]);
                mapRef.current.fitBounds(bounds, { padding: [50, 50] });
            } else if (coords1) {
                mapRef.current.setView(coords1, 5);
            } else if (coords2) {
                mapRef.current.setView(coords2, 5);
            }
        }
    }, [region1, region2]);

    useEffect(() => {
        setComparisonResult(null);
        setError(null);
    }, [region1, region2, setError]);

    const handleCompare = async (r1: string, r2: string) => {
        if (r1 === r2) {
            setError(t('error_select_different_regions'));
            return;
        }
        setIsLoading(true);
        setError(null);
        setComparisonResult(null);

        try {
            const prompt = t('benchmark_comparison_prompt', { region1: r1, region2: r2 });
            const result = await generateJsonWithThinking(prompt);
            const parsed = extractJson(result);

            if (parsed && parsed.table && parsed.narrative) {
                setComparisonResult(parsed);
            } else {
                throw new Error("Invalid format received from API");
            }
        } catch (e: any) {
            setError(e.message || t('error_generating_comparison'));
            console.error("Failed to parse comparison JSON:", e);
        } finally {
            setIsLoading(false);
        }
    };

    const renderGracefulCell = (content: any) => {
        const text = renderCellContent(content);
        const maxLength = 200;

        if (text.length <= maxLength) {
            return <p className="whitespace-pre-wrap">{text}</p>;
        }

        const truncatedText = text.substring(0, maxLength) + '...';
        return (
            <p className="whitespace-pre-wrap" title={text}>
                {truncatedText}
            </p>
        );
    };

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
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="lg:col-span-2">
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
                    ) : comparisonResult ? (
                        <div className="space-y-8">
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-semibold text-white">{t('comparison_between', { region1, region2 })}</h2>
                                <ExportButtons content={JSON.stringify(comparisonResult, null, 2)} title={`Benchmark_${region1}_vs_${region2}`} />
                            </div>
                            <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
                                 <table className="min-w-full divide-y divide-slate-700 table-fixed">
                                    <thead className="bg-slate-700/50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider w-1/4">{t('metric')}</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider w-3/8">{region1}</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider w-3/8">{region2}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-slate-800 divide-y divide-slate-700">
                                        {comparisonResult.table.map((row, index) => (
                                            <tr key={index} className="hover:bg-slate-700/50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white align-top">{row.metric}</td>
                                                <td className="px-6 py-4 text-sm text-slate-400 align-top">{renderGracefulCell(row.region1)}</td>
                                                <td className="px-6 py-4 text-sm text-slate-400 align-top">{renderGracefulCell(row.region2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-10 text-slate-500 bg-slate-800 rounded-lg border border-slate-700">
                            <p>Select two regions and click "Compare" to generate an analysis.</p>
                        </div>
                    )}
                </div>
                <div className="lg:col-span-2 bg-slate-800 p-4 rounded-lg border border-slate-700 flex flex-col min-h-[400px]">
                    <h2 className="text-xl font-semibold text-white mb-4">{t('geographical_context_map')}</h2>
                    <div ref={mapContainerRef} className="w-full h-full flex-grow rounded-lg z-0"></div>
                </div>

                {comparisonResult && (
                    <div className="lg:col-span-2 bg-slate-800 p-6 rounded-lg border border-slate-700">
                        <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                            {t('narrative_summary')}
                            <SpeakerIcon text={comparisonResult.narrative} />
                        </h2>
                         <p className="text-slate-300 whitespace-pre-wrap">{comparisonResult.narrative}</p>
                         <Feedback sectionId={`benchmark-comparison-${region1}-vs-${region2}`} />
                    </div>
                )}
                
                {comparisonResult && (
                    <div className="lg:col-span-2">
                        <TechSpecComparison benchmarkRegion={region2} />
                    </div>
                )}
            </div>
            <CompetitorAnalysis />
        </div>
    );
};