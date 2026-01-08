
import { GoogleGenAI, Type } from "@google/genai";

export const generateAfrobeatsQuestions = async () => {
  // Always initialize GoogleGenAI right before making the call with the exact environment variable.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: "Generate 5 multiple-choice questions about popular Nigerian Afrobeats artists (Wizkid, Burna Boy, Davido, Tems, etc.). Each question should have 4 options and one correct answer.",
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            correctAnswer: { type: Type.STRING }
          },
          required: ["question", "options", "correctAnswer"]
        }
      }
    }
  });

  try {
    // Access response.text as a property, not a method.
    const text = response.text || "[]";
    return JSON.parse(text);
  } catch (e) {
    console.error("Failed to parse quiz questions", e);
    return [];
  }
};
