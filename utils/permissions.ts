import { UserRole, View } from '../types';

type AccessLevel = 'full' | 'view' | 'none';

const PERMISSIONS: Record<UserRole, Record<View, AccessLevel>> = {
    admin: {
        dashboard: 'full',
        ip: 'full',
        financials: 'full',
        technical: 'full',
        benchmark: 'full',
        site: 'full',
        comparison: 'full',
        tech_comparison: 'full',
        simulations: 'full',
        strategy_modeler: 'full',
        correspondence: 'full',
        proposal_generator: 'full',
        image: 'full',
        video: 'full',
        chat: 'full',
        contact: 'full',
    },
    manager: {
        dashboard: 'full',
        ip: 'full',
        financials: 'full',
        technical: 'full',
        benchmark: 'full',
        site: 'full',
        comparison: 'full',
        tech_comparison: 'full',
        simulations: 'full',
        strategy_modeler: 'full',
        correspondence: 'full',
        proposal_generator: 'full',
        image: 'full',
        video: 'full',
        chat: 'full',
        contact: 'full',
    },
    guest: {
        dashboard: 'view',
        ip: 'view',
        financials: 'none',
        technical: 'none',
        benchmark: 'none',
        site: 'none',
        comparison: 'none',
        tech_comparison: 'none',
        simulations: 'none',
        strategy_modeler: 'none',
        correspondence: 'none',
        proposal_generator: 'none',
        image: 'none',
        video: 'none',
        chat: 'none',
        contact: 'full',
    },
    member: {
        dashboard: 'full',
        ip: 'full',
        financials: 'view',
        technical: 'full',
        benchmark: 'full',
        site: 'full',
        comparison: 'full',
        tech_comparison: 'full',
        simulations: 'view',
        strategy_modeler: 'view',
        correspondence: 'view',
        proposal_generator: 'view',
        image: 'view',
        video: 'view',
        chat: 'full',
        contact: 'full',
    },
    team: {
        dashboard: 'full',
        ip: 'full',
        financials: 'full',
        technical: 'full',
        benchmark: 'full',
        site: 'full',
        comparison: 'full',
        tech_comparison: 'full',
        simulations: 'view',
        strategy_modeler: 'view',
        correspondence: 'full',
        proposal_generator: 'view',
        image: 'full',
        video: 'full',
        chat: 'full',
        contact: 'full',
    },
    client: {
        dashboard: 'view',
        ip: 'view',
        financials: 'view',
        technical: 'view',
        benchmark: 'view',
        site: 'view',
        comparison: 'view',
        tech_comparison: 'view',
        simulations: 'none',
        strategy_modeler: 'none',
        correspondence: 'none',
        proposal_generator: 'none',
        image: 'view',
        video: 'view',
        chat: 'view',
        contact: 'full',
    },
};

export const hasPermission = (role: UserRole | null, view: View): boolean => {
    if (!role) {
        return false;
    }
    const access = PERMISSIONS[role]?.[view] || 'none';
    return access !== 'none';
};

export const canEdit = (role: UserRole | null, view: View): boolean => {
    if (!role) {
        return false;
    }
    const access = PERMISSIONS[role]?.[view] || 'none';
    return access === 'full';
}