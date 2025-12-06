
import React, { useContext } from 'react';
import { Patent } from '../types';
import { AppContext } from '../contexts/AppContext';

interface PatentInfographicProps {
    patents: Patent[];
    selectedPatents?: string[];
    onToggleSelection?: (code: string) => void;
}

const getIconForPatent = (code: string) => {
    const iconProps = { className: "w-8 h-8 text-slate-400 group-hover:text-white transition-colors" };
    switch (code) {
        case 'CLG-001': return <svg {...iconProps} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 16v-2m0-8v-2m-8 4h2m16 0h-2m-7-7l1.414-1.414M5.636 5.636L7.05 7.05m12.728 9.9L16.95 16.95M5.636 18.364l1.414-1.414m11.314-11.314l-1.414 1.414" /></svg>;
        case 'NS-Stab-001': return <svg {...iconProps} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 21v-1.5M15.75 3v1.5M12 4.5v-1.5m0 18v-1.5" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 12.75a4.5 4.5 0 004.5-4.5h-9a4.5 4.5 0 004.5 4.5z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 12.75V15m6.364-6.364l-1.06-1.061M6.697 5.336L5.636 6.397" /></svg>;
        case 'EHS-002': return <svg {...iconProps} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
        case 'H2C-004': return <svg {...iconProps} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><text x="6" y="18" fontSize="14" fontWeight="bold">H₂</text></svg>;
        case 'LTH-005': return <svg {...iconProps} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>;
        case 'DES-006': return <svg {...iconProps} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5 5 0 010-7.07m7.072 0a5 5 0 010 7.07M12 6v.01" /></svg>;
        case 'AGR-007': return <svg {...iconProps} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 15.879A3 3 0 0112.02 12.02a3 3 0 012.1-3.858M12 3v9" /></svg>;
        case 'CCS-008': return <svg {...iconProps} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /></svg>;
        case 'SGR-009': return <svg {...iconProps} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 20.417l4.16-2.08a12.02 12.02 0 008.618-3.04A12.02 12.02 0 0021 7.583a12.02 12.02 0 00-5.382-3.6" /></svg>;
        case 'EGS-010': return <svg {...iconProps} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5.068l4.243-4.242a1 1 0 111.414 1.414L12.414 10l4.243 4.243a1 1 0 11-1.414 1.414L11 11.48V16a1 1 0 11-2 0v-4.52l-4.243 4.243a1 1 0 11-1.414-1.414L7.586 10 3.343 5.757a1 1 0 011.414-1.414L9 8.932V4a1 1 0 011-1z" clipRule="evenodd" /></svg>;
        case 'SCO2-011': return <svg {...iconProps} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>;
        case 'QNT-012': return <svg {...iconProps} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>;
        case 'FED-013': return <svg {...iconProps} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm-9 3a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
        case 'GMEL-CORE-014': return <svg {...iconProps} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>;
        default: return <svg {...iconProps} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
    }
}

const PatentNode: React.FC<{ patent: Patent, isSelected?: boolean, onToggle?: (code: string) => void }> = ({ patent, isSelected, onToggle }) => {
    const { setActiveView, setTechnicalTopic } = useContext(AppContext)!;

    const levelColors: Record<Patent['level'], { border: string; bg: string; progress: string }> = {
        Core: { border: 'border-teal-400', bg: 'bg-teal-500/10', progress: 'bg-teal-400' },
        Derivatives: { border: 'border-sky-400', bg: 'bg-sky-500/10', progress: 'bg-sky-400' },
        Applied: { border: 'border-amber-400', bg: 'bg-amber-500/10', progress: 'bg-amber-400' },
        Strategic: { border: 'border-purple-400', bg: 'bg-purple-500/10', progress: 'bg-purple-400' },
    };
    const colors = levelColors[patent.level];
    
    // Check if technical details exist for this patent
    const hasTechPage = true; // All patents now have tech details

    const handleClick = () => {
        if (hasTechPage) {
            setTechnicalTopic(patent.code);
            setActiveView('technical');
        }
    };
    
    return (
        <div 
            className={`group relative p-3 rounded-lg border-l-4 ${colors.border} ${colors.bg} transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-black/50 ${hasTechPage ? 'cursor-pointer' : 'cursor-default'} ${isSelected ? 'ring-2 ring-white scale-105' : ''}`}
            title={`${patent.application} (Click to see technical details)`}
            onClick={handleClick}
        >
            {/* Checkbox for comparison */}
            {onToggle && (
                <div className="absolute top-2 right-2 z-20" onClick={(e) => e.stopPropagation()}>
                    <input 
                        type="checkbox" 
                        checked={isSelected} 
                        onChange={() => onToggle(patent.code)}
                        className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-sky-500 focus:ring-sky-500 cursor-pointer"
                    />
                </div>
            )}

            <div className="flex items-start gap-3">
                {getIconForPatent(patent.code)}
                <div className="flex-1 pr-4"> {/* Added padding right to avoid overlap with checkbox */}
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
            
            {/* Interactive Tooltip (Hover) */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute left-1/2 -translate-x-1/2 bottom-full mb-3 w-64 p-3 bg-slate-900 border border-slate-600 rounded-lg shadow-xl z-50 pointer-events-none text-xs">
                <p className="font-bold text-white mb-1">{patent.title} ({patent.code})</p>
                <p className="text-slate-300 mb-2">{patent.application}</p>
                <div className="flex justify-between border-t border-slate-700 pt-2">
                    <span className="text-slate-400">Status: {patent.status}</span>
                    <span className="text-sky-400">Click for Deep Dive</span>
                </div>
                {/* Arrow */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] border-8 border-transparent border-t-slate-900"></div>
            </div>
        </div>
    );
};

export const PatentInfographic: React.FC<PatentInfographicProps> = ({ patents, selectedPatents = [], onToggleSelection }) => {
    const patentsByLevel = {
        Core: patents.filter(p => p.level === 'Core'),
        Derivatives: patents.filter(p => p.level === 'Derivatives'),
        Applied: patents.filter(p => p.level === 'Applied'),
        Strategic: patents.filter(p => p.level === 'Strategic'),
    };

    const corePatent = patentsByLevel.Core[0]; 

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
                <h3 className="text-sm font-semibold uppercase text-teal-400 tracking-widest mb-4">Core Platform</h3>
                <div className="w-64">
                    {corePatent && (
                        <PatentNode 
                            patent={corePatent} 
                            isSelected={selectedPatents.includes(corePatent.code)}
                            onToggle={onToggleSelection}
                        />
                    )}
                </div>
            </div>

            {/* Derivatives Level */}
            <div className="z-10 w-full flex flex-col items-center">
                <h3 className="text-sm font-semibold uppercase text-sky-400 tracking-widest mb-4">Derivatives</h3>
                <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-4 justify-center">
                    {patentsByLevel.Derivatives.map(p => (
                        <PatentNode 
                            key={p.code} 
                            patent={p} 
                            isSelected={selectedPatents.includes(p.code)}
                            onToggle={onToggleSelection}
                        />
                    ))}
                </div>
            </div>

            {/* Applied Level */}
            <div className="z-10 w-full flex flex-col items-center">
                <h3 className="text-sm font-semibold uppercase text-amber-400 tracking-widest mb-4">Commercialization Layer</h3>
                <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {patentsByLevel.Applied.map(p => (
                        <PatentNode 
                            key={p.code} 
                            patent={p} 
                            isSelected={selectedPatents.includes(p.code)}
                            onToggle={onToggleSelection}
                        />
                    ))}
                </div>
            </div>
            
            {/* Strategic Level */}
            <div className="z-10 w-full flex flex-col items-center">
                <h3 className="text-sm font-semibold uppercase text-purple-400 tracking-widest mb-4">Strategic & Future Frameworks</h3>
                <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {patentsByLevel.Strategic.map(p => (
                        <PatentNode 
                            key={p.code} 
                            patent={p} 
                            isSelected={selectedPatents.includes(p.code)}
                            onToggle={onToggleSelection}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};
