

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

// Define the structure for a single country
export interface Country {
    slug: string;
    name: string;
    image: string;
    dataAiHint?: string;
    universities: string;
    cost: string;
    intakes: string;
    subjects: (string | { name: string; description?: string; subPrograms?: string[] })[];
    highlights: string[];
    href: string;
}

// Function to fetch and map country data
export async function getCountriesData(): Promise<Country[]> {
    try {
        const filePath = path.join(process.cwd(), 'src', 'data', 'countries.json');
        const fileContent = await fs.readFile(filePath, 'utf8');
        const data: Country[] = JSON.parse(fileContent);
        
        return data.map((c: Country) => ({
            slug: c.slug,
            name: c.name,
            image: c.image || '/images/courses/default-course.svg',
            dataAiHint: c.dataAiHint,
            universities: c.universities || 'N/A',
            cost: c.cost || "Varies",
            intakes: c.intakes || "Varies",
            subjects: c.subjects || [],
            highlights: c.highlights || [],
            href: `/study-abroad/${c.slug}`,
        }));
    } catch (e) {
        console.error("Failed to fetch countries data:", e);
        return [];
    }
}
