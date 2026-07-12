import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { NativeModules, Platform } from 'react-native';
import es from './es.json';
import en from './en.json';

/**
 * Obtiene el idioma de configuración del dispositivo utilizando las APIs nativas de React Native
 * sin depender de paquetes externos.
 */
const getDeviceLanguage = (): string => {
  let locale: string | undefined;

  if (Platform.OS === 'ios') {
    const settings = NativeModules.SettingsManager?.settings;
    // AppleLanguages es una lista de preferencias de idiomas (ej. ["es-CO", "en-US"])
    locale = settings?.AppleLanguages?.[0] || settings?.AppleLocale;
  } else if (Platform.OS === 'android') {
    locale = NativeModules.I18nManager?.localeIdentifier; // Ej. "es_CO" o "en_US"
  }

  if (!locale) {
    return 'es'; // Idioma por defecto
  }

  // Normalizamos el string (ej. "es-CO" o "es_CO" -> "es")
  const lang = locale.replace('_', '-').split('-')[0].toLowerCase();
  
  // Soportamos español e inglés, de lo contrario cae a español
  return ['es', 'en'].includes(lang) ? lang : 'es';
};

i18n.use(initReactI18next).init({
  compatibilityJSON: 'v3' as any, // Requerido para compatibilidad con React Native
  resources: {
    es: { translation: es },
    en: { translation: en },
  },
  lng: getDeviceLanguage(), // Configuración automática según dispositivo
  fallbackLng: 'es',        // Idioma de respaldo
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
