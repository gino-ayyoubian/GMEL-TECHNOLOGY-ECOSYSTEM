
import { UserRole, View } from '../types';

// Capability-Based Access Control (CBAC)
export type Capability = 
    | 'VIEW_DASHBOARD'
    | 'VIEW_IP_ROADMAP'
    | 'VIEW_FINANCIALS'
    | 'VIEW_TECHNICAL'
    | 'VIEW_STRATEGIC'
    | 'VIEW_GENERATIVE'
    | 'EDIT_GENERATIVE'
    | 'EXPORT_DATA'
    | 'MANAGE_ACCESS'
    | 'VIEW_AUDIT_LOGS';

const ROLE_CAPABILITIES: Record<UserRole, Capability[]> = {
    admin: [
        'VIEW_DASHBOARD', 'VIEW_IP_ROADMAP', 'VIEW_FINANCIALS', 'VIEW_TECHNICAL', 
        'VIEW_STRATEGIC', 'VIEW_GENERATIVE', 'EDIT_GENERATIVE', 'EXPORT_DATA', 'MANAGE_ACCESS', 'VIEW_AUDIT_LOGS'
    ],
    manager: [
        'VIEW_DASHBOARD', 'VIEW_IP_ROADMAP', 'VIEW_FINANCIALS', 'VIEW_TECHNICAL', 
        'VIEW_STRATEGIC', 'VIEW_GENERATIVE', 'EDIT_GENERATIVE', 'VIEW_AUDIT_LOGS'
    ],
    team: [
        'VIEW_DASHBOARD', 'VIEW_IP_ROADMAP', 'VIEW_FINANCIALS', 'VIEW_TECHNICAL', 
        'VIEW_STRATEGIC', 'VIEW_GENERATIVE', 'EDIT_GENERATIVE'
    ],
    client: [
        'VIEW_DASHBOARD', 'VIEW_IP_ROADMAP', 'VIEW_FINANCIALS', 'VIEW_TECHNICAL'
    ],
    member: [
        'VIEW_DASHBOARD', 'VIEW_IP_ROADMAP', 'VIEW_TECHNICAL', 'VIEW_STRATEGIC'
    ],
    guest: [
        'VIEW_DASHBOARD', 'VIEW_IP_ROADMAP'
    ]
};

// Map old "Views" to required Capabilities for backward compatibility with Sidebar logic
const VIEW_CAPABILITY_MAP: Record<View, Capability> = {
    dashboard: 'VIEW_DASHBOARD',
    ip: 'VIEW_IP_ROADMAP',
    financials: 'VIEW_FINANCIALS',
    technical: 'VIEW_TECHNICAL',
    benchmark: 'VIEW_STRATEGIC',
    site: 'VIEW_STRATEGIC',
    comparison: 'VIEW_STRATEGIC',
    tech_comparison: 'VIEW_TECHNICAL',
    simulations: 'VIEW_STRATEGIC',
    strategy_modeler: 'VIEW_STRATEGIC',
    correspondence: 'EDIT_GENERATIVE',
    proposal_generator: 'EDIT_GENERATIVE',
    image: 'VIEW_GENERATIVE',
    video: 'VIEW_GENERATIVE',
    chat: 'VIEW_DASHBOARD', // Everyone with dashboard access can chat
    contact: 'VIEW_DASHBOARD', // Public
    access_control: 'MANAGE_ACCESS',
    audit_logs: 'VIEW_AUDIT_LOGS'
};

/**
 * Checks if a user has a specific capability.
 */
export const checkCapability = (role: UserRole | null, capability: Capability): boolean => {
    if (!role) return false;
    return ROLE_CAPABILITIES[role]?.includes(capability) || false;
};

/**
 * Legacy helper for Sidebar navigation visibility.
 * Maps a View to a Capability check.
 */
export const hasPermission = (role: UserRole | null, view: View): boolean => {
    if (!role) return false;
    // Public pages
    if (view === 'contact') return true; 
    
    const requiredCap = VIEW_CAPABILITY_MAP[view];
    if (!requiredCap) return false;
    
    return checkCapability(role, requiredCap);
};

/**
 * Helper for UI elements (buttons) that modify state.
 * Usually requires 'EDIT_GENERATIVE' or specific write access.
 */
export const canEdit = (role: UserRole | null, view: View): boolean => {
    if (!role) return false;
    if (role === 'admin' || role === 'manager' || role === 'team') return true;
    return false;
};
