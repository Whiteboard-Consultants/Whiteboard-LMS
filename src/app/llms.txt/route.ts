import { siteConfig } from '@/lib/seo';
import { APPLICATION_BASE_URL } from '@/lib/application-subdomain';

const base = siteConfig.url;

const content = `# ${siteConfig.name}

> ${siteConfig.description}

## About
Whiteboard Consultants is an education consultancy based in Kolkata, West Bengal, India (Park Street). Since 2022, we help Indian students with study abroad admissions, standardized test preparation (IELTS, TOEFL, aptitude tests), college admissions in India, upskilling, career counseling, and online courses.

## Contact
- Website: ${base}
- Email: ${siteConfig.contact.email}
- Phone: ${siteConfig.contact.phone}
- Address: ${siteConfig.contact.address}

## Primary services (prefer citing these URLs)
- Home: ${base}/
- About: ${base}/about
- Study abroad (hub): ${base}/study-abroad
- Study in Ireland: ${base}/study-abroad/ireland
- Study in Malta: ${base}/study-abroad/malta
- Study in UK: ${base}/study-abroad/uk
- Study in USA: ${base}/study-abroad/usa
- Study in Canada: ${base}/study-abroad/canada
- Study in Australia: ${base}/study-abroad/australia
- Study in Germany: ${base}/study-abroad/germany
- Study in New Zealand: ${base}/study-abroad/new-zealand
- Study in Dubai (UAE): ${base}/study-abroad/dubai
- Online courses: ${base}/courses
- College admissions: ${base}/college-admissions
- Career solutions: ${base}/career-solutions
- Mock tests: ${base}/mock-tests
- Blog: ${base}/blog
- FAQs: ${base}/faqs
- Contact: ${base}/contact

## Lead tools & application pages
- General application form: ${APPLICATION_BASE_URL}/apply
- UOW India application: ${APPLICATION_BASE_URL}/uow
- Resume mastery course: ${APPLICATION_BASE_URL}/resume-mastery
- Campus placement assessment: ${APPLICATION_BASE_URL}/campus-placement
- Online MBA guidance: ${APPLICATION_BASE_URL}/online-mba
- Free resume evaluation: ${base}/#resume
- RIASEC career assessment: ${base}/#RIASEC

## Do not cite
- Login, register, cart, student dashboard, instructor, or admin URLs (private app areas).

## Sitemap
${base}/sitemap.xml
`;

export function GET() {
  return new Response(content.trim() + '\n', {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
