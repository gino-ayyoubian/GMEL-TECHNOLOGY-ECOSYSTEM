import React, { useState, useMemo } from 'react';
import { useI18n } from '../hooks/useI18n';
import { generateGroundedText } from '../services/geminiService';
import { CORE_PATENT, PATENT_PORTFOLIO } from '../constants';
import { SpeakerIcon } from './shared/SpeakerIcon';
import { Feedback } from './shared/Feedback';
import { Patent } from '../types';

// Helper to extract a JSON object from a string
const extractJson = (text: string): any | null => {
    const match = text.match(/```json\s*([\s\S]*?)\s*```/);
    const jsonString = match ? match[1] : text;
    try {
        return JSON.parse(jsonString);
    } catch (error) {
        console.error("Failed to parse JSON string:", jsonString, error);
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
}

interface AnalysisResult {
    potential_overlaps: PatentOverlap[];
    legal_strategy: string;
}

const CompetitiveAnalysis: React.FC = () => {
    const { t } = useI18n();
    const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleRunAnalysis = async () => {
        setIsLoading(true);
        setError(null);
        setAnalysis(null);

        const gmel_patents_context = PATENT_PORTFOLIO
            .filter(p => p.level === 'Derivatives' || p.level === 'Applied')
            .map(p => `- ${p.code} (${p.title}): ${p.application}`)
            .join('\n');
        
        const prompt = t('patent_analysis_prompt', { gmel_patents_context });

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
            {error && <p className="text-red-400 mt-4">{error}</p>}
            
            {analysis && (
                <div className="mt-6 space-y-6">
                    {analysis.potential_overlaps.length > 0 && (
                        <div>
                            <h3 className="text-xl font-semibold text-white mb-4">{t('potential_overlaps_title')}</h3>
                            <div className="space-y-4">
                                {analysis.potential_overlaps.map((overlap, index) => (
                                    <div key={index} className="bg-slate-900/70 p-4 rounded-lg border border-slate-700">
                                        <h4 className="font-bold text-sky-400">{overlap.title}</h4>
                                        <p className="text-sm text-slate-400">
                                            <span className="font-semibold">Assignee:</span> {overlap.assignee} | <span className="font-semibold">Identifier:</span> {overlap.patent_identifier}
                                        </p>
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

const PatentCard: React.FC<{ patent: Patent }> = ({ patent }) => {
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
        <div className={`flex flex-col bg-slate-800 p-4 rounded-lg border-l-4 ${levelColors[patent.level]} h-full`}>
            <div className="flex-grow">
                <div className="flex justify-between items-start">
                    <h3 className="font-bold text-white pr-2">{patent.title}</h3>
                    <span className="text-xs font-mono text-slate-500 flex-shrink-0">{patent.code}</span>
                </div>
                <p className="text-sm text-slate-400 mt-2">{patent.application}</p>
            </div>
            <div className="mt-4 flex-shrink-0">
                <div className="w-full bg-slate-700 rounded-full h-2 mb-1">
                    <div className={`${progressColor[patent.level]} h-2 rounded-full`} style={{ width: `${patent.progress}%` }}></div>
                </div>
                <div className="text-xs flex justify-between">
                    <span className="text-slate-400">{patent.status}</span>
                    <span className="font-semibold text-slate-300">{patent.progress}%</span>
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

    const allPatents = useMemo(() => [CORE_PATENT, ...PATENT_PORTFOLIO], []);
    const patentLevels = useMemo(() => ['All', ...Array.from(new Set(allPatents.map(p => p.level)))], [allPatents]);
    const patentStatuses = useMemo(() => ['All', ...Array.from(new Set(allPatents.map(p => p.status)))], [allPatents]);

    const filteredAndSortedPatents = useMemo(() => {
        let patents = allPatents.filter(p => {
            const searchMatch = searchQuery === '' || 
                p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.application.toLowerCase().includes(searchQuery.toLowerCase());
            const levelMatch = levelFilter === 'All' || p.level === levelFilter;
            const statusMatch = statusFilter === 'All' || p.status === statusFilter;
            return searchMatch && levelMatch && statusMatch;
        });

        patents.sort((a, b) => {
            if (sortBy === 'title') return a.title.localeCompare(b.title);
            if (sortBy === 'status') return a.status.localeCompare(b.status);
            if (sortBy === 'progress') return b.progress - a.progress;
            // Default sort by level order
            const levelOrder = { 'Core': 0, 'Derivatives': 1, 'Applied': 2, 'Strategic': 3 };
            return levelOrder[a.level] - levelOrder[b.level];
        });

        return patents;
    }, [allPatents, searchQuery, levelFilter, statusFilter, sortBy]);


    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-white">{t('ip_roadmap_title')}</h1>
            <p className="text-slate-400 max-w-3xl">{t('ip_roadmap_description')}</p>
            
            <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 space-y-4 md:space-y-0 md:flex md:items-center md:justify-between md:gap-4">
                <div className="relative flex-grow">
                    <input 
                        type="text" 
                        placeholder={t('search_placeholder')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-700 border-slate-600 rounded-md py-2 pl-10 pr-4 text-white placeholder-slate-400"
                    />
                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <select value={levelFilter} onChange={e => setLevelFilter(e.target.value)} className="bg-slate-700 border-slate-600 rounded-md text-white">
                        <option value="All">{t('filter_by_level')}</option>
                        {patentLevels.slice(1).map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                     <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-slate-700 border-slate-600 rounded-md text-white">
                        <option value="All">{t('filter_by_status')}</option>
                        {patentStatuses.slice(1).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                     <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="bg-slate-700 border-slate-600 rounded-md text-white">
                        <option disabled>{t('sort_by')}</option>
                        <option value="level">{t('sort_option_level')}</option>
                        <option value="title">{t('sort_option_title')}</option>
                        <option value="status">{t('sort_option_status')}</option>
                        <option value="progress">{t('sort_option_progress')}</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredAndSortedPatents.length > 0 ? (
                    filteredAndSortedPatents.map(patent => <PatentCard key={patent.code} patent={patent} />)
                ) : (
                    <p className="text-slate-500 md:col-span-2 lg:col-span-3 xl:col-span-4 text-center">{t('no_patents_match')}</p>
                )}
            </div>

            <CompetitiveAnalysis />
        </div>
    );
};
