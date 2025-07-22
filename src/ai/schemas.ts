
/**
 * @fileOverview Defines the data schemas and types for AI flows.
 *
 * - ExplanationRequestSchema - The input type for the generateExplanation function.
 * - ExplanationResponseSchema - The return type for the generateExplanation function.
 */

import {z} from 'genkit';

export const ExplanationRequestSchema = z.object({
  question: z.string().describe('The multiple-choice question that was asked.'),
  options: z.array(z.string()).describe('The list of all possible answer options.'),
  userAnswer: z.string().describe("The specific answer the user selected."),
  correctAnswer: z.string().describe("The correct answer for the question."),
});
export type ExplanationRequest = z.infer<typeof ExplanationRequestSchema>;

export const ExplanationResponseSchema = z.object({
  concept: z.string().describe("A short, catchy title for the core statistical concept being explained."),
  isCorrect: z.boolean().describe("Whether the user's answer was correct."),
  steps: z.array(z.string()).describe("A step-by-step explanation of how to arrive at the correct answer. Each step should be a separate string in the array."),
  distractors: z.array(z.string()).describe("An explanation of why the most common incorrect answer choices (distractors) are wrong. Each distractor explanation should be a separate string in the array."),
  summary: z.string().describe("A one-sentence summary of the key takeaway or principle."),
});
export type ExplanationResponse = z.infer<typeof ExplanationResponseSchema>;


export const QARequestSchema = z.object({
    history: z.array(z.object({
        role: z.enum(['user', 'model']),
        content: z.string(),
    })).describe("The conversation history between the user and the AI assistant."),
});
export type QARequest = z.infer<typeof QARequestSchema>;

export const QAResponseSchema = z.object({
  answer: z.string().describe("A clear, concise, and helpful answer to the user's question, based on the conversation history."),
});
export type QAResponse = z.infer<typeof QAResponseSchema>;
