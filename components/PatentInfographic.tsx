
import React, { useContext, useMemo } from 'react';
import { Patent } from '../types';
import { AppContext } from '../contexts/AppContext';

interface PatentInfographicProps {
    patents: Patent[];
    selectedPatents?: string[];
    onToggleSelection?: (code: string) => void;
}

const getIconForPatent = (code: string) => {
    const iconProps = { className: "w-6 h-6 text-slate-400 group-hover:text-white transition-colors" };
    // Simplified icon mapping, can be expanded as needed
    if (code.includes('CLG')) return <svg {...iconProps} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 16v-2m0-8v-2m-8 4h2m16 0h-2m-7-7l1.414-1.414M5.636 5.636L7.05 7.05m12.728 9.9L16.95 16.95M5.636 18.364l1.414-1.414m11.314-11.314l-1.414 1.414" /></svg>;
    if (code.includes('H2C')) return <svg {...iconProps} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><text x="6" y="17" fontSize="12" fontWeight="bold" fill="currentColor">H₂</text></svg>;
    if (code.includes('Li')) return <svg {...iconProps} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><text x="6" y="17" fontSize="12" fontWeight="bold" fill="currentColor">Li</text></svg>;
    return <svg {...iconProps} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
}

const PatentNode: React.FC<{ patent: Patent, isSelected?: boolean, onToggle?: (code: string) => void }> = ({ patent, isSelected, onToggle }) => {
    const { setActiveView, setTechnicalTopic } = useContext(AppContext)!;

    const levelColors: Record<Patent['level'], { border: string; bg: string; progress: string }> = {
        Core: { border: 'border-teal-400', bg: 'bg-slate-900', progress: 'bg-teal-400' },
        Derivatives: { border: 'border-sky-400', bg: 'bg-slate-900', progress: 'bg-sky-400' },
        Applied: { border: 'border-amber-400', bg: 'bg-slate-900', progress: 'bg-amber-400' },
        Strategic: { border: 'border-purple-400', bg: 'bg-slate-900', progress: 'bg-purple-400' },
    };
    const colors = levelColors[patent.level];
    
    const hasTechPage = true;

    const handleClick = () => {
        if (hasTechPage) {
            setTechnicalTopic(patent.code);
            setActiveView('technical');
        }
    };
    
    return (
        <div 
            className={`group w-48 p-3 rounded-xl border ${colors.border} ${colors.bg} shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-sky-500/20 hover:z-50 cursor-pointer ${isSelected ? 'ring-2 ring-white scale-105' : ''}`}
            onClick={handleClick}
        >
            {onToggle && (
                <div className="absolute -top-2 -right-2 z-20" onClick={(e) => e.stopPropagation()}>
                    <input 
                        type="checkbox" 
                        checked={isSelected} 
                        onChange={() => onToggle(patent.code)}
                        className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-sky-500 focus:ring-sky-500 cursor-pointer shadow-md"
                    />
                </div>
            )}

            <div className="flex items-center gap-2 mb-2">
                <div className={`p-1.5 rounded-lg bg-slate-800 ${colors.border.replace('border', 'text')}`}>
                    {getIconForPatent(patent.code)}
                </div>
                <div className="overflow-hidden">
                    <h4 className="text-xs font-bold text-white leading-tight truncate">{patent.title}</h4>
                    <p className="text-[10px] text-slate-400 font-mono">{patent.code}</p>
                </div>
            </div>
            
            <div className="w-full bg-slate-700 rounded-full h-1">
                <div className={`${colors.progress} h-1 rounded-full`} style={{ width: `${patent.progress}%` }}></div>
            </div>
        </div>
    );
};

interface GraphNode extends Patent {
    x: number;
    y: number;
    parentIndex?: number; // Index in the previous layer
}

export const PatentInfographic: React.FC<PatentInfographicProps> = ({ patents, selectedPatents = [], onToggleSelection }) => {
    
    // Graph Configuration
    const width = 1000;
    const height = 800;
    const centerX = width / 2;
    const centerY = height / 2;

    const nodes = useMemo(() => {
        const cores = patents.filter(p => p.level === 'Core');
        const derivatives = patents.filter(p => p.level === 'Derivatives');
        const applied = patents.filter(p => p.level === 'Applied');
        const strategic = patents.filter(p => p.level === 'Strategic');

        const allNodes: GraphNode[] = [];

        // Level 0: Core (Center)
        cores.forEach(p => {
            allNodes.push({ ...p, x: centerX, y: centerY });
        });

        // Helper to place nodes in a circle
        const placeNodes = (items: Patent[], radius: number, parentLayer: Patent[]) => {
            const count = items.length;
            const angleStep = (2 * Math.PI) / count;
            // Rotate slightly for aesthetics
            const offset = count % 2 === 0 ? Math.PI / count : 0; 

            items.forEach((p, i) => {
                const angle = i * angleStep + offset - Math.PI / 2;
                allNodes.push({
                    ...p,
                    x: centerX + radius * Math.cos(angle),
                    y: centerY + radius * Math.sin(angle),
                    // Simplistic parent linkage logic: link to 'nearest' parent visually or just round robin
                    // Here we link to Core for Derivatives, and then chain outwards.
                    // Storing parent logic implicitly for line drawing below.
                });
            });
        };

        // Level 1: Derivatives
        placeNodes(derivatives, 200, cores);

        // Level 2: Applied
        placeNodes(applied, 350, derivatives);

        // Level 3: Strategic
        placeNodes(strategic, 480, applied); // Slightly outside but visible

        return allNodes;
    }, [patents]);

    // Generate connections (Links)
    // Hierarchy: Core -> Derivatives -> Applied -> Strategic
    // Since mapped arrays are separate, we reconstruct relationships based on logical flow or index
    const links = useMemo(() => {
        const lines: { x1: number, y1: number, x2: number, y2: number, opacity: number }[] = [];
        
        const cores = nodes.filter(n => n.level === 'Core');
        const derivatives = nodes.filter(n => n.level === 'Derivatives');
        const applied = nodes.filter(n => n.level === 'Applied');
        const strategic = nodes.filter(n => n.level === 'Strategic');

        // Core -> Derivatives (All connect to Core)
        if (cores.length > 0) {
            derivatives.forEach(d => {
                lines.push({ x1: cores[0].x, y1: cores[0].y, x2: d.x, y2: d.y, opacity: 0.8 });
            });
        }

        // Derivatives -> Applied (Distribute connections)
        applied.forEach((a, i) => {
            // Connect to nearest derivative or simple modulo
            const parent = derivatives[i % derivatives.length];
            if (parent) {
                lines.push({ x1: parent.x, y1: parent.y, x2: a.x, y2: a.y, opacity: 0.6 });
            }
        });

        // Applied -> Strategic
        strategic.forEach((s, i) => {
            const parent = applied[i % applied.length];
            if (parent) {
                lines.push({ x1: parent.x, y1: parent.y, x2: s.x, y2: s.y, opacity: 0.4 });
            }
        });

        return lines;
    }, [nodes]);

    return (
        <div className="relative w-full h-[800px] bg-slate-900/40 rounded-xl overflow-hidden border border-white/5 shadow-inner select-none">
            {/* Background Decor */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-800/30 via-transparent to-transparent opacity-50 pointer-events-none"></div>
            
            {/* SVG Layer for Links */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                <defs>
                    <marker id="node-arrow" viewBox="0 0 10 10" refX="20" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                        <path d="M 0 0 L 10 5 L 0 10 z" fill="#475569" opacity="0.5" />
                    </marker>
                </defs>
                {links.map((link, i) => (
                    <path 
                        key={i}
                        d={`M ${link.x1} ${link.y1} L ${link.x2} ${link.y2}`}
                        stroke="#475569"
                        strokeWidth="1.5"
                        strokeOpacity={link.opacity}
                        fill="none"
                        markerEnd="url(#node-arrow)"
                        className="transition-all duration-1000 ease-out"
                        strokeDasharray={link.opacity < 0.5 ? "5,5" : "0"}
                    />
                ))}
                {/* Orbital Rings */}
                <circle cx={centerX} cy={centerY} r="200" fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="4 4" opacity="0.3" />
                <circle cx={centerX} cy={centerY} r="350" fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="4 4" opacity="0.2" />
                <circle cx={centerX} cy={centerY} r="480" fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="4 4" opacity="0.1" />
            </svg>

            {/* Nodes Layer */}
            <div className="relative w-full h-full z-10">
                {nodes.map(node => (
                    <div 
                        key={node.code}
                        style={{ 
                            position: 'absolute', 
                            left: node.x, 
                            top: node.y, 
                            transform: 'translate(-50%, -50%)',
                            transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                        }}
                    >
                        <PatentNode 
                            patent={node} 
                            isSelected={selectedPatents.includes(node.code)}
                            onToggle={onToggleSelection}
                        />
                    </div>
                ))}
            </div>
            
            {/* Legend/Info Overlay */}
            <div className="absolute bottom-4 left-4 p-4 bg-slate-900/80 backdrop-blur border border-white/10 rounded-lg text-xs text-slate-400 z-20">
                <h4 className="font-bold text-white mb-2 uppercase tracking-wider">Network Topology</h4>
                <div className="flex items-center gap-2 mb-1"><span className="w-2 h-2 rounded-full bg-teal-400"></span> Core Platform (Center)</div>
                <div className="flex items-center gap-2 mb-1"><span className="w-2 h-2 rounded-full bg-sky-400"></span> Derivatives (Orbit 1)</div>
                <div className="flex items-center gap-2 mb-1"><span className="w-2 h-2 rounded-full bg-amber-400"></span> Applied Tech (Orbit 2)</div>
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-purple-400"></span> Strategic (Orbit 3)</div>
            </div>
        </div>
    );
};
