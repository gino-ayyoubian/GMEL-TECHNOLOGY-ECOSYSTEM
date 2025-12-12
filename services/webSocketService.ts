
import { getFinancialData } from '../constants';
import { Region } from '../types';

type Listener = (data: any) => void;

class WebSocketService {
    private listeners: Record<string, Listener[]> = {};
    private intervalId: any = null;
    private currentRegion: Region | null = null;

    /**
     * Simulates connecting to a WebSocket for a specific region.
     */
    connect(region: Region) {
        // If already connected to this region, do nothing
        if (this.currentRegion === region && this.intervalId) return;
        
        // If connected to a different region, disconnect first
        this.disconnect();
        
        this.currentRegion = region;
        console.log(`[WS] Connected to live stream for ${region}`);
        
        // Simulate live data updates every 3 seconds
        this.intervalId = setInterval(() => {
            this.emitMockUpdate();
        }, 3000);
    }

    /**
     * Disconnects the simulated socket.
     */
    disconnect() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.currentRegion = null;
        console.log('[WS] Disconnected');
    }

    subscribe(event: string, callback: Listener) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    unsubscribe(event: string, callback: Listener) {
        if (!this.listeners[event]) return;
        this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }

    private emitMockUpdate() {
        if (!this.currentRegion) return;

        const baseData = getFinancialData(this.currentRegion);
        
        // Create variations for specific metrics
        const updates = baseData.map(item => {
            // Fluctuate values by +/- 1-3%
            // ROI and Payback fluctuate less than Revenue/CAPEX
            const volatility = (item.id === 'roi' || item.id === 'payback') ? 0.01 : 0.03;
            const variance = (Math.random() - 0.5) * volatility;
            
            let newValue = item.value * (1 + variance);
            
            // Ensure logical rounding
            if (item.id === 'payback') newValue = Number(newValue.toFixed(1));
            else newValue = Number(newValue.toFixed(1));

            return {
                id: item.id,
                value: newValue
            };
        });

        this.notify('financial_update', updates);
    }

    private notify(event: string, data: any) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(cb => cb(data));
        }
    }
}

export const wsService = new WebSocketService();
