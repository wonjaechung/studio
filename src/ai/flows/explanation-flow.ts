'use server';
/**
 * @fileOverview An AI flow for generating explanations for statistics questions.
 *
 * - generateExplanation - A function that generates an explanation for a given question and answer.
 * - ExplanationRequestSchema - The input type for the generateExplanation function.
 * - ExplanationResponseSchema - The return type for the generateExplanation function.
 */

import {ai} from '@/ai/genkit';
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


export async function generateExplanation(input: ExplanationRequest): Promise<ExplanationResponse> {
  return explanationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'explanationPrompt',
  input: {schema: ExplanationRequestSchema},
  output: {schema: ExplanationResponseSchema},
  prompt: `You are an expert AP Statistics teacher named EXAONE. Your task is to provide a clear, concise, and encouraging explanation for a multiple-choice question.

The user was presented with the following question:
---
Question: {{{question}}}
---

The available options were:
---
{{#each options}}
- {{{this}}}
{{/each}}
---

The user selected: "{{{userAnswer}}}"
The correct answer is: "{{{correctAnswer}}}"

Please generate an explanation in the following JSON format. The tone should be helpful and educational.

1.  **concept**: A short, catchy title for the core statistical concept. Start with a relevant emoji.
2.  **isCorrect**: A boolean indicating if the user's answer was correct.
3.  **steps**: An array of strings, with each string being a step-by-step guide to solving the problem.
4.  **distractors**: An array of strings, explaining why the other incorrect options are wrong. Focus on the most common mistakes.
5.  **summary**: A single, powerful sentence that summarizes the main learning objective.`,
});

const explanationFlow = ai.defineFlow(
  {
    name: 'explanationFlow',
    inputSchema: ExplanationRequestSchema,
    outputSchema: ExplanationResponseSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error("The AI model did not return a response.");
    }
    return output;
  }
);
