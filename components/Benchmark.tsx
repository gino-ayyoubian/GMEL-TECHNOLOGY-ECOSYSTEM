
import React, { useState, useEffect, useContext, useRef, useMemo } from 'react';
import { generateBenchmarkComparison, generateFinancialData } from '../services/geminiService';
import { AppContext } from '../contexts/AppContext';
import { useI18n } from '../hooks/useI18n';
import { SpeakerIcon } from './shared/SpeakerIcon';
import { Feedback } from './shared/Feedback';
import { Spinner } from './shared/Loading';
import { SkeletonLoader } from './shared/SkeletonLoader';
import { AuditService } from '../services/auditService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FinancialData, Region } from '../types';
import { ALL_REGIONS } from '../constants';
import { Info } from 'lucide-react';

declare var L: any;

const regionCoordinates: Partial<Record<Region, [number, number]>> = {
    'Qeshm Free Zone': [26.9581, 56.2718],
    'Makoo Free Zone': [39.3330, 44.5160],
    'Kurdistan Region, Iraq': [36.1911, 44.0094],
    'Iceland': [64.9631, -19.0208],
    'Turkey (Geothermal Belt)': [37.838, 28.536],
    'USA (Salton Sea)': [33.328, -115.844],
    'Germany (Bavaria)': [48.7904, 11.4979],
    'Chabahar Free Zone': [25.2915, 60.6431],
    'Iranian Kurdistan': [35.3142, 46.9942],
    'Mahabad': [36.7633, 45.7201],
    'Oman': [23.5859, 58.3816],
    'Saudi Arabia': [24.7136, 46.6753],
    'United Arab Emirates': [24.466667, 54.366669],
    'Qatar': [25.286667, 51.533333]
};

const REGION_METADATA: Record<string, { potential: 'High' | 'Medium' | 'Low', stability: 'High' | 'Medium' | 'Low', infrastructure: 'Ready' | 'Developing' | 'Basic' }> = {
    'Iceland': { potential: 'High', stability: 'High', infrastructure: 'Ready' },
    'Turkey (Geothermal Belt)': { potential: 'High', stability: 'Medium', infrastructure: 'Ready' },
    'USA (Salton Sea)': { potential: 'High', stability: 'High', infrastructure: 'Ready' },
    'Germany (Bavaria)': { potential: 'Medium', stability: 'High', infrastructure: 'Ready' },
    'Qeshm Free Zone': { potential: 'Medium', stability: 'Medium', infrastructure: 'Developing' },
    'Makoo Free Zone': { potential: 'Medium', stability: 'Medium', infrastructure: 'Developing' },
    'Kurdistan Region, Iraq': { potential: 'Medium', stability: 'Medium', infrastructure: 'Basic' },
    'Chabahar Free Zone': { potential: 'Medium', stability: 'Medium', infrastructure: 'Developing' },
    'Iranian Kurdistan': { potential: 'Medium', stability: 'Medium', infrastructure: 'Basic' },
    'Mahabad': { potential: 'Medium', stability: 'Medium', infrastructure: 'Developing' },
    'Oman': { potential: 'High', stability: 'High', infrastructure: 'Ready' },
    'Saudi Arabia': { potential: 'High', stability: 'High', infrastructure: 'Ready' },
    'United Arab Emirates': { potential: 'Medium', stability: 'High', infrastructure: 'Ready' },
    'Qatar': { potential: 'Low', stability: 'High', infrastructure: 'Ready' }
};

interface ComparisonResult {
    table: {
        metric: string;
        region1: string | { [key: string]: any };
        region2: string | { [key: string]: any };
    }[];
    narrative: string;
    tech_comparison: string;
    ip_roadmap_comparison: string;
    sources: string[];
}

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
    const { currentUser, supportedLangs, lang, theme } = useContext(AppContext)!;
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<any>(null);
    const markersRef = useRef<any[]>([]);
    
    // Initial state empty to prevent auto-run
    const [region1, setRegion1] = useState<Region | ''>('');
    const [region2, setRegion2] = useState<Region | ''>('');
    const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const [filterPotential, setFilterPotential] = useState<string>('All');
    const [filterStability, setFilterStability] = useState<string>('All');
    const [filterInfrastructure, setFilterInfrastructure] = useState<string>('All');
    
    const [selectedMapRegion, setSelectedMapRegion] = useState<Region | null>(null);

    const [financialComparisonData, setFinancialComparisonData] = useState<any[]>([]);
    const [isFinancialLoading, setIsFinancialLoading] = useState(false);

    const filteredRegions = useMemo(() => {
        return ALL_REGIONS.filter(region => {
            const meta = REGION_METADATA[region];
            if (!meta) return true;
            if (filterPotential !== 'All' && meta.potential !== filterPotential) return false;
            if (filterStability !== 'All' && meta.stability !== filterStability) return false;
            if (filterInfrastructure !== 'All' && meta.infrastructure !== filterInfrastructure) return false;
            return true;
        });
    }, [filterPotential, filterStability, filterInfrastructure]);

    useEffect(() => {
        if (mapContainerRef.current && !mapRef.current) {
            mapRef.current = L.map(mapContainerRef.current).setView([30, 20], 2); 
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

    useEffect(() => {
        if (mapRef.current) {
            markersRef.current.forEach(marker => mapRef.current.removeLayer(marker));
            markersRef.current = [];

            filteredRegions.forEach(regionName => {
                const coords = regionCoordinates[regionName];
                const meta = REGION_METADATA[regionName] || { potential: 'Unknown', stability: 'Unknown', infrastructure: 'Unknown' };
                
                if (coords) {
                    const marker = L.marker(coords).addTo(mapRef.current);
                    
                    marker.on('click', () => {
                        setSelectedMapRegion(regionName);
                        mapRef.current.setView(coords, 6);
                    });

                    const tooltipContent = `
                        <div class="p-3 min-w-[150px]">
                            <h3 class="font-bold text-sky-400 text-xs uppercase tracking-wider mb-2" style="margin-bottom: 8px;">${regionName}</h3>
                            <div style="display: grid; grid-template-columns: auto auto; gap: 4px; font-size: 10px; color: #cbd5e1;">
                                <span>Potential:</span> <span style="color: white; font-weight: 500;">${meta.potential}</span>
                                <span>Stability:</span> <span style="color: white; font-weight: 500;">${meta.stability}</span>
                                <span>Infra:</span> <span style="color: white; font-weight: 500;">${meta.infrastructure}</span>
                            </div>
                        </div>
                    `;
                    marker.bindTooltip(tooltipContent, {
                        className: 'leaflet-tooltip-dark',
                        direction: 'top',
                        offset: [0, -35],
                        opacity: 1
                    });

                    if (regionName === region1) {
                        marker._icon.style.filter = "hue-rotate(140deg) brightness(1.2)"; 
                    } else if (regionName === region2) {
                        marker._icon.style.filter = "hue-rotate(280deg) brightness(1.2)"; 
                    }

                    markersRef.current.push(marker);
                }
            });
        }
    }, [filteredRegions, region1, region2]);

    const fetchFinancialComparison = async (r1: string, r2: string) => {
        setIsFinancialLoading(true);
        try {
            const [data1, data2] = await Promise.all([
                generateFinancialData(r1, lang),
                generateFinancialData(r2, lang)
            ]);

            const metrics = ['capex', 'revenue', 'npv'];
            const chartData = metrics.map(metricId => {
                const item1 = data1.find(d => d.id === metricId);
                const item2 = data2.find(d => d.id === metricId);
                
                return {
                    name: item1?.component.split('(')[0] || metricId.toUpperCase(),
                    [r1]: item1?.value || 0,
                    [`${r1}_unit`]: item1?.unit || '', 
                    [r2]: item2?.value || 0,
                    [`${r2}_unit`]: item2?.unit || '', 
                };
            });
            setFinancialComparisonData(chartData);
        } catch (e) {
            console.error("Error fetching financial comparison:", e);
        } finally {
            setIsFinancialLoading(false);
        }
    };

    const handleCompare = async () => {
        if (!region1 || !region2) {
            setError("Please select both regions.");
            return;
        }
        if (region1 === region2) {
            setError(t('error_select_different_regions'));
            return;
        }
        setIsLoading(true);
        setError(null);
        setComparisonResult(null);
        
        fetchFinancialComparison(region1, region2);

        const langName = supportedLangs.find(l => l.code === lang)?.name || 'English';
        try {
            const parsed = await generateBenchmarkComparison(region1, region2, langName);
            if (parsed && parsed.table && parsed.narrative) {
                setComparisonResult(parsed);
                AuditService.log(currentUser || 'user', 'BENCHMARK_COMPARE', `Compared ${region1} vs ${region2}`);
            } else {
                throw new Error("Invalid format received from API");
            }
        } catch (e: any) {
            setError(t('error_generating_comparison'));
            console.error("Failed to parse comparison JSON:", e);
            AuditService.log(currentUser || 'user', 'BENCHMARK_FAILED', e.message, 'FAILURE');
        } finally {
            setIsLoading(false);
        }
    };

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-slate-900/95 backdrop-blur-md border border-white/10 p-4 rounded-xl shadow-2xl text-xs z-50">
                    <p className="font-bold text-slate-200 mb-3 border-b border-white/10 pb-2">{label}</p>
                    {payload.map((entry: any, index: number) => {
                        const regionName = entry.name;
                        const unitKey = `${regionName}_unit`;
                        const unit = entry.payload[unitKey];
                        return (
                            <div key={index} className="flex items-center justify-between gap-6 mb-2 last:mb-0">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full shadow-[0_0_8px_currentcolor]" style={{ backgroundColor: entry.color, color: entry.color }}></div>
                                    <span className="text-slate-400 font-medium">{regionName}</span>
                                </div>
                                <div className="text-right">
                                    <span className="font-mono text-white text-sm font-bold block">
                                        {entry.value.toLocaleString()}
                                    </span>
                                    <span className="text-[10px] text-slate-500 uppercase tracking-wider">{unit}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            );
        }
        return null;
    };

    const SourceTooltip = () => (
        <div className="relative group inline-flex items-center ml-2 align-middle">
            <Info className="w-4 h-4 text-slate-500 hover:text-sky-400 cursor-help transition-colors" />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-50 scale-95 group-hover:scale-100 origin-bottom">
                <p className="text-xs text-slate-300 leading-relaxed">
                    <span className="font-bold text-sky-400 block mb-1">Data Source:</span>
                    Metrics are synthesized from AI analysis of publicly available data (World Bank, IGA), regional energy reports, and internal KKM simulations.
                </p>
                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] border-8 border-transparent border-t-slate-900/95"></div>
            </div>
        </div>
    );

    return (
        <div className="space-y-8 animate-fade-in">
            <h1 className="text-3xl font-bold text-white">{t('benchmark_title')}</h1>
            <p className="text-slate-400 max-w-3xl">
                {t('benchmark_description')}
            </p>

            <div className="bg-slate-900/60 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-lg">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wide mb-4">Region Filters</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Geothermal Potential</label>
                        <select value={filterPotential} onChange={e => setFilterPotential(e.target.value)} className="w-full bg-slate-800 border-slate-700 rounded-lg text-sm text-white focus:ring-sky-500">
                            <option value="All">All Levels</option>
                            <option value="High">High</option>
                            <option value="Medium">Medium</option>
                            <option value="Low">Low</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Economic Stability</label>
                        <select value={filterStability} onChange={e => setFilterStability(e.target.value)} className="w-full bg-slate-800 border-slate-700 rounded-lg text-sm text-white focus:ring-sky-500">
                            <option value="All">All Levels</option>
                            <option value="High">High</option>
                            <option value="Medium">Medium</option>
                            <option value="Low">Low</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Infrastructure</label>
                        <select value={filterInfrastructure} onChange={e => setFilterInfrastructure(e.target.value)} className="w-full bg-slate-800 border-slate-700 rounded-lg text-sm text-white focus:ring-sky-500">
                            <option value="All">All Types</option>
                            <option value="Ready">Ready</option>
                            <option value="Developing">Developing</option>
                            <option value="Basic">Basic</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="relative bg-slate-900/60 backdrop-blur-md p-4 rounded-xl border border-white/10 h-[500px]">
                <div ref={mapContainerRef} className="w-full h-full rounded-lg z-0"></div>
                
                {selectedMapRegion && (
                    <div className="absolute top-6 right-6 z-[400] w-72 bg-slate-900/95 backdrop-blur-xl border border-sky-500/30 rounded-xl p-5 shadow-2xl animate-pop-in">
                        <div className="flex justify-between items-start mb-3">
                            <h4 className="font-bold text-white text-lg">{selectedMapRegion}</h4>
                            <button onClick={() => setSelectedMapRegion(null)} className="text-slate-400 hover:text-white">&times;</button>
                        </div>
                        {REGION_METADATA[selectedMapRegion] && (
                            <div className="space-y-2 mb-4 text-sm text-slate-300">
                                <div className="flex justify-between"><span className="text-slate-500">Potential:</span> <span className="font-medium text-sky-400">{REGION_METADATA[selectedMapRegion].potential}</span></div>
                                <div className="flex justify-between"><span className="text-slate-500">Stability:</span> <span className="font-medium text-amber-400">{REGION_METADATA[selectedMapRegion].stability}</span></div>
                                <div className="flex justify-between"><span className="text-slate-500">Infrastructure:</span> <span className="font-medium text-teal-400">{REGION_METADATA[selectedMapRegion].infrastructure}</span></div>
                            </div>
                        )}
                        <div className="grid grid-cols-2 gap-2">
                            <button onClick={() => setRegion1(selectedMapRegion)} className="px-3 py-2 bg-sky-600/20 hover:bg-sky-600/40 text-sky-300 text-xs rounded-lg border border-sky-500/50 transition-colors">Set as Region A</button>
                            <button onClick={() => setRegion2(selectedMapRegion)} className="px-3 py-2 bg-amber-600/20 hover:bg-amber-600/40 text-amber-300 text-xs rounded-lg border border-amber-500/50 transition-colors">Set as Region B</button>
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-slate-900/60 backdrop-blur-xl p-6 rounded-2xl border border-white/10 flex flex-col md:flex-row items-center justify-center gap-6">
                <div className="w-full md:w-1/3">
                    <label className="block text-xs font-bold text-sky-500 mb-2 uppercase text-center">Region A</label>
                    <select value={region1} onChange={e => setRegion1(e.target.value as Region)} className="w-full bg-slate-800 border-sky-900/50 rounded-lg shadow-sm focus:ring-sky-500 focus:border-sky-500 text-sm text-white font-semibold py-3 text-center">
                        <option value="">Select Region</option>
                        {filteredRegions.map(r => <option key={`r1-${r}`} value={r}>{r}</option>)}
                    </select>
                </div>
                
                <button onClick={handleCompare} disabled={isLoading || !region1 || !region2} className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-sky-900/40 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105">
                    {isLoading && <Spinner size="sm" className="text-white" />}
                    {isLoading ? t('analyzing') : "COMPARE NOW"}
                </button>

                <div className="w-full md:w-1/3">
                    <label className="block text-xs font-bold text-amber-500 mb-2 uppercase text-center">Region B</label>
                    <select value={region2} onChange={e => setRegion2(e.target.value as Region)} className="w-full bg-slate-800 border-amber-900/50 rounded-lg shadow-sm focus:ring-amber-500 focus:border-amber-500 text-sm text-white font-semibold py-3 text-center">
                        <option value="">Select Region</option>
                        {filteredRegions.map(r => <option key={`r2-${r}`} value={r}>{r}</option>)}
                    </select>
                </div>
            </div>
            
            {error && <p className="text-red-400 text-center bg-red-900/10 p-3 rounded-lg border border-red-900/30">{error}</p>}

            {!comparisonResult && !isLoading && (
                <div className="text-center py-12 bg-slate-900/40 border border-white/5 border-dashed rounded-xl">
                    <p className="text-slate-400">Select two regions above and click "COMPARE NOW" to generate analysis.</p>
                </div>
            )}

            {(comparisonResult || isLoading) && (
                <div className="space-y-8">
                    <div className="bg-slate-900/60 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-lg">
                        <div className="flex items-center mb-6">
                            <h2 className="text-xl font-semibold text-white">Financial Metrics Comparison</h2>
                            <SourceTooltip />
                        </div>
                        {isFinancialLoading ? (
                            <SkeletonLoader variant="chart" />
                        ) : (
                            <div style={{ width: '100%', height: 350 }}>
                                <ResponsiveContainer>
                                    <BarChart data={financialComparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                        <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} dy={10} />
                                        <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                                        <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(255, 255, 255, 0.05)'}} />
                                        <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
                                        <Bar dataKey={region1} fill="#0ea5e9" name={region1} radius={[4, 4, 0, 0]} maxBarSize={60} />
                                        <Bar dataKey={region2} fill="#f59e0b" name={region2} radius={[4, 4, 0, 0]} maxBarSize={60} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-slate-900/60 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden shadow-lg h-full">
                            {isLoading ? (
                                <div className="p-6">
                                    <SkeletonLoader variant="table" />
                                </div>
                            ) : (
                                <div className="flex flex-col h-full">
                                    <div className="px-6 py-4 bg-slate-800/50 border-b border-white/5 flex items-center">
                                        <h3 className="font-bold text-white">Metrics Head-to-Head</h3>
                                        <SourceTooltip />
                                    </div>
                                    <div className="overflow-auto">
                                        <table className="min-w-full divide-y divide-white/5">
                                            <thead className="bg-slate-900/50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase w-1/3">{t('metric')}</th>
                                                    <th className="px-6 py-3 text-left text-xs font-bold text-sky-400 uppercase w-1/3">{region1}</th>
                                                    <th className="px-6 py-3 text-left text-xs font-bold text-amber-400 uppercase w-1/3">{region2}</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5">
                                                {comparisonResult?.table.map((row, index) => (
                                                    <tr key={index} className="hover:bg-white/5 transition-colors">
                                                        <td className="px-6 py-4 text-sm font-medium text-white align-top">{row.metric}</td>
                                                        <td className="px-6 py-4 text-sm text-slate-300 align-top">{renderCellContent(row.region1)}</td>
                                                        <td className="px-6 py-4 text-sm text-slate-300 align-top">{renderCellContent(row.region2)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="space-y-6">
                            {isLoading ? (
                                <SkeletonLoader variant="card" count={3} />
                            ) : comparisonResult ? (
                                <>
                                    <div className="bg-slate-900/60 backdrop-blur-md p-6 rounded-xl border border-white/10">
                                        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                                            <span className="p-1.5 bg-sky-500/20 rounded-md text-sky-400"><SpeakerIcon text={comparisonResult.narrative} /></span>
                                            {t('narrative_summary')}
                                        </h3>
                                        <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{comparisonResult.narrative}</p>
                                    </div>
                                    <div className="bg-slate-900/60 backdrop-blur-md p-6 rounded-xl border border-white/10">
                                        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                                            <span className="p-1.5 bg-purple-500/20 rounded-md text-purple-400"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg></span>
                                            Technical Comparative Analysis
                                        </h3>
                                        <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{comparisonResult.tech_comparison}</p>
                                    </div>
                                    <div className="bg-slate-900/60 backdrop-blur-md p-6 rounded-xl border border-white/10">
                                        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                                            <span className="p-1.5 bg-amber-500/20 rounded-md text-amber-400"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg></span>
                                            IP Roadmap Maturity & Strategy
                                        </h3>
                                        <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{comparisonResult.ip_roadmap_comparison}</p>
                                    </div>
                                </>
                            ) : null}
                        </div>
                    </div>

                    {comparisonResult && (
                        <div className="bg-slate-900/40 backdrop-blur-sm p-5 rounded-xl border border-white/10 mt-8 flex flex-col gap-3">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Data Sources & Methodology
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-slate-500 leading-relaxed">
                                        Comparative data is synthesized from regional energy reports, KKM internal simulations, and publicly available geothermal indices. Financial metrics are estimated based on 5MW pilot parameters.
                                    </p>
                                </div>
                                <ul className="list-disc list-inside text-xs text-slate-500 space-y-1">
                                    {comparisonResult.sources.map((source, idx) => (
                                        <li key={idx} className="hover:text-slate-300 transition-colors">{source}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                    
                    <Feedback sectionId={`benchmark-comparison-${region1}-vs-${region2}`} />
                </div>
            )}
        </div>
    );
};
