import React, { useState, useEffect } from 'react';
import { useI18n } from '../hooks/useI18n';

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
                            <p className={`ml-3 text-sm font-medium ${isActive || isCompleted ? 'text-white' : 'text-slate-500'}`}>{step}</p>
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
    const [signatureProof, setSignatureProof] = useState<string | null>(null);

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
        const proof = {
            document_id: `NDA-GMEL-${new Date().getFullYear()}-001`,
            document_hash: "faked-sha256-hash-for-the-nda-document-text",
            signer_id: userId,
            signer_name: fullName,
            signer_email: email,
            id_document: { type: "passport", number: "A1234567" },
            kyc_method: "TrustedKYC (Simulated)",
            liveness_result: true,
            signature_method: "TrustedSign (Simulated)",
            timestamp_utc: new Date().toISOString(),
            ip_address: "79.1.2.3",
            user_agent: navigator.userAgent,
            notarization_proof: `anchor_tx_0x${Math.random().toString(16).substring(2, 12)}`
        };
        setSignatureProof(JSON.stringify(proof, null, 2));
        setStep(4);
    };
    
    const resetProcess = () => {
        setStep(1);
        setFullName('');
        setEmail('');
        setUserId(`user-${Math.random().toString(36).substring(2, 9)}`);
        setIdFile(null);
        setLivenessVideo(false);
        setIsVerified(false);
        setNdaAgreed(false);
        setSignatureProof(null);
    }

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-white">{t('access_control_title')}</h1>
            <p className="text-slate-400 max-w-3xl">{t('access_control_description')}</p>

            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                <Stepper currentStep={step} />
            </div>

            <div className="bg-slate-800 p-8 rounded-lg border border-slate-700 min-h-[30rem]">
                {step === 1 && (
                    <div className="max-w-lg mx-auto space-y-6">
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
                        <div>
                            <label className="block text-sm font-medium text-slate-300">{t('upload_id')}</label>
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-600 border-dashed rounded-md">
                               <div className="space-y-1 text-center">
                                 <svg className="mx-auto h-12 w-12 text-slate-500" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></svg>
                                 <p className="text-xs text-slate-500">{idFile ? `${t('file_chosen')}: ${idFile.name}` : 'PNG, JPG up to 10MB'}</p>
                                 <input id="file-upload" type="file" className="sr-only" onChange={e => setIdFile(e.target.files ? e.target.files[0] : null)} />
                               </div>
                            </div>
                        </div>
                         <button onClick={() => setLivenessVideo(true)} className={`w-full py-2 px-4 rounded-md font-semibold text-white ${livenessVideo ? 'bg-teal-600' : 'bg-slate-600 hover:bg-slate-500'}`}>{livenessVideo ? t('video_recorded') : t('upload_liveness')}</button>
                        <button onClick={() => setStep(2)} disabled={!fullName || !email || !idFile || !livenessVideo} className="w-full py-2 px-4 bg-sky-600 hover:bg-sky-700 disabled:bg-sky-800 disabled:text-slate-400 disabled:cursor-not-allowed rounded-md font-semibold text-white">{t('next_step')}</button>
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
                             <div className="max-w-sm mx-auto space-y-4">
                                <div className="p-4 rounded-lg bg-teal-500/20 text-teal-300 flex items-center gap-3">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                    <span>{t('id_verified')}</span>
                                </div>
                                <div className="p-4 rounded-lg bg-teal-500/20 text-teal-300 flex items-center gap-3">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                    <span>{t('liveness_passed')}</span>
                                </div>
                                <h3 className="text-lg font-bold text-white pt-4">{t('verification_successful')}</h3>
                                <button onClick={() => setStep(3)} className="w-full py-2 px-4 bg-sky-600 hover:bg-sky-700 rounded-md font-semibold text-white">{t('proceed_to_nda')}</button>
                            </div>
                        )}
                    </div>
                )}
                {step === 3 && (
                    <div className="max-w-2xl mx-auto">
                        <h2 className="text-xl font-semibold text-white text-center mb-4">{t('nda_title')}</h2>
                        <div className="p-4 bg-slate-900 rounded-md h-64 overflow-y-auto border border-slate-600 text-slate-300 text-sm whitespace-pre-wrap font-mono">
                            {t('nda_body')}
                            <p className="mt-4">{fullName}</p>
                            <p>{userId}</p>
                            <p>{new Date().toLocaleString()}</p>
                        </div>
                        <div className="mt-6">
                            <label className="flex items-center">
                                <input type="checkbox" checked={ndaAgreed} onChange={() => setNdaAgreed(!ndaAgreed)} className="h-4 w-4 rounded bg-slate-700 border-slate-600 text-sky-600 focus:ring-sky-500" />
                                <span className="ml-2 text-slate-300">{t('nda_agree')}</span>
                            </label>
                        </div>
                        <button onClick={handleSign} disabled={!ndaAgreed} className="mt-4 w-full py-2 px-4 bg-sky-600 hover:bg-sky-700 disabled:bg-sky-800 disabled:text-slate-400 disabled:cursor-not-allowed rounded-md font-semibold text-white">{t('sign_and_activate')}</button>
                    </div>
                )}
                 {step === 4 && (
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-teal-400">{t('access_granted_title')}</h2>
                        <p className="mt-2 text-slate-400">{t('access_granted_message')}</p>
                        <div className="mt-6 max-w-2xl mx-auto text-left">
                            <label className="block text-sm font-medium text-slate-300">{t('signature_proof')}</label>
                            <pre className="mt-1 p-4 bg-slate-900 rounded-md h-64 overflow-y-auto border border-slate-600 text-slate-300 text-xs font-mono">
                                {signatureProof}
                            </pre>
                        </div>
                        <button onClick={resetProcess} className="mt-6 py-2 px-6 bg-slate-600 hover:bg-slate-500 rounded-md font-semibold text-white">{t('return_to_dashboard')}</button>
                    </div>
                )}
            </div>
        </div>
    );
};