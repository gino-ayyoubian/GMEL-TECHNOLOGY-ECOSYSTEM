import React, { useState, useContext, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { FINANCIAL_DATA, PROJECT_MILESTONES, getProjectSummaryPrompt } from '../constants';
import { generateTextWithThinking, generateGroundedText } from '../services/geminiService';
import { Milestone } from '../types';
import { AppContext } from '../contexts/AppContext';
import { useI18n } from '../hooks/useI18n';
import { SpeakerIcon } from './shared/SpeakerIcon';
import { Feedback } from './shared/Feedback';

const COLORS = ['#0ea5e9', '#06b6d4', '#f59e0b', '#f97316', '#8b5cf6'];


const DataCard: React.FC<{ title: string; value: string; description: string }> = ({ title, value, description }) => (
  <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
    <h3 className="text-sm font-medium text-slate-400">{title}</h3>
    <p className="mt-1 text-3xl font-semibold text-white">{value}</p>
    <p className="mt-2 text-xs text-slate-500">{description}</p>
  </div>
);

const ThinkingButton: React.FC<{ prompt: string, onResult: (result: string) => void }> = ({ prompt, onResult }) => {
    const [isLoading, setIsLoading] = useState(false);
    const { t } = useI18n();

    const handleClick = async () => {
        setIsLoading(true);
        const result = await generateTextWithThinking(prompt);
        onResult(result ? `${result}` : t('error_no_analysis'));
        setIsLoading(false);
    };

    return (
        <button
            onClick={handleClick}
            disabled={isLoading}
            className="flex items-center justify-center px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg transition-colors disabled:bg-sky-400 disabled:cursor-not-allowed"
        >
            {isLoading ? (
                <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t('thinking')}
                </>
            ) : (
                <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                {t('generate_strategic_analysis')}
                </>
            )}
        </button>
    );
};

const MilestoneCard: React.FC<{ milestone: Milestone; isLast: boolean }> = ({ milestone, isLast }) => {
  const statusColor = {
    Completed: 'bg-teal-500',
    'In Progress': 'bg-sky-500',
    Planned: 'bg-amber-500',
  }[milestone.status];

  return (
    <div className="relative ps-8">
      <div className={`absolute top-1 start-0 w-3 h-3 rounded-full ${statusColor}`} title={milestone.status}></div>
      {!isLast && <div className="absolute top-4 start-[5px] w-px h-full bg-slate-600"></div>}
      <p className="font-semibold text-white">{milestone.title} - <span className="text-slate-400 font-normal">{milestone.date}</span></p>
      <p className="text-sm text-slate-500 mt-1">{milestone.description}</p>
    </div>
  );
};


export const Dashboard: React.FC = () => {
    const { region } = useContext(AppContext)!;
    const { t } = useI18n();
    const [strategicAnalysis, setStrategicAnalysis] = useState('');
    const [summary, setSummary] = useState('');
    const [isSummaryLoading, setIsSummaryLoading] = useState(true);

    useEffect(() => {
        const fetchSummary = async () => {
            setIsSummaryLoading(true);
            const prompt = getProjectSummaryPrompt(region);
            const result = await generateGroundedText(prompt);
            setSummary(result.text);
            setIsSummaryLoading(false);
        };
        fetchSummary();
    }, [region]);

    const chartData = FINANCIAL_DATA.filter(d => d.unit !== 'Years' && d.unit !== 'Countries').map(d => ({
        name: d.component.split(' ')[0],
        value: d.value,
    }));
  
    return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-white">{t('dashboard_title', { region })}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {FINANCIAL_DATA.map((item, index) => (
          <DataCard 
            key={index}
            title={item.component}
            value={`${item.value}${item.unit === 'Billion Toman' ? ' B' : ''}${item.unit === 'Years' ? ' Yrs' : ''}`}
            description={item.description}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        <div className="lg:col-span-3 space-y-8">
            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                <h2 className="text-xl font-semibold mb-4 text-white flex items-center">
                    {t('project_summary')}
                    <SpeakerIcon text={summary} />
                </h2>
                {isSummaryLoading ? (
                    <div className="space-y-2">
                        <div className="h-4 bg-slate-700 rounded w-full animate-pulse"></div>
                        <div className="h-4 bg-slate-700 rounded w-full animate-pulse"></div>
                        <div className="h-4 bg-slate-700 rounded w-3/4 animate-pulse"></div>
                    </div>
                ) : (
                    <p className="text-slate-400 text-sm mb-6 whitespace-pre-wrap">{summary}</p>
                )}

                <ThinkingButton 
                    prompt={t('strategic_analysis_prompt', { region })}
                    onResult={setStrategicAnalysis}
                />
                {summary && !isSummaryLoading && <Feedback sectionId={`summary-${region}`} />}

                {strategicAnalysis && (
                    <div className="mt-6 p-4 bg-slate-900 rounded-lg border border-sky-500/30">
                         <h3 className="font-semibold text-sky-400 mb-2 flex items-center">
                            {t('generated_strategic_analysis')}
                            <SpeakerIcon text={strategicAnalysis} />
                         </h3>
                         <p className="text-slate-300 text-sm whitespace-pre-wrap">{strategicAnalysis}</p>
                         <Feedback sectionId={`strategic-analysis-${region}`} />
                    </div>
                )}
            </div>
             <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                <h2 className="text-xl font-semibold mb-6 text-white">{t('project_milestones')}</h2>
                <div className="space-y-6">
                    {PROJECT_MILESTONES.map((milestone, index) => (
                        <MilestoneCard key={index} milestone={milestone} isLast={index === PROJECT_MILESTONES.length - 1} />
                    ))}
                </div>
            </div>
        </div>

        <div className="lg:col-span-2 bg-slate-800 p-6 rounded-lg border border-slate-700 h-full">
            <h2 className="text-xl font-semibold mb-4 text-white">{t('financial_overview')}</h2>
            <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                    <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                        <XAxis dataKey="name" tick={{ fill: '#94a3b8' }} />
                        <YAxis tick={{ fill: '#94a3b8' }} unit=" B" />
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
                        <Legend wrapperStyle={{ color: '#94a3b8' }}/>
                        <Bar dataKey="value" name={t('financial_chart_legend')}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>
    </div>
  );
};