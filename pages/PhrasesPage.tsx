import React, { useContext, useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../contexts/AppContext';
import { Phrase, HSKLevel } from '../types';
import { getPhrasesByLevel } from '../data/hskData';
import { SpeakerWaveIcon } from '../components/icons';
import { useLanguage } from '../contexts/LanguageContext';

const PhraseCard: React.FC<{ phrase: Phrase, onPlayAudio: (phrase: Phrase) => void }> = React.memo(({ phrase, onPlayAudio }) => {
  const { t } = useLanguage();
  return (
    <div className="bg-card-light dark:bg-card-dark p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="text-xl font-semibold text-primary dark:text-primary-light">{phrase.chinese}</h3>
          <p className="text-md text-gray-600 dark:text-gray-400">{phrase.pinyin}</p>
        </div>
        {phrase.audioSrc && (
          <button 
            onClick={() => onPlayAudio(phrase)} 
            className="p-2 text-primary dark:text-primary-light hover:text-primary-dark dark:hover:text-primary-default rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            title={t('vocabularyPage.playAudio')} // Reusing key, consider a specific one
          >
            <SpeakerWaveIcon className="w-6 h-6" />
          </button>
        )}
      </div>
      <p className="text-lg text-text-light dark:text-text-dark">{phrase.translation}</p> {/* Data translation */}
    </div>
  );
});

const PhrasesPage: React.FC = () => {
  const { level: levelString } = useParams<{ level: string }>();
  const navigate = useNavigate();
  const context = useContext(AppContext);
  const { t } = useLanguage();
  
  const [phrases, setPhrases] = useState<Phrase[]>([]);
  const currentLevel = levelString ? (Object.values(HSKLevel).find(val => val.replace(/\s+/g, '').toLowerCase() === levelString.toLowerCase()) || HSKLevel[levelString.toUpperCase() as keyof typeof HSKLevel] || HSKLevel[`HSK${levelString}` as keyof typeof HSKLevel]) : undefined;

  const setCurrentHskLevelFromContext = context?.setCurrentHskLevel;
  const showToastFromContext = context?.showToast;

  useEffect(() => {
    if (!setCurrentHskLevelFromContext || !currentLevel) {
      navigate('/'); 
      return;
    }
    setCurrentHskLevelFromContext(currentLevel);
    const levelPhrasesData = getPhrasesByLevel(currentLevel);
    setPhrases(levelPhrasesData);
  }, [currentLevel, setCurrentHskLevelFromContext, navigate]);

  const playAudio = useCallback((phrase: Phrase) => {
    if (!showToastFromContext) return;
    if (phrase.audioSrc === 'tts' && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(phrase.chinese);
      utterance.lang = 'zh-CN';
      speechSynthesis.speak(utterance);
      showToastFromContext(t('common.playingAudioFor', {item: phrase.chinese}), 'info');
    } else if (phrase.audioSrc) {
      showToastFromContext(t('common.playingAudioFor', {item: phrase.chinese}), 'info');
    } else {
      showToastFromContext(t('common.audioNotAvailable', {item: phrase.chinese}), 'info');
    }
  }, [showToastFromContext, t]);

  if (!context) return <p>{t('common.loadingContext')}</p>;

  if (!currentLevel) {
    return <p className="text-center text-red-500">{t('common.hskLevelNotSpecified')}</p>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-primary dark:text-primary-light mb-2">
        {t('phrasesPage.title', { level: currentLevel })}
      </h1>
      <p className="text-md text-text-light dark:text-text-dark mb-6">
        {t('phrasesPage.learnPhrases', { level: currentLevel })}
      </p>
      {phrases.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400">{t('phrasesPage.noPhrases')}</p>
      ) : (
        <div className="space-y-4">
          {phrases.map((phrase) => (
            <PhraseCard key={phrase.id} phrase={phrase} onPlayAudio={playAudio} />
          ))}
        </div>
      )}
    </div>
  );
};

export default PhrasesPage;