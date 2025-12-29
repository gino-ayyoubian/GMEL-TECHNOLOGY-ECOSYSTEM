
import React, { useState, useEffect, useContext } from 'react';
import { AuditService } from '../../services/auditService';
import { AuditLogEntry } from '../../src/types';
import { useI18n } from '../../src/hooks/useI18n';
import { AppContext } from '../../src/contexts/AppContext';

export const AuditLogViewer: React.FC = () => {
    const { t } = useI18n();
    const { userRole } = useContext(AppContext)!;
    const [logs, setLogs] = useState<AuditLogEntry[]>([]);
    const [filter, setFilter] = useState('');

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

    const filteredLogs = logs.filter(log => 
        log.user.toLowerCase().includes(filter.toLowerCase()) || 
        log.action.toLowerCase().includes(filter.toLowerCase()) ||
        (log.details && log.details.toLowerCase().includes(filter.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h1 className="text-3xl font-bold text-white">{t('audit_log_title')}</h1>
                <div className="flex gap-2 w-full md:w-auto">
                    <input 
                        type="text" 
                        placeholder="Filter user, action..." 
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 w-full md:w-64"
                    />
                    <button 
                        onClick={refreshLogs} 
                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors text-sm font-medium whitespace-nowrap"
                    >
                        Refresh
                    </button>
                    {userRole === 'admin' && (
                        <button 
                            onClick={handleClearLogs} 
                            className="px-4 py-2 bg-red-900/50 hover:bg-red-800/50 text-red-200 rounded-lg transition-colors text-sm font-medium border border-red-800 whitespace-nowrap"
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
                            {filteredLogs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500 text-sm">
                                        No audit logs found.
                                    </td>
                                </tr>
                            ) : (
                                filteredLogs.map((log, index) => (
                                    <tr key={index} className="hover:bg-slate-700/50 transition-colors border-b border-slate-700/50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300 font-mono text-xs">{new Date(log.timestamp).toLocaleString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-medium">{log.user}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-sky-400">{log.action}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                log.status === 'SUCCESS' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                                {log.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-400 truncate max-w-xs" title={log.details}>
                                            {log.details || '-'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
