import React, { useContext, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../contexts/AppContext';
import { HSKLevel, Flashcard } from '../types';
import { useFlashcards } from '../contexts/FlashcardContext';
import { ArrowPathIcon, CheckCircleIcon, XCircleIcon, ShareIcon } from '../components/icons';
import { CSSTransition, SwitchTransition } from 'react-transition-group';
import { useLanguage } from '../contexts/LanguageContext';

const FlashcardView: React.FC<{ card: Flashcard, onReveal: () => void, revealed: boolean }> = React.memo(({ card, onReveal, revealed }) => {
  const { t } = useLanguage();
  return (
    <div 
      className="w-full max-w-md h-80 bg-card-light dark:bg-card-dark rounded-xl shadow-2xl p-6 flex flex-col justify-center items-center cursor-pointer perspective"
      onClick={onReveal}
      aria-live="polite"
      role="button"
      tabIndex={0}
      onKeyPress={(e) => (e.key === 'Enter' || e.key === ' ') && onReveal()}
    >
      <div className={`relative w-full h-full preserve-3d transition-transform duration-700 ${revealed ? 'rotate-y-180' : ''}`}>
        {/* Front of Card */}
        <div className="absolute w-full h-full backface-hidden flex flex-col justify-center items-center p-4 border border-border-light dark:border-border-dark rounded-xl">
          <p className="text-6xl font-bold text-primary dark:text-primary-light mb-4 text-center">{card.frontText}</p>
          {!revealed && <p className="text-sm text-gray-500 dark:text-gray-400">{t('flashcardsPage.clickToReveal')}</p>}
        </div>
        {/* Back of Card */}
        <div className="absolute w-full h-full backface-hidden rotate-y-180 flex flex-col justify-center items-center p-4 border border-primary dark:border-primary-light rounded-xl bg-primary-light dark:bg-primary-dark text-white">
          <pre className="text-xl whitespace-pre-wrap text-center">{card.backText}</pre> {/* backText content from data not translated here */}
        </div>
      </div>
    </div>
  );
});


const FlashcardsPage: React.FC = () => {
  const { level: levelString } = useParams<{ level: string }>();
  const navigate = useNavigate();
  const generalAppContext = useContext(AppContext);
  const nodeRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  const {
    activeLevel, deck, studyQueue, currentCardIndexInQueue, revealed, isSessionOver, isLoading,
    startOrResumeFlashcardSession, revealCurrentCard, answerCurrentCard, skipToNextCardInQueue, restartFlashcardSession,
  } = useFlashcards();

  const currentLevelFromParams = levelString ? (Object.values(HSKLevel).find(val => val.replace(/\s+/g, '').toLowerCase() === levelString.toLowerCase()) || HSKLevel[levelString.toUpperCase() as keyof typeof HSKLevel] || HSKLevel[`HSK${levelString}` as keyof typeof HSKLevel]) : undefined;

  useEffect(() => {
    if (currentLevelFromParams) {
      if (generalAppContext) generalAppContext.setCurrentHskLevel(currentLevelFromParams);
      if (activeLevel !== currentLevelFromParams || (isSessionOver && !isLoading) ) {
         startOrResumeFlashcardSession(currentLevelFromParams);
      }
    } else {
      navigate('/');
    }
  }, [currentLevelFromParams, startOrResumeFlashcardSession, navigate, generalAppContext, activeLevel, isSessionOver, isLoading]);


  const handleExportToAnki = useCallback(() => {
    if (!generalAppContext?.showToast || deck.length === 0) {
      generalAppContext?.showToast?.(t('flashcardsPage.ankiExportNoCards'), "info");
      return;
    }
    const ankiData = deck.map(card => {
        const front = card.frontText;
        const back = card.backText.replace(/\n/g, ' || '); 
        const tags = card.hskLevel.replace(/\s+/g, '_');
        return `${front};"${back}";${tags}`;
    }).join('\n');

    const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent("Front;Back;Tags\n" + ankiData);
    const link = document.createElement("a");
    link.setAttribute("href", csvContent);
    link.setAttribute("download", `mandarin_leap_${activeLevel?.replace(/\s+/g, '')}_anki_deck.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    generalAppContext.showToast(t('flashcardsPage.ankiExportSuccess'), "success");
  }, [deck, activeLevel, generalAppContext, t]);


  if (!generalAppContext || !currentLevelFromParams) {
     return <p>{t('common.loading')}</p>;
  }

  if (isLoading) {
    return (
      <div className="text-center">
        <h1 className="text-3xl font-bold text-primary dark:text-primary-light mb-6">{t('flashcardsPage.title', {level: currentLevelFromParams || t('common.loading')})}</h1>
        <div className="flex justify-center items-center mt-8">
          <div className="w-12 h-12 border-4 border-t-primary border-gray-200 dark:border-gray-600 rounded-full animate-spin"></div>
          <p className="ml-4 text-lg">{t('common.loading')}</p>
        </div>
      </div>
    );
  }
  
  if (activeLevel !== currentLevelFromParams && !isLoading) {
    return (
       <div className="text-center">
            <h1 className="text-3xl font-bold text-primary dark:text-primary-light mb-6">{t('flashcardsPage.title', {level: currentLevelFromParams})}</h1>
            <p>{t('exercisesPage.syncingLevel')}</p> {/* Reusing key */}
            <div className="w-8 h-8 border-4 border-t-primary border-gray-200 dark:border-gray-600 rounded-full animate-spin mx-auto mt-4"></div>
       </div>
    );
 }

  if (isSessionOver || studyQueue.length === 0) {
    return (
      <div className="text-center">
        <h1 className="text-3xl font-bold text-primary dark:text-primary-light mb-6">{t('flashcardsPage.title', {level: activeLevel || currentLevelFromParams})}</h1>
        <p className="text-lg text-text-light dark:text-text-dark">
          {deck.length > 0 ? t('flashcardsPage.sessionComplete') : t('flashcardsPage.noFlashcardsAvailable', {level: activeLevel || currentLevelFromParams})}
        </p>
         <button 
            onClick={restartFlashcardSession} 
            className="mt-4 mr-2 bg-primary hover:bg-primary-dark text-white font-semibold py-2 px-4 rounded-md transition-colors"
        >
            <ArrowPathIcon className="w-5 h-5 inline mr-1" /> {deck.length > 0 ? t('flashcardsPage.reloadSession') : t('flashcardsPage.loadFlashcards')}
        </button>
         <button 
            onClick={() => navigate(`/vocabulary/${activeLevel ? activeLevel.replace(/\s+/g, '') : ''}`)} 
            className="mt-4 bg-secondary hover:bg-secondary-dark text-white font-semibold py-2 px-4 rounded-md transition-colors"
        >
            {t('flashcardsPage.goToVocabulary')}
        </button>
      </div>
    );
  }

  const currentCard = studyQueue[currentCardIndexInQueue];
   if (!currentCard) {
     return (
        <div className="text-center">
            <h1 className="text-3xl font-bold text-primary dark:text-primary-light mb-6">{t('flashcardsPage.title', {level: activeLevel || currentLevelFromParams})}</h1>
            <p className="text-red-500">{t('flashcardsPage.errorLoadingCard')}</p>
            <button 
                onClick={restartFlashcardSession}
                className="mt-4 bg-primary hover:bg-primary-dark text-white font-semibold py-2 px-4 rounded-md transition-colors flex items-center mx-auto"
            >
                <ArrowPathIcon className="w-5 h-5 mr-2" /> {t('flashcardsPage.restartSession')}
            </button>
      </div>
     );
  }

  return (
    <div className="flex flex-col items-center">
      <div className="w-full max-w-md flex justify-between items-center mb-2">
        <h1 className="text-3xl font-bold text-primary dark:text-primary-light">{t('flashcardsPage.title', {level: activeLevel || currentLevelFromParams})}</h1>
        <button
            onClick={handleExportToAnki}
            title={t('flashcardsPage.ankiExport')}
            className="p-2 text-primary dark:text-primary-light hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"
            aria-label={t('flashcardsPage.ankiExport')}
        >
            <ShareIcon className="w-6 h-6" />
        </button>
      </div>
      <p className="text-md text-text-light dark:text-text-dark mb-8">
        {t('flashcardsPage.reviewingCard', {
            currentIndex: studyQueue.findIndex(c => c.id === currentCard.id) + 1,
            queueLength: studyQueue.length,
            deckLength: deck.length
        })}
      </p>
      
      <div className="w-full max-w-md min-h-[320px]">
        <SwitchTransition mode="out-in">
          <CSSTransition
            key={currentCard.id}
            nodeRef={nodeRef}
            classNames="flashcard-item-transition"
            timeout={350} 
          >
            <div ref={nodeRef}>
              <FlashcardView card={currentCard} onReveal={revealCurrentCard} revealed={revealed} />
            </div>
          </CSSTransition>
        </SwitchTransition>
      </div>

      {revealed && (
        <div className="mt-8 flex space-x-4">
          <button
            onClick={() => answerCurrentCard(false)}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-transform hover:scale-105 flex items-center"
          >
            <XCircleIcon className="w-5 h-5 mr-2"/> {t('flashcardsPage.notRemembered')}
          </button>
          <button
            onClick={() => answerCurrentCard(true)}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-transform hover:scale-105 flex items-center"
          >
            <CheckCircleIcon className="w-5 h-5 mr-2"/> {t('flashcardsPage.remembered')}
          </button>
        </div>
      )}
      {!revealed && studyQueue.length > 0 && (
         <button
            onClick={revealCurrentCard}
            className="mt-8 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-transform hover:scale-105"
          >
            {t('flashcardsPage.revealAnswer')}
          </button>
      )}
       <button
        onClick={skipToNextCardInQueue}
        disabled={studyQueue.length <= 1}
        className="mt-4 text-sm text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary-light flex items-center disabled:opacity-50"
        aria-label={t('flashcardsPage.skipCard')}
        >
        <ArrowPathIcon className="w-4 h-4 mr-1" /> {t('flashcardsPage.skipCard')}
        </button>
    </div>
  );
};

export default FlashcardsPage;