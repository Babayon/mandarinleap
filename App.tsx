import React, { useContext } from 'react';
import { HashRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { AppContext } from './contexts/AppContext';
import { useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import VocabularyPage from './pages/VocabularyPage';
import PronunciationPage from './pages/PronunciationPracticePage';
import FlashcardsPage from './pages/FlashcardsPage';
import ChatbotPage from './pages/ChatbotPage';
import PhrasesPage from './pages/PhrasesPage';
import ExercisesPage from './pages/ExercisesPage';
import LoadingSpinner from './components/LoadingSpinner';
import ToastNotification from './components/ToastNotification';
import AuthPage from './pages/AuthPage';

// Main layout for authenticated users, includes Navbar and Footer
const AppLayout: React.FC = () => (
  <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark">
    <Navbar />
    <main className="flex-grow container mx-auto px-4 py-8">
      <Outlet /> {/* Child routes will render here */}
    </main>
    <Footer />
  </div>
);

const App: React.FC = () => {
  const appContext = useContext(AppContext);
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  if (!appContext) {
    throw new Error("AppContext not found. Ensure App is wrapped in AppProvider.");
  }
  const { isLoading: isAppLoading } = appContext;

  // Show a loading spinner while checking auth status from localStorage
  if (isAuthLoading) {
    return <LoadingSpinner />;
  }

  return (
    <HashRouter>
      {isAppLoading && <LoadingSpinner />}
      <ToastNotification />
      <Routes>
        {isAuthenticated ? (
          // Protected Routes for logged-in users
          <Route path="/" element={<AppLayout />}>
            <Route index element={<HomePage />} />
            <Route path="/vocabulary/:level" element={<VocabularyPage />} />
            <Route path="/phrases/:level" element={<PhrasesPage />} />
            <Route path="/pronunciation/:level" element={<PronunciationPage />} />
            <Route path="/flashcards/:level" element={<FlashcardsPage />} />
            <Route path="/exercises/:level" element={<ExercisesPage />} />
            <Route path="/chatbot" element={<ChatbotPage />} />
            {/* Redirect any other authenticated path to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        ) : (
          // Public Routes for guests
          <>
            <Route path="/auth" element={<AuthPage />} />
            {/* Redirect any other unauthenticated path to the auth page */}
            <Route path="*" element={<Navigate to="/auth" replace />} />
          </>
        )}
      </Routes>
    </HashRouter>
  );
};

export default App;
