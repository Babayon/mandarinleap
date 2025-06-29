import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { HSKLevel, UserProgress, AppContextType as BaseAppContextType } from '../types'; // Renamed to avoid conflict

// Define AppContextType without theme-related properties
export interface AppContextType extends Omit<BaseAppContextType, 'theme' | 'toggleTheme'> {}


export const AppContext = createContext<AppContextType | undefined>(undefined);

interface ToastState {
  message: string;
  type: 'success' | 'error' | 'info';
  id: number;
}

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Theme state is now managed by ThemeContext
  // const [theme, setTheme] = useState<Theme>(() => { ... });

  const [currentHskLevel, setCurrentHskLevel] = useState<HSKLevel>(HSKLevel.HSK1);
  const [userProgress, setUserProgress] = useState<UserProgress>(() => {
    const savedProgress = localStorage.getItem('userProgress');
    return savedProgress ? JSON.parse(savedProgress) : {
      points: 0,
      currentHskLevel: HSKLevel.HSK1,
      flashcardsStudiedToday: 0,
      badges: [],
    };
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastState[]>([]);

  // useEffect for theme is now in ThemeContext
  // useEffect(() => {
  //   localStorage.setItem('theme', theme);
  //   if (theme === 'dark') {
  //     document.documentElement.classList.add('dark');
  //   } else {
  //     document.documentElement.classList.remove('dark');
  //   }
  // }, [theme]);

  useEffect(() => {
    localStorage.setItem('userProgress', JSON.stringify(userProgress));
  }, [userProgress]);

  // toggleTheme is now in ThemeContext
  // const toggleTheme = useCallback(() => { ... });

  const updateUserProgress = useCallback((newProgress: Partial<UserProgress>) => {
    setUserProgress((prev) => ({ ...prev, ...newProgress }));
  }, []);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now();
    setToasts((prevToasts) => [...prevToasts, { id, message, type }]);
    setTimeout(() => {
      setToasts((prevToasts) => prevToasts.filter(toast => toast.id !== id));
    }, 3000);
  }, []);


  return (
    <AppContext.Provider value={{ 
        // theme and toggleTheme removed
        currentHskLevel, 
        setCurrentHskLevel, 
        userProgress, 
        updateUserProgress,
        isLoading,
        setIsLoading,
        showToast 
      }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 space-y-2">
        {toasts.map(toast => (
          <div key={toast.id} className={`p-4 rounded-md shadow-lg text-white ${
            toast.type === 'success' ? 'bg-green-500' :
            toast.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
          }`}>
            {toast.message}
          </div>
        ))}
      </div>
    </AppContext.Provider>
  );
};
