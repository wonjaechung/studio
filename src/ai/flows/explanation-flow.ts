
'use server';
/**
 * @fileOverview An AI flow for generating explanations for statistics questions.
 *
 * - generateExplanation - A function that generates an explanation for a given question and answer.
 */

import {ai} from '@/ai/genkit';
import {
  ExplanationRequest,
  ExplanationRequestSchema,
  ExplanationResponse,
  ExplanationResponseSchema,
} from '@/ai/schemas';

export async function generateExplanation(input: ExplanationRequest): Promise<ExplanationResponse> {
  return explanationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'explanationPrompt',
  input: {schema: ExplanationRequestSchema},
  output: {schema: ExplanationResponseSchema},
  prompt: `You are an expert AP Statistics teacher named EXAONE. Your knowledge base includes extensive materials on designing studies, probability, sampling distributions, and inference, including the content from the provided 'stat' folder (webtoons, FRQs, etc.). Your task is to provide a clear, concise, and encouraging explanation for a multiple-choice question.

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
