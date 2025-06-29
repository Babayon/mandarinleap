import React, { useContext, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../contexts/AppContext';
import { HSKLevel, VocabularyExercise, ExerciseOption } from '../types';
import { useExercise } from '../contexts/ExerciseContext';
import { CheckCircleIcon, XCircleIcon, ArrowPathIcon } from '../components/icons';
import { CSSTransition, SwitchTransition } from 'react-transition-group';
import { useLanguage } from '../contexts/LanguageContext';

const ExercisesPage: React.FC = () => {
  const { level: levelString } = useParams<{ level: string }>();
  const navigate = useNavigate();
  const generalAppContext = useContext(AppContext);
  const { t } = useLanguage();

  const {
    activeLevel, exercises, currentIndex, score, selectedOptionId, isAnswered, isSessionOver, isLoading,
    startOrResumeSession, selectOption, submitAnswer, nextExercise, restartCurrentSession
  } = useExercise();

  const currentLevelFromParams = levelString ? (Object.values(HSKLevel).find(val => val.replace(/\s+/g, '').toLowerCase() === levelString.toLowerCase()) || HSKLevel[levelString.toUpperCase() as keyof typeof HSKLevel] || HSKLevel[`HSK${levelString}` as keyof typeof HSKLevel]) : undefined;

  const nodeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentLevelFromParams) {
      if (generalAppContext) generalAppContext.setCurrentHskLevel(currentLevelFromParams);
      startOrResumeSession(currentLevelFromParams);
    } else {
      navigate('/');
    }
  }, [currentLevelFromParams, startOrResumeSession, navigate, generalAppContext]);


  const getQuestionText = useCallback((exercise: VocabularyExercise) => {
    switch(exercise.questionType){
        case 'char_to_translation':
            return t('exercisesPage.questionCharToTranslation', { prompt: exercise.questionPrompt });
        case 'translation_to_char':
            return t('exercisesPage.questionTranslationToChar', { prompt: exercise.questionPrompt });
        default:
            return exercise.questionPrompt; // Fallback, ideally all types have keys
    }
  }, [t]);

  if (!generalAppContext) return <p>{t('common.loadingContext')}</p>;

  if (isLoading) {
    return (
      <div className="text-center">
        <h1 className="text-3xl font-bold text-primary dark:text-primary-light mb-6">{t('exercisesPage.title', {level: currentLevelFromParams || t('common.loading')})}</h1>
        <div className="flex justify-center items-center mt-8">
          <div className="w-12 h-12 border-4 border-t-primary border-gray-200 dark:border-gray-600 rounded-full animate-spin"></div>
          <p className="ml-4 text-lg">{t('exercisesPage.loadingExercises')}</p>
        </div>
      </div>
    );
  }
  
  if (!currentLevelFromParams) {
    return <p className="text-center text-red-500">{t('common.hskLevelNotSpecified')}</p>;
  }
  
  if (activeLevel !== currentLevelFromParams && !isLoading) {
     return (
        <div className="text-center">
             <h1 className="text-3xl font-bold text-primary dark:text-primary-light mb-6">{t('exercisesPage.title', {level: currentLevelFromParams})}</h1>
             <p>{t('exercisesPage.syncingLevel')}</p>
             <div className="w-8 h-8 border-4 border-t-primary border-gray-200 dark:border-gray-600 rounded-full animate-spin mx-auto mt-4"></div>
        </div>
     );
  }

  if (isSessionOver || exercises.length === 0) {
    return (
      <div className="text-center">
        <h1 className="text-3xl font-bold text-primary dark:text-primary-light mb-6">{t('exercisesPage.title', {level: activeLevel || currentLevelFromParams})}</h1>
        <p className="text-lg text-text-light dark:text-text-dark mb-4">
          {exercises.length > 0 ? t('exercisesPage.sessionComplete', {score: score, totalExercises: exercises.length}) : t('exercisesPage.noExercisesAvailable', {level: activeLevel || currentLevelFromParams})}
        </p>
        <button
            onClick={restartCurrentSession}
            className="mt-4 bg-primary hover:bg-primary-dark text-white font-semibold py-2 px-6 rounded-md transition-colors flex items-center mx-auto"
        >
            <ArrowPathIcon className="w-5 h-5 mr-2" /> {exercises.length > 0 ? t('exercisesPage.restartSession') : t('exercisesPage.loadExercises')}
        </button>
      </div>
    );
  }

  const currentExercise = exercises[currentIndex];
  if (!currentExercise) {
     return (
        <div className="text-center">
            <h1 className="text-3xl font-bold text-primary dark:text-primary-light mb-6">{t('exercisesPage.title', {level: activeLevel || currentLevelFromParams})}</h1>
            <p className="text-red-500">{t('exercisesPage.errorLoadingExercise')}</p>
            <button 
                onClick={restartCurrentSession}
                className="mt-4 bg-primary hover:bg-primary-dark text-white font-semibold py-2 px-4 rounded-md transition-colors flex items-center mx-auto"
            >
                <ArrowPathIcon className="w-5 h-5 mr-2" /> {t('exercisesPage.restartSession')}
            </button>
      </div>
     );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-primary dark:text-primary-light mb-2">{t('exercisesPage.title', {level: activeLevel || currentLevelFromParams})}</h1>
      <p className="text-md text-text-light dark:text-text-dark mb-6">
        {t('exercisesPage.exerciseProgress', {currentIndex: currentIndex + 1, totalExercises: exercises.length, score: score})}
      </p>

      <SwitchTransition mode="out-in">
        <CSSTransition
          key={currentIndex} 
          nodeRef={nodeRef}
          classNames="exercise-transition"
          timeout={300}
        >
          <div ref={nodeRef} className="bg-card-light dark:bg-card-dark p-6 rounded-lg shadow-xl">
            <h2 className="text-xl font-semibold text-text-light dark:text-text-dark mb-4 min-h-[56px]">
              {getQuestionText(currentExercise)}
            </h2>
            
            <div className="space-y-3">
              {currentExercise.options.map((option: ExerciseOption) => {
                const isCorrectAnswer = option.id === currentExercise.correctAnswerId;
                let buttonClass = "w-full text-left p-3 rounded-md border transition-all duration-150 ease-in-out ";
                if (isAnswered) {
                  if (isCorrectAnswer) {
                    buttonClass += "bg-green-500 border-green-600 text-white transform scale-105 shadow-md";
                  } else if (option.id === selectedOptionId) {
                    buttonClass += "bg-red-500 border-red-600 text-white shadow-md";
                  } else {
                    buttonClass += "bg-card-light dark:bg-card-dark border-border-light dark:border-border-dark opacity-60";
                  }
                } else {
                  buttonClass += selectedOptionId === option.id 
                    ? "bg-primary-light dark:bg-primary-dark border-primary dark:border-primary-light text-white ring-2 ring-primary dark:ring-primary-light shadow-md" 
                    : "bg-background-light dark:bg-background-dark hover:bg-gray-200 dark:hover:bg-gray-700 border-border-light dark:border-border-dark";
                }

                return (
                  <button
                    key={option.id}
                    onClick={() => selectOption(option.id)}
                    disabled={isAnswered}
                    className={buttonClass}
                    aria-pressed={selectedOptionId === option.id}
                  >
                    {option.text} {/* Option text from data, not translated here */}
                    {isAnswered && isCorrectAnswer && <CheckCircleIcon className="w-5 h-5 inline-block ml-2 text-white" aria-label={t('exercisesPage.correct')}/>}
                    {isAnswered && !isCorrectAnswer && option.id === selectedOptionId && <XCircleIcon className="w-5 h-5 inline-block ml-2 text-white" aria-label={t('exercisesPage.incorrect', {correctAnswer: ''})}/>}
                  </button>
                );
              })}
            </div>

            <div className="mt-6 min-h-[60px] flex items-center justify-end">
              {!isAnswered ? (
                <button
                  onClick={submitAnswer}
                  disabled={!selectedOptionId}
                  className="bg-secondary hover:bg-secondary-dark text-white font-semibold py-2 px-6 rounded-md transition-colors disabled:opacity-50"
                >
                  {t('exercisesPage.checkAnswer')}
                </button>
              ) : (
                <button
                  onClick={nextExercise}
                  className="bg-primary hover:bg-primary-dark text-white font-semibold py-2 px-6 rounded-md transition-colors"
                >
                  {t('exercisesPage.nextExercise')}
                </button>
              )}
            </div>
            {isAnswered && (
                <div className={`mt-4 p-3 rounded text-sm text-center ${selectedOptionId === currentExercise.correctAnswerId ? 'bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-200' : 'bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-200'}`}
                     role="alert" 
                >
                    {selectedOptionId === currentExercise.correctAnswerId ? t('exercisesPage.correct') : t('exercisesPage.incorrect', {correctAnswer: currentExercise.options.find(o => o.id === currentExercise.correctAnswerId)?.text || ''})}
                </div>
            )}
          </div>
        </CSSTransition>
      </SwitchTransition>
      <button 
            onClick={restartCurrentSession}
            className="mt-8 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-text-light dark:text-text-dark font-semibold py-2 px-4 rounded-md transition-colors flex items-center mx-auto text-sm"
        >
            <ArrowPathIcon className="w-4 h-4 mr-2" /> {t('exercisesPage.restartSession')}
      </button>
    </div>
  );
};

export default ExercisesPage;