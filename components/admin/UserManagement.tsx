
import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../contexts/AppContext';
import { AuthService } from '../../services/authService';
import { UserRole } from '../../types';
import { useI18n } from '../../hooks/useI18n';
import { ShieldCheck, UserCog, Ban, CheckCircle } from 'lucide-react';

export const UserManagement: React.FC = () => {
    const { currentUser, userRole, setError } = useContext(AppContext)!;
    const { t } = useI18n();
    const [users, setUsers] = useState<any[]>([]);
    const [editingUser, setEditingUser] = useState<string | null>(null);
    const [newRole, setNewRole] = useState<UserRole>('guest');

    if (userRole !== 'admin') {
        return <div className="text-center text-red-400 p-10">Access Denied</div>;
    }

    const refreshUsers = () => {
        setUsers(AuthService.getUsers());
    };

    useEffect(() => {
        refreshUsers();
    }, []);

    const handleRoleChange = (userId: string, role: UserRole) => {
        const success = AuthService.updateUserRole(currentUser!, userId, role);
        if (success) {
            refreshUsers();
            setEditingUser(null);
        } else {
            setError("Failed to update user role.");
        }
    };

    const handleStatusToggle = (userId: string) => {
        if (userId === currentUser) {
            alert("You cannot deactivate your own account.");
            return;
        }
        const success = AuthService.toggleUserStatus(currentUser!, userId);
        if (success) refreshUsers();
    };

    const handleResetPassword = (userId: string) => {
        if (confirm(`Reset password for ${userId} to default 'password123'?`)) {
            AuthService.resetPassword(userId, 'password123');
            alert(`Password for ${userId} reset to 'password123'.`);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <UserCog className="w-8 h-8 text-sky-400" />
                    User Access Management
                </h1>
                <p className="text-slate-400 mt-2">Manage enterprise accounts, roles, and security status.</p>
            </div>

            <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-800">
                        <thead className="bg-slate-800/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">User ID</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">Current Role</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">Regions</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-slate-300 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50 bg-transparent">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs ${user.role === 'admin' ? 'bg-sky-500/20 text-sky-400' : 'bg-slate-700 text-slate-300'}`}>
                                                {user.id.substring(0, 2)}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-white">{user.id}</div>
                                                {user.id === currentUser && <span className="text-[10px] text-green-400 bg-green-900/30 px-1.5 py-0.5 rounded">You</span>}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {editingUser === user.id ? (
                                            <div className="flex items-center gap-2">
                                                <select 
                                                    value={newRole} 
                                                    onChange={(e) => setNewRole(e.target.value as UserRole)}
                                                    className="bg-slate-800 border border-slate-600 rounded text-xs text-white p-1"
                                                >
                                                    <option value="admin">Admin</option>
                                                    <option value="manager">Manager</option>
                                                    <option value="partner">Partner</option>
                                                    <option value="regulator">Regulator</option>
                                                    <option value="guest">Guest</option>
                                                </select>
                                                <button onClick={() => handleRoleChange(user.id, newRole)} className="text-green-400 hover:text-green-300"><CheckCircle className="w-4 h-4" /></button>
                                                <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-slate-300">X</button>
                                            </div>
                                        ) : (
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 
                                                  user.role === 'manager' ? 'bg-blue-100 text-blue-800' : 
                                                  user.role === 'partner' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-800'}`}>
                                                {user.role}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {user.isActive ? (
                                            <span className="text-xs text-green-400 flex items-center gap-1"><div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div> Active</span>
                                        ) : (
                                            <span className="text-xs text-red-400 flex items-center gap-1"><div className="w-2 h-2 bg-red-500 rounded-full"></div> Inactive</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-xs text-slate-400">
                                        {user.regions ? user.regions.length + ' Regions' : 'All Access'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button 
                                            onClick={() => { setEditingUser(user.id); setNewRole(user.role); }} 
                                            className="text-sky-400 hover:text-sky-300 mr-4 disabled:opacity-50"
                                            disabled={!user.isActive}
                                        >
                                            Edit Role
                                        </button>
                                        <button 
                                            onClick={() => handleResetPassword(user.id)} 
                                            className="text-amber-400 hover:text-amber-300 mr-4 disabled:opacity-50"
                                            disabled={!user.isActive}
                                        >
                                            Reset PW
                                        </button>
                                        <button 
                                            onClick={() => handleStatusToggle(user.id)} 
                                            className={`${user.isActive ? 'text-red-400 hover:text-red-300' : 'text-green-400 hover:text-green-300'}`}
                                            disabled={user.id === currentUser}
                                        >
                                            {user.isActive ? 'Deactivate' : 'Activate'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
