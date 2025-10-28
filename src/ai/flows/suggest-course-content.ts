'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting course content ideas.
 *
 * The flow takes a course description and generates suggestions for course structure,
 * exercise types, and assignments.
 *
 * @exports {
 *   suggestCourseContent: (input: SuggestCourseContentInput) => Promise<SuggestCourseContentOutput>;
 *   SuggestCourseContentInput: type
 *   SuggestCourseContentOutput: type
 * }
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestCourseContentInputSchema = z.object({
  courseDescription: z
    .string()//Added description to schema
    .describe('A description of the course for which to generate content suggestions.'),
});
export type SuggestCourseContentInput = z.infer<typeof SuggestCourseContentInputSchema>;

const SuggestCourseContentOutputSchema = z.object({
  courseStructureSuggestions: z
    .string()//Added description to schema
    .describe('Suggestions for structuring the course content into modules and sections.'),
  exerciseTypeSuggestions: z
    .string()//Added description to schema
    .describe('Suggestions for different types of exercises to include in the course.'),
  assignmentSuggestions: z
    .string()//Added description to schema
    .describe('Suggestions for assignments that students can complete to reinforce learning.'),
});
export type SuggestCourseContentOutput = z.infer<typeof SuggestCourseContentOutputSchema>;

export async function suggestCourseContent(input: SuggestCourseContentInput): Promise<SuggestCourseContentOutput> {
  return suggestCourseContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestCourseContentPrompt',
  input: {schema: SuggestCourseContentInputSchema},
  output: {schema: SuggestCourseContentOutputSchema},
  prompt: `You are an AI assistant who is an expert in instructional design. Your goal is to help an instructor create a comprehensive and engaging course.

Based on the following course description, please generate detailed and practical suggestions for the course structure, types of exercises, and potential assignments. Expand on the provided description to create a full-fledged course outline.

Course Description:
"{{{courseDescription}}}"

Please provide your suggestions in a clear, well-organized format. Your response must be a JSON object with the following keys:
- "courseStructureSuggestions": A detailed breakdown of the course into logical modules and the lessons within each module.
- "exerciseTypeSuggestions": A list of varied and engaging exercise types suitable for the course topic (e.g., coding challenges, case study analyses, role-playing scenarios, etc.).
- "assignmentSuggestions": A list of meaningful assignments that will help students apply what they've learned and demonstrate their understanding.`,
});

const suggestCourseContentFlow = ai.defineFlow(
  {
    name: 'suggestCourseContentFlow',
    inputSchema: SuggestCourseContentInputSchema,
    outputSchema: SuggestCourseContentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
