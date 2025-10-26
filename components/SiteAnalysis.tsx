import React, { useState, useContext, useEffect, useRef } from 'react';
import { generateGroundedText } from '../services/geminiService';
import { AppContext } from '../contexts/AppContext';
import { useI18n } from '../hooks/useI18n';
import { SpeakerIcon } from './shared/SpeakerIcon';
import { Region } from '../types';

// Declare Leaflet's global 'L' to TypeScript
declare var L: any;

const regionCoordinates: Record<Region, [number, number]> = {
    'Qeshm Free Zone': [26.9581, 56.2718],
    'Makoo Free Zone': [39.3330, 44.5160]
};

export const SiteAnalysis: React.FC = () => {
    const { region } = useContext(AppContext)!;
    const { t } = useI18n();
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<any>(null); // To hold the map instance
    const markerRef = useRef<any>(null); // To hold the region marker instance

    const [analysis, setAnalysis] = useState<{text: string; sources: any[]}>({text: '', sources: []});
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Map initialization
    useEffect(() => {
        if (mapContainerRef.current && !mapRef.current) {
            mapRef.current = L.map(mapContainerRef.current).setView(regionCoordinates[region], 10);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(mapRef.current);
            
             mapRef.current.on('locationerror', (e: any) => {
                alert(`Location error: ${e.message}`);
            });
        }

        // Cleanup function to remove map on component unmount
        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []); // Run only once

    // Map updates when region changes
    useEffect(() => {
        if (mapRef.current) {
            mapRef.current.setView(regionCoordinates[region], 10);

            if (markerRef.current) {
                mapRef.current.removeLayer(markerRef.current);
            }
            markerRef.current = L.marker(regionCoordinates[region]).addTo(mapRef.current)
                .bindPopup(`<b>${region}</b>`)
                .openPopup();
        }
    }, [region]);

    const handleGenerate = async () => {
        setIsLoading(true);
        setError(null);
        setAnalysis({text: '', sources: []});

        try {
            const analysisPrompt = t('site_analysis_prompt', { region });
            const analysisResult = await generateGroundedText(analysisPrompt);
            if (analysisResult.text) {
                setAnalysis(analysisResult);
            } else {
                 throw new Error(t('error_failed_analysis'));
            }
        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLocate = () => {
        if (mapRef.current) {
            mapRef.current.locate({setView: true, maxZoom: 13});
             mapRef.current.on('locationfound', (e: any) => {
                L.marker(e.latlng).addTo(mapRef.current)
                .bindPopup("You are here.")
                .openPopup();
            });
        }
    };

    return (
        <div className="space-y-8 flex flex-col h-full">
            <h1 className="text-3xl font-bold text-white">{t('site_analysis_title')}</h1>
            <p className="text-slate-400 max-w-3xl">
                {t('site_analysis_description', { region })}
            </p>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-grow min-h-0">
                {/* Map Container */}
                <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 flex flex-col relative">
                     <h2 className="text-xl font-semibold text-white mb-4">{t('generated_map_title', { region })}</h2>
                     <div ref={mapContainerRef} className="w-full h-full min-h-[400px] rounded-lg z-0"></div>
                     <button onClick={handleLocate} title="Find my location" className="absolute top-20 right-6 z-10 p-2 bg-slate-700 text-white rounded-md shadow-lg hover:bg-slate-600 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                           <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                           <path fillRule="evenodd" d="M.458 10C.026 9.485 0 8.868 0 8.236c0-1.42.796-2.67 2-3.418V3a1 1 0 011-1h1.5a1 1 0 011 1v1.018a4.996 4.996 0 015 0V3a1 1 0 011-1H13a1 1 0 011 1v1.818c1.204.748 2 1.998 2 3.418 0 .632-.026 1.25-.458 1.764l-4.99 4.99a1 1 0 01-1.414 0L.458 10zM12 8.236c0-.632.026-1.25.458-1.764L10 3.586 7.542 6.472c.432.514.458 1.132.458 1.764a2 2 0 104 0z" clipRule="evenodd" />
                        </svg>
                     </button>
                </div>
                
                {/* Analysis Container */}
                <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 flex flex-col">
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading}
                        className="mb-4 w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-sky-400 disabled:cursor-not-allowed"
                    >
                        {isLoading ? t('generating_analysis') : t('generate_site_analysis')}
                    </button>

                    <div className="overflow-y-auto flex-grow">
                        {isLoading && (
                            <div className="flex items-center justify-center h-full">
                                <div className="text-center">
                                    <svg className="animate-spin h-8 w-8 text-white mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <p className="mt-4 text-slate-400">{t('generating_analysis')}</p>
                                </div>
                            </div>
                        )}
                        
                        {error && <p className="text-red-400 text-center">{error}</p>}

                        {analysis.text && (
                             <div>
                                <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                                    {t('geographical_analysis')}
                                    <SpeakerIcon text={analysis.text} />
                                </h2>
                                 <p className="text-slate-300 whitespace-pre-wrap">{analysis.text}</p>
                                 {analysis.sources.length > 0 && (
                                    <div className="mt-4">
                                        <h4 className="text-sm font-semibold text-slate-400">{t('sources')}:</h4>
                                        <ul className="list-disc list-inside mt-2 text-xs text-slate-500 space-y-1">
                                        {analysis.sources.map((source, i) => (
                                            <li key={i}>
                                                <a href={source.web?.uri} target="_blank" rel="noopener noreferrer" className="hover:text-sky-400 hover:underline">
                                                    {source.web?.title || source.web?.uri}
                                                </a>
                                            </li>
                                        ))}
                                        </ul>
                                    </div>
                                 )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};