import React, { useState, createContext, useEffect } from 'react';
import { Region, View } from '../types';
import { Language, locales } from '../hooks/useI18n';

interface AppContextType {
  isAccessGranted: boolean;
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

const checkAccessFromStorage = (): boolean => {
    try {
        const storedValue = sessionStorage.getItem('gmel_access_granted');
        return storedValue === 'true';
    } catch (error) {
        console.warn("Could not read from sessionStorage", error);
        return false;
    }
};

export const AppContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isAccessGranted, setIsAccessGranted] = useState(checkAccessFromStorage());
    const [region, setRegion] = useState<Region>('Qeshm Free Zone');
    const [lang, setLang] = useState<Language>('fa');
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [activeView, setActiveView] = useState<View>('dashboard');
    const [technicalTopic, setTechnicalTopic] = useState<string | null>(null);


    const supportedLangs = [
        { code: 'en' as Language, name: 'English' },
        { code: 'fa' as Language, name: 'فارسی (Persian)' },
    ];
    
    const grantAccess = () => {
        try {
            sessionStorage.setItem('gmel_access_granted', 'true');
        } catch (error) {
            console.warn("Could not write to sessionStorage", error);
        }
        setIsAccessGranted(true);
    };

    const cancelNarration = () => {
        if (speechSynthesis.speaking) {
            speechSynthesis.cancel();
        }
        setIsSpeaking(false);
    };

    useEffect(() => {
        // Ensure narration is stopped on component unmount
        return () => {
            cancelNarration();
        };
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

            const desiredLangCode = locales[lang]; // e.g., 'en-US' or 'fa-IR'
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
        // Voices may load async, give them a moment.
        if (speechSynthesis.getVoices().length === 0) {
            speechSynthesis.onvoiceschanged = speakNextChunk;
        } else {
            speakNextChunk();
        }
    };

    const value = {
        isAccessGranted,
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
