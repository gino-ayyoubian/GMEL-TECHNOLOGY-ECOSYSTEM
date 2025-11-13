import React, { useState, useContext, useRef } from 'react';
import { jsPDF } from 'jspdf';
import { generateText } from '../services/geminiService';
import { AppContext } from '../contexts/AppContext';
import { useI18n } from '../hooks/useI18n';
import { KKM_LOGO_DATA_URL } from '../constants';
import { SpeakerIcon } from './shared/SpeakerIcon';
import ExportButtons from './shared/ExportButtons';

export const Correspondence: React.FC = () => {
    const { region, lang, userRole } = useContext(AppContext)!;
    const { t } = useI18n();
    const [recipient, setRecipient] = useState('');
    const [subject, setSubject] = useState('');
    const [prompt, setPrompt] = useState('');
    const [attachments, setAttachments] = useState('');
    const [generatedLetter, setGeneratedLetter] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [letterNumber, setLetterNumber] = useState(`KKM-GMEL-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100).padStart(3, '0')}`);
    const letterRef = useRef<HTMLDivElement>(null);

    const handleGenerate = async () => {
        if (!recipient || !subject || !prompt) return;
        setIsLoading(true);
        setError(null);
        setGeneratedLetter('');
        
        try {
            const generationPrompt = t('letter_generation_prompt', { region, recipient, subject, prompt, language: lang });
            const result = await generateText(generationPrompt);
            setGeneratedLetter(result);
            setLetterNumber(`KKM-GMEL-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100).padStart(3, '0')}`);
        } catch (e: any) {
            setError(e.message || t('letter_generation_error'));
        } finally {
            setIsLoading(false);
        }
    };

    const getLetterAsHtml = () => {
        if (!letterRef.current) return '';
        return letterRef.current.innerHTML;
    };

    const getLetterAsText = () => {
        if (!generatedLetter) return '';
        let textContent = `
Date: ${new Date().toLocaleDateString('en-CA')}
Letter No.: ${letterNumber}
To: ${recipient || "[Recipient Organization]"}

Subject: ${subject || "[Subject of Letter]"}

---

${generatedLetter}

---

Sincerely,
Seyed Gino Ayyoubian, Inventor
KKM International Group
`;
        if (attachments) {
            textContent += `\nAttachments: ${attachments}`;
        }
        return textContent;
    };

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-white">{t('correspondence_title')}</h1>
            <p className="text-slate-400 max-w-3xl">
                {t('correspondence_description')}
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 space-y-4">
                    <h2 className="text-xl font-semibold text-white">Letter Details</h2>
                    <div>
                        <label htmlFor="recipient" className="block text-sm font-medium text-slate-300">{t('recipient_org')}</label>
                        <input type="text" id="recipient" value={recipient} onChange={e => setRecipient(e.target.value)} placeholder={t('recipient_placeholder')} className="mt-1 block w-full bg-slate-900 border-slate-600 rounded-md shadow-sm text-slate-200" />
                    </div>
                    <div>
                        <label htmlFor="subject" className="block text-sm font-medium text-slate-300">{t('subject')}</label>
                        <input type="text" id="subject" value={subject} onChange={e => setSubject(e.target.value)} placeholder={t('subject_placeholder')} className="mt-1 block w-full bg-slate-900 border-slate-600 rounded-md shadow-sm text-slate-200" />
                    </div>
                    <div>
                        <label htmlFor="prompt" className="block text-sm font-medium text-slate-300">{t('letter_prompt')}</label>
                        <textarea id="prompt" value={prompt} onChange={e => setPrompt(e.target.value)} rows={5} placeholder={t('prompt_placeholder')} className="mt-1 block w-full bg-slate-900 border-slate-600 rounded-md shadow-sm text-slate-200" />
                    </div>
                     <div>
                        <label htmlFor="attachments" className="block text-sm font-medium text-slate-300">{t('attachments')}</label>
                        <input type="text" id="attachments" value={attachments} onChange={e => setAttachments(e.target.value)} placeholder="e.g., Technical Specification.pdf, Financial Projections.xlsx" className="mt-1 block w-full bg-slate-900 border-slate-600 rounded-md shadow-sm text-slate-200" />
                    </div>
                    <button onClick={handleGenerate} disabled={isLoading} className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:bg-sky-400">
                        {isLoading ? t('generating') : t('generate_letter')}
                    </button>
                    {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
                </div>

                <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-white flex items-center">
                            {t('generated_letter_title')}
                            {generatedLetter && <SpeakerIcon text={generatedLetter} />}
                        </h2>
                        {generatedLetter && userRole === 'admin' && (
                           <ExportButtons
                                content={getLetterAsText()}
                                htmlContent={getLetterAsHtml()}
                                title={`KKM_Correspondence_${letterNumber}`}
                           />
                        )}
                    </div>

                    {isLoading ? (
                        <div className="space-y-3 animate-pulse">
                            <div className="h-4 bg-slate-700 rounded w-3/4"></div>
                            <div className="h-4 bg-slate-700 rounded w-full"></div>
                            <div className="h-4 bg-slate-700 rounded w-full"></div>
                            <div className="h-4 bg-slate-700 rounded w-1/2"></div>
                        </div>
                    ) : (
                        <div ref={letterRef} className="p-8 bg-white text-slate-800 rounded-md font-serif text-sm" dir={lang === 'fa' || lang === 'ar' || lang === 'ku' ? 'rtl' : 'ltr'}>
                            <div className="flex justify-between items-start mb-8">
                                <img src={KKM_LOGO_DATA_URL} alt="KKM Logo" className="h-16 w-auto" />
                                <div className="text-xs" style={{textAlign: lang === 'fa' ? 'left' : 'right'}}>
                                    <p className="font-bold">Kimia Karan Maad (KKM) International</p>
                                    <p>On behalf of Seyed Gino Ayyoubian, Inventor</p>
                                    <p>info@kkm-intl.org</p>
                                </div>
                            </div>
                            <div className="text-xs mb-6">
                                <p><span className="font-bold">Date:</span> {new Date().toLocaleDateString('en-CA')}</p>
                                <p><span className="font-bold">Letter No.:</span> {letterNumber}</p>
                                <p className="mt-4"><span className="font-bold">To:</span> {recipient || "[Recipient Organization]"}</p>
                            </div>
                            <p className="mb-4"><span className="font-bold">Subject:</span> {subject || "[Subject of Letter]"}</p>
                            
                            <div className="whitespace-pre-wrap leading-relaxed">
                                {generatedLetter || "Your generated letter will appear here..."}
                            </div>

                            {generatedLetter && (
                                <div className="mt-12 text-xs">
                                    <p>Sincerely,</p>
                                    <p className="mt-8 border-t border-slate-300 pt-1">Seyed Gino Ayyoubian, Inventor</p>
                                    <p>KKM International Group</p>
                                </div>
                            )}

                             {attachments && generatedLetter && (
                                <div className="mt-8 text-xs text-slate-500">
                                    <p><span className="font-bold">Attachments:</span> {attachments}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};