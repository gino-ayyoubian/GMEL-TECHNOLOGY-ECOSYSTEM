import React, { useState, useContext, useEffect } from 'react';
import { generateText, generateImage, generateTextWithThinking } from '../services/geminiService';
import { AppContext } from '../contexts/AppContext';
import { useI18n } from '../hooks/useI18n';
import { SpeakerIcon } from './shared/SpeakerIcon';
import { getTechDetails } from '../utils/techDetails';


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
    const { technicalTopic, setTechnicalTopic } = useContext(AppContext)!;
    const [explanations, setExplanations] = useState<Record<string, {isLoading: boolean, text: string | null, error: string | null}>>({});
    const [demystified, setDemystified] = useState<Record<string, {isLoading: boolean, text: string | null, error: string | null}>>({});
    const [diagrams, setDiagrams] = useState<Record<string, {isLoading: boolean, url: string | null, error: string | null}>>({});
    const [activeTopic, setActiveTopic] = useState<string | null>(null);
    const { t } = useI18n();

    const techDetails = getTechDetails(t);

    useEffect(() => {
        if (technicalTopic) {
            const topicKey = Object.keys(techDetails).find(key => key.includes(`(${technicalTopic})`));
            if (topicKey) {
                setActiveTopic(topicKey);
                setTimeout(() => {
                     document.getElementById(`topic-${topicKey}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 100)
            }
            setTechnicalTopic(null); // Reset after use
        }
    }, [technicalTopic, setTechnicalTopic, techDetails]);
    
    const handleToggleTopic = (topic: string) => {
        setActiveTopic(activeTopic === topic ? null : topic);
    };

    const getExplanation = async (topic: string, detail: string) => {
        if (explanations[topic]?.text) return;

        setExplanations(prev => ({ ...prev, [topic]: {isLoading: true, text: null, error: null} }));
        const prompt = t('technical_explanation_prompt', { topic, detail });
        try {
            const result = await generateTextWithThinking(prompt);
            setExplanations(prev => ({ ...prev, [topic]: {isLoading: false, text: result, error: null} }));
        } catch (e: any) {
            setExplanations(prev => ({ ...prev, [topic]: {isLoading: false, text: null, error: e.message || t('error_no_explanation')}}));
        }
    };

    const getDemystification = async (topic: string, detail: string) => {
        if (demystified[topic]?.text) return;
        setDemystified(prev => ({ ...prev, [topic]: {isLoading: true, text: null, error: null} }));
        const prompt = `Explain the core idea of '${topic}' in one simple paragraph, using an analogy a 10-year-old would understand. Technical details for context: ${detail}`;
        try {
            const result = await generateText(prompt, 'gemini-flash-lite-latest');
            setDemystified(prev => ({ ...prev, [topic]: {isLoading: false, text: result, error: null} }));
        } catch (e: any) {
             setDemystified(prev => ({ ...prev, [topic]: {isLoading: false, text: null, error: e.message || t('error_no_explanation')}}));
        }
    };

    const getDiagram = async (topic: string) => {
        setDiagrams(prev => ({ ...prev, [topic]: { isLoading: true, url: null, error: null }}));
        const prompt = t('technical_diagram_prompt', { topic });
        try {
            const result = await generateImage(prompt, '1:1');
            setDiagrams(prev => ({ ...prev, [topic]: { isLoading: false, url: result, error: null }}));
        } catch (e: any) {
             setDiagrams(prev => ({ ...prev, [topic]: { isLoading: false, url: null, error: e.message || t('error_failed_diagram') }}));
        }
    };

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-white">{t('technical_title')}</h1>
            <p className="text-slate-400 max-w-3xl">
                {t('technical_description')}
            </p>

            <CLGSystemDiagram />

            <div className="space-y-4">
                {Object.entries(techDetails).map(([topic, detail]) => (
                    <div key={topic} id={`topic-${topic}`} className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
                        <button
                            onClick={() => handleToggleTopic(topic)}
                            className="w-full p-4 text-left flex justify-between items-center hover:bg-slate-700/50 transition-colors"
                        >
                            <h2 className="text-lg font-semibold text-white">{topic}</h2>
                            <svg className={`w-6 h-6 text-slate-400 transform transition-transform ${activeTopic === topic ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </button>
                        {activeTopic === topic && (
                            <div className="p-4 border-t border-slate-700 space-y-6">
                                <p className="text-slate-300 flex items-start">
                                    <span className="flex-grow">{detail}</span>
                                    <SpeakerIcon text={detail} />
                                </p>
                                <div className="flex flex-wrap gap-4">
                                    <button onClick={() => getExplanation(topic, detail)} disabled={explanations[topic]?.isLoading} className="text-sm font-semibold text-sky-400 hover:text-sky-300 disabled:opacity-50">{explanations[topic]?.isLoading ? t('generating_explanation') + "..." : t('explain_more')}</button>
                                    <button onClick={() => getDemystification(topic, detail)} disabled={demystified[topic]?.isLoading} className="text-sm font-semibold text-amber-400 hover:text-amber-300 disabled:opacity-50">{demystified[topic]?.isLoading ? t('generating_explanation') + "..." : t('demystify_spec')}</button>
                                    <button onClick={() => getDiagram(topic)} disabled={diagrams[topic]?.isLoading} className="text-sm font-semibold text-teal-400 hover:text-teal-300 disabled:opacity-50">{diagrams[topic]?.isLoading ? t('generating_diagram') + "..." : t('generate_diagram')}</button>
                                </div>

                                {demystified[topic] && (
                                     <div className="p-4 bg-slate-900/70 rounded-lg">
                                        {demystified[topic].isLoading && <p className="text-slate-400 italic">Generating simple explanation...</p>}
                                        {demystified[topic].error && <p className="text-red-400">{demystified[topic].error}</p>}
                                        {demystified[topic].text && (
                                            <p className="text-slate-300 flex items-start"><span className="flex-grow">{demystified[topic].text}</span> <SpeakerIcon text={demystified[topic].text || ''} /></p>
                                        )}
                                    </div>
                                )}
                                
                                {explanations[topic] && (
                                    <div className="p-4 bg-slate-900/70 rounded-lg">
                                        <h3 className="font-semibold text-white mb-2">{t('detailed_explanation')}</h3>
                                        {explanations[topic].isLoading && <p className="text-slate-400 italic">Generating detailed explanation...</p>}
                                        {explanations[topic].error && <p className="text-red-400">{explanations[topic].error}</p>}
                                        {explanations[topic].text && (
                                             <p className="text-slate-300 whitespace-pre-wrap flex items-start"><span className="flex-grow">{explanations[topic].text}</span> <SpeakerIcon text={explanations[topic].text || ''} /></p>
                                        )}
                                    </div>
                                )}
                                
                                {diagrams[topic] && (
                                     <div className="p-4 bg-slate-900/70 rounded-lg">
                                        {diagrams[topic].isLoading && <p className="text-slate-400 italic">Generating diagram...</p>}
                                        {diagrams[topic].error && <p className="text-red-400">{diagrams[topic].error}</p>}
                                        {diagrams[topic].url && <img src={diagrams[topic].url || ''} alt={`Diagram of ${topic}`} className="w-full max-w-sm mx-auto rounded-lg" />}
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