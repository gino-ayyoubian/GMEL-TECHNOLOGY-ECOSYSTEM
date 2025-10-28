import React, { useState } from 'react';
import { useI18n } from '../hooks/useI18n';
import { generateText } from '../services/geminiService';
import { SpeakerIcon } from './shared/SpeakerIcon';

export const Simulations: React.FC = () => {
    const { t } = useI18n();
    const [gradient, setGradient] = useState<number>(30);
    const [depth, setDepth] = useState<number>(4);
    const [results, setResults] = useState<{ potential: string; co2Offset: string; households: string; } | null>(null);
    const [explanation, setExplanation] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleCalculate = async () => {
        setIsLoading(true);
        setError(null);
        setExplanation('');

        // Simplified formula for demonstration
        // Temp at depth = surface_temp (assume 15C) + (gradient * depth_km)
        const tempAtDepth = 15 + (gradient * depth);
        // A very rough estimate of power output in MW, assuming a 150C baseline for a 5MW plant
        const powerOutput = (tempAtDepth / 150) * 5;
        // CO2 offset based on 700k tons/100MW (7k tons/MW) + 15% GMEL efficiency bonus
        const co2Offset = powerOutput * 7000 * 1.15;
        // Households powered based on 1MW powering ~1000 homes
        const households = powerOutput * 1000;

        setResults({
            potential: `${powerOutput.toFixed(1)} MW`,
            co2Offset: `${co2Offset.toLocaleString(undefined, { maximumFractionDigits: 0 })} Tons/Year`,
            households: `${households.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
        });

        // Generate explanation
        try {
            const prompt = t('simulation_narrative_prompt_detailed', { gradient, depth, power: powerOutput.toFixed(1) });
            const result = await generateText(prompt);
            setExplanation(result);
        } catch (e: any) {
            setError(e.message || 'Failed to generate explanation.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-white">{t('simulations_title')}</h1>
            <p className="text-slate-400 max-w-3xl">
                {t('simulations_description')}
            </p>

            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                <h2 className="text-2xl font-semibold text-white mb-4">{t('simulation_gradient_title')}</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label htmlFor="gradient-slider" className="block text-sm font-medium text-slate-300 mb-2">
                            {/* FIX: Using the new unique translation key for the simulation geothermal gradient label. */}
                            {t('simulation_geothermal_gradient_label')}: <span className="font-bold text-white text-lg">{gradient} °C/km</span>
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
                     <div>
                        <label htmlFor="depth-slider" className="block text-sm font-medium text-slate-300 mb-2">
                            {t('drilling_depth_km')}: <span className="font-bold text-white text-lg">{depth} km</span>
                        </label>
                        <input
                            id="depth-slider"
                            type="range"
                            min="2"
                            max="10"
                            step="0.5"
                            value={depth}
                            onChange={(e) => setDepth(Number(e.target.value))}
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>
                </div>
                <button
                    onClick={handleCalculate}
                    disabled={isLoading}
                    className="w-full md:w-auto flex-shrink-0 px-8 py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg transition-colors disabled:bg-sky-800 disabled:cursor-not-allowed"
                >
                    {isLoading ? t('calculating') : t('calculate_potential')}
                </button>

                {results && (
                     <div className="mt-6 p-4 bg-slate-900 rounded-lg border border-sky-500/30">
                        <h3 className="text-xl font-semibold text-sky-400 mb-4">{t('simulation_results_title')}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                            <div>
                                <p className="text-sm text-slate-400">{t('potential_output_mw')}</p>
                                <p className="text-3xl font-bold text-white">{results.potential}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-400">{t('co2_offset_per_year')}</p>
                                <p className="text-3xl font-bold text-white">{results.co2Offset}</p>
                            </div>
                             <div>
                                <p className="text-sm text-slate-400">{t('households_powered')}</p>
                                <p className="text-3xl font-bold text-white">{results.households}</p>
                            </div>
                        </div>

                        {isLoading && <p className="text-sm text-slate-400 mt-6 text-center">{t('generating_explanation')}...</p>}
                        
                        {error && <p className="mt-4 text-sm text-red-400 text-center">{error}</p>}

                        {explanation && (
                             <div className="mt-6 pt-4 border-t border-slate-700/50">
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