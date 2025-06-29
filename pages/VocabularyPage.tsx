import React, { useContext, useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../contexts/AppContext';
import { Word, HSKLevel } from '../types';
import { getWordsByLevel } from '../data/hskData';
import { SpeakerWaveIcon, SparklesIcon } from '../components/icons';
import { useLanguage } from '../contexts/LanguageContext';

const WordCard: React.FC<{ word: Word, onPlayAudio: (word: Word) => void, onAddToFlashcards: (word: Word) => void }> = React.memo(({ word, onPlayAudio, onAddToFlashcards }) => {
  const { t } = useLanguage();
  return (
    <div className="bg-card-light dark:bg-card-dark p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="text-2xl font-semibold text-primary dark:text-primary-light">{word.character}</h3>
          <p className="text-md text-gray-600 dark:text-gray-400">{word.pinyin}</p>
        </div>
        <button 
          onClick={() => onPlayAudio(word)} 
          className="p-2 text-primary dark:text-primary-light hover:text-primary-dark dark:hover:text-primary-default rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          title={t('vocabularyPage.playAudio')}
          aria-label={t('vocabularyPage.audioFor', { character: word.character })}
        >
          <SpeakerWaveIcon className="w-6 h-6" />
        </button>
      </div>
      <p className="text-lg text-text-light dark:text-text-dark mb-1">{word.translation}</p> {/* Data translation, not UI text */}
      {word.exampleSentence && (
        <div className="mt-2 pt-2 border-t border-border-light dark:border-border-dark">
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('common.example')}</p>
          <p className="text-sm text-text-light dark:text-text-dark">{word.exampleSentence}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{word.exampleTranslation}</p>
        </div>
      )}
      <button 
        onClick={() => onAddToFlashcards(word)}
        className="mt-3 w-full flex items-center justify-center space-x-2 bg-secondary hover:bg-secondary-dark text-white font-semibold py-2 px-4 rounded-md transition-colors text-sm"
        title={t('vocabularyPage.addToFlashcards')}
      >
        <SparklesIcon className="w-4 h-4" />
        <span>{t('vocabularyPage.addToFlashcards')}</span>
      </button>
    </div>
  );
});

const VocabularyPage: React.FC = () => {
  const { level: levelString } = useParams<{ level: string }>();
  const navigate = useNavigate();
  const context = useContext(AppContext);
  const { t } = useLanguage();
  
  const [words, setWords] = useState<Word[]>([]);
  const currentLevel = levelString ? (Object.values(HSKLevel).find(val => val.replace(/\s+/g, '').toLowerCase() === levelString.toLowerCase()) || HSKLevel[levelString.toUpperCase() as keyof typeof HSKLevel] || HSKLevel[`HSK${levelString}` as keyof typeof HSKLevel]) : undefined;

  const setCurrentHskLevelFromContext = context?.setCurrentHskLevel;
  const showToastFromContext = context?.showToast;
  const updateUserProgressFromContext = context?.updateUserProgress;
  const userProgressFromContext = context?.userProgress;


  useEffect(() => {
    if (!setCurrentHskLevelFromContext || !currentLevel) {
      navigate('/'); 
      return;
    }
    setCurrentHskLevelFromContext(currentLevel);
    const levelWordsData = getWordsByLevel(currentLevel);
    setWords(levelWordsData);
  }, [currentLevel, setCurrentHskLevelFromContext, navigate]);

  const playAudio = useCallback((word: Word) => {
    if (!showToastFromContext) return;
    if (word.audioSrc === 'tts' && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word.character);
      utterance.lang = 'zh-CN';
      speechSynthesis.speak(utterance);
      showToastFromContext(t('common.playingAudioFor', {item: word.character }), 'info');
    } else if (word.audioSrc) {
      showToastFromContext(t('common.playingAudioFor', {item: word.character }), 'info'); // Simplified message
    } else {
      showToastFromContext(t('common.audioNotAvailable', { item: word.character }), 'info');
    }
  }, [showToastFromContext, t]);

  const handleAddToFlashcards = useCallback((word: Word) => {
    if (!showToastFromContext || !updateUserProgressFromContext || !userProgressFromContext) return;
    showToastFromContext(t('common.addedToFlashcardsMock', {item: word.character}), 'success');
    updateUserProgressFromContext({ points: userProgressFromContext.points + 1 });
  }, [showToastFromContext, updateUserProgressFromContext, userProgressFromContext, t]);

  if (!context) return <p>{t('common.loadingContext')}</p>; 

  if (!currentLevel) {
    return <p className="text-center text-red-500">{t('common.hskLevelNotSpecified')}</p>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-primary dark:text-primary-light mb-2">
        {t('vocabularyPage.title', { level: currentLevel })}
      </h1>
      <p className="text-md text-text-light dark:text-text-dark mb-6">
        {t('vocabularyPage.learnWords', { level: currentLevel })}
      </p>
      {words.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400">{t('vocabularyPage.noWords')}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {words.map((word) => (
            <WordCard key={word.id} word={word} onPlayAudio={playAudio} onAddToFlashcards={handleAddToFlashcards} />
          ))}
        </div>
      )}
    </div>
  );
};

export default VocabularyPage;