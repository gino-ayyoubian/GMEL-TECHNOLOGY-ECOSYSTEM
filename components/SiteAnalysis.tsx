import React, { useState, useContext, useEffect, useRef } from 'react';
import { generateMapsGroundedText, generateJsonData } from '../services/geminiService';
import { AppContext } from '../contexts/AppContext';
import { useI18n } from '../hooks/useI18n';
import { SpeakerIcon } from './shared/SpeakerIcon';
import { Feedback } from './shared/Feedback';
import { Region } from '../types';

// Declare Leaflet's global 'L' to TypeScript
declare var L: any;

interface InfrastructurePoint {
    lat: number;
    lng: number;
    name: string;
    description: string;
    type: string;
    link?: string;
}

const regionCoordinates: Record<Region, [number, number]> = {
    'Qeshm Free Zone': [26.9581, 56.2718],
    'Makoo Free Zone': [39.3330, 44.5160],
    'Kurdistan Region, Iraq': [36.1911, 44.0094],
    'Oman': [23.5859, 58.3816],
    'Saudi Arabia': [24.7136, 46.6753]
};

const infrastructurePoints: Partial<Record<Region, InfrastructurePoint[]>> = {
    'Qeshm Free Zone': [
        { lat: 26.7550, lng: 55.9989, name: 'Qeshm International Airport', description: 'Provides air logistics for personnel and high-value cargo.', type: 'airport', link: 'https://www.google.com/maps?q=26.7550,55.9989' },
        { lat: 27.1492, lng: 56.3228, name: 'Shahid Bahonar Port', description: 'Major commercial port near Bandar Abbas, key for logistics and equipment import/export.', type: 'port', link: 'https://www.google.com/maps?q=27.1492,56.3228' },
        { lat: 26.9536, lng: 56.2642, name: 'Qeshm Gas Power Plant', description: 'Existing power infrastructure, potential grid connection point.', type: 'grid', link: 'https://www.google.com/maps?q=26.9536,56.2642' },
    ],
    'Makoo Free Zone': [
        { lat: 39.3994, lng: 44.4289, name: 'Makoo Airport', description: 'Supports regional travel and light cargo.', type: 'airport', link: 'https://www.google.com/maps?q=39.3994,44.4289' },
        { lat: 39.4101, lng: 44.3853, name: 'Bazargan Border Crossing', description: 'Crucial trade gateway to Turkey and Europe.', type: 'transport', link: 'https://www.google.com/maps?q=39.4101,44.3853' },
        { lat: 39.3000, lng: 44.5000, name: 'Makoo Industrial Town', description: 'Potential consumer of direct geothermal heat and power.', type: 'industrial', link: 'https://www.google.com/maps?q=39.3000,44.5000' },
    ],
    'Kurdistan Region, Iraq': [
        { lat: 36.2375, lng: 43.9631, name: 'Erbil International Airport', description: 'Primary international gateway for the region.', type: 'airport', link: 'https://www.google.com/maps?q=36.2375,43.9631' },
        { lat: 36.1400, lng: 43.9500, name: 'Erbil Gas Power Plant', description: 'Major node in the regional power grid.', type: 'grid', link: 'https://www.google.com/maps?q=36.1400,43.9500' },
        { lat: 36.1911, lng: 44.0094, name: 'Erbil City Center', description: 'Central hub for transport routes 2 and 3.', type: 'transport', link: 'https://www.google.com/maps?q=36.1911,44.0094' },
    ],
    'Oman': [
        { lat: 23.5880, lng: 58.3842, name: 'Muscat International Airport', description: 'Main air hub for Oman.', type: 'airport', link: 'https://www.google.com/maps?q=23.5880,58.3842' },
        { lat: 17.017, lng: 54.092, name: 'Port of Salalah', description: 'Major transshipment hub on the Arabian Sea.', type: 'port', link: 'https://www.google.com/maps?q=17.017,54.092' },
        { lat: 21.431, lng: 59.431, name: 'Duqm Industrial Zone', description: 'Key area for industrial growth and potential energy demand.', type: 'industrial', link: 'https://www.google.com/maps?q=21.431,59.431' },
    ],
    'Saudi Arabia': [
        { lat: 26.370, lng: 49.988, name: 'King Fahd International Airport', description: 'Major airport serving the Eastern Province.', type: 'airport', link: 'https://www.google.com/maps?q=26.370,49.988' },
        { lat: 26.476, lng: 50.151, name: 'King Abdulaziz Port (Dammam)', description: 'Main port on the Persian Gulf.', type: 'port', link: 'https://www.google.com/maps?q=26.476,50.151' },
        { lat: 28.305, lng: 34.832, name: 'NEOM Project Area', description: 'Giga-project with massive demand for sustainable energy.', type: 'industrial', link: 'https://www.google.com/maps?q=28.305,34.832' },
    ]
};


export const SiteAnalysis: React.FC = () => {
    const { region } = useContext(AppContext)!;
    const { t } = useI18n();
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<any>(null);
    const markerRef = useRef<any>(null);
    const userMarkerRef = useRef<any>(null);
    const infrastructureLayerRef = useRef<any>(null);
    const heatmapLayerRef = useRef<any>(null);
    const heatmapMarkersLayerRef = useRef<any>(null); // For hover tooltips
    const legendRef = useRef<any>(null);

    const [analysis, setAnalysis] = useState<{text: string; sources: any[]}>({text: '', sources: []});
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isHeatmapLoading, setIsHeatmapLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    
    const [activeLayer, setActiveLayer] = useState<'infrastructure' | 'heatmap'>('infrastructure');
    const [heatmapData, setHeatmapData] = useState<[number, number, number][] | null>(null);

    const fetchHeatmapData = async () => {
        setIsHeatmapLoading(true);
        setError(null);
        try {
            const heatmapPrompt = t('site_heatmap_prompt', { region });
            const result = await generateJsonData(heatmapPrompt);
            setHeatmapData(result);
        } catch (e: any) {
            setError(e.message || "Failed to generate heatmap data.");
        } finally {
            setIsHeatmapLoading(false);
        }
    };

    // Map initialization
    useEffect(() => {
        if (mapContainerRef.current && !mapRef.current) {
            mapRef.current = L.map(mapContainerRef.current).setView(regionCoordinates[region], 10);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(mapRef.current);
            
            mapRef.current.on('locationfound', (e: any) => {
                if (userMarkerRef.current) mapRef.current.removeLayer(userMarkerRef.current);
                userMarkerRef.current = L.marker(e.latlng).addTo(mapRef.current).bindPopup("You are here.").openPopup();
            });
            mapRef.current.on('locationerror', (e: any) => alert(`Location error: ${e.message}`));

            legendRef.current = L.control({position: 'bottomright'});
            legendRef.current.onAdd = function () {
                const div = L.DomUtil.create('div', 'info legend');
                div.innerHTML = `
                    <div class="bg-slate-800 p-2 rounded-md border border-slate-600">
                        <h4 class="font-bold text-xs text-white">${t('heatmap_legend_title')}</h4>
                        <div class="flex items-center gap-2 mt-1">
                            <span class="text-xs text-slate-400">${t('legend_low')}</span>
                            <div class="w-16 h-2 rounded-full" style="background: linear-gradient(to right, blue, cyan, lime, yellow, red);"></div>
                            <span class="text-xs text-slate-400">${t('legend_high')}</span>
                        </div>
                    </div>
                `;
                return div;
            };
        }
        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []);

    // Region change effect
    useEffect(() => {
        if (mapRef.current) {
            mapRef.current.setView(regionCoordinates[region], 10);

            if (markerRef.current) mapRef.current.removeLayer(markerRef.current);
            markerRef.current = L.marker(regionCoordinates[region]).addTo(mapRef.current).bindPopup(`<b>${region}</b>`).openPopup();
            
            if (infrastructureLayerRef.current) infrastructureLayerRef.current.clearLayers();
            else infrastructureLayerRef.current = L.layerGroup().addTo(mapRef.current);

            const points = infrastructurePoints[region];
            if (points) {
                points.forEach(point => {
                    const popupContent = `<b>${point.name}</b><br>${point.description}` + (point.link ? `<br><a href="${point.link}" target="_blank" rel="noopener noreferrer" style="color: #0ea5e9; text-decoration: underline;">View on Map</a>` : '');
                    L.marker([point.lat, point.lng]).addTo(infrastructureLayerRef.current).bindPopup(popupContent);
                });
            }
            
            setHeatmapData(null);
            if (heatmapLayerRef.current) {
                mapRef.current.removeLayer(heatmapLayerRef.current);
                heatmapLayerRef.current = null;
            }
            if (heatmapMarkersLayerRef.current) {
                mapRef.current.removeLayer(heatmapMarkersLayerRef.current);
                heatmapMarkersLayerRef.current = null;
            }
            setActiveLayer('infrastructure');
        }
    }, [region]);

    // Layer visibility effect
    useEffect(() => {
        if (!mapRef.current) return;
    
        if (activeLayer === 'infrastructure') {
            if (heatmapLayerRef.current) mapRef.current.removeLayer(heatmapLayerRef.current);
            if (heatmapMarkersLayerRef.current) mapRef.current.removeLayer(heatmapMarkersLayerRef.current);
            if (legendRef.current) mapRef.current.removeControl(legendRef.current);
            if (infrastructureLayerRef.current) infrastructureLayerRef.current.addTo(mapRef.current);
        } else { // heatmap
            if (infrastructureLayerRef.current) mapRef.current.removeLayer(infrastructureLayerRef.current);
            
            if (heatmapData && heatmapData.length > 0) {
                if (heatmapLayerRef.current) mapRef.current.removeLayer(heatmapLayerRef.current);
                heatmapLayerRef.current = L.heatLayer(heatmapData, { radius: 25, maxZoom: 12 }).addTo(mapRef.current);
                if (legendRef.current) legendRef.current.addTo(mapRef.current);

                // Add invisible markers for hover tooltips
                if (heatmapMarkersLayerRef.current) mapRef.current.removeLayer(heatmapMarkersLayerRef.current);
                heatmapMarkersLayerRef.current = L.layerGroup();
                heatmapData.forEach(([lat, lng, intensity]) => {
                    L.circleMarker([lat, lng], {
                        radius: 10, // Hover target size
                        fillOpacity: 0,
                        stroke: false,
                    })
                    .bindTooltip(`<b>Intensity:</b> ${intensity.toFixed(3)}<br><b>Coords:</b> ${lat.toFixed(4)}, ${lng.toFixed(4)}`)
                    .addTo(heatmapMarkersLayerRef.current);
                });
                heatmapMarkersLayerRef.current.addTo(mapRef.current);
            }
        }
    }, [activeLayer, heatmapData]);

    const handleGenerateAnalysis = async () => {
        setIsLoading(true);
        setError(null);
        setAnalysis({text: '', sources: []});
        try {
            const analysisPrompt = t('site_analysis_prompt', { region });
            const result = await generateMapsGroundedText(analysisPrompt);
            if (result.text) setAnalysis(result);
            else throw new Error(t('error_failed_analysis'));
        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSwitchLayer = (layer: 'infrastructure' | 'heatmap') => {
        if (layer === 'heatmap' && !heatmapData && !isHeatmapLoading) {
            fetchHeatmapData();
        }
        setActiveLayer(layer);
    };

    return (
        <div className="space-y-8 flex flex-col h-full">
            <h1 className="text-3xl font-bold text-white">{t('site_analysis_title')}</h1>
            <p className="text-slate-400 max-w-3xl">{t('site_analysis_description', { region })}</p>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-grow min-h-0">
                <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 flex flex-col relative">
                     <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-white">{t('generated_map_title', { region })}</h2>
                        <div className="flex items-center gap-1 bg-slate-900 border border-slate-700 p-1 rounded-lg">
                           <button onClick={() => handleSwitchLayer('infrastructure')} title="Infrastructure" className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${activeLayer === 'infrastructure' ? 'bg-sky-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}>Infrastructure</button>
                           <button onClick={() => handleSwitchLayer('heatmap')} title="Geothermal Gradient" className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${activeLayer === 'heatmap' ? 'bg-sky-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}>Heatmap</button>
                        </div>
                     </div>
                     <div ref={mapContainerRef} className="w-full h-full min-h-[400px] rounded-lg z-0"></div>
                     <button onClick={() => mapRef.current?.locate({setView: true, maxZoom: 13})} title="Find my location" className="absolute top-[72px] right-6 z-10 p-2 bg-slate-700 text-white rounded-md shadow-lg hover:bg-slate-600 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10.022 1.13a.5.5 0 0 0-.044 0l-8.5 3a.5.5 0 0 0 .022.976l8.5-3a.5.5 0 0 0 .022-.976zM10 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm0 1a7 7 0 1 1 0 14 7 7 0 0 1 0-14zm-8.478 3.403a.5.5 0 0 0-.022.976l8.5 3a.5.5 0 0 0 .478-.022l8.5-3a.5.5 0 0 0-.022-.976l-8.5 3a.5.5 0 0 0-.456 0l-8.5-3z" clipRule="evenodd"/></svg>
                     </button>
                </div>
                
                <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 flex flex-col">
                    <button onClick={handleGenerateAnalysis} disabled={isLoading} className="mb-4 w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-sky-600 hover:bg-sky-700 disabled:bg-sky-400">
                        {isLoading ? t('generating_analysis') : t('generate_site_analysis')}
                    </button>

                    <div className="overflow-y-auto flex-grow">
                        {(isLoading || isHeatmapLoading) && (
                            <div className="flex items-center justify-center h-full">
                                <div className="text-center">
                                    <svg className="animate-spin h-8 w-8 text-white mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    <p className="mt-4 text-slate-400">{isLoading ? t('generating_analysis') : 'Generating heatmap data...'}</p>
                                </div>
                            </div>
                        )}
                        {error && <p className="text-red-400 text-center">{error}</p>}
                        {analysis.text && !isLoading && !isHeatmapLoading && (
                             <div>
                                <h2 className="text-xl font-semibold text-white mb-4 flex items-center">{t('geographical_analysis')} <SpeakerIcon text={analysis.text} /></h2>
                                <p className="text-slate-300 whitespace-pre-wrap">{analysis.text}</p>
                                {analysis.sources.length > 0 && (
                                    <div className="mt-4">
                                        <h4 className="text-sm font-semibold text-slate-400">{t('sources')}:</h4>
                                        <ul className="list-disc list-inside mt-2 text-xs text-slate-500 space-y-1">
                                            {analysis.sources.map((chunk: any, i: number) => (chunk.maps?.uri && (
                                                <li key={`map-source-${i}`}>
                                                    <a href={chunk.maps.uri} target="_blank" rel="noopener noreferrer" className="hover:text-sky-400 hover:underline">{chunk.maps.title || 'Google Maps Source'}</a>
                                                </li>
                                            )))}
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