import React, { useState, FormEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { SparklesIcon, GoogleIcon } from '../components/icons';
import { AppContext } from '../contexts/AppContext';

const AuthPage: React.FC = () => {
  const [isLoginView, setIsLoginView] = useState(true);
  const { login, register, googleLogin } = useAuth();
  const { t } = useLanguage();
  const appContext = React.useContext(AppContext);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleFormSwitch = () => {
    setIsLoginView(!isLoginView);
    setError('');
    // Clear form fields on switch
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  const handleLoginSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError(t('authPage.error.fieldsRequired'));
      return;
    }
    setError('');
    setIsLoading(true);
    const success = await login(email, password);
    if (!success) {
        // Error is shown via toast from context, but we can set a local one too
        setError(t('authPage.error.invalidCredentials'));
    }
    setIsLoading(false);
  };

  const handleRegisterSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      setError(t('authPage.error.fieldsRequired'));
      return;
    }
    if (password !== confirmPassword) {
      setError(t('authPage.error.passwordsDontMatch'));
      return;
    }
    setError('');
    setIsLoading(true);
    await register(name, email, password);
    // On success, user is redirected automatically by App.tsx
    // On failure, toast is shown from context
    setIsLoading(false);
  };
  
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    await googleLogin();
    setIsLoading(false);
  };

  const commonInputClass = "w-full px-4 py-3 bg-background-light dark:bg-gray-800 border border-border-light dark:border-border-dark rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition";

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col justify-center items-center p-4 transition-colors duration-300">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
            <SparklesIcon className="w-16 h-16 mx-auto text-primary dark:text-primary-light" />
            <h1 className="text-4xl font-bold text-primary dark:text-primary-light mt-2">{t('appName')}</h1>
            <p className="text-text-light dark:text-text-dark mt-2">{t('homePage.welcomeSubtitle')}</p>
        </div>
        
        <div className="bg-card-light dark:bg-card-dark shadow-2xl rounded-xl p-8">
            <h2 className="text-2xl font-bold text-center text-text-light dark:text-text-dark mb-1">{isLoginView ? t('authPage.loginTitle') : t('authPage.registerTitle')}</h2>
            <p className="text-center text-gray-500 dark:text-gray-400 mb-6">{isLoginView ? t('authPage.loginSubtitle') : t('authPage.registerSubtitle')}</p>

            {error && <p className="bg-red-100 text-red-700 p-3 rounded-md text-sm mb-4 text-center">{error}</p>}
            
            <form onSubmit={isLoginView ? handleLoginSubmit : handleRegisterSubmit} className="space-y-4">
              {!isLoginView && (
                <div>
                  <label className="text-sm font-medium text-text-light dark:text-text-dark" htmlFor="name">{t('authPage.nameLabel')}</label>
                  <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} className={commonInputClass} required />
                </div>
              )}
               <div>
                  <label className="text-sm font-medium text-text-light dark:text-text-dark" htmlFor="email">{t('authPage.emailLabel')}</label>
                  <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} className={commonInputClass} required />
                </div>
                <div>
                  <label className="text-sm font-medium text-text-light dark:text-text-dark" htmlFor="password">{t('authPage.passwordLabel')}</label>
                  <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} className={commonInputClass} required />
                </div>
              {!isLoginView && (
                <div>
                  <label className="text-sm font-medium text-text-light dark:text-text-dark" htmlFor="confirmPassword">{t('authPage.confirmPasswordLabel')}</label>
                  <input id="confirmPassword" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className={commonInputClass} required />
                </div>
              )}
              <button type="submit" disabled={isLoading} className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50">
                {isLoading ? t('common.loading') : (isLoginView ? t('authPage.loginButton') : t('authPage.registerButton'))}
              </button>
            </form>

            <div className="my-6 flex items-center">
                <div className="flex-grow border-t border-border-light dark:border-border-dark"></div>
                <span className="flex-shrink mx-4 text-gray-400 dark:text-gray-500 text-sm">{t('authPage.or')}</span>
                <div className="flex-grow border-t border-border-light dark:border-border-dark"></div>
            </div>

            <button onClick={handleGoogleLogin} disabled={isLoading} className="w-full flex justify-center items-center bg-white dark:bg-gray-800 text-text-light dark:text-text-dark border border-border-light dark:border-border-dark rounded-lg py-3 px-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <GoogleIcon className="w-6 h-6 mr-3" />
                <span className="font-semibold">{t('authPage.googleButton')}</span>
            </button>
        </div>

        <div className="mt-6 text-center">
            <button 
                onClick={handleFormSwitch}
                className="text-primary dark:text-primary-light hover:underline font-medium"
            >
                {isLoginView ? t('authPage.switchToRegister') : t('authPage.switchToLogin')}
            </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
