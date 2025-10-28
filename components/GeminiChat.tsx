import React, { useState, useRef, useEffect, useContext } from 'react';
// FIX: The 'View' type is exported from '../types', not '../App'. Consolidated the import.
import { ChatMessage, Region, View } from '../types';
import { continueChat } from '../services/geminiService';
import { PATENT_PORTFOLIO, FINANCIAL_DATA, CORE_PATENT, PROJECT_MILESTONES } from '../constants';
import { AppContext } from '../contexts/AppContext';
import { useI18n } from '../hooks/useI18n';

const regionSpecificContexts = {
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
    'Kurdistan Region, Iraq': `
- Strategic imperative for energy independence and grid stability for reconstruction and industrial growth.
- Pilot Project: 5MW capacity, adaptable financial model, focused on stable baseload power for industry (cement, steel) and direct heat.
- Integrated Applications: Thermal agriculture for food security, process heat for industrial zones, potential for green hydrogen projects.
- Partnership Model: Positioned as an ideal joint venture for technology transfer and local capacity building.
`
};

const viewContexts: Partial<Record<View, string>> = {
    'ip': "The user is currently viewing the Intellectual Property Roadmap. Prioritize information about patents, innovation, status, and the strategic path for each technology.",
    'financials': "The user is currently on the Financial Analysis page. Focus on CAPEX, revenue, ROI, NPV, and other economic metrics. Relate answers to the 5MW pilot project data.",
    'technical': "The user is exploring the Technical Deep Dive section. Provide detailed answers about the core technology (GMEL-CLG), drilling, thermal fluid, power conversion, and control systems.",
    'benchmark': "The user is on the Global Benchmarking page. Frame answers in a comparative context, referencing how GMEL technology stands against international standards or specific regions like Iceland or Turkey.",
    'site': "The user is viewing the Site Analysis. Focus on geographical, logistical, and infrastructural aspects of the selected region.",
    'comparison': "The user is comparing the Qeshm and Makoo proposals. Highlight the strategic differences between the two, focusing on their unique advantages and applications.",
    'strategy_modeler': "The user is using the Strategy Modeler. Answers should be forward-looking, focusing on partnership models, technology packaging for export/JV, and market entry strategies."
};


const buildDynamicContext = (query: string, region: Region, activeView: View): string => {
    const lowerQuery = query.toLowerCase();
    const specificContexts: string[] = [];
    const allPatents = [CORE_PATENT, ...PATENT_PORTFOLIO];

    const techKeywords: { [key: string]: string[] } = {
        'GMEL-ThermoFluid': ['fluid', 'nanocomposite', 'thermal fluid', 'heat transfer'],
        'GMEL-ORC Compact': ['orc', 'converter', 'power conversion', 'rankine'],
        'GMEL-DrillX': ['drilling', 'drillx', 'robot'],
        'GMEL-EHS': ['sensor', 'control', 'quantum', 'ehs'],
        'GMEL-Desal': ['desalination', 'water', 'desal'],
        'GMEL-H₂Cell': ['hydrogen', 'h2', 'electrolysis'],
        'GMEL-LithiumLoop': ['lithium', 'dle', 'extraction'],
    };

    // --- Technical Context from Patents ---
    for (const code in techKeywords) {
        if (techKeywords[code].some(k => lowerQuery.includes(k))) {
            const patent = allPatents.find(p => p.code === code);
            if (patent) {
                specificContexts.push(`---RELEVANT TECHNICAL DETAIL---\n${patent.title} (${patent.code}): ${patent.application}. Key Metric: ${patent.kpi}`);
            }
        }
    }

    // --- Patent Context ---
    const mentionedPatents = allPatents.filter(p => 
        lowerQuery.includes(p.code.toLowerCase()) || 
        lowerQuery.includes(p.title.toLowerCase())
    );
    if (mentionedPatents.length > 0) {
        specificContexts.push(`---RELEVANT PATENT DETAILS---\n${mentionedPatents.map(p => `- ${p.title} (${p.code}): ${p.application}. Status: ${p.status}, Path: ${p.path}`).join('\n')}`);
    } else {
        const patentKeywords = ['patent', 'ip', 'intellectual property', 'roadmap'];
        if (patentKeywords.some(k => lowerQuery.includes(k))) {
            specificContexts.push(`---PATENT PORTFOLIO OVERVIEW---\n${allPatents.map(p => `- ${p.title} (${p.code})`).join('\n')}`);
        }
    }
    
    // --- Financial Context ---
    const mentionedFinancials = FINANCIAL_DATA.filter(d => lowerQuery.includes(d.component.toLowerCase()));
    if (mentionedFinancials.length > 0) {
        specificContexts.push(`---RELEVANT FINANCIAL DETAILS---\n${mentionedFinancials.map(d => `- ${d.component}: ${d.value} ${d.unit} (${d.description})`).join('\n')}`);
    } else {
        const financialKeywords = ['financial', 'cost', 'revenue', 'investment', 'roi', 'toman', 'price', 'money', 'economic', 'capex', 'npv'];
        if (financialKeywords.some(k => lowerQuery.includes(k))) {
            specificContexts.push(`---FINANCIAL DATA (5MW Pilot)---\n${FINANCIAL_DATA.map(d => `- ${d.component}: ${d.value} ${d.unit}`).join('\n')}`);
        }
    }
    
    // --- Milestone Context ---
    const mentionedMilestones = PROJECT_MILESTONES.filter(m => 
        lowerQuery.includes(m.title.toLowerCase()) ||
        lowerQuery.includes(m.date.toLowerCase())
    );
    if (mentionedMilestones.length > 0) {
        specificContexts.push(`---RELEVANT MILESTONE DETAILS---\n${mentionedMilestones.map(m => `- ${m.title} (${m.date}): ${m.status}. ${m.description}`).join('\n')}`);
    } else {
        const milestoneKeywords = ['milestone', 'timeline', 'schedule', 'date', 'status', 'completed', 'progress', 'planned'];
        if (milestoneKeywords.some(k => lowerQuery.includes(k))) {
            specificContexts.push(`---PROJECT MILESTONES---\n${PROJECT_MILESTONES.map(m => `- ${m.title} (${m.date}): ${m.status}`).join('\n')}`);
        }
    }

    let context = `You are a helpful assistant for the GMEL Geothermal Vision project. Answer questions based ONLY on the following context. Do not make up information. If the answer is not in the context, say that you don't have that information.\n\n`;
    
    // --- Dynamic View-Based Context ---
    if (viewContexts[activeView]) {
        context += `---CURRENT USER FOCUS---\n${viewContexts[activeView]}\n\n`;
    }

    // --- Core Regional Context ---
    context += `---CORE PROJECT CONTEXT FOR ${region}---\n`;
    context += `Core Technology: GMEL-CLG, a closed-loop geothermal system for low-gradient resources.\n`;
    context += regionSpecificContexts[region] + '\n';

    // --- Dynamic Keyword-Based Context ---
    if (specificContexts.length === 0) {
        // --- General Query Enhancement ---
        context += `---CORE TECHNOLOGY UNIQUE SELLING PROPOSITIONS (GMEL-CLG)---\n`;
        context += `- System Type: Advanced Closed-Loop Geothermal for low-gradient resources, integrated with superhot rock drilling.\n`;
        context += `- Key Innovation: Utilizes a natural thermosiphon effect for fluid circulation, enhanced by predictive AI.\n`;
        context += `- Major Advantage 1: Pump-free operation reduces parasitic energy loss and operational costs.\n`;
        context += `- Major Advantage 2: No water injection (fracking), eliminating environmental risks.\n`;
        context += `- Efficiency: 95% thermal efficiency.\n\n`;
    } else {
        context += specificContexts.join('\n\n') + '\n\n';
    }
    
    context += `Now, please answer the following question:\n${query}`;
    return context;
};


export const GeminiChat: React.FC<{ activeView: View }> = ({ activeView }) => {
  const { region } = useContext(AppContext)!;
  const { t } = useI18n();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([
      { role: 'model', text: t('chat_greeting', { region }) }
    ]);
  }, [region, t]);

  useEffect(() => {
    chatContainerRef.current?.scrollTo(0, chatContainerRef.current.scrollHeight);
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = { role: 'user', text: input };
    const currentMessages = [...messages, userMessage];
    setMessages(currentMessages);
    setInput('');
    setIsLoading(true);

    try {
        const contextualizedInput = buildDynamicContext(input, region, activeView);
        
        const historyForApi = currentMessages.map(msg => ({
            ...msg,
            // Replace the last user message with the fully contextualized one for the API call
            text: msg === userMessage ? contextualizedInput : msg.text
        }));

        const modelResponse = await continueChat(historyForApi);
        setMessages(prev => [...prev, { role: 'model', text: modelResponse }]);
    } catch (e: any) {
        setMessages(prev => [...prev, { role: 'model', text: e.message || t('error_process_request') }]);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-slate-800 rounded-lg border border-slate-700">
      <h1 className="text-2xl font-bold text-white p-4 border-b border-slate-700">{t('chat_title')}</h1>
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-lg p-3 rounded-lg ${msg.role === 'user' ? 'bg-sky-600 text-white' : 'bg-slate-700 text-slate-200'}`}>
              <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}
        {isLoading && (
            <div className="flex justify-start">
                <div className="max-w-lg p-3 rounded-lg bg-slate-700 text-slate-200">
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                    </div>
                </div>
            </div>
        )}
      </div>
      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSend()}
            placeholder={t('chat_placeholder', { region })}
            className="flex-1 bg-slate-900 border-slate-600 rounded-lg px-4 py-2 focus:ring-sky-500 focus:border-sky-500 text-slate-200"
            disabled={isLoading}
          />
          <button onClick={handleSend} disabled={isLoading} className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded-lg disabled:bg-sky-400">
            {t('send')}
          </button>
        </div>
      </div>
    </div>
  );
};