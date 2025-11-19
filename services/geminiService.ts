import { GoogleGenAI, GenerateContentResponse, Type, Chat, Content } from "@google/genai";
import { ChatMessage, FinancialData } from '../types';

const withRetries = async <T,>(fn: () => Promise<T>, retries = 3, initialDelay = 1000): Promise<T> => {
    let lastError: Error | unknown;
    for (let i = 0; i < retries; i++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            const errorMessage = (error instanceof Error) ? error.message.toLowerCase() : '';
            
            if (errorMessage.includes('500') || errorMessage.includes('503') || errorMessage.includes('rate limit') || errorMessage.includes('xhr error')) {
                const delay = initialDelay * Math.pow(2, i) + Math.random() * 100;
                console.warn(`API call failed (attempt ${i + 1}/${retries}). Retrying in ${delay.toFixed(0)}ms...`, error);
                await new Promise(res => setTimeout(res, delay));
            } else {
                throw error;
            }
        }
    }
    console.error("API call failed after multiple retries.", lastError);
    if (lastError instanceof Error) {
        const lowerMessage = lastError.message.toLowerCase();
        if (lowerMessage.includes('xhr error') || lowerMessage.includes('500') || lowerMessage.includes('503')) {
             throw new Error("A network error occurred while communicating with the AI service. This may be a temporary disruption. Please try again in a moment.");
        }
    }
    throw lastError;
};


const getAiClient = () => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

// @ts-ignore
export const generateText = async (prompt: string, modelName: 'gemini-2.5-flash' | 'gemini-flash-lite-latest' = 'gemini-2.5-flash'): Promise<string> => {
  try {
    return await withRetries(async () => {
        const ai = getAiClient();
        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
        });
        return response.text;
    });
  } catch (error) {
    console.error("Error generating text:", error);
    throw error;
  }
};

export const generateTextWithThinking = async (prompt: string): Promise<string> => {
  try {
    const responseText = await withRetries(async () => {
        const ai = getAiClient();
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-pro',
          contents: prompt,
          config: {
            thinkingConfig: { thinkingBudget: 32768 }
          }
        });

        if (!response.text) {
            const finishReason = response.candidates?.[0]?.finishReason;
            if (finishReason === 'SAFETY') {
                throw new Error("The analysis was blocked due to safety concerns. Please modify your request.");
            }
            if (finishReason && finishReason !== 'STOP') {
                throw new Error(`The analysis could not be completed. Reason: ${finishReason}.`);
            }
            throw new Error("The model returned an empty response. Please try rephrasing your request.");
        }
        
        return response.text;
    });
    return responseText;
  } catch (error) {
    console.error("Error generating text with thinking:", error);
    throw error;
  }
};

export const generateJsonWithThinking = async (prompt: string): Promise<string> => {
  try {
    const jsonText = await withRetries(async () => {
        const ai = getAiClient();
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-pro',
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            thinkingConfig: { thinkingBudget: 32768 }
          }
        });
        
        if (!response.text) {
            const finishReason = response.candidates?.[0]?.finishReason;
            if (finishReason === 'SAFETY') {
                throw new Error("The JSON request was blocked for safety reasons. Please adjust your prompt.");
            }
            if (finishReason && finishReason !== 'STOP') {
                throw new Error(`The model failed to generate a JSON response. Reason: ${finishReason}.`);
            }
            throw new Error("Received an empty JSON response from the model. Please try again.");
        }

        return response.text;
    });
    return jsonText;
  } catch (error) {
    console.error("Error generating structured data with thinking:", error);
    throw error;
  }
};


export const generateGroundedText = async (prompt: string): Promise<{text: string; sources: any[]}> => {
  try {
    return await withRetries(async () => {
        const ai = getAiClient();
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            tools: [{ googleSearch: {} }],
          },
        });
        
        if (!response.text) {
            const finishReason = response.candidates?.[0]?.finishReason;
            if (finishReason === 'SAFETY') {
                throw new Error("The request was blocked for safety reasons. Please adjust your prompt.");
            }
            if (finishReason && finishReason !== 'STOP') {
                throw new Error(`The model failed to generate a response. Reason: ${finishReason}.`);
            }
            throw new Error("Received an empty response from the model. Please try again.");
        }
        
        const text = response.text;
        const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

        return { text, sources };
    });
  } catch (error) {
    console.error("Error generating grounded text:", error);
    if (error instanceof Error) {
        throw new Error(`Error fetching up-to-date information: ${error.message}`);
    }
    throw new Error("An unknown error occurred while fetching up-to-date information.");
  }
};

export const generateMapsGroundedText = async (prompt: string): Promise<{text: string; sources: any[]}> => {
  try {
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

    return await withRetries(async () => {
        const ai = getAiClient();
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            tools: [{ googleMaps: {} }],
            toolConfig: toolConfig,
          },
        });
        
        const text = response.text;
        const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

        return { text, sources };
    });
  } catch (error) {
    console.error("Error generating maps grounded text:", error);
    if (error instanceof Error) {
        throw new Error(`Error fetching geographical data: ${error.message}`);
    }
    throw new Error("An unknown error occurred while fetching geographical information.");
  }
};

export const generateJsonData = async (prompt: string): Promise<[number, number, number][]> => {
    try {
        const jsonStr = await withRetries(async () => {
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
            return response.text.trim();
        });
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error("Error generating JSON data for heatmap:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to generate heatmap data: ${error.message}`);
        }
        throw new Error("Failed to generate structured data for heatmap.");
    }
};

export const generateFinancialData = async (region: string, lang: string): Promise<FinancialData[]> => {
  try {
    const prompt = `As a financial analyst, generate key financial projections for a 5MW GMEL geothermal pilot project in '${region}'. Use up-to-date economic data for the region. The output MUST be a valid JSON array. The baseline for a similar project in an Iranian Free Zone is: 575B Toman CAPEX, 390B Toman Annual Revenue, 2-year Payback, 42% ROI, 2750B Toman 10-Year NPV. Adjust these figures based on the specific economic conditions, labor costs, and energy market of '${region}'. All descriptions must be in the language with this code: ${lang}.`;

    const jsonStr = await withRetries(async () => {
        const ai = getAiClient();
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-pro',
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  component: { type: Type.STRING },
                  value: { type: Type.NUMBER },
                  unit: { type: Type.STRING },
                  description: { type: Type.STRING },
                },
                required: ['component', 'value', 'unit', 'description']
              }
            }
          },
        });
        return response.text.trim();
    });
    
    const data = JSON.parse(jsonStr);
    
    const requiredComponents = ['CAPEX', 'Revenue', 'Payback', 'ROI', 'NPV'];
    if (data.length < requiredComponents.length) {
        throw new Error('Generated data is missing required financial components.');
    }

    return data;
  } catch (error) {
    console.error("Error generating financial data:", error);
    if (error instanceof Error) {
        throw new Error(`Error generating financial data for ${region}: ${error.message}`);
    }
    throw new Error(`An unknown error occurred while generating financial data for ${region}.`);
  }
};


export const generateImage = async (prompt: string, aspectRatio: '1:1' | '16:9' | '9:16' | '4:3' | '3:4' = '16:9'): Promise<string> => {
  try {
    return await withRetries(async () => {
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
        throw new Error("Model did not return an image.");
    });
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
};

export const generateVideo = async (prompt: string, config: any): Promise<any> => {
    try {
        return await withRetries(async () => {
            const ai = getAiClient();
            const operation = await ai.models.generateVideos({
                model: 'veo-3.1-fast-generate-preview',
                prompt,
                config
            });
            return operation;
        });
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
        return await withRetries(async () => {
            const ai = getAiClient();
            const result = await ai.operations.getVideosOperation({ operation });
            return result;
        });
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

    const lastMessage = history[history.length - 1];
    if (!lastMessage) {
        return "No message to send.";
    }

    try {
        return await withRetries(async () => {
            const ai = getAiClient();
            const chat: Chat = ai.chats.create({
                model: 'gemini-2.5-flash',
                history: geminiHistory,
            });
            const response: GenerateContentResponse = await chat.sendMessage({ message: lastMessage.text });
            return response.text;
        });
    } catch (error) {
        console.error("Error in chat:", error);
        if (error instanceof Error) {
            throw new Error(`Chat failed: ${error.message}`);
        }
        throw new Error("An unknown error occurred in the chat.");
    }
};