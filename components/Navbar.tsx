import React, { useContext, useCallback, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AppContext } from '../contexts/AppContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage, Language } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { 
    SunIcon, MoonIcon, BookOpenIcon, MicrophoneIcon, ChatBubbleLeftRightIcon, 
    SparklesIcon, Bars3BottomLeftIcon, PuzzlePieceIcon, LanguageIcon as GlobeIcon, 
    UserCircleIcon, ArrowRightOnRectangleIcon 
} from './icons';

const Navbar: React.FC = () => {
  const appContext = useContext(AppContext);
  const { theme, toggleTheme } = useTheme();
  const { language, changeLanguage, t, translationsLoading } = useLanguage();
  const { user, logout } = useAuth();
  const location = useLocation();
  
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  if (!appContext) return null;
  const { currentHskLevel } = appContext;

  const hskLevelPath = currentHskLevel.replace(/\s+/g, '');

  const navItems = [
    { path: `/vocabulary/${hskLevelPath}`, translationKey: 'navbar.vocabulary', icon: <BookOpenIcon className="w-5 h-5" /> },
    { path: `/phrases/${hskLevelPath}`, translationKey: 'navbar.phrases', icon: <Bars3BottomLeftIcon className="w-5 h-5" /> },
    { path: `/pronunciation/${hskLevelPath}`, translationKey: 'navbar.pronunciation', icon: <MicrophoneIcon className="w-5 h-5" /> },
    { path: `/flashcards/${hskLevelPath}`, translationKey: 'navbar.flashcards', icon: <SparklesIcon className="w-5 h-5" /> },
    { path: `/exercises/${hskLevelPath}`, translationKey: 'navbar.exercises', icon: <PuzzlePieceIcon className="w-5 h-5" /> },
    { path: '/chatbot', translationKey: 'navbar.chatbot', icon: <ChatBubbleLeftRightIcon className="w-5 h-5" /> },
  ];

  const isActive = useCallback((itemPath: string) => {
    if (itemPath === '/chatbot') {
        return location.pathname === '/chatbot';
    }
    const baseItemPath = itemPath.substring(0, itemPath.lastIndexOf('/'));
    const currentLocationBase = location.pathname.substring(0, location.pathname.lastIndexOf('/'));
    return currentLocationBase === baseItemPath && location.pathname.endsWith(hskLevelPath);
  }, [location.pathname, hskLevelPath]);

  const handleLanguageChange = (lang: Language) => {
    changeLanguage(lang);
    setLangDropdownOpen(false);
  };

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
  };

  if (translationsLoading && !t('appName')) { 
    return (
        <nav className="bg-primary-light dark:bg-primary-dark shadow-md">
         <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            <span className="text-2xl font-bold text-white">Loading...</span>
         </div>
        </nav>
    );
  }

  return (
    <nav className="bg-primary-light dark:bg-primary-dark shadow-md">
      <div className="container mx-auto px-4 py-3 flex flex-wrap justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-white hover:text-secondary-light dark:hover:text-secondary">
          {t('appName')}
        </Link>
        
        <div className="flex items-center space-x-1 sm:space-x-2">
          {navItems.map(item => (
            <Link
              key={item.translationKey}
              to={item.path}
              title={t(item.translationKey)}
              className={`flex items-center space-x-1 px-2 py-1 rounded-md text-sm font-medium transition-colors
                ${isActive(item.path)
                  ? 'bg-primary-dark dark:bg-primary text-white ring-2 ring-white' 
                  : 'text-white hover:bg-primary-dark dark:hover:bg-primary hover:text-white'
                }`}
            >
              {item.icon}
              <span className="hidden md:inline">{t(item.translationKey)}</span>
            </Link>
          ))}
          
          <div className="relative">
            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="p-2 rounded-full text-white hover:bg-primary-dark dark:hover:bg-primary focus:outline-none transition-colors flex items-center"
              aria-label={t('navbar.language')}
              aria-haspopup="true"
              aria-expanded={langDropdownOpen}
            >
              <GlobeIcon className="w-6 h-6" />
            </button>
            {langDropdownOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-card-light dark:bg-card-dark rounded-md shadow-lg py-1 z-50 ring-1 ring-black ring-opacity-5">
                {(['pt', 'en', 'es'] as Language[]).map(lang => (
                  <button
                    key={lang}
                    onClick={() => handleLanguageChange(lang)}
                    className={`block w-full text-left px-4 py-2 text-sm 
                      ${language === lang 
                        ? 'bg-primary-light dark:bg-primary text-white' 
                        : 'text-text-light dark:text-text-dark hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                  >
                    {t(`languages.${lang}`)}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-white hover:bg-primary-dark dark:hover:bg-primary focus:outline-none transition-colors"
            aria-label={t('navbar.toggleTheme')}
          >
            {theme === 'light' ? <MoonIcon className="w-6 h-6" /> : <SunIcon className="w-6 h-6" />}
          </button>

          <div className="relative">
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="p-2 rounded-full text-white hover:bg-primary-dark dark:hover:bg-primary focus:outline-none transition-colors flex items-center"
              aria-label={t('navbar.userMenu')}
              aria-haspopup="true"
              aria-expanded={userDropdownOpen}
            >
              {user?.photo ? (
                  <img src={user.photo} alt="User" className="w-6 h-6 rounded-full" />
              ) : (
                  <UserCircleIcon className="w-6 h-6" />
              )}
            </button>
            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-card-light dark:bg-card-dark rounded-md shadow-lg py-1 z-50 ring-1 ring-black ring-opacity-5">
                <div className="px-4 py-3">
                    <p className="text-sm text-text-light dark:text-text-dark">{t('navbar.loggedInAs')}</p>
                    <p className="text-sm font-medium text-text-light dark:text-text-dark truncate">{user?.name}</p>
                </div>
                <div className="border-t border-border-light dark:border-border-dark"></div>
                <button
                    onClick={handleLogout}
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                    <ArrowRightOnRectangleIcon className="w-5 h-5 mr-2" />
                    {t('navbar.logout')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
