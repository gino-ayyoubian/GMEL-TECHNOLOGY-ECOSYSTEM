import React, { useState, useContext } from 'react';
import { jsPDF } from 'jspdf';
import { generateTextWithThinking, generateGroundedText } from '../services/geminiService';
import { AppContext } from '../contexts/AppContext';
import { useI18n } from '../hooks/useI18n';
import { KKM_LOGO_DATA_URL } from '../constants';
import { Region } from '../types';
import { SpeakerIcon } from './shared/SpeakerIcon';

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
    const { lang } = useContext(AppContext)!;
    const { t } = useI18n();
    const [targetRegion, setTargetRegion] = useState<Region>('Kurdistan Region, Iraq');
    const [focusAreas, setFocusAreas] = useState('energy independence, DLE, green hydrogen');
    const [proposalData, setProposalData] = useState<ProposalData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        setIsLoading(true);
        setError(null);
        setProposalData(null);
        
        try {
            // Step 1: Generate the grounded regional analysis.
            const regionalAnalysisPrompt = t('regional_analysis_prompt', { region: targetRegion });
            const groundedResult = await generateGroundedText(regionalAnalysisPrompt);
            
            if (!groundedResult.text) {
                throw new Error("Failed to generate the grounded regional analysis text.");
            }
            const regionalAnalysisContent = groundedResult.text;

            // Step 2: Generate the full proposal, injecting the analysis.
            const proposalPrompt = t('proposal_generation_prompt', { 
                region: targetRegion, 
                focus_areas: focusAreas, 
                language: lang,
                regional_analysis_content: regionalAnalysisContent
            });
            const result = await generateTextWithThinking(proposalPrompt);

            // Step 3: Parse and set the final data.
            const parsed = extractJson(result);
            if (parsed && parsed.gmel_proposal) {
                // To ensure full fidelity of the grounded data, we re-inject it here,
                // overriding any potential modifications by the second AI call.
                parsed.gmel_proposal.regional_analysis = regionalAnalysisContent;
                setProposalData(parsed);
            } else {
                throw new Error("Invalid format received from API for the final proposal.");
            }
        } catch(e: any) {
            setError(t('error_generating_proposal') + (e.message ? `: ${e.message}` : ''));
            console.error("Failed to generate proposal:", e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleExportPdf = () => {
        if (!proposalData) return;
        const doc = new jsPDF({
            orientation: 'p',
            unit: 'mm',
            format: 'a4'
        });
        const data = proposalData.gmel_proposal;
    
        const reportElement = document.createElement('div');
        reportElement.style.width = '210mm';
        reportElement.style.boxSizing = 'border-box';
        reportElement.style.padding = '15mm';
        reportElement.style.color = '#333';
        reportElement.style.backgroundColor = '#fff';
        reportElement.style.fontFamily = lang === 'fa' ? "'Vazirmatn', sans-serif" : "'Inter', sans-serif";
        reportElement.style.direction = lang === 'fa' ? 'rtl' : 'ltr';
        reportElement.style.fontSize = '10pt';
    
        let html = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15mm; padding-bottom: 5mm; border-bottom: 1px solid #eee;">
                <img src="${KKM_LOGO_DATA_URL}" style="height: 25mm;" />
                <div style="text-align: ${lang === 'fa' ? 'left' : 'right'};">
                    <h1 style="font-size: 18pt; font-weight: bold; margin: 0; color: #0284c7;">GeoMeta Energy Layer</h1>
                    <p style="font-size: 12pt; margin: 0;">Intelligent Project Proposal</p>
                    <p style="font-size: 10pt; margin: 2mm 0 0;">Region: ${data.region}</p>
                </div>
            </div>
        `;
    
        const createSection = (title: string, content: string | string[]) => {
            const contentHtml = Array.isArray(content)
                ? `<ul style="padding-${lang === 'fa' ? 'right' : 'left'}: 20px;">${content.map(item => `<li style="margin-bottom: 5px;">${item}</li>`).join('')}</ul>`
                : `<p style="white-space: pre-wrap; line-height: 1.6; text-align: justify;">${content.replace(/\n/g, '<br/>')}</p>`;
    
            return `
                <div style="margin-top: 10mm; page-break-inside: avoid;">
                    <h2 style="font-size: 14pt; font-weight: bold; color: #0ea5e9; border-bottom: 1.5px solid #0ea5e9; padding-bottom: 2mm; margin-bottom: 4mm;">${title}</h2>
                    <div style="font-size: 10pt;">${contentHtml}</div>
                </div>
            `;
        };
    
        html += createSection(t('executive_summary'), data.executive_summary);
        html += createSection(t('regional_analysis'), data.regional_analysis);
        html += createSection(t('technical_modeling'), data.technical_modeling);
        html += createSection(t('financial_analysis'), data.financial_analysis);
        html += createSection(t('innovation_and_patent_layer'), data.innovation_and_patent_layer);
        html += createSection(t('strategy_model'), data.strategy_model);
        // FIX: Renamed translation key to match data structure and fix inconsistency.
        html += createSection(t('risk_and_roadmap'), data.risk_and_roadmap);
        html += createSection(t('gmel_patent_reference'), data.gmel_patent_reference);
        html += createSection(t('ownership_statement'), data.ownership_statement);
    
        reportElement.innerHTML = html;
    
        // Hide it and add to body to be rendered by browser
        reportElement.style.position = 'absolute';
        reportElement.style.left = '-300mm'; // Far off screen
        reportElement.style.top = '0';
        document.body.appendChild(reportElement);
    
        doc.html(reportElement, {
            callback: function(doc) {
                const totalPages = (doc as any).internal.getNumberOfPages();
                for (let i = 1; i <= totalPages; i++) {
                    doc.setPage(i);
                    
                    // WATERMARK
                    doc.saveGraphicsState();
                    doc.setGState(new (doc as any).GState({ opacity: 0.08 }));
                    doc.setFontSize(45);
                    doc.setTextColor(150);
                    const watermarkText = "GeoMeta Energy Layer – KKM Int'l Group";
                    doc.text(watermarkText, doc.internal.pageSize.getWidth() / 2, doc.internal.pageSize.getHeight() / 2, { align: 'center', angle: 45 });
                    doc.restoreGraphicsState();
    
                    // FOOTER
                    doc.setFontSize(8);
                    doc.setTextColor(100);
                    doc.text(`Page ${i} of ${totalPages} | Confidential | Inventor: Seyed Gino Ayyoubian`, 15, doc.internal.pageSize.getHeight() - 10);
                }
                doc.save(`GMEL_Proposal_${data.region.replace(/\s/g, '_')}.pdf`);
                document.body.removeChild(reportElement);
            },
            margin: [15, 15, 15, 15],
            autoPaging: 'text',
            html2canvas: {
                scale: 0.5,
                useCORS: true,
            }
        });
    };

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-white">{t('proposal_generator_title')}</h1>
            <p className="text-slate-400 max-w-3xl">
                {t('proposal_generator_description')}
            </p>
            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="target-region" className="block text-sm font-medium text-slate-300">{t('select_proposal_region')}</label>
                        <select id="target-region" value={targetRegion} onChange={(e) => setTargetRegion(e.target.value as Region)} className="mt-1 w-full bg-slate-700 border-slate-600 rounded-md text-white font-semibold">
                            <option value="Kurdistan Region, Iraq">Kurdistan Region, Iraq</option>
                            <option value="Qeshm Free Zone">Qeshm Free Zone</option>
                            <option value="Makoo Free Zone">Makoo Free Zone</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="focus-areas" className="block text-sm font-medium text-slate-300">{t('focus_areas')}</label>
                        <input type="text" id="focus-areas" value={focusAreas} onChange={e => setFocusAreas(e.target.value)} placeholder={t('focus_areas_placeholder')} className="mt-1 block w-full bg-slate-700 border-slate-600 rounded-md text-slate-200" />
                    </div>
                </div>
                 <button onClick={handleGenerate} disabled={isLoading} className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:bg-sky-800">
                    {isLoading ? t('generating_proposal') : t('generate_proposal')}
                </button>
            </div>
            
            {error && <p className="text-red-400 text-center">{error}</p>}
            
            {isLoading && (
                 <div className="text-center py-10">
                    <svg className="animate-spin h-8 w-8 text-white mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    <p className="mt-4 text-slate-400">{t('generating_proposal')}</p>
                </div>
            )}
            
            {proposalData && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-semibold text-white">{t('generated_proposal_title', { region: proposalData.gmel_proposal.region })}</h2>
                        <button onClick={handleExportPdf} className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded-lg text-sm flex items-center gap-2 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a5 5 0 00-5 5v3a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2V7a5 5 0 00-5-5zm0 2a3 3 0 013 3v3H7V7a3 3 0 013-3z" /></svg>
                            {t('export_secure_pdf')}
                        </button>
                    </div>
                    <ProposalSection title={t('executive_summary')} content={proposalData.gmel_proposal.executive_summary} />
                    <ProposalSection title={t('regional_analysis')} content={proposalData.gmel_proposal.regional_analysis} />
                    <ProposalSection title={t('technical_modeling')} content={proposalData.gmel_proposal.technical_modeling} />
                    <ProposalSection title={t('financial_analysis')} content={proposalData.gmel_proposal.financial_analysis} />
                    <ProposalSection title={t('innovation_patent_layer')} content={proposalData.gmel_proposal.innovation_and_patent_layer} />
                    <ProposalSection title={t('strategy_model')} content={proposalData.gmel_proposal.strategy_model} />
                    {/* FIX: Renamed translation key to match data structure and fix inconsistency. */}
                    <ProposalSection title={t('risk_and_roadmap')} content={proposalData.gmel_proposal.risk_and_roadmap} />
                    <ProposalSection title={t('gmel_patent_reference')} content={proposalData.gmel_proposal.gmel_patent_reference} />
                    <ProposalSection title={t('ownership_statement')} content={proposalData.gmel_proposal.ownership_statement} />
                </div>
            )}

        </div>
    )
};