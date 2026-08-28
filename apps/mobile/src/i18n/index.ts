import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';

import en from './en.json';
import ar from './ar.json';

export type AppLanguage = 'en' | 'ar';

export const SPEECH_LOCALES: Record<AppLanguage, string> = {
  en: 'en-US',
  ar: 'ar-SA',
};

/** Best-guess startup language from the device, before settings hydrate. */
export function deviceLanguage(): AppLanguage {
  return getLocales()[0]?.languageCode === 'ar' ? 'ar' : 'en';
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ar: { translation: ar },
  },
  lng: deviceLanguage(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;
