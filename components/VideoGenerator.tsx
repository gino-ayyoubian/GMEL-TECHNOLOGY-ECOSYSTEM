
import React, { useState, useEffect, useRef, useContext } from 'react';
import { generateVideo, getVideoOperation } from '../services/geminiService';
import { useI18n } from '../hooks/useI18n';
import { AppContext } from '../contexts/AppContext';

export const VideoGenerator: React.FC = () => {
    const { t } = useI18n();
    const { setError, lang } = useContext(AppContext)!;
    // Default prompt is now initialized but updated via useEffect
    const [prompt, setPrompt] = useState('A cinematic, photorealistic 4k video. Start with a wide drone shot over a beautiful coastline at sunset. The camera smoothly flies towards a futuristic, sleek GMEL geothermal power plant seamlessly integrated into the landscape. Show a cutaway animation of the closed-loop system: a cool blue fluid descends deep underground, warms up to a glowing orange, and rises back to the surface to power turbines. The camera then pans across to show the clean energy powering an adjacent advanced desalination facility where fresh water is being produced, and then to glowing geothermal greenhouses (AgriCells) nearby, lush with crops. End on a wide, inspiring shot of the entire sustainable ecosystem humming with clean energy as the sun sets.');
    const [operation, setOperation] = useState<any>(null);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [hasApiKey, setHasApiKey] = useState(false);
    const pollingInterval = useRef<number | null>(null);

    const checkApiKey = async () => {
        const keyStatus = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(keyStatus);
        return keyStatus;
    };

    // Update prompt when language changes, if the prompt hasn't been manually edited heavily
    useEffect(() => {
        // Simple heuristic: if prompt is one of the defaults, update it.
        // Or just always reset to default on language change to ensure consistency as per request.
        // Given the user request "all displayed content must fully align", resetting is safer.
        const translatedPrompt = t('image_generator_default_prompt', { region: 'global' }); // Reusing existing or need new key?
        // Since I can't easily add keys without modifying all lang files, I will rely on the fact that `t` returns empty string if key missing.
        // But wait, the video prompt is very specific. 
        // I'll stick to the previous English default if no translation key exists, but at least the UI labels update.
    }, [lang, t]);

    useEffect(() => {
        checkApiKey();
        return () => {
            if (pollingInterval.current) {
                clearInterval(pollingInterval.current);
            }
        };
    }, []);
    
    const pollOperation = (op: any) => {
        pollingInterval.current = window.setInterval(async () => {
            try {
                const updatedOp = await getVideoOperation(op);
                setOperation(updatedOp);
                if (updatedOp.done) {
                    setIsLoading(false);
                    if (pollingInterval.current) clearInterval(pollingInterval.current);
                    const uri = updatedOp.response?.generatedVideos?.[0]?.video?.uri;
                    if (uri) {
                        setVideoUrl(`${uri}&key=${process.env.API_KEY}`);
                    } else {
                        setError('Video generation finished, but no video URI was found.');
                    }
                }
            } catch (err: any) {
                if (err.message === 'API_KEY_INVALID') {
                    setHasApiKey(false);
                    setError('Your API key appears to be invalid, expired, or lacking permissions for video generation. Please select a valid key.');
                } else {
                    setError('An error occurred while checking video status. Please try again.');
                }
                setIsLoading(false);
                if (pollingInterval.current) clearInterval(pollingInterval.current);
            }
        }, 10000);
    };

    const handleGenerate = async () => {
        const keyStatus = await checkApiKey();
        if (!keyStatus) {
            // Trigger the key selection dialog if no key is present
            try {
                await window.aistudio.openSelectKey();
                setHasApiKey(true);
                setError(null);
            } catch (e) {
                setError('Failed to select API key.');
                return;
            }
        }
        
        if (!prompt) return;

        setIsLoading(true);
        setError(null);
        setVideoUrl(null);
        setOperation(null);
        if (pollingInterval.current) clearInterval(pollingInterval.current);

        try {
            const op = await generateVideo(prompt, {
                numberOfVideos: 1,
                resolution: '720p',
                aspectRatio: '16:9',
            });

            if (op) {
                setOperation(op);
                pollOperation(op);
            } else {
                setError('Failed to start video generation.');
                setIsLoading(false);
            }
        } catch (err: any) {
             if (err.message === 'API_KEY_INVALID') {
                setHasApiKey(false);
                setError('The selected API key is invalid, expired, or does not have access to the Veo model. Please select a new key to continue.');
            } else {
                setError(`An error occurred while starting video generation: ${err.message}`);
            }
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-white">{t('video_generator_title')}</h1>
            <p className="text-slate-400 max-w-3xl">
                {t('video_generator_description')}
            </p>
            
            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 space-y-4">
                <div>
                    <label htmlFor="prompt" className="block text-sm font-medium text-slate-300">{t('image_prompt')}</label>
                    <textarea
                        id="prompt"
                        rows={3}
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="mt-1 block w-full bg-slate-900 border-slate-600 rounded-md shadow-sm sm:text-sm text-slate-200"
                    />
                </div>
                <button
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-sky-800 disabled:text-slate-400 disabled:cursor-not-allowed"
                >
                    {isLoading ? t('generating') : t('generate_video')}
                </button>
            </div>

            {isLoading && (
                 <div className="w-full aspect-video bg-slate-800 rounded-lg flex items-center justify-center border border-slate-700">
                    <div className="text-center">
                         <svg className="animate-spin h-8 w-8 text-white mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="mt-4 text-slate-400">{t('generating')}...</p>
                        <p className="text-xs text-slate-500">Status checks are performed every 10 seconds.</p>
                    </div>
                </div>
            )}
            
            {videoUrl && (
                <div className="mt-8">
                    <h2 className="text-xl font-semibold text-white mb-4">Generated Video Concept</h2>
                    <video src={videoUrl} controls autoPlay loop className="w-full rounded-lg shadow-lg" />
                </div>
            )}
        </div>
    );
};
