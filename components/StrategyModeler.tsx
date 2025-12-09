
import React, { useState, useEffect, useContext } from 'react';
import { useI18n } from '../hooks/useI18n';
import { generateJsonWithThinking } from '../services/geminiService';
import { Region } from '../types';
import { SpeakerIcon } from './shared/SpeakerIcon';
import { Feedback } from './shared/Feedback';
import ExportButtons from './shared/ExportButtons';
import { AppContext } from '../contexts/AppContext';
import { canEdit } from '../utils/permissions';
import { extractJson } from '../utils/helpers';
import { ALL_REGIONS } from '../constants';
import { SkeletonLoader } from './shared/SkeletonLoader';

interface StrategyResult {
    optimal_patent_package: string;
    local_value_proposition: string;
    tech_transfer_plan: string;
    risk_analysis: string;
    budget_justification: string;
}

export const StrategyModeler: React.FC = () => {
    const { t } = useI18n();
    const { setError, userRole, supportedLangs, lang } = useContext(AppContext)!;
    // Use strict View-based permission
    const userCanEdit = canEdit(userRole, 'strategy_modeler');
    
    const [targetRegion, setTargetRegion] = useState<Region>('Iranian Kurdistan');
    const [strategy, setStrategy] = useState<StrategyResult | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        setStrategy(null);
        setError(null);
    }, [targetRegion, lang, setError]);

    const handleGenerate = async () => {
        if (!userCanEdit) return;
        setIsLoading(true);
        setError(null);
        setStrategy(null);
        const langName = supportedLangs.find(l => l.code === lang)?.name || 'English';

        try {
            const prompt = t('strategy_modeler_prompt', { region: targetRegion, language: langName });
            const result = await generateJsonWithThinking(prompt);
            const parsed = extractJson(result);
            if (parsed && parsed.optimal_patent_package) {
                setStrategy(parsed);
            } else {
                throw new Error("Invalid format received from API");
            }
        } catch (e) {
            setError(t('error_generating_strategy'));
            console.error("Failed to parse strategy JSON:", e);
        } finally {
            setIsLoading(false);
        }
    };

    const StrategySection: React.FC<{ title: string; content: string; sectionId: string }> = ({ title, content, sectionId }) => (
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
            <h3 className="text-xl font-semibold text-sky-400 mb-3 flex items-center">
                {title}
                <SpeakerIcon text={content} />
            </h3>
            <p className="text-slate-300 whitespace-pre-wrap">{content}</p>
            <Feedback sectionId={`strategy-${sectionId}-${targetRegion}`} />
        </div>
    );


    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-white">{t('strategy_modeler_title')}</h1>
            <p className="text-slate-400 max-w-3xl">
                {t('strategy_modeler_description')}
            </p>

            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 flex flex-col md:flex-row items-center gap-6">
                <div className="flex-grow w-full md:w-auto">
                    <label htmlFor="target-region" className="block text-sm font-medium text-slate-300 mb-2">
                        {t('select_target_region')}
                    </label>
                    <select
                        id="target-region"
                        value={targetRegion}
                        onChange={(e) => setTargetRegion(e.target.value as Region)}
                        className="w-full bg-slate-700 border-slate-600 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 text-white font-semibold"
                    >
                        {ALL_REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                </div>
                <button
                    onClick={handleGenerate}
                    disabled={isLoading || !userCanEdit}
                    title={!userCanEdit ? "You have view-only access for this module." : ""}
                    className="w-full md:w-auto flex-shrink-0 px-8 py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg transition-colors disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed"
                >
                    {isLoading ? t('generating_strategy') : t('generate_jv_strategy')}
                </button>
            </div>

            {isLoading && (
                <div className="space-y-6">
                    <SkeletonLoader variant="card" count={5} height="180px" />
                </div>
            )}

            {strategy && (
                <div className="space-y-6 animate-fade-in">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-semibold text-white">{t('jv_strategy_for', { region: targetRegion })}</h2>
                        <ExportButtons content={JSON.stringify(strategy, null, 2)} title={`JV_Strategy_${targetRegion}`} />
                    </div>
                    <StrategySection title={t('optimal_patent_package')} content={strategy.optimal_patent_package} sectionId="patent-package" />
                    <StrategySection title={t('local_value_proposition')} content={strategy.local_value_proposition} sectionId="value-prop" />
                    <StrategySection title={t('tech_transfer_plan')} content={strategy.tech_transfer_plan} sectionId="tech-transfer" />
                    <StrategySection title={t('risk_analysis')} content={strategy.risk_analysis} sectionId="risk" />
                    <StrategySection title={t('budget_justification')} content={strategy.budget_justification} sectionId="budget" />
                </div>
            )}
        </div>
    );
};
