
// src/ai/flows/generate-explanation.ts
'use server';
/**
 * @fileOverview A flow that generates plain-English explanations of calculator equations.
 *
 * - generateExplanation - A function that generates explanation for a calculator entry.
 * - GenerateExplanationInput - The input type for the generateExplanation function.
 * - GenerateExplanationOutput - The return type for the generateExplanation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateExplanationInputSchema = z.object({
  input: z.string().describe('The input equation or command.'),
  output: z.string().describe('The output or result of the equation.'),
  type: z.string().optional().describe('The type of calculation performed.'),
  data: z.record(z.any()).optional().describe('Additional data related to the calculation.'),
});
export type GenerateExplanationInput = z.infer<typeof GenerateExplanationInputSchema>;

const GenerateExplanationOutputSchema = z.string().describe('A plain-English explanation of the equation and its result.');
export type GenerateExplanationOutput = z.infer<typeof GenerateExplanationOutputSchema>;

export async function generateExplanation(input: GenerateExplanationInput): Promise<GenerateExplanationOutput> {
  return generateExplanationFlow(input);
}

const generateExplanationPrompt = ai.definePrompt({
  name: 'generateExplanationPrompt',
  input: {schema: GenerateExplanationInputSchema},
  output: {schema: GenerateExplanationOutputSchema},
  prompt: `You are an expert statistics tutor. Given a calculator input, output, type and any associated data, explain what the calculation does in plain English.

Here are some examples:

Input: 1 + 1
Output: 2
Explanation: This calculation adds 1 and 1 together, resulting in 2.

Input: SQRT(9)
Output: 3
Explanation: This calculation takes the square root of 9, which is 3.

Input: 10 / 2
Output: 5
Explanation: This calculation divides 10 by 2, resulting in 5.


Now explain the following calculation. Keep it brief, one sentence if possible.

Input: {{{input}}}
Output: {{{output}}}
Type: {{{type}}}
Data: {{{data}}}
Explanation: `,
});

const generateExplanationFlow = ai.defineFlow(
  {
    name: 'generateExplanationFlow',
    inputSchema: GenerateExplanationInputSchema,
    outputSchema: GenerateExplanationOutputSchema,
  },
  async input => {
    // Pre-process the input to ensure data is in a string format for the prompt
    const promptInput = {
      ...input,
      data: input.data ? JSON.stringify(input.data, null, 2) : 'Not available',
    };

    const {output} = await generateExplanationPrompt(promptInput);

    // Provide a fallback explanation if the model returns null
    return output || "An explanation could not be generated for this entry.";
  }
);
