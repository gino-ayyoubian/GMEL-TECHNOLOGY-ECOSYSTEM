import React, { useState, createContext, useEffect } from 'react';
import { Region, View } from '../types';
import { Language, locales } from '../hooks/useI18n';

export type AuthStep = 'language' | 'login' | '2fa' | 'nda' | 'granted';

interface AppContextType {
  authStep: AuthStep;
  setAuthStep: (step: AuthStep) => void;
  currentUser: string | null;
  setCurrentUser: (user: string | null) => void;
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
    const [region, setRegion] = useState<Region>('Qeshm Free Zone');
    const [lang, setLangState] = useState<Language>(getInitialState('gmel_lang', 'en'));
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [activeView, setActiveView] = useState<View>('dashboard');
    const [technicalTopic, setTechnicalTopic] = useState<string | null>(null);

    const setAuthStep = (step: AuthStep) => {
        sessionStorage.setItem('gmel_auth_step', JSON.stringify(step));
        setAuthStepState(step);
    };
    
    const setCurrentUser = (user: string | null) => {
        sessionStorage.setItem('gmel_current_user', JSON.stringify(user));
        setCurrentUserState(user);
    }
    
    const setLang = (newLang: Language) => {
        sessionStorage.setItem('gmel_lang', JSON.stringify(newLang));
        setLangState(newLang);
    };

    const supportedLangs = [
        { code: 'en' as Language, name: 'English' },
        { code: 'fa' as Language, name: 'فارسی (Persian)' },
        { code: 'ku' as Language, name: 'کوردی (سۆرانی)' },
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
            const selectedVoice = allVoices.find(v => v.lang === desiredLangCode) || allVoices.find(v => v.lang.startsWith(lang));
            
            if (selectedVoice) {
                utterance.voice = selectedVoice;
            }
            utterance.lang = desiredLangCode;

            utterance.onend = () => {
                currentChunkIndex++;
                speakNextChunk();
            };

            utterance.onerror = (e: SpeechSynthesisErrorEvent) => {
                console.error("Speech synthesis error:", e.error);
                setIsSpeaking(false);
            };

            speechSynthesis.speak(utterance);
        };
        
        if (speechSynthesis.getVoices().length === 0) {
            speechSynthesis.onvoiceschanged = speakNextChunk;
        } else {
            speakNextChunk();
        }
    };

    const value = {
        authStep, setAuthStep,
        currentUser, setCurrentUser,
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
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};