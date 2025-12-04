
import React, { useState, useContext } from 'react';
import { AppContext } from '../../contexts/AppContext';
import { useI18n } from '../../hooks/useI18n';
import { USER_CREDENTIALS } from '../../constants';

const RESET_CODE = '654321';
const MAX_ATTEMPTS = 3;

export const PasswordReset: React.FC = () => {
    const { setAuthStep } = useContext(AppContext)!;
    const { t } = useI18n();

    const [step, setStep] = useState(1);
    const [userId, setUserId] = useState('');
    const [verifyUserId, setVerifyUserId] = useState('');
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [attempts, setAttempts] = useState(0);

    // Helper to simulate network requests with potential server errors
    const simulateNetworkRequest = (callback: () => void) => {
        return new Promise<void>((resolve, reject) => {
            setTimeout(() => {
                // Simulate a random server glitch (10% chance) to demonstrate error handling
                if (Math.random() < 0.1) {
                    reject(new Error("Simulated Server Error"));
                } else {
                    callback();
                    resolve();
                }
            }, 800);
        });
    };

    const handleNetworkError = (err: any) => {
        if (err instanceof Error && err.message === 'Simulated Server Error') {
            setError(t('error_server_busy'));
        } else {
            setError(t('error_network_error'));
        }
    };

    // Step 1: Request Code
    const handleIdSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccessMessage('');
        
        try {
            await simulateNetworkRequest(() => {
                if (USER_CREDENTIALS[userId]) {
                    setSuccessMessage(t('password_reset_prompt_step2'));
                    setStep(2);
                } else {
                    setError(t('error_user_not_found'));
                }
            });
        } catch (err) {
            handleNetworkError(err);
        } finally {
            setIsLoading(false);
        }
    };

    // Step 2: Verify Code
    const handleCodeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        if (attempts >= MAX_ATTEMPTS) {
            setError(t('error_too_many_attempts'));
            return;
        }

        // Specific local validation
        if (code.length !== 6) {
            setError(t('error_code_length'));
            return;
        }

        setIsLoading(true);
        try {
            await simulateNetworkRequest(() => {
                if (code === RESET_CODE) {
                    setSuccessMessage(t('code_verified'));
                    setStep(3);
                } else {
                    setAttempts(prev => prev + 1);
                    setError(t('error_invalid_reset_code'));
                }
            });
        } catch (err) {
            handleNetworkError(err);
        } finally {
            setIsLoading(false);
        }
    };

    // Step 3: Secure Reset
    const handleFinalReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        if (verifyUserId !== userId) {
            setError(t('error_user_id_mismatch'));
            return;
        }
        
        // Refined password validation
        if (newPassword.length < 8) {
             setError(t('error_weak_password'));
             return;
        }
        
        if (newPassword !== confirmPassword) {
            setError(t('error_password_mismatch'));
            return;
        }

        setIsLoading(true);
        try {
            await simulateNetworkRequest(() => {
                setSuccessMessage(t('password_reset_success'));
                setTimeout(() => {
                    setAuthStep('login');
                }, 2000);
            });
        } catch (err) {
            handleNetworkError(err);
        } finally {
            setIsLoading(false);
        }
    };

    if (attempts >= MAX_ATTEMPTS) {
        return (
            <div className="w-full bg-slate-800 p-8 rounded-lg border border-red-500/50 text-center">
                <div className="text-red-400 font-bold mb-4">{t('error_too_many_attempts')}</div>
                <button onClick={() => setAuthStep('login')} className="text-sm text-slate-400 hover:text-white transition-colors">
                    &larr; {t('back_to_login')}
                </button>
            </div>
        );
    }

    return (
        <div className="w-full bg-slate-800 p-8 rounded-lg border border-slate-700">
            <h2 className="text-xl font-bold text-white text-center mb-4">{t('password_reset_title')}</h2>
            
            {successMessage && !error && <div className="bg-green-500/10 border border-green-500/50 text-green-400 text-sm rounded p-3 mb-4 text-center animate-fade-in">{successMessage}</div>}
            {error && <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm rounded p-3 mb-4 text-center animate-shake">{error}</div>}

            {step === 1 && (
                <form onSubmit={handleIdSubmit} className="space-y-4">
                    <p className="text-slate-400 text-center text-sm">{t('password_reset_prompt_step1')}</p>
                    <div>
                        <label htmlFor="userId" className="sr-only">{t('user_id')}</label>
                        <input
                            id="userId"
                            type="text"
                            value={userId}
                            onChange={(e) => setUserId(e.target.value)}
                            placeholder={t('user_id_placeholder')}
                            className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white placeholder-slate-400 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all"
                            required
                            autoFocus
                        />
                    </div>
                    <button type="submit" disabled={isLoading} className="w-full flex justify-center py-2.5 px-4 bg-sky-600 hover:bg-sky-700 disabled:bg-sky-800 rounded-md font-semibold text-white transition-colors">
                        {isLoading ? (
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : t('send_reset_code')}
                    </button>
                </form>
            )}

            {step === 2 && (
                 <form onSubmit={handleCodeSubmit} className="space-y-4">
                    <p className="text-slate-400 text-center text-sm">{t('password_reset_prompt_step2')}</p>
                    <div>
                        <label htmlFor="resetCode" className="sr-only">{t('reset_code')}</label>
                        <input 
                            id="resetCode" 
                            type="text" 
                            value={code} 
                            onChange={e => setCode(e.target.value)} 
                            placeholder={t('verification_code_placeholder')} 
                            className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white text-center tracking-widest placeholder-slate-400 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all" 
                            required 
                            autoFocus
                            maxLength={6}
                        />
                    </div>
                    <button type="submit" disabled={isLoading} className="w-full flex justify-center py-2.5 px-4 bg-sky-600 hover:bg-sky-700 disabled:bg-sky-800 rounded-md font-semibold text-white transition-colors">
                        {isLoading ? (
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : t('verify_code_button')}
                    </button>
                 </form>
            )}

            {step === 3 && (
                <form onSubmit={handleFinalReset} className="space-y-4">
                    <p className="text-slate-400 text-center text-sm">{t('secure_reset_instruction')}</p>
                    <div>
                        <label htmlFor="verifyUserId" className="block text-xs font-medium text-slate-400 mb-1">{t('re_enter_user_id')}</label>
                        <input 
                            id="verifyUserId" 
                            type="text" 
                            value={verifyUserId} 
                            onChange={e => setVerifyUserId(e.target.value)} 
                            placeholder={t('user_id_placeholder')} 
                            className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white placeholder-slate-400 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all" 
                            required 
                        />
                    </div>
                    <div>
                         <label htmlFor="newPassword" className="block text-xs font-medium text-slate-400 mb-1">{t('new_password')}</label>
                        <input 
                            id="newPassword" 
                            type="password" 
                            value={newPassword} 
                            onChange={e => setNewPassword(e.target.value)} 
                            placeholder={t('new_password')} 
                            className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white placeholder-slate-400 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all" 
                            required 
                        />
                    </div>
                    <div>
                        <label htmlFor="confirmPassword" className="block text-xs font-medium text-slate-400 mb-1">{t('confirm_new_password')}</label>
                        <input 
                            id="confirmPassword" 
                            type="password" 
                            value={confirmPassword} 
                            onChange={e => setConfirmPassword(e.target.value)} 
                            placeholder={t('confirm_new_password')} 
                            className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white placeholder-slate-400 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all" 
                            required 
                        />
                    </div>
                    <button type="submit" disabled={isLoading} className="w-full flex justify-center py-2.5 px-4 bg-sky-600 hover:bg-sky-700 disabled:bg-sky-800 rounded-md font-semibold text-white transition-colors">
                        {isLoading ? (
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : t('reset_password_button')}
                    </button>
                </form>
            )}

            <div className="text-center mt-6 pt-4 border-t border-slate-700">
                <button onClick={() => setAuthStep('login')} className="text-sm text-slate-400 hover:text-white transition-colors">
                    &larr; {t('back_to_login')}
                </button>
            </div>
        </div>
    );
};
