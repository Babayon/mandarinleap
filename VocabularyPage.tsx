
import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../contexts/AppContext';
import { Word, HSKLevel } from '../types';
import { getWordsByLevel } from '../data/hskData';
import { SpeakerWaveIcon, SparklesIcon } from '../components/icons';

const WordCard: React.FC<{ word: Word, onPlayAudio: (word: Word) => void, onAddToFlashcards: (word: Word) => void }> = ({ word, onPlayAudio, onAddToFlashcards }) => {
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
          title="Ouvir pronúncia"
          aria-label={`Ouvir ${word.character}`}
        >
          <SpeakerWaveIcon className="w-6 h-6" />
        </button>
      </div>
      <p className="text-lg text-text-light dark:text-text-dark mb-1">{word.translation}</p>
      {word.exampleSentence && (
        <div className="mt-2 pt-2 border-t border-border-light dark:border-border-dark">
          <p className="text-sm text-gray-500 dark:text-gray-400">Exemplo:</p>
          <p className="text-sm text-text-light dark:text-text-dark">{word.exampleSentence}</p>
          {/* Pinyin do exemplo pode ser útil aqui, se disponível nos dados */}
          {/* <p className="text-xs text-gray-500 dark:text-gray-400">{word.examplePinyin}</p> */}
          <p className="text-xs text-gray-500 dark:text-gray-400">{word.exampleTranslation}</p>
        </div>
      )}
      <button 
        onClick={() => onAddToFlashcards(word)}
        className="mt-3 w-full flex items-center justify-center space-x-2 bg-secondary hover:bg-secondary-dark text-white font-semibold py-2 px-4 rounded-md transition-colors text-sm"
        title="Adicionar aos flashcards"
      >
        <SparklesIcon className="w-4 h-4" />
        <span>Flashcards</span>
      </button>
    </div>
  );
};

const VocabularyPage: React.FC = () => {
  const { level: levelString } = useParams<{ level: string }>();
  const navigate = useNavigate();
  const context = useContext(AppContext);
  
  const [words, setWords] = useState<Word[]>([]);
  // Robust HSKLevel parsing from URL parameter
  const currentLevel = levelString ? (Object.values(HSKLevel).find(val => val.replace(/\s+/g, '').toLowerCase() === levelString.toLowerCase()) || HSKLevel[levelString.toUpperCase() as keyof typeof HSKLevel] || HSKLevel[`HSK${levelString}` as keyof typeof HSKLevel]) : undefined;


  useEffect(() => {
    if (!context || !currentLevel) {
      navigate('/'); // Redirect if context or level is invalid
      return;
    }
    context.setCurrentHskLevel(currentLevel);
    const levelWords = getWordsByLevel(currentLevel);
    setWords(levelWords);
  }, [currentLevel, context, navigate]);

  if (!context) return <p>Carregando contexto...</p>;
  const { showToast, updateUserProgress, userProgress } = context;

  const playAudio = (word: Word) => {
    if (word.audioSrc === 'tts' && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word.character);
      utterance.lang = 'zh-CN';
      speechSynthesis.speak(utterance);
      showToast(`Reproduzindo áudio para: ${word.character}`, 'info');
    } else if (word.audioSrc) {
      // Logic for playing actual audio files if available
      showToast(`Áudio para ${word.character} (arquivo não implementado).`, 'info');
    } else {
      showToast(`Áudio não disponível para ${word.character}.`, 'info');
    }
  };

  const handleAddToFlashcards = (word: Word) => {
    // Basic logic: just show a toast. Real SRS would add to a deck.
    // Ideally, check if card already exists for this word.
    showToast(`${word.character} adicionado aos flashcards! (Simulado)`, 'success');
    updateUserProgress({ points: userProgress.points + 1 }); // Gamification example
    // Consider navigating to flashcards page or a success message
  };

  if (!currentLevel) {
    return <p className="text-center text-red-500">Nível HSK inválido ou não especificado.</p>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-primary dark:text-primary-light mb-2">
        Vocabulário - {currentLevel}
      </h1>
      <p className="text-md text-text-light dark:text-text-dark mb-6">
        Aprenda as palavras essenciais para o nível {currentLevel}. Clique no ícone de áudio para ouvir a pronúncia.
      </p>
      {words.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400">Nenhuma palavra encontrada para este nível ainda.</p>
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
