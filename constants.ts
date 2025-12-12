
import { Patent, FinancialData, Milestone, Region, UserRole, ThemeConfig, Language } from './types';

export const KKM_LOGO_DATA_URL = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHJ4PSI4IiBmaWxsPSIjRkZGRkZGIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaGyPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjI4IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0iIzBlYTVlOSI+S0tNPC90ZXh0Pjwvc3ZnPg==";

export const WATERMARK_TEXT = "All rights are retained by inventor Seyed Gino Ayyoubian and the KKM International Group. Any form of usage or exploitation in any manner is prohibited and subject to legal repercussions.";

// Standardized list of all supported regions
export const ALL_REGIONS: Region[] = [
    'Qeshm Free Zone', 
    'Makoo Free Zone', 
    'Chabahar Free Zone', 
    'Iranian Kurdistan', 
    'Mahabad', 
    'Kurdistan Region, Iraq', 
    'Oman', 
    'Saudi Arabia', 
    'United Arab Emirates', 
    'Qatar',
    'Iceland',
    'Turkey (Geothermal Belt)',
    'USA (Salton Sea)',
    'Germany (Bavaria)'
];

export const THEMES: Record<string, ThemeConfig> = {
    warm: {
        name: 'warm',
        primaryColor: 'orange',
        button: 'bg-orange-600',
        buttonHover: 'hover:bg-orange-700',
        textAccent: 'text-orange-400',
        borderAccent: 'border-orange-500',
        activeNav: 'bg-orange-600 text-white',
        chartColors: ['#ea580c', '#d97706', '#b45309', '#78350f', '#f59e0b']
    },
    cool: {
        name: 'cool',
        primaryColor: 'sky',
        button: 'bg-sky-600',
        buttonHover: 'hover:bg-sky-700',
        textAccent: 'text-sky-400',
        borderAccent: 'border-sky-500',
        activeNav: 'bg-sky-600 text-white',
        chartColors: ['#0ea5e9', '#0369a1', '#f97316', '#f59e0b', '#8b5cf6']
    },
    emerald: {
        name: 'emerald',
        primaryColor: 'emerald',
        button: 'bg-emerald-600',
        buttonHover: 'hover:bg-emerald-700',
        textAccent: 'text-emerald-400',
        borderAccent: 'border-emerald-500',
        activeNav: 'bg-emerald-600 text-white',
        chartColors: ['#059669', '#047857', '#10b981', '#34d399', '#065f46']
    }
};

export const REGION_THEME_MAP: Record<Region, string> = {
    'Qeshm Free Zone': 'warm',
    'Chabahar Free Zone': 'warm',
    'Oman': 'warm',
    'Saudi Arabia': 'warm',
    'United Arab Emirates': 'warm',
    'Qatar': 'warm',
    'Makoo Free Zone': 'cool',
    'Iceland': 'cool',
    'Turkey (Geothermal Belt)': 'warm',
    'USA (Salton Sea)': 'warm',
    'Germany (Bavaria)': 'emerald',
    'Iranian Kurdistan': 'emerald',
    'Mahabad': 'emerald',
    'Kurdistan Region, Iraq': 'emerald'
};

export const USER_CREDENTIALS: Record<string, { password: string, role: UserRole, regions?: Region[] }> = {
  'GMEL-KKM-Admin': { password: '84375690', role: 'admin' },
  'GMEL-KKM-Manager': { password: '287230', role: 'manager' },
  'GMEL-KKM-Partner': { password: 'Gmel-investors', role: 'partner', regions: ['Qeshm Free Zone', 'Makoo Free Zone', 'Kurdistan Region, Iraq', 'Oman', 'Iranian Kurdistan'] },
  'GMEL-KKM-Regulator': { password: 'compliance_auth', role: 'regulator' },
  'GMEL-KKM-Guest': { password: 'public_view', role: 'guest' }
};

export const locales: Record<Language, string> = {
    en: 'en-US',
    fa: 'fa-IR',
    ku: 'ckb-IQ',
    ar: 'ar-SA',
};

// --- Rev 2.0 Portfolio Data ---

export const CORE_PATENT: Patent = {
  level: 'Core',
  code: 'CLG-001',
  title: 'Closed-Loop Geothermal System',
  application: 'Multi-output system (Power, Water, H2, Li) using graphene nanofluid (0.5-2.0 wt%) in U-shaped wells (2600-3500m) with natural thermosiphon. LCOE < $35/MWh.',
  status: 'Priority Filing (Phase 1)',
  path: 'National Registration',
  kpi: 'Eff: 20.6% (Elec) / 95% (Thermal)',
  progress: 95,
};

export const PATENT_PORTFOLIO: Patent[] = [
  // --- Core / Derivatives ---
  { level: 'Derivatives', code: 'NS-Stab-001', title: 'Nanofluid Stabilization', application: 'Long-term stabilization device using rotating magnetic fields (0.3-0.8T) and ultrasonic excitation (40-60kHz), AI-controlled.', status: 'Priority Filing (Phase 1)', path: 'National Registration', kpi: 'Stability >98% for 18 months', progress: 90 },
  { level: 'Derivatives', code: 'EHS-002', title: 'Self-Powered IoT Sensor', application: 'Thermoelectric energy harvesting sensor node with edge AI for 10-year autonomous monitoring of wellbore conditions.', status: 'Priority Filing (Phase 1)', path: 'National Registration', kpi: '99% Accuracy, 10-Year Life', progress: 85 },
  
  // --- Applied (Commercialization) ---
  { level: 'Applied', code: 'H2C-004', title: 'Green Hydrogen Production', application: 'Thermochemical Cu-Cl cycle integrated with geothermal waste heat. Efficiency 55%, Output ~110 kg/h.', status: 'Phase 2 (Months 4-12)', path: 'National + PCT', kpi: 'Eff: 55% vs Industry 50%', progress: 70 },
  { level: 'Applied', code: 'LTH-005', title: 'Direct Lithium Extraction', application: 'Modified MnO2/NiO hybrid adsorbent system for high-recovery (>92%) lithium extraction from geothermal brine.', status: 'Phase 2 (Months 4-12)', path: 'National + PCT', kpi: 'Recovery > 92%', progress: 75 },
  { level: 'Applied', code: 'DES-006', title: 'Thermal Desalination', application: 'Multi-effect MED-TVCD system utilizing residual heat. Recovery 94%, LCOE $0.02/m³.', status: 'Phase 2 (Months 4-12)', path: 'National + PCT', kpi: 'LCOE $0.02/m³', progress: 80 },
  { level: 'Applied', code: 'AGR-007', title: 'Agricultural Heating', application: 'Smart greenhouse complex with closed-loop geothermal heating and AI climate control.', status: 'Phase 2', path: 'National', kpi: '+50% Crop Yield', progress: 60 },

  // --- Advanced / Strategic ---
  { level: 'Strategic', code: 'CCS-008', title: 'Carbon Capture & Storage', application: 'Simultaneous CO2 injection and storage in geothermal formations using deep closed loops.', status: 'Concept / Lab', path: 'Phase 3 (PCT)', kpi: '25k tons CO2/year', progress: 40 },
  { level: 'Strategic', code: 'SGR-009', title: 'Smart Grid Management', application: 'Federated learning network for distributed management of geothermal fleet output.', status: 'Concept', path: 'Phase 3', kpi: '30% Waste Reduction', progress: 35 },
  { level: 'Strategic', code: 'EGS-010', title: 'Enhanced Geothermal System', application: 'Controlled hydro-shearing/thermal stimulation to enhance permeability without induced seismicity risks.', status: 'Concept', path: 'Phase 3', kpi: '50 MWe Potential', progress: 30 },
  { level: 'Strategic', code: 'SCO2-011', title: 'sCO2 Power Cycle', application: 'Supercritical CO2 organic Rankine cycle hybrid for higher efficiency power conversion.', status: 'Concept', path: 'Phase 3', kpi: 'Eff > 25%', progress: 25 },
  { level: 'Strategic', code: 'QNT-012', title: 'Quantum Optimization', application: 'Quantum-assisted computing system for real-time wellbore trajectory and heat flow optimization.', status: 'Future', path: 'Phase 4', kpi: '99.9% Optimization Accuracy', progress: 15 },
  { level: 'Strategic', code: 'FED-013', title: 'Federated Fleet Learning', application: 'Distributed ML training across global GMEL plants to optimize maintenance and output models.', status: 'Future', path: 'Phase 4', kpi: '-50% Learning Time', progress: 20 },
  { level: 'Core', code: 'GMEL-CORE-014', title: 'Integrated Multi-Output Platform', application: 'The mother platform patent covering the integration of electricity, water, H2, Li, and agriculture subsystems.', status: 'Drafting', path: 'Umbrella Patent', kpi: 'Total System Integration', progress: 50 },
];

// Refined Financials based on Rev 2.0 (Lower LCOE implies better margins)
// Added 'id' field to all financial data for stable reference during translation
const FINANCIAL_DATA_QESHM: FinancialData[] = [
    { id: 'capex', component: 'Pilot CAPEX (5MW)', value: 550, unit: 'Billion Toman', description: 'Updated CAPEX based on Rev 2.0 efficiency gains.' },
    { id: 'revenue', component: 'Annual Revenue (5MW)', value: 410, unit: 'Billion Toman', description: 'Includes Power, Water, and Hydrogen sales.' },
    { id: 'payback', component: 'Payback Period', value: 1.8, unit: 'Years', description: 'Accelerated payback due to multi-output streams.' },
    { id: 'roi', component: 'Return on Investment (ROI)', value: 44.3, unit: 'Percent', description: 'Matches Portfolio ROI projection (5-year).' },
    { id: 'npv', component: '10-Year NPV', value: 3100, unit: 'Billion Toman', description: 'Strong long-term value.' },
];

const FINANCIAL_DATA_MAKOO: FinancialData[] = [
    { id: 'capex', component: 'Pilot CAPEX (5MW)', value: 560, unit: 'Billion Toman', description: 'Includes winterization for cold climate operations.' },
    { id: 'revenue', component: 'Annual Revenue (5MW)', value: 400, unit: 'Billion Toman', description: 'High value from heating and agriculture integration.' },
    { id: 'payback', component: 'Payback Period', value: 1.9, unit: 'Years', description: 'Fast return via dual electricity/heat sales.' },
    { id: 'roi', component: 'Return on Investment (ROI)', value: 42, unit: 'Percent', description: 'Strong ROI in cold-climate context.' },
    { id: 'npv', component: '10-Year NPV', value: 2950, unit: 'Billion Toman', description: 'Robust project value.' },
];

// Specific Data for Kurdistan Region, Iraq
const FINANCIAL_DATA_KURDISTAN_IRAQ: FinancialData[] = [
    { id: 'capex', component: 'Pilot CAPEX (5MW)', value: 640, unit: 'Billion Toman', description: 'Adjusted for mountainous logistics and infrastructure development.' },
    { id: 'revenue', component: 'Annual Revenue (5MW)', value: 495, unit: 'Billion Toman', description: 'High revenue from electricity (grid stability) and industrial heat.' },
    { id: 'payback', component: 'Payback Period', value: 1.6, unit: 'Years', description: 'Rapid return due to high local energy tariffs and demand.' },
    { id: 'roi', component: 'Return on Investment (ROI)', value: 49, unit: 'Percent', description: 'Exceptional ROI driven by dual-output efficiency.' },
    { id: 'npv', component: '10-Year NPV', value: 3550, unit: 'Billion Toman', description: 'Strategic long-term asset value in reconstruction zone.' },
];

// Specific Data for Iranian Kurdistan
const FINANCIAL_DATA_IRANIAN_KURDISTAN: FinancialData[] = [
    { id: 'capex', component: 'Pilot CAPEX (5MW)', value: 590, unit: 'Billion Toman', description: 'Optimized for local terrain; focus on Mahabad capabilities.' },
    { id: 'revenue', component: 'Annual Revenue (5MW)', value: 420, unit: 'Billion Toman', description: 'Revenue derived from AgriCells and district heating integration.' },
    { id: 'payback', component: 'Payback Period', value: 1.8, unit: 'Years', description: 'Competitive payback via agricultural synergies.' },
    { id: 'roi', component: 'Return on Investment (ROI)', value: 45, unit: 'Percent', description: 'Solid returns aligned with regional development goals.' },
    { id: 'npv', component: '10-Year NPV', value: 3150, unit: 'Billion Toman', description: 'Sustainable value creation for local community.' },
];

const FINANCIAL_DATA_GENERAL: FinancialData[] = [
    { id: 'capex', component: 'Pilot CAPEX (5MW)', value: 14, unit: 'Million USD', description: 'International standard cost for GMEL pilot.' },
    { id: 'revenue', component: 'Annual Revenue (5MW)', value: 9, unit: 'Million USD', description: 'Combined revenue streams.' },
    { id: 'payback', component: 'Payback Period', value: 2.1, unit: 'Years', description: 'Highly competitive payback.' },
    { id: 'roi', component: 'Return on Investment (ROI)', value: 43, unit: 'Percent', description: 'Consistent with global portfolio projections.' },
    { id: 'npv', component: '10-Year NPV', value: 95, unit: 'Million USD', description: 'Significant long-term generation.' },
];

export const getFinancialData = (region: Region): FinancialData[] => {
    switch (region) {
        case 'Qeshm Free Zone': return FINANCIAL_DATA_QESHM;
        case 'Chabahar Free Zone': return FINANCIAL_DATA_QESHM; // Similar coastal
        case 'Makoo Free Zone': return FINANCIAL_DATA_MAKOO;
        case 'Iranian Kurdistan': return FINANCIAL_DATA_IRANIAN_KURDISTAN; // Specific data
        case 'Mahabad': return FINANCIAL_DATA_IRANIAN_KURDISTAN; // Maps to Iranian Kurdistan data
        case 'Kurdistan Region, Iraq': return FINANCIAL_DATA_KURDISTAN_IRAQ; // Specific data
        case 'Oman': return FINANCIAL_DATA_GENERAL;
        case 'Saudi Arabia': return FINANCIAL_DATA_GENERAL;
        case 'United Arab Emirates': return FINANCIAL_DATA_GENERAL;
        case 'Qatar': return FINANCIAL_DATA_GENERAL;
        default: return FINANCIAL_DATA_GENERAL;
    }
};


export const PROJECT_MILESTONES: Milestone[] = [
  { title: 'Phase 1: Immediate Action', date: 'Months 1-3', status: 'In Progress', description: 'Filing National Patents for Core (CLG), Stabilization (NS-Stab), and Sensors (EHS). COMSOL Simulations.' },
  { title: 'Phase 2: Commercial Layer', date: 'Months 4-12', status: 'Planned', description: 'Filing Applied Patents (H2, Li, Desalination). 100-hour Lab Pilot Test. ISI Paper submission.' },
  { title: 'Phase 3: International Expansion', date: 'Months 13-18', status: 'Planned', description: 'PCT Applications for 12 key patents. Licensing negotiations with target partners (Shell, Eni).' },
  { title: 'Phase 4: Final & Commercial', date: 'Months 19-24', status: 'Planned', description: 'US/EPO National Phase entry. 50MW Pilot Commercialization. Final Licensing Deals.' },
];

export const getProjectSummaryPrompt = (region: Region, lang: Language): string => {
    return `Generate a concise, one-paragraph project summary in ${lang} for the GMEL geothermal project targeting ${region}. The summary should be grounded in the "Rev 2.0" portfolio specifications (14 patents, closed-loop, multi-output). Highlight how GMEL's key features (LCOE <$35/MWh, 20.6% efficiency, integrated Lithium/Hydrogen) align with the specific opportunities in ${region}. The tone should be suitable for an executive briefing.`;
};
