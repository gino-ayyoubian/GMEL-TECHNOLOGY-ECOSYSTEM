import React, { useState } from 'react';
import { useI18n } from '../../hooks/useI18n';

interface FeedbackProps {
    sectionId: string;
}

export const Feedback: React.FC<FeedbackProps> = ({ sectionId }) => {
    const { t } = useI18n();
    const [feedbackSent, setFeedbackSent] = useState(false);

    const handleFeedback = (wasHelpful: boolean) => {
        console.log(`Feedback for section '${sectionId}': ${wasHelpful ? 'Helpful' : 'Not Helpful'}`);
        setFeedbackSent(true);
    };

    if (feedbackSent) {
        return (
            <div className="mt-4 text-xs text-slate-500 italic">
                {t('feedback_thanks')}
            </div>
        );
    }

    return (
        <div className="mt-4 pt-2 border-t border-slate-700/50 flex items-center gap-4">
            <p className="text-xs text-slate-500">{t('feedback_prompt')}</p>
            <div className="flex gap-2">
                <button
                    onClick={() => handleFeedback(true)}
                    className="px-2 py-1 text-xs rounded-md bg-slate-700 hover:bg-green-500/50 text-slate-300 hover:text-white transition-colors"
                    aria-label={t('feedback_yes')}
                >
                    👍
                </button>
                <button
                    onClick={() => handleFeedback(false)}
                     className="px-2 py-1 text-xs rounded-md bg-slate-700 hover:bg-red-500/50 text-slate-300 hover:text-white transition-colors"
                     aria-label={t('feedback_no')}
                >
                    👎
                </button>
            </div>
        </div>
    );
};
