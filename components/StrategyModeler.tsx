
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
    strategic_roadmap: { phase: string; title: string; description: string }[];
}

export const StrategyModeler: React.FC = () => {
    const { t } = useI18n();
    const { setError, userRole, supportedLangs, lang, region: globalRegion } = useContext(AppContext)!;
    // Use strict View-based permission
    const userCanEdit = canEdit(userRole, 'strategy_modeler');
    
    const [targetRegion, setTargetRegion] = useState<Region>(globalRegion || 'Iranian Kurdistan');
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
            // Enhanced prompt with strict JSON schema including roadmap
            const prompt = `
                Act as a Chief Strategy Officer for KKM International. Develop a comprehensive market entry strategy for the GeoMeta Energy Layer (GMEL) project in ${targetRegion}.
                
                Context: GMEL is a 14-patent portfolio including Closed-Loop Geothermal (CLG), Nanofluid Stabilization, and integrated Desalination/Hydrogen systems.
                
                Task: Analyze regional data (geology, economy, infrastructure, politics) and return a valid JSON object with the following specific keys (content in ${langName}):
                
                1. "optimal_patent_package": Which specific patents from the portfolio are most critical for this region and why.
                2. "local_value_proposition": The unique economic and social value proposition for this specific region.
                3. "tech_transfer_plan": A plan for transferring technology and skills to the local workforce.
                4. "risk_analysis": Analysis of key political, economic, and technical risks.
                5. "budget_justification": High-level justification for the required CAPEX based on regional factors.
                6. "strategic_roadmap": An array of exactly 4 objects representing key phases (e.g., "Phase 1: Entry", "Phase 2: Pilot", etc.). Each object must have:
                   - "phase": string (e.g., "Months 1-6")
                   - "title": string
                   - "description": string (detailed action items)
            `;

            const result = await generateJsonWithThinking(prompt);
            const parsed = extractJson(result);
            if (parsed && parsed.optimal_patent_package && parsed.strategic_roadmap) {
                setStrategy(parsed);
            } else {
                throw new Error("Invalid format received from API");
            }
        } catch (e: any) {
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
            <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">{content}</p>
            <Feedback sectionId={`strategy-${sectionId}-${targetRegion}`} />
        </div>
    );

    const RoadmapSection: React.FC<{ roadmap: { phase: string; title: string; description: string }[] }> = ({ roadmap }) => (
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
            <h3 className="text-xl font-semibold text-sky-400 mb-8 flex items-center">
                {t('strategic_roadmap')}
                <SpeakerIcon text={roadmap.map(r => `${r.phase}: ${r.title}. ${r.description}`).join('. ')} />
            </h3>
            <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-sky-500/20 before:via-sky-500/50 before:to-sky-500/20">
                {roadmap.map((step, index) => (
                    <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-sky-900 bg-slate-900 text-sky-400 shadow-[0_0_15px_rgba(14,165,233,0.3)] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 font-bold text-sm">
                            {index + 1}
                        </div>
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-5 rounded-xl border border-white/5 bg-slate-900/50 shadow-sm transition-all hover:border-sky-500/30 hover:bg-slate-800/80">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                                <span className="font-bold text-white text-md">{step.title}</span>
                                <span className="font-mono text-xs text-sky-400 bg-sky-900/20 px-2 py-1 rounded border border-sky-900/50 w-fit">{step.phase}</span>
                            </div>
                            <p className="text-slate-400 text-sm leading-relaxed">{step.description}</p>
                        </div>
                    </div>
                ))}
            </div>
            <Feedback sectionId={`strategy-roadmap-${targetRegion}`} />
        </div>
    );

    return (
        <div className="space-y-8 animate-fade-in">
            <h1 className="text-3xl font-bold text-white">{t('strategy_modeler_title')}</h1>
            <p className="text-slate-400 max-w-3xl">
                {t('strategy_modeler_description')}
            </p>

            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 flex flex-col md:flex-row items-center gap-6 shadow-lg">
                <div className="flex-grow w-full md:w-auto">
                    <label htmlFor="target-region" className="block text-sm font-medium text-slate-300 mb-2">
                        {t('select_target_region')}
                    </label>
                    <select
                        id="target-region"
                        value={targetRegion}
                        onChange={(e) => setTargetRegion(e.target.value as Region)}
                        className="w-full bg-slate-700 border-slate-600 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 text-white font-semibold py-2.5 px-3"
                    >
                        {ALL_REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                </div>
                <button
                    onClick={handleGenerate}
                    disabled={isLoading || !userCanEdit}
                    title={!userCanEdit ? "You have view-only access for this module." : ""}
                    className="w-full md:w-auto flex-shrink-0 px-8 py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg transition-all shadow-lg shadow-sky-900/20 disabled:bg-slate-800 disabled:text-slate-500 disabled:shadow-none disabled:cursor-not-allowed hover:scale-105"
                >
                    {isLoading ? (
                        <div className="flex items-center gap-2">
                            <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                            {t('generating_strategy')}
                        </div>
                    ) : t('generate_jv_strategy')}
                </button>
            </div>

            {isLoading && (
                <div className="space-y-6">
                    <SkeletonLoader variant="card" count={1} height="150px" />
                    <SkeletonLoader variant="text" count={3} />
                    <SkeletonLoader variant="card" count={3} height="200px" />
                </div>
            )}

            {strategy && (
                <div className="space-y-6 animate-pop-in">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/50 p-4 rounded-xl border border-white/5">
                        <h2 className="text-2xl font-semibold text-white">{t('jv_strategy_for', { region: targetRegion })}</h2>
                        <ExportButtons content={JSON.stringify(strategy, null, 2)} title={`JV_Strategy_${targetRegion}`} isJson={true} />
                    </div>
                    
                    {strategy.strategic_roadmap && <RoadmapSection roadmap={strategy.strategic_roadmap} />}
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <StrategySection title={t('optimal_patent_package')} content={strategy.optimal_patent_package} sectionId="patent-package" />
                        <StrategySection title={t('local_value_proposition')} content={strategy.local_value_proposition} sectionId="value-prop" />
                        <StrategySection title={t('tech_transfer_plan')} content={strategy.tech_transfer_plan} sectionId="tech-transfer" />
                        <StrategySection title={t('risk_analysis')} content={strategy.risk_analysis} sectionId="risk" />
                        <StrategySection title={t('budget_justification')} content={strategy.budget_justification} sectionId="budget" />
                    </div>
                </div>
            )}
        </div>
    );
};
