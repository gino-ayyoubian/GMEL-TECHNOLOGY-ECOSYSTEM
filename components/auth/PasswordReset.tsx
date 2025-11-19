
import React, { useState, useContext } from 'react';
import { AppContext } from '../../contexts/AppContext';
import { useI18n } from '../../hooks/useI18n';
import { USER_CREDENTIALS } from '../../constants';

const RESET_CODE = '654321';

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

    // Step 1: Request Code
    const handleIdSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccessMessage('');
        
        setTimeout(() => {
            if (USER_CREDENTIALS[userId]) {
                setSuccessMessage(t('password_reset_prompt_step2'));
                setStep(2);
            } else {
                setError(t('error_user_not_found'));
            }
            setIsLoading(false);
        }, 600);
    };

    // Step 2: Verify Code
    const handleCodeSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccessMessage('');

        setTimeout(() => {
            if (code === RESET_CODE) {
                setSuccessMessage(t('code_verified'));
                setStep(3);
            } else {
                setError(t('error_invalid_reset_code'));
            }
            setIsLoading(false);
        }, 600);
    };

    // Step 3: Secure Reset
    const handleFinalReset = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        if (verifyUserId !== userId) {
            setError(t('error_user_id_mismatch'));
            return;
        }
        if (newPassword.length < 4) {
             setError("Password is too short (min 4 characters).");
             return;
        }
        if (newPassword !== confirmPassword) {
            setError(t('error_password_mismatch'));
            return;
        }

        setIsLoading(true);
        setTimeout(() => {
            setSuccessMessage(t('password_reset_success'));
            setIsLoading(false);
            setTimeout(() => {
                setAuthStep('login');
            }, 2000);
        }, 1000);
    };

    return (
        <div className="w-full bg-slate-800 p-8 rounded-lg border border-slate-700">
            <h2 className="text-xl font-bold text-white text-center mb-4">{t('password_reset_title')}</h2>
            
            {successMessage && !error && <div className="bg-green-500/10 border border-green-500/50 text-green-400 text-sm rounded p-3 mb-4 text-center">{successMessage}</div>}
            {error && <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm rounded p-3 mb-4 text-center">{error}</div>}

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
                            className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white placeholder-slate-400 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
                            required
                            autoFocus
                        />
                    </div>
                    <button type="submit" disabled={isLoading} className="w-full flex justify-center py-2.5 px-4 bg-sky-600 hover:bg-sky-700 disabled:bg-sky-800 rounded-md font-semibold text-white transition-colors">
                        {isLoading ? '...' : t('send_reset_code')}
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
                            className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white text-center tracking-widest placeholder-slate-400 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none" 
                            required 
                            autoFocus
                        />
                    </div>
                    <button type="submit" disabled={isLoading} className="w-full flex justify-center py-2.5 px-4 bg-sky-600 hover:bg-sky-700 disabled:bg-sky-800 rounded-md font-semibold text-white transition-colors">
                        {isLoading ? '...' : t('verify_code_button')}
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
                            className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white placeholder-slate-400 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none" 
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
                            className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white placeholder-slate-400 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none" 
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
                            className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white placeholder-slate-400 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none" 
                            required 
                        />
                    </div>
                    <button type="submit" disabled={isLoading} className="w-full flex justify-center py-2.5 px-4 bg-sky-600 hover:bg-sky-700 disabled:bg-sky-800 rounded-md font-semibold text-white transition-colors">
                        {isLoading ? '...' : t('reset_password_button')}
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
