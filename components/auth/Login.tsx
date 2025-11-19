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
    const [isLoading, setIsLoading] = useState(false);
    const [showHints, setShowHints] = useState(false);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        // Simulate network delay for better UX
        setTimeout(() => {
            const userCredentials = USER_CREDENTIALS[userId];
            if (userCredentials && userCredentials.password === password) {
                setCurrentUser(userId);
                setUserRole(userCredentials.role);

                if (userCredentials.regions && userCredentials.regions.length > 0) {
                    setAllowedRegions(userCredentials.regions as Region[]);
                    setRegion(userCredentials.regions[0] as Region);
                } else {
                    setAllowedRegions(null);
                }
                
                if (userCredentials.role === 'admin' || userCredentials.role === 'guest') {
                    setAuthStep('granted');
                } else {
                    setAuthStep('2fa');
                }
            } else {
                setError(t('login_error'));
            }
            setIsLoading(false);
        }, 500);
    };

    const handleHintClick = (user: string, pass: string) => {
        setUserId(user);
        setPassword(pass);
        setError('');
    };

    return (
        <div className="w-full bg-slate-800 p-8 rounded-lg border border-slate-700">
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
                        className={`w-full bg-slate-700 border rounded-md py-2 px-3 text-white placeholder-slate-400 transition-colors ${error ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-600 focus:border-sky-500 focus:ring-sky-500'}`}
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
                        className={`w-full bg-slate-700 border rounded-md py-2 px-3 text-white placeholder-slate-400 transition-colors ${error ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-600 focus:border-sky-500 focus:ring-sky-500'}`}
                        required
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
                        t('login_button')
                    )}
                </button>
            </form>
            
            <div className="text-center mt-4">
                <button onClick={() => setAuthStep('resetPassword')} className="text-sm text-sky-400 hover:text-sky-300 hover:underline">
                    {t('forgot_password')}
                </button>
            </div>

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
                        {Object.entries(USER_CREDENTIALS)
                            .filter(([, { role }]) => role !== 'admin')
                            .map(([user, { password, role }]) => (
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
