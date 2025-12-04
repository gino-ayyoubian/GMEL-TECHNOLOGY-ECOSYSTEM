
import React, { useState, useContext, useEffect } from 'react';
import { generateGroundedText, generateTextWithThinking } from '../services/geminiService';
import { AppContext } from '../contexts/AppContext';
import { useI18n } from '../hooks/useI18n';
import { KKM_LOGO_DATA_URL } from '../constants';
import { Region } from '../types';
import { SpeakerIcon } from './shared/SpeakerIcon';
import ExportButtons from './shared/ExportButtons';
import { canEdit } from '../utils/permissions';
import { extractJson } from '../utils/helpers';

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
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
            <h3 className="text-xl font-semibold text-sky-400 mb-3 flex items-center">
                {title}
                <SpeakerIcon text={Array.isArray(content) ? content.join(', ') : content} />
            </h3>
            {Array.isArray(content) ? (
                 <ul className="list-disc list-inside text-slate-300 space-y-1">
                    {content.map((item, index) => <li key={index}>{item}</li>)}
                </ul>
            ) : (
                <p className="text-slate-300 whitespace-pre-wrap">{content}</p>
            )}
        </div>
    )
};


export const ProposalGenerator: React.FC = () => {
    const { lang, userRole, setError } = useContext(AppContext)!;
    const { t } = useI18n();
    const userCanEdit = canEdit(userRole, 'proposal_generator');
    const [targetRegion, setTargetRegion] = useState<Region>('Kurdistan Region, Iraq');
    const [proposalData, setProposalData] = useState<ProposalData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [generationProgress, setGenerationProgress] = useState<string | null>(null);

    useEffect(() => {
        setProposalData(null);
        setError(null);
    }, [targetRegion, setError]);

    const handleGenerate = async () => {
        setIsLoading(true);
        setError(null);
        setProposalData(null);
        
        try {
            // Step 1: Generate the grounded regional analysis.
            setGenerationProgress('Generating Regional Analysis...');
            const regionalAnalysisPrompt = t('regional_analysis_prompt', { region: targetRegion });
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
            The language must be ${lang}. Use the following regional analysis to inform your writing:\n\n${regionalAnalysisContent}\n\n---\n\n`;

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

        } catch(e: any) {
            setError(e.message || t('error_generating_proposal'));
            console.error("Failed to generate proposal:", e);
        } finally {
            setIsLoading(false);
            setGenerationProgress(null);
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
        
        return textContent;
    };
    

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-white">{t('proposal_generator_title')}</h1>
            <p className="text-slate-400 max-w-3xl">
                {t('proposal_generator_description')}
            </p>
            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 space-y-4">
                <div className="max-w-md">
                    <label htmlFor="target-region" className="block text-sm font-medium text-slate-300">{t('select_proposal_region')}</label>
                    <select id="target-region" value={targetRegion} onChange={(e) => setTargetRegion(e.target.value as Region)} className="mt-1 w-full bg-slate-700 border-slate-600 rounded-md text-white font-semibold">
                        <option value="Kurdistan Region, Iraq">Kurdistan Region, Iraq</option>
                        <option value="Qeshm Free Zone">Qeshm Free Zone</option>
                        <option value="Makoo Free Zone">Makoo Free Zone</option>
                    </select>
                </div>
                 <button 
                    onClick={handleGenerate} 
                    disabled={isLoading || !userCanEdit} 
                    title={!userCanEdit ? "You have view-only access for this module." : ""}
                    className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:bg-sky-800 disabled:cursor-not-allowed"
                >
                    {isLoading ? t('generating_proposal') : t('generate_proposal')}
                </button>
            </div>
            
            {isLoading && (
                 <div className="text-center py-10">
                    <svg className="animate-spin h-8 w-8 text-white mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    <p className="mt-4 text-slate-400 font-semibold">{generationProgress || t('generating_proposal')}</p>
                    <p className="mt-1 text-sm text-slate-500">This may take a minute as multiple AI models collaborate...</p>
                </div>
            )}
            
            {proposalData && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-semibold text-white">{t('generated_proposal_title', { region: proposalData.gmel_proposal.region })}</h2>
                        {userRole === 'admin' && (
                            <ExportButtons 
                                content={getProposalAsText()}
                                title={`GMEL_Proposal_${proposalData.gmel_proposal.region}`}
                                htmlContent={getProposalAsHtml()}
                            />
                        )}
                    </div>
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
            )}

        </div>
    )
};
