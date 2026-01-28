/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { GoogleGenAI } from '@google/genai';

// Initialize the client
// The API key is assumed to be available in process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateSlogan = async (
  companyName: string,
  industry: string,
  tone: string,
): Promise<string> => {
  try {
    if (!process.env.API_KEY) {
      // Graceful fallback if no API key is present in the environment for the demo
      return 'Klucz API nie został skonfigurowany. Proszę skontaktować się z administratorem.';
    }

    const modelId = 'gemini-2.5-flash';
    const prompt = `
      Jesteś ekspertem copywritingu w agencji marketingowej "Mixture Marketing".
      Stwórz jedno chwytliwe, nowoczesne hasło reklamowe (slogan) dla firmy o nazwie "${companyName}", 
      działającej w branży "${industry}".
      Ton wypowiedzi: ${tone}.
      Slogan powinien być krótki, kreatywny i w języku polskim.
      Nie dodawaj żadnego wstępu ani cudzysłowów, tylko sam slogan.
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
    });

    return response.text?.trim() || '';
  } catch (error) {
    console.error('Error generating slogan:', error);
    return 'Wystąpił błąd podczas generowania hasła. Spróbuj ponownie później.';
  }
};
