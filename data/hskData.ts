
import { HSKLevel, Word, Phrase, Flashcard, VocabularyExercise, ExerciseOption } from '../types';

export const mockWords: Word[] = [
  // HSK 1
  { id: 'h1_1', character: '你好', pinyin: 'nǐ hǎo', translation: 'olá', hskLevel: HSKLevel.HSK1, audioSrc: 'tts', exampleSentence: '你好吗？', exampleTranslation: 'Como você está?' },
  { id: 'h1_2', character: '谢谢', pinyin: 'xièxie', translation: 'obrigado', hskLevel: HSKLevel.HSK1, audioSrc: 'tts' },
  { id: 'h1_3', character: '不客气', pinyin: 'bú kèqi', translation: 'de nada', hskLevel: HSKLevel.HSK1, audioSrc: 'tts' },
  { id: 'h1_4', character: '再见', pinyin: 'zàijiàn', translation: 'adeus', hskLevel: HSKLevel.HSK1, audioSrc: 'tts' },
  { id: 'h1_5', character: '是', pinyin: 'shì', translation: 'ser, sim', hskLevel: HSKLevel.HSK1, audioSrc: 'tts' },
  { id: 'h1_6', character: '我', pinyin: 'wǒ', translation: 'eu', hskLevel: HSKLevel.HSK1, audioSrc: 'tts', exampleSentence: '我是学生。', exampleTranslation: 'Eu sou um estudante.' },
  { id: 'h1_7', character: '你', pinyin: 'nǐ', translation: 'você', hskLevel: HSKLevel.HSK1, audioSrc: 'tts' },
  { id: 'h1_8', character: '他', pinyin: 'tā', translation: 'ele', hskLevel: HSKLevel.HSK1, audioSrc: 'tts' },
  { id: 'h1_9', character: '她', pinyin: 'tā', translation: 'ela', hskLevel: HSKLevel.HSK1, audioSrc: 'tts' },
  { id: 'h1_10', character: '我们', pinyin: 'wǒmen', translation: 'nós', hskLevel: HSKLevel.HSK1, audioSrc: 'tts' },
  { id: 'h1_11', character: '爱', pinyin: 'ài', translation: 'amar', hskLevel: HSKLevel.HSK1, audioSrc: 'tts', exampleSentence: '我爱你。', exampleTranslation: 'Eu te amo.'},
  { id: 'h1_12', character: '吃', pinyin: 'chī', translation: 'comer', hskLevel: HSKLevel.HSK1, audioSrc: 'tts', exampleSentence: '我想吃饭。', exampleTranslation: 'Eu quero comer arroz.'},
  { id: 'h1_13', character: '喝', pinyin: 'hē', translation: 'beber', hskLevel: HSKLevel.HSK1, audioSrc: 'tts', exampleSentence: '他喝茶。', exampleTranslation: 'Ele bebe chá.'},
  { id: 'h1_14', character: '家', pinyin: 'jiā', translation: 'casa, família', hskLevel: HSKLevel.HSK1, audioSrc: 'tts', exampleSentence: '我家很大。', exampleTranslation: 'Minha casa é grande.'},
  { id: 'h1_15', character: '学校', pinyin: 'xuéxiào', translation: 'escola', hskLevel: HSKLevel.HSK1, audioSrc: 'tts', exampleSentence: '这是我的学校。', exampleTranslation: 'Esta é minha escola.'},
  { id: 'h1_16', character: '朋友', pinyin: 'péngyou', translation: 'amigo', hskLevel: HSKLevel.HSK1, audioSrc: 'tts'},
  { id: 'h1_17', character: '中国', pinyin: 'Zhōngguó', translation: 'China', hskLevel: HSKLevel.HSK1, audioSrc: 'tts'},
  { id: 'h1_18', character: '汉语', pinyin: 'Hànyǔ', translation: 'língua chinesa', hskLevel: HSKLevel.HSK1, audioSrc: 'tts'},
  { id: 'h1_19', character: '老师', pinyin: 'lǎoshī', translation: 'professor', hskLevel: HSKLevel.HSK1, audioSrc: 'tts'},
  { id: 'h1_20', character: '学生', pinyin: 'xuésheng', translation: 'estudante', hskLevel: HSKLevel.HSK1, audioSrc: 'tts'},

  // HSK 2 (Sample)
  { id: 'h2_1', character: '早上', pinyin: 'zǎoshang', translation: 'manhã cedo', hskLevel: HSKLevel.HSK2, audioSrc: 'tts', exampleSentence: '早上好！', exampleTranslation: 'Bom dia!' },
  { id: 'h2_2', character: '牛奶', pinyin: 'niúnǎi', translation: 'leite', hskLevel: HSKLevel.HSK2, audioSrc: 'tts', exampleSentence: '我喜欢喝牛奶。', exampleTranslation: 'Eu gosto de beber leite.' },
  { id: 'h2_3', character: '房间', pinyin: 'fángjiān', translation: 'quarto', hskLevel: HSKLevel.HSK2, audioSrc: 'tts'},
  { id: 'h2_4', character: '天气', pinyin: 'tiānqì', translation: 'tempo (clima)', hskLevel: HSKLevel.HSK2, audioSrc: 'tts'},
  { id: 'h2_5', character: '高兴', pinyin: 'gāoxìng', translation: 'feliz, contente', hskLevel: HSKLevel.HSK2, audioSrc: 'tts'},
];

export const mockPhrases: Phrase[] = [
  // HSK 1
  { id: 'p1_1', chinese: '你好吗？', pinyin: 'Nǐ hǎo ma?', translation: 'Como você está?', hskLevel: HSKLevel.HSK1, audioSrc: 'tts' },
  { id: 'p1_2', chinese: '我很好，谢谢。', pinyin: 'Wǒ hěn hǎo, xièxie.', translation: 'Estou muito bem, obrigado.', hskLevel: HSKLevel.HSK1, audioSrc: 'tts' },
  { id: 'p1_3', chinese: '你叫什么名字？', pinyin: 'Nǐ jiào shénme míngzi?', translation: 'Qual é o seu nome?', hskLevel: HSKLevel.HSK1, audioSrc: 'tts' },
  { id: 'p1_4', chinese: '我叫[Seu Nome].', pinyin: 'Wǒ jiào [Seu Nome].', translation: 'Meu nome é [Seu Nome].', hskLevel: HSKLevel.HSK1, audioSrc: 'tts' },
  { id: 'p1_5', chinese: '很高兴认识你。', pinyin: 'Hěn gāoxìng rènshi nǐ.', translation: 'Prazer em conhecer você.', hskLevel: HSKLevel.HSK1, audioSrc: 'tts' },
  
  // HSK 2
  { id: 'p2_1', chinese: '今天天气怎么样？', pinyin: 'Jīntiān tiānqì zěnmeyàng?', translation: 'Como está o tempo hoje?', hskLevel: HSKLevel.HSK2, audioSrc: 'tts' },
  { id: 'p2_2', chinese: '我想去商店。', pinyin: 'Wǒ xiǎng qù shāngdiàn.', translation: 'Eu quero ir à loja.', hskLevel: HSKLevel.HSK2, audioSrc: 'tts' },
];

// Sample initial flashcards (can be generated from words)
export const mockFlashcards: Flashcard[] = mockWords
  .filter(word => word.hskLevel === HSKLevel.HSK1) 
  .slice(0, 10) 
  .map(word => ({
    id: `fc_${word.id}`,
    wordId: word.id,
    frontText: word.character,
    backText: `${word.pinyin}\n${word.translation}${word.exampleSentence ? `\nEx: ${word.exampleSentence} (${word.exampleTranslation})` : ''}`,
    lastReviewed: null,
    nextReview: new Date(), 
    intervalDays: 1,
    easeFactor: 2.5,
    hskLevel: word.hskLevel,
  }));


export const getWordsByLevel = (level: HSKLevel): Word[] => {
  return mockWords.filter(word => word.hskLevel === level);
};

export const getPhrasesByLevel = (level: HSKLevel): Phrase[] => {
  return mockPhrases.filter(phrase => phrase.hskLevel === level);
};

export const getFlashcardsByLevel = (level: HSKLevel, count: number = 10): Flashcard[] => {
  const levelWords = getWordsByLevel(level);
  // In a real app, this would query a user's specific flashcard deck.
  // For now, generate new ones if needed, or get existing mock ones.
  const existingForLevel = mockFlashcards.filter(fc => fc.hskLevel === level);
  if (existingForLevel.length >= count) return existingForLevel.slice(0, count);

  return levelWords.slice(0, count).map(word => ({
    id: `fc_new_${level.replace(' ','')}_${word.id}`,
    wordId: word.id,
    frontText: word.character,
    backText: `${word.pinyin}\n${word.translation}${word.exampleSentence ? `\nEx: ${word.exampleSentence} (${word.exampleTranslation})` : ''}`,
    lastReviewed: null,
    nextReview: new Date(),
    intervalDays: 1,
    easeFactor: 2.5,
    hskLevel: word.hskLevel,
  }));
};

// Helper function to shuffle an array
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export const generateVocabularyExercises = (level: HSKLevel, count: number = 5): VocabularyExercise[] => {
  const wordsOfLevel = getWordsByLevel(level);
  if (wordsOfLevel.length < 4) return []; // Need at least 4 words to make a decent MCQ

  const exercises: VocabularyExercise[] = [];
  const shuffledWords = shuffleArray(wordsOfLevel);

  for (let i = 0; i < Math.min(count, shuffledWords.length); i++) {
    const correctWord = shuffledWords[i];
    
    // Get 3 other random words for incorrect options
    const incorrectOptionsWords = shuffleArray(wordsOfLevel.filter(w => w.id !== correctWord.id)).slice(0, 3);
    if (incorrectOptionsWords.length < 3) continue; // Skip if not enough options

    // Determine question type randomly for variety (example)
    const questionTypeRand = Math.random();
    let questionPrompt = '';
    let correctAnswerText = '';
    let options: ExerciseOption[] = [];

    if (questionTypeRand < 0.5) { // Character to Translation
      questionPrompt = correctWord.character;
      correctAnswerText = correctWord.translation;
      options = shuffleArray([
        { id: correctWord.id, text: correctWord.translation },
        ...incorrectOptionsWords.map(w => ({ id: w.id, text: w.translation }))
      ]);
    } else { // Translation to Character
      questionPrompt = correctWord.translation;
      correctAnswerText = correctWord.character;
      options = shuffleArray([
        { id: correctWord.id, text: correctWord.character },
        ...incorrectOptionsWords.map(w => ({ id: w.id, text: w.character }))
      ]);
    }
    // Could add char_to_pinyin, pinyin_to_char etc.

    exercises.push({
      id: `ex_${correctWord.id}_${i}`,
      questionType: questionTypeRand < 0.5 ? 'char_to_translation' : 'translation_to_char',
      questionPrompt: questionPrompt,
      options: options,
      correctAnswerId: correctWord.id, // The ID of the word itself serves as the correct option ID
      hskLevel: level,
    });
  }
  return shuffleArray(exercises);
};
