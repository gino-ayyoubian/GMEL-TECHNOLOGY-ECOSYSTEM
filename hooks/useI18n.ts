
import { useContext } from 'react';
import { AppContext } from '../contexts/AppContext';
import { Language } from '../types';
import * as en from '../i18n/en';
import * as fa from '../i18n/fa';
import * as ku from '../i18n/ku';
import * as ar from '../i18n/ar';

const translations: Record<Language, Partial<Record<keyof typeof en, string>>> = { en, fa, ku, ar };

export const useI18n = () => {
    const { lang } = useContext(AppContext)!;

    const t = (key: keyof typeof en, replacements?: Record<string, string | number>): string => {
        let translation = (translations[lang] && translations[lang][key]) || translations['en'][key];

        if (replacements) {
            Object.entries(replacements).forEach(([key, value]) => {
                translation = translation.replace(`{${key}}`, String(value));
            });
        }
        
        return translation || '';
    };

    return { t };
};
