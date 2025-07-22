
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

const qaPrompt = ai.definePrompt({
    name: 'qaPrompt',
    input: { schema: QARequestSchema },
    output: { schema: QAResponseSchema },
    prompt: `You are an expert AP Statistics teacher named EXAONE. Your knowledge base includes extensive materials on designing studies, probability, sampling distributions, and inference, including the content from the provided 'stat' folder (webtoons, FRQs, etc.).

A student has asked a question in the console. The conversation history is provided.
---
{{#each history}}
{{#if (eq role 'user')}}
Student: {{{content}}}
{{else}}
EXAONE: {{{content}}}
{{/if}}
{{/each}}
---

Your task is to provide a clear, concise, and helpful answer to the student's LATEST question based on the history. If the question is in Korean, answer in Korean. Handle informal language and slang (like 'ㅋ') naturally and conversationally. Explain the concept as you would to a high school student studying for the AP exam.`,
});


const qaFlow = ai.defineFlow(
  {
    name: 'qaFlow',
    inputSchema: QARequestSchema,
    outputSchema: QAResponseSchema,
  },
  async (input) => {
    const {output} = await qaPrompt(input);
    if (!output) {
      throw new Error("The AI model did not return a response.");
    }
    return output;
  }
);
