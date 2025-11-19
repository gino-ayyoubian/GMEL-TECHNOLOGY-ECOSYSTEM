import React, { useState, useRef, useEffect, useContext, useMemo } from 'react';
import { ChatMessage, Region, View } from '../types';
import { continueChat } from '../services/geminiService';
import { getFinancialData, PATENT_PORTFOLIO, CORE_PATENT, PROJECT_MILESTONES } from '../constants';
import { AppContext } from '../contexts/AppContext';
import { useI18n } from '../hooks/useI18n';

const regionSpecificContexts: Partial<Record<Region, string>> = {
    'Qeshm Free Zone': `
- Strategic location in the Persian Gulf, critical need for fresh water (desalination is a primary value proposition).
- Logistical and energy hub with synergies with existing industries.
- Pilot Project: 5MW capacity, 575 billion Toman CAPEX, ~2 year payback.
- Integrated Applications: Thermal desalination, thermal agriculture, lithium extraction from brine, e-fuels.
- Export Potential: Ideal port infrastructure for exporting portable GMEL-ORC units to Gulf countries.
`,
    'Makoo Free Zone': `
- Strategic location as a gateway to Turkey and Europe, potential for cross-border energy sales.
- Cold climate makes geothermal heating for agriculture (greenhouses) and industry highly valuable.
- Pilot Project: 5MW capacity, 575 billion Toman CAPEX, ~2 year payback, focused on electricity export and direct heat.
- Integrated Applications: Thermal agriculture, process heat for industrial parks.
- Export Potential: Technology showcase for export to Turkey, Caucasus, and Central Asia.
`,
    'Iranian Kurdistan': `
- Focus area is Mahabad and surroundings. Mountainous region with significant agricultural potential and mining activities.
- Strong cross-border trade opportunities with Iraqi Kurdistan.
- Key Value: Energy for local industries (agri-processing, mining), improving grid stability in challenging terrain. Direct heat for agriculture (greenhouses) and district heating is highly valuable.
- Pilot Project: ~600 billion Toman CAPEX, focused on electricity for local industry and direct heat applications.
`,
    'Kurdistan Region, Iraq': `
- Strategic imperative for energy independence and grid stability for reconstruction and industrial growth.
- Pilot Project: 5MW capacity, adaptable financial model (633B Toman CAPEX, 1.5yr payback), focused on stable baseload power for industry (cement, steel) and direct heat.
- Integrated Applications: Thermal agriculture for food security, process heat for industrial zones, potential for green hydrogen projects.
- Partnership Model: Positioned as an ideal joint venture for technology transfer and local capacity building.
`,
    'Oman': `
- Aligns with Oman's Vision 2040 for economic diversification. Key enabler for renewable energy goals, powering green hydrogen hubs (Duqm) and large-scale desalination. High value for produced water and stable power.
`,
    'Saudi Arabia': `
- Aligns with Saudi Vision 2030 and NEOM's sustainability goals. Foundational power source for smart cities, providing 24/7 clean energy. Supports large-scale desalination, district cooling, DLE from Red Sea brine, and advanced manufacturing.
`,
    'Mahabad': `
- Part of the broader Iranian Kurdistan region, with a strong agricultural base.
- Key Value: Geothermal heat for AgriCells to boost crop yields and enable year-round farming in a mountainous climate. Energy for local mining and food processing industries.
- Pilot Project: Uses financial model of Iranian Kurdistan (~600 billion Toman CAPEX), focus on direct heat and local grid stability.
`,
    'Chabahar Free Zone': `
- Iran's only oceanic port, strategic gateway to Central Asia and Afghanistan. Aligns with major national development plans.
- Critical need for both power and fresh water to support port expansion and new industries.
- Pilot Project: Similar financials to Qeshm (~580B Toman CAPEX), focus on energy for port operations, desalination for municipal and industrial use, and potential for green hydrogen/ammonia production for export.
`,
    'United Arab Emirates': `
- Aligns with UAE's Net Zero 2050 strategic initiative. Can provide stable, 24/7 baseload power to complement solar energy, especially for high-demand industries and district cooling. Desalination and DLE are high-value applications.
`,
    'Qatar': `
- Supports Qatar's National Vision 2030 for economic diversification. Baseload clean power for industrial consumers (e.g., Ras Laffan) and critical infrastructure. Potential for geothermal-powered LNG plant efficiency improvements or large-scale desalination.
`
};

const viewContexts: Partial<Record<View, string>> = {
    'ip': "The user is currently viewing the Intellectual Property Roadmap. Prioritize information about patents, innovation, status, and the strategic path for each technology.",
    'financials': "The user is currently on the Financial Analysis page. Focus on CAPEX, revenue, ROI, NPV, and other economic metrics. Relate answers to the 5MW pilot project.",
    'technical': "The user is on the Technical Deep Dive page. Focus on technical specifications, innovations, and engineering principles behind GMEL technologies.",
    'dashboard': "The user is on the main project dashboard. Provide a high-level overview and connect different aspects of the project (financial, technical, strategic)."
};

interface GeminiChatProps {
    activeView: View;
    onClose?: () => void;
}

export const GeminiChat: React.FC<GeminiChatProps> = ({ activeView, onClose }) => {
    const { region, lang, setError } = useContext(AppContext)!;
    const { t } = useI18n();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const initialMessage = useMemo(() => ({
        role: 'model' as const,
        text: t('chat_greeting', { region })
    }), [t, region]);

    useEffect(() => {
        setMessages([initialMessage]);
    }, [initialMessage]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const getSystemContext = () => {
        const financialData = getFinancialData(region);
        const patentData = [CORE_PATENT, ...PATENT_PORTFOLIO];

        return `
System context:
You are the GMEL Project Assistant. Your knowledge base includes the following information. Answer user questions based on this context. Be helpful and concise.
- IMPORTANT: You MUST respond in the language with this code: ${lang}.
- Current Proposal Focus: ${region}
- ${regionSpecificContexts[region] || ''}
- Current User View: ${activeView} (${viewContexts[activeView] || ''})
- Key Financials: ${financialData.map(d => `${d.component}: ${d.value} ${d.unit}`).join(', ')}
- Core Patents: ${patentData.map(p => p.code).join(', ')}
- Key Milestones: ${PROJECT_MILESTONES.map(m => m.title).join(', ')}
        `;
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: ChatMessage = { role: 'user', text: input };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInput('');
        setIsLoading(true);
        setError(null);

        try {
            const historyToSend = [...newMessages];
            // If this is the first user question, prepend the context.
            if (historyToSend.filter(m => m.role === 'user').length === 1) {
                historyToSend[historyToSend.length - 1].text = `${getSystemContext()}\n\nMy question is: ${input}`;
            }

            const response = await continueChat(historyToSend);
            setMessages(prev => [...prev, { role: 'model', text: response }]);
        } catch (error: any) {
            setError(error.message || t('error_process_request'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-800 sm:rounded-lg overflow-hidden">
            <div className="p-4 flex justify-between items-center text-lg font-semibold text-white border-b border-slate-700 flex-shrink-0">
                <h2>{t('chat_title')}</h2>
                {onClose && (
                    <button onClick={onClose} className="text-slate-400 hover:text-white" aria-label="Close chat">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                )}
            </div>
            <div className="flex-grow p-4 space-y-4 overflow-y-auto">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'model' && (
                             <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
                                {/* A simple bot icon */}
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-sky-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zM5 10a1 1 0 11-2 0 1 1 0 012 0zm5 0a1 1 0 11-2 0 1 1 0 012 0zm5 0a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" /></svg>
                            </div>
                        )}
                        <div className={`max-w-xl lg:max-w-2xl px-4 py-2 rounded-lg ${msg.role === 'user' ? 'bg-sky-600 text-white' : 'bg-slate-700 text-slate-200'}`}>
                            <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex items-start gap-3 justify-start">
                         <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-sky-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zM5 10a1 1 0 11-2 0 1 1 0 012 0zm5 0a1 1 0 11-2 0 1 1 0 012 0zm5 0a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" /></svg>
                        </div>
                        <div className="px-4 py-2 rounded-lg bg-slate-700 text-slate-200">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t border-slate-700 bg-slate-800 flex-shrink-0">
                <form onSubmit={handleSend} className="flex items-center gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={t('chat_placeholder', { region })}
                        className="flex-grow bg-slate-700 border-slate-600 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 text-sm text-white"
                        disabled={isLoading}
                        autoFocus
                    />
                    <button type="submit" disabled={isLoading || !input.trim()} className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg transition-colors disabled:bg-sky-800 disabled:cursor-not-allowed">
                        {t('send')}
                    </button>
                </form>
            </div>
        </div>
    );
};