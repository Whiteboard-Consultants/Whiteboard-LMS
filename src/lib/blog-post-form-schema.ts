import { z } from 'zod';

export const faqItemSchema = z.object({
  question: z.string().min(5, { message: 'Question must be at least 5 characters.' }),
  answer: z.string().min(10, { message: 'Answer must be at least 10 characters.' }),
});

export const postFormSchema = z.object({
  title: z.string().min(2, { message: 'Title must be at least 2 characters.' }),
  slug: z.string().min(2, { message: 'Slug must be at least 2 characters.' }),
  excerpt: z.string().optional(),
  content: z.string().min(10, { message: 'Content must be at least 10 characters.' }),
  imageUrl: z.string().refine((val) => val === '' || z.string().url().safeParse(val).success, {
    message: 'Please enter a valid URL or leave empty.',
  }),
  category: z.string().min(2, { message: 'Category must be at least 2 characters.' }),
  tags: z.string(),
  featured: z.boolean(),
  authorName: z
    .string()
    .min(2, { message: 'Author name must be at least 2 characters.' })
    .default('Whiteboard Consultants'),
  faqSection: z.array(faqItemSchema).default([]),
});

export type PostFormValues = z.infer<typeof postFormSchema>;

export function normalizeFaqSection(
  faqs: Array<{ question: string; answer: string }> | undefined
): Array<{ question: string; answer: string }> {
  if (!faqs?.length) return [];
  return faqs.filter((f) => f.question.trim() && f.answer.trim());
}
