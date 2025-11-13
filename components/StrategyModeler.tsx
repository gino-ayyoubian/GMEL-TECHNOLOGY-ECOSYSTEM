import React, { useState, useEffect } from 'react';
import { useI18n } from '../hooks/useI18n';
import { generateJsonWithThinking } from '../services/geminiService';
import { Region } from '../types';
import { SpeakerIcon } from './shared/SpeakerIcon';
import { Feedback } from './shared/Feedback';
import ExportButtons from './shared/ExportButtons';

// Helper to extract a JSON object from a string that might contain markdown or other text.
const extractJson = (text: string): any | null => {
    const firstBrace = text.indexOf('{');
    const firstBracket = text.indexOf('[');
    let start = -1;

    if (firstBrace === -1 && firstBracket === -1) return null;
    if (firstBrace === -1) start = firstBracket;
    else if (firstBracket === -1) start = firstBrace;
    else start = Math.min(firstBrace, firstBracket);
    
    const lastBrace = text.lastIndexOf('}');
    const lastBracket = text.lastIndexOf(']');
    let end = -1;
    
    if (lastBrace === -1 && lastBracket === -1) return null;
    if (lastBrace === -1) end = lastBracket;
    else if (lastBracket === -1) end = lastBrace;
    else end = Math.max(lastBrace, lastBracket);
    
    if (start === -1 || end === -1 || end < start) return null;

    const jsonString = text.substring(start, end + 1);
    try {
        return JSON.parse(jsonString);
    } catch (error) {
        console.error("Failed to parse extracted JSON string:", jsonString, error);
        return null;
    }
};

interface StrategyResult {
    optimal_patent_package: string;
    local_value_proposition: string;
    tech_transfer_plan: string;
    risk_analysis: string;
    budget_justification: string;
}

export const StrategyModeler: React.FC = () => {
    const { t } = useI18n();
    const [targetRegion, setTargetRegion] = useState<Region>('Iranian Kurdistan');
    const [strategy, setStrategy] = useState<StrategyResult | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setStrategy(null);
        setError(null);
    }, [targetRegion]);

    const handleGenerate = async () => {
        setIsLoading(true);
        setError(null);
        setStrategy(null);

        const prompt = t('strategy_modeler_prompt', { region: targetRegion });
        const result = await generateJsonWithThinking(prompt);

        try {
            const parsed = extractJson(result);
            if (parsed && parsed.optimal_patent_package) {
                setStrategy(parsed);
            } else {
                throw new Error("Invalid format received from API");
            }
        } catch (e) {
            setError(t('error_generating_strategy'));
            console.error("Failed to parse strategy JSON:", e, "Raw result:", result);
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
                        <option value="Iranian Kurdistan">Iranian Kurdistan</option>
                        <option value="Kurdistan Region, Iraq">Kurdistan Region, Iraq</option>
                        <option value="Qeshm Free Zone">Qeshm Free Zone</option>
                        <option value="Makoo Free Zone">Makoo Free Zone</option>
                        <option value="Chabahar Free Zone">Chabahar Free Zone</option>
                        <option value="Mahabad">Mahabad</option>
                        <option value="Oman">Oman</option>
                        <option value="Saudi Arabia">Saudi Arabia</option>
                    </select>
                </div>
                <button
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="w-full md:w-auto flex-shrink-0 px-8 py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg transition-colors disabled:bg-sky-800 disabled:cursor-not-allowed"
                >
                    {isLoading ? t('generating_strategy') : t('generate_jv_strategy')}
                </button>
            </div>

            {error && <p className="text-red-400 text-center">{error}</p>}

            {isLoading && (
                <div className="text-center py-10">
                    <svg className="animate-spin h-8 w-8 text-white mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="mt-4 text-slate-400">{t('generating_strategy')}</p>
                </div>
            )}

            {strategy && (
                <div className="space-y-6">
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