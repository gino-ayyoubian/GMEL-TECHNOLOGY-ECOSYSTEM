import React, { useState, createContext, useEffect } from 'react';
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

    const supportedLangs = [
        { code: 'en' as Language, name: 'English' },
        { code: 'fa' as Language, name: 'فارسی (Persian)' },
    ];
    
    // --- Voice Loading and Selection ---
    useEffect(() => {
        const loadVoices = () => {
            setAvailableVoices(speechSynthesis.getVoices());
        };
        // Voices load asynchronously
        speechSynthesis.onvoiceschanged = loadVoices;
        loadVoices(); // Initial call

        return () => {
            speechSynthesis.onvoiceschanged = null;
        };
    }, []);

    useEffect(() => {
        if (availableVoices.length === 0) return;
        // When language or available voices change, select the best one.
        const bestVoiceForLang = 
            availableVoices.find(v => v.lang.startsWith(locales[lang])) || 
            availableVoices.find(v => v.lang.startsWith('en')) || 
            availableVoices[0]; // Fallback to the first voice
        
        if (bestVoiceForLang) {
            setNarratorVoice(bestVoiceForLang.name);
        }
    }, [lang, availableVoices]);
    
    // --- Narration Control ---
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

        // Chunk text to prevent errors with long strings in speech synthesis APIs
        const MAX_CHUNK_LENGTH = 200; // A safe length for utterances
        const chunks: string[] = [];
        let remainingText = cleanText;

        while (remainingText.length > 0) {
            if (remainingText.length <= MAX_CHUNK_LENGTH) {
                chunks.push(remainingText);
                break;
            }

            // Find last space within the max length to avoid splitting words
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
            const selectedVoice = availableVoices.find(v => v.name === narratorVoice);
            
            if (selectedVoice) {
                utterance.voice = selectedVoice;
                utterance.lang = selectedVoice.lang;
            } else {
                utterance.lang = locales[lang];
            }

            utterance.onend = () => {
                currentChunkIndex++;
                speakNextChunk();
            };

            // Fix: Log the specific error message from the event
            utterance.onerror = (e: SpeechSynthesisErrorEvent) => {
                console.error("Speech synthesis error:", e.error);
                setIsSpeaking(false);
            };

            speechSynthesis.speak(utterance);
        };

        speakNextChunk();
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
