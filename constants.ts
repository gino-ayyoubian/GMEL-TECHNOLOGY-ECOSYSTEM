import { Patent, FinancialData, Milestone, Region } from './types';

export const KKM_LOGO_DATA_URL = "data:image/jpeg;base64,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EGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEG̃gD/9k=";

export const WATERMARK_TEXT = "All rights are retained by inventor Gino Ayyoubian and the KKM International Group. Any form of usage or exploitation in any manner is prohibited and subject to legal repercussions.";

// NOTE: The following data serves as a baseline for AI-driven analysis, which will be tailored to the selected region (Qeshm or Makoo).

export const CORE_PATENT: Patent = {
  level: 'Core',
  code: 'GMEL-CLG',
  title: 'Closed-Loop Geothermal System',
  application: 'Geothermal energy harvesting for low gradients.',
  status: 'National registration completed',
  path: 'PCT preparation ready',
};

export const PATENT_PORTFOLIO: Patent[] = [
  { level: 'Derivatives', code: 'GMEL-EHS', title: 'Smart Energy Sensor & Control', application: 'Intelligent energy sensing and control.', status: 'In design', path: 'National registration by end of 1404' },
  { level: 'Derivatives', code: 'GMEL-DrillX', title: 'Optimal Angle Multi-Axis Drilling', application: 'Multi-axis drilling with optimized angles.', status: 'In design', path: 'Concurrent with EHS' },
  { level: 'Derivatives', code: 'GMEL-ThermoFluid', title: 'Novel Non-Aqueous Thermal Fluid', application: 'Proprietary non-aqueous thermal fluid.', status: 'Confidential', path: 'Proprietary formula registration' },
  { level: 'Derivatives', code: 'GMEL-ORC Compact', title: 'Portable Low-Temp Converter', application: 'Compact, portable low-temperature converter.', status: 'In design', path: '1405' },
  { level: 'Applied', code: 'GMEL-Desal', title: 'Thermal Desalinator', application: 'Thermal desalination unit.', status: 'Qeshm Pilot', path: 'National registration 1405' },
  { level: 'Applied', code: 'GMEL-H₂Cell', title: 'Thermal Hydrogen Production', application: 'Thermal hydrogen generation cell.', status: 'Further research needed', path: '1405–1406' },
  { level: 'Applied', code: 'GMEL-AgriCell', title: 'Sustainable Thermal Agriculture', application: 'Sustainable agriculture using geothermal heat.', status: 'Studies in progress', path: '1405' },
  { level: 'Applied', code: 'GMEL-LithiumLoop', title: 'Lithium Extraction from Brine', application: 'Lithium extraction from geothermal brine.', status: 'Lab design phase', path: '1406' },
  { level: 'Strategic', code: 'GMEL-EcoCluster', title: 'Energy-Centric Rural Development Model', application: 'Model for rural development centered on energy.', status: 'In development', path: 'Management model registration 1405' },
  { level: 'Strategic', code: 'GMEL-SmartFund', title: 'Sea-Village Partnership Fund', application: 'Collaborative economic fund.', status: 'Economic design', path: '1405–1406' },
  { level: 'Strategic', code: 'GMEL-GeoCredit', title: 'Digital Carbon Credit Platform', application: 'Platform for digital carbon credits.', status: 'Software design phase', path: '1406' },
];

export const FINANCIAL_DATA: FinancialData[] = [
    { component: 'Initial R&D and Registration Cost', value: 5, unit: 'Billion Toman', description: 'Includes patents, consulting, and documentation.' },
    { component: 'Qeshm Pilot Implementation Cost', value: 80, unit: 'Billion Toman', description: 'For a 1.5 MW capacity and 500 m³/day desalination plant.' },
    { component: 'Annual Pilot Revenue', value: 45, unit: 'Billion Toman', description: 'From sales of energy, water, and technical services.' },
    { component: 'Return on Investment', value: 3.5, unit: 'Years', description: 'Calculated payback period without fossil fuel dependency.' },
    { component: 'Technology Export Potential', value: 15, unit: 'Countries', description: 'Potential markets in the Middle East, North Africa, and Central Asia.' },
];

export const PROJECT_MILESTONES: Milestone[] = [
  {
    title: 'Core Patent Registration',
    date: 'Q1 1403',
    status: 'Completed',
    description: 'National registration of the GMEL-CLG core technology was successfully completed.'
  },
  {
    title: 'Qeshm Pilot Project Greenlit',
    date: 'Q3 1403',
    status: 'Completed',
    description: 'Secured funding and agreements for the pilot implementation on Qeshm Island.'
  },
  {
    title: 'Technical Derivatives Design',
    date: 'Q4 1404',
    status: 'In Progress',
    description: 'Ongoing design and prototyping for GMEL-EHS and GMEL-DrillX systems.'
  },
  {
    title: 'Pilot Plant Construction',
    date: 'Q2 1405',
    status: 'Planned',
    description: 'Scheduled start for the construction of the 1.5 MW pilot plant and desalination unit.'
  },
  {
    title: 'First Energy & Water Production',
    date: 'Q4 1405',
    status: 'Planned',
    description: 'Projected date for the pilot plant to become operational and start generating revenue.'
  },
  {
    title: 'Lithium Extraction R&D',
    date: 'Q2 1406',
    status: 'Planned',
    description: 'Begin lab-phase design and testing for the GMEL-LithiumLoop technology.'
  }
];

export const getProjectSummaryPrompt = (region: Region): string => {
  const commonIntro = `Generate a comprehensive and persuasive project summary for the GMEL-CLG ecosystem, tailored for the board of directors of the ${region}. The project is developed by Kimia Karan Maad (KKM) and is centered around a nationally registered invention: a closed-loop geothermal energy harvesting system for low-gradient thermal resources.`;

  const regionSpecifics = {
    'Qeshm Free Zone': `
      - Specific Focus for Qeshm: Highlight its strategic location in the Persian Gulf, the critical need for fresh water (making the desalination application a primary value proposition), and its role as a logistical and energy hub. Emphasize synergies with existing industries on the island.
      - Economic Viability: Adapt the pilot project figures (80 billion Toman cost, 3-4 year ROI for a 1.5MW plant) to Qeshm's context, considering its industrial electricity tariffs and the high value of desalinated water.
      - Integrated Applications: Detail the potential for integrated systems, especially thermal desalination, thermal agriculture to support local food security, and lithium extraction from the Persian Gulf's brine sources.
      - Export Potential: Mention Qeshm's port infrastructure as ideal for exporting containerized, portable GMEL-ORC units to neighboring Gulf countries.
    `,
    'Makoo Free Zone': `
      - Specific Focus for Makoo: Highlight its strategic location as a gateway to Turkey and Europe, the potential for cross-border energy sales, and its mountainous, cold climate where geothermal heating for agriculture and industry is highly valuable.
      - Economic Viability: Adapt the pilot project figures (80 billion Toman cost, 3-4 year ROI for a 1.5MW plant) to Makoo's context, considering potential export electricity tariffs and the value of direct heat for industrial parks.
      - Integrated Applications: Detail the potential for integrated systems, especially thermal agriculture (greenhouses) to extend growing seasons in a cold climate, and providing process heat for local industries.
      - Export Potential: Frame the project as a technology showcase for export to Turkey, the Caucasus region, and Central Asia, leveraging Makoo's trade-focused infrastructure.
    `
  };

  return `
    ${commonIntro}

    Key aspects to highlight:
    - Core Technology (GMEL-CLG): Emphasize its suitability for the geology of ${region}, its pump-free thermosiphon mechanism, and its independence from water injection.
    ${regionSpecifics[region]}
    - Strategic Alignment: Connect the project with national policies and the specific development goals of the ${region}, focusing on sustainable development, job creation, and technology leadership.

    The summary should be professional, data-informed, and forward-looking, positioning the project as an ideal, economical, and innovative investment for the region.
  `;
};