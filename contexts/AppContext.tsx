import React, { useState, createContext, useEffect } from 'react';
import { Region, View, UserRole } from '../types';
import { Language, locales } from '../hooks/useI18n';

export type AuthStep = 'language' | 'login' | '2fa' | 'nda' | 'granted';

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
            const desiredLangCode = locales[lang];
            let selectedVoice: SpeechSynthesisVoice | undefined;

            if (lang === 'fa' || lang === 'ar') {
                const femaleVoices = allVoices.filter(v => 
                    v.lang.startsWith(lang) && 
                    ((v as any).gender === 'female' || v.name.toLowerCase().includes('female'))
                );

                if (femaleVoices.length > 0) {
                    const preferredArabicVoice = femaleVoices.find(v => v.name.toLowerCase().includes('leila') || v.name.toLowerCase().includes('laila'));
                    
                    if (lang === 'ar' && preferredArabicVoice) {
                        selectedVoice = preferredArabicVoice;
                    } else {
                        selectedVoice = femaleVoices.find(v => !v.name.toLowerCase().includes('google')) || femaleVoices[0];
                    }
                }
            }
    
            if (!selectedVoice) {
                selectedVoice = allVoices.find(v => v.lang === desiredLangCode) || allVoices.find(v => v.lang.startsWith(lang));
            }
            
            if (selectedVoice) {
                utterance.voice = selectedVoice;
            }
            utterance.lang = desiredLangCode;

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
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};
