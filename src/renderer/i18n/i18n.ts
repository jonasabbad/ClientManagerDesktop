// ============================================================
// i18n Configuration — French + Arabic with RTL support
// ============================================================
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import fr from './fr.json';
import ar from './ar.json';

const savedLang = localStorage.getItem('app-language') || 'fr';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      fr: { translation: fr },
      ar: { translation: ar },
    },
    lng: savedLang,
    fallbackLng: 'fr',
    interpolation: {
      escapeValue: false,
    },
  });

// Persist language changes
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('app-language', lng);
});

export default i18n;
