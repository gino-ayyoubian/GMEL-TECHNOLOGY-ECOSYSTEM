
import React, { useState, useContext, useEffect } from 'react';
import { generateGroundedText, generateTextWithThinking } from '../services/geminiService';
import { AppContext } from '../contexts/AppContext';
import { useI18n } from '../hooks/useI18n';
import { KKM_LOGO_DATA_URL, ALL_REGIONS, PATENT_PORTFOLIO, CORE_PATENT, getFinancialData } from '../constants';
import { Region } from '../types';
import { SpeakerIcon } from './shared/SpeakerIcon';
import ExportButtons from './shared/ExportButtons';
import { canEdit } from '../utils/permissions';
import { extractJson } from '../utils/helpers';
import { Spinner } from './shared/Loading';
import { AuditService } from '../services/auditService';
import { Lock, TrendingUp, Briefcase, Zap } from 'lucide-react';

interface ProposalData {
    gmel_proposal: {
        region: string;
        language: string;
        sector: string;
        executive_summary: string;
        regional_analysis: string;
        technical_modeling: string;
        financial_analysis: string;
        innovation_and_patent_layer: string;
        strategy_model: string;
        risk_and_roadmap: string;
        gmel_patent_reference: string[];
        ownership_statement: string;
    }
}

const ProposalSection: React.FC<{ title: string; content: string | string[]; }> = ({ title, content }) => {
    return (
        <div className="bg-slate-900/60 backdrop-blur-md p-6 rounded-xl border border-white/10 hover:border-sky-500/20 transition-all">
            <h3 className="text-xl font-semibold text-sky-400 mb-3 flex items-center">
                {title}
                <SpeakerIcon text={Array.isArray(content) ? content.join(', ') : content} />
            </h3>
            {Array.isArray(content) ? (
                 <ul className="list-disc list-inside text-slate-300 space-y-2">
                    {content.map((item, index) => <li key={index} className="leading-relaxed">{item}</li>)}
                </ul>
            ) : (
                <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">{content}</p>
            )}
        </div>
    )
};


export const ProposalGenerator: React.FC = () => {
    const { lang, userRole, setError, supportedLangs, currentUser } = useContext(AppContext)!;
    const { t } = useI18n();
    // Use strict View-based permission
    const userCanEdit = canEdit(userRole, 'proposal_generator');
    
    const [targetRegion, setTargetRegion] = useState<Region>('Kurdistan Region, Iraq');
    const [proposalData, setProposalData] = useState<ProposalData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [generationProgress, setGenerationProgress] = useState<string | null>(null);

    // Optimization State (Admin Only)
    const [optimizationData, setOptimizationData] = useState<string | null>(null);
    const [isOptimizing, setIsOptimizing] = useState(false);

    useEffect(() => {
        setProposalData(null);
        setOptimizationData(null);
        setError(null);
    }, [targetRegion, lang, setError]);

    const handleGenerate = async () => {
        if (!userCanEdit) return;
        setIsLoading(true);
        setError(null);
        setProposalData(null);
        setOptimizationData(null);
        const langName = supportedLangs.find(l => l.code === lang)?.name || 'English';
        
        try {
            // Step 1: Generate the grounded regional analysis.
            setGenerationProgress('Generating Regional Analysis...');
            const regionalAnalysisPrompt = t('regional_analysis_prompt', { region: targetRegion, language: langName });
            const groundedResult = await generateGroundedText(regionalAnalysisPrompt);
            if (!groundedResult.text) throw new Error("Regional Analysis generation failed.");
            const regionalAnalysisContent = groundedResult.text;

            const baseProposal: ProposalData['gmel_proposal'] = {
                region: targetRegion,
                language: lang,
                sector: "Renewable Energy & Sustainable Development",
                regional_analysis: regionalAnalysisContent,
                executive_summary: '', technical_modeling: '', financial_analysis: '',
                innovation_and_patent_layer: '', strategy_model: '', risk_and_roadmap: '',
                gmel_patent_reference: ["GMEL-CLG", "GMEL-Desal", "GMEL-LithiumLoop", "GMEL-H₂Cell"],
                ownership_statement: 'All intellectual property rights for the GeoMeta Energy Layer (GMEL) and its associated technologies are retained by the inventor, Seyed Gino Ayyoubian, and the KKM International Group. Usage, reproduction, or commercial exploitation in any form is strictly prohibited without a formal written agreement.'
            };
            
            // Enriched context with specific GMEL details to guide the AI
            const context = `Context: You are writing a section of a formal project proposal for the GMEL (GeoMeta Energy Layer) project, targeting ${targetRegion}. 
            GMEL is a cutting-edge closed-loop geothermal ecosystem featuring superhot rock drilling, proprietary nanofluids, and integrated solutions for desalination, hydrogen production, and lithium extraction.
            The language must be ${langName}. Use the following regional analysis to inform your writing:\n\n${regionalAnalysisContent}\n\n---\n\n`;

            const generateSection = async (title: string, prompt: string) => {
                setGenerationProgress(`Generating ${title}...`);
                return await generateTextWithThinking(context + prompt);
            };

            baseProposal.executive_summary = await generateSection('Executive Summary', 'Write the "Executive Summary" section. It should be a concise, compelling summary of the entire proposal.');
            baseProposal.technical_modeling = await generateSection('Technical Modeling', 'Write the "Technical Modeling" section. Describe the proposed GMEL technology package for this region, explaining why specific technologies were chosen.');
            baseProposal.financial_analysis = await generateSection('Financial Analysis', 'Write the "Financial Analysis" section. Summarize the financial projections, ROI, and funding strategy based on pilot project data and regional context.');
            baseProposal.innovation_and_patent_layer = await generateSection('Innovation Layer', 'Write the "Innovation & Patent Layer" section. Explain the core IP, its strategic value, and how it provides a competitive advantage.');
            baseProposal.strategy_model = await generateSection('Strategy Model', 'Write the "Strategy Model" section. Describe the proposed business model or Joint Venture (JV) structure for implementing the project in this region.');
            baseProposal.risk_and_roadmap = await generateSection('Risk & Roadmap', 'Write the "Risk & Roadmap" section. Analyze the key risks (political, economic, technical) and propose a high-level project implementation roadmap with major phases.');
            
            setProposalData({ gmel_proposal: baseProposal });
            AuditService.log(currentUser || 'user', 'PROPOSAL_GENERATED', `Generated full proposal for ${targetRegion}`);

        } catch(e: any) {
            setError(e.message || t('error_generating_proposal'));
            console.error("Failed to generate proposal:", e);
            AuditService.log(currentUser || 'user', 'PROPOSAL_GENERATION_FAILED', e.message, 'FAILURE');
        } finally {
            setIsLoading(false);
            setGenerationProgress(null);
        }
    };

    const handleOptimization = async () => {
        if (userRole !== 'admin') return;
        setIsOptimizing(true);
        setError(null);
        const langName = supportedLangs.find(l => l.code === lang)?.name || 'English';

        try {
            // Aggregate all data for the Thinking Model
            const patentsContext = [CORE_PATENT, ...PATENT_PORTFOLIO].map(p => `${p.code}: ${p.title} (${p.application})`).join('; ');
            const financialContext = getFinancialData(targetRegion).map(f => `${f.component}: ${f.value} ${f.unit}`).join(', ');

            const prompt = t('optimization_prompt', {
                region: targetRegion,
                language: langName,
                patents: patentsContext,
                financials: financialContext
            });

            const result = await generateTextWithThinking(prompt);
            setOptimizationData(result);
            AuditService.log(currentUser || 'user', 'STRATEGIC_OPTIMIZATION', `Generated admin insights for ${targetRegion}`);

        } catch (e: any) {
            setError("Failed to generate strategic optimization.");
            console.error(e);
        } finally {
            setIsOptimizing(false);
        }
    };

    const getProposalAsHtml = (): string => {
        if (!proposalData) return '';
        const data = proposalData.gmel_proposal;
    
        let fontFamily = "'Inter', sans-serif";
        let direction: 'ltr' | 'rtl' = 'ltr';
        if (lang === 'fa' || lang === 'ar' || lang === 'ku') {
            direction = 'rtl';
            fontFamily = "'Vazirmatn', sans-serif";
            if (lang === 'ar' || lang === 'ku') {
                fontFamily = "'Noto Sans Arabic', sans-serif";
            }
        }
        let html = `
            <div style="font-family: ${fontFamily}; direction: ${direction};">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15mm; padding-bottom: 5mm; border-bottom: 1px solid #eee;">
                    <img src="${KKM_LOGO_DATA_URL}" style="height: 25mm;" />
                    <div style="text-align: ${direction === 'rtl' ? 'left' : 'right'};">
                        <h1 style="font-size: 18pt; font-weight: bold; margin: 0; color: #0284c7;">GeoMeta Energy Layer</h1>
                        <p style="font-size: 12pt; margin: 0;">Intelligent Project Proposal</p>
                        <p style="font-size: 10pt; margin: 2mm 0 0;">Region: ${data.region}</p>
                    </div>
                </div>`;
    
        const createSection = (title: string, content: string | string[]) => {
            const contentHtml = Array.isArray(content)
                ? `<ul style="padding-${direction === 'rtl' ? 'right' : 'left'}: 20px;">${content.map(item => `<li style="margin-bottom: 5px;">${item}</li>`).join('')}</ul>`
                : `<p style="white-space: pre-wrap; line-height: 1.6; text-align: justify;">${content.replace(/\n/g, '<br/>')}</p>`;
    
            return `
                <div style="margin-top: 10mm; page-break-inside: avoid;">
                    <h2 style="font-size: 14pt; font-weight: bold; color: #0ea5e9; border-bottom: 1.5px solid #0ea5e9; padding-bottom: 2mm; margin-bottom: 4mm;">${title}</h2>
                    <div style="font-size: 10pt;">${contentHtml}</div>
                </div>`;
        };
    
        html += createSection(t('executive_summary'), data.executive_summary);
        html += createSection(t('regional_analysis'), data.regional_analysis);
        html += createSection(t('technical_modeling'), data.technical_modeling);
        html += createSection(t('financial_analysis'), data.financial_analysis);
        html += createSection(t('innovation_and_patent_layer'), data.innovation_and_patent_layer);
        html += createSection(t('strategy_model'), data.strategy_model);
        html += createSection(t('risk_and_roadmap'), data.risk_and_roadmap);
        html += createSection(t('gmel_patent_reference'), data.gmel_patent_reference);
        html += createSection(t('ownership_statement'), data.ownership_statement);
        
        // Append Admin Optimization if available
        if (optimizationData) {
             html += `
                <div style="margin-top: 15mm; padding: 10mm; background-color: #fef2f2; border: 1px solid #ef4444; border-radius: 5px; page-break-before: always;">
                    <h2 style="font-size: 16pt; font-weight: bold; color: #b91c1c; margin-bottom: 5mm; text-align: center;">CONFIDENTIAL: ${t('optimization_result_title')}</h2>
                    <div style="font-size: 10pt; white-space: pre-wrap;">${optimizationData.replace(/\n/g, '<br/>')}</div>
                </div>
             `;
        }
    
        html += '</div>';
        return html;
    }

    const getProposalAsText = () => {
        if (!proposalData) return '';
        const data = proposalData.gmel_proposal;

        let textContent = `GeoMeta Energy Layer - Intelligent Project Proposal\n`;
        textContent += `Region: ${data.region}\n`;
        textContent += "==================================================\n\n";

        const createTextSection = (title: string, content: string | string[]) => {
            let section = `## ${title.toUpperCase()} ##\n\n`;
            if (Array.isArray(content)) {
                section += content.map(item => `- ${item}`).join('\n');
            } else {
                section += content;
            }
            return section + "\n\n==================================================\n\n";
        };

        textContent += createTextSection(t('executive_summary'), data.executive_summary);
        textContent += createTextSection(t('regional_analysis'), data.regional_analysis);
        textContent += createTextSection(t('technical_modeling'), data.technical_modeling);
        textContent += createTextSection(t('financial_analysis'), data.financial_analysis);
        textContent += createTextSection(t('innovation_and_patent_layer'), data.innovation_and_patent_layer);
        textContent += createTextSection(t('strategy_model'), data.strategy_model);
        textContent += createTextSection(t('risk_and_roadmap'), data.risk_and_roadmap);
        textContent += createTextSection(t('gmel_patent_reference'), data.gmel_patent_reference);
        textContent += createTextSection(t('ownership_statement'), data.ownership_statement);
        
        if (optimizationData) {
            textContent += "\n\n!!! CONFIDENTIAL ADMIN ADDENDUM !!!\n\n";
            textContent += optimizationData;
        }
        
        return textContent;
    };
    

    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold text-white">{t('proposal_generator_title')}</h1>
                <p className="text-slate-400 max-w-3xl mt-2 leading-relaxed">
                    {t('proposal_generator_description')}
                </p>
            </div>

            <div className="bg-slate-900/60 backdrop-blur-xl p-6 rounded-2xl border border-white/10 space-y-4 shadow-lg">
                <div className="max-w-md">
                    <label htmlFor="target-region" className="block text-sm font-medium text-slate-300 mb-2">{t('select_proposal_region')}</label>
                    <select id="target-region" value={targetRegion} onChange={(e) => setTargetRegion(e.target.value as Region)} className="w-full bg-slate-800 border-slate-700 rounded-lg shadow-sm focus:ring-sky-500 focus:border-sky-500 text-white font-medium py-2.5">
                        {ALL_REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                </div>
                 <button 
                    onClick={handleGenerate} 
                    disabled={isLoading || !userCanEdit} 
                    title={!userCanEdit ? "Restricted for current role" : ""}
                    className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white font-bold py-2.5 px-6 rounded-lg transition-all shadow-lg shadow-sky-900/20 disabled:bg-slate-800 disabled:text-slate-500 disabled:shadow-none disabled:cursor-not-allowed"
                >
                    {isLoading && <Spinner size="sm" className="text-white" />}
                    {isLoading ? t('generating_proposal') : t('generate_proposal')}
                </button>
            </div>
            
            {isLoading && (
                 <div className="text-center py-16 bg-slate-900/30 rounded-xl border border-dashed border-slate-700/50">
                    <Spinner size="xl" className="text-sky-500 mx-auto" />
                    <p className="mt-6 text-lg font-medium text-white">{generationProgress || t('generating_proposal')}</p>
                    <p className="mt-2 text-sm text-slate-400">This process involves multiple AI models working in parallel. Please wait...</p>
                </div>
            )}
            
            {proposalData && (
                <div className="space-y-6 animate-pop-in">
                    <div className="flex justify-between items-center bg-slate-900/80 p-4 rounded-xl border border-white/10">
                        <h2 className="text-2xl font-bold text-white tracking-tight">{t('generated_proposal_title', { region: proposalData.gmel_proposal.region })}</h2>
                        {userRole === 'admin' && (
                            <ExportButtons 
                                content={getProposalAsText()}
                                title={`GMEL_Proposal_${proposalData.gmel_proposal.region}`}
                                htmlContent={getProposalAsHtml()}
                            />
                        )}
                    </div>
                    <div className="space-y-6">
                        <ProposalSection title={t('executive_summary')} content={proposalData.gmel_proposal.executive_summary} />
                        <ProposalSection title={t('regional_analysis')} content={proposalData.gmel_proposal.regional_analysis} />
                        <ProposalSection title={t('technical_modeling')} content={proposalData.gmel_proposal.technical_modeling} />
                        <ProposalSection title={t('financial_analysis')} content={proposalData.gmel_proposal.financial_analysis} />
                        <ProposalSection title={t('innovation_and_patent_layer')} content={proposalData.gmel_proposal.innovation_and_patent_layer} />
                        <ProposalSection title={t('strategy_model')} content={proposalData.gmel_proposal.strategy_model} />
                        <ProposalSection title={t('risk_and_roadmap')} content={proposalData.gmel_proposal.risk_and_roadmap} />
                        <ProposalSection title={t('gmel_patent_reference')} content={proposalData.gmel_proposal.gmel_patent_reference} />
                        <ProposalSection title={t('ownership_statement')} content={proposalData.gmel_proposal.ownership_statement} />
                    </div>

                    {/* Admin-Only Strategic Optimization Section */}
                    {userRole === 'admin' && (
                        <div className="mt-12 bg-gradient-to-br from-slate-900 via-[#1a0f0f] to-slate-900 border border-amber-900/50 rounded-2xl p-8 relative overflow-hidden shadow-2xl">
                            {/* Decorative Background */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-600/5 rounded-full blur-3xl pointer-events-none -mt-20 -mr-20"></div>
                            
                            <div className="flex justify-between items-center mb-6 relative z-10">
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <Lock className="w-5 h-5 text-amber-500" />
                                        <span className="text-xs font-bold uppercase tracking-widest text-amber-500">{t('optimization_badge')}</span>
                                    </div>
                                    <h2 className="text-2xl font-bold text-white">{t('optimization_title')}</h2>
                                </div>
                                <button
                                    onClick={handleOptimization}
                                    disabled={isOptimizing}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-amber-700 to-red-900 hover:from-amber-600 hover:to-red-800 text-white font-bold rounded-lg transition-all shadow-lg border border-amber-500/30 disabled:opacity-50"
                                >
                                    {isOptimizing ? <Spinner size="sm" className="text-white" /> : <TrendingUp className="w-4 h-4" />}
                                    {isOptimizing ? t('generating_optimization') : t('generate_optimization')}
                                </button>
                            </div>

                            {isOptimizing && (
                                <div className="py-12 text-center relative z-10">
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-amber-500 blur-xl opacity-20 animate-pulse"></div>
                                            <Briefcase className="w-12 h-12 text-amber-500 animate-bounce" />
                                        </div>
                                        <p className="text-amber-200/70 font-mono text-sm">Synthesizing 14 Patents & Regional Economics...</p>
                                    </div>
                                </div>
                            )}

                            {optimizationData && (
                                <div className="space-y-6 relative z-10 animate-fade-in">
                                    <div className="bg-black/30 backdrop-blur-sm p-6 rounded-xl border border-amber-500/20">
                                        <div className="flex items-center gap-3 mb-4 border-b border-amber-500/20 pb-2">
                                            <Zap className="w-5 h-5 text-amber-400" />
                                            <h3 className="text-lg font-bold text-amber-100">{t('optimization_result_title')}</h3>
                                            <div className="ml-auto">
                                                <SpeakerIcon text={optimizationData} />
                                            </div>
                                        </div>
                                        <div className="text-slate-300 whitespace-pre-wrap leading-relaxed font-light text-sm">
                                            {optimizationData}
                                        </div>
                                    </div>
                                    <p className="text-xs text-amber-500/50 text-center italic">
                                        This section contains sensitive strategic output. Authorized eyes only.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

        </div>
    )
};
