import React, { useState, useContext } from 'react';
import { AppContext } from '../../contexts/AppContext';
import { PREDEFINED_USERS } from '../../constants';
import { useI18n } from '../../hooks/useI18n';

export const Login: React.FC = () => {
    const { setCurrentUser, setAuthStep } = useContext(AppContext)!;
    const { t } = useI18n();
    const [userId, setUserId] = useState('');
    const [error, setError] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (PREDEFINED_USERS.includes(userId)) {
            setCurrentUser(userId);
            setAuthStep('2fa');
        } else {
            setError(t('login_error'));
        }
    };

    return (
        <div className="w-full max-w-md mx-auto bg-slate-800 p-8 rounded-lg border border-slate-700">
            <h2 className="text-2xl font-bold text-white text-center mb-2">{t('login_title')}</h2>
            <p className="text-slate-400 text-center mb-6">{t('login_prompt')}</p>
            <form onSubmit={handleLogin} className="space-y-6">
                <div>
                    <label htmlFor="userId" className="sr-only">{t('user_id')}</label>
                    <input
                        id="userId"
                        type="text"
                        value={userId}
                        onChange={e => {
                            setUserId(e.target.value);
                            if (error) setError('');
                        }}
                        placeholder={t('user_id_placeholder')}
                        className="w-full bg-slate-700 border-slate-600 rounded-md py-2 px-3 text-white placeholder-slate-400"
                        required
                        autoFocus
                    />
                </div>
                {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                <button
                    type="submit"
                    className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-700 rounded-md font-semibold text-white transition-colors"
                >
                    {t('login_button')}
                </button>
            </form>
        </div>
    );
};