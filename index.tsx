import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AppProvider } from './contexts/AppContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ExerciseProvider } from './contexts/ExerciseContext';
import { FlashcardProvider } from './contexts/FlashcardContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <LanguageProvider>
      <ThemeProvider>
        <AppProvider>
          <AuthProvider>
            <ExerciseProvider>
              <FlashcardProvider>
                <App />
              </FlashcardProvider>
            </ExerciseProvider>
          </AuthProvider>
        </AppProvider>
      </ThemeProvider>
    </LanguageProvider>
  </React.StrictMode>
);
