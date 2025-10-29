import React, { useState, useMemo, useContext, useEffect, useRef } from 'react';
import { AppContext } from '../../contexts/AppContext';
import { useI18n } from '../../hooks/useI18n';
import { CORE_PATENT, PATENT_PORTFOLIO, getFinancialData, PROJECT_MILESTONES } from '../../constants';
import { getTechDetails } from '../../utils/techDetails';

interface SearchResult {
    type: 'IP' | 'Financial' | 'Technical' | 'Milestone';
    title: string;
    description: string;
    action: () => void;
}

const ResultTypeBadge: React.FC<{ type: SearchResult['type'] }> = ({ type }) => {
    const styles = {
        'IP': 'bg-teal-500/20 text-teal-300',
        'Financial': 'bg-sky-500/20 text-sky-300',
        'Technical': 'bg-amber-500/20 text-amber-300',
        'Milestone': 'bg-purple-500/20 text-purple-300',
    };
    return <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${styles[type]}`}>{type}</span>;
};


export const GlobalSearch: React.FC = () => {
    const { setActiveView, setTechnicalTopic, lang, region } = useContext(AppContext)!;
    const { t } = useI18n();
    
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const searchContainerRef = useRef<HTMLDivElement>(null);

    const techDetails: Record<string, string> = useMemo(() => getTechDetails(t), [t]);

    const financialData = useMemo(() => getFinancialData(region), [region]);

    // Aggregate all searchable data
    const allData = useMemo(() => {
        const ipResults: SearchResult[] = [CORE_PATENT, ...PATENT_PORTFOLIO].map(p => ({
            type: 'IP',
            title: `${p.title} (${p.code})`,
            description: p.application,
            action: () => setActiveView('ip')
        }));
        
        const financialResults: SearchResult[] = financialData.map(f => ({
            type: 'Financial',
            title: f.component,
            description: f.description,
            action: () => setActiveView('financials')
        }));
        
        const technicalResults: SearchResult[] = Object.entries(techDetails).map(([topic, detail]) => ({
            type: 'Technical',
            title: topic,
            description: detail,
            action: () => {
                const code = topic.match(/\(([^)]+)\)/)?.[1];
                if (code) setTechnicalTopic(code);
                setActiveView('technical');
            }
        }));
        
        const milestoneResults: SearchResult[] = PROJECT_MILESTONES.map(m => ({
            type: 'Milestone',
            title: `${m.title} (${m.date})`,
            description: m.description,
            action: () => setActiveView('dashboard') // Milestones are on the dashboard
        }));

        return [...ipResults, ...financialResults, ...technicalResults, ...milestoneResults];
    }, [lang, setActiveView, setTechnicalTopic, techDetails, financialData]);

    const filteredResults = useMemo(() => {
        if (!query.trim()) return [];
        const lowerQuery = query.toLowerCase();
        return allData.filter(item => 
            item.title.toLowerCase().includes(lowerQuery) || 
            item.description.toLowerCase().includes(lowerQuery)
        );
    }, [query, allData]);

    const handleResultClick = (result: SearchResult) => {
        result.action();
        setIsOpen(false);
        setQuery('');
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative w-full max-w-lg" ref={searchContainerRef}>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-slate-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                </div>
                <input 
                    type="search"
                    placeholder="Search all project sections..."
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onFocus={() => setIsOpen(true)}
                    className="block w-full bg-slate-700 border-slate-600 rounded-md py-2 pl-10 pr-3 text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
            </div>
            {isOpen && (
                <div className="absolute top-full mt-2 w-full max-h-[70vh] overflow-y-auto bg-slate-800 rounded-lg shadow-lg border border-slate-700 z-50">
                    {query.trim() ? (
                        filteredResults.length > 0 ? (
                            <ul>
                                {filteredResults.map((result, index) => (
                                    <li key={index} onClick={() => handleResultClick(result)} className="p-4 border-b border-slate-700/50 hover:bg-slate-700 cursor-pointer transition-colors">
                                        <div className="flex justify-between items-start">
                                            <p className="font-semibold text-white text-sm">{result.title}</p>
                                            <ResultTypeBadge type={result.type} />
                                        </div>
                                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">{result.description}</p>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="p-4 text-center text-sm text-slate-500">
                                <p>No results found for "{query}"</p>
                            </div>
                        )
                    ) : (
                        <div className="p-4 text-center text-sm text-slate-500">
                            <p>Start typing to search across patents, financials, and technical docs.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};