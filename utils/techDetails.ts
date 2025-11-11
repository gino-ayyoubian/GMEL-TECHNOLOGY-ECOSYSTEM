import * as en from '../i18n/en';

type TFunction = (key: keyof typeof en, replacements?: Record<string, string | number>) => string;

// This utility function centralizes the technical details so they can be used by multiple components.
export const getTechDetails = (t: TFunction) => ({
    "Core System (GMEL-CLG)": t('tech_detail_core'),
    "Drilling (GMEL-DrillX)": t('tech_detail_drilling'),
    "Fluid (GMEL-ThermoFluid)": t('tech_detail_fluid'),
    "Nanofluid Stabilization (GMEL-NanoStab)": t('tech_detail_nanostab'),
    "Power Conversion (GMEL-ORC Compact)": t('tech_detail_power'),
    "Control System (GMEL-EHS)": t('tech_detail_control'),
    "Thermal Desalination (GMEL-Desal)": t('tech_detail_desal'),
    "Hydrogen Production (GMEL-H₂Cell)": t('tech_detail_hydrogen'),
    "Thermal Agriculture (GMEL-AgriCell)": t('tech_detail_agriculture'),
    "Direct Lithium Extraction (GMEL-LithiumLoop)": t('tech_detail_lithium'),
});