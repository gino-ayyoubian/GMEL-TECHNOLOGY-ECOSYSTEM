import React, { useState, useContext, useEffect } from 'react';
import { generateImage } from '../services/geminiService';
import { AppContext } from '../contexts/AppContext';
import { useI18n } from '../hooks/useI18n';

const PromptGuide = () => {
    const { t } = useI18n();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="bg-slate-800/50 rounded-lg border border-slate-700">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-4 text-left"
            >
                <h3 className="font-semibold text-sky-400">{t('image_generator_guide_title')}</h3>
                <svg className={`w-5 h-5 text-slate-400 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            {isOpen && (
                <div className="p-4 border-t border-slate-700 space-y-3 text-sm text-slate-300">
                    <p>{t('image_generator_guide_intro')}</p>
                    <ul className="list-disc list-inside space-y-2 pl-2">
                        <li><strong>{t('image_generator_guide_tip1_title')}:</strong> {t('image_generator_guide_tip1_body')}</li>
                        <li><strong>{t('image_generator_guide_tip2_title')}:</strong> {t('image_generator_guide_tip2_body')}</li>
                        <li><strong>{t('image_generator_guide_tip3_title')}:</strong> {t('image_generator_guide_tip3_body')}</li>
                        <li><strong>{t('image_generator_guide_tip4_title')}:</strong> {t('image_generator_guide_tip4_body')}</li>
                        <li><strong>{t('image_generator_guide_tip5_title')}:</strong> {t('image_generator_guide_tip5_body')}</li>
                    </ul>
                </div>
            )}
        </div>
    );
};

export const ImageGenerator: React.FC = () => {
    const { region } = useContext(AppContext)!;
    const { t } = useI18n();
    const [prompt, setPrompt] = useState<string>("");
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16' | '1:1' | '4:3' | '3:4'>('16:9');

    useEffect(() => {
        const defaultPrompt = t('image_generator_default_prompt', { region });
        setPrompt(defaultPrompt);
    }, [region, t]);


    const handleGenerate = async () => {
        if (!prompt) return;
        setIsLoading(true);
        setError(null);
        setImageUrl(null);
        try {
            const result = await generateImage(prompt, aspectRatio);
            setImageUrl(result);
        } catch (e: any) {
            setError(e.message || t('error_failed_image'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-white">{t('image_generator_title')}</h1>
            <p className="text-slate-400 max-w-3xl">
                {t('image_generator_description', { region })}
            </p>

            <PromptGuide />
            
            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                        <label htmlFor="prompt" className="block text-sm font-medium text-slate-300">{t('image_prompt')}</label>
                        <textarea
                            id="prompt"
                            rows={4}
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            className="mt-1 block w-full bg-slate-900 border-slate-600 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm text-slate-200"
                            placeholder={t('image_generator_placeholder')}
                        />
                    </div>
                    <div>
                        <label htmlFor="aspectRatio" className="block text-sm font-medium text-slate-300">{t('aspect_ratio')}</label>
                        <select
                            id="aspectRatio"
                            value={aspectRatio}
                            onChange={(e) => setAspectRatio(e.target.value as any)}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-slate-900 border-slate-600 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm rounded-md text-slate-200"
                        >
                            <option value="16:9">{t('aspect_ratio_landscape')}</option>
                            <option value="9:16">{t('aspect_ratio_portrait')}</option>
                            <option value="1:1">{t('aspect_ratio_square')}</option>
                            <option value="4:3">{t('aspect_ratio_standard')}</option>
                            <option value="3:4">{t('aspect_ratio_tall')}</option>
                        </select>
                    </div>
                </div>
                <button
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-sky-400 disabled:cursor-not-allowed"
                >
                    {isLoading ? t('generating') : t('generate_image')}
                </button>
            </div>

            {isLoading && (
                 <div className="w-full aspect-video bg-slate-800 rounded-lg flex items-center justify-center border border-slate-700">
                    <div className="text-center">
                         <svg className="animate-spin h-8 w-8 text-white mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="mt-4 text-slate-400">{t('generating_image_message')}</p>
                    </div>
                </div>
            )}
            
            {error && <p className="text-red-400">{error}</p>}

            {imageUrl && (
                <div className="mt-8">
                    <h2 className="text-xl font-semibold text-white mb-4">{t('generated_concept')}</h2>
                    <img src={imageUrl} alt={t('generated_concept')} className="w-full rounded-lg shadow-lg" />
                    <p className="mt-2 text-xs text-center text-slate-500 italic">{t('footer_disclaimer')}</p>
                </div>
            )}
        </div>
    );
};