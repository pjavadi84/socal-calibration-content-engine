import { GoogleGenerativeAI, type GenerateContentResult } from '@google/generative-ai';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/** `gemini-2.0-flash` is unavailable for new API keys — use 2.5+ */
const MODELS = {
  flash: process.env.GEMINI_MODEL ?? 'gemini-2.5-flash',
} as const;

export interface LLMResponse<T = string> {
  content: T;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
}

export interface GenerateTextOptions {
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
}

/**
 * Generate plain text with Gemini
 */
export async function generateText(
  prompt: string,
  options: GenerateTextOptions = {}
): Promise<LLMResponse<string>> {
  const model = genAI.getGenerativeModel({
    model: MODELS.flash,
    systemInstruction: options.systemPrompt,
    generationConfig: {
      temperature: options.temperature ?? 0.7,
      maxOutputTokens: options.maxTokens ?? 8192,
    },
  });

  const result: GenerateContentResult = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();
  const usage = response.usageMetadata;

  return {
    content: text,
    usage: usage
      ? {
          promptTokens: usage.promptTokenCount,
          completionTokens: usage.candidatesTokenCount,
          totalTokens: usage.totalTokenCount,
        }
      : undefined,
  };
}

/**
 * Generate structured JSON with Zod schema validation
 */
export async function generateJSON<T>(
  prompt: string,
  schema: z.ZodType<T>,
  options: GenerateTextOptions = {}
): Promise<LLMResponse<T>> {
  const jsonSchema = zodToJsonSchema(schema, 'response');
  const responseSchema = stripUnsupportedKeys(jsonSchema.definitions?.response as Record<string, unknown>);

  const model = genAI.getGenerativeModel({
    model: MODELS.flash,
    systemInstruction: options.systemPrompt,
    generationConfig: {
      temperature: options.temperature ?? 0.7,
      maxOutputTokens: options.maxTokens ?? 8192,
      responseMimeType: 'application/json',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      responseSchema: responseSchema as any,
    },
  });

  const result: GenerateContentResult = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();
  const usage = response.usageMetadata;

  // Clean and parse JSON
  const cleaned = cleanJsonString(text);
  const parsed = JSON.parse(cleaned);
  const validated = schema.parse(parsed);

  return {
    content: validated,
    usage: usage
      ? {
          promptTokens: usage.promptTokenCount,
          completionTokens: usage.candidatesTokenCount,
          totalTokens: usage.totalTokenCount,
        }
      : undefined,
  };
}

/**
 * Recursively strip keys not supported by Gemini's response schema
 * (e.g. additionalProperties, $schema, default)
 */
function stripUnsupportedKeys(obj: unknown): unknown {
  if (Array.isArray(obj)) {
    return obj.map(stripUnsupportedKeys);
  }
  if (obj !== null && typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      if (key === 'additionalProperties' || key === '$schema' || key === 'default') {
        continue;
      }
      result[key] = stripUnsupportedKeys(value);
    }
    return result;
  }
  return obj;
}

/**
 * Clean JSON string from LLM output
 */
function cleanJsonString(text: string): string {
  let cleaned = text.trim();

  // Remove BOM and zero-width characters
  cleaned = cleaned.replace(/[\uFEFF\u200B\u200C\u200D\u2060]/g, '');

  // Remove control characters except newline and tab
  cleaned = cleaned.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // Remove markdown code block wrappers
  cleaned = cleaned.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '');

  return cleaned.trim();
}
