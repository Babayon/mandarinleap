import React, { useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../contexts/AppContext';
import { Word, HSKLevel } from '../types';
import { getWordsByLevel } from '../data/hskData';
import { MicrophoneIcon, SpeakerWaveIcon, CheckCircleIcon, XCircleIcon } from '../components/icons';
import { useLanguage } from '../contexts/LanguageContext';

// Web Speech API type declarations (keep as is)
declare global {
  interface SpeechRecognitionAlternative {
    readonly transcript: string;
    readonly confidence: number;
  }
  interface SpeechRecognitionResult {
    readonly isFinal: boolean;
    readonly length: number;
    item(index: number): SpeechRecognitionAlternative;
    [index: number]: SpeechRecognitionAlternative;
  }
  interface SpeechRecognitionResultList {
    readonly length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
  }
  type SpeechRecognitionErrorCode =
    | 'no-speech' | 'aborted' | 'audio-capture' | 'network' | 'not-allowed'
    | 'service-not-allowed' | 'bad-grammar' | 'language-not-supported';
  interface SpeechRecognitionErrorEvent extends Event {
    readonly error: SpeechRecognitionErrorCode;
    readonly message: string;
  }
  interface SpeechRecognitionEvent extends Event {
    readonly resultIndex: number;
    readonly results: SpeechRecognitionResultList;
  }
  interface SpeechGrammar { src: string; weight: number; }
  interface SpeechGrammarList {
    readonly length: number;
    item(index: number): SpeechGrammar;
    [index: number]: SpeechGrammar;
    addFromString(string: string, weight?: number): void;
    addFromURI(src: string, weight?: number): void;
  }
  interface SpeechRecognition extends EventTarget {
    grammars: SpeechGrammarList; lang: string; continuous: boolean; interimResults: boolean; maxAlternatives: number;
    start(): void; stop(): void; abort(): void;
    onaudiostart: ((this: SpeechRecognition, ev: Event) => any) | null;
    onaudioend: ((this: SpeechRecognition, ev: Event) => any) | null;
    onend: ((this: SpeechRecognition, ev: Event) => any) | null;
    onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
    onnomatch: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
    onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
    onsoundstart: ((this: SpeechRecognition, ev: Event) => any) | null;
    onsoundend: ((this: SpeechRecognition, ev: Event) => any) | null;
    onspeechstart: ((this: SpeechRecognition, ev: Event) => any) | null;
    onspeechend: ((this: SpeechRecognition, ev: Event) => any) | null;
    onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  }
  interface SpeechRecognitionStatic { prototype: SpeechRecognition; new(): SpeechRecognition; }
  interface Window { SpeechRecognition: SpeechRecognitionStatic; webkitSpeechRecognition: SpeechRecognitionStatic; }
}


const PronunciationPracticePage: React.FC = () => {
  const { level: levelString } = useParams<{ level: string }>();
  const navigate = useNavigate();
  const context = useContext(AppContext);
  const { t } = useLanguage();

  const [words, setWords] = useState<Word[]>([]);
  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [userTranscript, setUserTranscript] = useState<string | null>(null);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  
  const showToastFromContext = context?.showToast;

  useEffect(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognitionAPI) {
      const recInstance = new SpeechRecognitionAPI();
      recInstance.continuous = false;
      recInstance.lang = 'zh-CN'; 
      recInstance.interimResults = false;
      setRecognition(recInstance);
    } else {
      showToastFromContext?.(t('pronunciationPage.speechRecognitionNotSupported'), 'error');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t]); 

  const currentLevel = levelString ? HSKLevel[levelString.toUpperCase() as keyof typeof HSKLevel] || HSKLevel[`HSK${levelString}` as keyof typeof HSKLevel] : undefined;
  
  const setCurrentHskLevelFromContext = context?.setCurrentHskLevel;
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
    if (levelWordsData.length > 0) {
      setCurrentWord(levelWordsData[0]);
    } else {
      setCurrentWord(null);
    }
  }, [currentLevel, setCurrentHskLevelFromContext, navigate]); 

  useEffect(() => {
    if (!recognition || !showToastFromContext || !updateUserProgressFromContext || !userProgressFromContext) {
      return;
    }

    const handleResult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      setUserTranscript(transcript);
      if (currentWord && transcript.toLowerCase().includes(currentWord.character.charAt(0).toLowerCase())) { 
        setFeedback(t('pronunciationPage.feedbackGood'));
        updateUserProgressFromContext({ points: (userProgressFromContext.points || 0) + 2 });
      } else {
        setFeedback(t('pronunciationPage.feedbackTryAgain'));
      }
      setIsRecording(false);
    };

    const handleError = (event: SpeechRecognitionErrorEvent) => {
      setIsRecording(false);
      let errorMessageKey = 'pronunciationPage.feedbackGenericError';
      let toastMessageKey = 'common.toastGenericError';
      let errorParam = { error: event.error };

      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        errorMessageKey = 'pronunciationPage.feedbackMicPermissionDenied';
        toastMessageKey = 'common.toastErrorMicPermission';
      } else if (event.error === 'audio-capture') {
        errorMessageKey = 'pronunciationPage.feedbackAudioCaptureError';
        toastMessageKey = 'common.toastErrorAudioCapture';
      } else if (event.error === 'no-speech') {
        errorMessageKey = 'pronunciationPage.feedbackNoSpeech';
        toastMessageKey = 'common.toastInfoNoSpeech';
        showToastFromContext(t(toastMessageKey), 'info');
        setFeedback(t(errorMessageKey));
        return; 
      } else if (event.error === 'network') {
        errorMessageKey = 'pronunciationPage.feedbackNetworkError';
        toastMessageKey = 'common.toastErrorNetwork';
      }
      
      setFeedback(t(errorMessageKey, errorParam));
      showToastFromContext(t(toastMessageKey, errorParam), 'error');
    };

    const handleEnd = () => {
      setIsRecording(false); 
    };

    recognition.onresult = handleResult;
    recognition.onerror = handleError;
    recognition.onend = handleEnd;

    return () => {
      if (recognition) {
        recognition.onresult = null;
        recognition.onerror = null;
        recognition.onend = null;
        recognition.abort(); 
      }
    };
  }, [recognition, currentWord, showToastFromContext, updateUserProgressFromContext, userProgressFromContext, t]); 


  const handlePlayNativeAudio = useCallback((wordToPlay: Word) => { 
    if (!showToastFromContext) return;
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(wordToPlay.character);
      utterance.lang = 'zh-CN';
      speechSynthesis.speak(utterance);
    } else {
      showToastFromContext(t('pronunciationPage.speechRecognitionNotSupported'), 'error');
    }
  }, [showToastFromContext, t]);

  const handleRecord = useCallback(() => {
    if (!recognition) {
      showToastFromContext?.(t('pronunciationPage.speechRecognitionNotInitialized'), 'error');
      setFeedback(t('pronunciationPage.speechRecognitionNotInitialized'));
      return;
    }
    if (isRecording) {
      recognition.stop();
    } else {
      setUserTranscript(null);
      setFeedback(null);
      try {
        recognition.start();
        setIsRecording(true);
      } catch (e: any) {
        let toastMsgKey = 'pronunciationPage.errorStartingRecording';
        if (e.name === 'InvalidStateError') { 
            toastMsgKey = 'pronunciationPage.errorRecordingInvalidState';
        } else if (e.name === 'SecurityError') { 
            toastMsgKey = 'pronunciationPage.errorRecordingSecurity';
        }
        showToastFromContext?.(t(toastMsgKey), 'error');
        setFeedback(t(toastMsgKey));
        setIsRecording(false); 
      }
    }
  }, [recognition, isRecording, showToastFromContext, t]);

  const selectNextWord = useCallback(() => {
    if (!words.length || !currentWord) return;
    const currentIndex = words.findIndex(w => w.id === currentWord.id);
    const nextIndex = (currentIndex + 1) % words.length;
    setCurrentWord(words[nextIndex]);
    setFeedback(null);
    setUserTranscript(null);
    if (isRecording && recognition) {
        recognition.stop(); 
    }
  }, [words, currentWord, isRecording, recognition]);
  
  if (!context) return <p>{t('common.loadingContext')}</p>;
   if (!currentLevel) {
    return <p className="text-center text-red-500">{t('common.hskLevelInvalid')}</p>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-primary dark:text-primary-light mb-2">{t('pronunciationPage.title', {level: currentLevel})}</h1>
      <p className="text-md text-text-light dark:text-text-dark mb-6">{t('pronunciationPage.description')}</p>

      {currentWord ? (
        <div className="bg-card-light dark:bg-card-dark p-6 rounded-lg shadow-xl text-center">
          <h2 className="text-5xl font-bold text-primary dark:text-primary-light mb-2">{currentWord.character}</h2>
          <p className="text-2xl text-gray-600 dark:text-gray-400 mb-6">{currentWord.pinyin}</p>
          
          <div className="flex justify-center space-x-4 mb-6">
            <button
              onClick={() => handlePlayNativeAudio(currentWord)}
              className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md transition-colors"
              aria-label={t('pronunciationPage.playNativeAudio')}
            >
              <SpeakerWaveIcon className="w-5 h-5" />
              <span>{t('pronunciationPage.playNativeAudio')}</span>
            </button>
            <button
              onClick={handleRecord}
              disabled={!recognition} 
              className={`flex items-center space-x-2 font-semibold py-2 px-4 rounded-md transition-colors
                ${isRecording 
                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                  : 'bg-green-500 hover:bg-green-600 text-white'}
                ${!recognition ? 'opacity-50 cursor-not-allowed' : ''}  
              `}
              aria-label={isRecording ? t('pronunciationPage.stopRecording') : t('pronunciationPage.recordYourVoice')}
            >
              <MicrophoneIcon className="w-5 h-5" />
              <span>{isRecording ? t('pronunciationPage.stopRecording') : t('pronunciationPage.recordYourVoice')}</span>
            </button>
          </div>

          {userTranscript && (
            <div className="my-4 p-3 bg-gray-100 dark:bg-gray-700 rounded">
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('pronunciationPage.youSaid')}</p>
              <p className="text-lg text-text-light dark:text-text-dark">{userTranscript}</p>
            </div>
          )}

          {feedback && (
            <div className={`my-4 p-3 rounded flex items-center justify-center space-x-2 text-sm
              ${feedback.includes(t('pronunciationPage.feedbackGood').substring(0,10)) ? 'bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-200' 
              : feedback.toLowerCase().includes(t('common.error').toLowerCase()) || feedback.toLowerCase().includes(t('pronunciationPage.feedbackMicPermissionDenied').substring(0,10).toLowerCase())
              ? 'bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-200'
              : 'bg-yellow-100 dark:bg-yellow-800 text-yellow-700 dark:text-yellow-200'}`}
              role="alert"
            >
              {feedback.includes(t('pronunciationPage.feedbackGood').substring(0,10)) ? <CheckCircleIcon className="w-5 h-5 flex-shrink-0"/> : (feedback.toLowerCase().includes(t('common.error').toLowerCase()) || feedback.toLowerCase().includes(t('pronunciationPage.feedbackMicPermissionDenied').substring(0,10).toLowerCase())) ? <XCircleIcon className="w-5 h-5 flex-shrink-0"/> : null}
              <span>{feedback}</span>
            </div>
          )}
          
          <div className="mt-6 border-t border-border-light dark:border-border-dark pt-4">
             {/* Placeholder remains simple */}
            <h4 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">{t('pronunciationPage.toneVisualisationPlaceholder')}</h4>
            <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center">
              <p className="text-gray-500 dark:text-gray-400">{t('pronunciationPage.toneVisualisationPlaceholder')}</p>
            </div>
          </div>

           <button
            onClick={selectNextWord}
            disabled={words.length <=1}
            className="mt-8 bg-primary hover:bg-primary-dark text-white font-semibold py-2 px-6 rounded-md transition-colors disabled:opacity-50"
          >
            {t('pronunciationPage.nextWord')}
          </button>

        </div>
      ) : (
         <p className="text-center text-gray-500 dark:text-gray-400">
            {currentLevel && words.length === 0 ? t('pronunciationPage.noWordsForLevel', {level: currentLevel}) : t('pronunciationPage.loadingWords')}
        </p>
      )}
    </div>
  );
};

export default PronunciationPracticePage;