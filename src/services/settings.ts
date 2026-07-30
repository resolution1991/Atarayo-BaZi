import {
  STANDARD_V0_5_PROFILE,
  cloneCalculationSettings,
  normalizeCalculationSettings,
  type CalculationSettings,
} from "../core/calculation-profile.ts";

export const SETTINGS_KEY = "bazi_calculation_settings_v1";

export function readCalculationSettings(): CalculationSettings {
  try {
    const stored = uni.getStorageSync(SETTINGS_KEY);
    if (!stored) {
      return getDefaultCalculationSettings();
    }
    return normalizeCalculationSettings(stored);
  } catch {
    return getDefaultCalculationSettings();
  }
}

export function saveCalculationSettings(settings: CalculationSettings): CalculationSettings {
  const normalized = normalizeCalculationSettings(settings);
  uni.setStorageSync(SETTINGS_KEY, cloneCalculationSettings(normalized));
  return normalized;
}

export function resetCalculationSettings(): CalculationSettings {
  const defaults = getDefaultCalculationSettings();
  uni.setStorageSync(SETTINGS_KEY, cloneCalculationSettings(defaults));
  return defaults;
}

export function getDefaultCalculationSettings(): CalculationSettings {
  return cloneCalculationSettings(STANDARD_V0_5_PROFILE.settings);
}
