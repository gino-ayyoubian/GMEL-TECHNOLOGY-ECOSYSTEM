
import React, { useState, createContext, useEffect, useMemo } from 'react';
import { Region, View, UserRole, ThemeConfig } from '../types';
import { Language, locales } from '../hooks/useI18n';
import { THEMES, REGION_THEME_MAP } from '../constants';

export type AuthStep = 'language' | 'login' | '2fa' | 'nda' | 'granted' | 'resetPassword';

interface AppContextType {
  authStep: AuthStep;
  setAuthStep: (step: AuthStep) => void;
  currentUser: string | null;
  setCurrentUser: (user: string | null) => void;
  userRole: UserRole | null;
  setUserRole: (role: UserRole | null) => void;
  grantAccess: () => void;
  region: Region;
  setRegion: (region: Region) => void;
  lang: Language;
  setLang: (lang: Language) => void;
  supportedLangs: { code: Language, name: string }[];
  narrateText: (text: string) => void;
  cancelNarration: () => void;
  isSpeaking: boolean;
  activeView: View;
  setActiveView: (view: View) => void;
  technicalTopic: string | null;
  setTechnicalTopic: (topic: string | null) => void;
  allowedRegions: Region[] | null;
  setAllowedRegions: (regions: Region[] | null) => void;
  error: string | null;
  setError: (message: string | null) => void;
  theme: ThemeConfig;
}

export const AppContext = createContext<AppContextType | null>(null);

const getInitialState = <T,>(key: string, defaultValue: T): T => {
    try {
        const storedValue = sessionStorage.getItem(key);
        return storedValue ? (JSON.parse(storedValue) as T) : defaultValue;
    } catch (error) {
        console.warn(`Could not read ${key} from sessionStorage`, error);
        return defaultValue;
    }
};


export const AppContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [authStep, setAuthStepState] = useState<AuthStep>(getInitialState('gmel_auth_step', 'language'));
    const [currentUser, setCurrentUserState] = useState<string | null>(getInitialState('gmel_current_user', null));
    const [userRole, setUserRoleState] = useState<UserRole | null>(getInitialState('gmel_user_role', null));
    const [region, setRegion] = useState<Region>('Qeshm Free Zone');
    const [lang, setLangState] = useState<Language>(getInitialState('gmel_lang', 'en'));
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [activeView, setActiveView] = useState<View>('dashboard');
    const [technicalTopic, setTechnicalTopic] = useState<string | null>(null);
    const [allowedRegions, setAllowedRegionsState] = useState<Region[] | null>(getInitialState('gmel_allowed_regions', null));
    const [error, setError] = useState<string | null>(null);

    const theme = useMemo(() => {
        const themeName = REGION_THEME_MAP[region] || 'warm';
        return THEMES[themeName];
    }, [region]);

    const setAuthStep = (step: AuthStep) => {
        sessionStorage.setItem('gmel_auth_step', JSON.stringify(step));
        setAuthStepState(step);
    };
    
    const setCurrentUser = (user: string | null) => {
        sessionStorage.setItem('gmel_current_user', JSON.stringify(user));
        setCurrentUserState(user);
    }
    
    const setUserRole = (role: UserRole | null) => {
        sessionStorage.setItem('gmel_user_role', JSON.stringify(role));
        setUserRoleState(role);
    };

    const setLang = (newLang: Language) => {
        sessionStorage.setItem('gmel_lang', JSON.stringify(newLang));
        setLangState(newLang);
    };

    const setAllowedRegions = (regions: Region[] | null) => {
        sessionStorage.setItem('gmel_allowed_regions', JSON.stringify(regions));
        setAllowedRegionsState(regions);
    };

    const supportedLangs = [
        { code: 'en' as Language, name: 'English' },
        { code: 'fa' as Language, name: 'فارسی (Persian)' },
        { code: 'ku' as Language, name: 'کوردی (Sorani)' },
        { code: 'ar' as Language, name: 'العربية (Arabic)' },
    ];
    
    const grantAccess = () => {
        setAuthStep('granted');
    };

    const cancelNarration = () => {
        if (speechSynthesis.speaking) {
            speechSynthesis.cancel();
        }
        setIsSpeaking(false);
    };

    useEffect(() => {
        return () => cancelNarration();
    }, []);

    const narrateText = (text: string) => {
        cancelNarration();
        
        const cleanText = text.replace(/---\n\*.+\*/g, '').trim();
        if (!cleanText) return;

        const MAX_CHUNK_LENGTH = 200;
        const chunks: string[] = [];
        let remainingText = cleanText;

        while (remainingText.length > 0) {
            if (remainingText.length <= MAX_CHUNK_LENGTH) {
                chunks.push(remainingText);
                break;
            }
            let chunkEnd = remainingText.lastIndexOf(' ', MAX_CHUNK_LENGTH);
            if (chunkEnd === -1) {
                chunkEnd = MAX_CHUNK_LENGTH;
            }
            chunks.push(remainingText.substring(0, chunkEnd));
            remainingText = remainingText.substring(chunkEnd).trim();
        }

        if (chunks.length === 0) return;
        
        setIsSpeaking(true);
        let currentChunkIndex = 0;

        const speakNextChunk = () => {
            if (currentChunkIndex >= chunks.length) {
                setIsSpeaking(false);
                return;
            }
            const utterance = new SpeechSynthesisUtterance(chunks[currentChunkIndex]);
            const allVoices = speechSynthesis.getVoices();
            let selectedVoice: SpeechSynthesisVoice | undefined;

            if (lang === 'en') {
                // STRICTLY MALE, AMERICAN ACCENT
                // Priority 1: Google US English (High Quality, usually gender-neutral/female but fits "best accent")
                // Priority 2: Microsoft David (Windows standard Male)
                // Priority 3: Any US Male
                
                // Attempt to find a high-quality US male voice
                selectedVoice = allVoices.find(v => v.lang === 'en-US' && v.name.includes('Google') && v.name.includes('Male'));
                
                // Fallback to Microsoft David (Standard Windows Male)
                if (!selectedVoice) {
                    selectedVoice = allVoices.find(v => v.lang === 'en-US' && v.name.includes('David'));
                }

                // Fallback to any US voice that isn't explicitly Female (trying to avoid Zira)
                if (!selectedVoice) {
                    selectedVoice = allVoices.find(v => v.lang === 'en-US' && !v.name.includes('Zira') && !v.name.toLowerCase().includes('female'));
                }

                // Absolute fallback to any US English
                if (!selectedVoice) {
                    selectedVoice = allVoices.find(v => v.lang === 'en-US');
                }
            } else {
                // STRICTLY FEMALE, BEST NATIVE ACCENT (FA, AR, KU)
                const targetLangCode = lang === 'ku' ? 'ckb' : lang; // Handle Sorani code if present
                const langVoices = allVoices.filter(v => v.lang.startsWith(targetLangCode) || v.lang.startsWith(lang));

                // Priority 1: Google Neural Voices (High Quality)
                selectedVoice = langVoices.find(v => v.name.includes('Google'));

                // Priority 2: Known Female Voices
                if (!selectedVoice) {
                    selectedVoice = langVoices.find(v => 
                        v.name.toLowerCase().includes('female') || 
                        v.name.includes('Laila') || // Arabic
                        v.name.includes('Salma') || // Arabic
                        v.name.includes('Sahar') || // Farsi
                        v.name.includes('Zira')
                    );
                }

                // Priority 3: Any voice in the language (fallback)
                if (!selectedVoice) {
                    selectedVoice = langVoices[0];
                }
            }
            
            if (selectedVoice) {
                utterance.voice = selectedVoice;
            }
            // Ensure the lang attribute is set correctly for the engine to switch phonemes
            utterance.lang = locales[lang] || lang;

            // Adjust rate slightly for better clarity
            utterance.rate = 0.95; 

            utterance.onend = () => {
                currentChunkIndex++;
                speakNextChunk();
            };

            utterance.onerror = (e: SpeechSynthesisErrorEvent) => {
                if (e.error !== 'canceled') {
                    console.error("Speech synthesis error:", e.error);
                }
                setIsSpeaking(false);
            };

            speechSynthesis.speak(utterance);
        };
        
        const starter = () => {
            if (speechSynthesis.getVoices().length === 0) {
                speechSynthesis.addEventListener('voiceschanged', starter, { once: true });
                return;
            }
            speakNextChunk();
        };

        starter();
    };

    const value = {
        authStep, setAuthStep,
        currentUser, setCurrentUser,
        userRole, setUserRole,
        grantAccess,
        region, setRegion,
        lang, setLang,
        supportedLangs,
        narrateText,
        cancelNarration,
        isSpeaking,
        activeView,
        setActiveView,
        technicalTopic,
        setTechnicalTopic,
        allowedRegions,
        setAllowedRegions,
        error,
        setError,
        theme,
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};
