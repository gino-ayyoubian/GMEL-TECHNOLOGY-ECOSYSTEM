
import * as en from '../i18n/en';

type TFunction = (key: keyof typeof en, replacements?: Record<string, string | number>) => string;

// This utility function centralizes the technical details so they can be used by multiple components.
export const getTechDetails = (t: TFunction) => ({
    "Closed-Loop System (CLG-001)": t('tech_detail_clg_001'),
    "Nanofluid Stabilization (NS-Stab-001)": t('tech_detail_ns_stab_001'),
    "IoT Sensor Node (EHS-002)": t('tech_detail_ehs_002'),
    "Green Hydrogen (H2C-004)": t('tech_detail_h2c_004'),
    "Lithium Extraction (LTH-005)": t('tech_detail_lth_005'),
    "Thermal Desalination (DES-006)": t('tech_detail_des_006'),
    "Agri-Heating (AGR-007)": t('tech_detail_agr_007'),
    "Carbon Capture (CCS-008)": t('tech_detail_ccs_008'),
    "Smart Grid (SGR-009)": t('tech_detail_sgr_009'),
    "Enhanced Geothermal (EGS-010)": t('tech_detail_egs_010'),
    "sCO2 Cycle (SCO2-011)": t('tech_detail_sco2_011'),
    "Quantum Optimization (QNT-012)": t('tech_detail_qnt_012'),
    "Federated Learning (FED-013)": t('tech_detail_fed_013'),
    "Integrated Platform (GMEL-CORE-014)": t('tech_detail_gmel_core_014'),
});
