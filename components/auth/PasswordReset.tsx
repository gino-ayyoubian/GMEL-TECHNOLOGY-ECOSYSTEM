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
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleIdSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setTimeout(() => {
            if (USER_CREDENTIALS[userId]) {
                setSuccessMessage(t('password_reset_prompt_step2'));
                setStep(2);
            } else {
                setError(t('error_user_not_found'));
            }
            setIsLoading(false);
        }, 500);
    };

    const handleResetSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (newPassword !== confirmPassword) {
            setError(t('error_password_mismatch'));
            return;
        }
        if (code !== RESET_CODE) {
            setError(t('error_invalid_reset_code'));
            return;
        }
        setIsLoading(true);
        setTimeout(() => {
            // In a real app, you would make an API call here.
            // We just simulate success and do not actually change the constant.
            setSuccessMessage(t('password_reset_success'));
            setIsLoading(false);
            setTimeout(() => {
                setAuthStep('login');
            }, 2000);
        }, 1000);
    };

    return (
        <div className="w-full bg-slate-800 p-8 rounded-lg border border-slate-700">
            {successMessage && !error && <p className="text-green-400 text-sm text-center mb-4">{successMessage}</p>}
            {error && <p className="text-red-400 text-sm text-center mb-4">{error}</p>}

            {step === 1 ? (
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
                            className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white placeholder-slate-400"
                            required
                        />
                    </div>
                    <button type="submit" disabled={isLoading} className="w-full flex justify-center py-2.5 px-4 bg-sky-600 hover:bg-sky-700 disabled:bg-sky-800 rounded-md font-semibold text-white">
                        {isLoading ? '...' : t('send_reset_code')}
                    </button>
                </form>
            ) : (
                <form onSubmit={handleResetSubmit} className="space-y-4">
                     <div>
                        <label htmlFor="resetCode" className="sr-only">{t('reset_code')}</label>
                        <input id="resetCode" type="text" value={code} onChange={e => setCode(e.target.value)} placeholder={t('reset_code')} className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white" required />
                    </div>
                    <div>
                        <label htmlFor="newPassword" className="sr-only">{t('new_password')}</label>
                        <input id="newPassword" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder={t('new_password')} className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white" required />
                    </div>
                    <div>
                        <label htmlFor="confirmPassword" className="sr-only">{t('confirm_new_password')}</label>
                        <input id="confirmPassword" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder={t('confirm_new_password')} className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white" required />
                    </div>
                    <button type="submit" disabled={isLoading} className="w-full flex justify-center py-2.5 px-4 bg-sky-600 hover:bg-sky-700 disabled:bg-sky-800 rounded-md font-semibold text-white">
                        {isLoading ? '...' : t('reset_password_button')}
                    </button>
                </form>
            )}

            <div className="text-center mt-6">
                <button onClick={() => setAuthStep('login')} className="text-sm text-slate-400 hover:text-sky-400">
                    {t('back_to_login')}
                </button>
            </div>
        </div>
    );
};
