import React, { createContext, useState, useCallback, useContext, ReactNode } from 'react';
import { HSKLevel, Flashcard, FlashcardSessionState, FlashcardContextType } from '../types';
import { getFlashcardsByLevel } from '../data/hskData';
import { AppContext, AppContextType as AppContextProps } from './AppContext';
import { useLanguage } from './LanguageContext'; // Import useLanguage

const defaultFlashcardState: FlashcardSessionState = {
  activeLevel: null,
  deck: [],
  studyQueue: [],
  currentCardIndexInQueue: 0,
  revealed: false,
  isSessionOver: false,
  isLoading: false,
};

export const FlashcardContext = createContext<FlashcardContextType | undefined>(undefined);

export const FlashcardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<FlashcardSessionState>(defaultFlashcardState);
  const appContext = useContext(AppContext);
  const { t } = useLanguage(); // Get t function

  if (!appContext) {
    throw new Error("FlashcardContext must be used within an AppProvider");
  }
  const { showToast, updateUserProgress, userProgress } = appContext as AppContextProps;

  const startOrResumeFlashcardSession = useCallback((level: HSKLevel, count: number = 10) => {
    if (level === state.activeLevel && !state.isSessionOver && state.studyQueue.length > 0) {
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, activeLevel: level }));

    setTimeout(() => {
      const newDeck = getFlashcardsByLevel(level, count * 2); 
      const newStudyQueue = [...newDeck].sort(() => Math.random() - 0.5).slice(0, count);
      
      if (newStudyQueue.length === 0) {
        showToast(t('common.toastNotEnoughFlashcards', { level: level }), 'info');
      }
      setState({
        activeLevel: level,
        deck: newDeck,
        studyQueue: newStudyQueue,
        currentCardIndexInQueue: 0,
        revealed: false,
        isSessionOver: newStudyQueue.length === 0,
        isLoading: false,
      });
    }, 50);
  }, [state.activeLevel, state.isSessionOver, state.studyQueue.length, showToast, t]);

  const revealCurrentCard = useCallback(() => {
    if (state.studyQueue.length === 0 || state.revealed) return;
    setState(prev => ({ ...prev, revealed: true }));
  }, [state.studyQueue.length, state.revealed]);

  const answerCurrentCard = useCallback((knewIt: boolean) => {
    if (!state.revealed || state.studyQueue.length === 0) return;
    
    const currentCard = state.studyQueue[state.currentCardIndexInQueue];
    let newStudyQueue = [...state.studyQueue];
    let newCurrentCardIndex = state.currentCardIndexInQueue;

    if (knewIt) {
      newStudyQueue.splice(state.currentCardIndexInQueue, 1);
      updateUserProgress({
        points: userProgress.points + 5,
        flashcardsStudiedToday: userProgress.flashcardsStudiedToday + 1,
      });
      showToast(t('common.toastFlashcardCorrect', { item: currentCard.frontText }), 'success');
    } else {
      const cardToReinsert = newStudyQueue.splice(state.currentCardIndexInQueue, 1)[0];
      const reinsertPosition = Math.min(newStudyQueue.length, state.currentCardIndexInQueue + 3);
      newStudyQueue.splice(reinsertPosition, 0, cardToReinsert);
      
      updateUserProgress({
        points: userProgress.points + 1,
        flashcardsStudiedToday: userProgress.flashcardsStudiedToday + 1,
      });
      showToast(t('common.toastFlashcardReview', { item: currentCard.frontText }), 'info');
    }

    const sessionOver = newStudyQueue.length === 0;
    if (!sessionOver) {
        if (newCurrentCardIndex >= newStudyQueue.length) {
            newCurrentCardIndex = 0; 
        }
    } else {
        showToast(t('common.toastFlashcardSessionComplete', { level: state.activeLevel || '' }), 'success');
        updateUserProgress({ points: userProgress.points + (state.deck.length * 2) }); 
    }
    
    setState(prev => ({
      ...prev,
      studyQueue: newStudyQueue,
      currentCardIndexInQueue: newCurrentCardIndex,
      revealed: false,
      isSessionOver: sessionOver,
    }));

  }, [state, updateUserProgress, userProgress, showToast, t]);

  const skipToNextCardInQueue = useCallback(() => {
    if (state.studyQueue.length <= 1) return;
    const nextIndex = (state.currentCardIndexInQueue + 1) % state.studyQueue.length;
    setState(prev => ({
      ...prev,
      currentCardIndexInQueue: nextIndex,
      revealed: false,
    }));
  }, [state.studyQueue.length, state.currentCardIndexInQueue]);

  const restartFlashcardSession = useCallback(() => {
    if (state.activeLevel) {
      setState(prev => ({ ...prev, isSessionOver: true, isLoading: true })); 
      startOrResumeFlashcardSession(state.activeLevel, state.deck.length > 0 ? Math.min(10, state.deck.length) : 10);
    } else {
      showToast(t('common.toastNotEnoughFlashcards', { level: '' }), "info"); // Simplified
    }
  }, [state.activeLevel, state.deck.length, startOrResumeFlashcardSession, showToast, t]);

  return (
    <FlashcardContext.Provider value={{
      ...state,
      startOrResumeFlashcardSession,
      revealCurrentCard,
      answerCurrentCard,
      skipToNextCardInQueue,
      restartFlashcardSession,
    }}>
      {children}
    </FlashcardContext.Provider>
  );
};

export const useFlashcards = (): FlashcardContextType => {
  const context = useContext(FlashcardContext);
  if (!context) {
    throw new Error('useFlashcards must be used within a FlashcardProvider');
  }
  return context;
};