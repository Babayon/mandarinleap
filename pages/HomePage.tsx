
import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../contexts/AppContext';
import { HSKLevel, HSK_LEVELS_ORDERED } from '../types';
import { BookOpenIcon, MicrophoneIcon, SparklesIcon, ChatBubbleLeftRightIcon, Bars3BottomLeftIcon, PuzzlePieceIcon } from '../components/icons';
import { useLanguage } from '../contexts/LanguageContext';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const context = useContext(AppContext);
  const { t } = useLanguage();

  if (!context) return null;
  const { setCurrentHskLevel, currentHskLevel, userProgress } = context;

  const handleLevelSelect = (level: HSKLevel) => {
    setCurrentHskLevel(level);
    navigate(`/vocabulary/${level.replace(/\s+/g, '')}`);
  };

  const hskLevelPath = currentHskLevel.replace(/\s+/g, '');

  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold text-primary dark:text-primary-light mb-6">{t('homePage.welcomeTitle')}</h1>
      <p className="text-lg text-text-light dark:text-text-dark mb-8">
        {t('homePage.welcomeSubtitle')}
      </p>

      <div className="mb-10">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700 dark:text-gray-300">{t('homePage.selectHSKLevel')}</h2>
        <div className="flex flex-wrap justify-center gap-3">
          {HSK_LEVELS_ORDERED.map((level) => (
            <button
              key={level}
              onClick={() => handleLevelSelect(level)}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-150 ease-in-out
                ${currentHskLevel === level 
                  ? 'bg-primary text-white scale-105 shadow-lg' 
                  : 'bg-card-light dark:bg-card-dark text-primary dark:text-primary-light hover:bg-primary-light hover:text-white dark:hover:bg-primary-dark shadow-md hover:shadow-lg'
                }`}
            >
              {level} {/* HSK Level text itself is not translated here, could be if needed */}
            </button>
          ))}
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <FeatureCard
            title={t('homePage.featureCard.vocabularyTitle')}
            description={t('homePage.featureCard.vocabularyDescription')}
            icon={<BookOpenIcon className="w-12 h-12 text-primary dark:text-primary-light" />}
            onClick={() => navigate(`/vocabulary/${hskLevelPath}`)}
        />
         <FeatureCard
            title={t('homePage.featureCard.phrasesTitle')}
            description={t('homePage.featureCard.phrasesDescription')}
            icon={<Bars3BottomLeftIcon className="w-12 h-12 text-primary dark:text-primary-light" />}
            onClick={() => navigate(`/phrases/${hskLevelPath}`)}
        />
        <FeatureCard
            title={t('homePage.featureCard.pronunciationTitle')}
            description={t('homePage.featureCard.pronunciationDescription')}
            icon={<MicrophoneIcon className="w-12 h-12 text-primary dark:text-primary-light" />}
            onClick={() => navigate(`/pronunciation/${hskLevelPath}`)}
        />
        <FeatureCard
            title={t('homePage.featureCard.flashcardsTitle')}
            description={t('homePage.featureCard.flashcardsDescription')}
            icon={<SparklesIcon className="w-12 h-12 text-primary dark:text-primary-light" />}
            onClick={() => navigate(`/flashcards/${hskLevelPath}`)}
        />
         <FeatureCard
            title={t('homePage.featureCard.exercisesTitle')}
            description={t('homePage.featureCard.exercisesDescription')}
            icon={<PuzzlePieceIcon className="w-12 h-12 text-primary dark:text-primary-light" />}
            onClick={() => navigate(`/exercises/${hskLevelPath}`)}
        />
        <FeatureCard
            title={t('homePage.featureCard.chatbotTitle')}
            description={t('homePage.featureCard.chatbotDescription')}
            icon={<ChatBubbleLeftRightIcon className="w-12 h-12 text-primary dark:text-primary-light" />}
            onClick={() => navigate('/chatbot')}
        />
      </div>

      <div className="bg-card-light dark:bg-card-dark p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-3 text-gray-700 dark:text-gray-300">{t('homePage.yourProgress')}</h3>
        <p className="text-text-light dark:text-text-dark">{t('homePage.hskLevel')}: <span className="font-bold text-primary dark:text-primary-light">{userProgress.currentHskLevel}</span></p>
        <p className="text-text-light dark:text-text-dark">{t('homePage.points')}: <span className="font-bold text-secondary dark:text-secondary-light">{userProgress.points}</span></p>
        <p className="text-text-light dark:text-text-dark">{t('homePage.flashcardsStudiedToday')}: <span className="font-bold text-secondary dark:text-secondary-light">{userProgress.flashcardsStudiedToday}</span></p>
        {userProgress.badges.length > 0 && (
          <p className="text-text-light dark:text-text-dark">{t('homePage.achievements')}: {userProgress.badges.join(', ')}</p>
        )}
      </div>
    </div>
  );
};


interface FeatureCardProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    onClick: () => void;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, icon, onClick }) => (
    <button
        onClick={onClick}
        className="bg-card-light dark:bg-card-dark p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow text-left flex flex-col items-center text-center"
    >
        <div className="mb-4">{icon}</div>
        <h3 className="text-xl font-semibold mb-2 text-primary dark:text-primary-light">{title}</h3>
        <p className="text-sm text-text-light dark:text-text-dark">{description}</p>
    </button>
);


export default HomePage;