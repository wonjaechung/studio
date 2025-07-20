'use server';

/**
 * @fileOverview Provides intelligent assistance by suggesting appropriate statistical tests or distributions based on the user's calculations.
 *
 * - suggestStatisticalTests - A function that suggests statistical tests or distributions based on user input.
 * - SuggestStatisticalTestsInput - The input type for the suggestStatisticalTests function.
 * - SuggestStatisticalTestsOutput - The return type for the suggestStatisticalTests function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestStatisticalTestsInputSchema = z.object({
  calculatorHistory: z.array(
    z.object({
      input: z.string().describe('The user input for the calculation.'),
      output: z.string().describe('The output of the calculation.'),
      type: z.string().optional().describe('The type of the calculation performed.'),
      data: z.record(z.any()).optional().describe('Any data associated with the calculation.'),
    })
  ).describe('The history of calculations performed by the user.'),
  spreadsheetColumns: z.array(z.string()).describe('Names of columns in the spreadsheet.'),
});
export type SuggestStatisticalTestsInput = z.infer<typeof SuggestStatisticalTestsInputSchema>;

const SuggestStatisticalTestsOutputSchema = z.object({
  suggestions: z.array(z.string()).describe('A list of suggested statistical tests or distributions.'),
});
export type SuggestStatisticalTestsOutput = z.infer<typeof SuggestStatisticalTestsOutputSchema>;

export async function suggestStatisticalTests(input: SuggestStatisticalTestsInput): Promise<SuggestStatisticalTestsOutput> {
  return suggestStatisticalTestsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestStatisticalTestsPrompt',
  input: {schema: SuggestStatisticalTestsInputSchema},
  output: {schema: SuggestStatisticalTestsOutputSchema},
  prompt: `You are an AI assistant that suggests appropriate statistical tests or distributions based on the user's current or previous calculations and the available data.

  Here is the user's calculation history:
  {{#each calculatorHistory}}
  - Input: {{this.input}}, Output: {{this.output}}, Type: {{this.type}}
  {{/each}}

  Here are the names of the columns in the spreadsheet:
  {{#each spreadsheetColumns}}
  - {{this}}
  {{/each}}

  Based on this information, suggest appropriate statistical tests or distributions that the user might want to use next. Be concise and only suggest tests relevant to the data.

  Here's how you should format your response:
  {
    "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"]
  }
  `,
});

const suggestStatisticalTestsFlow = ai.defineFlow(
  {
    name: 'suggestStatisticalTestsFlow',
    inputSchema: SuggestStatisticalTestsInputSchema,
    outputSchema: SuggestStatisticalTestsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
