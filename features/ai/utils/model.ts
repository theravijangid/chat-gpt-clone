import { createOpenAI, openai } from "@ai-sdk/openai";

export const DEFAULT_CHAT_MODEL = "openai/gpt-4o-mini";

const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

export function getChatModel(modelId?: string | null) {
    return openrouter(modelId || DEFAULT_CHAT_MODEL)
}