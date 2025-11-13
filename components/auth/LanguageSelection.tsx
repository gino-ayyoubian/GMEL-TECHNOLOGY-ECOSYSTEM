import React, { useContext } from 'react';
import { AppContext } from '../../contexts/AppContext';
import { KKM_LOGO_DATA_URL } from '../../constants';
import { useI18n } from '../../hooks/useI18n';
import { Language } from '../../hooks/useI18n';

export const LanguageSelection: React.FC = () => {
    const { setLang, setAuthStep, supportedLangs } = useContext(AppContext)!;
    // We need a separate i18n instance here that doesn't depend on the context yet
    const { t } = useI18n();

    const handleSelectLang = (langCode: Language) => {
        setLang(langCode);
        setAuthStep('login');
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-slate-100 p-4">
            <div className="text-center max-w-2xl mx-auto">
                <img src={KKM_LOGO_DATA_URL} alt="KKM International Logo" className="h-24 mx-auto mb-6 bg-white rounded-2xl p-2" />
                <h1 className="text-4xl font-bold text-white mb-2">{t('welcome_title')}</h1>
                <p className="text-lg text-slate-400 mb-10">{t('welcome_prompt')}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {supportedLangs.map(({ code, name }) => (
                        <button
                            key={code}
                            onClick={() => handleSelectLang(code)}
                            className="p-6 bg-slate-800 rounded-lg border-2 border-slate-700 hover:border-sky-500 hover:bg-slate-700/50 transform hover:scale-105 transition-all duration-300"
                        >
                            <span className="text-xl font-semibold text-white">{name.split(' (')[0]}</span>
                            <span className="block text-sm text-slate-400">{name.split(' (')[1]?.replace(')', '')}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
