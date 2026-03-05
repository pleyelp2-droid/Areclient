export interface LLMResponse {
  text: string;
}

export interface LLMProvider {
  generate(prompt: string, context: any): Promise<LLMResponse>;
}
