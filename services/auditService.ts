
import { AuditLogEntry } from '../types';

const LOG_STORAGE_KEY = 'gmel_audit_logs';

export const AuditService = {
    log: (user: string, action: string, details?: string, status: 'SUCCESS' | 'FAILURE' = 'SUCCESS') => {
        const entry: AuditLogEntry = {
            timestamp: new Date().toISOString(),
            user,
            action,
            details,
            status
        };

        try {
            const existingLogsJson = sessionStorage.getItem(LOG_STORAGE_KEY);
            const logs: AuditLogEntry[] = existingLogsJson ? JSON.parse(existingLogsJson) : [];
            logs.unshift(entry); // Add new log to the beginning
            
            // Keep only the last 1000 logs to prevent storage overflow
            if (logs.length > 1000) {
                logs.length = 1000;
            }
            
            sessionStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(logs));
            console.debug(`[Audit] ${user} performed ${action}: ${status}`);
        } catch (e) {
            console.error("Failed to write audit log:", e);
        }
    },

    getLogs: (): AuditLogEntry[] => {
        try {
            const logs = sessionStorage.getItem(LOG_STORAGE_KEY);
            return logs ? JSON.parse(logs) : [];
        } catch (e) {
            return [];
        }
    },

    clearLogs: () => {
        sessionStorage.removeItem(LOG_STORAGE_KEY);
    }
};
