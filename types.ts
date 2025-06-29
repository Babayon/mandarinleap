

export enum HSKLevel {
  HSK1 = "HSK 1",
  HSK2 = "HSK 2",
  HSK3 = "HSK 3",
  HSK4 = "HSK 4",
  HSK5 = "HSK 5",
  HSK6 = "HSK 6",
}

export const HSK_LEVELS_ORDERED = [HSKLevel.HSK1, HSKLevel.HSK2, HSKLevel.HSK3, HSKLevel.HSK4, HSKLevel.HSK5, HSKLevel.HSK6];


export interface Word {
  id: string;
  character: string;
  pinyin: string;
  translation: string; // Portuguese
  audioSrc?: string; // URL or indicator for TTS
  hskLevel: HSKLevel;
  exampleSentence?: string; // Chinese example
  exampleTranslation?: string; // Portuguese translation of example
}

export interface Phrase {
  id: string;
  chinese: string;
  pinyin: string;
  translation: string;
  hskLevel: HSKLevel;
  audioSrc?: string; // URL or indicator for TTS
}

export interface Flashcard {
  id: string;
  wordId: string; // references Word.id
  frontText: string; // e.g., Character
  backText: string; // e.g., Pinyin, Translation
  lastReviewed: Date | null;
  nextReview: Date;
  intervalDays: number; // For SRS
  easeFactor?: number; // For more advanced SRS
  hskLevel: HSKLevel;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

export interface UserProgress {
  points: number;
  currentHskLevel: HSKLevel;
  flashcardsStudiedToday: number;
  badges: string[]; // e.g., "HSK1 Vocab Master"
  // Could add more specific progress, e.g., wordsMastered: Set<string>
}

export type Theme = 'light' | 'dark';

// This is the original AppContextType definition that included theme properties
interface OriginalAppContextType {
  theme: Theme;
  toggleTheme: () => void;
  currentHskLevel: HSKLevel;
  setCurrentHskLevel: (level: HSKLevel) => void;
  userProgress: UserProgress;
  updateUserProgress: (newProgress: Partial<UserProgress>) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

// AppContextType now excludes theme and toggleTheme, as they are in ThemeContext
export type AppContextType = Omit<OriginalAppContextType, 'theme' | 'toggleTheme'>;


// For Gemini API response grounding
export interface GroundingChunk {
  web?: {
    uri?: string; // Made optional to align with @google/genai
    title?: string; // Made optional to align with @google/genai
  };
}

export interface GeminiResponseCandidate {
  content?: { 
    parts: Array<{ text?: string; json?: any }>;
    role?: string; 
  };
  finishReason?: string; 
  index?: number; 
  safetyRatings?: Array<any>; 
  groundingMetadata?: {
    groundingChunks?: GroundingChunk[];
  }
  text?: string; 
}

export interface StreamedPart {
    text?: string;
}

// For Exercises
export interface ExerciseOption {
  id: string; // typically word.id or a unique identifier
  text: string; // e.g., a translation or pinyin
}

export interface VocabularyExercise {
  id: string; // typically word.id of the correct answer
  questionType: 'char_to_translation' | 'translation_to_char' | 'char_to_pinyin';
  questionPrompt: string; // e.g., The Chinese character or the Portuguese translation
  options: ExerciseOption[];
  correctAnswerId: string; // id of the correct ExerciseOption
  hskLevel: HSKLevel;
}

// For ExerciseContext
export interface ExerciseState {
  activeLevel: HSKLevel | null;
  exercises: VocabularyExercise[];
  currentIndex: number;
  score: number;
  selectedOptionId: string | null;
  isAnswered: boolean; // Is the current question answered?
  isSessionOver: boolean; // Is the entire set of exercises completed?
  isLoading: boolean; // For generating exercises
}

export interface ExerciseContextType extends ExerciseState {
  startOrResumeSession: (level: HSKLevel, count?: number) => void;
  selectOption: (optionId: string) => void;
  submitAnswer: () => void;
  nextExercise: () => void;
  restartCurrentSession: () => void;
}

// For FlashcardContext
export interface FlashcardSessionState {
  activeLevel: HSKLevel | null;
  deck: Flashcard[]; // Full set of flashcards for the level
  studyQueue: Flashcard[]; // Cards currently in review rotation
  currentCardIndexInQueue: number;
  revealed: boolean;
  isSessionOver: boolean;
  isLoading: boolean;
}

export interface FlashcardContextType extends FlashcardSessionState {
  startOrResumeFlashcardSession: (level: HSKLevel, count?: number) => void;
  revealCurrentCard: () => void;
  answerCurrentCard: (knewIt: boolean) => void;
  skipToNextCardInQueue: () => void;
  restartFlashcardSession: () => void;
}

// For Authentication
export interface User {
  name: string;
  email: string;
  photo?: string; // For Google Login avatar
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  googleLogin: () => Promise<boolean>;
  logout: () => void;
}
