import React, { useState, useMemo, useContext } from 'react';
import { CORE_PATENT, PATENT_PORTFOLIO } from '../constants';
import { Patent } from '../types';
import { AppContext } from '../contexts/AppContext';
import { useI18n } from '../hooks/useI18n';
import { SpeakerIcon } from './shared/SpeakerIcon';


const PatentCard: React.FC<{ 
    patent: Patent;
    isSelected: boolean;
    onSelectToggle: (code: string) => void;
 }> = ({ patent, isSelected, onSelectToggle }) => {
  const { t } = useI18n();
  const { setActiveView, setTechnicalTopic } = useContext(AppContext)!;

  const levelColor = {
    Core: 'border-teal-400 bg-teal-500/10 hover:bg-teal-500/20',
    Derivatives: 'border-sky-400 bg-sky-500/10 hover:bg-sky-500/20',
    Applied: 'border-amber-400 bg-amber-500/10 hover:bg-amber-500/20',
    Strategic: 'border-purple-400 bg-purple-500/10 hover:bg-purple-500/20',
  }[patent.level];

  const hasTechPage = ['GMEL-CLG', 'GMEL-DrillX', 'GMEL-ThermoFluid', 'GMEL-ORC Compact', 'GMEL-EHS'].includes(patent.code);

  const handleViewTech = (e: React.MouseEvent) => {
    e.stopPropagation();
    if(hasTechPage) {
        setTechnicalTopic(patent.code);
        setActiveView('technical');
    }
  };

  const narrationText = `${patent.title}. Application: ${patent.application}.`;
  const tooltipText = `KPI: ${patent.kpi || 'N/A'}\nStatus: ${patent.status}`;

  return (
    <div title={tooltipText} className={`relative bg-slate-800 p-4 rounded-lg border-l-4 ${levelColor} transition-colors h-full flex flex-col`}>
      <h3 className="font-bold text-white flex items-center">{patent.title} ({patent.code}) <SpeakerIcon text={narrationText} /></h3>
      <p className="text-sm text-slate-400 mt-1 flex-grow">{patent.application}</p>
      
      {patent.kpi && (
        <div className="mt-3 text-xs font-semibold text-sky-400 bg-sky-500/10 p-2 rounded">
            KPI: {patent.kpi}
        </div>
      )}

      <div className="mt-3 space-y-2">
         <div className="flex items-center gap-3">
            <div className="w-full bg-slate-700 rounded-full h-2">
                <div 
                    className="bg-teal-400 h-2 rounded-full transition-all duration-500 ease-in-out" 
                    style={{ width: `${patent.progress}%` }}
                ></div>
            </div>
            <span className="text-sm font-semibold text-teal-300">{patent.progress}%</span>
        </div>
        <div className="text-xs flex justify-between items-center text-slate-500">
            <span>{t('status')}: <span className="font-medium text-slate-300">{patent.status}</span></span>
            <span>{t('path')}: <span className="font-medium text-slate-300">{patent.path}</span></span>
        </div>
      </div>
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-700/50">
        <label className="flex items-center space-x-2 text-xs text-slate-400 cursor-pointer hover:text-white transition-colors">
            <input 
                type="checkbox" 
                checked={isSelected}
                onChange={(e) => { e.stopPropagation(); onSelectToggle(patent.code); }}
                onClick={(e) => e.stopPropagation()}
                className="h-4 w-4 rounded bg-slate-700 border-slate-600 text-sky-600 focus:ring-sky-500"
            />
            <span>Compare</span>
        </label>
        {hasTechPage && (
            <button onClick={handleViewTech} className="text-xs text-sky-400 hover:text-sky-300 font-semibold transition-colors">
                View Details →
            </button>
        )}
      </div>
    </div>
  );
};

const patentYears: Record<string, number> = {
    'GMEL-CLG': 1403,
    'GMEL-EHS': 1404,
    'GMEL-DrillX': 1404,
    'GMEL-ORC Compact': 1405,
    'GMEL-Desal': 1405,
    'GMEL-H₂Cell': 1405,
    'GMEL-AgriCell': 1405,
    'GMEL-LithiumLoop': 1406,
    'GMEL-EcoCluster': 1405,
    'GMEL-GeoCredit': 1406,
    'GMEL-SmartGrid': 1406,
};


const PatentTimeline: React.FC = () => {
    const { t } = useI18n();
    const timelineData = useMemo(() => {
        const patents = [CORE_PATENT, ...PATENT_PORTFOLIO];
        const grouped: Record<number, Patent[]> = {};

        patents.forEach(p => {
            const path = p.path.toLowerCase();
            let year: number | null = null;
            if (path.includes('1403')) year = 1403;
            else if (path.includes('1404')) year = 1404;
            else if (path.includes('1405')) year = 1405;
            else if (path.includes('1406')) year = 1406;
            
            if (year) {
                if (!grouped[year]) {
                    grouped[year] = [];
                }
                grouped[year].push(p);
            }
        });
        if (!grouped[1403]) grouped[1403] = [];
        grouped[1403].unshift(CORE_PATENT);


        return grouped;
    }, []);

    const years = Object.keys(timelineData).map(Number).sort();

    return (
        <div>
            <h2 className="text-xl font-semibold text-slate-300 mb-4">{t('patent_timeline_title')}</h2>
            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                <div className="relative w-full">
                    <div className="absolute top-4 left-0 w-full h-1 bg-slate-700 rounded-full"></div>
                    <div className="relative flex justify-between -mx-4 overflow-x-auto pb-4 px-4">
                        {years.map(year => (
                            <div key={year} className="relative flex-shrink-0 px-8">
                                <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-4 h-4 bg-sky-500 rounded-full border-2 border-slate-800 z-10"></div>
                                <h3 className="font-bold text-sky-400 text-lg mt-6 text-center">{year}</h3>
                                <div className="mt-2 space-y-2 w-64">
                                    {timelineData[year].map(p => (
                                        <div key={p.code} className="p-2 rounded bg-slate-700/50 hover:bg-slate-700 transition-colors">
                                            <p className="text-sm font-semibold text-slate-200">{p.title}</p>
                                            <p className="text-xs text-slate-400">{p.code}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const PatentComparisonView: React.FC<{ patents: Patent[]; onClear: () => void }> = ({ patents, onClear }) => {
    const metrics: (keyof Patent | 'kpi' | 'progress')[] = ['title', 'application', 'status', 'kpi', 'progress'];

    const getMetricName = (metric: string) => {
        return metric.charAt(0).toUpperCase() + metric.slice(1);
    }
    
    return (
        <div className="bg-slate-800 p-6 rounded-lg border border-sky-500/30 mb-8">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">Patent Comparison</h2>
                <button onClick={onClear} className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    Clear Selection
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm table-fixed">
                    <thead>
                        <tr className="border-b border-slate-700">
                            <th className="p-2 text-slate-400 w-1/5">Metric</th>
                            {patents.map(p => <th key={p.code} className="p-2 text-white truncate">{p.code}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {metrics.map(metric => (
                            <tr key={metric} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                                <td className="p-2 font-semibold text-slate-300 capitalize">{getMetricName(metric)}</td>
                                {patents.map(p => (
                                    <td key={p.code} className="p-2 text-slate-400 align-top">
                                        {p[metric as keyof Patent] || 'N/A'}
                                        {metric === 'progress' && '%'}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export const IPRoadmap: React.FC = () => {
    const [filterLevel, setFilterLevel] = useState<Patent['level'] | 'All'>('All');
    const [sortBy, setSortBy] = useState<'title' | 'status'>('title');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedForComparison, setSelectedForComparison] = useState<string[]>([]);
    const { t } = useI18n();

    const handleSelectToggle = (code: string) => {
        setSelectedForComparison(prev => 
            prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
        );
    };

    const patentsToCompare = useMemo(() => {
        const allPatents = [CORE_PATENT, ...PATENT_PORTFOLIO];
        return allPatents.filter(p => selectedForComparison.includes(p.code))
            .sort((a, b) => selectedForComparison.indexOf(a.code) - selectedForComparison.indexOf(b.code));
    }, [selectedForComparison]);


    const filteredAndSortedPatents = useMemo(() => {
        let patents = [...PATENT_PORTFOLIO];

        if (filterLevel !== 'All') {
            patents = patents.filter(p => p.level === filterLevel);
        }

        if (searchQuery) {
            const lowercasedQuery = searchQuery.toLowerCase();
            patents = patents.filter(p => 
                p.title.toLowerCase().includes(lowercasedQuery) ||
                p.code.toLowerCase().includes(lowercasedQuery) ||
                p.application.toLowerCase().includes(lowercasedQuery)
            );
        }

        patents.sort((a, b) => {
            if (sortBy === 'title') {
                return a.title.localeCompare(b.title);
            }
            if (sortBy === 'status') {
                return a.status.localeCompare(b.status);
            }
            return 0;
        });

        return patents;
    }, [filterLevel, sortBy, searchQuery]);
    
    const patentLevels: (Patent['level'] | 'All')[] = ['All', 'Derivatives', 'Applied', 'Strategic'];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-white">{t('ip_roadmap_title')}</h1>
      <p className="text-slate-400 max-w-3xl">
        {t('ip_roadmap_description')}
      </p>

      {patentsToCompare.length > 0 && (
          <PatentComparisonView patents={patentsToCompare} onClear={() => setSelectedForComparison([])} />
      )}

       <div>
        <h2 className="text-xl font-semibold text-teal-400 mb-4">{t('core_technology_patent')}</h2>
        <div className="max-w-md">
          <PatentCard 
            patent={CORE_PATENT} 
            isSelected={selectedForComparison.includes(CORE_PATENT.code)}
            onSelectToggle={handleSelectToggle}
           />
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-slate-300 mb-4">{t('portfolio_patents')}</h2>
        
        <div className="flex flex-col md:flex-row flex-wrap gap-4 items-center mb-6 bg-slate-800 p-4 rounded-lg border border-slate-700">
            <div className="w-full md:w-auto">
                <label htmlFor="search" className="sr-only">{t('search_patents')}</label>
                <input 
                    type="search"
                    id="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('search_placeholder')}
                    className="w-full md:w-64 bg-slate-700 border-slate-600 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 text-sm text-slate-200"
                />
            </div>
            <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-slate-400">{t('filter_by_level')}:</label>
                <div className="flex flex-wrap gap-2">
                {patentLevels.map(level => (
                    <button
                    key={level}
                    onClick={() => setFilterLevel(level)}
                    className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
                        filterLevel === level ? 'bg-sky-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                    >
                    {level}
                    </button>
                ))}
                </div>
            </div>
            <div className="flex items-center gap-2">
                <label htmlFor="sortBy" className="text-sm font-medium text-slate-400">{t('sort_by')}:</label>
                <select
                id="sortBy"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'title' | 'status')}
                className="bg-slate-700 border-slate-600 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 text-sm text-slate-200"
                >
                <option value="title">{t('title')}</option>
                <option value="status">{t('status')}</option>
                </select>
            </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAndSortedPatents.length > 0 ? (
            filteredAndSortedPatents.map(p => 
                <PatentCard 
                    key={p.code} 
                    patent={p} 
                    isSelected={selectedForComparison.includes(p.code)}
                    onSelectToggle={handleSelectToggle}
                />)
          ) : (
            <p className="text-slate-500 md:col-span-2 lg:col-span-3 text-center py-8">{t('no_patents_match')}</p>
          )}
        </div>
      </div>
      
      <PatentTimeline />

    </div>
  );
};
