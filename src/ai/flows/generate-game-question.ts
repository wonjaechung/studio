
'use server';
/**
 * @fileOverview A flow that generates AP-style statistics questions for a game mode.
 *
 * - generateGameQuestion - A function that generates a new question.
 * - GameQuestion - The return type for the generateGameQuestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GameQuestionSchema = z.object({
  question: z.string().describe('The text of an AP-level statistics question. The question should require using a calculator or spreadsheet to solve.'),
  answer: z.string().describe('A concise, correct answer to the question (e.g., a number, a multiple choice letter, or a short phrase).'),
  solution: z.string().describe('A brief explanation of the steps needed to arrive at the correct answer.'),
  topic: z.string().describe('The general statistical topic of the question (e.g., "Linear Regression", "T-Test", "Probability").'),
});
export type GameQuestion = z.infer<typeof GameQuestionSchema>;

export async function generateGameQuestion(): Promise<GameQuestion> {
  return generateGameQuestionFlow();
}

const prompt = ai.definePrompt({
  name: 'generateGameQuestionPrompt',
  output: {schema: GameQuestionSchema},
  prompt: `You are an expert AP Statistics teacher. Generate one challenging, AP-exam-level statistics question. The question should be solvable using the tools available in a data analysis application (like statistical tests, distributions, graphing, or spreadsheet manipulation). Provide the question, a concise answer, a brief solution, and the topic.

  Example topics:
  - One-Variable Statistics
  - Linear Regression
  - T-Tests or T-Intervals
  - Normal Distributions
  - Binomial or Geometric Distributions
  - Chi-Square Tests

  Generate a new, unique question now.
  `,
});

const generateGameQuestionFlow = ai.defineFlow(
  {
    name: 'generateGameQuestionFlow',
    outputSchema: GameQuestionSchema,
  },
  async () => {
    const {output} = await prompt();
    return output!;
  }
);
