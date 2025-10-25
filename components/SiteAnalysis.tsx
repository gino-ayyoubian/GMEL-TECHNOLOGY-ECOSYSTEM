import React, { useState, useContext } from 'react';
import { generateImage, generateGroundedText } from '../services/geminiService';
import { AppContext } from '../contexts/AppContext';
import { useI18n } from '../hooks/useI18n';
import { SpeakerIcon } from './shared/SpeakerIcon';

export const SiteAnalysis: React.FC = () => {
    const { region } = useContext(AppContext)!;
    const { t } = useI18n();
    const [mapUrl, setMapUrl] = useState<string | null>(null);
    const [analysis, setAnalysis] = useState<{text: string; sources: any[]}>({text: '', sources: []});
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        setIsLoading(true);
        setError(null);
        setMapUrl(null);
        setAnalysis({text: '', sources: []});

        try {
            // Generate map image
            const mapPrompt = t('site_analysis_map_prompt', { region });
            const mapResult = await generateImage(mapPrompt, '16:9');
            if (mapResult) {
                setMapUrl(mapResult);
            } else {
                throw new Error(t('error_failed_map'));
            }

            // Generate text analysis
            const analysisPrompt = t('site_analysis_prompt', { region });
            const analysisResult = await generateGroundedText(analysisPrompt);
            if (analysisResult.text) {
                setAnalysis(analysisResult);
            } else {
                 throw new Error(t('error_failed_analysis'));
            }

        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-white">{t('site_analysis_title')}</h1>
            <p className="text-slate-400 max-w-3xl">
                {t('site_analysis_description', { region })}
            </p>
            
            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 text-center">
                <button
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-sky-400 disabled:cursor-not-allowed"
                >
                    {isLoading ? t('generating_analysis') : t('generate_site_analysis')}
                </button>
            </div>

            {isLoading && (
                 <div className="w-full aspect-video bg-slate-800 rounded-lg flex items-center justify-center border border-slate-700">
                    <div className="text-center">
                         <svg className="animate-spin h-8 w-8 text-white mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="mt-4 text-slate-400">{t('generating_site_analysis_message')}</p>
                    </div>
                </div>
            )}
            
            {error && <p className="text-red-400 text-center">{error}</p>}

            {mapUrl && (
                <div className="mt-8">
                    <h2 className="text-xl font-semibold text-white mb-4">{t('generated_map_title', { region })}</h2>
                    <img src={mapUrl} alt={t('generated_map_alt', { region })} className="w-full rounded-lg shadow-lg" />
                </div>
            )}
            
            {analysis.text && (
                 <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                    <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                        {t('geographical_analysis')}
                        <SpeakerIcon text={analysis.text} />
                    </h2>
                     <p className="text-slate-300 whitespace-pre-wrap">{analysis.text}</p>
                     {analysis.sources.length > 0 && (
                        <div className="mt-4">
                            <h4 className="text-sm font-semibold text-slate-400">{t('sources')}:</h4>
                            <ul className="list-disc list-inside mt-2 text-xs text-slate-500 space-y-1">
                            {analysis.sources.map((source, i) => (
                                <li key={i}>
                                    <a href={source.web?.uri} target="_blank" rel="noopener noreferrer" className="hover:text-sky-400 hover:underline">
                                        {source.web?.title || source.web?.uri}
                                    </a>
                                </li>
                            ))}
                            </ul>
                        </div>
                     )}
                </div>
            )}
        </div>
    );
};