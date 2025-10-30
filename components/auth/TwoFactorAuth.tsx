import React, { useState, useContext } from 'react';
import { AppContext } from '../../contexts/AppContext';
import { useI18n } from '../../hooks/useI18n';

const VERIFICATION_CODE = '123456';

export const TwoFactorAuth: React.FC = () => {
    const { setAuthStep } = useContext(AppContext)!;
    const { t } = useI18n();
    const [code, setCode] = useState('');
    const [error, setError] = useState('');

    const handleVerify = (e: React.FormEvent) => {
        e.preventDefault();
        if (code === VERIFICATION_CODE) {
            setAuthStep('nda');
        } else {
            setError(t('two_factor_error'));
        }
    };

    return (
        <div className="w-full max-w-md mx-auto bg-slate-800 p-8 rounded-lg border border-slate-700">
            <h2 className="text-2xl font-bold text-white text-center mb-2">{t('two_factor_title')}</h2>
            <p className="text-slate-400 text-center mb-6">{t('two_factor_prompt')}</p>
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
                        className="w-full bg-slate-700 border-slate-600 rounded-md py-2 px-3 text-white placeholder-slate-400 text-center tracking-[0.5em]"
                        required
                        maxLength={6}
                        autoFocus
                    />
                </div>
                {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                <button
                    type="submit"
                    className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-700 rounded-md font-semibold text-white transition-colors"
                >
                    {t('verify_button')}
                </button>
            </form>
        </div>
    );
};