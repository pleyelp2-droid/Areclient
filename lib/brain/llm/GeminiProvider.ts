import { LLMProvider, LLMResponse } from './LLMProvider';
import { GoogleGenAI } from "@google/genai";

export class GeminiProvider implements LLMProvider {
  private ai: GoogleGenAI;

  constructor(apiKey: string) {
    this.ai = new GoogleGenAI({ apiKey });
  }

  async generate(prompt: string, context: any): Promise<LLMResponse> {
    const response = await this.ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `${prompt} Context: ${JSON.stringify(context)}`
    });
    return { text: response.text || '' };
  }
}
