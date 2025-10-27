import React, { useState } from 'react';
import { useI18n } from '../hooks/useI18n';
import { generateText } from '../services/geminiService';
import { SpeakerIcon } from './shared/SpeakerIcon';

export const Simulations: React.FC = () => {
    const { t } = useI18n();
    const [gradient, setGradient] = useState<number>(30);
    const [potential, setPotential] = useState<string>('');
    const [explanation, setExplanation] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleCalculate = async () => {
        // Simplified formula for demonstration
        // Temp at depth = surface_temp (assume 15C) + (gradient * depth_km)
        const tempAt4km = 15 + (gradient * 4);
        // A very rough estimate of power output in MW for a standard plant
        const powerOutput = (tempAt4km / 10).toFixed(1);
        setPotential(`${powerOutput} MW`);

        // Generate explanation
        setIsLoading(true);
        const prompt = t('simulation_narrative_prompt', { gradient });
        const result = await generateText(prompt);
        setExplanation(result);
        setIsLoading(false);
    };

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-white">{t('simulations_title')}</h1>
            <p className="text-slate-400 max-w-3xl">
                {t('simulations_description')}
            </p>

            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                <h2 className="text-2xl font-semibold text-white mb-4">{t('simulation_gradient_title')}</h2>
                <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="flex-grow w-full md:w-auto">
                        <label htmlFor="gradient-slider" className="block text-sm font-medium text-slate-300 mb-2">
                            {t('geothermal_gradient')}: <span className="font-bold text-white text-lg">{gradient} °C/km</span>
                        </label>
                        <input
                            id="gradient-slider"
                            type="range"
                            min="10"
                            max="100"
                            step="1"
                            value={gradient}
                            onChange={(e) => setGradient(Number(e.target.value))}
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>
                    <button
                        onClick={handleCalculate}
                        disabled={isLoading}
                        className="w-full md:w-auto flex-shrink-0 px-8 py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg transition-colors disabled:bg-sky-800 disabled:cursor-not-allowed"
                    >
                        {isLoading ? t('calculating') : t('calculate_potential')}
                    </button>
                </div>

                {potential && (
                     <div className="mt-6 p-4 bg-slate-900 rounded-lg border border-sky-500/30">
                        <h3 className="font-semibold text-sky-400 mb-2">{t('potential_output')}</h3>
                        <p className="text-3xl font-bold text-white">{potential}</p>
                        {isLoading && <p className="text-sm text-slate-400 mt-4">{t('generating_explanation')}...</p>}
                        {explanation && (
                             <div className="mt-4 pt-4 border-t border-slate-700/50">
                                <p className="text-sm text-slate-300 whitespace-pre-wrap flex items-start">
                                    <span className="flex-grow">{explanation}</span>
                                    <SpeakerIcon text={explanation} />
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
