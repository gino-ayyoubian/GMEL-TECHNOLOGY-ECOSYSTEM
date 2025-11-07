import React, { useState, useContext, useRef } from 'react';
import { jsPDF } from 'jspdf';
import { generateText } from '../services/geminiService';
import { AppContext } from '../contexts/AppContext';
import { useI18n } from '../hooks/useI18n';
import { KKM_LOGO_DATA_URL } from '../constants';
import { SpeakerIcon } from './shared/SpeakerIcon';

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
            const generationPrompt = t('letter_generation_prompt', { region, recipient, subject, prompt });
            const result = await generateText(generationPrompt);
            setGeneratedLetter(result);
            setLetterNumber(`KKM-GMEL-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100).padStart(3, '0')}`);
        } catch (e: any) {
            setError(e.message || t('letter_generation_error'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleExportPdf = () => {
        if (!letterRef.current) return;
        const doc = new jsPDF();
        
        doc.html(letterRef.current, {
            callback: function (doc) {
                const totalPages = (doc as any).internal.getNumberOfPages();
                for (let i = 1; i <= totalPages; i++) {
                    doc.setPage(i);
                    
                    if (userRole !== 'admin') {
                        // WATERMARK
                        doc.saveGraphicsState();
                        doc.setGState(new (doc as any).GState({ opacity: 0.08 }));
                        doc.setFontSize(45);
                        doc.setTextColor(150);
                        const text = "KKM Int'l | Seyed Gino Ayyoubian | info@kkm-intl.org";
                        const textRotationAngle = 45;
                        const centerX = doc.internal.pageSize.getWidth() / 2;
                        const centerY = doc.internal.pageSize.getHeight() / 2;
                        doc.text(text, centerX, centerY, { align: 'center', angle: textRotationAngle });
                        if (KKM_LOGO_DATA_URL) {
                             doc.addImage(KKM_LOGO_DATA_URL, 'JPEG', centerX - 50, centerY - 90, 100, 100, undefined, 'FAST');
                        }
                        doc.restoreGraphicsState();
                    }

                    // FOOTER
                    doc.setFontSize(8);
                    doc.setTextColor(100);
                    const footerText = `Generated on: ${new Date().toLocaleString()} | Page ${i} of ${totalPages}`;
                    doc.text(footerText, 14, doc.internal.pageSize.getHeight() - 10);
                }
                doc.save(`KKM_Correspondence_${letterNumber}.pdf`);
            },
            x: 15,
            y: 15,
            width: 180,
            windowWidth: letterRef.current.scrollWidth,
            html2canvas: {
                scale: 0.5,
                useCORS: true,
            }
        });
    };

    const handleExportWord = () => {
        if (!letterRef.current) return;
        const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' "+
            "xmlns:w='urn:schemas-microsoft-com:office:word' "+
            "xmlns='http://www.w3.org/TR/REC-html40'>"+
            "<head><meta charset='utf-8'><title>Export HTML to Word</title></head><body>";
        const footer = "</body></html>";
        const sourceHTML = header + letterRef.current.innerHTML + footer;
    
        const blob = new Blob([sourceHTML], { type: 'application/vnd.ms-word' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `KKM_Correspondence_${letterNumber}.doc`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleExportTxt = () => {
        if (!generatedLetter) return;
    
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
    
        const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `KKM_Correspondence_${letterNumber}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
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
                        {generatedLetter && (
                            <div className="flex items-center gap-2">
                                <button onClick={handleExportPdf} className="bg-red-700 hover:bg-red-600 text-white font-bold py-2 px-3 rounded-lg text-sm transition-colors" title="Export as PDF">
                                    PDF
                                </button>
                                <button onClick={handleExportWord} className="bg-blue-700 hover:bg-blue-600 text-white font-bold py-2 px-3 rounded-lg text-sm transition-colors" title="Export as Word">
                                    Word
                                </button>
                                <button onClick={handleExportTxt} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-3 rounded-lg text-sm transition-colors" title="Export as Text">
                                    Text
                                </button>
                            </div>
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
                        <div ref={letterRef} className="p-8 bg-white text-slate-800 rounded-md font-serif text-sm" dir={lang === 'fa' ? 'rtl' : 'ltr'}>
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