
import React, { useState, useMemo, useContext, useEffect, useRef } from 'react';
import { useI18n } from '../hooks/useI18n';
import { generateGroundedText, generateLocalizedPatents, fetchPatentUpdates } from '../services/geminiService';
import { CORE_PATENT, PATENT_PORTFOLIO } from '../constants';
import { SpeakerIcon } from './shared/SpeakerIcon';
import { Feedback } from './shared/Feedback';
import { Patent } from '../types';
import { PatentInfographic } from './PatentInfographic';
import ExportButtons from './shared/ExportButtons';
import { AppContext } from '../contexts/AppContext';
import { extractJson } from '../utils/helpers';
import { Spinner } from './shared/Loading';
import { AuditService } from '../services/auditService';
import { Download, Search, Zap, RefreshCw, Handshake } from 'lucide-react';

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

interface LicensingDeal {
    partner: string;
    status: 'Initial Talks' | 'Due Diligence' | 'Contract Drafting' | 'Signed';
    contact: string;
    region: string;
}

const mockLicensingDeals: LicensingDeal[] = [
    { partner: 'Shell Geothermal', status: 'Due Diligence', contact: 'Dr. A. Weber (Head of Ventures)', region: 'EU' },
    { partner: 'Eni S.p.A', status: 'Initial Talks', contact: 'M. Rossi (Innovation Lead)', region: 'Italy' },
    { partner: 'Saudi Aramco', status: 'Contract Drafting', contact: 'K. Al-Fahad (Renewables Div)', region: 'KSA' },
];

const LicensingTracker: React.FC = () => {
    const { t } = useI18n();
    return (
        <div className="bg-slate-900/60 backdrop-blur-xl p-6 rounded-2xl border border-white/10 mt-8">
            <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
                <Handshake className="w-6 h-6 text-emerald-400" />
                {t('licensing_tracker_title')}
            </h2>
            <div className="overflow-x-auto rounded-xl border border-white/5">
                <table className="min-w-full divide-y divide-white/5">
                    <thead className="bg-slate-800/50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">{t('licensing_partner')}</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">{t('licensing_region')}</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">{t('licensing_status')}</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">{t('licensing_contact')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 bg-transparent">
                        {mockLicensingDeals.map((deal, idx) => (
                            <tr key={idx} className="hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-white">{deal.partner}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">{deal.region}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${
                                        deal.status === 'Signed' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                                        deal.status === 'Contract Drafting' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                                        deal.status === 'Due Diligence' ? 'bg-sky-500/20 text-sky-400 border-sky-500/30' :
                                        'bg-slate-700 text-slate-300 border-slate-600'
                                    }`}>
                                        {deal.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400 font-mono text-xs">{deal.contact}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const CompetitiveAnalysis: React.FC = () => {
    const { lang, setError, currentUser, userRole } = useContext(AppContext)!;
    const { t } = useI18n();
    const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // RESTRICTION: Only Admin can see/run competitive analysis
    if (userRole !== 'admin') {
        return null;
    }

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
                AuditService.log(currentUser || 'user', 'PATENT_ANALYSIS', 'Successfully generated competitive analysis');
            } else {
                console.warn("Could not parse JSON from patent analysis response. Displaying raw text.");
                setAnalysis({
                    potential_overlaps: [],
                    legal_strategy: result.text || t('no_overlaps_found')
                });
                AuditService.log(currentUser || 'user', 'PATENT_ANALYSIS', 'Generated unstructured analysis');
            }
        } catch (e: any) {
            setError(e.message || "Failed to generate patent analysis.");
            AuditService.log(currentUser || 'user', 'PATENT_ANALYSIS_FAILED', e.message, 'FAILURE');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-slate-900/60 backdrop-blur-xl p-6 rounded-2xl border border-white/10 mt-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                <div>
                    <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
                        <Zap className="w-6 h-6 text-amber-400" />
                        {t('competitive_patent_analysis_title')}
                    </h2>
                    <p className="text-slate-400 mt-1 max-w-2xl">{t('competitive_patent_analysis_desc')}</p>
                </div>
                <button
                    onClick={handleRunAnalysis}
                    disabled={isLoading}
                    className="flex-shrink-0 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-amber-900/20 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                >
                    {isLoading ? <Spinner size="sm" className="text-white" /> : <Search className="w-5 h-5" />}
                    {isLoading ? t('analyzing_patents') : t('run_patent_analysis_button')}
                </button>
            </div>
            
            {analysis && (
                <div className="mt-6 space-y-6 animate-fade-in border-t border-white/10 pt-6">
                    <div className="flex justify-end">
                        <ExportButtons content={JSON.stringify(analysis, null, 2)} title="Competitive_Patent_Analysis" />
                    </div>
                    {analysis.potential_overlaps.length > 0 && (
                        <div>
                            <h3 className="text-xl font-semibold text-white mb-4">{t('potential_overlaps_title')}</h3>
                            <div className="grid grid-cols-1 gap-4">
                                {analysis.potential_overlaps.map((overlap, index) => (
                                    <div key={index} className="bg-slate-800/50 p-5 rounded-lg border border-white/5 hover:border-amber-500/30 transition-all group">
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-bold text-sky-400 text-lg">{overlap.title}</h4>
                                            <span className="text-xs font-mono text-slate-500 bg-slate-900 px-2 py-1 rounded">{overlap.patent_identifier}</span>
                                        </div>
                                        <p className="text-sm text-slate-400 mt-1">
                                            <span className="font-semibold text-slate-300">Assignee:</span> {overlap.assignee}
                                        </p>
                                        <div className="mt-3 p-3 bg-amber-900/10 rounded border border-amber-500/10 group-hover:bg-amber-900/20 transition-colors">
                                            <p className="text-sm text-amber-200">
                                                <span className="font-semibold uppercase text-xs tracking-wider">Overlap Risk:</span> {overlap.potential_overlap_with_gmel}
                                            </p>
                                            <p className="text-sm text-slate-300 mt-1">{overlap.overlap_description}</p>
                                        </div>
                                        {overlap.link_to_source && overlap.link_to_source !== 'N/A' && (
                                            <a href={overlap.link_to_source} target="_blank" rel="noopener noreferrer" className="text-xs text-sky-400 hover:text-sky-300 hover:underline mt-2 inline-flex items-center gap-1">
                                                View Source <span className="text-xs">&rarr;</span>
                                            </a>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                     <div className="bg-slate-800/30 p-6 rounded-xl border border-white/5">
                        <h3 className="text-xl font-semibold text-white mb-3 flex items-center">
                            {t('legal_strategy_title')}
                            <SpeakerIcon text={analysis.legal_strategy} />
                        </h3>
                         <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">{analysis.legal_strategy}</p>
                    </div>
                    <Feedback sectionId="competitive-patent-analysis" />
                </div>
            )}
        </div>
    );
};

const PatentCard: React.FC<{ patent: Patent, onSelect: (code: string) => void, isSelected: boolean }> = ({ patent, onSelect, isSelected }) => {
    const { t } = useI18n();
    const { setActiveView, setTechnicalTopic, userRole } = useContext(AppContext)!;
    const isAdmin = userRole === 'admin';

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

    const hasTechPage = true; 

    const handleNavigate = () => {
        if (hasTechPage) {
            setTechnicalTopic(patent.code);
            setActiveView('technical');
        }
    };

    return (
        <div className={`group flex flex-col bg-slate-900/60 backdrop-blur-md p-4 rounded-xl border-l-4 transition-all duration-300 hover:-translate-y-1 ${isSelected ? 'ring-2 ring-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.3)]' : levelColors[patent.level]} h-full relative`}>
            <div className="flex-grow">
                <div 
                    className={`flex justify-between items-start ${hasTechPage ? 'cursor-pointer hover:opacity-80' : ''}`}
                    onClick={handleNavigate}
                >
                    <h3 className="font-bold text-white pr-2">{patent.title}</h3>
                    <span className="text-xs font-mono text-slate-500 flex-shrink-0">{patent.code}</span>
                </div>
                <p className="text-sm text-slate-400 mt-2 line-clamp-3">{patent.application}</p>
                
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute left-0 bottom-full mb-2 w-full bg-slate-900 border border-slate-600 p-3 rounded shadow-xl z-20 pointer-events-none">
                    <p className="text-xs text-white">{patent.application}</p>
                    {hasTechPage && <p className="text-[10px] text-sky-400 mt-1 italic">Click title to view technical details</p>}
                </div>
            </div>
            
            {/* Status Section */}
            <div className="mt-4 flex-shrink-0">
                 <div className="flex justify-between items-center mb-1">
                     <label htmlFor={`compare-${patent.code}`} className="flex items-center text-xs text-slate-400 cursor-pointer hover:text-white transition-colors select-none" onClick={(e) => e.stopPropagation()}>
                        <input
                            id={`compare-${patent.code}`}
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => onSelect(patent.code)}
                            className="h-4 w-4 rounded bg-slate-700 border-slate-600 text-sky-500 focus:ring-sky-500 focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800"
                        />
                        <span className="ml-2">{t('add_to_compare')}</span>
                    </label>
                    {/* RESTRICTION: Only Admin sees progress % */}
                    {isAdmin && <span className="font-semibold text-slate-300 text-xs">{patent.progress}%</span>}
                </div>
                
                {/* RESTRICTION: Only Admin sees progress bar */}
                {isAdmin ? (
                    <div className="w-full bg-slate-700 rounded-full h-1.5">
                        <div className={`${progressColor[patent.level]} h-1.5 rounded-full`} style={{ width: `${patent.progress}%` }}></div>
                    </div>
                ) : (
                    <div className="mt-2 text-right">
                        <span className="inline-flex items-center rounded-md bg-white/10 px-2 py-1 text-xs font-medium text-sky-300 ring-1 ring-inset ring-sky-500/30">
                            {patent.status}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

const ComparisonModal: React.FC<{ patents: Patent[], onClose: () => void }> = ({ patents, onClose }) => {
    const { t } = useI18n();
    const { userRole } = useContext(AppContext)!;
    const isAdmin = userRole === 'admin';
    
    // RESTRICTION: Hide 'progress' and 'kpi' if not admin
    const fields: (keyof Patent)[] = isAdmin 
        ? ['code', 'level', 'application', 'status', 'path', 'kpi', 'progress']
        : ['code', 'level', 'application', 'status', 'path'];

    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKeyDown);
        
        if (modalRef.current) {
            modalRef.current.focus();
        }

        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);
    
    return (
         <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" 
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <div 
                ref={modalRef}
                className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-6xl max-h-[90vh] flex flex-col outline-none shadow-2xl" 
                onClick={e => e.stopPropagation()}
                tabIndex={-1}
            >
                <div className="flex justify-between items-center p-6 border-b border-white/5">
                    <h2 id="modal-title" className="text-xl font-bold text-white">{t('patent_comparison_title')}</h2>
                    <button 
                        onClick={onClose} 
                        className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors"
                        aria-label="Close"
                    >
                        &times;
                    </button>
                </div>
                <div className="overflow-auto p-6 scrollbar-thin" tabIndex={0} role="region" aria-label={t('patent_comparison_title')}>
                     <table className="w-full text-sm text-left text-slate-400">
                        <caption className="sr-only">{t('patent_comparison_title')} Table</caption>
                        <thead className="text-xs text-slate-300 uppercase bg-slate-800/50">
                            <tr>
                                <th scope="col" className="px-6 py-3 w-1/6 min-w-[150px] rounded-tl-lg">{t('metric')}</th>
                                {patents.map((p, idx) => (
                                    <th key={p.code} scope="col" className={`px-6 py-3 min-w-[200px] ${idx === patents.length -1 ? 'rounded-tr-lg' : ''}`}>
                                        {p.title}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {fields.map(field => (
                                <tr key={field} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                    <th scope="row" className="px-6 py-4 font-medium text-white whitespace-nowrap capitalize bg-slate-900/50">{field}</th>
                                    {patents.map(p => (
                                        <td key={p.code} className="px-6 py-4 align-top">
                                            {field === 'progress' ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-full bg-slate-700 rounded-full h-1.5 max-w-[100px]">
                                                        <div className="bg-sky-500 h-1.5 rounded-full" style={{ width: `${p[field]}%` }}></div>
                                                    </div>
                                                    <span className="text-xs">{p[field]}%</span>
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
    const { lang, userRole, currentUser } = useContext(AppContext)!;
    const [searchQuery, setSearchQuery] = useState('');
    const [levelFilter, setLevelFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    const [sortBy, setSortBy] = useState('level');
    const [viewMode, setViewMode] = useState<'grid' | 'graph'>('grid');
    const [comparisonSelection, setComparisonSelection] = useState<string[]>([]);
    const [showComparisonModal, setShowComparisonModal] = useState(false);
    
    const [patents, setPatents] = useState<Patent[]>([CORE_PATENT, ...PATENT_PORTFOLIO]);
    const [isPatentsLoading, setIsPatentsLoading] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);

    useEffect(() => {
        const fetchPatents = async () => {
            setIsPatentsLoading(true);
            try {
                const localizedPatents = await generateLocalizedPatents(lang);
                setPatents(localizedPatents);
            } catch (e) {
                console.error("Failed to fetch localized patents:", e);
                setPatents([CORE_PATENT, ...PATENT_PORTFOLIO]); 
            } finally {
                setIsPatentsLoading(false);
            }
        };
        fetchPatents();
    }, [lang]);

    const handleSync = async () => {
        setIsSyncing(true);
        try {
            const updated = await fetchPatentUpdates(patents);
            setPatents(updated);
            AuditService.log(currentUser || 'user', 'PATENT_SYNC', 'Synced portfolio with external data');
        } catch (e) {
            console.error("Sync failed", e);
        } finally {
            setIsSyncing(false);
        }
    };

    const filteredAndSortedPatents = useMemo(() => {
        let filtered = patents.filter(p => {
            const searchMatch = searchQuery.length > 2 ? 
                p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.application.toLowerCase().includes(searchQuery.toLowerCase()) : true;
            const levelMatch = levelFilter === 'All' || p.level === levelFilter;
            const statusMatch = statusFilter === 'All' || p.status === statusFilter;
            return searchMatch && levelMatch && statusMatch;
        });

        filtered.sort((a, b) => {
            if (sortBy === 'title') return a.title.localeCompare(b.title);
            if (sortBy === 'status') return a.status.localeCompare(b.status);
            if (sortBy === 'progress') return b.progress - a.progress;
            const levelOrder = { 'Core': 0, 'Derivatives': 1, 'Applied': 2, 'Strategic': 3 };
            return levelOrder[a.level] - levelOrder[b.level];
        });

        return filtered;
    }, [searchQuery, levelFilter, statusFilter, sortBy, patents]);
    
    const handleSelectForComparison = (code: string) => {
        setComparisonSelection(prev => 
            prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
        );
    };

    const patentsForComparison = useMemo(() => 
        patents.filter(p => comparisonSelection.includes(p.code)),
        [comparisonSelection, patents]
    );

    const handleExportCSV = () => {
        const headers = ['Code', 'Title', 'Level', 'Application', 'Status', 'KPI', 'Progress'];
        const rows = patents.map(p => [
            p.code,
            `"${p.title.replace(/"/g, '""')}"`,
            p.level,
            `"${p.application.replace(/"/g, '""')}"`,
            p.status,
            `"${p.kpi ? p.kpi.replace(/"/g, '""') : ''}"`,
            `${p.progress}%`
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(r => r.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `GMEL_Patent_Portfolio_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">{t('ip_roadmap_title')}</h1>
                    <p className="text-slate-400 mt-1">{t('ip_roadmap_description')}</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleSync}
                        disabled={isSyncing}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
                        title={t('fetch_patent_updates')}
                    >
                        <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                        <span className="hidden sm:inline">{isSyncing ? t('updating_patents') : t('fetch_patent_updates')}</span>
                    </button>
                    {userRole === 'admin' && (
                        <button
                            onClick={handleExportCSV}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-lg text-sm font-semibold transition-all"
                            title="Download CSV"
                        >
                            <Download className="w-4 h-4" />
                            <span className="hidden sm:inline">Export CSV</span>
                        </button>
                    )}
                    <div className="flex bg-slate-900 p-1 rounded-lg border border-white/10">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${viewMode === 'grid' ? 'bg-sky-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                        >
                            {t('grid_view')}
                        </button>
                        <button
                            onClick={() => setViewMode('graph')}
                            className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${viewMode === 'graph' ? 'bg-sky-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                        >
                            {t('graph_view')}
                        </button>
                    </div>
                </div>
            </div>
            
            {comparisonSelection.length > 0 && (
                <div className="fixed bottom-8 right-8 z-50 flex items-center gap-4 bg-slate-900/90 backdrop-blur-xl border border-sky-500/30 p-4 rounded-xl shadow-2xl animate-pop-in">
                    <div className="flex flex-col">
                        <p className="text-sm font-bold text-white">Compare {comparisonSelection.length} Patents</p>
                        <p className="text-xs text-slate-400">Select at least 2</p>
                    </div>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setShowComparisonModal(true)} 
                            disabled={comparisonSelection.length < 2}
                            className="px-4 py-2 bg-sky-600 hover:bg-sky-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg text-sm font-bold transition-all shadow-lg"
                        >
                            {t('compare_selected')}
                        </button>
                        <button 
                            onClick={() => setComparisonSelection([])} 
                            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition-colors border border-white/10"
                            aria-label="Clear selection"
                        >
                            &times;
                        </button>
                    </div>
                </div>
            )}

            {isPatentsLoading ? (
                <div className="flex justify-center py-20">
                    <div className="text-center">
                        <Spinner size="xl" className="text-sky-500 mx-auto" />
                        <p className="mt-4 text-slate-400 animate-pulse">Updating Roadmap Language...</p>
                    </div>
                </div>
            ) : viewMode === 'grid' ? (
                <>
                    <div className="p-4 bg-slate-900/60 backdrop-blur-md rounded-xl border border-white/10">
                        <input
                            type="text"
                            placeholder={t('search_placeholder')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-slate-800 border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all py-2 px-4"
                        />
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
                </>
            ) : (
                <div className="bg-slate-900/40 backdrop-blur-sm p-1 rounded-xl border border-white/10 overflow-hidden">
                    <PatentInfographic 
                        patents={patents}
                        selectedPatents={comparisonSelection}
                        onToggleSelection={handleSelectForComparison}
                    />
                </div>
            )}

            {showComparisonModal && (
                <ComparisonModal patents={patentsForComparison} onClose={() => setShowComparisonModal(false)} />
            )}

            <LicensingTracker />
            <CompetitiveAnalysis />
        </div>
    );
};
