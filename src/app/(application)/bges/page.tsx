import type { Metadata } from 'next';
import { BgesLandingHero } from '@/components/landing/bges-landing-hero';
import { BgesPathwaysSection } from '@/components/landing/bges-pathways-section';
import { BgesRiasecSection } from '@/components/landing/bges-riasec-section';
import { BgesWhySection } from '@/components/landing/bges-why-section';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Future of Jobs Career Event',
  description:
    'Position yourself for careers in fintech, AI/ML and management. Explore how AI, automation and digital finance will reshape jobs by 2030.',
  path: '/bges',
  openGraph: {
    images: [
      {
        url: '/landing/bges-careers-infographic.png',
        width: 1376,
        height: 768,
        alt: 'Future career paths in Fintech, AI & ML, and Management',
      },
    ],
  },
});

export default function BgesEventPage() {
  return (
    <main className="min-h-screen bg-[hsl(209,100%,29%)]">
      <BgesLandingHero />
      <BgesWhySection />
      <BgesPathwaysSection />
      <BgesRiasecSection />
      {/* Registration / form section will mount at #register */}
      <div id="register" className="sr-only" aria-hidden />
    </main>
  );
}
