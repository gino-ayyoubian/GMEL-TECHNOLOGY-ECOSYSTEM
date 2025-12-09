
import { UserRole, View } from '../types';

export type AccessLevel = 'full' | 'view' | 'none';

const PERMISSIONS: Record<UserRole, Partial<Record<View, AccessLevel>>> = {
    admin: {
        dashboard: 'full', ip: 'full', financials: 'full', technical: 'full',
        benchmark: 'full', site: 'full', comparison: 'full', tech_comparison: 'full',
        simulations: 'full', strategy_modeler: 'full', correspondence: 'full',
        proposal_generator: 'full', image: 'full', video: 'full',
        chat: 'full', contact: 'full', access_control: 'full', audit_logs: 'full',
        user_management: 'full'
    },
    manager: {
        dashboard: 'view', ip: 'view', financials: 'full', technical: 'full',
        benchmark: 'full', site: 'full', comparison: 'full', tech_comparison: 'full',
        simulations: 'full', strategy_modeler: 'full', correspondence: 'full',
        proposal_generator: 'full', image: 'full', video: 'full',
        chat: 'full', contact: 'full', access_control: 'none', audit_logs: 'view',
        user_management: 'none'
    },
    partner: {
        dashboard: 'view', ip: 'none', financials: 'view', technical: 'none',
        benchmark: 'view', site: 'view', comparison: 'view', tech_comparison: 'view',
        simulations: 'none', strategy_modeler: 'none', correspondence: 'none',
        proposal_generator: 'none', image: 'view', video: 'none',
        chat: 'full', contact: 'full', access_control: 'none', audit_logs: 'none',
        user_management: 'none'
    },
    regulator: {
        dashboard: 'view', ip: 'view', financials: 'none', technical: 'view',
        benchmark: 'view', site: 'view', comparison: 'none', tech_comparison: 'view',
        simulations: 'none', strategy_modeler: 'none', correspondence: 'none',
        proposal_generator: 'none', image: 'none', video: 'none',
        chat: 'full', contact: 'full', access_control: 'none', audit_logs: 'none',
        user_management: 'none'
    },
    guest: {
        dashboard: 'view', ip: 'view', financials: 'none', technical: 'none',
        benchmark: 'none', site: 'none', comparison: 'none', tech_comparison: 'none',
        simulations: 'none', strategy_modeler: 'none', correspondence: 'none',
        proposal_generator: 'none', image: 'none', video: 'none',
        chat: 'full', contact: 'full', access_control: 'none', audit_logs: 'none',
        user_management: 'none'
    }
};

export const getAccessLevel = (role: UserRole | null, view: View): AccessLevel => {
    if (!role) return 'none';
    // Public pages are always accessible
    if (view === 'contact') return 'full';
    
    return PERMISSIONS[role]?.[view] || 'none';
};

export const hasPermission = (role: UserRole | null, view: View): boolean => {
    const level = getAccessLevel(role, view);
    return level !== 'none';
};

export const canEdit = (role: UserRole | null, view: View): boolean => {
    const level = getAccessLevel(role, view);
    return level === 'full';
};
