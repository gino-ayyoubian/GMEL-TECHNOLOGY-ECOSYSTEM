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

const DesalSystemDiagram = () => (
    <div className="my-4 p-4 bg-white rounded-lg flex justify-center items-center border border-slate-300 text-slate-800">
        <svg width="100%" height="300" viewBox="0 0 600 300" xmlns="http://www.w3.org/2000/svg" className="max-w-2xl" aria-label="Diagram of GMEL Thermal Desalination and Direct Air Capture System">
            <title>GMEL-Desal System Diagram</title>
            <desc>A diagram showing hot geothermal fluid entering a system. It provides heat to a multi-effect desalination unit which converts seawater into fresh water and brine. It also provides heat to a Direct Air Capture unit which processes air to capture CO2. Cooled geothermal fluid then exits the system.</desc>
            <defs>
                <marker id="arrow-gray" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b" />
                </marker>
                <style>
                    {`.label { font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 600; fill: #1e293b; }`}
                    {`.sublabel { font-family: 'Inter', sans-serif; font-size: 10px; fill: #475569; }`}
                </style>
            </defs>

            {/* Main Components */}
            <rect x="150" y="80" width="300" height="140" rx="10" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1" strokeDasharray="4 4" />
            
            <rect x="170" y="100" width="120" height="100" rx="5" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="1.5" />
            <text x="230" y="115" textAnchor="middle" className="label">Thermal Desalination</text>
            <text x="230" y="130" textAnchor="middle" className="sublabel">(Multi-Effect)</text>

            <rect x="310" y="100" width="120" height="100" rx="5" fill="#f0fdf4" stroke="#4ade80" strokeWidth="1.5" />
            <text x="370" y="115" textAnchor="middle" className="label">Direct Air Capture</text>
            <text x="370" y="130" textAnchor="middle" className="sublabel">(DAC)</text>

            {/* Fluid Flows */}
            {/* Hot Geothermal Fluid In */}
            <path d="M 20 180 L 170 180" stroke="#f87171" strokeWidth="4" fill="none" markerEnd="url(#arrow-gray)" />
            <text x="80" y="175" textAnchor="middle" className="label">Hot Geothermal Fluid</text>

            {/* Heat transfer pipe */}
            <path d="M 170 180 L 430 180" stroke="#fb923c" strokeWidth="4" fill="none" />
            <path d="M 230 180 L 230 200" stroke="#fb923c" strokeWidth="4" fill="none" />
            <path d="M 370 180 L 370 200" stroke="#fb923c" strokeWidth="4" fill="none" />
            
            {/* Heat Exchange Arrows */}
            <path d="M 230 175 L 230 145" stroke="#f97316" strokeWidth="2" fill="none" markerEnd="url(#arrow-gray)" strokeDasharray="3 3"/>
            <path d="M 370 175 L 370 145" stroke="#f97316" strokeWidth="2" fill="none" markerEnd="url(#arrow-gray)" strokeDasharray="3 3"/>
            <text x="210" y="160" className="sublabel" fill="#f97316">HEAT</text>
            <text x="350" y="160" className="sublabel" fill="#f97316">HEAT</text>

            {/* Cooled Geothermal Fluid Out */}
            <path d="M 430 180 L 580 180" stroke="#60a5fa" strokeWidth="4" fill="none" markerEnd="url(#arrow-gray)" />
            <text x="520" y="175" textAnchor="middle" className="label">Cooled Fluid</text>

            {/* Desalination I/O */}
            <path d="M 230 100 L 230 50" stroke="#0ea5e9" strokeWidth="2" fill="none" markerEnd="url(#arrow-gray)" />
            <text x="230" y="40" textAnchor="middle" className="sublabel">Seawater In</text>
            <path d="M 200 200 L 200 250" stroke="#059669" strokeWidth="2" fill="none" markerEnd="url(#arrow-gray)" />
            <text x="200" y="260" textAnchor="middle" className="sublabel">Fresh Water Out</text>
            <path d="M 260 200 L 260 250" stroke="#94a3b8" strokeWidth="2" fill="none" markerEnd="url(#arrow-gray)" />
            <text x="260" y="260" textAnchor="middle" className="sublabel">Brine Out</text>
            
            {/* DAC I/O */}
            <path d="M 370 100 L 370 50" stroke="#a7f3d0" strokeWidth="2" fill="none" markerEnd="url(#arrow-gray)" />
            <text x="370" y="40" textAnchor="middle" className="sublabel">Air In</text>
            <path d="M 340 200 L 340 250" stroke="#1e293b" strokeWidth="2" fill="none" markerEnd="url(#arrow-gray)" />
            <text x="340" y="260" textAnchor="middle" className="sublabel">CO₂ Out</text>
            <path d="M 400 200 L 400 250" stroke="#dcfce7" strokeWidth="2" fill="none" markerEnd="url(#arrow-gray)" />
            <text x="400" y="260" textAnchor="middle" className="sublabel">Clean Air Out</text>
        </svg>
    </div>
);

const NanoStabSystemDiagram = () => (
    <div className="my-4 p-4 bg-slate-900 rounded-lg flex justify-center items-center border border-slate-700">
        <svg width="100%" height="250" viewBox="0 0 500 250" xmlns="http://www.w3.org/2000/svg" className="max-w-md" aria-label="Diagram of Nanofluid Stabilization System">
            <title>GMEL-NanoStab System Diagram</title>
            <desc>A diagram showing a pipe with nanofluid flowing through it. A magnetic coil is wrapped around the pipe, and an ultrasonic transducer is attached to it. Both are connected to an AI control unit.</desc>
            <defs>
                <marker id="arrow-nanofluid" markerWidth="10" markerHeight="7" refX="8" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#38bdf8" />
                </marker>
            </defs>

            {/* AI Control Unit */}
            <rect x="180" y="10" width="140" height="40" rx="5" fill="#475569" />
            <text x="250" y="35" textAnchor="middle" fill="white" fontSize="12">AI Control (EHS)</text>
            <path d="M 250 50 L 250 70" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 4" />
            <path d="M 180 85 L 210 70" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 4" />
            <path d="M 320 85 L 290 70" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 4" />

            {/* Main Pipe */}
            <rect x="50" y="100" width="400" height="50" rx="5" fill="#64748b" stroke="#9ca3af" strokeWidth="1" />
            <text x="70" y="120" fill="white" fontSize="12">Nanofluid Flow</text>
            <path d="M 70 135 L 150 135" stroke="#38bdf8" strokeWidth="3" fill="none" markerEnd="url(#arrow-nanofluid)" />

            {/* Magnetic Coil */}
            <path d="M 150 95 C 150 80, 170 80, 170 95 S 190 110, 190 95 S 210 80, 210 95" stroke="#f59e0b" strokeWidth="3" fill="none" />
            <path d="M 150 155 C 150 170, 170 170, 170 155 S 190 140, 190 155 S 210 170, 210 155" stroke="#f59e0b" strokeWidth="3" fill="none" />
            <rect x="150" y="95" width="60" height="60" fill="none" stroke="#f59e0b" strokeWidth="3" opacity="0.3" />
            <text x="180" y="200" textAnchor="middle" fill="#f59e0b" fontSize="10">Magnetic Field (0.5A)</text>
            
            {/* Ultrasonic Transducer */}
            <rect x="300" y="85" width="80" height="15" rx="3" fill="#10b981" />
            <text x="340" y="200" textAnchor="middle" fill="#10b981" fontSize="10">Ultrasonic Waves (40-55 kHz)</text>
            
            {/* Ultrasonic waves representation */}
            <path d="M 310 100 Q 320 105, 330 100 T 350 100 T 370 100" stroke="#10b981" strokeWidth="1.5" fill="none" opacity="0.7">
                 <animate attributeName="d" values="M 310 100 Q 320 105, 330 100 T 350 100 T 370 100; M 310 100 Q 320 95, 330 100 T 350 100 T 370 100; M 310 100 Q 320 105, 330 100 T 350 100 T 370 100" dur="1s" repeatCount="indefinite" />
            </path>
             <path d="M 310 110 Q 320 115, 330 110 T 350 110 T 370 110" stroke="#10b981" strokeWidth="1.5" fill="none" opacity="0.5">
                 <animate attributeName="d" values="M 310 110 Q 320 115, 330 110 T 350 110 T 370 110; M 310 110 Q 320 105, 330 110 T 350 110 T 370 110; M 310 110 Q 320 115, 330 110 T 350 110 T 370 110" dur="1s" repeatCount="indefinite" />
            </path>
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
        if (diagrams[topic]?.url) return;
        
        if (topic.includes('GMEL-Desal')) {
            setDiagrams(prev => ({ ...prev, [topic]: { isLoading: false, url: 'component:DesalSystemDiagram', error: null }}));
            return;
        }
        if (topic.includes('GMEL-NanoStab')) {
            setDiagrams(prev => ({ ...prev, [topic]: { isLoading: false, url: 'component:NanoStabSystemDiagram', error: null }}));
            return;
        }
         if (topic.includes('GMEL-CLG')) {
            return; 
        }

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
                                    <button onClick={() => getDiagram(topic)} disabled={diagrams[topic]?.isLoading || topic.includes('GMEL-CLG')} className="text-sm font-semibold text-teal-400 hover:text-teal-300 disabled:opacity-50 disabled:cursor-not-allowed">{diagrams[topic]?.isLoading ? t('generating_diagram') + "..." : t('generate_diagram')}</button>
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
                                        {diagrams[topic].url === 'component:DesalSystemDiagram' ? (
                                            <DesalSystemDiagram />
                                        ) : diagrams[topic].url === 'component:NanoStabSystemDiagram' ? (
                                            <NanoStabSystemDiagram />
                                        ) : diagrams[topic].url ? (
                                            <img src={diagrams[topic].url} alt={`Diagram of ${topic}`} className="w-full max-w-sm mx-auto rounded-lg" />
                                        ) : null}
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