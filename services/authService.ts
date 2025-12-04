
import { USER_CREDENTIALS } from '../constants';
import { UserRole, Region } from '../types';
import { AuditService } from './auditService';

interface LoginResult {
    success: boolean;
    userRole?: UserRole;
    regions?: Region[];
    error?: string;
}

export const AuthService = {
    login: (userId: string, password: string): Promise<LoginResult> => {
        return new Promise((resolve) => {
            // Simulate network delay
            setTimeout(() => {
                const credentials = USER_CREDENTIALS[userId];
                
                if (credentials && credentials.password === password) {
                    AuditService.log(userId, 'LOGIN', 'User logged in successfully');
                    resolve({
                        success: true,
                        userRole: credentials.role,
                        regions: credentials.regions as Region[]
                    });
                } else {
                    AuditService.log(userId || 'unknown', 'LOGIN_ATTEMPT', 'Invalid credentials', 'FAILURE');
                    resolve({
                        success: false,
                        error: 'Invalid credentials.'
                    });
                }
            }, 500);
        });
    }
};
