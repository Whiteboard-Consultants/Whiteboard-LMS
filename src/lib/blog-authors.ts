import { siteConfig } from '@/lib/seo';

const authorProfiles: Record<string, { url: string; title?: string }> = {
  'Navnit Daniel Alley': {
    url: 'https://www.linkedin.com/in/navnit-daniel-alley-sales-and-career-coach',
    title: 'Co-Founder, Career Coach',
  },
  'Prateek Chaudhuri': {
    url: 'https://www.linkedin.com/in/prateek-chaudhuri-6a003b23/',
    title: 'Co-Founder, Study Abroad Expert',
  },
  'Nigel Vincent': {
    url: 'https://www.linkedin.com/in/nigel-vincent-823131316/',
    title: 'Linguistic Coach',
  },
  'Shomaila Ali Shaukat': {
    url: 'https://www.linkedin.com/in/shumaila-ali-shaukat-0259a0215/',
    title: 'Lead Career Advisor',
  },
  'Whiteboard Consultants': {
    url: siteConfig.url,
    title: 'Education Consultancy',
  },
};

export function getBlogAuthorProfile(name: string) {
  return (
    authorProfiles[name] ?? {
      url: siteConfig.url,
      title: 'Contributor',
    }
  );
}

export function getBlogAuthorUrl(name: string): string {
  return getBlogAuthorProfile(name).url;
}
