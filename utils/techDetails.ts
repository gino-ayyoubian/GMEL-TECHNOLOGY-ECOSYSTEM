import * as en from '../i18n/en';

type TFunction = (key: keyof typeof en, replacements?: Record<string, string | number>) => string;

// This utility function centralizes the technical details so they can be used by multiple components.
export const getTechDetails = (t: TFunction) => ({
    "Core System (GMEL-CLG)": t('tech_detail_core'),
    "Drilling (GMEL-DrillX)": t('tech_detail_drilling'),
    "Fluid (GMEL-ThermoFluid)": t('tech_detail_fluid'),
    "Power Conversion (GMEL-ORC Compact)": t('tech_detail_power'),
    "Control System (GMEL-EHS)": t('tech_detail_control')
});
