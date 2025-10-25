import React, { useState, useContext } from 'react';
import { generateText, generateImage } from '../services/geminiService';
import { AppContext } from '../contexts/AppContext';
import { useI18n } from '../hooks/useI18n';
import { SpeakerIcon } from './shared/SpeakerIcon';


const CLGSystemDiagram = () => (
    <div className="my-4 p-4 bg-slate-900 rounded-lg flex justify-center items-center border border-slate-700">
        <svg width="100%" height="250" viewBox="0 0 500 250" xmlns="http://www.w3.org/2000/svg" className="max-w-lg" aria-label="Diagram of Closed-Loop Geothermal System">
            <title>GMEL-CLG System Diagram</title>
            <desc>A diagram showing an injection well and a production well connected by horizontal laterals deep underground. A power plant on the surface facilitates the thermosiphon process where cold fluid goes down one well and hot fluid comes up the other.</desc>
            <defs>
                <marker id="arrowhead-red" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#F87171" />
                </marker>
                <marker id="arrowhead-blue" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#60A5FA" />
                </marker>
            </defs>
            <rect x="0" y="50" width="500" height="5" fill="#64748b" />
            <text x="10" y="45" fill="#94a3b8" fontSize="10">Surface</text>
            
            <rect x="180" y="10" width="140" height="40" fill="#475569" rx="5" />
            <text x="200" y="35" fill="white" fontSize="12">Power Plant (ORC)</text>
            
            <rect x="100" y="55" width="10" height="180" fill="#9ca3af" />
            <rect x="390" y="55" width="10" height="180" fill="#9ca3af" />
            <text x="50" y="70" fill="#94a3b8" fontSize="10">Injection Well</text>
            <text x="405" y="70" fill="#94a3b8" fontSize="10">Production Well</text>
            
            <rect x="110" y="225" width="280" height="10" fill="#9ca3af" />
            <text x="210" y="215" fill="#94a3b8" fontSize="10">Horizontal Laterals</text>

            <path d="M 190 50 L 190 70 L 105 70 L 105 220" stroke="#60A5FA" strokeWidth="3" fill="none" markerEnd="url(#arrowhead-blue)" />
            <text x="120" y="140" fill="#60A5FA" fontSize="10" transform="rotate(-90 120,140)">Cold Fluid</text>
            
            <path d="M 395 220 L 395 70 L 310 70 L 310 50" stroke="#F87171" strokeWidth="3" fill="none" markerEnd="url(#arrowhead-red)"/>
            <text x="375" y="140" fill="#F87171" fontSize="10" transform="rotate(90 375,140)">Hot Fluid</text>
            
            <text x="205" y="150" fill="white" fontSize="12">Natural Thermosiphon</text>
        </svg>
    </div>
);

export const Technical: React.FC = () => {
    const [explanations, setExplanations] = useState<Record<string, {isLoading: boolean, text: string | null}>>({});
    const [diagrams, setDiagrams] = useState<Record<string, {isLoading: boolean, url: string | null, error: string | null}>>({});
    const [activeTopic, setActiveTopic] = useState<string | null>(null);
    const { t } = useI18n();

    const techDetails = {
        "Core System (GMEL-CLG)": t('tech_detail_core'),
        "Drilling (GMEL-DrillX)": t('tech_detail_drilling'),
        "Fluid (GMEL-ThermoFluid)": t('tech_detail_fluid'),
        "Power Conversion (GMEL-ORC Compact)": t('tech_detail_power'),
        "Control System (GMEL-EHS)": t('tech_detail_control')
    };

    const getExplanation = async (topic: string, detail: string) => {
        if (activeTopic === topic) {
            setActiveTopic(null);
            return;
        }
        
        setActiveTopic(topic);
        
        if (explanations[topic]?.text) return;

        setExplanations(prev => ({ ...prev, [topic]: {isLoading: true, text: null} }));
        const prompt = t('technical_explanation_prompt', { topic, detail });
        const result = await generateText(prompt, 'gemini-2.5-flash-lite');
        setExplanations(prev => ({ ...prev, [topic]: {isLoading: false, text: result ? result : t('error_no_explanation')} }));
    };

    const getDiagram = async (topic: string) => {
        setDiagrams(prev => ({ ...prev, [topic]: { isLoading: true, url: null, error: null }}));
        const prompt = t('technical_diagram_prompt', { topic });
        const result = await generateImage(prompt, '1:1');
        if (result) {
            setDiagrams(prev => ({ ...prev, [topic]: { isLoading: false, url: result, error: null }}));
        } else {
            setDiagrams(prev => ({ ...prev, [topic]: { isLoading: false, url: null, error: t('error_failed_diagram') }}));
        }
    };


    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-white">{t('technical_title')}</h1>
            <p className="text-slate-400 max-w-3xl">
                {t('technical_description')}
            </p>

            <div className="space-y-4">
                {Object.entries(techDetails).map(([topic, detail]) => (
                    <div key={topic} className="bg-slate-800 p-5 rounded-lg border border-slate-700">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-lg font-semibold text-white flex items-center">
                                    {topic}
                                    <SpeakerIcon text={`${topic}. ${detail}`} />
                                </h3>
                                <p className="text-sm text-slate-400 mt-1 max-w-xl">{detail}</p>
                            </div>
                            <div className="flex items-center space-x-3 ms-4 flex-shrink-0">
                                <button onClick={() => getDiagram(topic)} disabled={diagrams[topic]?.isLoading} title={t('generate_diagram')} className="p-2 rounded-full bg-slate-700 hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                </button>
                                <button 
                                    onClick={() => getExplanation(topic, detail)}
                                    className="text-sky-400 hover:text-sky-300 transition-colors text-sm font-medium"
                                >
                                    {activeTopic === topic ? t('hide_details') : t('explain_more')}
                                </button>
                            </div>
                        </div>

                        {topic === "Core System (GMEL-CLG)" && <CLGSystemDiagram />}
                        
                        {(diagrams[topic] || (activeTopic === topic && explanations[topic])) && (
                            <div className="mt-4 pt-4 border-t border-slate-700 space-y-4">
                                {diagrams[topic] && (
                                    <div>
                                        {diagrams[topic].isLoading && (
                                            <div className="w-full aspect-square bg-slate-900 rounded-lg flex items-center justify-center"><p className="text-slate-500">{t('generating_diagram')}...</p></div>
                                        )}
                                        {diagrams[topic].error && <p className="text-red-400 text-sm">{diagrams[topic].error}</p>}
                                        {diagrams[topic].url && <img src={diagrams[topic].url} alt={`Diagram for ${topic}`} className="w-full max-w-md mx-auto rounded-lg" />}
                                    </div>
                                )}
                                 {activeTopic === topic && explanations[topic] && (
                                    <div>
                                        {explanations[topic].isLoading ? (
                                            <p className="text-slate-500">{t('generating_explanation')}...</p>
                                        ) : (
                                            <div className="text-slate-300 text-sm whitespace-pre-wrap">
                                                <div className="flex items-center">
                                                    <h4 className="text-base font-semibold text-slate-200 mb-2">{t('detailed_explanation')}</h4>
                                                    <SpeakerIcon text={explanations[topic].text || ''} />
                                                </div>
                                                <p>{explanations[topic].text}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};