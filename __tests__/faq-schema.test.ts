// Test for FAQ schema implementation
import { generateFAQSchema, cleanSchema } from '@/lib/schema-markup';

describe('FAQ Schema Generation', () => {
  test('should generate valid FAQ schema for hustle culture blog post', () => {
    const faqs = [
      {
        question: "How does Hustle Culture affect Gen Z students in India?",
        answer: "Hustle Culture pushes Gen Z students in India to constantly optimise their time with extra courses, test prep and side projects, often at the cost of sleep, rest and mental health, which increases the risk of academic burnout."
      },
      {
        question: "What are signs of student burnout among Indian college students?",
        answer: "Common signs include chronic exhaustion, loss of motivation, increased irritability, declining performance despite long study hours and feeling guilty whenever you rest or say no to new commitments."
      },
      {
        question: "How can Gen Z students in India protect themselves from burnout?",
        answer: "Setting realistic limits, building tech-free time into each day, talking honestly about stress and seeking support from counsellors or education consultants can help students balance ambition with well-being."
      },
      {
        question: "How can Whiteboard Consultants help students facing burnout?",
        answer: "Whiteboard Consultants in Kolkata offers personalised counselling, test preparation and admissions guidance to help students across India create sustainable study plans and career paths without relying on Hustle Culture overload."
      }
    ];

    const schema = generateFAQSchema(faqs);
    const cleanedSchema = cleanSchema(schema);

    // Verify schema structure
    expect(cleanedSchema).toHaveProperty('@context', 'https://schema.org');
    expect(cleanedSchema).toHaveProperty('@type', 'FAQPage');
    expect(cleanedSchema).toHaveProperty('mainEntity');
    expect(Array.isArray(cleanedSchema.mainEntity)).toBe(true);
    expect(cleanedSchema.mainEntity).toHaveLength(4);

    // Verify each FAQ item
    cleanedSchema.mainEntity.forEach((item: any, index: number) => {
      expect(item).toHaveProperty('@type', 'Question');
      expect(item).toHaveProperty('name', faqs[index].question);
      expect(item).toHaveProperty('acceptedAnswer');
      expect(item.acceptedAnswer).toHaveProperty('@type', 'Answer');
      expect(item.acceptedAnswer).toHaveProperty('text', faqs[index].answer);
    });
  });

  test('should handle empty FAQ array', () => {
    const schema = generateFAQSchema([]);
    const cleanedSchema = cleanSchema(schema);

    expect(cleanedSchema).toHaveProperty('@context', 'https://schema.org');
    expect(cleanedSchema).toHaveProperty('@type', 'FAQPage');
    expect(cleanedSchema).toHaveProperty('mainEntity');
    expect(Array.isArray(cleanedSchema.mainEntity)).toBe(true);
    expect(cleanedSchema.mainEntity).toHaveLength(0);
  });
});
