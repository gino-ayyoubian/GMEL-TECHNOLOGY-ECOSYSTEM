import { Patent, FinancialData, Milestone, Region, UserRole } from './types';
import { Language } from './hooks/useI18n';

export const KKM_LOGO_DATA_URL = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHJ4PSI4IiBmaWxsPSIjRkZGRkZGIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaGyPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjI4IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0iIzBlYTVlOSI+S0tNPC90ZXh0Pjwvc3ZnPg==";

export const WATERMARK_TEXT = "All rights are retained by inventor Seyed Gino Ayyoubian and the KKM International Group. Any form of usage or exploitation in any manner is prohibited and subject to legal repercussions.";

// NOTE: The following data is updated to reflect the "Ultimate Optimized Version (2025)" of the GMEL project.

export const USER_CREDENTIALS: Record<string, { password: string, role: UserRole, regions?: Region[] }> = {
  'GMEL-kkm-admin': { password: '84375690', role: 'admin' },
  'GMEL-kkm-manager': { password: '287230', role: 'manager' },
  'GMEL-kkm-guest': { password: 'kkmguest_public', role: 'guest' },
  'GMEL-kkm-member': { password: '4691', role: 'member' },
  'GMEL-kkm-team': { password: '8666', role: 'team' },
  'GMEL-kkm-client': { password: 'client_gmel_2025', role: 'client', regions: ['Qeshm Free Zone', 'Makoo Free Zone'] },
  'GMEL-kkm-client-oman': { password: 'clientoman_gmel_25', role: 'client', regions: ['Oman'] }
};


export const CORE_PATENT: Patent = {
  level: 'Core',
  code: 'GMEL-CLG',
  title: 'Closed-loop Geothermal',
  application: 'Core system integrating superhot rock drilling and predictive AI. Utilizes a stabilized nanofluid (GMEL-ThermoFluid & GMEL-NanoStab) to achieve and maintain 95% thermal efficiency in a pumpless, closed-loop design.',
  status: 'National registration completed',
  path: 'PCT filing ready',
  kpi: '95% thermal efficiency',
  progress: 90,
};

export const PATENT_PORTFOLIO: Patent[] = [
  { level: 'Derivatives', code: 'GMEL-EHS', title: 'Smart Energy Sensors', application: 'Self-powered quantum sensors and ML providing 99.5% accurate real-time monitoring. Controls the entire ecosystem, including predictive AI for the GMEL-NanoStab system and drilling optimization with GMEL-DrillX.', status: 'In design', path: 'National registration by end of 1404', kpi: '99.5% accurate real-time monitoring', progress: 25 },
  { level: 'Derivatives', code: 'GMEL-DrillX', title: 'Advanced Drilling', application: 'Smart drilling with autonomous robots, reducing drilling time by 50% and optimizing heat exchange paths.', status: 'In design', path: 'Concurrent with EHS', kpi: 'Reduces drilling time by 50%', progress: 25 },
  { level: 'Derivatives', code: 'GMEL-ThermoFluid', title: 'Heat Transfer Fluid', application: 'Proprietary nanocomposite fluid increasing heat transfer efficiency by over 35%. Its long-term stability and performance are actively maintained by the GMEL-NanoStab system to prevent sedimentation.', status: 'Formula registered', path: 'Proprietary formula registration', kpi: 'Increases heat transfer efficiency by over 35%', progress: 75 },
  { level: 'Derivatives', code: 'GMEL-NanoStab', title: 'Nanofluid Stabilization System', application: 'AI-controlled system using magnetic (0.5A coil) and ultrasonic (40-55 kHz) fields to maintain 95% nanofluid stability. Prevents sedimentation in GMEL-ThermoFluid, guaranteeing consistent high-efficiency heat transfer in the core GMEL-CLG system and preventing a potential 30% performance drop.', status: 'Submitted (Filing No. Pending)', path: 'National Filing: Nov 2025; PCT planned for 1405', kpi: 'Prevents 30% efficiency drop & achieves 95% stability', progress: 50 },
  { level: 'Applied', code: 'GMEL-Desal', title: 'Thermal Desalination', application: 'Low-energy desalination (GOR >10) integrated with Direct Air Capture (DAC) for carbon-neutral water production.', status: 'Qeshm Pilot', path: 'National registration 1405', kpi: 'Low-energy desalination (GOR > 10)', progress: 60 },
  { level: 'Applied', code: 'GMEL-H₂Cell', title: 'Hydrogen Production', application: 'Green hydrogen production via thermal electrolysis, achieving 60% efficiency and costs under $1/kg.', status: 'Lab validated', path: '1405–1406', kpi: '60% efficiency, costs under $1/kg', progress: 50 },
  { level: 'Applied', code: 'GMEL-AgriCell', title: 'Thermal Agriculture', application: 'Geothermal greenhouses for sustainable, year-round agriculture, increasing crop yields by 200%.', status: 'Design phase', path: '1405–1406', kpi: 'Increases crop yields by 200%', progress: 40 },
  { level: 'Applied', code: 'GMEL-LithiumLoop', title: 'Direct Lithium Extraction (DLE)', application: 'DLE from geothermal brines with 90% recovery, producing battery-grade lithium.', status: 'Lab validated', path: '1405–1406', kpi: '90% lithium recovery', progress: 55 },
  { level: 'Strategic', code: 'GMEL-EcoCluster', title: 'Eco-Industrial Parks', application: 'Master planning for zero-waste industrial zones powered by GMEL, attracting high-tech industries.', status: 'Conceptual', path: '1407+', kpi: 'Zero-waste industrial zones', progress: 15 },
  { level: 'Strategic', code: 'GMEL-SmartFund', title: 'Sovereign Wealth Fund', application: 'A fund leveraging GMEL profits to invest in future energy and water technologies, ensuring long-term national prosperity.', status: 'Conceptual', path: '1407+', kpi: 'Invests in future technologies', progress: 10 },
  { level: 'Strategic', code: 'GMEL-GeoCredit', title: 'Carbon Credit Trading', application: 'Framework for monetizing carbon credits generated by GMEL projects on international markets.', status: 'Conceptual', path: '1407+', kpi: 'Monetizes carbon credits', progress: 10 },
];

const FINANCIAL_DATA_QESHM: FinancialData[] = [
    { component: 'Pilot CAPEX (5MW)', value: 575, unit: 'Billion Toman', description: 'Total capital expenditure for the initial 5MW pilot plant.' },
    { component: 'Annual Revenue (5MW)', value: 390, unit: 'Billion Toman', description: 'Projected yearly revenue from energy sales and by-products.' },
    { component: 'Payback Period', value: 2, unit: 'Years', description: 'Time required for the project to recoup its initial investment.' },
    { component: 'Return on Investment (ROI)', value: 42, unit: 'Percent', description: 'The profitability ratio of the investment.' },
    { component: '10-Year NPV', value: 2750, unit: 'Billion Toman', description: 'Net Present Value of cash flows over a 10-year period.' },
];

const FINANCIAL_DATA_MAKOO: FinancialData[] = [
    { component: 'Pilot CAPEX (5MW)', value: 575, unit: 'Billion Toman', description: 'Total capital expenditure for the initial 5MW pilot plant.' },
    { component: 'Annual Revenue (5MW)', value: 390, unit: 'Billion Toman', description: 'Projected yearly revenue from energy sales and direct heat.' },
    { component: 'Payback Period', value: 2, unit: 'Years', description: 'Time required for the project to recoup its initial investment.' },
    { component: 'Return on Investment (ROI)', value: 42, unit: 'Percent', description: 'The profitability ratio of the investment.' },
    { component: '10-Year NPV', value: 2750, unit: 'Billion Toman', description: 'Net Present Value of cash flows over a 10-year period.' },
];

const FINANCIAL_DATA_IRANIAN_KURDISTAN: FinancialData[] = [
    { component: 'Pilot CAPEX (5MW)', value: 600, unit: 'Billion Toman', description: 'Total capital expenditure for the initial 5MW pilot plant, adjusted for mountainous terrain.' },
    { component: 'Annual Revenue (5MW)', value: 400, unit: 'Billion Toman', description: 'Projected yearly revenue from energy sales to local industry and agriculture.' },
    { component: 'Payback Period', value: 2.2, unit: 'Years', description: 'Time required for the project to recoup its initial investment.' },
    { component: 'Return on Investment (ROI)', value: 38, unit: 'Percent', description: 'The profitability ratio of the investment.' },
    { component: '10-Year NPV', value: 2800, unit: 'Billion Toman', description: 'Net Present Value of cash flows over a 10-year period.' },
];

const FINANCIAL_DATA_KURDISTAN: FinancialData[] = [
    { component: 'Pilot CAPEX (5MW)', value: 633, unit: 'Billion Toman', description: 'Adjusted total capital expenditure for the 5MW pilot plant.' },
    { component: 'Annual Revenue (5MW)', value: 429, unit: 'Billion Toman', description: 'Projected yearly revenue from energy sales to industrial clients.' },
    { component: 'Payback Period', value: 1.5, unit: 'Years', description: 'Accelerated payback period due to higher energy tariffs.' },
    { component: 'Return on Investment (ROI)', value: 52, unit: 'Percent', description: 'Enhanced profitability ratio of the investment.' },
    { component: '10-Year NPV', value: 3200, unit: 'Billion Toman', description: 'Higher Net Present Value reflecting improved project economics.' },
];

const FINANCIAL_DATA_CHABAHAR: FinancialData[] = [
    { component: 'Pilot CAPEX (5MW)', value: 580, unit: 'Billion Toman', description: 'Total capital expenditure, considering strategic port logistics.' },
    { component: 'Annual Revenue (5MW)', value: 400, unit: 'Billion Toman', description: 'Projected revenue from energy sales to port industries and desalination.' },
    { component: 'Payback Period', value: 2.1, unit: 'Years', description: 'Time to recoup investment, factoring in industrial offtake agreements.' },
    { component: 'Return on Investment (ROI)', value: 45, unit: 'Percent', description: 'High ROI due to strategic importance and industrial energy demand.' },
    { component: '10-Year NPV', value: 2900, unit: 'Billion Toman', description: 'Net Present Value reflecting strong growth potential.' },
];

const FINANCIAL_DATA_OMAN: FinancialData[] = [
    { component: 'Pilot CAPEX (5MW)', value: 15, unit: 'Million USD', description: 'Capital expenditure for a 5MW pilot, aligned with GCC market costs.' },
    { component: 'Annual Revenue (5MW)', value: 8, unit: 'Million USD', description: 'Revenue from electricity, desalinated water for green hydrogen, and industrial heat.' },
    { component: 'Payback Period', value: 2.5, unit: 'Years', description: 'Rapid payback driven by high-value offtakes (e.g., green hydrogen projects).' },
    { component: 'Return on Investment (ROI)', value: 48, unit: 'Percent', description: 'Strong ROI reflecting alignment with Oman Vision 2040 diversification goals.' },
    { component: '10-Year NPV', value: 80, unit: 'Million USD', description: 'High NPV based on strategic value in renewable energy hubs like Duqm.' },
];

const FINANCIAL_DATA_SAUDI: FinancialData[] = [
    { component: 'Pilot CAPEX (5MW)', value: 18, unit: 'Million USD', description: 'Capital expenditure for a 5MW pilot for giga-projects like NEOM.' },
    { component: 'Annual Revenue (5MW)', value: 10, unit: 'Million USD', description: 'Revenue from baseload power for smart cities, cooling, and DLE from Red Sea brines.' },
    { component: 'Payback Period', value: 2, unit: 'Years', description: 'Very fast payback due to high energy demand and premium for 24/7 clean power.' },
    { component: 'Return on Investment (ROI)', value: 55, unit: 'Percent', description: 'Exceptional ROI driven by Saudi Vision 2030 and giga-project needs.' },
    { component: '10-Year NPV', value: 110, unit: 'Million USD', description: 'Significant NPV reflecting large-scale deployment potential.' },
];

export const getFinancialData = (region: Region): FinancialData[] => {
    switch (region) {
        case 'Qeshm Free Zone': return FINANCIAL_DATA_QESHM;
        case 'Makoo Free Zone': return FINANCIAL_DATA_MAKOO;
        case 'Chabahar Free Zone': return FINANCIAL_DATA_CHABAHAR;
        case 'Iranian Kurdistan': return FINANCIAL_DATA_IRANIAN_KURDISTAN;
        case 'Mahabad': return FINANCIAL_DATA_IRANIAN_KURDISTAN; // Mahabad uses Iranian Kurdistan data
        case 'Kurdistan Region, Iraq': return FINANCIAL_DATA_KURDISTAN;
        case 'Oman': return FINANCIAL_DATA_OMAN;
        case 'Saudi Arabia': return FINANCIAL_DATA_SAUDI;
        case 'United Arab Emirates': return FINANCIAL_DATA_OMAN; // Placeholder, uses Oman data
        case 'Qatar': return FINANCIAL_DATA_OMAN; // Placeholder, uses Oman data
        default: return FINANCIAL_DATA_QESHM;
    }
};


export const PROJECT_MILESTONES: Milestone[] = [
  { title: 'National Patent Registration', date: 'Q1 1403', status: 'Completed', description: 'Core GMEL-CLG patent officially registered, securing foundational IP.' },
  { title: 'Pilot Project Site Selection', date: 'Q2 1403', status: 'Completed', description: 'Qeshm Free Zone confirmed as the optimal site for the 5MW pilot project.' },
  { title: 'Feasibility & Engineering Studies', date: 'Q4 1403', status: 'In Progress', description: 'Detailed geological surveys and engineering designs for the Qeshm pilot.' },
  { title: 'Securing Pilot Project Funding', date: 'Q2 1404', status: 'Planned', description: 'Finalizing investment rounds with national and international partners.' },
  { title: 'Pilot Project Construction Start', date: 'Q4 1404', status: 'Planned', description: 'Commencement of drilling and construction activities in Qeshm.' },
  { title: 'Pilot Project Commissioning', date: 'Q4 1406', status: 'Planned', description: '5MW plant becomes operational, begins grid integration and desalination.' },
];

export const getProjectSummaryPrompt = (region: Region, lang: Language): string => {
    return `Generate a concise, one-paragraph project summary in ${lang} for the GMEL geothermal project targeting ${region}. The summary should be grounded in up-to-date information (as of late 2024/early 2025) about the region's economic needs, energy landscape, and strategic importance. Use Google Search to ensure accuracy. Highlight how GMEL's key features (e.g., energy independence, water production via desalination, DLE) align with the specific opportunities in ${region}. The tone should be suitable for an executive briefing.`;
};