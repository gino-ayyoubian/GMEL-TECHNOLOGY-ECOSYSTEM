
import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../../src/contexts/AppContext';
import { useI18n } from '../../src/hooks/useI18n';
import { AuthService } from '../../services/authService';

export const TwoFactorAuth: React.FC = () => {
    const { setAuthStep, currentUser } = useContext(AppContext)!;
    const { t } = useI18n();
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [generatedCode, setGeneratedCode] = useState<string | null>(null);

    useEffect(() => {
        if (currentUser) {
            // Simulate sending a code immediately on mount
            const c = AuthService.send2FACode(currentUser);
            setGeneratedCode(c); // Store for demo purposes/tooltip
        }
    }, [currentUser]);

    const handleVerify = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        setTimeout(() => {
            if (currentUser && AuthService.verify2FACode(currentUser, code)) {
                setAuthStep('nda');
            } else {
                setError(t('two_factor_error'));
            }
            setIsLoading(false);
        }, 800);
    };

    const handleResend = () => {
        if (currentUser) {
            const c = AuthService.send2FACode(currentUser);
            setGeneratedCode(c);
            setError('');
            alert(`New code sent: ${c}`);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto bg-slate-900/80 backdrop-blur-xl p-8 rounded-2xl border border-white/10 shadow-2xl">
            <h2 className="text-2xl font-bold text-white text-center mb-2">{t('two_factor_title')}</h2>
            <p className="text-slate-400 text-center mb-6">{t('two_factor_prompt')}</p>
            
            {/* Demo Hint */}
            <div className="mb-4 text-center">
                <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded border border-slate-700">
                    Demo Code: <span className="font-mono text-sky-400 font-bold">{generatedCode || '...'}</span>
                </span>
            </div>

            <form onSubmit={handleVerify} className="space-y-6">
                <div>
                    <label htmlFor="verificationCode" className="sr-only">Verification Code</label>
                    <input
                        id="verificationCode"
                        type="text"
                        value={code}
                        onChange={e => {
                            setCode(e.target.value);
                            if (error) setError('');
                        }}
                        placeholder={t('verification_code_placeholder')}
                        className={`w-full bg-slate-800/50 border rounded-xl py-3 px-3 text-white placeholder-slate-500 text-center tracking-[0.5em] transition-all font-mono text-lg ${error ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-700 focus:border-sky-500 focus:ring-1 focus:ring-sky-500/50'}`}
                        required
                        maxLength={6}
                        autoFocus
                        autoComplete="off"
                    />
                </div>
                {error && <p className="text-red-400 text-sm text-center animate-shake">{error}</p>}
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center items-center py-3 px-4 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold text-white transition-all shadow-lg shadow-sky-900/20"
                >
                    {isLoading ? (
                         <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : (
                        t('verify_button')
                    )}
                </button>
            </form>
            <div className="mt-4 text-center">
                <button onClick={handleResend} className="text-xs text-slate-500 hover:text-sky-400 transition-colors">
                    Resend Code
                </button>
            </div>
        </div>
    );
};
