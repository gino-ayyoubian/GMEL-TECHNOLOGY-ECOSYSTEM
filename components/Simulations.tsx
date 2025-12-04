
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

const LoadingSpinner: React.FC<{text: string}> = ({ text }) => (
    <div className="text-center py-10">
        <svg className="animate-spin h-8 w-8 text-white mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="mt-4 text-slate-400">{text}</p>
    </div>
);


export const Simulations: React.FC = () => {
    const { region: globalRegion, setError, userRole } = useContext(AppContext)!;
    const { t } = useI18n();
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
    }, [targetRegion, setError]);


    const simulationRegions: Region[] = [
        'Kurdistan Region, Iraq',
        'Mahabad',
        'Iranian Kurdistan',
        'Qeshm Free Zone',
        'Makoo Free Zone',
        'Chabahar Free Zone',
        'Oman',
        'Saudi Arabia',
        'United Arab Emirates',
        'Qatar'
    ];

    const handleGenerateGmelPackage = async () => {
        setIsGmelLoading(true);
        setError(null);
        setGmelPackage(null);
        setIdealProjectPlan(null); // Reset plan on new generation

        try {
            const prompt = t('gmel_package_prompt', { region: targetRegion });
            const result = await generateJsonWithThinking(prompt);
            const parsed = extractJson(result);
            if (parsed && parsed.recommendedPatents) {
                setGmelPackage(parsed);
            } else {
                throw new Error("Invalid format received from AI.");
            }
        } catch (e: any) {
            setError(e.message || "Failed to generate GMEL package.");
        } finally {
            setIsGmelLoading(false);
        }
    };
    
    const handleGenerateVisionaryProposal = async () => {
        setIsVisionaryLoading(true);
        setError(null);
        setVisionaryProposal(null);
        setVisionarySources([]);
        setVisionaryProjectPlan(null); // Reset plan on new generation

        try {
            const prompt = t('visionary_proposal_prompt', { region: targetRegion });
            const result = await generateGroundedText(prompt);
            const parsed = extractJson(result.text);

            if (parsed && parsed.proposalTitle) {
                setVisionaryProposal(parsed);
                setVisionarySources(result.sources);
            } else {
                throw new Error("Invalid format received from AI for visionary proposal.");
            }
        } catch (e: any) {
            setError(e.message || "Failed to generate visionary proposal.");
        } finally {
            setIsVisionaryLoading(false);
        }
    };
    
    const handleGenerateIdealPlan = async () => {
        if (!gmelPackage) return;
        setIsIdealPlanLoading(true);
        setIdealProjectPlan(null);
        try {
            const prompt = t('ideal_plan_prompt', {
                region: targetRegion,
                patents: gmelPackage.recommendedPatents.join(', '),
                synergies: gmelPackage.synergies,
                valueProp: gmelPackage.primaryValueProposition,
                profitability: gmelPackage.estimatedProfitability,
            });
            const result = await generateTextWithThinking(prompt);
            setIdealProjectPlan(result);
        } catch (e: any) {
            setError(e.message || "Failed to generate business plan.");
        } finally {
            setIsIdealPlanLoading(false);
        }
    };
    
    const handleGenerateVisionaryPlan = async () => {
        if (!visionaryProposal) return;
        setIsVisionaryPlanLoading(true);
        setVisionaryProjectPlan(null);
        try {
            const prompt = t('visionary_plan_prompt', {
                region: targetRegion,
                title: visionaryProposal.proposalTitle,
                concept: visionaryProposal.coreConcept,
                tech: visionaryProposal.enablingTechnologies.join(', '),
                impact: visionaryProposal.potentialImpact,
                patentIdeas: visionaryProposal.newPatentIdeas.join('; '),
            });
            const result = await generateTextWithThinking(prompt);
            setVisionaryProjectPlan(result);
        } catch (e: any) {
            setError(e.message || "Failed to generate business plan.");
        } finally {
            setIsVisionaryPlanLoading(false);
        }
    };


    return (
        <div className="space-y-12">
            <div>
                <h1 className="text-3xl font-bold text-white">{t('simulations_title')}</h1>
                <p className="text-slate-400 max-w-3xl mt-2">
                    {t('simulations_description')}
                </p>
            </div>

            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                <label htmlFor="simulation-region" className="block text-sm font-medium text-slate-300 mb-2">
                    Select Region for Simulation & Modeling
                </label>
                <select
                    id="simulation-region"
                    value={targetRegion}
                    onChange={(e) => setTargetRegion(e.target.value as Region)}
                    className="w-full max-w-sm bg-slate-700 border-slate-600 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 text-white font-semibold"
                >
                    {simulationRegions.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
            </div>

            {/* Ideal GMEL Project Modeler */}
            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 space-y-6">
                <h2 className="text-2xl font-semibold text-white">{t('gmel_modeler_title')}</h2>
                <p className="text-slate-400 -mt-4">{t('gmel_modeler_description')}</p>
                <button
                    onClick={handleGenerateGmelPackage}
                    disabled={isGmelLoading || !userCanEdit}
                    title={!userCanEdit ? "You have view-only access for this module." : ""}
                    className="px-6 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg transition-colors disabled:bg-sky-800 disabled:cursor-not-allowed"
                >
                    {isGmelLoading ? t('generating') : t('generate_gmel_package')}
                </button>

                {isGmelLoading && <LoadingSpinner text={t('generating_gmel_package')} />}
                
                {gmelPackage && (
                    <div className="space-y-4 pt-4 border-t border-slate-700">
                        <div className="flex justify-end">
                            <ExportButtons content={JSON.stringify(gmelPackage, null, 2)} title={`Ideal_GMEL_Package_${targetRegion}`} />
                        </div>
                        <div className="p-4 bg-slate-900 rounded-lg">
                            <h3 className="font-semibold text-sky-400 mb-2 flex items-center">{t('recommended_patents')} <SpeakerIcon text={gmelPackage.recommendedPatents.join(', ')} /></h3>
                            <ul className="list-disc list-inside text-slate-300">
                                {gmelPackage.recommendedPatents.map(p => <li key={p}>{p}</li>)}
                            </ul>
                        </div>
                        <div className="p-4 bg-slate-900 rounded-lg">
                            <h3 className="font-semibold text-sky-400 mb-2 flex items-center">{t('package_synergies')} <SpeakerIcon text={gmelPackage.synergies} /></h3>
                            <p className="text-slate-300 whitespace-pre-wrap">{gmelPackage.synergies}</p>
                        </div>
                        <div className="p-4 bg-slate-900 rounded-lg">
                            <h3 className="font-semibold text-sky-400 mb-2 flex items-center">{t('primary_value_prop')} <SpeakerIcon text={gmelPackage.primaryValueProposition} /></h3>
                            <p className="text-slate-300 whitespace-pre-wrap">{gmelPackage.primaryValueProposition}</p>
                        </div>
                        <div className="p-4 bg-slate-900 rounded-lg">
                            <h3 className="font-semibold text-sky-400 mb-2 flex items-center">{t('estimated_profitability')} <SpeakerIcon text={gmelPackage.estimatedProfitability} /></h3>
                            <p className="text-slate-300 whitespace-pre-wrap">{gmelPackage.estimatedProfitability}</p>
                        </div>
                        <Feedback sectionId={`gmel-package-modeler-${targetRegion}`} />

                        <div className="pt-4 border-t border-slate-700">
                            <button onClick={handleGenerateIdealPlan} disabled={isIdealPlanLoading || !userCanEdit} title={!userCanEdit ? "You have view-only access for this module." : ""} className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg transition-colors disabled:bg-teal-800 disabled:cursor-not-allowed">
                                {isIdealPlanLoading ? t('generating_business_plan') : t('generate_business_plan')}
                            </button>
                            {isIdealPlanLoading && <LoadingSpinner text={t('generating_business_plan')} />}
                            {idealProjectPlan && (
                                <div className="mt-4 p-4 bg-slate-900 rounded-lg">
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="font-semibold text-teal-400">{t('generated_business_plan')}</h3>
                                        <ExportButtons content={idealProjectPlan} title={`Business_Plan_Ideal_${targetRegion}`} />
                                    </div>
                                    <pre className="text-slate-300 whitespace-pre-wrap font-sans text-sm">{idealProjectPlan}</pre>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
            
            {/* Visionary Project Proposal Engine */}
            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 space-y-6">
                <h2 className="text-2xl font-semibold text-white">{t('visionary_engine_title')}</h2>
                <p className="text-slate-400 -mt-4">{t('visionary_engine_description')}</p>
                <button
                    onClick={handleGenerateVisionaryProposal}
                    disabled={isVisionaryLoading || !userCanEdit}
                    title={!userCanEdit ? "You have view-only access for this module." : ""}
                    className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition-colors disabled:bg-amber-800 disabled:cursor-not-allowed"
                >
                    {isVisionaryLoading ? t('generating') : t('generate_visionary_proposal')}
                </button>

                {isVisionaryLoading && <LoadingSpinner text={t('generating_visionary_proposal')} />}

                {visionaryProposal && (
                    <div className="space-y-4 pt-4 border-t border-slate-700">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-bold text-amber-400">{t('visionary_proposal_for', {region: visionaryProposal.proposalTitle})}</h3>
                            <ExportButtons content={JSON.stringify(visionaryProposal, null, 2)} title={`Visionary_Proposal_${targetRegion}`} />
                        </div>
                        
                        <div className="p-4 bg-slate-900 rounded-lg">
                            <h4 className="font-semibold text-amber-300 mb-2 flex items-center">{t('core_concept')} <SpeakerIcon text={visionaryProposal.coreConcept} /></h4>
                            <p className="text-slate-300 whitespace-pre-wrap">{visionaryProposal.coreConcept}</p>
                        </div>
                        <div className="p-4 bg-slate-900 rounded-lg">
                            <h4 className="font-semibold text-amber-300 mb-2 flex items-center">{t('enabling_tech')} <SpeakerIcon text={visionaryProposal.enablingTechnologies.join(', ')} /></h4>
                            <ul className="list-disc list-inside text-slate-300">
                                {visionaryProposal.enablingTechnologies.map(p => <li key={p}>{p}</li>)}
                            </ul>
                        </div>
                         <div className="p-4 bg-slate-900 rounded-lg">
                            <h4 className="font-semibold text-amber-300 mb-2 flex items-center">{t('transformative_impact')} <SpeakerIcon text={visionaryProposal.potentialImpact} /></h4>
                            <p className="text-slate-300 whitespace-pre-wrap">{visionaryProposal.potentialImpact}</p>
                        </div>
                        <div className="p-4 bg-slate-900 rounded-lg">
                            <h4 className="font-semibold text-amber-300 mb-2 flex items-center">{t('new_patent_opportunities')} <SpeakerIcon text={visionaryProposal.newPatentIdeas.join(', ')} /></h4>
                            <ul className="list-disc list-inside text-slate-300">
                                {visionaryProposal.newPatentIdeas.map(p => <li key={p}>{p}</li>)}
                            </ul>
                        </div>
                        
                        {visionarySources.length > 0 && (
                            <div className="p-4 bg-slate-900 rounded-lg">
                                <h4 className="text-sm font-semibold text-slate-400">{t('sources')}:</h4>
                                <ul className="list-disc list-inside mt-2 text-xs text-slate-500 space-y-1">
                                {visionarySources.map((source, i) => (
                                    <li key={i}>
                                        <a href={source.web?.uri} target="_blank" rel="noopener noreferrer" className="hover:text-sky-400 hover:underline">
                                            {source.web?.title || source.web?.uri}
                                        </a>
                                    </li>
                                ))}
                                </ul>
                            </div>
                        )}
                        <Feedback sectionId={`visionary-proposal-${targetRegion}`} />

                        <div className="pt-4 border-t border-slate-700">
                             <button onClick={handleGenerateVisionaryPlan} disabled={isVisionaryPlanLoading || !userCanEdit} title={!userCanEdit ? "You have view-only access for this module." : ""} className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg transition-colors disabled:bg-teal-800 disabled:cursor-not-allowed">
                                {isVisionaryPlanLoading ? t('generating_business_plan') : t('generate_business_plan')}
                            </button>
                             {isVisionaryPlanLoading && <LoadingSpinner text={t('generating_business_plan')} />}
                             {visionaryProjectPlan && (
                                <div className="mt-4 p-4 bg-slate-900 rounded-lg">
                                     <div className="flex justify-between items-center mb-2">
                                        <h3 className="font-semibold text-teal-400">{t('generated_business_plan')}</h3>
                                        <ExportButtons content={visionaryProjectPlan} title={`Business_Plan_Visionary_${targetRegion}`} />
                                    </div>
                                    <pre className="text-slate-300 whitespace-pre-wrap font-sans text-sm">{visionaryProjectPlan}</pre>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
