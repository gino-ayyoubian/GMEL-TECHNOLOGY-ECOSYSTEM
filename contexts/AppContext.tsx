
import React, { useState, createContext, useEffect, useMemo, useCallback, useRef } from 'react';
import { Region, View, UserRole, ThemeConfig, Language } from '../types';
import { THEMES, REGION_THEME_MAP, ALL_REGIONS, locales } from '../constants';
import { AuthService } from '../services/authService';

export type AuthStep = 'language' | 'login' | '2fa' | 'nda' | 'granted' | 'resetPassword';

export interface AppContextType {
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
  sessionToken: string | null;
  setSessionToken: (token: string | null) => void;
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

const SESSION_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes

export const AppContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [authStep, setAuthStepState] = useState<AuthStep>(getInitialState('gmel_auth_step', 'login'));
    const [currentUser, setCurrentUserState] = useState<string | null>(getInitialState('gmel_current_user', null));
    const [userRole, setUserRoleState] = useState<UserRole | null>(getInitialState('gmel_user_role', null));
    
    // Check URL parameters for deep linking initialization
    const params = new URLSearchParams(window.location.search);
    const initialView = params.get('view') as View || 'dashboard';
    const initialRegion = (params.get('region') as Region) && ALL_REGIONS.includes(params.get('region') as Region) 
        ? (params.get('region') as Region) 
        : 'Qeshm Free Zone';
    const initialLang = (params.get('lang') as Language) && ['en', 'fa', 'ku', 'ar'].includes(params.get('lang') as string)
        ? (params.get('lang') as Language)
        : getInitialState('gmel_lang', 'en');

    const [region, setRegionState] = useState<Region>(initialRegion);
    const [lang, setLangState] = useState<Language>(initialLang);
    const [activeView, setActiveViewState] = useState<View>(initialView);

    const [isSpeaking, setIsSpeaking] = useState(false);
    const [technicalTopic, setTechnicalTopic] = useState<string | null>(null);
    const [allowedRegions, setAllowedRegionsState] = useState<Region[] | null>(getInitialState('gmel_allowed_regions', null));
    const [error, setError] = useState<string | null>(null);
    const [sessionToken, setSessionTokenState] = useState<string | null>(getInitialState('gmel_session_token', null));
    
    // Use useRef for activity tracking to avoid re-renders on every mouse move
    const lastActivityRef = useRef<number>(Date.now());

    const theme = useMemo(() => {
        const themeName = REGION_THEME_MAP[region] || 'warm';
        return THEMES[themeName];
    }, [region]);

    // Update URL when state changes (Deep Linking)
    useEffect(() => {
        if (authStep === 'granted') {
            const params = new URLSearchParams();
            params.set('view', activeView);
            params.set('region', region);
            params.set('lang', lang);
            const newUrl = `${window.location.pathname}?${params.toString()}`;
            try {
                window.history.replaceState(null, '', newUrl);
            } catch (e) {
                console.warn("Could not update URL history (likely running in sandboxed/blob environment):", e);
            }
        }
    }, [activeView, region, lang, authStep]);

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

    const setRegion = (newRegion: Region) => {
        setRegionState(newRegion);
    };

    const setActiveView = (newView: View) => {
        setActiveViewState(newView);
    };

    const setAllowedRegions = (regions: Region[] | null) => {
        sessionStorage.setItem('gmel_allowed_regions', JSON.stringify(regions));
        setAllowedRegionsState(regions);
    };

    const setSessionToken = (token: string | null) => {
        sessionStorage.setItem('gmel_session_token', JSON.stringify(token));
        setSessionTokenState(token);
        if (token) lastActivityRef.current = Date.now();
    };

    // Session Timeout Logic
    const handleLogout = useCallback(() => {
        if (sessionToken) {
            AuthService.logout(sessionToken);
        }
        setSessionToken(null);
        setCurrentUser(null);
        setUserRole(null);
        setAllowedRegions(null);
        setAuthStep('login');
        setError("Session expired due to inactivity. Please log in again.");
    }, [sessionToken]);

    const resetInactivityTimer = useCallback(() => {
        lastActivityRef.current = Date.now();
    }, []);

    useEffect(() => {
        if (!currentUser) return;

        const interval = setInterval(() => {
            const now = Date.now();
            // Check against ref instead of state
            if (now - lastActivityRef.current > SESSION_TIMEOUT_MS) {
                handleLogout();
            }
        }, 10000); // Check every 10 seconds

        const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
        events.forEach(event => window.addEventListener(event, resetInactivityTimer));

        return () => {
            clearInterval(interval);
            events.forEach(event => window.removeEventListener(event, resetInactivityTimer));
        };
    }, [currentUser, handleLogout, resetInactivityTimer]);


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
                const usVoices = allVoices.filter(v => v.lang === 'en-US');
                selectedVoice = usVoices.find(v => v.name.includes('Google') && v.name.includes('Male'));
                if (!selectedVoice) selectedVoice = usVoices.find(v => v.name.includes('David'));
                if (!selectedVoice) selectedVoice = usVoices.find(v => v.name.toLowerCase().includes('male') && !v.name.toLowerCase().includes('female'));
                if (!selectedVoice) selectedVoice = usVoices[0];
            } else {
                const targetLangCode = lang === 'ku' ? 'ckb' : lang;
                const langVoices = allVoices.filter(v => v.lang.startsWith(targetLangCode) || v.lang.startsWith(lang));
                selectedVoice = langVoices.find(v => v.name.includes('Google') && !v.name.toLowerCase().includes('male'));
                if (!selectedVoice) {
                    selectedVoice = langVoices.find(v => 
                        v.name.toLowerCase().includes('female') || 
                        v.name.includes('Laila') || 
                        v.name.includes('Salma') || 
                        v.name.includes('Sahar') || 
                        v.name.includes('Zira')
                    );
                }
                if (!selectedVoice && lang === 'ku') {
                     selectedVoice = allVoices.find(v => v.lang.startsWith('fa') && (v.name.includes('Google') || v.name.toLowerCase().includes('female')));
                }
                if (!selectedVoice) selectedVoice = langVoices[0];
            }
            
            if (selectedVoice) {
                utterance.voice = selectedVoice;
            }
            utterance.lang = locales[lang] || lang;
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
        sessionToken, setSessionToken
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};
