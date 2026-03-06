import { usePreferencesStore } from '@/stores/preferences.store';

import { en } from './translations/en';
import { type TranslationKey } from './translations/ru';
import { ru } from './translations/ru';

const dictionaries = { ru, en } as const;

type TFunction = (key: TranslationKey, params?: Record<string, string | number>) => string;

export type { TFunction, TranslationKey };

export function useTranslation() {
  const language = usePreferencesStore((s) => s.language);
  const dict = dictionaries[language];

  function t(key: TranslationKey, params?: Record<string, string | number>): string {
    let str: string = dict[key] ?? key;
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        str = str.replaceAll(`{${k}}`, String(v));
      }
    }
    return str;
  }

  return { t, language };
}

/** Translate a category name. Falls back to the raw name for custom user categories. */
export function translateCategory(name: string, t: TFunction): string {
  const key = `category.${name}` as TranslationKey;
  const result = t(key);
  return result === key ? name : result;
}
