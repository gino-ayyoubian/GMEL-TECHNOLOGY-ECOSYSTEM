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

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface Milestone {
  title:string;
  date: string;
  status: 'Completed' | 'In Progress' | 'Planned';
  description: string;
}

export type Region = 'Qeshm Free Zone' | 'Makoo Free Zone' | 'Kurdistan Region, Iraq';

export type View = 'dashboard' | 'ip' | 'financials' | 'technical' | 'benchmark' | 'image' | 'video' | 'chat' | 'site' | 'comparison' | 'correspondence' | 'tech_comparison' | 'simulations' | 'strategy_modeler' | 'proposal_generator';