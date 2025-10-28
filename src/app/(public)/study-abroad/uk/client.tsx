
'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, CheckCircle2, Award, BookOpen, Briefcase, Globe, HeartHandshake, Users, Star, FileText, BarChart, Book, Clock, XCircle, Plane, Landmark, Telescope, CalendarCheck, School, MapPin, Banknote } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import StudyAbroadCtaSection from "@/components/sections/StudyAbroadCtaSection";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const faqsForSchema = [
    {
        questionName: "Why is the UK a popular study destination for Indian students?",
        acceptedAnswerText: "The UK is popular for its world-renowned universities, shorter degree durations which reduce costs, a multicultural environment, and the Graduate Route visa that allows students to work for 2 years after graduation."
    },
    {
        questionName: "What are the requirements to study in the UK for Indian students?",
        acceptedAnswerText: "For undergraduate courses, you typically need 70-85% in your Higher Secondary Certificate. For postgraduate courses, a bachelor's degree with a good score is required. You also need to prove English proficiency via IELTS (typically 6.0-7.0) or TOEFL or an equivalent test."
    },
    {
        questionName: "What is the cost of studying in the UK?",
        acceptedAnswerText: "Tuition fees for international students generally range from £15,000 to £35,000 per year for most courses. Living costs vary by city but are estimated to be between £12,000 and £15,000 per year."
    },
    {
        questionName: "Can I work in the UK after my studies?",
        acceptedAnswerText: "Yes, the Graduate Route allows eligible international students who have completed an undergraduate or master's degree to stay and work for 2 years (3 years for PhD graduates) after their studies."
    }
];

const whyStudyInUK = [
    { icon: Award, title: 'World-Class Universities', description: 'Home to some of the world’s oldest and most prestigious universities with a reputation for academic excellence.', color: 'text-blue-500' },
    { icon: Clock, title: 'Shorter Course Duration', description: 'Complete your Bachelor’s degree in 3 years and Master’s in 1 year, saving you time and money.', color: 'text-orange-500' },
    { icon: Briefcase, title: 'Graduate Route Visa', description: 'Gain valuable work experience with a 2-year post-study work visa after completing your degree.', color: 'text-green-500' },
    { icon: Users, title: 'Multicultural Environment', description: 'Experience a diverse and welcoming society with students from all over the world.', color: 'text-purple-500' },
    { icon: HeartHandshake, title: 'Free Healthcare (NHS)', description: 'International students get access to the National Health Service (NHS) by paying the IHS fee.', color: 'text-red-500' },
    { icon: Globe, title: 'Gateway to Europe', description: 'Easily travel and explore other European countries during your study breaks.', color: 'text-yellow-500' },
    { icon: BookOpen, title: 'Excellence in Research', description: 'The UK is a global leader in research and innovation across various fields.', color: 'text-teal-500' },
    { icon: School, title: 'Variety of Courses', description: 'Choose from a vast range of subjects and specializations to match your career goals.', color: 'text-indigo-500' }
];

const topUniversities = [
    {
        name: "University College London (UCL)",
        qsRanking: "9",
        webometricsWorldRanking: "20",
        webometricsNationalRanking: "3",
        location: "London",
        image: "https://images.pexels.com/photos/267507/pexels-photo-267507.jpeg",
        dataAiHint: "university main building",
        programs: {
            ug: [ { name: "BSc Computer Science", fee: "£37,500" }, { name: "BSc Economics", fee: "£35,000" }, { name: "LLB Bachelor of Laws", fee: "£31,200" } ],
            pg: [ { name: "MSc Data Science", fee: "£35,000" }, { name: "MSc Management", fee: "£39,000" }, { name: "MA Education", fee: "£31,200" } ]
        }
    },
    {
        name: "University of Edinburgh",
        qsRanking: "22",
        webometricsWorldRanking: "35",
        webometricsNationalRanking: "5",
        location: "Edinburgh",
        image: "https://images.pexels.com/photos/167698/pexels-photo-167698.jpeg",
        dataAiHint: "historic city edinburgh",
        programs: {
            ug: [ { name: "BSc (Hons) Artificial Intelligence & Computer Science", fee: "£34,800" }, { name: "BSc (Hons) Economics", fee: "£26,500" }, { name: "BEng (Hons) Electronics and Computer Science", fee: "£34,800" } ],
            pg: [ { name: "MSc Data Science", fee: "£38,500" }, { name: "MBA (Full-time)", fee: "£40,900" }, { name: "MSc Finance", fee: "£37,200" } ]
        }
    },
    {
        name: "University of Manchester",
        qsRanking: "32",
        webometricsWorldRanking: "45",
        webometricsNationalRanking: "6",
        location: "Manchester",
        image: "https://images.pexels.com/photos/1438072/pexels-photo-1438072.jpeg",
        dataAiHint: "students in lecture hall",
        programs: {
            ug: [ { name: "BSc Computer Science", fee: "£32,000" }, { name: "BEng (Hons) Mechanical Engineering", fee: "£32,000" }, { name: "BSc (Hons) Management", fee: "£28,000" } ],
            pg: [ { name: "MSc Advanced Computer Science", fee: "£31,000" }, { name: "MSc Business Analytics", fee: "£28,000" }, { name: "The Manchester MBA (Full-time)", fee: "£48,000" } ]
        }
    },
    {
        name: "King's College London",
        qsRanking: "40",
        webometricsWorldRanking: "50",
        webometricsNationalRanking: "7",
        location: "London",
        image: "https://images.pexels.com/photos/3184325/pexels-photo-3184325.jpeg",
        dataAiHint: "business meeting",
        programs: {
            ug: [ { name: "BSc Business Management", fee: "£33,450" }, { name: "BSc Computer Science", fee: "£34,776" }, { name: "LLB (Hons) Law", fee: "£31,860" } ],
            pg: [ { name: "MSc International Management", fee: "£33,930" }, { name: "MSc Data Science", fee: "£33,450" }, { name: "MA Digital Asset & Media Management", fee: "£24,420" } ]
        }
    },
    {
        name: "University of Glasgow",
        qsRanking: "76",
        webometricsWorldRanking: "85",
        webometricsNationalRanking: "8",
        location: "Glasgow",
        image: "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg",
        dataAiHint: "teamwork collaboration",
        programs: {
            ug: [ { name: "BEng (Hons) Aeronautical Engineering", fee: "£28,560" }, { name: "BSc (Hons) Computing Science", fee: "£28,560" }, { name: "BSc (Hons) Business Economics", fee: "£25,980" } ],
            pg: [ { name: "MSc Management", fee: "£29,340" }, { name: "MSc Data Analytics", fee: "£28,350" }, { name: "MBA (Master of Business Administration)", fee: "£37,500" } ]
        }
    },
    {
        name: "University of Warwick",
        qsRanking: "67",
        webometricsWorldRanking: "105",
        webometricsNationalRanking: "10",
        location: "Coventry",
        image: "https://images.pexels.com/photos/2041540/pexels-photo-2041540.jpeg",
        dataAiHint: "modern university building",
        programs: {
            ug: [ { name: "BSc Computer Science", fee: "£31,620" }, { name: "BSc Economics", fee: "£25,820 - £31,620" }, { name: "BSc Management", fee: "£31,620" } ],
            pg: [ { name: "MSc Business Analytics", fee: "£34,250" }, { name: "MSc Finance", fee: "£43,950" }, { name: "Full-time MBA", fee: "£53,750" } ]
        }
    },
    {
        name: "University of Leeds",
        qsRanking: "75",
        webometricsWorldRanking: "116",
        webometricsNationalRanking: "11",
        location: "Leeds",
        image: "https://images.pexels.com/photos/256490/pexels-photo-256490.jpeg",
        dataAiHint: "university graduation",
        programs: {
            ug: [ { name: "BSc Business Analytics", fee: "£26,500" }, { name: "BEng Mechanical Engineering", fee: "£28,750" }, { name: "BA Communication and Media", fee: "£24,500" } ],
            pg: [ { name: "MSc Advanced Computer Science", fee: "£32,000" }, { name: "MBA (Full-time)", fee: "£38,500" }, { name: "MSc Management", fee: "£29,750" } ]
        }
    },
    {
        name: "Cardiff University",
        qsRanking: "154",
        webometricsWorldRanking: "160",
        webometricsNationalRanking: "15",
        location: "Cardiff",
        image: "https://images.pexels.com/photos/3183198/pexels-photo-3183198.jpeg",
        dataAiHint: "diverse team meeting",
        programs: {
            ug: [ { name: "BSc (Hons) Computer Science", fee: "£26,450" }, { name: "BEng (Hons) Mechanical Engineering", fee: "£26,450" }, { name: "BSc (Hons) Business Management", fee: "£21,450" } ],
            pg: [ { name: "MSc Business Strategy and Entrepreneurship", fee: "£24,950" }, { name: "MSc Data Science and Analytics", fee: "£26,450" }, { name: "The Cardiff MBA", fee: "£31,450" } ]
        }
    },
    {
        name: "Sheffield Hallam University",
        qsRanking: "851-900",
        webometricsWorldRanking: "750",
        webometricsNationalRanking: "58",
        location: "Sheffield",
        image: "https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg",
        dataAiHint: "students collaborating on project",
        programs: {
            ug: [ { name: "BSc (Hons) Computer Science", fee: "£16,735" }, { name: "BA (Hons) Business and Management", fee: "£15,905" }, { name: "BEng (Hons) Mechanical Engineering", fee: "£16,735" } ],
            pg: [ { name: "MSc Big Data Analytics", fee: "£17,085" }, { name: "MBA", fee: "£19,415" }, { name: "MSc International Marketing", fee: "£17,085" } ]
        }
    },
    {
        name: "University of Greenwich",
        qsRanking: "671-680",
        webometricsWorldRanking: "800",
        webometricsNationalRanking: "60",
        location: "London",
        image: "https://images.pexels.com/photos/1595391/pexels-photo-1595391.jpeg",
        dataAiHint: "students working together",
        programs: {
            ug: [ { name: "BSc (Hons) Computer Science", fee: "£16,950" }, { name: "BA (Hons) Business Management", fee: "£16,950" }, { name: "BEng (Hons) Engineering Management", fee: "£16,950" } ],
            pg: [ { name: "MSc Data Science", fee: "£18,250" }, { name: "International MBA", fee: "£20,500" }, { name: "MSc Engineering Management", fee: "£17,650" } ]
        }
    },
    {
        name: "University of Hertfordshire",
        qsRanking: "951-1000",
        webometricsWorldRanking: "850",
        webometricsNationalRanking: "62",
        location: "Hatfield",
        image: "https://images.pexels.com/photos/5945808/pexels-photo-5945808.jpeg",
        dataAiHint: "students discussion outdoors",
        programs: {
            ug: [ { name: "BSc (Hons) Computer Science", fee: "£15,950" }, { name: "BEng (Hons) Aerospace Engineering", fee: "£15,950" }, { name: "BA (Hons) Business Administration", fee: "£15,450" } ],
            pg: [ { name: "MSc Artificial Intelligence with Robotics", fee: "£17,450" }, { name: "MSc Business Analytics and Consultancy", fee: "£16,950" }, { name: "MBA", fee: "£17,950" } ]
        }
    },
    {
        name: "University of Salford",
        qsRanking: "851-900",
        webometricsWorldRanking: "900",
        webometricsNationalRanking: "65",
        location: "Salford",
        image: "https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg",
        dataAiHint: "team meeting discussion",
        programs: {
            ug: [ { name: "BSc (Hons) Computer Science", fee: "£17,550" }, { name: "BEng (Hons) Aeronautical Engineering", fee: "£17,550" }, { name: "BSc (Hons) Business Management", fee: "£16,380" } ],
            pg: [ { name: "MSc Data Science", fee: "£17,550" }, { name: "The Salford MBA", fee: "£18,900" }, { name: "MSc Project Management", fee: "£16,380" } ]
        }
    },
    {
        name: "Middlesex University",
        qsRanking: "901-950",
        webometricsWorldRanking: "1000",
        webometricsNationalRanking: "70",
        location: "London",
        image: "https://images.pexels.com/photos/1181414/pexels-photo-1181414.jpeg",
        dataAiHint: "students in classroom",
        programs: {
            ug: [ { name: "BSc (Hons) Computer Science", fee: "£16,500" }, { name: "BA (Hons) International Business Management", fee: "£16,500" }, { name: "BEng (Hons) Mechatronics", fee: "£16,500" } ],
            pg: [ { name: "MSc Data Science", fee: "£18,000" }, { name: "MBA", fee: "£19,000" }, { name: "MSc Engineering Management", fee: "£18,000" } ]
        }
    },
    {
        name: "University of East London",
        qsRanking: "951-1000",
        webometricsWorldRanking: "1500",
        webometricsNationalRanking: "85",
        location: "London",
        image: "https://images.pexels.com/photos/6958531/pexels-photo-6958531.jpeg",
        dataAiHint: "student online learning",
        programs: {
            ug: [ { name: "BSc (Hons) Computer Science", fee: "£14,820" }, { name: "BSc (Hons) Business Management", fee: "£14,820" }, { name: "BEng (Hons) Civil Engineering", fee: "£14,820" } ],
            pg: [ { name: "MSc Computer Science", fee: "£16,740" }, { name: "MBA", fee: "£16,740" }, { name: "MSc Construction Engineering Management", fee: "£16,740" } ]
        }
    },
    {
        name: "University of Bedfordshire",
        qsRanking: "1201-1400",
        webometricsWorldRanking: "1600",
        webometricsNationalRanking: "90",
        location: "Luton/Bedford",
        image: "https://images.pexels.com/photos/5905709/pexels-photo-5905709.jpeg",
        dataAiHint: "students talking",
        programs: {
            ug: [ { name: "BSc (Hons) Computer Science", fee: "£14,500" }, { name: "BA (Hons) Business Administration", fee: "£14,500" }, { name: "BEng (Hons) Automotive Engineering", fee: "£14,500" } ],
            pg: [ { name: "MSc Computer Science", fee: "£14,975" }, { name: "MBA", fee: "£15,225" }, { name: "MSc Project Management", fee: "£14,975" } ]
        }
    }
].sort((a, b) => parseInt(a.webometricsWorldRanking) - parseInt(b.webometricsWorldRanking));

const admissionRequirements = {
    undergraduate: [
        "Higher Secondary Certificate (HSC) with typical requirements of 70-85%. Some top universities may require higher.",
        "Proof of English proficiency: IELTS (typically 6.0-6.5 overall) or TOEFL (typically 80-92 iBT), or equivalent.",
        "A compelling Personal Statement explaining your motivation and suitability.",
        "Letters of Recommendation (LORs) from teachers.",
        "Some courses like Medicine or Law may require specific entrance exams (UCAT, LNAT)."
    ],
    postgraduate: [
        "A Bachelor's degree from a recognized university, usually equivalent to a UK Second Class Honours (2:1 or 2:2).",
        "Proof of English proficiency: IELTS (typically 6.5-7.0 overall) or TOEFL (typically 92-100 iBT), or equivalent.",
        "A strong Statement of Purpose (SOP) detailing your academic and career goals.",
        "Academic and/or professional Letters of Recommendation (LORs).",
        "A CV/Resume. Some MBA programs may require GMAT/GRE and significant work experience."
    ]
};

const studyCosts = [
    { item: "Undergraduate Tuition Fee", cost: "£15,000 - £35,000 per year" },
    { item: "Postgraduate Tuition Fee", cost: "£16,000 - £40,000 per year" },
    { item: "Living Expenses (London)", cost: "£1,334 per month (£12,006 for 9 months)" },
    { item: "Living Expenses (Outside London)", cost: "£1,023 per month (£9,207 for 9 months)" },
    { item: "Immigration Health Surcharge (IHS)", cost: "£776 per year" },
];

const visaProcessSteps = [
    { title: "Receive CAS from University", description: "Get your Confirmation of Acceptance for Studies (CAS) number from your university after accepting their offer." },
    { title: "Prepare Financial Documents", description: "Show proof of funds to cover your first year's tuition fees and living costs." },
    { title: "Complete Online Application", description: "Fill out the Student Route visa application form on the official UK government website." },
    { title: "Pay Visa Fee & IHS", description: "Pay the visa application fee (£490 from outside the UK) and the Immigration Health Surcharge (IHS)." },
    { title: "Book Biometrics Appointment", description: "Schedule an appointment at a visa application centre (VFS) to provide your fingerprints and photograph." },
    { title: "Attend Appointment", description: "Submit your passport and supporting documents at the visa application centre." },
    { title: "Wait for Decision", description: "Visa processing times vary, but decisions are typically made within 3-4 weeks." },
];

const ugTimeline = [
  { range: "12-15 Months Before Intake", title: "Research & Exploration", icon: Telescope, tasks: [ "Define your academic and career goals.", "Research UK universities, courses, and locations.", "Check admission requirements, especially for competitive courses.", "Start preparing for IELTS/TOEFL and any required entrance exams." ] },
  { range: "10-12 Months Before Intake", title: "Test Prep & Application Strategy", icon: BookOpen, tasks: [ "Take your IELTS/TOEFL to get your desired score.", "Finalize a list of up to 5 universities for your UCAS application.", "Begin drafting your Personal Statement.", "Request Letters of Recommendation from teachers." ] },
  { range: "8-10 Months Before Intake", title: "UCAS Application Submission", icon: FileText, tasks: [ "Complete and submit your UCAS application.", "Pay the UCAS application fee.", "Ensure your school sends transcripts and references.", "Track your application status via UCAS Hub." ] },
  { range: "5-8 Months Before Intake", title: "Receive & Accept Offers", icon: Landmark, tasks: [ "Receive conditional or unconditional offers from universities.", "Select your Firm (first) and Insurance (backup) choices.", "Start arranging financial documents for your student visa.", "Apply for scholarships and accommodation." ] },
  { range: "3-4 Months Before Intake", "title": "Meet Offer Conditions & Get CAS", icon: CalendarCheck, tasks: [ "Meet all conditions of your offer (e.g., final exam results).", "Once unconditional, request your CAS from the university.", "Pay the tuition fee deposit as required.", "Gather all documents for the student visa application." ] },
  { range: "1-3 Months Before Intake", title: "Visa & Pre-Departure", icon: Plane, tasks: [ "Apply for your UK Student Visa online.", "Attend your biometrics appointment.", "Book flights and arrange your travel.", "Attend pre-departure briefings and finalize packing." ] }
];

const pgTimeline = [
  { range: "8-12 Months Before Intake", title: "Research & Test Prep", icon: Telescope, tasks: [ "Finalize your specialization and research potential supervisors if needed.", "Prepare for and take the IELTS/TOEFL and GMAT/GRE (if required).", "Shortlist 5-7 universities based on your profile and goals.", "Update your CV/Resume and identify recommenders." ] },
  { range: "6-8 Months Before Intake", title: "Application Crafting", icon: BookOpen, tasks: [ "Take GMAT/GRE and IELTS/TOEFL proficiency tests.", "Draft a tailored Statement of Purpose (SOP) for each university.", "Request official transcripts from your undergraduate institution.", "Finalize your list of 6-8 universities.", "Provide your recommenders with all necessary information for LORs." ] },
  { range: "4-6 Months Before Intake", title: "Submit Applications", icon: FileText, tasks: [ "Submit all online applications well before the deadlines.", "Pay application fees for each university.", "Follow up with recommenders to ensure LORs are submitted on time.", "Confirm receipt of all application materials with universities.", "Prepare for potential admission interviews." ] },
  { range: "3-4 Months Before Intake", title: "Offers & Finances", icon: Landmark, tasks: [ "Evaluate admission offers and any scholarship awards.", "Accept the offer from your chosen university.", "Arrange for your proof of funds and apply for education loans if needed.", "Request your CAS letter after paying the deposit." ] },
  { range: "2-3 Months Before Intake", title: "Visa Application", icon: CalendarCheck, tasks: [ "Complete the online visa application form.", "Pay the visa fee and Immigration Health Surcharge (IHS).", "Attend your biometrics appointment at a VFS centre.", "Undergo a TB test if required for your region." ] },
  { range: "1-2 Months Before Intake", title: "Final Preparations", icon: Plane, tasks: [ "Book flights and secure accommodation.", "Attend pre-departure sessions.", "Organize foreign currency and inform your bank of travel plans.", "Pack for the British weather and your new life!" ] }
];

const workQuiz = {
    question: "How long can students with a Bachelor's or Master's degree stay and work in the UK after graduation under the Graduate Route?",
    options: ["1 Year", "2 Years", "3 Years", "No stay back"],
    correctAnswer: "2 Years",
};

interface UKPageClientProps {
  children: React.ReactNode;
}

export default function UKPageClient({ children }: UKPageClientProps) {
    const [isPostgraduate, setIsPostgraduate] = useState(false);
    const [activePhase, setActivePhase] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

    const handleAnswerSelection = (answer: string) => {
        setSelectedAnswer(answer);
    };

    const isCorrect = selectedAnswer === workQuiz.correctAnswer;
    
    const timelineData = isPostgraduate ? pgTimeline : ugTimeline;
    const activePhaseData = timelineData[activePhase];


    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqsForSchema.map(faq => ({
            "@type": "Question",
            "name": faq.questionName,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.acceptedAnswerText
            }
        }))
    };
    
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />
            {/* Hero Section */}
            <section className="bg-slate-100 dark:bg-slate-dark py-16 sm:py-24">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                        <div>
                            <p className="text-base font-semibold text-primary uppercase tracking-wide">Study Abroad</p>
                            <h1 className="font-headline text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                                Study in the UK: <span className="text-primary dark:text-white">Your Gateway to Global Excellence</span>
                            </h1>
                            <p className="mt-6 text-lg text-muted-foreground">
                                As the leading study in UK consultants in Kolkata, we guide you to world-leading universities, offering a first-class education, a vibrant multicultural experience, and a direct path to a global career with the Graduate Route visa.
                            </p>
                            <div className="mt-10">
                                <Button asChild size="lg" className="dark:bg-white dark:text-black dark:hover:bg-white/90">
                                    <Link href="/contact">
                                        <>
                                            Get Free Consultation
                                            <ArrowRight className="ml-2 h-5 w-5" />
                                        </>
                                    </Link>
                                </Button>
                            </div>
                        </div>
                        <div className="relative h-96 w-full overflow-hidden rounded-lg shadow-xl">
                            <Image
                                src="/destinations/studying-in-uk.webp"
                                alt="A view of the Tower Bridge in London, a hero image for studying in the UK."
                                fill
                                className="object-cover"
                                data-ai-hint="london tower bridge"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Study in UK Section */}
            <section className="py-16 sm:py-24 bg-background dark:bg-black">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold tracking-tight text-foreground font-headline sm:text-4xl">Why Choose the UK for Your Studies?</h2>
                        <p className="mt-4 max-w-2xl mx-auto text-lg leading-8 text-muted-foreground">
                            Discover the unique advantages that make the United Kingdom a premier destination for international students from India.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {whyStudyInUK.map((reason) => (
                            <Card key={reason.title} className="text-center p-6 border-0 shadow-lg hover:shadow-2xl transition-shadow duration-300 dark:bg-slate-900">
                                <div className={cn('mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10')}>
                                    <reason.icon className={cn('h-8 w-8', reason.color)} />
                                </div>
                                <CardTitle className="mt-6 font-headline text-xl">{reason.title}</CardTitle>
                                <CardDescription className="mt-2 text-base">{reason.description}</CardDescription>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>
            
            {/* Top Universities Section */}
            <section className="py-16 sm:py-24 bg-muted dark:bg-slate-dark">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold tracking-tight text-foreground font-headline sm:text-4xl">Top Universities in the UK for Indian Students</h2>
                        <p className="mt-4 max-w-2xl mx-auto text-lg leading-8 text-muted-foreground">
                            Explore a range of world-renowned UK universities, from prestigious Russell Group members to modern institutions excelling in specialized fields.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {topUniversities.map((uni) => (
                            <Card key={uni.name} className="overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col">
                                <div className="relative h-56 w-full">
                                    <Image src={uni.image} alt={`Campus of ${uni.name}, a top university to study in the UK for Indian students`} fill className="object-cover" data-ai-hint={uni.dataAiHint} />
                                </div>
                                <CardHeader>
                                    <h3 className="font-headline text-xl font-bold">{uni.name}</h3>
                                    <div className="flex items-center text-muted-foreground mt-2 text-sm">
                                        <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                                        <span>{uni.location}</span>
                                    </div>
                                    <div className="flex items-center text-muted-foreground mt-1 text-sm">
                                        <Star className="h-4 w-4 mr-2 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                                        <span>QS World Ranking: {uni.qsRanking}</span>
                                    </div>
                                    <div className="flex items-center text-muted-foreground mt-1 text-sm">
                                        <BarChart className="h-4 w-4 mr-2 flex-shrink-0" />
                                        <span>Webometrics World: {uni.webometricsWorldRanking}</span>
                                    </div>
                                    <div className="flex items-center text-muted-foreground mt-1 text-sm">
                                        <Book className="h-4 w-4 mr-2 flex-shrink-0" />
                                        <span>Webometrics National: {uni.webometricsNationalRanking}</span>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-grow flex flex-col">
                                    <Accordion type="single" collapsible className="w-full">
                                        {uni.programs.ug.length > 0 && (
                                            <AccordionItem value="ug-programs">
                                                <AccordionTrigger className="font-semibold text-base">Popular UG Programs</AccordionTrigger>
                                                <AccordionContent>
                                                    <ul className="space-y-3 mt-2 text-sm">
                                                        {uni.programs.ug.map(p => (
                                                            <li key={p.name} className="grid grid-cols-[1fr,auto] gap-x-2 items-center">
                                                                <span className="truncate">{p.name}</span>
                                                                <span className="font-mono text-muted-foreground">{p.fee}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </AccordionContent>
                                            </AccordionItem>
                                        )}
                                        {uni.programs.pg.length > 0 && (
                                            <AccordionItem value="pg-programs">
                                                <AccordionTrigger className="font-semibold text-base">Popular PG Programs</AccordionTrigger>
                                                <AccordionContent>
                                                    <ul className="space-y-3 mt-2 text-sm">
                                                        {uni.programs.pg.map(p => (
                                                            <li key={p.name} className="grid grid-cols-[1fr,auto] gap-x-2 items-center">
                                                                <span className="truncate">{p.name}</span>
                                                                <span className="font-mono text-muted-foreground">{p.fee}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </AccordionContent>
                                            </AccordionItem>
                                        )}
                                    </Accordion>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>
            
            {/* Admission, Cost and Courses Section */}
            <section className="py-16 sm:py-24 bg-background dark:bg-black">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-3 gap-12">
                         {/* Admission Requirements */}
                        <div className="lg:col-span-2">
                            <h2 className="text-3xl font-bold tracking-tight text-foreground font-headline sm:text-4xl mb-8">
                                Admission & Costs for Indian Students Studying in the UK
                            </h2>
                            <Accordion type="single" collapsible defaultValue="item-1" className="w-full">
                                <AccordionItem value="item-1">
                                    <AccordionTrigger className="text-xl font-headline">Undergraduate Requirements</AccordionTrigger>
                                    <AccordionContent>
                                        <ul className="space-y-3 pt-2">
                                            {admissionRequirements.undergraduate.map(req => (
                                                <li key={req} className="flex items-start">
                                                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                                                    <span>{req}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-2">
                                    <AccordionTrigger className="text-xl font-headline">Postgraduate Requirements</AccordionTrigger>
                                    <AccordionContent>
                                         <ul className="space-y-3 pt-2">
                                            {admissionRequirements.postgraduate.map(req => (
                                                <li key={req} className="flex items-start">
                                                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                                                    <span>{req}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </div>

                         {/* Study Cost */}
                        <div>
                             <Card className="bg-primary/5">
                                 <CardHeader>
                                     <CardTitle className="font-headline text-2xl flex items-center">
                                         <Banknote className="h-6 w-6 mr-2"/> Estimated Study Cost
                                     </CardTitle>
                                     <CardDescription>
                                         An overview of the annual expenses for Indian students in the UK.
                                     </CardDescription>
                                 </CardHeader>
                                 <CardContent>
                                     <ul className="space-y-3">
                                         {studyCosts.map(item => (
                                             <li key={item.item} className="flex justify-between items-center text-sm">
                                                 <span>{item.item}</span>
                                                 <span className="font-semibold text-right">{item.cost}</span>
                                             </li>
                                         ))}
                                     </ul>
                                     <p className="text-xs text-muted-foreground mt-4">*Costs are approximate and subject to change based on university, course, and lifestyle.</p>
                                 </CardContent>
                             </Card>
                        </div>
                    </div>
                </div>
            </section>

             {/* Study Abroad Timeline Section */}
             <section className="py-16 sm:py-24 bg-muted dark:bg-slate-dark">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold tracking-tight text-foreground font-headline sm:text-4xl">
                            Your UK Study Abroad Timeline
                        </h2>
                        <p className="mt-4 max-w-3xl mx-auto text-lg leading-8 text-muted-foreground">
                            Plan your journey with our step-by-step timeline. Use the toggle to switch between Undergraduate (UG) and Postgraduate (PG) application routes.
                        </p>
                    </div>

                    <div className="flex items-center justify-center space-x-4 mb-8">
                        <Label htmlFor="timeline-toggle" className={cn("font-medium", !isPostgraduate && "text-primary dark:text-white")}>Undergraduate</Label>
                        <Switch id="timeline-toggle" checked={isPostgraduate} onCheckedChange={setIsPostgraduate} className="dark:border dark:border-white" aria-label="Toggle between undergraduate and postgraduate timelines" />
                        <Label htmlFor="timeline-toggle" className={cn("font-medium", isPostgraduate && "text-primary dark:text-white")}>Postgraduate</Label>
                    </div>

                    <div className="text-center mb-10">
                        <h3 className="text-2xl font-bold tracking-tight text-foreground font-headline">Planning Phases</h3>
                    </div>

                    <div className="flex items-center justify-start sm:justify-center space-x-2 sm:space-x-4 overflow-x-auto pb-4 -mx-4 px-4 py-4">
                        {timelineData.map((phase, index) => (
                            <div key={index} className="flex items-center space-x-2 sm:space-x-4">
                                <button onClick={() => setActivePhase(index)} className={cn("flex-shrink-0 flex flex-col items-center justify-center w-28 h-28 sm:w-32 sm:h-32 rounded-full border-2 transition-all duration-300 text-center p-2", activePhase === index ? "bg-primary text-primary-foreground dark:bg-white dark:text-black border-primary dark:border-white shadow-lg scale-105" : "bg-background border-border hover:border-primary hover:bg-primary/5 dark:bg-transparent dark:border-white")}>
                                    <span className="font-bold text-sm sm:text-base">{phase.range.split(' ')[0]}</span>
                                    <span className="text-xs sm:text-sm">{phase.range.split(' ').slice(1).join(' ')}</span>
                                </button>
                                {index < timelineData.length - 1 && (<div className="hidden sm:block w-8 sm:w-12 h-px bg-border flex-shrink-0" />)}
                            </div>
                        ))}
                    </div>

                    <div className="mt-12 max-w-4xl mx-auto">
                        <Card className="shadow-lg">
                            <CardContent className="p-6 sm:p-8">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary dark:bg-white dark:text-primary">
                                        <activePhaseData.icon className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">{activePhaseData.range}</p>
                                        <h4 className="text-xl sm:text-2xl font-bold font-headline text-foreground">{activePhaseData.title}</h4>
                                    </div>
                                </div>
                                <ul className="space-y-3 list-disc pl-5">
                                    {activePhaseData.tasks.map((task, index) => (
                                        <li key={index} className="text-muted-foreground">{task}</li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

             {/* UK Student Visa Guide */}
            <section className="py-16 sm:py-24 bg-background dark:bg-black">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold tracking-tight text-foreground font-headline sm:text-4xl">UK Student Visa Guide (Student Route)</h2>
                        <p className="mt-4 max-w-2xl mx-auto text-lg leading-8 text-muted-foreground">
                            A step-by-step guide to securing your student visa for the United Kingdom.
                        </p>
                    </div>
                    <Card className="dark:bg-black dark:text-white">
                        <CardContent className="p-6 md:p-8">
                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {visaProcessSteps.map((step, index) => (
                                    <div key={index} className="flex items-start space-x-4">
                                        <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-primary text-primary-foreground dark:bg-white dark:text-primary font-bold text-lg">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold">{step.title}</h4>
                                            <p className="text-sm text-muted-foreground dark:text-white/80">{step.description}</p>
                                        </div>
                                    </div>
                                ))}
                             </div>
                        </CardContent>
                    </Card>
                </div>
            </section>
            
            {/* Work Opportunities Section */}
            <section className="py-16 sm:py-24 bg-muted dark:bg-slate-dark">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold tracking-tight text-foreground font-headline sm:text-4xl">Work Opportunities in the UK for Indian Students</h2>
                        <p className="mt-4 max-w-3xl mx-auto text-lg leading-8 text-muted-foreground">
                            The UK provides generous opportunities for students to work during their studies and launch their careers after graduation.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                        <Card className="shadow-lg flex flex-col">
                            <CardHeader>
                                <CardTitle className="font-headline text-2xl flex items-center"><Briefcase className="mr-3 h-6 w-6 text-primary"/>Graduate Route (Post-Study Work)</CardTitle>
                                <CardDescription>Stay back and work in the UK after you graduate.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 flex-grow flex flex-col">
                                <div className="p-4 bg-green-100 dark:bg-green-900/20 rounded-lg text-center">
                                    <p className="font-bold text-4xl text-green-700 dark:text-green-400">2 Years</p>
                                    <p className="text-sm text-green-600 dark:text-green-300">For Bachelor's and Master's Graduates</p>
                                </div>
                                <div className="p-4 bg-blue-100 dark:bg-blue-900/20 rounded-lg text-center">
                                    <p className="font-bold text-4xl text-blue-700 dark:text-blue-400">3 Years</p>
                                    <p className="text-sm text-blue-600 dark:text-blue-300">For PhD Graduates</p>
                                </div>
                                <div className="mt-auto pt-4">
                                    <h4 className="font-semibold text-lg mb-2">Key Benefits:</h4>
                                    <ul className="space-y-2">
                                        <li className="flex items-start"><CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-1 flex-shrink-0" /><span>Work in almost any job at any skill level without needing a sponsor.</span></li>
                                        <li className="flex items-start"><CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-1 flex-shrink-0" /><span>Provides a pathway to sponsored work routes like the Skilled Worker visa.</span></li>
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>
                        
                        <Card className="shadow-lg flex flex-col">
                            <CardHeader>
                                <CardTitle className="font-headline text-2xl flex items-center"><Clock className="mr-3 h-6 w-6 text-primary"/>Part-Time Work While Studying</CardTitle>
                                <CardDescription>Gain experience and support your studies financially.</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow flex flex-col">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div className="p-3 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg text-center">
                                        <p className="font-bold text-2xl text-indigo-700 dark:text-indigo-400">Up to 20</p>
                                        <p className="text-sm text-indigo-600 dark:text-indigo-300">Hours/week during term-time</p>
                                    </div>
                                    <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg text-center">
                                        <p className="font-bold text-2xl text-purple-700 dark:text-purple-400">Full-time</p>
                                        <p className="text-sm text-purple-600 dark:text-purple-300">During official holidays</p>
                                    </div>
                                </div>
                                <div className="text-center mb-4">
                                    <p className="text-lg">Minimum Wage: <span className="font-bold">Varies by age (check official rates)</span></p>
                                </div>
                                <p className="text-sm text-muted-foreground mt-auto">
                                    This allows you to earn while you learn and gain valuable UK work experience, enhancing your CV for future opportunities.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>
            
            {/* Quick Check Quiz Section */}
            <section className="py-16 sm:py-24 bg-background dark:bg-black">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <Card className="max-w-2xl mx-auto shadow-lg bg-primary/10 dark:bg-black border-primary/20 dark:border-primary/50">
                        <CardHeader className="text-center">
                            <CardTitle className="font-headline text-2xl text-primary dark:text-white">Quick Check: Graduate Route!</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center">
                            <p className="text-lg mb-6 dark:text-white">{workQuiz.question}</p>
                            <div className="grid grid-cols-2 gap-4">
                                {workQuiz.options.map((option) => {
                                    const isSelected = selectedAnswer === option;
                                    const isCorrectAnswer = option === workQuiz.correctAnswer;
                                    
                                    return (
                                        <Button
                                            key={option}
                                            variant="outline"
                                            className={cn(
                                                "h-auto py-4 text-lg",
                                                isSelected && isCorrectAnswer && "bg-primary text-primary-foreground hover:bg-primary/90",
                                                isSelected && !isCorrectAnswer && "bg-destructive text-destructive-foreground hover:bg-destructive/90",
                                                !isSelected && "bg-background hover:bg-primary/20 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white"
                                            )}
                                            onClick={() => handleAnswerSelection(option)}
                                        >
                                            {option}
                                        </Button>
                                    );
                                })}
                            </div>
                            {selectedAnswer && !isCorrect && (
                                <p className="mt-6 text-destructive font-semibold flex items-center justify-center">
                                    <XCircle className="mr-2 h-5 w-5" />
                                    Not quite. Try again!
                                </p>
                            )}
                            {selectedAnswer && isCorrect && (
                                <p className="mt-6 text-green-600 font-semibold flex items-center justify-center">
                                    <CheckCircle2 className="mr-2 h-5 w-5" />
                                    Correct! It's 2 years for Bachelor's and Master's graduates.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </section>
             
            {children}
            <StudyAbroadCtaSection headline="Ready for Your UK Adventure?" />
        </>
    );
}
