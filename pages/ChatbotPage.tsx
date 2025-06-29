import React, { useState, useEffect, useRef, useContext, useCallback } from 'react';
import { sendMessageToGeminiStream, resetChatSession } from '../services/geminiService';
import { ChatMessage as ChatMessageType, GroundingChunk } from '../types';
import { AppContext } from '../contexts/AppContext';
import { PaperAirplaneIcon, TrashIcon } from '../components/icons';
import { useLanguage } from '../contexts/LanguageContext';

const ChatMessage: React.FC<{ message: ChatMessageType }> = React.memo(({ message }) => {
  const isUser = message.sender === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      <div
        className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-xl shadow
          ${isUser 
            ? 'bg-primary text-white' 
            : 'bg-card-light dark:bg-card-dark text-text-light dark:text-text-dark'
          }`}
      >
        <p className="whitespace-pre-wrap">{message.text}</p>
        <p className="text-xs mt-1 opacity-70 text-right">
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
});

const ChatbotPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentGroundingChunks, setCurrentGroundingChunks] = useState<GroundingChunk[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const context = useContext(AppContext);
  const { t, language, translationsLoading } = useLanguage(); // Added language and translationsLoading
  const showToastFromContext = context?.showToast;

  // Store the translated system instruction in state
  const [translatedSystemInstruction, setTranslatedSystemInstruction] = useState('');

  useEffect(() => {
    if (!translationsLoading) {
        const initialGreeting = t('chatbotPage.initialGreeting');
        setMessages([
          {
            id: 'initial-greeting',
            sender: 'bot',
            text: initialGreeting,
            timestamp: new Date(),
          },
        ]);
        // Set translated system instruction once translations are loaded
        setTranslatedSystemInstruction(t('gemini.systemInstruction'));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [translationsLoading, language]); // Rerun if language changes and translations reload


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  

  const handleSend = useCallback(async () => {
    if (input.trim() === '' || translationsLoading || !translatedSystemInstruction) return;

    const userMessage: ChatMessageType = {
      id: Date.now().toString(),
      sender: 'user',
      text: input.trim(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    setCurrentGroundingChunks([]); 

    const botMessageId = `bot-${Date.now()}`;
    const initialBotMessage: ChatMessageType = {
        id: botMessageId,
        sender: 'bot',
        text: t('chatbotPage.thinking'), 
        timestamp: new Date(),
    };
    setMessages((prev) => [...prev, initialBotMessage]);
    
    let accumulatedBotResponse = "";

    await sendMessageToGeminiStream(
        userMessage.text,
        (chunkText, isFinal) => {
            if (!isFinal) {
                accumulatedBotResponse += chunkText;
                setMessages(prev => prev.map(msg => 
                    msg.id === botMessageId ? { ...msg, text: accumulatedBotResponse + "..." } : msg
                ));
            } else {
                // If an error message was streamed as the final chunk, use it directly
                if (chunkText && (chunkText.startsWith(t('common.error')) || chunkText.startsWith(t('common.geminiChatNotAvailable').substring(0,10)) )) { // Check for error prefixes
                    accumulatedBotResponse = chunkText; 
                } else if (!chunkText && accumulatedBotResponse === "") { 
                    accumulatedBotResponse = t('chatbotPage.errorResponse');
                }
                setMessages(prev => prev.map(msg => 
                    msg.id === botMessageId ? { ...msg, text: accumulatedBotResponse } : msg
                ));
                setIsTyping(false);
            }
        },
        translatedSystemInstruction, // Pass the translated system instruction
        t // Pass the t function for error messages within the service
    );

  }, [input, t, translationsLoading, translatedSystemInstruction, setMessages, setInput, setIsTyping, setCurrentGroundingChunks]);

  const handleResetChat = useCallback(() => {
    resetChatSession(); // This will clear history in the service
    setMessages([
        {
          id: 'reset-greeting',
          sender: 'bot',
          text: t('chatbotPage.resetGreeting'),
          timestamp: new Date(),
        },
      ]);
    setIsTyping(false);
    setCurrentGroundingChunks([]);
    if (showToastFromContext) {
        showToastFromContext(t('common.toastChatReset'), "info");
    }
  }, [t, showToastFromContext, setMessages, setIsTyping, setCurrentGroundingChunks]);


  if (translationsLoading) {
    return (
      <div className="text-center p-8">
        <p>{t('common.loading')}</p>
      </div>
    );
  }

  if (!process.env.API_KEY) {
    return (
      <div className="text-center p-8 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">{t('chatbotPage.unavailable')}</h2>
        <p>{t('chatbotPage.apiKeyMissing')}</p>
        <p>{t('chatbotPage.configureApiKey')}</p>
      </div>
    );
  }


  return (
    <div className="flex flex-col h-[calc(100vh-200px)] max-h-[700px] bg-card-light dark:bg-card-dark shadow-xl rounded-lg">
      <header className="bg-primary dark:bg-primary-dark text-white p-4 rounded-t-lg flex justify-between items-center">
        <h1 className="text-xl font-semibold">{t('chatbotPage.title')}</h1>
        <button 
            onClick={handleResetChat}
            title={t('chatbotPage.resetChat')}
            className="p-2 hover:bg-primary-dark dark:hover:bg-primary rounded-full transition-colors"
        >
            <TrashIcon className="w-5 h-5"/>
        </button>
      </header>

      <div className="flex-grow p-4 overflow-y-auto space-y-2">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        {isTyping && messages[messages.length-1]?.sender !== 'bot' && ( 
             <div className="flex justify-start mb-3">
                <div className="max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-xl shadow bg-card-light dark:bg-card-dark text-text-light dark:text-text-dark">
                    <p className="italic">{t('chatbotPage.typing')}</p>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {currentGroundingChunks.length > 0 && (
        <div className="p-3 border-t border-border-light dark:border-border-dark bg-gray-50 dark:bg-gray-700">
          <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">{t('chatbotPage.sources')}</h3>
          <ul className="list-disc list-inside text-xs">
            {currentGroundingChunks.map((chunk, index) =>
              chunk.web ? (
                <li key={index}>
                  <a
                    href={chunk.web.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {chunk.web.title || chunk.web.uri}
                  </a>
                </li>
              ) : null
            )}
          </ul>
        </div>
      )}

      <div className="p-4 border-t border-border-light dark:border-border-dark">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isTyping && handleSend()}
            placeholder={t('chatbotPage.sendMessagePlaceholder')}
            className="flex-grow p-3 border border-border-light dark:border-border-dark rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white dark:bg-gray-700 text-text-light dark:text-text-dark"
            disabled={isTyping || translationsLoading || !translatedSystemInstruction}
          />
          <button
            onClick={handleSend}
            disabled={isTyping || input.trim() === '' || translationsLoading || !translatedSystemInstruction}
            className="bg-primary hover:bg-primary-dark text-white font-semibold p-3 rounded-lg disabled:opacity-50 transition-colors"
          >
            <PaperAirplaneIcon className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatbotPage;