import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import enTranslation from '../locales/en/translation.json';
import arTranslation from '../locales/ar/translation.json';

// Force import to ensure files are loaded
console.log('Loading translation files...');
console.log('EN loaded:', !!enTranslation);
console.log('AR loaded:', !!arTranslation);

const resources = {
  en: {
    translation: enTranslation
  },
  ar: {
    translation: arTranslation
  }
};

// Verify resources are loaded
if (!enTranslation || !arTranslation) {
  console.error('Translation files not loaded properly');
}

// Debug resources
console.log('English resources loaded:', !!enTranslation);
console.log('Arabic resources loaded:', !!arTranslation);
console.log('English navigation keys:', enTranslation?.navigation);
console.log('Arabic navigation keys:', arTranslation?.navigation);
console.log('Full English object:', enTranslation);
console.log('Full Arabic object:', arTranslation);

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: true,
    
    interpolation: {
      escapeValue: false, // React already does escaping
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'tms_language',
    },
    
    // Language direction detection
    lng: localStorage.getItem('tms_language') || 'en',
    
    // RTL support
    supportedLngs: ['en', 'ar'],
    
    // Namespace configuration
    defaultNS: 'translation',
    ns: ['translation'],
    
    // Pluralization
    pluralSeparator: '_',
    contextSeparator: '_',
    
    // React specific options
    react: {
      useSuspense: false,
    },
    
    // Fallback options
    fallbackLng: 'en',
    saveMissing: false,
    missingKeyHandler: false,
    
    // Key separator
    keySeparator: '.',
    nsSeparator: ':'
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

// Listen for language changes
i18n.on('languageChanged', (lng) => {
  setDocumentDirection(lng);
  localStorage.setItem('tms_language', lng);
});

// Debug
console.log('i18n initialized with language:', i18n.language);
console.log('Available resources:', Object.keys(resources));
console.log('i18n resources:', i18n.getResourceBundle('en', 'translation'));
console.log('i18n resources ar:', i18n.getResourceBundle('ar', 'translation'));

// Test translation
setTimeout(() => {
  console.log('Testing translation after init...');
  console.log('EN dashboard:', i18n.t('navigation.dashboard', { lng: 'en' }));
  console.log('AR dashboard:', i18n.t('navigation.dashboard', { lng: 'ar' }));
}, 1000);

export default i18n;
