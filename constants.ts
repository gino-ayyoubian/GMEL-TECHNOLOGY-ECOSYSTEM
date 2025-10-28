import { Patent, FinancialData, Milestone, Region } from './types';

export const KKM_LOGO_DATA_URL = "data:image/jpeg;base64,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3+3FG0bKYG3HcynJJOCDgdaDpw+0OxmFqYo7xvHRniAjGXCnBIBONK0bb2n2lxDbyQ2l+4uFZoQIRl9pwxAyDirvDLmG5sY5LeB4IwCuw6FSMEEEGvMez+xt04Bxf8AZR2T3HjbUZlJzgAEYJyMDeg9P2X4/a8Z+KNhFeReA2w/iR7Gc5xt3nOlekzXyfg9va2fHLSW14fNa5hlR3eRWEmVTdtUkgddTX1gmgLmjNBNGaAuaM0E0ZoC5ozQTRmgLmjNBNGaAuaM0E0ZoC5ozQTRmgLmjNBNGaAuKKKKAQ0Vke+g0A4ozWQ0ZoBwKyGsgoGiiigCiiigGijNFAM0Vke+g0A4ozWQ0ZoBwKyGsg0A0UUUBRQRQRQDRRRQDRRRQCiiigKKKKARozRmjNANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEGjNFANEG"

export const WATERMARK_TEXT = "All rights are retained by inventor Seyed Gino Ayyoubian and the KKM International Group. Any form of usage or exploitation in any manner is prohibited and subject to legal repercussions.";

// NOTE: The following data is updated to reflect the "Ultimate Optimized Version (2025)" of the GMEL project.

export const CORE_PATENT: Patent = {
  level: 'Core',
  code: 'GMEL-CLG',
  title: 'Closed-loop Geothermal',
  application: 'Integrates superhot rock drilling and predictive AI to achieve 95% thermal efficiency in low-gradient zones.',
  status: 'National registration completed',
  path: 'PCT filing ready',
  kpi: '95% thermal efficiency',
  progress: 90,
};

export const PATENT_PORTFOLIO: Patent[] = [
  { level: 'Derivatives', code: 'GMEL-EHS', title: 'Smart Energy Sensors', application: 'Self-powered quantum sensors and ML for 99.5% accurate real-time monitoring and predictive control.', status: 'In design', path: 'National registration by end of 1404', kpi: '99.5% accurate real-time monitoring', progress: 25 },
  { level: 'Derivatives', code: 'GMEL-DrillX', title: 'Advanced Drilling', application: 'Smart drilling with autonomous robots, reducing drilling time by 50% and optimizing heat exchange paths.', status: 'In design', path: 'Concurrent with EHS', kpi: 'Reduces drilling time by 50%', progress: 25 },
  { level: 'Derivatives', code: 'GMEL-ThermoFluid', title: 'Heat Transfer Fluid', application: 'Proprietary nanocomposite fluid increasing heat transfer efficiency by over 35%.', status: 'Confidential', path: 'Proprietary formula registration', kpi: 'Increases heat transfer efficiency by over 35%', progress: 80 },
  { level: 'Applied', code: 'GMEL-Desal', title: 'Thermal Desalination', application: 'Low-energy desalination (GOR >10) integrated with Direct Air Capture (DAC) for carbon-neutral water production.', status: 'Qeshm Pilot', path: 'National registration 1405', kpi: 'Low-energy desalination (GOR > 10)', progress: 60 },
  { level: 'Applied', code: 'GMEL-H₂Cell', title: 'Hydrogen Production', application: 'Green hydrogen production via thermal electrolysis, achieving 60% efficiency and costs under $1/kg.', status: 'Lab validated', path: '1405–1406', kpi: '60% efficiency, costs under $1/kg', progress: 50 },
  { level: 'Applied', code: 'GMEL-AgriCell', title: 'Thermal Agriculture', application: 'AI-controlled sustainable greenhouse using geothermal heat, achieving a 6x increase in yield.', status: 'Studies in progress', path: '1405', kpi: '6x increase in yield', progress: 40 },
  { level: 'Applied', code: 'GMEL-LithiumLoop', title: 'Lithium Extraction', application: 'Advanced DLE with 92% yield using selective membranes for extraction from geothermal brine.', status: 'Lab validated', path: '1406', kpi: '92% yield with selective membranes', progress: 50 },
  { level: 'Strategic', code: 'GMEL-EcoCluster', title: 'Energy-Centric Villages', application: 'Sustainable economic model for energy-centric rural development, generating up to 150 jobs/MW.', status: 'In development', path: 'Management model registration 1405', kpi: 'Generates up to 150 jobs/MW', progress: 30 },
  { level: 'Strategic', code: 'GMEL-SmartFund', title: 'Marine-Village Fund', application: 'A fund dedicated to developing marine and village ecosystems, creating a sustainable, circular economy around GMEL hubs.', status: 'Concept Phase', path: '1406', kpi: 'Sustainable community funding model', progress: 15 },
  { level: 'Strategic', code: 'GMEL-GeoCredit', title: 'Carbon Credit Platform', application: 'Blockchain-based platform for transparent carbon credit financing and trading.', status: 'Software design phase', path: '1406', kpi: 'Blockchain-based financing & trading', progress: 20 },
];

export const FINANCIAL_DATA: FinancialData[] = [
    { component: 'Pilot CAPEX (5MW)', value: 575, unit: 'Billion Toman', description: 'Total capital expenditure for a 5MW pilot plant in Qeshm, based on $11.5M USD.' },
    { component: 'Annual Revenue (5MW)', value: 390, unit: 'Billion Toman', description: 'Projected annual revenue from 7 streams including energy, DLE, and e-fuels, based on $7.8M USD.' },
    { component: 'Payback Period', value: 2, unit: 'Years', description: 'The project is projected to achieve payback by 2028 based on current financial models.' },
    { component: 'Return on Investment (ROI)', value: 42, unit: 'Percent', description: 'The expected annual Return on Investment for the 5MW pilot project.' },
    { component: '10-Year NPV', value: 2750, unit: 'Billion Toman', description: 'The 10-year Net Present Value of the project, estimated at $55M USD.' },
];

export const PROJECT_MILESTONES: Milestone[] = [
  {
    title: 'Core Patent Registration',
    date: 'Q1 1403',
    status: 'Completed',
    description: 'National registration of the GMEL-CLG core technology was successfully completed.'
  },
  {
    title: 'DLE Technology Validation',
    date: 'Q2 1403',
    status: 'Completed',
    description: 'Successfully validated Direct Lithium Extraction (DLE) process with 92% yield in lab-scale tests.'
  },
   {
    title: 'Qeshm Pilot Project Greenlit',
    date: 'Q3 1403',
    status: 'Completed',
    description: 'Secured initial funding and agreements for the pilot implementation on Qeshm Island.'
  },
  {
    title: 'PCT Filing Preparation',
    date: 'Q2 1404',
    status: 'In Progress',
    description: 'Preparing the application for international patent filing under the Patent Cooperation Treaty (PCT).'
  },
  {
    title: 'Pilot Plant Construction',
    date: 'Q1 1405 (est. 2026)',
    status: 'Planned',
    description: 'Scheduled start for the construction of the 5 MW pilot plant in the Qeshm Free Zone.'
  },
  {
    title: 'First Energy & Water Production',
    date: 'Q4 1405 (est. 2026)',
    status: 'Planned',
    description: 'Projected date for the 5 MW pilot plant to become fully operational and start generating revenue.'
  }
];

export const getProjectSummaryPrompt = (region: Region): string => {
  const commonIntro = `Generate a comprehensive and persuasive project summary for the GMEL-CLG ecosystem, tailored for the board of directors of the ${region}. The project is developed by Kimia Karan Maad (KKM) and is centered around a nationally registered invention: a closed-loop geothermal energy harvesting system for low-gradient thermal resources.`;

  const regionSpecifics = {
    'Qeshm Free Zone': `
      - Specific Focus for Qeshm: Highlight its strategic location in the Persian Gulf, the critical need for fresh water (making the desalination application a primary value proposition), and its role as a logistical and energy hub. Emphasize synergies with existing industries on the island.
      - Economic Viability: Adapt the pilot project figures (575 billion Toman CAPEX, 2-year payback for a 5MW plant) to Qeshm's context, considering its industrial electricity tariffs and the high value of desalinated water.
      - Integrated Applications: Detail the potential for integrated systems, especially thermal desalination, thermal agriculture to support local food security, and direct lithium extraction (DLE) from the Persian Gulf's brine sources.
      - Export Potential: Mention Qeshm's port infrastructure as ideal for exporting containerized, portable GMEL-ORC units to neighboring Gulf countries.
    `,
    'Makoo Free Zone': `
      - Specific Focus for Makoo: Highlight its strategic location as a gateway to Turkey and Europe, the potential for cross-border energy sales, and its mountainous, cold climate where geothermal heating for agriculture and industry is highly valuable.
      - Economic Viability: Adapt the pilot project figures (575 billion Toman CAPEX, 2-year payback for a 5MW plant) to Makoo's context, considering potential export electricity tariffs and the value of direct heat for industrial parks.
      - Integrated Applications: Detail the potential for integrated systems, especially thermal agriculture (greenhouses) to extend growing seasons in a cold climate, and providing process heat for local industries like mining and manufacturing.
      - Export Potential: Frame the project as a technology showcase for export to Turkey, the Caucasus region, and Central Asia, leveraging Makoo's trade-focused infrastructure.
    `,
    'Kurdistan Region, Iraq': `
      - Specific Focus for Kurdistan: Highlight its landlocked geography, the critical need for energy independence and grid stability for post-conflict reconstruction and industrial growth. Frame it as a strategic national infrastructure project.
      - Economic Viability: Adapt pilot project figures (575 billion Toman CAPEX, 2-year payback for a 5MW plant) to Kurdistan's context, emphasizing the value of stable, baseload power for industries like cement and steel, and direct heat for agriculture.
      - Integrated Applications: Detail potential for thermal agriculture to enhance food security, process heat for industrial zones, and using geothermal energy to power potential green hydrogen projects for future export or local use.
      - Strategic Partnership: Position the project as an ideal joint venture for technology transfer, local capacity building, and strengthening economic ties with Iran.
    `
  };

  return `
    ${commonIntro}

    Key aspects to highlight:
    - Core Technology (GMEL-CLG): Emphasize its suitability for the geology of ${region}, its 95% efficiency, its pump-free thermosiphon mechanism, and its independence from water injection.
    ${regionSpecifics[region]}
    - Strategic Alignment: Connect the project with national/regional development goals for ${region}, focusing on sustainable development, job creation (200 jobs), and technology leadership.

    The summary should be professional, data-informed, and forward-looking, positioning the project as an ideal, economical, and innovative investment for the region.
  `;
};
