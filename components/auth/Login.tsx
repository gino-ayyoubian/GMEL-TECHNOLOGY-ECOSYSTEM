import React, { useState, useContext } from 'react';
import { AppContext } from '../../contexts/AppContext';
import { USER_CREDENTIALS } from '../../constants';
import { useI18n } from '../../hooks/useI18n';
import { Region } from '../../types';

export const Login: React.FC = () => {
    const { setCurrentUser, setUserRole, setAuthStep, setAllowedRegions, setRegion } = useContext(AppContext)!;
    const { t } = useI18n();
    const [userId, setUserId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showHints, setShowHints] = useState(false);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        const userCredentials = USER_CREDENTIALS[userId];

        if (userCredentials && userCredentials.password === password) {
            setCurrentUser(userId);
            setUserRole(userCredentials.role);

            // Handle region restrictions
            if (userCredentials.regions && userCredentials.regions.length > 0) {
                setAllowedRegions(userCredentials.regions as Region[]);
                setRegion(userCredentials.regions[0] as Region);
            } else {
                setAllowedRegions(null); // Clear restrictions for other users
            }
            
            // Bypass 2FA and NDA for admin and guest roles
            if (userCredentials.role === 'admin' || userCredentials.role === 'guest') {
                setAuthStep('granted');
            } else {
                setAuthStep('2fa');
            }
        } else {
            setError(t('login_error'));
        }
    };

    const handleHintClick = (user: string, pass: string) => {
        setUserId(user);
        setPassword(pass);
        setError('');
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
                <div>
                    <label htmlFor="password"className="sr-only">Password</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={e => {
                            setPassword(e.target.value);
                            if (error) setError('');
                        }}
                        placeholder="Password"
                        className="w-full bg-slate-700 border-slate-600 rounded-md py-2 px-3 text-white placeholder-slate-400"
                        required
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

            <div className="text-center mt-6">
                <button
                    onClick={() => setShowHints(!showHints)}
                    className="text-sm text-slate-400 hover:text-sky-400 transition-colors flex items-center justify-center mx-auto gap-2"
                >
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.706-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm-.707 7.072l.707-.707a1 1 0 10-1.414-1.414l-.707.707a1 1 0 101.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 100 2h1z" />
                    </svg>
                    {showHints ? 'Hide Credentials' : 'Show Login Credentials'}
                </button>
            </div>

            {showHints && (
                <div className="mt-4 p-4 bg-slate-700/50 rounded-lg border border-slate-600 text-xs">
                    <ul className="space-y-3">
                        {Object.entries(USER_CREDENTIALS).map(([user, { password, role }]) => (
                            <li key={user} onClick={() => handleHintClick(user, password)} className="p-2 rounded-md hover:bg-slate-600 cursor-pointer transition-colors">
                                <p><span className="font-semibold text-slate-300">User:</span> <code className="text-sky-300">{user}</code></p>
                                <p><span className="font-semibold text-slate-300">Pass:</span> <code className="text-sky-300">{password}</code></p>
                                <p><span className="font-semibold text-slate-300">Role:</span> <span className="font-medium text-amber-300">{role}</span></p>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};