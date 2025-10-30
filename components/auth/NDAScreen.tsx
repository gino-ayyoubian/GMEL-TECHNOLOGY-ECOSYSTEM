import React, { useState, useContext } from 'react';
import { useI18n } from '../../hooks/useI18n';
import { AppContext } from '../../contexts/AppContext';

// This component replaces the old AccessControl.tsx and is part of the new auth flow.
// It will be rendered by App.tsx when authStep is 'nda'.

export const NDAScreen: React.FC = () => {
    const { t } = useI18n();
    const { grantAccess, currentUser } = useContext(AppContext)!;
    const [entityType, setEntityType] = useState<'individual' | 'legal'>('individual');
    
    // Form State
    const [fullName, setFullName] = useState('');
    const [nationalId, setNationalId] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [companyName, setCompanyName] = useState('');
    
    const [ndaAgreed, setNdaAgreed] = useState(false);

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
    
    const handleSignAndArchive = () => {
        const simpleHash = (s: string) => {
            let hash = 0;
            for (let i = 0; i < s.length; i++) {
                const char = s.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash;
            }
            return `0x${Math.abs(hash).toString(16)}`;
        };
        
        const signerDetails = entityType === 'individual'
            ? { type: 'Individual', name: fullName, national_id: nationalId, phone, email }
            : { type: 'Legal Entity', company_name: companyName, registration_id: nationalId, phone, email };

        const proof = {
            "signer_username": currentUser,
            "signer_details": signerDetails,
            "document_details": {
                "document_id": `NDA-GMEL-${new Date().getFullYear()}-001`,
                "document_hash": simpleHash(t('nda_body')),
                "language": "en" // Assuming NDA text is in English for the log
            },
            "signature_details": {
                "signature_method": "GMEL-SecureSign (Electronic Consent)",
                "timestamp_utc": new Date().toISOString(),
                "ip_address": "79.1.2.3", // Simulated IP
            },
            "legal_traceability": {
                "evidence_package_id": `sig-${simpleHash(currentUser + new Date().toISOString())}`,
            }
        };

        const blob = new Blob([JSON.stringify(proof, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `NDA_Signature_Log_${currentUser}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        // Grant access after "archiving"
        grantAccess();
    };

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-white text-center">{t('access_control_title')}</h1>
            
            <div className="bg-slate-800 p-8 rounded-lg border border-slate-700 w-full max-w-3xl mx-auto">
                 <h2 className="text-xl font-semibold text-white text-center mb-6">{t('step_3_title')}</h2>

                <div className="mb-6">
                    <label htmlFor="entityType" className="block text-sm font-medium text-slate-300">Signer Type</label>
                    <select
                        id="entityType"
                        value={entityType}
                        onChange={(e) => setEntityType(e.target.value as 'individual' | 'legal')}
                        className="mt-1 block w-full bg-slate-700 border-slate-600 rounded-md text-slate-200"
                    >
                        <option value="individual">Individual</option>
                        <option value="legal">Legal Entity</option>
                    </select>
                </div>

                <div className="space-y-4">
                    {entityType === 'individual' ? (
                        <>
                            <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder={t('full_name_placeholder')} className="block w-full bg-slate-700 border-slate-600 rounded-md text-slate-200" />
                            <input type="text" value={nationalId} onChange={e => setNationalId(e.target.value)} placeholder="National ID Number" className="block w-full bg-slate-700 border-slate-600 rounded-md text-slate-200" />
                        </>
                    ) : (
                         <>
                            <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Company Name" className="block w-full bg-slate-700 border-slate-600 rounded-md text-slate-200" />
                            <input type="text" value={nationalId} onChange={e => setNationalId(e.target.value)} placeholder="Company Registration / National ID" className="block w-full bg-slate-700 border-slate-600 rounded-md text-slate-200" />
                        </>
                    )}
                    <input type="text" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Mobile / Contact Number" className="block w-full bg-slate-700 border-slate-600 rounded-md text-slate-200" />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={t('email_address_placeholder')} className="block w-full bg-slate-700 border-slate-600 rounded-md text-slate-200" />
                </div>
                
                <div className="mt-6">
                    <h3 className="text-lg font-semibold text-white mb-2">{t('nda_title')}</h3>
                    <div className="p-4 bg-slate-900 rounded-md h-48 overflow-y-auto border border-slate-600 text-slate-300 text-sm">
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
                    onClick={handleSignAndArchive} 
                    disabled={!isFormValid()} 
                    className="mt-6 w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-700 disabled:bg-sky-800 disabled:text-slate-400 disabled:cursor-not-allowed rounded-md font-semibold text-white transition-colors"
                >
                    {t('sign_and_activate')}
                </button>
                <p className="text-xs text-slate-500 text-center mt-2">A JSON file with your signature log will be downloaded for your records.</p>
            </div>
        </div>
    );
};