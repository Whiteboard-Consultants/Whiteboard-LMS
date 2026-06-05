import CareerSolutionsClient from './client';
import { careerSolutionsFaqs } from '@/lib/career-solutions-faqs';
import { buildFaqPageSchema } from '@/lib/faq-schema';

const faqSchema = buildFaqPageSchema(careerSolutionsFaqs);

export default function CareerSolutionsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <CareerSolutionsClient />
    </>
  );
}
