import React, { useState, useEffect, useContext } from 'react';
import { useI18n } from '../hooks/useI18n';
import { AppContext } from '../contexts/AppContext';

// Stepper component for visual progress
const Stepper: React.FC<{ currentStep: number }> = ({ currentStep }) => {
    const { t } = useI18n();
    const steps = [t('step_1_title'), t('step_2_title'), t('step_3_title'), t('step_4_title')];

    return (
        <div className="flex items-center justify-center">
            {steps.map((step, index) => {
                const stepNumber = index + 1;
                const isCompleted = currentStep > stepNumber;
                const isActive = currentStep === stepNumber;

                return (
                    <React.Fragment key={step}>
                        <div className="flex items-center">
                            <div className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
                                isCompleted ? 'bg-teal-500' : isActive ? 'bg-sky-500' : 'bg-slate-700'
                            }`}>
                                {isCompleted ? (
                                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                ) : (
                                    <span className="font-bold text-white">{stepNumber}</span>
                                )}
                            </div>
                            <p className={`mx-3 text-sm font-medium ${isActive || isCompleted ? 'text-white' : 'text-slate-500'}`}>{step}</p>
                        </div>
                        {stepNumber < steps.length && <div className="flex-auto border-t-2 border-slate-700 mx-4" />}
                    </React.Fragment>
                );
            })}
        </div>
    );
};

export const AccessControl: React.FC = () => {
    const { t } = useI18n();
    const { grantAccess } = useContext(AppContext)!;
    const [step, setStep] = useState(1);

    // Step 1 State
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [userId, setUserId] = useState(`user-${Math.random().toString(36).substring(2, 9)}`);
    const [idFile, setIdFile] = useState<File | null>(null);
    const [livenessVideo, setLivenessVideo] = useState(false);

    // Step 2 State
    const [isVerifying, setIsVerifying] = useState(false);
    const [isVerified, setIsVerified] = useState(false);

    // Step 3 State
    const [ndaAgreed, setNdaAgreed] = useState(false);
    
    // Step 4 State
    const [signatureProof, setSignatureProof] = useState('');


    useEffect(() => {
        if (step === 2 && !isVerified) {
            setIsVerifying(true);
            const timer = setTimeout(() => {
                setIsVerifying(false);
                setIsVerified(true);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [step, isVerified]);

    const handleSign = () => {
        // This is a simplified hash function for demonstration. 
        // In a real app, use a proper crypto library like SHA-256.
        const simpleHash = (s: string) => {
            let hash = 0;
            for (let i = 0; i < s.length; i++) {
                const char = s.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash; // Convert to 32bit integer
            }
            return `0x${Math.abs(hash).toString(16)}`;
        }
        
        const proof = {
            "signer_id": userId,
            "signer_name": fullName,
            "signer_email": email,
            "document_details": {
                "document_id": `NDA-GMEL-${new Date().getFullYear()}-001`,
                "document_hash": simpleHash(t('nda_body')),
                "agreement_text": t('nda_body')
            },
            "verification_details": {
                "id_document_hash": idFile ? simpleHash(idFile.name + idFile.size) : null,
                "liveness_check_passed": livenessVideo,
                "kyc_provider": "GMEL-SecureKYC (Simulated)",
                "verification_timestamp_utc": new Date().toISOString()
            },
            "signature_details": {
                "signature_method": "GMEL-SecureSign (Electronic Consent)",
                "timestamp_utc": new Date().toISOString(),
                "ip_address": "79.1.2.3", // Simulated IP
                "user_agent": navigator.userAgent
            },
            "legal_traceability": {
                "evidence_package_id": `sig-${simpleHash(userId + new Date().toISOString())}`,
                "notarization_tx_id": `anchor_tx_${simpleHash(Math.random().toString())}`
            }
        };
        
        const proofString = JSON.stringify(proof, null, 2);
        
        setSignatureProof(proofString);

        setStep(4);
    };

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-white text-center">{t('access_control_title')}</h1>
            <p className="text-slate-400 max-w-3xl text-center mx-auto">{t('access_control_description')}</p>

            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                <Stepper currentStep={step} />
            </div>

            <div className="bg-slate-800 p-8 rounded-lg border border-slate-700 min-h-[30rem] flex items-center justify-center">
                {step === 1 && (
                    <div className="w-full max-w-lg space-y-6">
                        <h2 className="text-xl font-semibold text-white text-center">{t('step_1_title')}</h2>
                        <div>
                            <label htmlFor="fullName" className="block text-sm font-medium text-slate-300">{t('full_name')}</label>
                            <input type="text" id="fullName" value={fullName} onChange={e => setFullName(e.target.value)} placeholder={t('full_name_placeholder')} className="mt-1 block w-full bg-slate-700 border-slate-600 rounded-md text-slate-200" />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-300">{t('email_address')}</label>
                            <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={t('email_address_placeholder')} className="mt-1 block w-full bg-slate-700 border-slate-600 rounded-md text-slate-200" />
                        </div>
                        <div>
                            <label htmlFor="userId" className="block text-sm font-medium text-slate-300">{t('user_id')}</label>
                            <input type="text" id="userId" value={userId} readOnly className="mt-1 block w-full bg-slate-900 border-slate-600 rounded-md text-slate-400 cursor-not-allowed" />
                        </div>
                         <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="file-upload" className={`w-full flex flex-col items-center justify-center p-4 rounded-md cursor-pointer ${idFile ? 'bg-teal-600/50 border-teal-500' : 'bg-slate-700 hover:bg-slate-600 border-slate-600'} border transition-colors`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                    <span className="text-sm text-center text-white">{idFile ? t('file_chosen') : t('upload_id')}</span>
                                    <input id="file-upload" type="file" className="sr-only" onChange={e => setIdFile(e.target.files ? e.target.files[0] : null)} />
                                </label>
                            </div>
                            <div>
                                <button onClick={() => setLivenessVideo(true)} className={`w-full h-full flex flex-col items-center justify-center p-4 rounded-md ${livenessVideo ? 'bg-teal-600/50 border-teal-500' : 'bg-slate-700 hover:bg-slate-600 border-slate-600'} border transition-colors`}>
                                     <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                     <span className="text-sm text-center text-white">{livenessVideo ? t('video_recorded') : t('upload_liveness')}</span>
                                </button>
                            </div>
                        </div>
                        <button onClick={() => setStep(2)} disabled={!fullName || !email || !idFile || !livenessVideo} className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-700 disabled:bg-sky-800 disabled:text-slate-400 disabled:cursor-not-allowed rounded-md font-semibold text-white transition-colors">{t('next_step')}</button>
                    </div>
                )}
                {step === 2 && (
                    <div className="text-center">
                        <h2 className="text-xl font-semibold text-white mb-6">{t('step_2_title')}</h2>
                        {isVerifying ? (
                            <>
                                <svg className="animate-spin h-10 w-10 text-white mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                <p className="mt-4 text-slate-400">{t('verifying_identity')}</p>
                            </>
                        ) : (
                             <div className="w-full max-w-sm space-y-4">
                                <div className="p-4 rounded-lg bg-teal-500/20 text-teal-300 flex items-center gap-3">
                                    <svg className="w-6 h-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                    <span>{t('id_verified')}</span>
                                </div>
                                <div className="p-4 rounded-lg bg-teal-500/20 text-teal-300 flex items-center gap-3">
                                    <svg className="w-6 h-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                    <span>{t('liveness_passed')}</span>
                                </div>
                                <h3 className="text-lg font-bold text-white pt-4">{t('verification_successful')}</h3>
                                <button onClick={() => setStep(3)} className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-700 rounded-md font-semibold text-white transition-colors">{t('proceed_to_nda')}</button>
                            </div>
                        )}
                    </div>
                )}
                {step === 3 && (
                    <div className="w-full max-w-2xl">
                        <h2 className="text-xl font-semibold text-white text-center mb-4">{t('nda_title')}</h2>
                        <div className="p-4 bg-slate-900 rounded-md h-64 overflow-y-auto border border-slate-600 text-slate-300 text-sm">
                            <p className="whitespace-pre-wrap">{t('nda_body')}</p>
                            <div className="mt-4 pt-4 border-t border-slate-700 font-sans">
                                <p>{t('full_name')}: {fullName}</p>
                                <p>{t('user_id')}: {userId}</p>
                                <p>Date: {new Date().toLocaleDateString()}</p>
                            </div>
                        </div>
                        <div className="mt-6">
                            <label className="flex items-center cursor-pointer">
                                <input type="checkbox" checked={ndaAgreed} onChange={() => setNdaAgreed(!ndaAgreed)} className="h-4 w-4 rounded bg-slate-700 border-slate-600 text-sky-600 focus:ring-sky-500" />
                                <span className="mx-2 text-slate-300 select-none">{t('nda_agree')}</span>
                            </label>
                        </div>
                        <button onClick={handleSign} disabled={!ndaAgreed} className="mt-4 w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-700 disabled:bg-sky-800 disabled:text-slate-400 disabled:cursor-not-allowed rounded-md font-semibold text-white transition-colors">{t('sign_and_activate')}</button>
                    </div>
                )}
                 {step === 4 && (
                     <div className="w-full max-w-2xl text-center">
                        <h2 className="text-xl font-semibold text-white">{t('access_granted_title')}</h2>
                        <p className="mt-2 text-slate-400">{t('access_granted_message')}</p>
                        <div className="mt-6 text-left">
                            <label className="block text-sm font-medium text-slate-300">{t('signature_proof')}</label>
                            <textarea
                                readOnly
                                value={signatureProof}
                                rows={10}
                                className="mt-1 block w-full bg-slate-900 border-slate-600 rounded-md text-slate-400 text-xs font-mono"
                            />
                        </div>
                        <button onClick={grantAccess} className="mt-6 w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 rounded-md font-semibold text-white transition-colors">{t('enter_portal')}</button>
                    </div>
                )}
            </div>
        </div>
    );
};