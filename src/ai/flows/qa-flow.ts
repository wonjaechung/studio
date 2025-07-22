
'use server';
/**
 * @fileOverview An AI flow for answering general statistics questions.
 *
 * - answerQuestion - A function that takes a user's question and provides an answer.
 */

import {ai} from '@/ai/genkit';
import {
    QARequest,
    QARequestSchema,
    QAResponse,
    QAResponseSchema,
} from '@/ai/schemas';


export async function answerQuestion(input: QARequest): Promise<QAResponse> {
  return qaFlow(input);
}

const prompt = ai.definePrompt({
  name: 'qaPrompt',
  input: {schema: QARequestSchema},
  output: {schema: QAResponseSchema},
  prompt: `You are an expert AP Statistics teacher named EXAONE. Your knowledge base includes extensive materials on designing studies, probability, sampling distributions, and inference, including the content from the provided 'stat' folder (webtoons, FRQs, etc.).

A student has asked the following question in the console:
---
Question: {{{question}}}
---

Please provide a clear, concise, and helpful answer. If the question is in Korean, answer in Korean. Explain the concept as you would to a high school student studying for the AP exam.`,
});

const qaFlow = ai.defineFlow(
  {
    name: 'qaFlow',
    inputSchema: QARequestSchema,
    outputSchema: QAResponseSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error("The AI model did not return a response.");
    }
    return output;
  }
);
