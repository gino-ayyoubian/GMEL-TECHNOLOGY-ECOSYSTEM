import React, { useState, useMemo, useContext } from 'react';
import { CORE_PATENT, PATENT_PORTFOLIO } from '../constants';
import { Patent } from '../types';
import { AppContext } from '../contexts/AppContext';
import { useI18n } from '../hooks/useI18n';
import { SpeakerIcon } from './shared/SpeakerIcon';


const PatentCard: React.FC<{ patent: Patent }> = ({ patent }) => {
  const { t } = useI18n();
  const levelColor = {
    Core: 'border-teal-400 bg-teal-500/10 hover:bg-teal-500/20',
    Derivatives: 'border-sky-400 bg-sky-500/10 hover:bg-sky-500/20',
    Applied: 'border-amber-400 bg-amber-500/10 hover:bg-amber-500/20',
    Strategic: 'border-purple-400 bg-purple-500/10 hover:bg-purple-500/20',
  }[patent.level];

  const narrationText = `${patent.title}. Application: ${patent.application}.`;

  return (
    <div className={`relative bg-slate-800 p-4 rounded-lg border-l-4 ${levelColor} transition-colors h-full flex flex-col`}>
      <h3 className="font-bold text-white flex items-center">{patent.title} ({patent.code}) <SpeakerIcon text={narrationText} /></h3>
      <p className="text-sm text-slate-400 mt-1 flex-grow">{patent.application}</p>
      <div className="mt-3 text-xs flex justify-between items-center text-slate-500">
        <span>{t('status')}: <span className="font-medium text-slate-300">{patent.status}</span></span>
        <span>{t('path')}: <span className="font-medium text-slate-300">{patent.path}</span></span>
      </div>
    </div>
  );
};

export const IPRoadmap: React.FC = () => {
    const [filterLevel, setFilterLevel] = useState<Patent['level'] | 'All'>('All');
    const [sortBy, setSortBy] = useState<'title' | 'status'>('title');
    const { t } = useI18n();

    const filteredAndSortedPatents = useMemo(() => {
        let patents = [...PATENT_PORTFOLIO];

        if (filterLevel !== 'All') {
            patents = patents.filter(p => p.level === filterLevel);
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
    }, [filterLevel, sortBy]);
    
    const patentLevels: (Patent['level'] | 'All')[] = ['All', 'Derivatives', 'Applied', 'Strategic'];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-white">{t('ip_roadmap_title')}</h1>
      <p className="text-slate-400 max-w-3xl">
        {t('ip_roadmap_description')}
      </p>

       <div>
        <h2 className="text-xl font-semibold text-teal-400 mb-4">{t('core_technology_patent')}</h2>
        <div className="max-w-md">
          <PatentCard patent={CORE_PATENT} />
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-slate-300 mb-4">{t('portfolio_patents')}</h2>
        
        <div className="flex flex-wrap gap-4 items-center mb-6 bg-slate-800 p-4 rounded-lg border border-slate-700">
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
            filteredAndSortedPatents.map(p => <PatentCard key={p.code} patent={p} />)
          ) : (
            <p className="text-slate-500 md:col-span-2 lg:col-span-3">{t('no_patents_match')}</p>
          )}
        </div>
      </div>
    </div>
  );
};