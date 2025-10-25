import React, { useState, createContext, useEffect, useRef } from 'react';
import { Region } from '../types';
import { Language, locales } from '../hooks/useI18n';

interface AppContextType {
  region: Region;
  setRegion: (region: Region) => void;
  lang: Language;
  setLang: (lang: Language) => void;
  supportedLangs: { code: Language, name: string }[];
  narrateText: (text: string) => void;
  cancelNarration: () => void;
  isSpeaking: boolean;
  narratorVoice: string | null;
  setNarratorVoice: (voiceName: string) => void;
  availableVoices: SpeechSynthesisVoice[];
}

export const AppContext = createContext<AppContextType | null>(null);

export const AppContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [region, setRegion] = useState<Region>('Qeshm Free Zone');
    const [lang, setLang] = useState<Language>('en');
    
    // Narration State
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [narratorVoice, setNarratorVoice] = useState<string | null>(null);
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

    const supportedLangs = [
        { code: 'en' as Language, name: 'English' },
        { code: 'fa' as Language, name: 'فارسی (Persian)' },
    ];
    
    useEffect(() => {
        const loadVoices = () => {
            const voices = speechSynthesis.getVoices();
            if (voices.length > 0) {
                setAvailableVoices(voices);
                const bestVoice = voices.find(v => v.lang.startsWith(locales[lang])) || voices.find(v => v.lang.startsWith('en')) || voices[0];
                if (bestVoice) {
                    setNarratorVoice(bestVoice.name);
                }
            }
        };

        loadVoices();
        speechSynthesis.onvoiceschanged = loadVoices;

        return () => {
            speechSynthesis.onvoiceschanged = null;
        };
    }, []);

    useEffect(() => {
        const bestVoiceForLang = availableVoices.find(v => v.lang.startsWith(locales[lang])) || availableVoices.find(v => v.lang.startsWith('en'));
        if (bestVoiceForLang) {
            setNarratorVoice(bestVoiceForLang.name);
        }
    }, [lang, availableVoices]);


    const cancelNarration = () => {
        if (speechSynthesis.speaking) {
            speechSynthesis.cancel();
        }
    };

    useEffect(() => {
        const handleSpeakingEnd = () => setIsSpeaking(false);
        
        const utterance = utteranceRef.current;
        if (utterance) {
            utterance.addEventListener('end', handleSpeakingEnd);
            utterance.addEventListener('error', handleSpeakingEnd);
        }
        
        return () => {
            if (utterance) {
                utterance.removeEventListener('end', handleSpeakingEnd);
                utterance.removeEventListener('error', handleSpeakingEnd);
            }
            cancelNarration();
        };
    }, [utteranceRef.current]);


    const narrateText = (text: string) => {
        cancelNarration();
        
        const cleanText = text.replace(/---\n\*.+\*/g, '').trim();
        const utterance = new SpeechSynthesisUtterance(cleanText);
        
        const selectedVoice = availableVoices.find(v => v.name === narratorVoice);
        if (selectedVoice) {
            utterance.voice = selectedVoice;
            utterance.lang = selectedVoice.lang;
        } else {
            utterance.lang = locales[lang];
        }

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = (e) => {
            console.error("Speech synthesis error", e);
            setIsSpeaking(false);
        }
        
        utteranceRef.current = utterance;
        speechSynthesis.speak(utterance);
    };


    const value = {
        region, setRegion,
        lang, setLang,
        supportedLangs,
        narrateText,
        cancelNarration,
        isSpeaking,
        narratorVoice,
        setNarratorVoice,
        availableVoices
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};
