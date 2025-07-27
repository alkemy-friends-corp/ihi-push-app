import { useTranslation } from 'react-i18next';

export const useTranslations = () => {
  const { t, i18n } = useTranslation();
  
  return {
    t,
    i18n,
    isReady: i18n.isInitialized,
  };
}; 