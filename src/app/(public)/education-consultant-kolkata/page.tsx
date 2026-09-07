import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QuickAnswer } from '@/components/quick-answer';
import { OfficeNap } from '@/components/office-nap';
import { FaqSection } from '@/components/sections/faq-section';
import StudyAbroadCtaSection from '@/components/sections/StudyAbroadCtaSection';
import { educationConsultantKolkataFaqs } from '@/lib/education-consultant-kolkata-faqs';
import { buildFaqPageSchema } from '@/lib/faq-schema';
import { pageMetadata, siteConfig } from '@/lib/seo';
import { ServiceCard, type IconName } from '@/components/service-card';
import { services } from '@/lib/services';

export const revalidate = 3600;

export const metadata: Metadata = pageMetadata({
  title: 'Education Consultant in Kolkata',
  description:
    'Whiteboard Consultants is an education consultant in Kolkata on Park Street. Study abroad, online degrees, IELTS/TOEFL, college admissions, and career counseling. Free first session.',
  path: '/education-consultant-kolkata',
});

const kolkataServices: { icon: IconName; title: string; description: string; href: string }[] = [
  services[0],
  services[1],
  {
    icon: 'Briefcase',
    title: 'Online Degrees',
    description:
      'Accredited online degrees and certificates you can complete while working, including Online MBA pathways from partner universities.',
    href: '/online-programs',
  },
  services[2],
];

const processSteps = [
  {
    title: 'Profile conversation',
    body: 'We start with your academics, budget, and timeline — in person at Park Street or online — so advice matches what you can actually pursue.',
  },
  {
    title: 'A clear shortlist',
    body: 'Overseas universities, Indian colleges, online degrees, or skill programs are compared side by side. You leave with options, not a sales pitch.',
  },
  {
    title: 'Applications and test prep',
    body: 'SOPs, documents, IELTS/TOEFL or aptitude coaching, and admission follow-up happen with the same team so nothing falls through.',
  },
  {
    title: 'After the offer',
    body: 'Visa guidance, pre-departure briefings, or enrollment support for Indian colleges — until you are actually started, not just accepted.',
  },
];

export default function EducationConsultantKolkataPage() {
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
        name: 'Education Consultant in Kolkata',
        item: `${siteConfig.url}/education-consultant-kolkata`,
      },
    ],
  };

  const localBusinessLd = {
    '@context': 'https://schema.org',
    '@type': ['EducationalOrganization', 'LocalBusiness'],
    '@id': `${siteConfig.url}/education-consultant-kolkata#localbusiness`,
    name: siteConfig.name,
    url: `${siteConfig.url}/education-consultant-kolkata`,
    image: `${siteConfig.url}/og-image-home.png`,
    telephone: siteConfig.contact.phone,
    email: siteConfig.contact.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: siteConfig.contact.streetAddress,
      addressLocality: siteConfig.contact.addressLocality,
      addressRegion: siteConfig.contact.addressRegion,
      postalCode: siteConfig.contact.postalCode,
      addressCountry: siteConfig.contact.addressCountry,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: siteConfig.contact.latitude,
      longitude: siteConfig.contact.longitude,
    },
    hasMap: siteConfig.contact.mapsUrl,
    openingHours: [siteConfig.contact.hoursWeekdays, siteConfig.contact.hoursSaturday],
    areaServed: {
      '@type': 'City',
      name: 'Kolkata',
    },
    parentOrganization: { '@id': `${siteConfig.url}/#organization` },
  };

  const faqSchema = buildFaqPageSchema(educationConsultantKolkataFaqs);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <section className="bg-slate-100 dark:bg-slate-dark py-16 sm:py-24">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="font-headline text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                Education Consultant in Kolkata
              </h1>
              <p className="mt-6 text-lg text-muted-foreground">
                Whiteboard Consultants is a Park Street education consultancy for students who want overseas
                universities, Indian college admissions, online degrees, or test prep without being passed between
                three different firms. Counseling is in English, Hindi, and Bengali.
              </p>
              <QuickAnswer>
                <p>
                  Meet us at {siteConfig.contact.address}. We are education consultants in Kolkata for{' '}
                  <Link href="/study-abroad-consultants-kolkata" className="text-primary underline dark:text-white">
                    study abroad
                  </Link>
                  ,{' '}
                  <Link href="/online-programs" className="text-primary underline dark:text-white">
                    online degrees
                  </Link>
                  , IELTS/TOEFL,{' '}
                  <Link href="/college-admissions" className="text-primary underline dark:text-white">
                    college admissions
                  </Link>
                  , and career development. Call {siteConfig.contact.phone} or book a free first session.
                </p>
              </QuickAnswer>
              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="w-full sm:w-auto">
                  <Link href="/contact">
                    Book a free session
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
                  <Link href="/about">Meet the team</Link>
                </Button>
              </div>
            </div>
            <div className="relative h-96 w-full overflow-hidden rounded-lg shadow-xl">
              <Image
                src="/whiteboard-team.webp"
                alt="Whiteboard Consultants education team at the Park Street, Kolkata office"
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
              Why students in Kolkata work with a local consultant
            </h2>
            <div className="mt-6 space-y-4 text-lg text-muted-foreground">
              <p>
                Searching &quot;education consultant in Kolkata&quot; usually returns national brands with a booth and a
                target. Families here typically need something slower: an honest shortlist, a realistic budget, and a
                counselor they can meet on Park Street when documents stall.
              </p>
              <p>
                We have been based in Kolkata since 2022. Study abroad, test prep, domestic admissions, and{' '}
                <Link href="/online-programs" className="text-primary underline dark:text-white">
                  online degrees
                </Link>{' '}
                sit in the same office, so your next step is chosen against the others — not sold in isolation. If
                India is the better path, we say so and route you through{' '}
                <Link href="/college-admissions" className="text-primary underline dark:text-white">
                  college admissions
                </Link>
                . If you need to keep working, we compare accredited online degree and Online MBA options instead of
                pushing a move abroad.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 bg-muted/20 dark:bg-slate-dark">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight font-headline sm:text-4xl">Services from our Kolkata office</h2>
            <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
              Each service is a real page on this site — not a keyword block. Start where your goal actually is.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {kolkataServices.map((service) => (
              <Link key={service.title} href={service.href} className="flex">
                <ServiceCard {...service} />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 bg-background dark:bg-black">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight font-headline sm:text-4xl text-center">
            How counseling works
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
              Meet us at our Park Street office
            </h2>
            <p>
              The office is in Park Plaza on Park Street — the same pin as our Google listing. Walk-ins are welcome
              during posted hours; appointments get dedicated time for documents and parents&apos; questions.
            </p>
            <p>
              Looking specifically for overseas admissions? Use our{' '}
              <Link href="/study-abroad-consultants-kolkata" className="text-primary underline dark:text-white">
                study abroad consultants in Kolkata
              </Link>{' '}
              page. For flexible study while you work, see{' '}
              <Link href="/online-programs" className="text-primary underline dark:text-white">
                online degrees
              </Link>
              , or browse destinations on the{' '}
              <Link href="/study-abroad" className="text-primary underline dark:text-white">
                study abroad hub
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      <FaqSection
        description="Practical questions students and parents ask before booking an education consultant in Kolkata."
        faqs={educationConsultantKolkataFaqs}
      />

      <StudyAbroadCtaSection headline="Talk to an education consultant in Kolkata" />
    </>
  );
}
