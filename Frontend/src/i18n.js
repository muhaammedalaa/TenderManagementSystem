import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import the correct translation files
import enTranslation from './locales/en/translation.json';
import arTranslation from './locales/ar/translation.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslation,
      },
      ar: {
        translation: arTranslation,
      },
    },
    fallbackLng: 'en',
    debug: true,
    interpolation: {
      escapeValue: false, // react already escapes by default
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
      // Prevent language variants
      convertDetectedLanguage: (lng) => {
        // Convert language variants to base language
        if (lng.startsWith('en')) return 'en';
        if (lng.startsWith('ar')) return 'ar';
        return lng;
      },
    },
    // Fix language detection - prevent fallback to language variants
    supportedLngs: ['en', 'ar'],
    load: 'languageOnly',
    nonExplicitSupportedLngs: false,
    // Prevent fallback to language variants
    fallbackLng: {
      'en-US': ['en'],
      'en-GB': ['en'],
      'en-CA': ['en'],
      'en-AU': ['en'],
      'ar-SA': ['ar'],
      'ar-EG': ['ar'],
      'ar-AE': ['ar'],
      'default': ['en']
    },
    // Clear any existing language setting
    lng: 'en',
  });

// Set document direction based on language
const setDocumentDirection = (lng) => {
  const isRTL = lng === 'ar';
  document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
  document.documentElement.lang = lng;
  
  // Add/remove RTL class to body without affecting theme classes
  document.body.classList.remove('rtl', 'ltr');
  if (isRTL) {
    document.body.classList.add('rtl');
  } else {
    document.body.classList.add('ltr');
  }
};

// Set initial direction
setDocumentDirection(i18n.language);

i18n.on('languageChanged', (lng) => {
  setDocumentDirection(lng);
  localStorage.setItem('i18nextLng', lng);
});

// Clear language cache in development
if (process.env.NODE_ENV === 'development') {
  localStorage.removeItem('i18nextLng');
  localStorage.removeItem('i18next');
  console.log('Cleared i18n cache for development');
}

// Debug
console.log('i18n initialized with language:', i18n.language);
console.log('Available resources:', Object.keys(i18n.options.resources));
console.log('EN navigation keys:', enTranslation?.navigation);
console.log('AR navigation keys:', arTranslation?.navigation);

// Test translation
console.log('Test translation EN:', i18n.t('navigation.dashboard', { lng: 'en' }));
console.log('Test translation AR:', i18n.t('navigation.dashboard', { lng: 'ar' }));

export default i18n;