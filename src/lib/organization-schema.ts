import { siteConfig } from '@/lib/seo';

/** Canonical social / entity URLs — keep in sync across JSON-LD and llms.txt */
export const organizationSameAs = [
  'https://www.facebook.com/whiteboardconsultants',
  'https://www.linkedin.com/company/whiteboard-consultants',
  'https://www.instagram.com/whiteboardconsultants',
  'https://twitter.com/whiteboardcons',
  'https://www.youtube.com/@whiteboardconsultants',
] as const;

const streetAddress = "Park Plaza, 71 Park Street, Floor 6, 'My Cube'";
const phone = siteConfig.contact.phone.replace(/\s/g, '');

export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': ['EducationalOrganization', 'LocalBusiness'],
  '@id': `${siteConfig.url}/#organization`,
  name: siteConfig.name,
  url: siteConfig.url,
  logo: `${siteConfig.url}/logo.png`,
  image: `${siteConfig.url}/og-image-home.png`,
  description:
    'Whiteboard Consultants is an education consultancy in Kolkata, India, offering study abroad counseling, IELTS/TOEFL/aptitude test preparation, college admissions support, upskilling, and career development for students.',
  foundingDate: '2022',
  email: siteConfig.contact.email,
  telephone: phone,
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: phone,
    email: siteConfig.contact.email,
    contactType: 'Customer Service',
    availableLanguage: ['English', 'Hindi', 'Bengali'],
    areaServed: 'IN',
  },
  address: {
    '@type': 'PostalAddress',
    streetAddress,
    addressLocality: 'Kolkata',
    addressRegion: 'West Bengal',
    postalCode: '700016',
    addressCountry: 'IN',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 22.5514,
    longitude: 88.3522,
  },
  areaServed: {
    '@type': 'GeoCircle',
    geoMidpoint: {
      '@type': 'GeoCoordinates',
      latitude: 22.5726,
      longitude: 88.3639,
    },
    geoRadius: '50000',
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '10:00',
      closes: '18:00',
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: 'Saturday',
      opens: '10:00',
      closes: '15:00',
    },
  ],
  founder: [
    {
      '@type': 'Person',
      name: 'Navnit Daniel Alley',
      jobTitle: 'Co-Founder',
      url: 'https://www.linkedin.com/in/navnit-daniel-alley-sales-and-career-coach',
    },
    {
      '@type': 'Person',
      name: 'Prateek Chaudhuri',
      jobTitle: 'Co-Founder',
      url: 'https://www.linkedin.com/in/prateek-chaudhuri-6a003b23/',
    },
  ],
  knowsAbout: [
    'Study Abroad',
    'IELTS Preparation',
    'TOEFL Preparation',
    'Aptitude Test Preparation',
    'College Admissions',
    'Upskilling',
    'Career Counseling',
    'Student Visa Assistance',
    'Education Consulting',
  ],
  sameAs: [...organizationSameAs],
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    reviewCount: 500,
    bestRating: '5',
    worstRating: '1',
  },
} as const;

export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${siteConfig.url}/#website`,
  name: siteConfig.name,
  url: `${siteConfig.url}/`,
  publisher: { '@id': `${siteConfig.url}/#organization` },
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${siteConfig.url}/courses?search={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
} as const;
