
import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const Footer: React.FC = () => {
  const { t } = useLanguage();
  return (
    <footer className="bg-gray-100 dark:bg-gray-800 text-center py-4 border-t border-border-light dark:border-border-dark">
      <p className="text-sm text-text-light dark:text-text-dark">
        {t('footer.copyright', { year: new Date().getFullYear() })}
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
        {t('footer.tagline')}
      </p>
    </footer>
  );
};

export default Footer;