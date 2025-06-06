import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    debug: true,
    supportedLngs: ['en', 'np', 'ja'],
    ns: ['translation','customer'], // Define multiple namespaces
    defaultNS: 'translation', // Default namespace
    interpolation: {
      escapeValue: false, // React handles escaping
    },
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json' // Enable multi-file loading
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;
