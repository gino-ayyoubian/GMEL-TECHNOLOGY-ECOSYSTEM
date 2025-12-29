import React, { useContext } from 'react';
import { CORE_PATENT, PATENT_PORTFOLIO } from '../constants';
import { Patent } from '../types';
import { AppContext } from '../contexts/AppContext';

const getIconForPatent = (code: string) => {
    const iconProps = { className: "w-8 h-8 text-slate-400" };
    switch (code) {
        case 'GMEL-CLG': return <svg {...iconProps} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 16v-2m0-8v-2m-8 4h2m16 0h-2m-7-7l1.414-1.414M5.636 5.636L7.05 7.05m12.728 9.9L16.95 16.95M5.636 18.364l1.414-1.414m11.314-11.314l-1.414 1.414" /></svg>;
        case 'GMEL-EHS': return <svg {...iconProps} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
        case 'GMEL-DrillX': return <svg {...iconProps} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5.068l4.243-4.242a1 1 0 111.414 1.414L12.414 10l4.243 4.243a1 1 0 11-1.414 1.414L11 11.48V16a1 1 0 11-2 0v-4.52l-4.243 4.243a1 1 0 11-1.414-1.414L7.586 10 3.343 5.757a1 1 0 011.414-1.414L9 8.932V4a1 1 0 011-1z" clipRule="evenodd" /></svg>;
        case 'GMEL-ThermoFluid': return <svg {...iconProps} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>;
        case 'GMEL-Desal': return <svg {...iconProps} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5 5 0 010-7.07m7.072 0a5 5 0 010 7.07M12 6v.01" /></svg>;
        case 'GMEL-H₂Cell': return <svg {...iconProps} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><text x="6" y="18" fontSize="14" fontWeight="bold">H₂</text></svg>;
        case 'GMEL-AgriCell': return <svg {...iconProps} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 15.879A3 3 0 0112.02 12.02a3 3 0 012.1-3.858M12 3v9" /></svg>;
        case 'GMEL-LithiumLoop': return <svg {...iconProps} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>;
        case 'GMEL-EcoCluster': return <svg {...iconProps} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm-9 3a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
        case 'GMEL-SmartFund': return <svg {...iconProps} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /></svg>;
        case 'GMEL-GeoCredit': return <svg {...iconProps} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 20.417l4.16-2.08a12.02 12.02 0 008.618-3.04A12.02 12.02 0 0021 7.583a12.02 12.02 0 00-5.382-3.6" /></svg>;
        default: return <svg {...iconProps} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
    }
}

const PatentNode: React.FC<{ patent: Patent }> = ({ patent }) => {
    const { setActiveView, setTechnicalTopic } = useContext(AppContext)!;

    const levelColors = {
        Core: { border: 'border-teal-400', bg: 'bg-teal-500/10', progress: 'bg-teal-400' },
        Derivatives: { border: 'border-sky-400', bg: 'bg-sky-500/10', progress: 'bg-sky-400' },
        Applied: { border: 'border-amber-400', bg: 'bg-amber-500/10', progress: 'bg-amber-400' },
        Strategic: { border: 'border-purple-400', bg: 'bg-purple-500/10', progress: 'bg-purple-400' },
    };
    const colors = levelColors[patent.level];
    const hasTechPage = ['GMEL-CLG', 'GMEL-DrillX', 'GMEL-ThermoFluid', 'GMEL-EHS'].includes(patent.code);

    const handleClick = () => {
        if (hasTechPage) {
            const topicCode = patent.code.replace('GMEL-', '');
            setTechnicalTopic(topicCode);
            setActiveView('technical');
        }
    };
    
    return (
        <div 
            className={`group relative p-3 rounded-lg border-l-4 ${colors.border} ${colors.bg} transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-black/50 ${hasTechPage ? 'cursor-pointer' : 'cursor-default'}`}
            title={hasTechPage ? `${patent.application} (Click to see technical details)`: patent.application}
            onClick={handleClick}
        >
            <div className="flex items-start gap-3">
                {getIconForPatent(patent.code)}
                <div className="flex-1">
                    <h4 className="text-sm font-bold text-white leading-tight">{patent.title}</h4>
                    <p className="text-xs text-slate-400">{patent.code}</p>
                </div>
            </div>
            {patent.kpi && (
                <div className="mt-2 text-xs font-semibold text-sky-300 bg-sky-500/10 p-2 rounded text-center">
                    {patent.kpi}
                </div>
            )}
            <div className="mt-3 space-y-1">
                <div className="w-full bg-slate-700 rounded-full h-1.5">
                    <div className={`${colors.progress} h-1.5 rounded-full`} style={{ width: `${patent.progress}%` }}></div>
                </div>
                <div className="text-xs flex justify-between text-slate-500">
                    <span>{patent.status}</span>
                    <span className="font-medium text-slate-400">{patent.progress}%</span>
                </div>
            </div>
        </div>
    );
};

export const PatentInfographic: React.FC = () => {
    const patentsByLevel = {
        Derivatives: PATENT_PORTFOLIO.filter(p => p.level === 'Derivatives'),
        Applied: PATENT_PORTFOLIO.filter(p => p.level === 'Applied'),
        Strategic: PATENT_PORTFOLIO.filter(p => p.level === 'Strategic'),
    };

    return (
        <div className="relative flex flex-col items-center gap-12 py-8">
            {/* SVG Connector Lines - Hidden on smaller screens */}
            <svg className="absolute top-0 left-0 w-full h-full z-0 hidden lg:block" aria-hidden="true" preserveAspectRatio="none">
                <defs>
                    <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                        <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(71, 85, 105, 0.7)" />
                    </marker>
                </defs>
                 {/* Core -> Derivatives */}
                <path d="M 50% 120 L 50% 210" stroke="rgba(71, 85, 105, 0.7)" strokeWidth="2" markerEnd="url(#arrow)" className="connector-line" style={{animationDelay: '0s'}} />
                {/* Derivatives -> Applied */}
                <path d="M 50% 390 L 50% 480" stroke="rgba(71, 85, 105, 0.7)" strokeWidth="2" markerEnd="url(#arrow)" className="connector-line" style={{animationDelay: '0.2s'}} />
                {/* Applied -> Strategic */}
                <path d="M 50% 660 L 50% 750" stroke="rgba(71, 85, 105, 0.7)" strokeWidth="2" markerEnd="url(#arrow)" className="connector-line" style={{animationDelay: '0.5s'}} />
            </svg>

            {/* Core Level */}
            <div className="z-10 w-full flex flex-col items-center">
                <h3 className="text-sm font-semibold uppercase text-teal-400 tracking-widest mb-4">Core Technology</h3>
                <div className="w-64">
                    <PatentNode patent={CORE_PATENT} />
                </div>
            </div>

            {/* Derivatives Level */}
            <div className="z-10 w-full flex flex-col items-center">
                <h3 className="text-sm font-semibold uppercase text-sky-400 tracking-widest mb-4">Derivatives</h3>
                <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {patentsByLevel.Derivatives.map(p => <PatentNode key={p.code} patent={p} />)}
                </div>
            </div>

            {/* Applied Level */}
            <div className="z-10 w-full flex flex-col items-center">
                <h3 className="text-sm font-semibold uppercase text-amber-400 tracking-widest mb-4">Applied Innovations</h3>
                <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {patentsByLevel.Applied.map(p => <PatentNode key={p.code} patent={p} />)}
                </div>
            </div>
            
            {/* Strategic Level */}
            <div className="z-10 w-full flex flex-col items-center">
                <h3 className="text-sm font-semibold uppercase text-purple-400 tracking-widest mb-4">Strategic Frameworks</h3>
                <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {patentsByLevel.Strategic.map(p => <PatentNode key={p.code} patent={p} />)}
                </div>
            </div>
        </div>
    );
};
