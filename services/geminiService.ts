import { GoogleGenAI, GenerateContentResponse, Type, Chat, Content } from "@google/genai";
import { ChatMessage } from '../types';

const getAiClient = () => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateText = async (prompt: string, modelName: 'gemini-2.5-flash' | 'gemini-2.5-flash-lite' = 'gemini-2.5-flash'): Promise<string> => {
  try {
    const ai = getAiClient();
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
    const ai = getAiClient();
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
    const ai = getAiClient();
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

export const generateMapsGroundedText = async (prompt: string): Promise<{text: string; sources: any[]}> => {
  try {
    const ai = getAiClient();

    const getPosition = (): Promise<GeolocationPosition> => {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: false,
                timeout: 5000,
                maximumAge: 0
            });
        });
    };

    let toolConfig: any = {};
    try {
        const position = await getPosition();
        toolConfig = {
            retrievalConfig: {
                latLng: {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                }
            }
        };
    } catch (geoError) {
        console.warn("Could not get user location for grounding, proceeding without it.", geoError);
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }],
      },
      toolConfig: toolConfig,
    });
    
    const text = response.text;
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    return { text, sources };

  } catch (error) {
    console.error("Error generating maps grounded text:", error);
    return { text: "An error occurred while fetching up-to-date geographical information.", sources: [] };
  }
};

export const generateJsonData = async (prompt: string): Promise<[number, number, number][] | null> => {
    try {
        const ai = getAiClient();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.NUMBER,
                        },
                        minItems: 3,
                        maxItems: 3,
                    },
                },
            },
        });

        const jsonStr = response.text.trim();
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error("Error generating JSON data for heatmap:", error);
        return null;
    }
};


export const generateImage = async (prompt: string, aspectRatio: '1:1' | '16:9' | '9:16' | '4:3' | '3:4' = '16:9'): Promise<string | null> => {
  try {
    const ai = getAiClient();
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

export const generateVideo = async (prompt: string, config: any): Promise<any> => {
    try {
        const ai = getAiClient();
        const operation = await ai.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt,
            config
        });
        return operation;
    } catch (error) {
        console.error("Error generating video:", error);
        if (error instanceof Error && error.message.includes("Requested entity was not found.")) {
            throw new Error("API_KEY_INVALID");
        }
        throw error;
    }
};

export const getVideoOperation = async (operation: any): Promise<any> => {
    try {
        const ai = getAiClient();
        const result = await ai.operations.getVideosOperation({ operation });
        return result;
    } catch (error) {
        console.error("Error getting video operation status:", error);
        if (error instanceof Error && error.message.includes("Requested entity was not found.")) {
            throw new Error("API_KEY_INVALID");
        }
        throw error;
    }
};

export const continueChat = async (history: ChatMessage[]): Promise<string> => {
    const geminiHistory: Content[] = history.slice(0, -1).map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }],
    }));

    const ai = getAiClient();
    const chat: Chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        history: geminiHistory,
    });

    const lastMessage = history[history.length - 1];
    if (!lastMessage) {
        return "No message to send.";
    }

    try {
        const response: GenerateContentResponse = await chat.sendMessage({ message: lastMessage.text });
        return response.text;
    } catch (error) {
        console.error("Error in chat:", error);
        return "Sorry, I encountered an error. Please try again.";
    }
};