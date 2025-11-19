
import React, { useState, useMemo, useContext, useEffect } from 'react';
import { useI18n } from '../hooks/useI18n';
import { generateGroundedText } from '../services/geminiService';
import { CORE_PATENT, PATENT_PORTFOLIO } from '../constants';
import { SpeakerIcon } from './shared/SpeakerIcon';
import { Feedback } from './shared/Feedback';
import { Patent } from '../types';
import { PatentInfographic } from './PatentInfographic';
import ExportButtons from './shared/ExportButtons';
import { AppContext } from '../contexts/AppContext';

// Helper to extract a JSON object from a string that might contain markdown or other text.
const extractJson = (text: string): any | null => {
    // First, try to find a JSON markdown block
    const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (match && match[1]) {
        try {
            return JSON.parse(match[1]);
        } catch (error) {
            console.error("Failed to parse JSON from markdown block:", match[1], error);
            // Fall through to try parsing a substring
        }
    }

    // If no block found, or parsing failed, try to find the first '{' or '[' and last '}' or ']'
    const firstBrace = text.indexOf('{');
    const firstBracket = text.indexOf('[');
    
    if (firstBrace === -1 && firstBracket === -1) return null;

    let start = -1;
    let end = -1;

    // Determine if we're looking for an object or an array based on which comes first
    if (firstBrace === -1 || (firstBracket !== -1 && firstBracket < firstBrace)) {
        start = firstBracket;
        end = text.lastIndexOf(']');
    } else {
        start = firstBrace;
        end = text.lastIndexOf('}');
    }

    if (start === -1 || end === -1 || end < start) return null;

    const jsonString = text.substring(start, end + 1);
    try {
        return JSON.parse(jsonString);
    } catch (error) {
        console.error("Failed to parse extracted JSON substring:", jsonString, error);
        return null;
    }
};


interface PatentOverlap {
    patent_identifier: string;
    title: string;
    assignee: string;
    summary: string;
    potential_overlap_with_gmel: string;
    overlap_description: string;
    publication_date?: string;
    link_to_source?: string;
}

interface AnalysisResult {
    potential_overlaps: PatentOverlap[];
    legal_strategy: string;
}

const CompetitiveAnalysis: React.FC = () => {
    const { lang, setError } = useContext(AppContext)!;
    const { t } = useI18n();
    const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setAnalysis(null);
        setError(null);
    }, [lang, setError]);

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
                console.warn("Could not parse JSON from patent analysis response. Displaying raw text.");
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
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
            <h2 className="text-2xl font-semibold text-white">{t('competitive_patent_analysis_title')}</h2>
            <p className="text-slate-400 mt-2 mb-4 max-w-3xl">{t('competitive_patent_analysis_desc')}</p>
            <button
                onClick={handleRunAnalysis}
                disabled={isLoading}
                className="px-6 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg transition-colors disabled:bg-sky-800 disabled:cursor-not-allowed"
            >
                {isLoading ? t('analyzing_patents') : t('run_patent_analysis_button')}
            </button>

            {isLoading && (
                 <div className="text-center py-10">
                    <svg className="animate-spin h-8 w-8 text-white mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    <p className="mt-4 text-slate-400">{t('analyzing_patents')}</p>
                </div>
            )}
            
            {analysis && (
                <div className="mt-6 space-y-6">
                    <ExportButtons content={JSON.stringify(analysis, null, 2)} title="Competitive_Patent_Analysis" />
                    {analysis.potential_overlaps.length > 0 && (
                        <div>
                            <h3 className="text-xl font-semibold text-white mb-4">{t('potential_overlaps_title')}</h3>
                            <div className="space-y-4">
                                {analysis.potential_overlaps.map((overlap, index) => (
                                    <div key={index} className="bg-slate-900/70 p-4 rounded-lg border border-slate-700">
                                        <h4 className="font-bold text-sky-400">{overlap.title}</h4>
                                        <p className="text-sm text-slate-400">
                                            <span className="font-semibold">Assignee:</span> {overlap.assignee} | <span className="font-semibold">Date:</span> {overlap.publication_date || 'N/A'}
                                        </p>
                                        <p className="text-sm text-slate-500 mt-1">
                                            <span className="font-semibold">Identifier:</span> {overlap.patent_identifier}
                                        </p>
                                        {overlap.link_to_source && overlap.link_to_source !== 'N/A' && (
                                            <a href={overlap.link_to_source} target="_blank" rel="noopener noreferrer" className="text-xs text-sky-400 hover:underline mt-1 inline-block">
                                                View Source Document &rarr;
                                            </a>
                                        )}
                                        <p className="text-sm mt-2 text-slate-300">{overlap.summary}</p>
                                        <p className="text-sm mt-2 p-2 bg-amber-900/50 rounded border border-amber-700/50">
                                            <span className="font-semibold text-amber-300">Potential Overlap with {overlap.potential_overlap_with_gmel}:</span> {overlap.overlap_description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                     <div>
                        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
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

    return (
        <div className={`flex flex-col bg-slate-800 p-4 rounded-lg border-l-4 transition-all duration-200 ${isSelected ? 'ring-2 ring-sky-400' : levelColors[patent.level]} h-full`}>
            <div className="flex-grow">
                <div className="flex justify-between items-start">
                    <h3 className="font-bold text-white pr-2">{patent.title}</h3>
                    <span className="text-xs font-mono text-slate-500 flex-shrink-0">{patent.code}</span>
                </div>
                <p className="text-sm text-slate-400 mt-2">{patent.application}</p>
            </div>
            <div className="mt-4 flex-shrink-0">
                 <div className="flex justify-between items-center mb-1">
                     <label htmlFor={`compare-${patent.code}`} className="flex items-center text-xs text-slate-400 cursor-pointer">
                        <input
                            id={`compare-${patent.code}`}
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => onSelect(patent.code)}
                            className="h-4 w-4 rounded bg-slate-700 border-slate-600 text-sky-500 focus:ring-sky-500"
                        />
                        <span className="ml-2">{t('add_to_compare')}</span>
                    </label>
                    <span className="font-semibold text-slate-300 text-xs">{patent.progress}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                    <div className={`${progressColor[patent.level]} h-2 rounded-full`} style={{ width: `${patent.progress}%` }}></div>
                </div>
            </div>
        </div>
    );
};

const ComparisonModal: React.FC<{ patents: Patent[], onClose: () => void }> = ({ patents, onClose }) => {
    const { t } = useI18n();
    const fields: (keyof Patent)[] = ['code', 'level', 'application', 'status', 'path', 'kpi', 'progress'];
    
    return (
         <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-slate-800 border border-slate-700 rounded-lg w-full max-w-6xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b border-slate-700">
                    <h2 className="text-xl font-bold text-white">{t('patent_comparison_title')}</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">&times;</button>
                </div>
                <div className="overflow-auto">
                     <table className="w-full text-sm text-left text-slate-400">
                        <thead className="text-xs text-slate-300 uppercase bg-slate-700/50 sticky top-0">
                            <tr>
                                <th scope="col" className="px-6 py-3 w-1/6">{t('metric')}</th>
                                {patents.map(p => <th key={p.code} scope="col" className="px-6 py-3">{p.title}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {fields.map(field => (
                                <tr key={field} className="bg-slate-800 border-b border-slate-700 hover:bg-slate-700/50">
                                    <th scope="row" className="px-6 py-4 font-medium text-white whitespace-nowrap capitalize">{field}</th>
                                    {patents.map(p => (
                                        <td key={p.code} className="px-6 py-4 align-top">
                                            {field === 'progress' ? `${p[field]}%` : p[field] || 'N/A'}
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
    const [searchQuery, setSearchQuery] = useState('');
    const [levelFilter, setLevelFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    const [sortBy, setSortBy] = useState('level');
    const [viewMode, setViewMode] = useState<'grid' | 'graph'>('grid');
    const [comparisonSelection, setComparisonSelection] = useState<string[]>([]);
    const [showComparisonModal, setShowComparisonModal] = useState(false);


    const allPatents = useMemo(() => [CORE_PATENT, ...PATENT_PORTFOLIO], []);

    const filteredAndSortedPatents = useMemo(() => {
        let patents = allPatents.filter(p => {
            const searchMatch = searchQuery.length > 2 ? 
                p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.application.toLowerCase().includes(searchQuery.toLowerCase()) : true;
            const levelMatch = levelFilter === 'All' || p.level === levelFilter;
            const statusMatch = statusFilter === 'All' || p.status === statusFilter;
            return searchMatch && levelMatch && statusMatch;
        });

        patents.sort((a, b) => {
            if (sortBy === 'title') return a.title.localeCompare(b.title);
            if (sortBy === 'status') return a.status.localeCompare(b.status);
            if (sortBy === 'progress') return b.progress - a.progress;
            // Default sort by level
            const levelOrder = { 'Core': 0, 'Derivatives': 1, 'Applied': 2, 'Strategic': 3 };
            return levelOrder[a.level] - levelOrder[b.level];
        });

        return patents;
    }, [searchQuery, levelFilter, statusFilter, sortBy, allPatents]);
    
    const handleSelectForComparison = (code: string) => {
        setComparisonSelection(prev => 
            prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
        );
    };

    const patentsForComparison = useMemo(() => 
        allPatents.filter(p => comparisonSelection.includes(p.code)),
        [comparisonSelection, allPatents]
    );

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-white">{t('ip_roadmap_title')}</h1>
            <p className="text-slate-400 max-w-3xl">{t('ip_roadmap_description')}</p>

            {/* View Mode Toggle */}
            <div className="flex justify-center bg-slate-800 p-1 rounded-lg max-w-xs mx-auto">
                <button
                    onClick={() => setViewMode('grid')}
                    className={`px-4 py-2 text-sm font-semibold rounded-md w-1/2 ${viewMode === 'grid' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:bg-slate-700'}`}
                >
                    {t('grid_view')}
                </button>
                <button
                    onClick={() => setViewMode('graph')}
                    className={`px-4 py-2 text-sm font-semibold rounded-md w-1/2 ${viewMode === 'graph' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:bg-slate-700'}`}
                >
                    {t('graph_view')}
                </button>
            </div>
            
            {viewMode === 'grid' && (
                <>
                    {/* Filtering and Sorting Controls */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-slate-800 rounded-lg">
                        <input
                            type="text"
                            placeholder={t('search_placeholder')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-slate-700 border-slate-600 rounded-md text-slate-200 placeholder-slate-400"
                        />
                        {/* Other filters can go here */}
                    </div>
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

                     {comparisonSelection.length > 0 && (
                        <div className="fixed bottom-8 right-8 z-20 flex items-center gap-4 bg-slate-800 p-4 rounded-lg border border-slate-700 shadow-lg">
                            <p className="text-sm font-semibold text-white">Comparing {comparisonSelection.length} patents</p>
                            <button onClick={() => setShowComparisonModal(true)} className="px-4 py-2 bg-sky-600 text-white rounded-md text-sm font-bold">{t('compare_selected')}</button>
                            <button onClick={() => setComparisonSelection([])} className="px-4 py-2 bg-slate-600 text-white rounded-md text-sm">{t('clear_comparison')}</button>
                        </div>
                    )}

                    {showComparisonModal && (
                        <ComparisonModal patents={patentsForComparison} onClose={() => setShowComparisonModal(false)} />
                    )}
                </>
            )}

            {viewMode === 'graph' && (
                <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 overflow-x-auto">
                    <PatentInfographic />
                </div>
            )}


            <CompetitiveAnalysis />
        </div>
    );
};
