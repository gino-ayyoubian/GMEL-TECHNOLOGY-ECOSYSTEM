
import React, { useState, useContext, useEffect, useRef } from 'react';
import { generateGroundedText, generateMapsGroundedText } from '../services/geminiService';
import { AppContext } from '../contexts/AppContext';
import { useI18n } from '../hooks/useI18n';
import { SpeakerIcon } from './shared/SpeakerIcon';
import { Feedback } from './shared/Feedback';
import { Region } from '../types';

// Declare Leaflet's global 'L' to TypeScript
declare var L: any;

const regionCoordinates: Record<Region, [number, number]> = {
    'Qeshm Free Zone': [26.9581, 56.2718],
    'Makoo Free Zone': [39.3330, 44.5160],
    // FIX: Added missing 'Iranian Kurdistan' to the region coordinates map.
    'Iranian Kurdistan': [36.7633, 45.7201], // Mahabad
    'Kurdistan Region, Iraq': [36.1911, 44.0094], // Coordinates for Erbil
    'Oman': [23.5859, 58.3816], // Coordinates for Muscat
    'Saudi Arabia': [24.7136, 46.6753] // Coordinates for Riyadh
};

const infrastructurePoints: Partial<Record<Region, { lat: number; lng: number; name: string; description: string; type: string }[]>> = {
    'Qeshm Free Zone': [
        { lat: 26.7550, lng: 55.9989, name: 'Qeshm International Airport', description: 'Provides air logistics for personnel and high-value cargo.', type: 'airport' },
        { lat: 27.1492, lng: 56.3228, name: 'Shahid Bahonar Port', description: 'Major commercial port near Bandar Abbas, key for logistics and equipment import/export.', type: 'port' },
        { lat: 26.9536, lng: 56.2642, name: 'Qeshm Gas Power Plant', description: 'Existing power infrastructure, potential grid connection point.', type: 'grid' },
    ],
    'Makoo Free Zone': [
        { lat: 39.3994, lng: 44.4289, name: 'Makoo Airport', description: 'Supports regional travel and light cargo.', type: 'airport' },
        { lat: 39.4101, lng: 44.3853, name: 'Bazargan Border Crossing', description: 'Crucial trade gateway to Turkey and Europe.', type: 'transport' },
        { lat: 39.3000, lng: 44.5000, name: 'Makoo Industrial Town', description: 'Potential consumer of direct geothermal heat and power.', type: 'industrial' },
    ],
    'Kurdistan Region, Iraq': [
        { lat: 36.2375, lng: 43.9631, name: 'Erbil International Airport', description: 'Primary international gateway for the region.', type: 'airport' },
        { lat: 36.1400, lng: 43.9500, name: 'Erbil Gas Power Plant', description: 'Major node in the regional power grid.', type: 'grid' },
        { lat: 36.1911, lng: 44.0094, name: 'Erbil City Center', description: 'Central hub for transport routes 2 and 3.', type: 'transport' },
    ],
    'Oman': [
        { lat: 23.5880, lng: 58.3842, name: 'Muscat International Airport', description: 'Main air hub for Oman.', type: 'airport' },
        { lat: 17.017, lng: 54.092, name: 'Port of Salalah', description: 'Major transshipment hub on the Arabian Sea.', type: 'port' },
        { lat: 21.431, lng: 59.431, name: 'Duqm Industrial Zone', description: 'Key area for industrial growth and potential energy demand.', type: 'industrial'},
    ],
    'Saudi Arabia': [
        { lat: 26.370, lng: 49.988, name: 'King Fahd International Airport', description: 'Major airport serving the Eastern Province.', type: 'airport'},
        { lat: 26.476, lng: 50.151, name: 'King Abdulaziz Port (Dammam)', description: 'Main port on the Persian Gulf.', type: 'port'},
        { lat: 28.305, lng: 34.832, name: 'NEOM Project Area', description: 'Giga-project with massive demand for sustainable energy.', type: 'industrial'},
    ]
};


export const SiteAnalysis: React.FC = () => {
    const { region } = useContext(AppContext)!;
    const { t } = useI18n();
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<any>(null); // To hold the map instance
    const markerRef = useRef<any>(null); // To hold the region marker instance
    const userMarkerRef = useRef<any>(null); // To hold user location marker
    const infrastructureLayerRef = useRef<any>(null); // To hold infrastructure markers

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
            
            mapRef.current.on('locationfound', (e: any) => {
                if (userMarkerRef.current) {
                    mapRef.current.removeLayer(userMarkerRef.current);
                }
                userMarkerRef.current = L.marker(e.latlng).addTo(mapRef.current)
                    .bindPopup("You are here.")
                    .openPopup();
            });

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
            
            // Add infrastructure markers
            if (infrastructureLayerRef.current) {
                infrastructureLayerRef.current.clearLayers();
            } else {
                infrastructureLayerRef.current = L.layerGroup().addTo(mapRef.current);
            }

            const points = infrastructurePoints[region];
            if (points) {
                points.forEach(point => {
                    const popupContent = `<b>${point.name}</b><br>${point.description}`;
                    L.marker([point.lat, point.lng])
                        .addTo(infrastructureLayerRef.current)
                        .bindPopup(popupContent);
                });
            }
        }
    }, [region]);

    const handleGenerate = async () => {
        setIsLoading(true);
        setError(null);
        setAnalysis({text: '', sources: []});

        try {
            const analysisPrompt = t('site_analysis_prompt', { region });
            const analysisResult = await generateMapsGroundedText(analysisPrompt);
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
                           <path fillRule="evenodd" d="M10.022 1.13a.5.5 0 0 0-.044 0l-8.5 3a.5.5 0 0 0 .022.976l8.5-3a.5.5 0 0 0 .022-.976zM10 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm0 1a7 7 0 1 1 0 14 7 7 0 0 1 0-14zm-8.478 3.403a.5.5 0 0 0-.022.976l8.5 3a.5.5 0 0 0 .478-.022l8.5-3a.5.5 0 0 0-.022-.976l-8.5 3a.5.5 0 0 0-.456 0l-8.5-3z" clipRule="evenodd"/>
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
                                            {analysis.sources.map((chunk: any, i: number) => {
                                                if (chunk.maps?.uri) {
                                                    return (
                                                        <li key={`map-source-${i}`}>
                                                            <a href={chunk.maps.uri} target="_blank" rel="noopener noreferrer" className="hover:text-sky-400 hover:underline">
                                                                {chunk.maps.title || 'Google Maps Source'}
                                                            </a>
                                                        </li>
                                                    );
                                                }
                                                if (chunk.maps?.placeAnswerSources) {
                                                    return chunk.maps.placeAnswerSources.map((source: any, j: number) => 
                                                        source.reviewSnippets?.map((snippet: any, k: number) => (
                                                             <li key={`review-${i}-${j}-${k}`}>
                                                                <a href={snippet.uri} target="_blank" rel="noopener noreferrer" className="hover:text-sky-400 hover:underline">
                                                                    {snippet.title || 'Review Snippet'}
                                                                </a>: "{snippet.content}"
                                                            </li>
                                                        ))
                                                    );
                                                }
                                                return null;
                                            })}
                                        </ul>
                                    </div>
                                )}
                                 <Feedback sectionId={`site-analysis-${region}`} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
