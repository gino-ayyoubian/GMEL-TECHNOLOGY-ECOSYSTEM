import React, { useState, useEffect, useContext, useRef } from 'react';
import { generateTextWithThinking } from '../services/geminiService';
import { AppContext } from '../contexts/AppContext';
import { useI18n } from '../hooks/useI18n';
import { SpeakerIcon } from './shared/SpeakerIcon';
import { Feedback } from './shared/Feedback';

// Declare Leaflet's global 'L' to TypeScript
declare var L: any;

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

const baseRegions = ["Iceland", "Turkey (Denizli/Aydin)", "USA (California's Salton Sea)", "Germany (Bavaria)"];
// FIX: Added 'Kurdistan Region, Iraq' to the list of regions available for comparison.
const comparisonRegions = ["Qeshm Free Zone", "Makoo Free Zone", "Kurdistan Region, Iraq", ...baseRegions];

const regionCoordinates: Record<string, [number, number]> = {
    'Qeshm Free Zone': [26.9581, 56.2718],
    'Makoo Free Zone': [39.3330, 44.5160],
    'Kurdistan Region, Iraq': [36.1911, 44.0094],
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
    const { t } = useI18n();
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<any>(null);
    const markersRef = useRef<any[]>([]);
    
    const [region1, setRegion1] = useState<string>('Qeshm Free Zone');
    const [region2, setRegion2] = useState<string>('Iceland');
    const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
            
            {error && <p className="text-red-400 text-center">{error}</p>}

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
                            <h2 className="text-2xl font-semibold text-white">{t('comparison_between', { region1, region2 })}</h2>
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
            </div>
        </div>
    );
};
