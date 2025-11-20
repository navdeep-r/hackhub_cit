import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';

const ai = new GoogleGenAI({ apiKey });

export const generateHackathonDescription = async (title: string, keywords: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Write a professional, exciting, and concise description (approx 100 words) for a college hackathon titled "${title}". Focus on these themes: ${keywords}. Use markdown formatting for emphasis where appropriate.`,
    });
    return response.text || "Description generation failed.";
  } catch (error) {
    console.error("Error generating description:", error);
    return "Unable to generate description at this time. Please try again.";
  }
};

export const analyzeEngagementTrends = async (dataJSON: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are a data analyst for a university. Analyze the following JSON data representing hackathon engagement (impressions vs registrations). Provide a 2-sentence insight on student interest trends. Data: ${dataJSON}`,
    });
    return response.text || "Analysis failed.";
  } catch (error) {
    console.error("Error analyzing trends:", error);
    return "Unable to analyze trends at this time.";
  }
};