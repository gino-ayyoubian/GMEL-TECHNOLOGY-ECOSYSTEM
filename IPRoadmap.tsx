
import React, { useState, useMemo, useContext, useEffect, useRef } from 'react';
import { useI18n } from '../hooks/useI18n';
import { generateGroundedText } from '../services/geminiService';
import { CORE_PATENT, PATENT_PORTFOLIO } from '../constants';
import { SpeakerIcon } from './shared/SpeakerIcon';
import { Feedback } from './shared/Feedback';
import { Patent } from '../types';
import { PatentInfographic } from './PatentInfographic';
import ExportButtons from './shared/ExportButtons';
import { AppContext } from '../contexts/AppContext';
import { extractJson } from '../utils/helpers';
import { Spinner } from './shared/Loading';

interface PatentOverlap {
    patent_identifier: string;
    title: string;
    assignee: string;
    summary: string;
    potential_overlap_with_gmel: string;
    overlap_description: string;
}

interface AnalysisResult {
    potential_overlaps: PatentOverlap[];
    legal_strategy: string;
}

const CompetitiveAnalysis: React.FC = () => {
    const { lang, setError, userRole } = useContext(AppContext)!;
    const { t } = useI18n();
    const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    if (userRole !== 'admin') return null;

    const handleRunAnalysis = async () => {
        setIsLoading(true);
        setError(null);
        setAnalysis(null);

        const gmel_patents_context = PATENT_PORTFOLIO
            .filter(p => p.level === 'Derivatives' || p.level === 'Applied')
            .map(p => `- ${p.code} (${p.title}): ${p.application}`)
            .join('\n');
        
        const prompt = t('patent_analysis_prompt', { gmel_patents_context, language: lang });

        try {
            const result = await generateGroundedText(prompt);
            const parsed = extractJson(result.text);
            if (parsed && parsed.potential_overlaps && parsed.legal_strategy) {
                setAnalysis(parsed);
            } else {
                setAnalysis({
                    potential_overlaps: [],
                    legal_strategy: result.text || t('no_overlaps_found')
                });
            }
        } catch (e: any) {
            setError(e.message || "Failed to generate patent analysis.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 mt-8">
            <h2 className="text-xl font-semibold text-white mb-2">{t('competitive_patent_analysis_title')}</h2>
            <p className="text-slate-400 mb-4">{t('competitive_patent_analysis_desc')}</p>
            <button
                onClick={handleRunAnalysis}
                disabled={isLoading}
                className="bg-amber-600 hover:bg-amber-500 text-white font-bold py-2 px-6 rounded-lg transition-colors disabled:bg-slate-700 flex items-center gap-2"
            >
                {isLoading && <Spinner size="sm" className="text-white" />}
                {isLoading ? t('analyzing_patents') : t('run_patent_analysis_button')}
            </button>
            
            {analysis && (
                <div className="mt-6 space-y-6 animate-fade-in">
                    <div className="flex justify-end">
                        <ExportButtons content={JSON.stringify(analysis, null, 2)} title="Competitive_Patent_Analysis" />
                    </div>
                    {analysis.potential_overlaps.length > 0 ? (
                        <div>
                            <h3 className="text-lg font-semibold text-white mb-3">{t('potential_overlaps_title')}</h3>
                            <div className="grid grid-cols-1 gap-4">
                                {analysis.potential_overlaps.map((overlap, index) => (
                                    <div key={index} className="bg-slate-900 p-4 rounded-lg border border-slate-700">
                                        <h4 className="font-bold text-sky-400">{overlap.title} ({overlap.patent_identifier})</h4>
                                        <p className="text-xs text-slate-500 mb-2">Assignee: {overlap.assignee}</p>
                                        <p className="text-sm text-slate-300 mb-2"><span className="font-semibold text-amber-500">Risk:</span> {overlap.potential_overlap_with_gmel}</p>
                                        <p className="text-sm text-slate-400">{overlap.overlap_description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : null}
                     <div className="bg-slate-900 p-4 rounded-lg border border-slate-700">
                        <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
                            {t('legal_strategy_title')}
                            <SpeakerIcon text={analysis.legal_strategy} />
                        </h3>
                         <p className="text-slate-300 whitespace-pre-wrap">{analysis.legal_strategy}</p>
                    </div>
                    <Feedback sectionId="competitive-patent-analysis" />
                </div>
            )}
        </div>
    );
};

const PatentCard: React.FC<{ patent: Patent, onSelect: (code: string) => void, isSelected: boolean }> = ({ patent, onSelect, isSelected }) => {
    const { t } = useI18n();
    const { setActiveView, setTechnicalTopic } = useContext(AppContext)!;

    const levelColors: Record<Patent['level'], string> = {
        Core: 'border-teal-400 bg-teal-500/10',
        Derivatives: 'border-sky-400 bg-sky-500/10',
        Applied: 'border-amber-400 bg-amber-500/10',
        Strategic: 'border-purple-400 bg-purple-500/10',
    };
    const progressColor: Record<Patent['level'], string> = {
        Core: 'bg-teal-400',
        Derivatives: 'bg-sky-400',
        Applied: 'bg-amber-400',
        Strategic: 'bg-purple-400',
    };

    const hasTechPage = ['GMEL-CLG', 'GMEL-DrillX', 'GMEL-ThermoFluid', 'GMEL-EHS'].includes(patent.code);

    const handleNavigate = () => {
        if (hasTechPage) {
            const topicCode = patent.code.replace('GMEL-', '');
            setTechnicalTopic(topicCode);
            setActiveView('technical');
        }
    };

    return (
        <div className={`flex flex-col bg-slate-800 p-4 rounded-lg border-l-4 transition-all duration-300 hover:-translate-y-1 ${isSelected ? 'ring-2 ring-sky-400' : levelColors[patent.level]}`}>
            <div className="flex-grow">
                <div 
                    className={`flex justify-between items-start ${hasTechPage ? 'cursor-pointer hover:opacity-80' : ''}`}
                    onClick={handleNavigate}
                >
                    <h3 className="font-bold text-white pr-2">{patent.title}</h3>
                    <span className="text-xs font-mono text-slate-500">{patent.code}</span>
                </div>
                <p className="text-sm text-slate-400 mt-2 line-clamp-3">{patent.application}</p>
            </div>
            
            <div className="mt-4">
                 <div className="flex justify-between items-center mb-1">
                     <label htmlFor={`compare-${patent.code}`} className="flex items-center text-xs text-slate-400 cursor-pointer">
                        <input
                            id={`compare-${patent.code}`}
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => onSelect(patent.code)}
                            className="h-4 w-4 rounded border-slate-600 bg-slate-700 text-sky-500 focus:ring-sky-500"
                        />
                        <span className="ml-2">{t('add_to_compare')}</span>
                    </label>
                    <span className="font-semibold text-slate-300 text-xs">{patent.progress}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-1.5">
                    <div className={`${progressColor[patent.level]} h-1.5 rounded-full`} style={{ width: `${patent.progress}%` }}></div>
                </div>
                <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider">{patent.status}</p>
            </div>
        </div>
    );
};

const ComparisonModal: React.FC<{ patents: Patent[], onClose: () => void }> = ({ patents, onClose }) => {
    const { t } = useI18n();
    const fields: (keyof Patent)[] = ['code', 'level', 'application', 'status', 'path', 'kpi', 'progress'];
    
    return (
         <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-slate-900 border border-white/10 rounded-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-6 border-b border-white/5">
                    <h2 className="text-xl font-bold text-white">{t('patent_comparison_title')}</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">&times;</button>
                </div>
                <div className="overflow-auto p-6">
                     <table className="w-full text-sm text-left text-slate-400">
                        <thead className="text-xs text-slate-300 uppercase bg-slate-800">
                            <tr>
                                <th scope="col" className="px-6 py-3">{t('metric')}</th>
                                {patents.map(p => (
                                    <th key={p.code} scope="col" className="px-6 py-3">{p.title}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {fields.map(field => (
                                <tr key={field} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                    <th scope="row" className="px-6 py-4 font-medium text-white whitespace-nowrap capitalize bg-slate-900/50">{field}</th>
                                    {patents.map(p => (
                                        <td key={p.code} className="px-6 py-4">
                                            {field === 'progress' ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-full bg-slate-700 rounded-full h-1.5 min-w-[60px]">
                                                        <div className="bg-sky-500 h-1.5 rounded-full" style={{ width: `${p[field]}%` }}></div>
                                                    </div>
                                                    <span>{p[field]}%</span>
                                                </div>
                                            ) : (
                                                p[field] || 'N/A'
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export const IPRoadmap: React.FC = () => {
    const { t } = useI18n();
    const { lang } = useContext(AppContext)!;
    const [searchQuery, setSearchQuery] = useState('');
    const [levelFilter, setLevelFilter] = useState('All');
    const [sortBy, setSortBy] = useState('level');
    const [viewMode, setViewMode] = useState<'grid' | 'graph'>('grid');
    const [comparisonSelection, setComparisonSelection] = useState<string[]>([]);
    const [showComparisonModal, setShowComparisonModal] = useState(false);
    
    const patents = useMemo(() => [CORE_PATENT, ...PATENT_PORTFOLIO], []);

    const filteredAndSortedPatents = useMemo(() => {
        let filtered = patents.filter(p => {
            const searchMatch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                               p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                               p.application.toLowerCase().includes(searchQuery.toLowerCase());
            const levelMatch = levelFilter === 'All' || p.level === levelFilter;
            return searchMatch && levelMatch;
        });

        filtered.sort((a, b) => {
            if (sortBy === 'title') return a.title.localeCompare(b.title);
            if (sortBy === 'progress') return b.progress - a.progress;
            const levelOrder = { 'Core': 0, 'Derivatives': 1, 'Applied': 2, 'Strategic': 3 };
            return levelOrder[a.level] - levelOrder[b.level];
        });

        return filtered;
    }, [searchQuery, levelFilter, sortBy, patents]);
    
    const handleSelectForComparison = (code: string) => {
        setComparisonSelection(prev => 
            prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
        );
    };

    const patentsForComparison = useMemo(() => 
        patents.filter(p => comparisonSelection.includes(p.code)),
        [comparisonSelection, patents]
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-3xl font-bold text-white">{t('ip_roadmap_title')}</h1>
                <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-all ${viewMode === 'grid' ? 'bg-sky-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                    >
                        {t('grid_view')}
                    </button>
                    <button
                        onClick={() => setViewMode('graph')}
                        className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-all ${viewMode === 'graph' ? 'bg-sky-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                    >
                        {t('graph_view')}
                    </button>
                </div>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-grow">
                    <input
                        type="text"
                        placeholder={t('search_placeholder')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-800 border-slate-700 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 text-sm text-white"
                    />
                </div>
                <div className="flex gap-4">
                    <select value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)} className="bg-slate-800 border-slate-700 rounded-md text-sm text-white">
                        <option value="All">All Levels</option>
                        <option value="Core">Core</option>
                        <option value="Derivatives">Derivatives</option>
                        <option value="Applied">Applied</option>
                        <option value="Strategic">Strategic</option>
                    </select>
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-slate-800 border-slate-700 rounded-md text-sm text-white">
                        <option value="level">Sort by Level</option>
                        <option value="title">Sort by Title</option>
                        <option value="progress">Sort by Progress</option>
                    </select>
                </div>
            </div>

            {comparisonSelection.length > 0 && (
                <div className="fixed bottom-8 right-8 z-50 bg-sky-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-4 animate-pop-in">
                    <span className="font-bold">{comparisonSelection.length} {t('patent_comparison_title')}</span>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setShowComparisonModal(true)} 
                            disabled={comparisonSelection.length < 2}
                            className="bg-white text-sky-600 px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-sky-50 disabled:opacity-50"
                        >
                            {t('compare_selected')}
                        </button>
                        <button onClick={() => setComparisonSelection([])} className="text-white/80 hover:text-white">&times;</button>
                    </div>
                </div>
            )}

            {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredAndSortedPatents.map(patent => (
                        <PatentCard 
                            key={patent.code} 
                            patent={patent}
                            onSelect={handleSelectForComparison}
                            isSelected={comparisonSelection.includes(patent.code)}
                        />
                    ))}
                </div>
            ) : (
                <div className="bg-slate-800 p-1 rounded-xl border border-slate-700 overflow-hidden">
                    <PatentInfographic />
                </div>
            )}

            {showComparisonModal && (
                <ComparisonModal patents={patentsForComparison} onClose={() => setShowComparisonModal(false)} />
            )}

            <CompetitiveAnalysis />
        </div>
    );
};
