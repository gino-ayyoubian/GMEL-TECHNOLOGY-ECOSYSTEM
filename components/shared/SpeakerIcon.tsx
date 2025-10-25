import React, { useContext } from 'react';
import { AppContext } from '../../contexts/AppContext';

export const SpeakerIcon: React.FC<{ text: string }> = ({ text }) => {
    const { narrateText } = useContext(AppContext)!;
    if (!text) return null;
    return (
        <button onClick={() => narrateText(text)} title="Read aloud" className="mx-2 text-slate-500 hover:text-sky-400 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 3.167A7.833 7.833 0 1017.833 11 7.842 7.842 0 0010 3.167zM9.167 15.5a1 1 0 01-1-1v-2.5a1 1 0 011-1h1.666a1 1 0 011 1v2.5a1 1 0 01-1 1h-1.666zm5-5.833a.833.833 0 01-1.667 0V5.25a.833.833 0 011.667 0v4.417z" />
            </svg>
        </button>
    );
};
