import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import fr from './locales/fr.json'

const savedLang = localStorage.getItem('carcassonne-lang')

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    fr: { translation: fr },
  },
  lng: savedLang || undefined,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

// Persist language changes
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('carcassonne-lang', lng)
})

export default i18n
