
import React, { useState, useContext, useRef, useEffect } from 'react';
import { AppContext } from '../../contexts/AppContext';
import { useI18n } from '../../hooks/useI18n';
import { AuthService } from '../../services/authService';
import { USER_CREDENTIALS } from '../../constants';
import { UserRole } from '../../types';
import { ShieldCheck, Briefcase, Eye, Lock, User, ChevronDown, Scale, TrendingUp, CheckCircle2, AlertCircle } from 'lucide-react';

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

const PasswordStrengthMeter: React.FC<{ password: string }> = ({ password }) => {
    const calculateStrength = (pass: string) => {
        let score = 0;
        if (!pass) return 0;
        if (pass.length > 6) score++;
        if (pass.length > 10) score++;
        if (/[A-Z]/.test(pass)) score++;
        if (/[0-9]/.test(pass)) score++;
        if (/[^A-Za-z0-9]/.test(pass)) score++;
        return score;
    };

    const strength = calculateStrength(password);
    const colors = ['bg-slate-700', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-emerald-500'];
    const labels = ['None', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];

    return (
        <div className="w-full mt-2 transition-all duration-300 ease-in-out opacity-100">
            <div className="flex gap-1 h-1 mb-1">
                {[...Array(5)].map((_, i) => (
                    <div 
                        key={i} 
                        className={`h-full flex-1 rounded-full transition-all duration-500 ease-out ${i < strength ? colors[strength] : 'bg-slate-700'}`} 
                    />
                ))}
            </div>
            <div className="flex justify-end">
                <p className={`text-[10px] font-medium transition-colors duration-300 ${strength > 3 ? 'text-green-400' : strength > 1 ? 'text-yellow-400' : 'text-slate-500'}`}>
                    {password ? labels[strength] : ''}
                </p>
            </div>
        </div>
    );
};

export const Login: React.FC = () => {
    const { setCurrentUser, setUserRole, setAuthStep, setAllowedRegions, setRegion, setSessionToken } = useContext(AppContext)!;
    const { t } = useI18n();
    const [userId, setUserId] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
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
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    const validateEmail = (email: string) => {
        return String(email)
            .toLowerCase()
            .match(
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            );
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        // Email Validation Logic
        if (userId.includes('@') && !validateEmail(userId)) {
            setError('Please enter a valid email address format.');
            setIsLoading(false);
            return;
        }

        try {
            const result = await AuthService.login(userId, password);
            
            if (result.success && result.userRole) {
                setCurrentUser(userId);
                setUserRole(result.userRole);
                if (result.token) setSessionToken(result.token);

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
                setError(result.error || t('login_error'));
            }
        } catch (e) {
            setError(t('login_error'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleSocialLogin = (provider: string) => {
        // Simulation of social login
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            alert(`${provider} login is currently simulated. Please use Enterprise credentials for the full demo experience.`);
        }, 1000);
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

    // Group roles for side panel display, excluding admin
    const groupedRoles = Object.entries(USER_CREDENTIALS).reduce((acc, [key, creds]) => {
        if (creds.role === 'admin') return acc; // Hide Admin from UI
        
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
                        <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-sky-500 transition-colors">
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
                            className={`w-full bg-slate-800/50 border rounded-xl py-3 ps-10 pe-10 text-white placeholder-slate-500 transition-all ${error && userId ? 'border-red-500/50 focus:border-red-500' : 'border-slate-700 focus:border-sky-500 focus:ring-1 focus:ring-sky-500/50'}`}
                            required
                            autoComplete="username"
                        />
                        <div className="absolute inset-y-0 end-0 pe-3 flex items-center pointer-events-none text-slate-500">
                            <ChevronDown className={`w-4 h-4 transition-transform ${showSuggestions ? 'rotate-180' : ''}`} />
                        </div>

                        {/* Dropdown List */}
                        {showSuggestions && (
                            <div ref={dropdownRef} className="absolute top-full left-0 right-0 mt-2 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-50 max-h-64 overflow-y-auto scrollbar-thin animate-pop-in">
                                {Object.entries(USER_CREDENTIALS)
                                    .filter(([_, creds]) => creds.role !== 'admin') // Exclude admin
                                    .map(([uid, creds]) => {
                                    const def = ROLE_DEFINITIONS[creds.role];
                                    return (
                                        <button
                                            key={uid}
                                            type="button"
                                            onClick={() => handlePersonaSelect(uid)}
                                            className="w-full text-start px-4 py-3 hover:bg-white/5 transition-colors flex items-center gap-3 border-b border-white/5 last:border-0"
                                        >
                                            <div className={`p-1.5 rounded-lg ${def.tier === 'Tier 1' ? 'bg-red-500/10 text-red-400' : 'bg-sky-500/10 text-sky-400'}`}>
                                                {def.icon}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white">{uid}</p>
                                                <p className="text-[10px] text-slate-400 uppercase tracking-wide">{def.title}</p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="relative group">
                        <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-sky-500 transition-colors">
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
                            className={`w-full bg-slate-800/50 border rounded-xl py-3 ps-10 pe-3 text-white placeholder-slate-500 transition-all ${error ? 'border-red-500/50 focus:border-red-500' : 'border-slate-700 focus:border-sky-500 focus:ring-1 focus:ring-sky-500/50'}`}
                            required
                            autoComplete="current-password"
                        />
                    </div>
                    {/* Visual Password Strength Indicator */}
                    {password && <PasswordStrengthMeter password={password} />}
                    
                    <div className="flex items-center justify-between text-sm">
                        <label className="flex items-center space-x-2 cursor-pointer group">
                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${rememberMe ? 'bg-sky-500 border-sky-500' : 'bg-slate-800 border-slate-600 group-hover:border-slate-500'}`}>
                                {rememberMe && <CheckCircle2 className="w-3 h-3 text-white" />}
                            </div>
                            <input 
                                type="checkbox" 
                                checked={rememberMe} 
                                onChange={(e) => setRememberMe(e.target.checked)} 
                                className="hidden" 
                            />
                            <span className="text-slate-400 group-hover:text-slate-300 transition-colors">Remember me</span>
                        </label>
                        
                        <button type="button" onClick={() => setAuthStep('resetPassword')} className="text-sky-400 hover:text-sky-300 transition-colors text-xs font-medium">
                            {t('forgot_password')}
                        </button>
                    </div>

                    {error && (
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center flex items-center justify-center gap-2 animate-shake">
                            <AlertCircle className="w-4 h-4" />
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center items-center py-3 px-4 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold text-white shadow-lg shadow-sky-900/20 transition-all transform active:scale-[0.98]"
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

                {/* Social Login Section */}
                <div className="mt-8">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-700/50"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-3 bg-[#0f172a] text-slate-500 rounded-full border border-slate-800">Or continue with</span>
                        </div>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-3">
                        <button 
                            onClick={() => handleSocialLogin('Google')}
                            className="flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-700 rounded-xl bg-slate-800/30 hover:bg-slate-800 text-slate-300 hover:text-white transition-all hover:border-slate-500 active:scale-95"
                        >
                            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
                            </svg>
                            <span className="text-sm font-medium">Google</span>
                        </button>
                        <button 
                            onClick={() => handleSocialLogin('GitHub')}
                            className="flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-700 rounded-xl bg-slate-800/30 hover:bg-slate-800 text-slate-300 hover:text-white transition-all hover:border-slate-500 active:scale-95"
                        >
                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.05-.015-2.055-3.33.72-4.035-1.605-4.035-1.605-.54-1.38-1.335-1.755-1.335-1.755-1.08-.735.09-.72.09-.72 1.2.09 1.83 1.23 1.83 1.23 1.065 1.815 2.805 1.29 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.285 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                            </svg>
                            <span className="text-sm font-medium">GitHub</span>
                        </button>
                    </div>
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
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 pl-1 border-l-2 border-sky-500/20 rtl:border-l-0 rtl:border-r-2">{category}</h4>
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
                                            
                                            <p className="text-xs text-slate-400 leading-relaxed border-t border-white/5 pt-2 mt-2">
                                                {roleDef.description}
                                            </p>
                                            
                                            {/* Selection Indicator */}
                                            {userId === roleDef.id && (
                                                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-sky-500 animate-pulse shadow-[0_0_8px_rgba(14,165,233,0.5)] rtl:right-auto rtl:left-2"></div>
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
