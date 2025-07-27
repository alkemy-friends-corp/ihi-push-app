import { useTranslation } from 'react-i18next';
import { useCallback } from 'react';

export type Language = 'en' | 'ja';

export const useLanguage = () => {
  const { i18n } = useTranslation();

  const language = i18n.language as Language;
  
  const setLanguage = useCallback((lang: Language) => {
    i18n.changeLanguage(lang);
  }, [i18n]);

  return {
    language,
    setLanguage,
  };
}; 