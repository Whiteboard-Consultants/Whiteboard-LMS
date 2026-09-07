import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QuickAnswer } from '@/components/quick-answer';
import { OfficeNap } from '@/components/office-nap';
import { FaqSection } from '@/components/sections/faq-section';
import StudyAbroadCtaSection from '@/components/sections/StudyAbroadCtaSection';
import { studyAbroadConsultantsKolkataFaqs } from '@/lib/study-abroad-consultants-kolkata-faqs';
import { buildFaqPageSchema } from '@/lib/faq-schema';
import { pageMetadata, siteConfig } from '@/lib/seo';

export const revalidate = 3600;

export const metadata: Metadata = pageMetadata({
  title: 'Study Abroad Consultants Kolkata',
  description:
    'Study abroad consultants in Kolkata for USA, UK, Canada, Australia, Ireland, Germany, NZ, Malta, and Dubai. University shortlisting, visas, and IELTS from Park Street.',
  path: '/study-abroad-consultants-kolkata',
});

const destinations = [
  { name: 'USA', href: '/study-abroad/usa' },
  { name: 'UK', href: '/study-abroad/uk' },
  { name: 'Canada', href: '/study-abroad/canada' },
  { name: 'Australia', href: '/study-abroad/australia' },
  { name: 'Ireland', href: '/study-abroad/ireland' },
  { name: 'Germany', href: '/study-abroad/germany' },
  { name: 'New Zealand', href: '/study-abroad/new-zealand' },
  { name: 'Malta', href: '/study-abroad/malta' },
  { name: 'Dubai (UAE)', href: '/study-abroad/dubai' },
];

const processSteps = [
  {
    title: 'Free profile review',
    body: 'Academics, English scores, budget, and preferred intake. We say if a destination is a poor fit before you spend on tests.',
  },
  {
    title: 'Country and course shortlist',
    body: 'A focused list — not 40 portals. Each option has a reason: ranking, cost, visa, or post-study work.',
  },
  {
    title: 'Tests, SOP, and applications',
    body: 'IELTS/TOEFL/GRE/GMAT coaching sits next to application writing so your scores and essays tell the same story.',
  },
  {
    title: 'Visa and pre-departure',
    body: 'Documentation checks, interview practice where needed, and a briefing before you fly.',
  },
];

export default function StudyAbroadConsultantsKolkataPage() {
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: siteConfig.url,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Study Abroad',
        item: `${siteConfig.url}/study-abroad`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Study Abroad Consultants in Kolkata',
        item: `${siteConfig.url}/study-abroad-consultants-kolkata`,
      },
    ],
  };

  const serviceLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Study Abroad Counseling in Kolkata',
    serviceType: 'Study Abroad Counseling',
    url: `${siteConfig.url}/study-abroad-consultants-kolkata`,
    provider: {
      '@id': `${siteConfig.url}/#organization`,
    },
    areaServed: {
      '@type': 'City',
      name: 'Kolkata',
    },
    description:
      'Study abroad consultancy from Whiteboard Consultants in Kolkata: university shortlisting, applications, IELTS/TOEFL/GRE/GMAT prep, and student visa guidance.',
  };

  const faqSchema = buildFaqPageSchema(studyAbroadConsultantsKolkataFaqs);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <section className="bg-slate-100 dark:bg-slate-dark py-16 sm:py-24">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="font-headline text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                Study Abroad Consultants in Kolkata
              </h1>
              <p className="mt-6 text-lg text-muted-foreground">
                Planning to study overseas from Kolkata? We shortlist universities, run applications, coach for English
                and aptitude tests, and guide student visas from our Park Street office.
              </p>
              <QuickAnswer>
                <p>
                  Whiteboard Consultants are study abroad consultants in Kolkata at {siteConfig.contact.address}. We
                  counsel for the USA, UK, Canada, Australia, Ireland, Germany, New Zealand, Malta, and Dubai. First
                  session is free — call {siteConfig.contact.phone}.
                </p>
              </QuickAnswer>
              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="w-full sm:w-auto">
                  <Link href="/contact">
                    Book free counseling
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
                  <Link href="/study-abroad">See all destinations</Link>
                </Button>
              </div>
            </div>
            <div className="relative h-96 w-full overflow-hidden rounded-lg shadow-xl">
              <Image
                src="/study-abroad/study-abroad-hero.webp"
                alt="Students planning study abroad with consultants in Kolkata"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 bg-background dark:bg-black">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-bold tracking-tight font-headline sm:text-4xl">
              Study abroad counseling that starts in Kolkata
            </h2>
            <div className="mt-6 space-y-4 text-lg text-muted-foreground">
              <p>
                Country pages on this site cover universities and visas. This page is about doing that work locally:
                sitting with a counselor on Park Street, aligning IELTS or TOEFL with intake deadlines, and involving
                parents in cost and visa conversations.
              </p>
              <p>
                We are the same{' '}
                <Link href="/education-consultant-kolkata" className="text-primary underline dark:text-white">
                  education consultants in Kolkata
                </Link>{' '}
                who handle Indian college admissions when overseas study is not the right next step. You will not be
                pushed into a destination that does not fit your profile.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 bg-muted/20 dark:bg-slate-dark">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight font-headline sm:text-4xl">Destinations we counsel from Kolkata</h2>
            <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
              Each country has its own guide. Start here if you already know where you want to go.
            </p>
          </div>
          <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {destinations.map((destination) => (
              <li key={destination.href}>
                <Link
                  href={destination.href}
                  className="flex h-full items-center justify-center rounded-lg border bg-card px-4 py-6 text-center font-semibold hover:border-primary hover:text-primary transition-colors"
                >
                  {destination.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="py-16 sm:py-24 bg-background dark:bg-black">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight font-headline sm:text-4xl text-center">
            From first meeting to visa
          </h2>
          <ol className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {processSteps.map((step, index) => (
              <li key={step.title} className="rounded-xl border bg-card p-6">
                <span className="text-sm font-semibold text-primary">Step {index + 1}</span>
                <h3 className="mt-2 text-xl font-bold">{step.title}</h3>
                <p className="mt-3 text-muted-foreground">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="py-16 sm:py-24 bg-muted/20 dark:bg-slate-dark">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          <OfficeNap />
          <div className="space-y-4 text-lg text-muted-foreground">
            <h2 className="text-3xl font-bold tracking-tight text-foreground font-headline sm:text-4xl">
              Test prep in the same office
            </h2>
            <p>
              Most overseas applications from Kolkata stall on English scores, not on the SOP. IELTS, TOEFL, GRE, and
              GMAT coaching runs alongside counseling so your university list and your score target stay aligned.
            </p>
            <p>
              Browse{' '}
              <Link href="/courses" className="text-primary underline dark:text-white">
                test prep courses
              </Link>{' '}
              or the full{' '}
              <Link href="/study-abroad" className="text-primary underline dark:text-white">
                study abroad
              </Link>{' '}
              hub for scholarships, visas, and country detail.
            </p>
          </div>
        </div>
      </section>

      <FaqSection
        description="What students in Kolkata ask before hiring a study abroad consultant."
        faqs={studyAbroadConsultantsKolkataFaqs}
      />

      <StudyAbroadCtaSection headline="Talk to a study abroad consultant in Kolkata" />
    </>
  );
}
