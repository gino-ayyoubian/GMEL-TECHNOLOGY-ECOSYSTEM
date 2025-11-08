import React, { useState } from 'react';
import { useI18n } from '../hooks/useI18n';
import { PatentInfographic } from './PatentInfographic';
import { generateGroundedText } from '../services/geminiService';
import { PATENT_PORTFOLIO } from '../constants';
import { SpeakerIcon } from './shared/SpeakerIcon';
import { Feedback } from './shared/Feedback';

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

interface PatentOverlap {
    patent_identifier: string;
    title: string;
    assignee: string;
    summary: string;
    potential_overlap_with_gmel: string;
    overlap_description: string;
}

interface AnalysisResult {
    potential_overlaps: PatentOverlap[];
    legal_strategy: string;
}

const CompetitiveAnalysis: React.FC = () => {
    const { t } = useI18n();
    const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleRunAnalysis = async () => {
        setIsLoading(true);
        setError(null);
        setAnalysis(null);

        const gmel_patents_context = PATENT_PORTFOLIO
            .filter(p => p.level === 'Derivatives' || p.level === 'Applied')
            .map(p => `- ${p.code} (${p.title}): ${p.application}`)
            .join('\n');
        
        const prompt = t('patent_analysis_prompt', { gmel_patents_context });

        try {
            const result = await generateGroundedText(prompt);
            const parsed = extractJson(result.text);
            if (parsed && parsed.potential_overlaps && parsed.legal_strategy) {
                setAnalysis(parsed);
            } else {
                console.warn("Could not parse JSON from patent analysis response. Displaying raw text.");
                // Fallback for non-JSON or malformed responses
                setAnalysis({
                    potential_overlaps: [],
                    legal_strategy: result.text || t('no_overlaps_found')
                });
            }
        } catch (e: any) {
            setError(e.message || "Failed to generate patent analysis.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
            <h2 className="text-2xl font-semibold text-white">{t('competitive_patent_analysis_title')}</h2>
            <p className="text-slate-400 mt-2 mb-4 max-w-3xl">{t('competitive_patent_analysis_desc')}</p>
            <button
                onClick={handleRunAnalysis}
                disabled={isLoading}
                className="px-6 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg transition-colors disabled:bg-sky-800 disabled:cursor-not-allowed"
            >
                {isLoading ? t('analyzing_patents') : t('run_patent_analysis_button')}
            </button>

            {isLoading && (
                 <div className="text-center py-10">
                    <svg className="animate-spin h-8 w-8 text-white mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    <p className="mt-4 text-slate-400">{t('analyzing_patents')}</p>
                </div>
            )}
            {error && <p className="text-red-400 mt-4">{error}</p>}
            
            {analysis && (
                <div className="mt-6 space-y-6">
                    <div>
                        <h3 className="text-xl font-semibold text-white mb-4">{t('potential_overlaps_title')}</h3>
                        {analysis.potential_overlaps.length > 0 ? (
                             <div className="space-y-4">
                                {analysis.potential_overlaps.map((item, index) => (
                                    <div key={index} className="bg-slate-900/70 p-4 rounded-lg border border-slate-700">
                                        <p className="font-semibold text-sky-400">{item.title}</p>
                                        <p className="text-sm text-slate-300"><span className="font-medium">Assignee:</span> {item.assignee} | <span className="font-medium">ID:</span> {item.patent_identifier}</p>
                                        <p className="text-xs text-slate-400 mt-2">{item.summary}</p>
                                        <div className="mt-3 p-2 bg-amber-900/30 rounded border border-amber-500/30">
                                            <p className="text-xs font-semibold text-amber-300">Potential Overlap with {item.potential_overlap_with_gmel}: <span className="font-normal text-amber-400">{item.overlap_description}</span></p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-slate-400 italic">{t('no_overlaps_found')}</p>
                        )}
                        <Feedback sectionId="patent-overlaps-analysis" />
                    </div>
                     <div>
                        <h3 className="text-xl font-semibold text-white mb-2 flex items-center">{t('legal_strategy_title')} <SpeakerIcon text={analysis.legal_strategy} /></h3>
                        <p className="text-slate-300 whitespace-pre-wrap">{analysis.legal_strategy}</p>
                        <Feedback sectionId="patent-strategy-analysis" />
                    </div>
                </div>
            )}
        </div>
    );
};


export const IPRoadmap: React.FC = () => {
    const { t } = useI18n();

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-white">{t('ip_roadmap_title')}</h1>
      <p className="text-slate-400 max-w-3xl">
        {t('ip_roadmap_description')}
      </p>
      
      <div className="bg-slate-800 p-0 md:p-4 rounded-lg border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
            <PatentInfographic />
        </div>
      </div>

      <CompetitiveAnalysis />

    </div>
  );
};