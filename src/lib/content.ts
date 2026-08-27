

"use server";

import { promises as fs } from 'fs';
import path from 'path';
import { UowIndiaPageData } from '@/types';

interface Feature {
  text: string;
  href?: string;
}

export interface WhyChooseUsData {
  title: string;
  description: string;
  features: Feature[];
  image: {
    src: string;
    alt: string;
    ai_hint: string;
  };
}

export async function getWhyChooseUsData(fileName: string): Promise<WhyChooseUsData> {
  const filePath = path.join(process.cwd(), 'src', 'content', fileName);
  const jsonData = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(jsonData);
}

export async function getUowIndiaPageData(): Promise<UowIndiaPageData> {
    const filePath = path.join(process.cwd(), 'src', 'content', 'uow-india.json');
    const jsonData = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(jsonData);
}

export interface CollegeAdmissionsData {
    admissionServices: {
        title: string;
        description: string;
        items: string[];
    }[];
    partnerColleges: {
        name: string;
        logo: string;
        description: string;
        href: string;
        image: string;
        dataAiHint: string;
        programs: {
            name: string;
            details: string;
        }[];
    }[];
    admissionProcessSteps: {
        step: string;
        title: string;
        description: string;
        icon: string;
    }[];
}


export async function getCollegeAdmissionsData(): Promise<CollegeAdmissionsData> {
    const filePath = path.join(process.cwd(), 'src', 'content', 'college-admissions.json');
    const jsonData = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(jsonData);
}

export type CountrySubject = string | { name: string; description?: string; subPrograms?: string[] };

// Shape used by PopularDestinationsSection
export interface Country {
    slug: string;
    name: string;
    image: string;
    dataAiHint?: string;
    cost: string;
    intakes: string;
    subjects: CountrySubject[];
    highlights: string[];
    href: string;
}

// Raw countries.json shape (card fields plus SEO / listing extras)
interface CountryJson {
    slug: string;
    name: string;
    image?: string;
    dataAiHint?: string;
    cost?: string;
    intakes?: string;
    subjects?: CountrySubject[];
    highlights?: string[];
    top_universities?: string[];
    popular_courses?: string[];
}

function mapCountry(c: CountryJson): Country {
    const listedUnis = c.top_universities?.filter(Boolean) ?? [];
    const courses = c.subjects?.length ? c.subjects : (c.popular_courses ?? []);

    return {
        slug: c.slug,
        name: c.name,
        image: c.image || '/images/courses/default-course.svg',
        dataAiHint: c.dataAiHint,
        cost: c.cost || 'Varies',
        intakes: c.intakes || 'Varies',
        subjects: courses,
        highlights: c.highlights?.length ? c.highlights : listedUnis.slice(0, 4),
        href: `/study-abroad/${c.slug}`,
    };
}

export async function getCountriesData(): Promise<Country[]> {
    try {
        const filePath = path.join(process.cwd(), 'src', 'data', 'countries.json');
        const fileContent = await fs.readFile(filePath, 'utf8');
        const data: CountryJson[] = JSON.parse(fileContent);
        return data.map(mapCountry);
    } catch (e) {
        console.error("Failed to fetch countries data:", e);
        return [];
    }
}
