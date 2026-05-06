import OpenAI from "openai";

if (!process.env.AI_INTEGRATIONS_OPENROUTER_API_KEY) {
  throw new Error("AI_INTEGRATIONS_OPENROUTER_API_KEY environment variable is required");
}

export const openrouter = new OpenAI({
  baseURL:
    process.env.AI_INTEGRATIONS_OPENROUTER_BASE_URL ??
    "https://openrouter.ai/api/v1",
  apiKey: process.env.AI_INTEGRATIONS_OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "https://pngwebsitebuilders.site",
    "X-Title": "PNG Website Builders",
  },
});
