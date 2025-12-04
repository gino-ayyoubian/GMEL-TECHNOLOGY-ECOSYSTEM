
export interface Patent {
  level: 'Core' | 'Derivatives' | 'Applied' | 'Strategic';
  code: string;
  title: string;
  application: string;
  status: string;
  path: string;
  kpi?: string;
  progress: number;
}

export interface FinancialData {
  component: string;
  value: number;
  unit: string;
  description: string;
}

export interface Milestone {
  title: string;
  date: string;
  status: 'Completed' | 'In Progress' | 'Planned';
  description: string;
}

export type Region = 
  | 'Qeshm Free Zone' 
  | 'Makoo Free Zone' 
  | 'Chabahar Free Zone' 
  | 'Iranian Kurdistan' 
  | 'Mahabad' 
  | 'Kurdistan Region, Iraq' 
  | 'Oman' 
  | 'Saudi Arabia' 
  | 'United Arab Emirates' 
  | 'Qatar'
  | 'Iceland'
  | 'Turkey (Denizli/Aydin)'
  | 'USA (California\'s Salton Sea)'
  | 'Germany (Bavaria)';

export type UserRole = 'admin' | 'manager' | 'guest' | 'member' | 'team' | 'client';

export interface ThemeConfig {
    name: string;
    primaryColor: string;
    button: string;
    buttonHover: string;
    textAccent: string;
    borderAccent: string;
    activeNav: string;
    chartColors: string[];
}

export interface ChatMessage {
    role: 'user' | 'model';
    text: string;
}

export type View = 'dashboard' | 'ip' | 'financials' | 'technical' | 'benchmark' | 'site' | 'comparison' | 'tech_comparison' | 'simulations' | 'strategy_modeler' | 'correspondence' | 'proposal_generator' | 'image' | 'video' | 'chat' | 'contact' | 'access_control' | 'audit_logs';

export interface AuditLogEntry {
    timestamp: string;
    user: string;
    action: string;
    details?: string;
    status: 'SUCCESS' | 'FAILURE';
}
