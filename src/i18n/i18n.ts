import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.json';
import es from './es.json';

// Detecta el idioma del navegador (por defecto 'en' si no es español)
const getBrowserLang = (): string => {
    const lang = navigator.language || (navigator as any).userLanguage || 'en';
    return lang.toLowerCase().startsWith('es') ? 'es' : 'en';
};

const savedLang = localStorage.getItem('language') || getBrowserLang();

i18n.use(initReactI18next).init({
    resources: {
        en: { translation: en },
        es: { translation: es },
    },
    lng: savedLang,
    fallbackLng: 'en',
    interpolation: {
        escapeValue: false,
    },
});

export default i18n;
