import React from 'react';
import { useI18n } from '../hooks/useI18n';
import { PatentInfographic } from './PatentInfographic';


export const IPRoadmap: React.FC = () => {
    const { t } = useI18n();

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-white">{t('ip_roadmap_title')}</h1>
      <p className="text-slate-400 max-w-3xl">
        {t('ip_roadmap_description')}
      </p>
      
      <div className="bg-slate-800 p-4 md:p-8 rounded-lg border border-slate-700 overflow-x-auto">
        <PatentInfographic />
      </div>

    </div>
  );
};
