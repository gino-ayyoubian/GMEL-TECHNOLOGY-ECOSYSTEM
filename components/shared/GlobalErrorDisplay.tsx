import React, { useContext } from 'react';
import { AppContext } from '../src/contexts/AppContext';
import { useI18n } from '../src/hooks/useI18n';

export const GlobalErrorDisplay: React.FC = () => {
    const { error, setError } = useContext(AppContext)!;
    const { t } = useI18n();

    if (!error) {
        return null;
    }

    return (
        <div 
            className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="error-title"
            aria-describedby="error-description"
        >
            <div className="bg-slate-800 border border-red-500/50 rounded-lg shadow-2xl w-full max-w-md p-6 animate-fade-in-down">
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-red-500/20 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <div className="flex-1">
                        <h2 id="error-title" className="text-xl font-bold text-white">{t('error_occurred')}</h2>
                        <p id="error-description" className="mt-2 text-sm text-slate-300 whitespace-pre-wrap">{error}</p>
                    </div>
                </div>
                <div className="mt-6 flex justify-end">
                    <button
                        onClick={() => setError(null)}
                        className="px-6 py-2 bg-slate-600 hover:bg-slate-500 text-white font-semibold rounded-lg transition-colors"
                        autoFocus
                    >
                        {t('error_dismiss')}
                    </button>
                </div>
            </div>
        </div>
    );
};
