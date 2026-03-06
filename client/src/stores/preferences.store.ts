import { create } from 'zustand';

export type Language = 'ru' | 'en';
export type Currency = 'RUB' | 'USD' | 'EUR';

type PreferencesState = {
  language: Language;
  currency: Currency;
  setLanguage: (language: Language) => void;
  setCurrency: (currency: Currency) => void;
};

const STORAGE_KEY = 'preferences';

function loadPreferences(): Pick<PreferencesState, 'language' | 'currency'> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as { language?: string; currency?: string };
      return {
        language: parsed.language === 'en' ? 'en' : 'ru',
        currency: (['RUB', 'USD', 'EUR'].includes(parsed.currency ?? '')
          ? parsed.currency
          : 'RUB') as Currency,
      };
    }
  } catch {
    // Ignore parse errors
  }
  return { language: 'ru', currency: 'RUB' };
}

function savePreferences(language: Language, currency: Currency) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ language, currency }));
}

export const usePreferencesStore = create<PreferencesState>((set) => ({
  ...loadPreferences(),
  setLanguage: (language) =>
    set((state) => {
      savePreferences(language, state.currency);
      return { language };
    }),
  setCurrency: (currency) =>
    set((state) => {
      savePreferences(state.language, currency);
      return { currency };
    }),
}));
