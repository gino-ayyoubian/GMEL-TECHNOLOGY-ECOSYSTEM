import { useContext } from 'react';
import { AppContext } from '../contexts/AppContext';
import * as en from '../i18n/en';
import * as fa from '../i18n/fa';

export type Language = 'en' | 'fa';

export const locales: Record<Language, string> = {
    en: 'en-US',
    fa: 'fa-IR',
}

// Fix: Changed the type to Record<keyof typeof en, string> to allow different string values for each language.
const translations: Record<Language, Record<keyof typeof en, string>> = { en, fa };

export const useI18n = () => {
    const { lang } = useContext(AppContext)!;

    const t = (key: keyof typeof en, replacements?: Record<string, string | number>): string => {
        let translation = translations[lang][key] || translations['en'][key];

        if (replacements) {
            Object.entries(replacements).forEach(([key, value]) => {
                translation = translation.replace(`{${key}}`, String(value));
            });
        }
        
        return translation;
    };

    return { t };
};