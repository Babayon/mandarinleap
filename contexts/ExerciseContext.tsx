import React, { createContext, useState, useCallback, useContext, ReactNode, useEffect } from 'react';
import { HSKLevel, VocabularyExercise, ExerciseState, ExerciseContextType } from '../types';
import { generateVocabularyExercises } from '../data/hskData';
import { AppContext, AppContextType as AppContextProps } from './AppContext';
import { useLanguage } from './LanguageContext'; // Import useLanguage

const defaultExerciseState: ExerciseState = {
  activeLevel: null,
  exercises: [],
  currentIndex: 0,
  score: 0,
  selectedOptionId: null,
  isAnswered: false,
  isSessionOver: false,
  isLoading: false,
};

export const ExerciseContext = createContext<ExerciseContextType | undefined>(undefined);

export const ExerciseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<ExerciseState>(defaultExerciseState);
  const appContext = useContext(AppContext);
  const { t } = useLanguage(); // Get t function

  if (!appContext) {
    throw new Error("ExerciseContext must be used within an AppProvider");
  }
  const { showToast, updateUserProgress, userProgress } = appContext as AppContextProps;


  const startOrResumeSession = useCallback((level: HSKLevel, count: number = 5) => {
    if (level === state.activeLevel && !state.isSessionOver && state.exercises.length > 0) {
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, activeLevel: level }));

    setTimeout(() => {
        const newExercises = generateVocabularyExercises(level, count);
        if (newExercises.length === 0) {
            showToast(t('common.toastNotEnoughExercises', { level: level }), 'info');
        }
        setState({
          activeLevel: level,
          exercises: newExercises,
          currentIndex: 0,
          score: 0,
          selectedOptionId: null,
          isAnswered: false,
          isSessionOver: newExercises.length === 0,
          isLoading: false,
        });
    }, 50);

  }, [state.activeLevel, state.isSessionOver, state.exercises.length, showToast, t]);

  const selectOption = useCallback((optionId: string) => {
    if (state.isAnswered) return;
    setState(prev => ({ ...prev, selectedOptionId: optionId }));
  }, [state.isAnswered]);

  const submitAnswer = useCallback(() => {
    if (!state.selectedOptionId || state.isAnswered || state.exercises.length === 0) return;

    const currentExercise = state.exercises[state.currentIndex];
    const isCorrect = state.selectedOptionId === currentExercise.correctAnswerId;
    let newScore = state.score;

    if (isCorrect) {
      newScore += 1;
      updateUserProgress({ points: userProgress.points + 10 });
      showToast(t('common.toastCorrectAnswer'), 'success');
    } else {
      updateUserProgress({ points: userProgress.points + 2 });
      showToast(t('common.toastIncorrectAnswer'), 'error');
    }
    setState(prev => ({ ...prev, isAnswered: true, score: newScore }));
  }, [state, updateUserProgress, userProgress, showToast, t]);

  const nextExercise = useCallback(() => {
    if (state.currentIndex < state.exercises.length - 1) {
      setState(prev => ({
        ...prev,
        currentIndex: prev.currentIndex + 1,
        selectedOptionId: null,
        isAnswered: false,
      }));
    } else {
      setState(prev => ({ ...prev, isSessionOver: true }));
      showToast(t('common.toastExerciseSessionComplete', { score: state.score, total: state.exercises.length }), 'info');
      updateUserProgress({ points: userProgress.points + (state.score * 5) });
    }
  }, [state, showToast, updateUserProgress, userProgress, t]);
  
  const restartCurrentSession = useCallback(() => {
    if (state.activeLevel) {
      setState(prev => ({ ...prev, isSessionOver: true, isLoading: true }));
      startOrResumeSession(state.activeLevel, state.exercises.length || 5);
    } else {
        showToast(t('common.toastNotEnoughExercises', {level: ''}), "info"); // Simplified message
    }
  }, [state.activeLevel, state.exercises.length, startOrResumeSession, showToast, t]);


  return (
    <ExerciseContext.Provider value={{
      ...state,
      startOrResumeSession,
      selectOption,
      submitAnswer,
      nextExercise,
      restartCurrentSession
    }}>
      {children}
    </ExerciseContext.Provider>
  );
};

export const useExercise = (): ExerciseContextType => {
  const context = useContext(ExerciseContext);
  if (!context) {
    throw new Error('useExercise must be used within an ExerciseProvider');
  }
  return context;
};