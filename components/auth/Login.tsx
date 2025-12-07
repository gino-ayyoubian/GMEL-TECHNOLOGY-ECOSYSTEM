
import React, { useState, useContext, useRef, useEffect } from 'react';
import { AppContext } from '../../contexts/AppContext';
import { useI18n } from '../../hooks/useI18n';
import { AuthService } from '../../services/authService';
import { USER_CREDENTIALS } from '../../constants';
import { UserRole } from '../../types';
import { ShieldCheck, Briefcase, Eye, Lock, User, Activity, Globe, Server, ChevronDown, Scale, TrendingUp } from 'lucide-react';

// --- Enterprise Role Definitions ---

interface RoleDefinition {
    title: string;
    description: string;
    tier: 'Tier 1' | 'Tier 2' | 'Tier 3' | 'Tier 4';
    clearance: string;
    icon: React.ReactNode;
    category: 'Governance' | 'Strategic' | 'Compliance' | 'Public';
}

const ROLE_DEFINITIONS: Record<UserRole, RoleDefinition> = {
    admin: { 
        title: 'System Administrator', 
        description: 'Full system configuration, security audit logs, and global user management.',
        tier: 'Tier 1',
        clearance: 'System-Wide',
        icon: <ShieldCheck className="w-4 h-4" />,
        category: 'Governance'
    },
    manager: { 
        title: 'Operations Director', 
        description: 'Project execution oversight, simulation tools, and proposal generation.',
        tier: 'Tier 2',
        clearance: 'Strategic Read/Write',
        icon: <Briefcase className="w-4 h-4" />,
        category: 'Strategic'
    },
    partner: { 
        title: 'Strategic Investor', 
        description: 'ROI analysis, financial benchmarks, and high-level milestones tracking.',
        tier: 'Tier 2',
        clearance: 'Financial Read-Only',
        icon: <TrendingUp className="w-4 h-4" />,
        category: 'Strategic'
    },
    regulator: { 
        title: 'Government Agency / Regulator', 
        description: 'Feasibility studies, site analysis, environmental impact, and permit compliance.',
        tier: 'Tier 3',
        clearance: 'Compliance Read-Only',
        icon: <Scale className="w-4 h-4" />,
        category: 'Compliance'
    },
    guest: { 
        title: 'Public Observer', 
        description: 'Limited visibility for public demonstrations and non-sensitive concept review.',
        tier: 'Tier 4',
        clearance: 'Public Limited',
        icon: <Eye className="w-4 h-4" />,
        category: 'Public'
    }
};

export const Login: React.FC = () => {
    const { setCurrentUser, setUserRole, setAuthStep, setAllowedRegions, setRegion } = useContext(AppContext)!;
    const { t } = useI18n();
    const [userId, setUserId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPersonas, setShowPersonas] = useState(false);
    
    // Autocomplete State
    const [showSuggestions, setShowSuggestions] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Handle clicking outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current && 
                !dropdownRef.current.contains(event.target as Node) &&
                inputRef.current &&
                !inputRef.current.contains(event.target as Node)
            ) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const result = await AuthService.login(userId, password);
            
            if (result.success && result.userRole) {
                setCurrentUser(userId);
                setUserRole(result.userRole);

                if (result.regions && result.regions.length > 0) {
                    setAllowedRegions(result.regions);
                    setRegion(result.regions[0]);
                } else {
                    setAllowedRegions(null);
                }
                
                // Skip 2FA for Admin/Guest for ease of demo
                if (result.userRole === 'admin' || result.userRole === 'guest') {
                    setAuthStep('granted');
                } else {
                    setAuthStep('2fa');
                }
            } else {
                setError(t('login_error'));
            }
        } catch (e) {
            setError(t('login_error'));
        } finally {
            setIsLoading(false);
        }
    };

    const handlePersonaSelect = (user: string) => {
        setUserId(user);
        setPassword(''); // Clear password to ensure manual entry
        setError('');
        setShowSuggestions(false);
        // Focus password field for better UX
        setTimeout(() => {
            passwordRef.current?.focus();
        }, 50);
    };

    // Group roles for side panel display
    const groupedRoles = Object.entries(USER_CREDENTIALS).reduce((acc, [key, creds]) => {
        const roleDef = ROLE_DEFINITIONS[creds.role];
        if (!roleDef) return acc;
        if (!acc[roleDef.category]) acc[roleDef.category] = [];
        acc[roleDef.category].push({ id: key, ...creds, ...roleDef });
        return acc;
    }, {} as Record<string, any[]>);

    const categoryOrder = ['Governance', 'Strategic', 'Compliance', 'Public'];

    return (
        <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row gap-8 items-start animate-fade-in justify-center">
            
            {/* Login Form Panel */}
            <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl p-8 rounded-2xl border border-white/10 shadow-2xl relative z-10 mx-auto lg:mx-0">
                <div className="mb-8 text-center">
                    <h2 className="text-2xl font-bold text-white tracking-tight">{t('login_button')}</h2>
                    <p className="text-slate-400 text-sm mt-2">{t('login_prompt')}</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                    {/* User ID Field with Autocomplete */}
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-sky-500 transition-colors">
                            <User className="w-5 h-5" />
                        </div>
                        <input
                            ref={inputRef}
                            id="userId"
                            type="text"
                            value={userId}
                            onChange={e => {
                                setUserId(e.target.value);
                                if (error) setError('');
                            }}
                            onFocus={() => setShowSuggestions(true)}
                            placeholder={t('user_id_placeholder')}
                            className={`w-full bg-slate-800/50 border rounded-xl py-3 pl-10 pr-10 text-white placeholder-slate-500 transition-all ${error ? 'border-red-500/50 focus:border-red-500' : 'border-slate-700 focus:border-sky-500 focus:ring-1 focus:ring-sky-500/50'}`}
                            required
                            autoComplete="off"
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-500">
                            <ChevronDown className={`w-4 h-4 transition-transform ${showSuggestions ? 'rotate-180' : ''}`} />
                        </div>

                        {/* Dropdown List */}
                        {showSuggestions && (
                            <div ref={dropdownRef} className="absolute top-full left-0 right-0 mt-2 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-50 max-h-64 overflow-y-auto scrollbar-thin animate-pop-in">
                                {Object.entries(USER_CREDENTIALS).map(([uid, creds]) => {
                                    const def = ROLE_DEFINITIONS[creds.role];
                                    return (
                                        <button
                                            key={uid}
                                            type="button"
                                            onClick={() => handlePersonaSelect(uid)}
                                            className="w-full text-left px-4 py-3 hover:bg-white/5 transition-colors flex items-center gap-3 border-b border-white/5 last:border-0"
                                        >
                                            <div className={`p-1.5 rounded-lg ${def.tier === 'Tier 1' ? 'bg-red-500/10 text-red-400' : 'bg-sky-500/10 text-sky-400'}`}>
                                                {def.icon}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white">{uid}</p>
                                                <p className="text-[10px] text-slate-400 uppercase tracking-wide">{def.title}</p>
                                                <p className="text-[10px] text-sky-400 font-mono mt-0.5">PIN: {creds.password}</p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-sky-500 transition-colors">
                            <Lock className="w-5 h-5" />
                        </div>
                        <input
                            ref={passwordRef}
                            id="password"
                            type="password"
                            value={password}
                            onChange={e => {
                                setPassword(e.target.value);
                                if (error) setError('');
                            }}
                            placeholder="Password"
                            className={`w-full bg-slate-800/50 border rounded-xl py-3 pl-10 pr-3 text-white placeholder-slate-500 transition-all ${error ? 'border-red-500/50 focus:border-red-500' : 'border-slate-700 focus:border-sky-500 focus:ring-1 focus:ring-sky-500/50'}`}
                            required
                        />
                    </div>
                    
                    {error && (
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center flex items-center justify-center gap-2 animate-shake">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center items-center py-3 px-4 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold text-white shadow-lg shadow-sky-900/20 transition-all transform active:scale-95"
                    >
                        {isLoading ? (
                             <div className="flex items-center gap-2">
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Verifying...</span>
                            </div>
                        ) : (
                            t('login_button')
                        )}
                    </button>
                </form>
                
                <div className="text-center mt-6">
                    <button onClick={() => setAuthStep('resetPassword')} className="text-xs text-slate-500 hover:text-sky-400 transition-colors">
                        {t('forgot_password')}
                    </button>
                </div>

                <div className="mt-8 pt-6 border-t border-white/5 lg:hidden">
                     <button
                        onClick={() => setShowPersonas(!showPersonas)}
                        className="w-full text-sm text-sky-400 font-medium flex items-center justify-center gap-2 hover:underline"
                    >
                        {showPersonas ? 'Hide Access Portal' : 'Open Access Portal'}
                    </button>
                </div>
            </div>

            {/* Access Tiers Panel (Side Panel) */}
            <div className={`flex-1 bg-slate-900/60 backdrop-blur-md rounded-2xl border border-white/5 overflow-hidden transition-all duration-300 ${showPersonas ? 'block' : 'hidden lg:block'}`}>
                <div className="p-6 border-b border-white/5 bg-slate-800/30">
                    <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-sky-400" />
                        {t('access_tiers_title') || 'Enterprise Access Directory'}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">Select an operational profile to simulate role-based access control (RBAC).</p>
                </div>
                
                <div className="p-6 space-y-6 max-h-[600px] overflow-y-auto scrollbar-thin">
                    {categoryOrder.map(category => {
                        const roles = groupedRoles[category];
                        if (!roles) return null;

                        return (
                            <div key={category}>
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 pl-1 border-l-2 border-sky-500/20">{category}</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {roles.map((roleDef: any) => (
                                        <div 
                                            key={roleDef.id} 
                                            onClick={() => handlePersonaSelect(roleDef.id)} 
                                            className={`group relative p-4 rounded-xl border border-white/5 bg-slate-800/40 hover:bg-slate-800/80 hover:border-sky-500/30 cursor-pointer transition-all duration-200 ${userId === roleDef.id ? 'ring-1 ring-sky-500/50 bg-slate-800' : ''}`}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="p-2 rounded-lg bg-slate-700/30 text-sky-400 group-hover:bg-sky-500/10 group-hover:scale-110 transition-all">
                                                    {roleDef.icon}
                                                </div>
                                                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${roleDef.tier === 'Tier 1' ? 'border-red-500/30 text-red-300 bg-red-500/10' : 'border-slate-600 text-slate-400 bg-slate-700/30'}`}>
                                                    {roleDef.tier}
                                                </span>
                                            </div>
                                            
                                            <h5 className="text-sm font-bold text-white group-hover:text-sky-300 transition-colors">{roleDef.title}</h5>
                                            <p className="text-[10px] text-slate-500 font-mono mb-1">{roleDef.id}</p>
                                            <p className="text-[10px] text-sky-400 font-mono mb-2">PIN: {roleDef.password}</p>
                                            <p className="text-xs text-slate-400 leading-relaxed border-t border-white/5 pt-2 mt-2">
                                                {roleDef.description}
                                            </p>
                                            
                                            {/* Selection Indicator */}
                                            {userId === roleDef.id && (
                                                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-sky-500 animate-pulse shadow-[0_0_8px_rgba(14,165,233,0.5)]"></div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
