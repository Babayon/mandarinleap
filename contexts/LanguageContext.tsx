import React, { createContext, useState, useEffect, useCallback, ReactNode, useContext } from 'react';

export type Language = 'pt' | 'en' | 'es';

interface LanguageContextType {
  language: Language;
  changeLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  translationsLoading: boolean;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Helper function to get nested values from an object using a dot-separated key
const getNestedValue = (obj: any, key: string): string | undefined => {
  return key.split('.').reduce((acc, part) => acc && acc[part], obj);
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const savedLang = localStorage.getItem('appLanguage') as Language | null;
    return savedLang || 'pt'; // Default to Portuguese
  });
  const [translations, setTranslations] = useState<any>({});
  const [translationsLoading, setTranslationsLoading] = useState<boolean>(true);

  const fetchTranslations = useCallback(async (lang: Language) => {
    setTranslationsLoading(true);
    try {
      // In a real build setup, these might be dynamically imported or bundled.
      // For this environment, we use direct fetch.
      const response = await fetch(`/translations/${lang}.json`);
      if (!response.ok) {
        throw new Error(`Failed to load translations for ${lang}: ${response.statusText}`);
      }
      const data = await response.json();
      setTranslations(data);
    } catch (error) {
      console.error("Error loading translations:", error);
      // Fallback to an empty object or default language if loading fails
      if (lang !== 'pt') { // Avoid infinite loop if 'pt' fails
        fetchTranslations('pt'); // Try to load default Portuguese translations
      } else {
        setTranslations({}); // Set to empty if default also fails
      }
    } finally {
      setTranslationsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTranslations(language);
  }, [language, fetchTranslations]);

  const changeLanguage = useCallback((lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('appLanguage', lang);
  }, []);

  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    if (translationsLoading || !translations) {
      return key; // Return key or a loading indicator
    }
    let translatedString = getNestedValue(translations, key);

    if (translatedString === undefined) {
      console.warn(`Translation key "${key}" not found for language "${language}".`);
      return key; // Return the key itself if not found
    }

    if (params) {
      Object.keys(params).forEach(paramKey => {
        const regex = new RegExp(`{${paramKey}}`, 'g');
        translatedString = translatedString!.replace(regex, String(params[paramKey]));
      });
    }
    return translatedString!;
  }, [translations, language, translationsLoading]);

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t, translationsLoading }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};