import React, { createContext, useState, useEffect, useCallback, ReactNode, useContext } from 'react';
import { User, AuthContextType } from '../types';
import { AppContext } from './AppContext';
import { useLanguage } from './LanguageContext';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const appContext = useContext(AppContext);
  const { t } = useLanguage();

  useEffect(() => {
    // Check for a logged-in user in localStorage on initial load
    try {
      const storedUser = localStorage.getItem('authUser');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse auth user from localStorage", error);
      localStorage.removeItem('authUser');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    // MOCK LOGIN: In a real app, this would be an API call.
    // We check for a user registered via our mock registration.
    const storedUser = localStorage.getItem(`user_${email}`);
    if (storedUser) {
        const userData = JSON.parse(storedUser);
        // In a real app, you'd send the password to the backend to be verified.
        // Here, we just check if a password was stored during registration.
        if (userData.password) {
            const userToSave: User = { name: userData.name, email: userData.email };
            localStorage.setItem('authUser', JSON.stringify(userToSave));
            setUser(userToSave);
            appContext?.showToast(t('auth.welcomeBack', { name: userData.name }), 'success');
            return true;
        }
    }
    appContext?.showToast(t('authPage.error.invalidCredentials'), 'error');
    return false;
  }, [appContext, t]);

  const googleLogin = useCallback(async (): Promise<boolean> => {
    // MOCK GOOGLE LOGIN: Simulates a successful Google authentication.
    const mockUser: User = {
        name: 'Google User',
        email: 'google.user@example.com',
        photo: 'https://i.pravatar.cc/150?u=google' // Mock avatar
    };
    localStorage.setItem('authUser', JSON.stringify(mockUser));
    setUser(mockUser);
    appContext?.showToast(t('auth.welcomeGoogle', { name: mockUser.name }), 'success');
    return true;
  }, [appContext, t]);

  const register = useCallback(async (name: string, email: string, password: string): Promise<boolean> => {
    // MOCK REGISTRATION: In a real app, this would be an API call.
    // We store the "registered" user in localStorage.
    if (localStorage.getItem(`user_${email}`)) {
        appContext?.showToast(t('auth.emailExists'), 'error');
        return false;
    }
    // Storing the full user object with a password for the mock login to "verify"
    const newUser = { name, email, password }; 
    localStorage.setItem(`user_${email}`, JSON.stringify(newUser));
    
    // Log the user in immediately after registration
    const userToSave: User = { name, email };
    localStorage.setItem('authUser', JSON.stringify(userToSave));
    setUser(userToSave);
    appContext?.showToast(t('auth.accountCreated', { name: name }), 'success');
    return true;
  }, [appContext, t]);

  const logout = useCallback(() => {
    localStorage.removeItem('authUser');
    setUser(null);
    appContext?.showToast(t('auth.loggedOut'), 'info');
  }, [appContext, t]);
  
  const isAuthenticated = !!user;

  const value = { user, isAuthenticated, isLoading, login, register, googleLogin, logout };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};