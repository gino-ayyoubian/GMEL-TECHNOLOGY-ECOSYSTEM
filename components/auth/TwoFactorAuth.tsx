import React, { useState, useContext } from 'react';
import { AppContext } from '../../contexts/AppContext';
import { useI18n } from '../../hooks/useI18n';

const VERIFICATION_CODE = '123456';

export const TwoFactorAuth: React.FC = () => {
    const { setAuthStep } = useContext(AppContext)!;
    const { t } = useI18n();
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleVerify = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        setTimeout(() => {
            if (code === VERIFICATION_CODE) {
                setAuthStep('nda');
            } else {
                setError(t('two_factor_error'));
            }
            setIsLoading(false);
        }, 500);
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
                        className={`w-full bg-slate-700 border rounded-md py-2 px-3 text-white placeholder-slate-400 text-center tracking-[0.5em] transition-colors ${error ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-600 focus:border-sky-500 focus:ring-sky-500'}`}
                        required
                        maxLength={6}
                        autoFocus
                    />
                </div>
                {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center items-center py-2.5 px-4 bg-sky-600 hover:bg-sky-700 disabled:bg-sky-800 disabled:cursor-not-allowed rounded-md font-semibold text-white transition-colors"
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
        </div>
    );
};