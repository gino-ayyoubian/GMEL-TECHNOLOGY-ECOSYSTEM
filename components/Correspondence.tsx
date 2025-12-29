
import React, { useState, useContext, useRef, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { generateText } from '../services/geminiService';
import { AppContext } from '../contexts/AppContext';
import { useI18n } from '../hooks/useI18n';
import { SpeakerIcon } from './shared/SpeakerIcon';
import ExportButtons from './shared/ExportButtons';
import { Save, Download, Trash2, FileText } from 'lucide-react';

interface LetterTemplate {
    id: string;
    name: string;
    recipient: string;
    subject: string;
    prompt: string;
    attachments: string;
}

export const Correspondence: React.FC = () => {
    const { region, lang, userRole, setError } = useContext(AppContext)!;
    const { t } = useI18n();
    const [recipient, setRecipient] = useState('');
    const [subject, setSubject] = useState('');
    const [prompt, setPrompt] = useState('');
    const [attachments, setAttachments] = useState('');
    const [generatedLetter, setGeneratedLetter] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [letterNumber, setLetterNumber] = useState(`KKM-GMEL-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100).padStart(3, '0')}`);
    const letterRef = useRef<HTMLDivElement>(null);

    // Template State
    const [templates, setTemplates] = useState<LetterTemplate[]>([]);
    const [templateName, setTemplateName] = useState('');
    const [showSaveTemplate, setShowSaveTemplate] = useState(false);

    useEffect(() => {
        setGeneratedLetter('');
        setError(null);
    }, [lang, setError]);

    // Load templates from localStorage on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem('gmel_letter_templates');
            if (saved) {
                setTemplates(JSON.parse(saved));
            }
        } catch (e) {
            console.error("Failed to load templates", e);
        }
    }, []);

    const handleSaveTemplate = () => {
        if (!templateName.trim()) return;
        const newTemplate: LetterTemplate = {
            id: Date.now().toString(),
            name: templateName,
            recipient,
            subject,
            prompt,
            attachments
        };
        const updatedTemplates = [...templates, newTemplate];
        setTemplates(updatedTemplates);
        localStorage.setItem('gmel_letter_templates', JSON.stringify(updatedTemplates));
        setTemplateName('');
        setShowSaveTemplate(false);
    };

    const handleLoadTemplate = (id: string) => {
        const template = templates.find(t => t.id === id);
        if (template) {
            setRecipient(template.recipient);
            setSubject(template.subject);
            setPrompt(template.prompt);
            setAttachments(template.attachments);
        }
    };

    const handleDeleteTemplate = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const updatedTemplates = templates.filter(t => t.id !== id);
        setTemplates(updatedTemplates);
        localStorage.setItem('gmel_letter_templates', JSON.stringify(updatedTemplates));
    };

    const handleGenerate = async () => {
        if (!recipient || !subject || !prompt) return;
        setIsLoading(true);
        setError(null);
        setGeneratedLetter('');
        
        try {
            const enhancedPrompt = `
                You are writing a professional business letter on behalf of KKM International Group (Inventor: Seyed Gino Ayyoubian).
                Project: GeoMeta Energy Layer (GMEL) Vision - A closed-loop geothermal ecosystem.
                Target Region: ${region}
                
                Recipient: ${recipient}
                Subject: ${subject}
                
                Key points to include: ${prompt}
                
                Attachments included: ${attachments || "None"}
                
                Instructions:
                1. Write a formal, persuasive business letter in ${lang}.
                2. Highlight the strategic value of GMEL for ${region}.
                3. If attachments are listed, strictly reference them in the body (e.g., "Please find attached [filenames]...").
                4. Do NOT include the header/address block or signature block in the output, just the body of the letter.
            `;

            const result = await generateText(enhancedPrompt);
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
        
        // Construct a clean, word-friendly HTML structure
        const currentDate = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
        const letterBody = letterRef.current.innerText; // Get the editable text
        
        // Base styling for Word
        const style = `
            font-family: 'Times New Roman', serif;
            font-size: 12pt;
            line-height: 1.5;
            color: #000000;
        `;

        return `
            <div style="${style}">
                <table style="width: 100%; border-bottom: 2px solid #000; margin-bottom: 20px;">
                    <tr>
                        <td style="vertical-align: bottom;">
                            <h1 style="margin: 0; font-size: 18pt; font-weight: bold; color: #0284c7;">KKM International Group</h1>
                            <p style="margin: 0; font-size: 10pt;">GeoMeta Energy Layer (GMEL) Vision</p>
                        </td>
                        <td style="text-align: right; vertical-align: bottom;">
                            <p style="margin: 0; font-size: 10pt;">Date: ${currentDate}</p>
                            <p style="margin: 0; font-size: 10pt;">Ref: ${letterNumber}</p>
                        </td>
                    </tr>
                </table>

                <div style="margin-bottom: 20px;">
                    <p><strong>To:</strong><br/>${recipient.replace(/\n/g, '<br/>')}</p>
                </div>

                <div style="margin-bottom: 20px;">
                    <p><strong>Subject: ${subject}</strong></p>
                </div>

                <div style="text-align: justify;">
                    ${letterBody.replace(/\n/g, '<br/>')}
                </div>

                <div style="margin-top: 40px;">
                    <p>Sincerely,</p>
                    <br/><br/>
                    <p><strong>Seyed Gino Ayyoubian</strong><br/>Inventor & Founder<br/>KKM International Group</p>
                </div>

                ${attachments ? `<div style="margin-top: 20px; font-size: 10pt;"><p><strong>Enclosures:</strong> ${attachments}</p></div>` : ''}
                
                <div style="margin-top: 40px; border-top: 1px solid #ccc; padding-top: 10px; font-size: 8pt; color: #666; text-align: center;">
                    <p>KKM International Group | info@kkm-intl.org | +98 21 2842 4430</p>
                </div>
            </div>
        `;
    };

    const getLetterAsText = () => {
        if (!generatedLetter && !letterRef.current) return '';
        const body = letterRef.current ? letterRef.current.innerText : generatedLetter;
        
        let textContent = `
Date: ${new Date().toLocaleDateString('en-CA')}
Letter No.: ${letterNumber}
To: ${recipient}

Subject: ${subject}

---

${body}

---

Sincerely,
Seyed Gino Ayyoubian, Inventor
KKM International Group
`;
        if (attachments) {
            textContent += `\nEnclosures: ${attachments}`;
        }
        return textContent;
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">{t('correspondence_title')}</h1>
                    <p className="text-slate-400 max-w-2xl mt-1">{t('correspondence_description')}</p>
                </div>
                
                {/* Template Controls */}
                <div className="flex gap-2">
                    <div className="relative group">
                        <button className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors border border-slate-600">
                            <FileText className="w-4 h-4" />
                            {t('template_load_template')}
                        </button>
                        <div className="absolute right-0 top-full mt-2 w-64 bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden hidden group-hover:block z-50">
                            {templates.length === 0 ? (
                                <div className="p-4 text-sm text-slate-500 text-center">No saved templates</div>
                            ) : (
                                <div className="max-h-60 overflow-y-auto">
                                    {templates.map(temp => (
                                        <div key={temp.id} onClick={() => handleLoadTemplate(temp.id)} className="flex justify-between items-center p-3 hover:bg-slate-700 cursor-pointer border-b border-slate-700 last:border-0">
                                            <span className="text-sm text-slate-200 truncate">{temp.name}</span>
                                            <button onClick={(e) => handleDeleteTemplate(temp.id, e)} className="text-slate-500 hover:text-red-400 p-1">
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <button 
                        onClick={() => setShowSaveTemplate(!showSaveTemplate)} 
                        className="flex items-center gap-2 px-4 py-2 bg-sky-600/20 hover:bg-sky-600/30 text-sky-400 border border-sky-500/30 rounded-lg transition-colors"
                    >
                        <Save className="w-4 h-4" />
                        {t('template_save_current')}
                    </button>
                </div>
            </div>

            {showSaveTemplate && (
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 flex gap-2 items-center animate-fade-in">
                    <input 
                        type="text" 
                        value={templateName} 
                        onChange={(e) => setTemplateName(e.target.value)} 
                        placeholder={t('template_name_placeholder')}
                        className="flex-grow bg-slate-900 border-slate-600 rounded-lg px-3 py-2 text-sm text-white"
                    />
                    <button onClick={handleSaveTemplate} className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-sm font-bold rounded-lg transition-colors">{t('template_save')}</button>
                    <button onClick={() => setShowSaveTemplate(false)} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm rounded-lg transition-colors">{t('template_cancel')}</button>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Input Form */}
                <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 space-y-4 shadow-lg">
                    <h2 className="text-xl font-semibold text-white mb-4">Letter Details</h2>
                    <div>
                        <label htmlFor="recipient" className="block text-sm font-medium text-slate-300">{t('recipient_org')}</label>
                        <input type="text" id="recipient" value={recipient} onChange={e => setRecipient(e.target.value)} placeholder={t('recipient_placeholder')} className="mt-1 block w-full bg-slate-900 border-slate-600 rounded-md shadow-sm text-slate-200 focus:ring-sky-500 focus:border-sky-500" />
                    </div>
                    <div>
                        <label htmlFor="subject" className="block text-sm font-medium text-slate-300">{t('subject')}</label>
                        <input type="text" id="subject" value={subject} onChange={e => setSubject(e.target.value)} placeholder={t('subject_placeholder')} className="mt-1 block w-full bg-slate-900 border-slate-600 rounded-md shadow-sm text-slate-200 focus:ring-sky-500 focus:border-sky-500" />
                    </div>
                    <div>
                        <label htmlFor="prompt" className="block text-sm font-medium text-slate-300">{t('letter_prompt')}</label>
                        <textarea id="prompt" value={prompt} onChange={e => setPrompt(e.target.value)} rows={5} placeholder={t('prompt_placeholder')} className="mt-1 block w-full bg-slate-900 border-slate-600 rounded-md shadow-sm text-slate-200 focus:ring-sky-500 focus:border-sky-500" />
                    </div>
                     <div>
                        <label htmlFor="attachments" className="block text-sm font-medium text-slate-300">{t('attachments')}</label>
                        <input type="text" id="attachments" value={attachments} onChange={e => setAttachments(e.target.value)} placeholder="e.g., Technical_Spec.pdf, Financial_Model.xlsx" className="mt-1 block w-full bg-slate-900 border-slate-600 rounded-md shadow-sm text-slate-200 focus:ring-sky-500 focus:border-sky-500" />
                    </div>
                    <button onClick={handleGenerate} disabled={isLoading} className="w-full mt-4 bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:bg-sky-400 disabled:cursor-not-allowed shadow-lg shadow-sky-900/20">
                        {isLoading ? t('generating') : t('generate_letter')}
                    </button>
                </div>

                {/* Preview / Editor */}
                <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 shadow-lg flex flex-col h-full">
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
                        <div className="space-y-4 animate-pulse p-8 bg-white/5 rounded-lg flex-grow">
                            <div className="h-4 bg-slate-700/50 rounded w-1/4 mb-8"></div>
                            <div className="h-4 bg-slate-700/50 rounded w-1/3 mb-4"></div>
                            <div className="h-4 bg-slate-700/50 rounded w-1/2 mb-12"></div>
                            <div className="space-y-2">
                                <div className="h-4 bg-slate-700/50 rounded w-full"></div>
                                <div className="h-4 bg-slate-700/50 rounded w-full"></div>
                                <div className="h-4 bg-slate-700/50 rounded w-5/6"></div>
                            </div>
                        </div>
                    ) : (
                        <div className="p-8 bg-white text-slate-900 rounded-lg font-serif text-sm shadow-inner flex-grow relative overflow-hidden" dir={lang === 'fa' || lang === 'ar' || lang === 'ku' ? 'rtl' : 'ltr'}>
                            {/* Watermark-like background logo */}
                            <img src={KKM_LOGO_DATA_URL} alt="" className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 opacity-[0.03] pointer-events-none" />
                            
                            <div className="flex justify-between items-start mb-8 border-b-2 border-black pb-4">
                                <div>
                                    <h1 className="font-bold text-lg text-sky-700">KKM International</h1>
                                    <p className="text-xs text-slate-600">GeoMeta Energy Layer (GMEL)</p>
                                </div>
                                <div className="text-right text-xs">
                                    <p><span className="font-bold">Date:</span> {new Date().toLocaleDateString('en-GB')}</p>
                                    <p><span className="font-bold">Ref:</span> {letterNumber}</p>
                                </div>
                            </div>

                            <div className="text-xs mb-6">
                                <p className="mb-1"><span className="font-bold">To:</span> {recipient || "[Recipient Organization]"}</p>
                                <p className="font-bold text-sm mt-4">Subject: {subject || "[Subject]"}</p>
                            </div>
                            
                            <div 
                                ref={letterRef}
                                className="whitespace-pre-wrap leading-relaxed outline-none min-h-[200px]"
                                contentEditable
                                suppressContentEditableWarning
                            >
                                {generatedLetter || <span className="text-slate-400 italic">Generated content will appear here and can be edited...</span>}
                            </div>

                            {generatedLetter && (
                                <div className="mt-12 text-xs">
                                    <p>Sincerely,</p>
                                    <div className="mt-8 mb-2">
                                        {/* Signature Placeholder */}
                                        <div className="font-dancing-script text-xl text-slate-800 opacity-80">Seyed Gino Ayyoubian</div>
                                    </div>
                                    <p className="font-bold">Seyed Gino Ayyoubian</p>
                                    <p>Inventor & Founder</p>
                                    <p>KKM International Group</p>
                                </div>
                            )}

                             {attachments && (
                                <div className="mt-8 pt-4 border-t border-slate-200 text-xs text-slate-600">
                                    <p><span className="font-bold">Enclosures:</span> {attachments}</p>
                                </div>
                            )}
                            
                            <div className="mt-12 pt-2 border-t border-slate-300 text-[10px] text-center text-slate-500">
                                KKM International Group | info@kkm-intl.org | +98 21 2842 4430
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
