
import { USER_CREDENTIALS } from '../constants';
import { UserRole, Region } from '../types';
import { AuditService } from './auditService';

interface User {
    password: string;
    role: UserRole;
    regions?: Region[];
    isActive: boolean;
}

interface LoginResult {
    success: boolean;
    userRole?: UserRole;
    regions?: Region[];
    error?: string;
    token?: string;
}

// Initialize in-memory user store from constants
// In a real app, this would be a database
const usersStore: Record<string, User> = Object.entries(USER_CREDENTIALS).reduce((acc, [key, val]) => {
    acc[key] = { ...val, isActive: true };
    return acc;
}, {} as Record<string, User>);

const activeSessions: Map<string, string> = new Map(); // token -> userId
const verificationCodes: Map<string, string> = new Map(); // userId -> code

export const AuthService = {
    login: (userId: string, password: string): Promise<LoginResult> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const user = usersStore[userId];
                
                if (user && user.isActive && user.password === password) {
                    const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
                    activeSessions.set(token, userId);
                    
                    AuditService.log(userId, 'LOGIN', 'User logged in successfully');
                    resolve({
                        success: true,
                        userRole: user.role,
                        regions: user.regions,
                        token
                    });
                } else {
                    AuditService.log(userId || 'unknown', 'LOGIN_ATTEMPT', user && !user.isActive ? 'Account deactivated' : 'Invalid credentials', 'FAILURE');
                    resolve({
                        success: false,
                        error: 'Invalid credentials or account inactive.'
                    });
                }
            }, 500);
        });
    },

    logout: (token: string) => {
        if (token) {
            const userId = activeSessions.get(token);
            if (userId) {
                AuditService.log(userId, 'LOGOUT', 'User logged out');
            }
            activeSessions.delete(token);
        }
    },

    send2FACode: (userId: string): string => {
        // In reality, this would send an SMS or Email
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        verificationCodes.set(userId, code);
        console.log(`[DEV ONLY] 2FA Code for ${userId}: ${code}`);
        return code;
    },

    verify2FACode: (userId: string, code: string): boolean => {
        const validCode = verificationCodes.get(userId);
        if (validCode === code) {
            verificationCodes.delete(userId);
            return true;
        }
        return false;
    },

    getUsers: () => {
        return Object.entries(usersStore).map(([id, user]) => ({
            id,
            role: user.role,
            isActive: user.isActive,
            regions: user.regions
        }));
    },

    updateUserRole: (adminUser: string, targetUserId: string, newRole: UserRole) => {
        if (usersStore[targetUserId]) {
            usersStore[targetUserId].role = newRole;
            AuditService.log(adminUser, 'UPDATE_ROLE', `Changed ${targetUserId} role to ${newRole}`);
            return true;
        }
        return false;
    },

    toggleUserStatus: (adminUser: string, targetUserId: string) => {
        if (usersStore[targetUserId]) {
            usersStore[targetUserId].isActive = !usersStore[targetUserId].isActive;
            const status = usersStore[targetUserId].isActive ? 'Active' : 'Inactive';
            AuditService.log(adminUser, 'UPDATE_STATUS', `Changed ${targetUserId} status to ${status}`);
            return true;
        }
        return false;
    },

    resetPassword: (userId: string, newPassword: string) => {
        if (usersStore[userId]) {
            usersStore[userId].password = newPassword;
            AuditService.log(userId, 'PASSWORD_RESET', 'Password reset successfully');
            return true;
        }
        return false;
    }
};
