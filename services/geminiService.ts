
import { GoogleGenAI, GenerateContentResponse, Chat } from "@google/genai";
import { ChatMessage, GroundingChunk } from '../types';
// Note: Cannot use useLanguage hook here as it's not a React component.
// Translations for system instruction and fixed error messages must be passed in or loaded differently.

const API_KEY = process.env.API_KEY;
const TEXT_MODEL_NAME = "gemini-2.5-flash-preview-04-17";

let ai: GoogleGenAI | null = null;
if (API_KEY) {
  ai = new GoogleGenAI({ apiKey: API_KEY });
} else {
  console.error("API_KEY for Gemini is not set. Chatbot functionality will be disabled.");
}

let chatSession: Chat | null = null;
let currentSystemInstructionForSession: string | null = null; // Stores the system instruction used for the current chatSession

// This function ensures a chat session exists and is configured with the correct system instruction.
// If the instruction changes, a new session is created (old history from SDK's perspective is lost).
const ensureChatSession = (systemInstructionText: string): Chat | null => {
  if (!ai) {
    console.error("Gemini AI client not initialized.");
    return null;
  }

  if (chatSession && currentSystemInstructionForSession === systemInstructionText) {
    // Reuse existing session if instruction hasn't changed
    return chatSession;
  }

  // System instruction changed or no session exists, create a new one.
  // The new session starts with an empty history from the SDK's perspective.
  // The Chat object will build its history internally as messages are exchanged.
  console.log(`Creating new chat session. New/changed instruction: "${systemInstructionText}"`);
  chatSession = ai.chats.create({
    model: TEXT_MODEL_NAME,
    config: {
      systemInstruction: systemInstructionText,
      thinkingConfig: { thinkingBudget: 0 }
    }
    // No history parameter here; the Chat object manages its own history.
  });
  currentSystemInstructionForSession = systemInstructionText;
  return chatSession;
};


export const sendMessageToGemini = async (
  message: string,
  translatedSystemInstruction: string,
  t: (key: string, params?: Record<string, string | number>) => string
): Promise<{ text: string; groundingChunks?: GroundingChunk[] }> => {
  if (!ai) {
    return { text: t('common.geminiChatNotAvailable') };
  }

  const currentChat = ensureChatSession(translatedSystemInstruction);
  if (!currentChat) {
     return { text: t('common.geminiChatSessionError') };
  }

  try {
    const response: GenerateContentResponse = await currentChat.sendMessage({ message });
    
    let textResponse = response.text;
     // Fallback for cases where text might be in candidates parts
    if (!textResponse && response.candidates && response.candidates[0]?.content?.parts) {
        textResponse = response.candidates[0].content.parts.map(part => part.text).join("");
    }
    
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    
    return { text: textResponse || t('chatbotPage.errorResponse'), groundingChunks };

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        if (error.message.includes("API key not valid")) {
             return { text: t('common.geminiErrorApiKey') };
        }
         return { text: t('common.geminiErrorGeneric', { message: error.message }) };
    }
    return { text: t('common.geminiErrorUnknown') };
  }
};


export const sendMessageToGeminiStream = async (
  message: string,
  onStreamUpdate: (chunkText: string, isFinal: boolean) => void,
  translatedSystemInstruction: string,
  t: (key: string, params?: Record<string, string | number>) => string
): Promise<void> => {
  if (!ai) {
    onStreamUpdate(t('common.geminiChatNotAvailable'), true);
    return;
  }

  const currentChat = ensureChatSession(translatedSystemInstruction);
  if (!currentChat) {
    onStreamUpdate(t('common.geminiChatSessionError'), true);
    return;
  }

  try {
    const stream = await currentChat.sendMessageStream({ message });
    for await (const chunk of stream) { 
      const chunkText = chunk.text; 
      if (chunkText) {
        onStreamUpdate(chunkText, false); 
      }
    }
    onStreamUpdate("", true); 
  } catch (error) {
    console.error("Error calling Gemini API (stream):", error);
    let errorMessageKey = 'common.geminiErrorUnknown';
    let params = {};
    if (error instanceof Error) {
        if (error.message.includes("API key not valid")) {
             errorMessageKey = 'common.geminiErrorApiKey';
        } else {
            errorMessageKey = 'common.geminiErrorGeneric';
            params = { message: error.message };
        }
    }
    onStreamUpdate(t(errorMessageKey, params), true);
  }
};

export const resetChatSession = () => {
    if (chatSession) {
        console.log("Resetting chat session state in service. Old session will be discarded.");
    }
    chatSession = null;
    currentSystemInstructionForSession = null; 
};
