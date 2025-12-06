import { GoogleGenAI, Type } from "@google/genai";
import { Hazard, DataAnalysisResult } from '../types';

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async analyzeImage(base64Image: string): Promise<Hazard> {
    const prompt = `
      Analyze this street view image to detect infrastructure defects.
      Target Classes: Potholes/Cracks, Broken Streetlights, Waterlogging, Traffic Sign Obstruction.
      
      Return a single JSON object.
      
      Requirements:
      1. Detect the most significant Hazard and estimate Severity (Low/Medium/High).
      2. Provide a detailed visual description.
      3. Suggested Solution: Provide a technical solution for efficient makeup of the hazard.
      4. Estimated Cost: Predict a low-budget cost of expenditure range.
      5. Estimated Duration: Predict the time limit required for the repair.
      6. Weather Impact: Predict how the road condition will behave in adverse weather (e.g. heavy rain).
      7. Recommendation: A short, immediate action item (e.g., "Barricade immediately").
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
            { text: prompt }
          ]
        },
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING, enum: ['Pothole', 'Streetlight', 'Waterlogging', 'Traffic Sign', 'Other'] },
              severity: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] },
              description: { type: Type.STRING },
              recommendation: { type: Type.STRING },
              suggestedSolution: { type: Type.STRING, description: "Efficient low-budget technical solution" },
              estimatedCost: { type: Type.STRING, description: "Low budget cost estimate" },
              estimatedDuration: { type: Type.STRING, description: "Time limit for repair" },
              weatherImpact: { type: Type.STRING, description: "Prediction in adverse weather" }
            },
            required: ['type', 'severity', 'description', 'recommendation', 'suggestedSolution', 'estimatedCost', 'estimatedDuration', 'weatherImpact']
          }
        }
      });

      if (!response.text) throw new Error("No response from Gemini");
      return JSON.parse(response.text) as Hazard;
    } catch (error) {
      console.error("Image Analysis Error:", error);
      throw error;
    }
  }

  async analyzeCSV(csvText: string): Promise<DataAnalysisResult> {
    const lines = csvText.split('\n');
    // Keep header + first 80 rows to stay within context window if large
    const processedCsv = lines.length > 80 
      ? lines.slice(0, 80).join('\n') + "\n...(truncated)" 
      : csvText;

    const prompt = `
      Analyze the provided accident dataset (CSV).
      Identify:
      1. Accident Hotspots (Locations with highest frequency).
      2. Common Causes (e.g., speeding, bad roads).
      3. Time-of-day analysis (Day vs Night).
      
      Return a structured JSON object with these insights.
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Data Sample:\n${processedCsv}\n\nTask: ${prompt}`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              hotspots: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    location: { type: Type.STRING },
                    count: { type: Type.NUMBER }
                  }
                }
              },
              commonCauses: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    cause: { type: Type.STRING },
                    count: { type: Type.NUMBER }
                  }
                }
              },
              timeAnalysis: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    period: { type: Type.STRING, enum: ['Day', 'Night'] },
                    count: { type: Type.NUMBER }
                  }
                }
              },
              summary: { type: Type.STRING }
            },
            required: ['hotspots', 'commonCauses', 'timeAnalysis', 'summary']
          }
        }
      });

      if (!response.text) throw new Error("No response from Gemini");
      return JSON.parse(response.text) as DataAnalysisResult;
    } catch (error) {
      console.error("Data Analysis Error:", error);
      throw error;
    }
  }

  async generateComplaint(hazard: Hazard, analysis: DataAnalysisResult, location: string): Promise<string> {
    const prompt = `
      Write a formal, actionable complaint letter to the Municipal Commissioner.
      
      Topic: Urgent Repair Required for ${hazard.type} at ${location}.
      
      Include the following details strictly:
      1. **Visual Hazard**: ${hazard.description} (${hazard.severity} Severity).
      2. **Safety Data**: Mention that ${analysis.hotspots.find(h => location.includes(h.location))?.count || 'several'} accidents have occurred near ${location} due to ${analysis.commonCauses[0]?.cause || 'infrastructure issues'}.
      3. **Recovery Plan**:
         - Proposed Solution: ${hazard.suggestedSolution} (Efficient & Low Budget).
         - Estimated Cost: ${hazard.estimatedCost}.
         - Time Limit for Repair: ${hazard.estimatedDuration}.
      4. **Weather Risk**: Warn that ${hazard.weatherImpact}.
      
      Tone: Professional, urgent, respectful.
      Structure: Subject, Salutation, Body (Hazard, Data, Recovery Plan), Call to Action, Sign-off.
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      return response.text || "Could not generate letter.";
    } catch (error) {
      console.error("Drafting Error:", error);
      throw error;
    }
  }
}