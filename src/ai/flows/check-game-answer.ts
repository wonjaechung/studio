
'use server';
/**
 * @fileOverview A flow that checks if a user's answer to a game question is correct.
 *
 * - checkGameAnswer - A function that checks the user's answer.
 * - CheckGameAnswerInput - The input type for the checkGameAnswer function.
 * - CheckGameAnswerOutput - The return type for the checkGameAnswer function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CheckGameAnswerInputSchema = z.object({
  question: z.string().describe('The question that was asked.'),
  correctAnswer: z.string().describe('The known correct answer.'),
  userAnswer: z.string().describe("The user's submitted answer."),
});
export type CheckGameAnswerInput = z.infer<typeof CheckGameAnswerInputSchema>;

const CheckGameAnswerOutputSchema = z.object({
    isCorrect: z.boolean().describe('Whether the user answer is correct.'),
    feedback: z.string().describe('A brief explanation of why the answer is correct or incorrect.'),
});
export type CheckGameAnswerOutput = z.infer<typeof CheckGameAnswerOutputSchema>;

export async function checkGameAnswer(input: CheckGameAnswerInput): Promise<CheckGameAnswerOutput> {
  return checkGameAnswerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'checkGameAnswerPrompt',
  input: {schema: CheckGameAnswerInputSchema},
  output: {schema: CheckGameAnswerOutputSchema},
  prompt: `You are an expert statistics tutor evaluating a student's answer.
  The student was asked the following question:
  "{{question}}"

  The correct answer is: "{{correctAnswer}}"
  The student's answer was: "{{userAnswer}}"

  Evaluate if the student's answer is correct. The student's answer may be a number or a short phrase. Be flexible with minor formatting differences but strict with numerical accuracy.
  
  Provide your evaluation in the following JSON format:
  {
    "isCorrect": boolean,
    "feedback": "Your brief feedback here"
  }
  `,
});

const checkGameAnswerFlow = ai.defineFlow(
  {
    name: 'checkGameAnswerFlow',
    inputSchema: CheckGameAnswerInputSchema,
    outputSchema: CheckGameAnswerOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
