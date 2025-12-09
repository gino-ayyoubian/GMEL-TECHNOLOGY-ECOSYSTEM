
import React, { useState, useContext } from 'react';
import { useI18n } from '../../hooks/useI18n';
import { AppContext } from '../../contexts/AppContext';

export const NDAScreen: React.FC = () => {
    const { t } = useI18n();
    const { grantAccess, currentUser, lang } = useContext(AppContext)!;
    const [entityType, setEntityType] = useState<'individual' | 'legal'>('individual');
    
    const [fullName, setFullName] = useState('');
    const [nationalId, setNationalId] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [companyName, setCompanyName] = useState('');
    
    const [ndaAgreed, setNdaAgreed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const isFormValid = () => {
        if (!ndaAgreed) return false;
        if (entityType === 'individual') {
            return fullName && nationalId && phone && email;
        }
        if (entityType === 'legal') {
            return companyName && nationalId && phone && email;
        }
        return false;
    };
    
    const handleSignAndSend = () => {
        setIsLoading(true);

        // Prepare data for email
        const subject = `NDA Acceptance - ${entityType === 'individual' ? fullName : companyName}`;
        const body = `
NDA ACCEPTANCE NOTIFICATION

The following user has agreed to the Non-Disclosure Agreement (NDA) for the GMEL Vision platform.

USER DETAILS:
-------------
User ID: ${currentUser}
Type: ${entityType.toUpperCase()}
Name: ${entityType === 'individual' ? fullName : companyName}
ID/Registration No: ${nationalId}
Phone: ${phone}
Email: ${email}
Language: ${lang}
Date: ${new Date().toLocaleString()}

AGREEMENT STATUS:
-----------------
The user has reviewed and explicitly accepted the terms of the Non-Disclosure Agreement.
        `.trim();

        // Construct mailto link
        const mailtoLink = `mailto:info@kkm-intl.org?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

        // Trigger email client
        window.location.href = mailtoLink;

        // Proceed after short delay, assuming user took action
        // No local storage of this data.
        setTimeout(() => {
            grantAccess();
            setIsLoading(false);
        }, 1500);
    };

    return (
        <div className="w-full max-w-2xl mx-auto bg-slate-800 p-8 rounded-lg border border-slate-700">
            <h2 className="text-2xl font-bold text-white text-center mb-6">{t('step_3_title')}</h2>

            <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="entityType" className="block text-sm font-medium text-slate-300">Signer Type</label>
                        <select id="entityType" value={entityType} onChange={(e) => setEntityType(e.target.value as 'individual' | 'legal')} className="mt-1 block w-full bg-slate-700 border-slate-600 rounded-md text-slate-200">
                            <option value="individual">Individual</option>
                            <option value="legal">Legal Entity</option>
                        </select>
                    </div>
                    {entityType === 'individual' ? (
                        <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder={t('full_name_placeholder')} className="block w-full bg-slate-700 border-slate-600 rounded-md text-slate-200 self-end" />
                    ) : (
                        <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Company Name" className="block w-full bg-slate-700 border-slate-600 rounded-md text-slate-200 self-end" />
                    )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input type="text" value={nationalId} onChange={e => setNationalId(e.target.value)} placeholder={entityType === 'individual' ? "National ID Number" : "Company Registration ID"} className="block w-full bg-slate-700 border-slate-600 rounded-md text-slate-200" />
                    <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Contact Number" className="block w-full bg-slate-700 border-slate-600 rounded-md text-slate-200" />
                </div>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={t('email_address_placeholder')} className="block w-full bg-slate-700 border-slate-600 rounded-md text-slate-200" />
            </div>
            
            <div className="mt-6">
                <h3 className="text-lg font-semibold text-white mb-2">{t('nda_title')}</h3>
                <div className="p-4 bg-slate-900 rounded-md h-64 overflow-y-auto border border-slate-600 text-slate-300 text-sm nda-scrollbar">
                    <p className="whitespace-pre-wrap">{t('nda_body')}</p>
                </div>
            </div>

            <div className="mt-6">
                <label className="flex items-center cursor-pointer">
                    <input type="checkbox" checked={ndaAgreed} onChange={() => setNdaAgreed(!ndaAgreed)} className="h-4 w-4 rounded bg-slate-700 border-slate-600 text-sky-600 focus:ring-sky-500" />
                    <span className="mx-2 text-slate-300 select-none">{t('nda_agree')}</span>
                </label>
            </div>
            <button 
                onClick={handleSignAndSend} 
                disabled={!isFormValid() || isLoading} 
                className="mt-6 w-full flex justify-center items-center py-2.5 px-4 bg-sky-600 hover:bg-sky-700 disabled:bg-sky-800 disabled:text-slate-400 disabled:cursor-not-allowed rounded-md font-semibold text-white transition-colors"
            >
                {isLoading ? (
                    <div className="flex items-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                           <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                           <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                       </svg>
                       <span>Sending to HQ...</span>
                    </div>
                ) : (
                    t('sign_and_activate')
                )}
            </button>
            <p className="text-xs text-slate-500 text-center mt-2">
                Confirmation details will be sent to the company email. No sensitive data is stored on this device.
            </p>
        </div>
    );
};
