
import React, { useState, useContext, useEffect } from 'react';
import { useI18n } from '../hooks/useI18n';
import { generateJsonWithThinking, generateGroundedText, generateTextWithThinking } from '../services/geminiService';
import { SpeakerIcon } from './shared/SpeakerIcon';
import { AppContext } from '../contexts/AppContext';
import { Region } from '../types';
import { Feedback } from './shared/Feedback';
import ExportButtons from './shared/ExportButtons';
import { canEdit } from '../utils/permissions';
import { extractJson } from '../utils/helpers';
import { Spinner } from './shared/Loading';
import { SkeletonLoader } from './shared/SkeletonLoader';
import { AuditService } from '../services/auditService';
import { ALL_REGIONS } from '../constants';

interface GmelPackage {
    recommendedPatents: string[];
    synergies: string;
    primaryValueProposition: string;
    estimatedProfitability: string;
}

interface VisionaryProposal {
    proposalTitle: string;
    coreConcept: string;
    enablingTechnologies: string[];
    potentialImpact: string;
    newPatentIdeas: string[];
}

export const Simulations: React.FC = () => {
    const { region: globalRegion, setError, userRole, supportedLangs, lang, currentUser } = useContext(AppContext)!;
    const { t } = useI18n();
    // Use the strict View based permission check
    const userCanEdit = canEdit(userRole, 'simulations');

    const [targetRegion, setTargetRegion] = useState<Region>(globalRegion);

    const [gmelPackage, setGmelPackage] = useState<GmelPackage | null>(null);
    const [isGmelLoading, setIsGmelLoading] = useState<boolean>(false);

    const [visionaryProposal, setVisionaryProposal] = useState<VisionaryProposal | null>(null);
    const [visionarySources, setVisionarySources] = useState<any[]>([]);
    const [isVisionaryLoading, setIsVisionaryLoading] = useState<boolean>(false);
    
    const [idealProjectPlan, setIdealProjectPlan] = useState<string | null>(null);
    const [isIdealPlanLoading, setIsIdealPlanLoading] = useState<boolean>(false);
    const [visionaryProjectPlan, setVisionaryProjectPlan] = useState<string | null>(null);
    const [isVisionaryPlanLoading, setIsVisionaryPlanLoading] = useState<boolean>(false);

    useEffect(() => {
        setGmelPackage(null);
        setError(null);
        setIdealProjectPlan(null);
        setVisionaryProposal(null);
        setVisionarySources([]);
        setVisionaryProjectPlan(null);
    }, [targetRegion, lang, setError]);

    const handleGenerateGmelPackage = async () => {
        if (!userCanEdit) return;
        setIsGmelLoading(true);
        setError(null);
        setGmelPackage(null);
        setIdealProjectPlan(null);
        const langName = supportedLangs.find(l => l.code === lang)?.name || 'English';

        try {
            const prompt = t('gmel_package_prompt', { region: targetRegion, language: langName });
            const result = await generateJsonWithThinking(prompt);
            const parsed = extractJson(result);
            if (parsed && parsed.recommendedPatents) {
                setGmelPackage(parsed);
                AuditService.log(currentUser || 'user', 'SIMULATION_GMEL_PACKAGE', `Generated for ${targetRegion}`);
            } else {
                throw new Error("Invalid format received from AI.");
            }
        } catch (e: any) {
            setError(e.message || "Failed to generate GMEL package.");
            AuditService.log(currentUser || 'user', 'SIMULATION_FAILED', e.message, 'FAILURE');
        } finally {
            setIsGmelLoading(false);
        }
    };
    
    const handleGenerateVisionaryProposal = async () => {
        if (!userCanEdit) return;
        setIsVisionaryLoading(true);
        setError(null);
        setVisionaryProposal(null);
        setVisionarySources([]);
        setVisionaryProjectPlan(null);
        const langName = supportedLangs.find(l => l.code === lang)?.name || 'English';

        try {
            const prompt = t('visionary_proposal_prompt', { region: targetRegion, language: langName });
            const result = await generateGroundedText(prompt);
            const parsed = extractJson(result.text);

            if (parsed && parsed.proposalTitle) {
                setVisionaryProposal(parsed);
                setVisionarySources(result.sources);
                AuditService.log(currentUser || 'user', 'SIMULATION_VISIONARY', `Generated for ${targetRegion}`);
            } else {
                throw new Error("Invalid format received from AI for visionary proposal.");
            }
        } catch (e: any) {
            setError(e.message || "Failed to generate visionary proposal.");
            AuditService.log(currentUser || 'user', 'SIMULATION_FAILED', e.message, 'FAILURE');
        } finally {
            setIsVisionaryLoading(false);
        }
    };
    
    const handleGenerateIdealPlan = async () => {
        if (!gmelPackage || !userCanEdit) return;
        setIsIdealPlanLoading(true);
        setIdealProjectPlan(null);
        const langName = supportedLangs.find(l => l.code === lang)?.name || 'English';
        try {
            const prompt = t('ideal_plan_prompt', {
                region: targetRegion,
                patents: gmelPackage.recommendedPatents.join(', '),
                synergies: gmelPackage.synergies,
                valueProp: gmelPackage.primaryValueProposition,
                profitability: gmelPackage.estimatedProfitability,
                language: langName
            });
            const result = await generateTextWithThinking(prompt);
            setIdealProjectPlan(result);
            AuditService.log(currentUser || 'user', 'SIMULATION_BUSINESS_PLAN', `Generated ideal plan for ${targetRegion}`);
        } catch (e: any) {
            setError(e.message || "Failed to generate business plan.");
            AuditService.log(currentUser || 'user', 'SIMULATION_FAILED', e.message, 'FAILURE');
        } finally {
            setIsIdealPlanLoading(false);
        }
    };
    
    const handleGenerateVisionaryPlan = async () => {
        if (!visionaryProposal || !userCanEdit) return;
        setIsVisionaryPlanLoading(true);
        setVisionaryProjectPlan(null);
        const langName = supportedLangs.find(l => l.code === lang)?.name || 'English';
        try {
            const prompt = t('visionary_plan_prompt', {
                region: targetRegion,
                title: visionaryProposal.proposalTitle,
                concept: visionaryProposal.coreConcept,
                tech: visionaryProposal.enablingTechnologies.join(', '),
                impact: visionaryProposal.potentialImpact,
                patentIdeas: visionaryProposal.newPatentIdeas.join('; '),
                language: langName
            });
            const result = await generateTextWithThinking(prompt);
            setVisionaryProjectPlan(result);
            AuditService.log(currentUser || 'user', 'SIMULATION_VISIONARY_PLAN', `Generated visionary plan for ${targetRegion}`);
        } catch (e: any) {
            setError(e.message || "Failed to generate business plan.");
            AuditService.log(currentUser || 'user', 'SIMULATION_FAILED', e.message, 'FAILURE');
        } finally {
            setIsVisionaryPlanLoading(false);
        }
    };


    return (
        <div className="space-y-12 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold text-white">{t('simulations_title')}</h1>
                <p className="text-slate-400 max-w-3xl mt-2 leading-relaxed">
                    {t('simulations_description')}
                </p>
            </div>

            <div className="bg-slate-900/60 backdrop-blur-xl p-6 rounded-2xl border border-white/10">
                <label htmlFor="simulation-region" className="block text-sm font-medium text-slate-300 mb-2 uppercase tracking-wide">
                    Target Region for Simulation
                </label>
                <select
                    id="simulation-region"
                    value={targetRegion}
                    onChange={(e) => setTargetRegion(e.target.value as Region)}
                    className="w-full max-w-sm bg-slate-800 border-slate-700 rounded-lg shadow-sm focus:ring-sky-500 focus:border-sky-500 text-white font-medium py-2.5"
                >
                    {ALL_REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
            </div>

            <div className="bg-slate-900/60 backdrop-blur-xl p-8 rounded-2xl border border-white/10 space-y-6 shadow-lg">
                <div>
                    <h2 className="text-2xl font-semibold text-white">{t('gmel_modeler_title')}</h2>
                    <p className="text-slate-400 mt-1">{t('gmel_modeler_description')}</p>
                </div>
                
                <button
                    onClick={handleGenerateGmelPackage}
                    disabled={isGmelLoading || !userCanEdit}
                    title={!userCanEdit ? "Editing restricted for this role" : ""}
                    className="flex items-center gap-2 px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg transition-all shadow-lg shadow-sky-900/20 disabled:bg-slate-800 disabled:text-slate-500 disabled:shadow-none disabled:cursor-not-allowed"
                >
                    {isGmelLoading && <Spinner size="sm" className="text-white" />}
                    {isGmelLoading ? t('generating') : t('generate_gmel_package')}
                </button>

                {isGmelLoading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-white/5">
                        <SkeletonLoader variant="card" count={4} height="150px" />
                    </div>
                )}
                
                {gmelPackage && (
                    <div className="space-y-4 pt-6 border-t border-white/5 animate-pop-in">
                        <div className="flex justify-end">
                            <ExportButtons content={JSON.stringify(gmelPackage, null, 2)} title={`Ideal_GMEL_Package_${targetRegion}`} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-5 bg-slate-800/50 rounded-xl border border-white/5">
                                <h3 className="font-semibold text-sky-400 mb-2 flex items-center">{t('recommended_patents')} <SpeakerIcon text={gmelPackage.recommendedPatents.join(', ')} /></h3>
                                <ul className="list-disc list-inside text-slate-300 text-sm space-y-1">
                                    {gmelPackage.recommendedPatents.map(p => <li key={p}>{p}</li>)}
                                </ul>
                            </div>
                            <div className="p-5 bg-slate-800/50 rounded-xl border border-white/5">
                                <h3 className="font-semibold text-sky-400 mb-2 flex items-center">{t('package_synergies')} <SpeakerIcon text={gmelPackage.synergies} /></h3>
                                <p className="text-slate-300 text-sm whitespace-pre-wrap">{gmelPackage.synergies}</p>
                            </div>
                            <div className="p-5 bg-slate-800/50 rounded-xl border border-white/5">
                                <h3 className="font-semibold text-sky-400 mb-2 flex items-center">{t('primary_value_prop')} <SpeakerIcon text={gmelPackage.primaryValueProposition} /></h3>
                                <p className="text-slate-300 text-sm whitespace-pre-wrap">{gmelPackage.primaryValueProposition}</p>
                            </div>
                            <div className="p-5 bg-slate-800/50 rounded-xl border border-white/5">
                                <h3 className="font-semibold text-sky-400 mb-2 flex items-center">{t('estimated_profitability')} <SpeakerIcon text={gmelPackage.estimatedProfitability} /></h3>
                                <p className="text-slate-300 text-sm whitespace-pre-wrap">{gmelPackage.estimatedProfitability}</p>
                            </div>
                        </div>
                        <Feedback sectionId={`gmel-package-modeler-${targetRegion}`} />

                        <div className="pt-6 border-t border-white/5">
                            <button onClick={handleGenerateIdealPlan} disabled={isIdealPlanLoading || !userCanEdit} className="flex items-center gap-2 px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg transition-all shadow-lg shadow-teal-900/20 disabled:bg-slate-800 disabled:text-slate-500 disabled:shadow-none disabled:cursor-not-allowed">
                                {isIdealPlanLoading && <Spinner size="sm" className="text-white" />}
                                {isIdealPlanLoading ? t('generating_business_plan') : t('generate_business_plan')}
                            </button>
                            {isIdealPlanLoading && <div className="mt-6"><SkeletonLoader variant="text" count={10} /></div>}
                            {idealProjectPlan && (
                                <div className="mt-6 p-6 bg-slate-800/80 rounded-xl border border-white/10 animate-fade-in">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="font-semibold text-teal-400 text-lg">{t('generated_business_plan')}</h3>
                                        <ExportButtons content={idealProjectPlan} title={`Business_Plan_Ideal_${targetRegion}`} />
                                    </div>
                                    <pre className="text-slate-300 whitespace-pre-wrap font-sans text-sm leading-relaxed">{idealProjectPlan}</pre>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
            
            <div className="bg-slate-900/60 backdrop-blur-xl p-8 rounded-2xl border border-white/10 space-y-6 shadow-lg">
                <div>
                    <h2 className="text-2xl font-semibold text-white">{t('visionary_engine_title')}</h2>
                    <p className="text-slate-400 mt-1">{t('visionary_engine_description')}</p>
                </div>
                
                <button
                    onClick={handleGenerateVisionaryProposal}
                    disabled={isVisionaryLoading || !userCanEdit}
                    title={!userCanEdit ? "Editing restricted for this role" : ""}
                    className="flex items-center gap-2 px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition-all shadow-lg shadow-amber-900/20 disabled:bg-slate-800 disabled:text-slate-500 disabled:shadow-none disabled:cursor-not-allowed"
                >
                    {isVisionaryLoading && <Spinner size="sm" className="text-white" />}
                    {isVisionaryLoading ? t('generating') : t('generate_visionary_proposal')}
                </button>

                {isVisionaryLoading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-white/5">
                        <SkeletonLoader variant="card" count={4} height="150px" />
                    </div>
                )}

                {visionaryProposal && (
                    <div className="space-y-6 pt-6 border-t border-white/5 animate-pop-in">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-bold text-amber-400">{t('visionary_proposal_for', {region: visionaryProposal.proposalTitle})}</h3>
                            <ExportButtons content={JSON.stringify(visionaryProposal, null, 2)} title={`Visionary_Proposal_${targetRegion}`} />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-5 bg-slate-800/50 rounded-xl border border-white/5">
                                <h4 className="font-semibold text-amber-300 mb-2 flex items-center">{t('core_concept')} <SpeakerIcon text={visionaryProposal.coreConcept} /></h4>
                                <p className="text-slate-300 text-sm whitespace-pre-wrap">{visionaryProposal.coreConcept}</p>
                            </div>
                            <div className="p-5 bg-slate-800/50 rounded-xl border border-white/5">
                                <h4 className="font-semibold text-amber-300 mb-2 flex items-center">{t('enabling_tech')} <SpeakerIcon text={visionaryProposal.enablingTechnologies.join(', ')} /></h4>
                                <ul className="list-disc list-inside text-slate-300 text-sm">
                                    {visionaryProposal.enablingTechnologies.map(p => <li key={p}>{p}</li>)}
                                </ul>
                            </div>
                             <div className="p-5 bg-slate-800/50 rounded-xl border border-white/5">
                                <h4 className="font-semibold text-amber-300 mb-2 flex items-center">{t('transformative_impact')} <SpeakerIcon text={visionaryProposal.potentialImpact} /></h4>
                                <p className="text-slate-300 text-sm whitespace-pre-wrap">{visionaryProposal.potentialImpact}</p>
                            </div>
                            <div className="p-5 bg-slate-800/50 rounded-xl border border-white/5">
                                <h4 className="font-semibold text-amber-300 mb-2 flex items-center">{t('new_patent_opportunities')} <SpeakerIcon text={visionaryProposal.newPatentIdeas.join(', ')} /></h4>
                                <ul className="list-disc list-inside text-slate-300 text-sm">
                                    {visionaryProposal.newPatentIdeas.map(p => <li key={p}>{p}</li>)}
                                </ul>
                            </div>
                        </div>
                        
                        {visionarySources.length > 0 && (
                            <div className="p-4 bg-slate-900 rounded-lg border border-white/5">
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">{t('sources')}:</h4>
                                <ul className="space-y-1">
                                {visionarySources.map((source, i) => (
                                    <li key={i} className="text-xs">
                                        <a href={source.web?.uri} target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:text-sky-300 hover:underline flex items-center gap-1">
                                            <span className="w-1 h-1 rounded-full bg-sky-500"></span>
                                            {source.web?.title || source.web?.uri}
                                        </a>
                                    </li>
                                ))}
                                </ul>
                            </div>
                        )}
                        <Feedback sectionId={`visionary-proposal-${targetRegion}`} />

                        <div className="pt-6 border-t border-white/5">
                             <button onClick={handleGenerateVisionaryPlan} disabled={isVisionaryPlanLoading || !userCanEdit} className="flex items-center gap-2 px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg transition-all shadow-lg shadow-teal-900/20 disabled:bg-slate-800 disabled:text-slate-500 disabled:shadow-none disabled:cursor-not-allowed">
                                {isVisionaryPlanLoading && <Spinner size="sm" className="text-white" />}
                                {isVisionaryPlanLoading ? t('generating_business_plan') : t('generate_business_plan')}
                            </button>
                             {isVisionaryPlanLoading && <div className="mt-6"><SkeletonLoader variant="text" count={10} /></div>}
                             {visionaryProjectPlan && (
                                <div className="mt-6 p-6 bg-slate-800/80 rounded-xl border border-white/10 animate-fade-in">
                                     <div className="flex justify-between items-center mb-4">
                                        <h3 className="font-semibold text-teal-400 text-lg">{t('generated_business_plan')}</h3>
                                        <ExportButtons content={visionaryProjectPlan} title={`Business_Plan_Visionary_${targetRegion}`} />
                                    </div>
                                    <pre className="text-slate-300 whitespace-pre-wrap font-sans text-sm leading-relaxed">{visionaryProjectPlan}</pre>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
};
