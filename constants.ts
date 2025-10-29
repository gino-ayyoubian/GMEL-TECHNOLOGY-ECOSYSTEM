import { Patent, FinancialData, Milestone, Region } from './types';

export const KKM_LOGO_DATA_URL = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxAHBgYIAxMPARAPDRAPFREVDQ8QDxAPFRIWFhURFRUYHSggGBolHRMVITEhJSkrLi4uFx8zODMtNygtLisBCgoKDg0OFw8QFS0dFR0tLS0tLSstKystLSstKysrLS0rLSstLS0tLS0rLS0rKysrKysrLSstKysrKysrKysrK//AABEIAEAAQAMBIgACEQEDEQH/xAAVAAEBAAAAAAAAAAAAAAAAAAAAAf/EAB0QAAICAwEBAQAAAAAAAAAAAAECABEDBCExYXH/xAAWAQEBAQAAAAAAAAAAAAAAAAAAAQT/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwDk4oAgHt2AGjW1yY6gXmC6g8gC1n6iYgI51//9k=";

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

const BASE_FINANCIAL_DATA: FinancialData[] = [
    { component: 'Pilot CAPEX (5MW)', value: 575, unit: 'Billion Toman', description: 'Total capital expenditure for a 5MW pilot plant in Qeshm, based on $11.5M USD.' },
    { component: 'Annual Revenue (5MW)', value: 390, unit: 'Billion Toman', description: 'Projected annual revenue from 7 streams including energy, DLE, and e-fuels, based on $7.8M USD.' },
    { component: 'Payback Period', value: 2, unit: 'Years', description: 'The project is projected to achieve payback by 2028 based on current financial models.' },
    { component: 'Return on Investment (ROI)', value: 42, unit: 'Percent', description: 'The expected annual Return on Investment for the 5MW pilot project.' },
    { component: '10-Year NPV', value: 2750, unit: 'Billion Toman', description: 'The 10-year Net Present Value of the project, estimated at $55M USD.' },
];

const KURDISTAN_FINANCIAL_DATA: FinancialData[] = [
    { component: 'Pilot CAPEX (5MW)', value: 633, unit: 'Billion Toman', description: 'Adjusted for logistics to a landlocked region, representing an estimated 10% increase.' },
    { component: 'Annual Revenue (5MW)', value: 449, unit: 'Billion Toman', description: 'Adjusted for higher industrial tariffs and the value of stable, baseload power for regional development.' },
    { component: 'Payback Period', value: 1.5, unit: 'Years', description: 'Recalculated based on adjusted CAPEX and the higher revenue potential from industrial partnerships.' },
    { component: 'Return on Investment (ROI)', value: 45, unit: 'Percent', description: 'Enhanced ROI reflecting strong demand for stable energy and integrated applications like agriculture.' },
    { component: '10-Year NPV', value: 3245, unit: 'Billion Toman', description: 'Recalculated NPV reflecting higher sustained revenue and strategic value in an energy-critical region.' },
];

export const getFinancialData = (region: Region): FinancialData[] => {
    if (region === 'Kurdistan Region, Iraq') {
        return KURDISTAN_FINANCIAL_DATA;
    }
    // Default data for Qeshm, Makoo, Oman, and Saudi Arabia
    return BASE_FINANCIAL_DATA;
};

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

  const regionSpecifics: Partial<Record<Region, string>> = {
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
      - Economic Viability: Adapt pilot project figures (633 billion Toman CAPEX, 1.5-year payback for a 5MW plant) to Kurdistan's context, emphasizing the value of stable, baseload power for industries like cement and steel, and direct heat for agriculture.
      - Integrated Applications: Detail potential for thermal agriculture to enhance food security, process heat for industrial zones, and using geothermal energy to power potential green hydrogen projects for future export or local use.
      - Strategic Partnership: Position the project as an ideal joint venture for technology transfer, local capacity building, and strengthening economic ties with Iran.
    `,
    'Oman': `
      - Specific Focus for Oman: Highlight Oman's Vision 2040 for economic diversification away from hydrocarbons. Position GMEL as a key enabler for renewable energy goals, especially for powering green hydrogen hubs (e.g., Duqm) and large-scale desalination projects.
      - Economic Viability: Use base figures, but emphasize the high value of produced water for industrial and agricultural use, and stable power for new industrial zones.
      - Integrated Applications: Focus heavily on thermal desalination to combat water scarcity, DLE from coastal brine, and providing baseload power for green hydrogen electrolysis.
      - Strategic Partnership: Align with Oman's goals for technology transfer and developing a local renewable energy workforce.
    `,
    'Saudi Arabia': `
      - Specific Focus for Saudi Arabia: Align with Saudi Vision 2030 and NEOM's goals for futuristic, sustainable cities. Position GMEL as a foundational power source for smart cities, providing 24/7 clean energy.
      - Economic Viability: Use base figures, but emphasize scalability and the project's ability to support massive industrial and urban developments like NEOM and the Red Sea Project.
      - Integrated Applications: Highlight large-scale desalination, district cooling, DLE from Red Sea brine, and powering advanced manufacturing and data centers.
      - Strategic Partnership: Frame as a high-tech partnership that aligns with Saudi Arabia's ambition to become a global leader in technology and renewable energy.
    `
  };

  return `
    ${commonIntro}

    Key aspects to highlight:
    - Core Technology (GMEL-CLG): Emphasize its suitability for the geology of ${region}, its 95% efficiency, its pump-free thermosiphon mechanism, and its independence from water injection.
    ${regionSpecifics[region] || ''}
    - Strategic Alignment: Connect the project with national/regional development goals for ${region}, focusing on sustainable development, job creation (200 jobs), and technology leadership.

    The summary should be professional, data-informed, and forward-looking, positioning the project as an ideal, economical, and innovative investment for the region.
  `;
};