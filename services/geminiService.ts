import { GoogleGenAI, GenerateContentResponse, Type, ChatMessage as GeminiChatMessage, Chat } from "@google/genai";
import { ChatMessage } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateText = async (prompt: string, modelName: 'gemini-2.5-flash' | 'gemini-2.5-flash-lite' = 'gemini-2.5-flash'): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating text:", error);
    return "An error occurred while generating the text.";
  }
};

export const generateTextWithThinking = async (prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 32768 }
      }
    });
    return response.text;
  } catch (error) {
    console.error("Error generating text with thinking:", error);
    return "An error occurred during complex analysis.";
  }
};


export const generateGroundedText = async (prompt: string): Promise<{text: string; sources: any[]}> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });
    
    const text = response.text;
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    return { text, sources };

  } catch (error) {
    console.error("Error generating grounded text:", error);
    return { text: "An error occurred while fetching up-to-date information.", sources: [] };
  }
};


export const generateImage = async (prompt: string, aspectRatio: '1:1' | '16:9' | '9:16' | '4:3' | '3:4' = '16:9'): Promise<string | null> => {
  try {
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: aspectRatio,
      },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
      return `data:image/jpeg;base64,${base64ImageBytes}`;
    }
    return null;
  } catch (error) {
    console.error("Error generating image:", error);
    return null;
  }
};

// Fix: Correctly initialize chat and send messages. `history` is not a direct parameter for `create`.
// The history is built by sending messages sequentially.
export const continueChat = async (history: ChatMessage[]): Promise<string> => {
  const chat: Chat = ai.chats.create({
    model: 'gemini-2.5-flash',
  });

  const lastMessage = history[history.length - 1];

  try {
    // Send all but the last message to build up history
    for (let i = 0; i < history.length - 1; i++) {
        // This is a simplified way to rebuild state; for a real app, you'd persist the chat object.
        // For this implementation, we just send messages to simulate history.
        // A more optimal approach would be to pass the full history if the API supported it directly on creation,
        // but the current guideline is to send messages. We will send them without awaiting the response
        // for all but the last one.
        if (i < history.length - 1) {
            await chat.sendMessage({ message: history[i].text });
        }
    }

    const response: GenerateContentResponse = await chat.sendMessage({ message: lastMessage.text });
    return response.text;
  } catch (error) {
    console.error("Error in chat:", error);
    return "Sorry, I encountered an error. Please try again.";
  }
};