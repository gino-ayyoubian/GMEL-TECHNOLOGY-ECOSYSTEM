
import React, { useState, useEffect, useContext } from 'react';
import { AuditService } from '../../services/auditService';
import { AuditLogEntry } from '../../types';
import { useI18n } from '../../hooks/useI18n';
import { AppContext } from '../../contexts/AppContext';

export const AuditLogViewer: React.FC = () => {
    const { t } = useI18n();
    const { userRole } = useContext(AppContext)!;
    const [logs, setLogs] = useState<AuditLogEntry[]>([]);

    const refreshLogs = () => {
        setLogs(AuditService.getLogs());
    };

    useEffect(() => {
        refreshLogs();
    }, []);

    const handleClearLogs = () => {
        if (confirm('Are you sure you want to clear the audit logs? This action cannot be undone.')) {
            AuditService.clearLogs();
            refreshLogs();
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">{t('audit_log_title')}</h1>
                <div className="flex gap-2">
                    <button 
                        onClick={refreshLogs} 
                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors text-sm font-medium"
                    >
                        Refresh
                    </button>
                    {userRole === 'admin' && (
                        <button 
                            onClick={handleClearLogs} 
                            className="px-4 py-2 bg-red-900/50 hover:bg-red-800/50 text-red-200 rounded-lg transition-colors text-sm font-medium border border-red-800"
                        >
                            Clear Logs
                        </button>
                    )}
                </div>
            </div>

            <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-700">
                        <thead className="bg-slate-900/50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">{t('timestamp')}</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">{t('user')}</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">{t('action')}</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">{t('status')}</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">{t('details')}</th>
                            </tr>
                        </thead>
                        <tbody className="bg-slate-800 divide-y divide-slate-700">
                            {logs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500 text-sm">
                                        No audit logs found.
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log, index) => (
                                    <tr key={index}