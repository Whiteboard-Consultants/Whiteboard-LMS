import type { Metadata } from 'next';
import OnlineProgramsContent from '@/components/online-programs-content';
import { pageMetadata, pageTitle } from '@/lib/seo';

export const metadata: Metadata = {
  ...pageMetadata({
    title: 'Online Degrees and Certification Programs for Career Growth | Upskill Anytime, Anywhere',
    description:
      'Discover flexible online degrees and certification programs for professionals, graduates, and career switchers. Earn accredited credentials, upskill with industry-ready courses, and boost your career online.',
    path: '/online-programs',
    openGraphTitle: 'Online Degrees and Certification Programs for Career Growth',
    openGraph: {
      images: [
        {
          url: '/og-image-online-programs.png',
          width: 1200,
          height: 630,
          alt: 'Online Degrees and Certification Programs',
        },
      ],
    },
  }),
  twitter: {
    title: pageTitle('Online Degrees & Certification Programs'),
    description:
      'Discover flexible online degrees and certification programs. Earn accredited credentials and upskill with industry-ready courses.',
    images: ['/twitter-image-online-programs.png'],
  },
};

export default function OnlineProgramsPage() {
  return <OnlineProgramsContent />;
}
