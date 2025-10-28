
'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, CheckCircle2, Award, BookOpen, Briefcase, Globe, HeartHandshake, Shield, Sun, Users, Star, FileText, BarChart, Book, Milestone, ListChecks, Clock, Banknote, Home, Plane, Telescope, CalendarCheck, Landmark, MapPin, XCircle, Euro } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import StudyAbroadCtaSection from "@/components/sections/StudyAbroadCtaSection";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const ugTimeline = [
    { range: "10-14 Months Before Intake", title: "Research & Exploration", icon: Telescope, tasks: [ "Research Irish universities and courses.", "Start preparing for IELTS/TOEFL.", "Check admission requirements and eligibility." ] },
    { range: "8-12 Months Before Intake", title: "Test Prep & Shortlisting", icon: BookOpen, tasks: [ "Take English proficiency tests.", "Finalize a list of universities.", "Start drafting your Statement of Purpose (SOP)." ] },
    { range: "6-10 Months Before Intake", title: "Application Submission", icon: FileText, tasks: [ "Submit online application forms.", "Pay application fees.", "Send required documents." ] },
    { range: "4-8 Months Before Intake", title: "Acceptance & Finances", icon: Landmark, tasks: [ "Receive admission offers.", "Accept your chosen offer.", "Arrange for funds and apply for education loans." ] },
    { range: "3-5 Months Before Intake", title: "Visa Process", icon: CalendarCheck, tasks: [ "Receive Confirmation of Enrolment (CoE).", "Apply for the student visa.", "Attend medical and biometrics appointments." ] },
    { range: "1-2 Months Before Intake", title: "Pre-Departure", icon: Plane, tasks: [ "Arrange for accommodation.", "Book your flight tickets.", "Attend pre-departure briefings." ] }
];

const pgTimeline = [
    { range: "8-12 Months Before Intake", title: "Research & Test Prep", icon: Telescope, tasks: [ "Finalize your specialization and research potential universities.", "Prepare for and take the IELTS/TOEFL.", "Update your CV/Resume and identify recommenders." ] },
    { range: "6-8 Months Before Intake", title: "Application Crafting", icon: BookOpen, tasks: [ "Draft a tailored Statement of Purpose (SOP) for each university.", "Request official transcripts from your undergraduate institution.", "Provide your recommenders with all necessary documents for LORs." ] },
    { range: "4-6 Months Before Intake", title: "Submit Applications", icon: FileText, tasks: [ "Submit all online applications well before the deadlines.", "Follow up with recommenders to ensure LORs are submitted on time.", "Prepare for potential admission interviews." ] },
    { range: "3-4 Months Before Intake", title: "Offers & Finances", icon: Landmark, tasks: [ "Evaluate admission offers and any scholarship awards.", "Accept the offer from your chosen university.", "Arrange proof of funds and apply for education loans.", "Pay the tuition deposit." ] },
    { range: "2-3 Months Before Intake", title: "Visa Application", icon: CalendarCheck, tasks: [ "Complete the student visa application online.", "Undergo an upfront medical exam.", "Schedule and attend your biometrics appointment.", "Wait for the visa decision." ] },
    { range: "1-2 Months Before Intake", title: "Final Preparations", icon: Plane, tasks: [ "Book flights and secure accommodation.", "Attend pre-departure sessions.", "Organize foreign currency and inform your bank of travel plans." ] }
];

const whyStudyInIreland = [
    {
        icon: <Award className="w-8 h-8 text-blue-500" />,
        title: "High-Quality Education",
        description: "Irish universities are in the top 5% globally, offering world-class research opportunities and academic excellence.",
    },
    {
        icon: <Globe className="w-8 h-8 text-green-500" />,
        title: "English-Speaking Country",
        description: "Study and live in an English-speaking environment, making it easy for Indian students to adapt and communicate.",
    },
    {
        icon: <Briefcase className="w-8 h-8 text-orange-500" />,
        title: "Post-Graduation Work Opportunities",
        description: "Benefit from generous post-study work visa options (up to 2 years) to launch your international career.",
    },
    {
        icon: <Sun className="w-8 h-8 text-yellow-500" />,
        title: "Vibrant Student Life",
        description: "Experience a rich cultural heritage, friendly communities, and a dynamic social life in a welcoming country.",
    },
    {
        icon: <Shield className="w-8 h-8 text-red-500" />,
        title: "Safety and High Quality of Life",
        description: "Ireland is one of the safest and most peaceful countries in the world, with a high standard of living.",
    },
    {
        icon: <Banknote className="w-8 h-8 text-indigo-500" />,
        title: "Affordable Tuition Fees",
        description: "Education in Ireland is more affordable compared to other major English-speaking destinations like the UK or USA.",
    },
    {
        icon: <HeartHandshake className="w-8 h-8 text-purple-500" />,
        title: "Strong Industry Connections",
        description: "Ireland is a European hub for top global companies in tech, pharma, and finance, offering excellent internship opportunities.",
    },
    {
        icon: <BookOpen className="w-8 h-8 text-teal-500" />,
        title: "Supportive Student Services",
        description: "Universities provide dedicated international student support for accommodation, careers, and well-being.",
    },
];

const topUniversities = [
    {
        name: "Trinity College Dublin (TCD)",
        location: "Dublin",
        qsRanking: "81",
        webometricsWorld: "145",
        webometricsNational: "1",
        image: "/college/college-1.webp",
        dataAiHint: "university students graduation",
        programs: {
            ug: [
                { name: "Computer Science", details: "4 Years | €28,000" },
                { name: "Business, Economic and Social Studies (BESS)", details: "4 Years | €22,000" },
                { name: "Engineering", details: "4 Years | €28,000" }
            ],
            pg: [
                { name: "MSc in Computer Science (Data Science)", details: "1 Year | €26,500" },
                { name: "MSc in Finance", details: "1 Year | €25,000" },
                { name: "LL.M. (Master of Laws)", details: "1 Year | €21,000" }
            ]
        }
    },
    {
        name: "University College Dublin (UCD)",
        location: "Dublin",
        qsRanking: "171",
        webometricsWorld: "201",
        webometricsNational: "2",
        image: "/college/college-2.webp",
        dataAiHint: "university campus fall",
        programs: {
            ug: [
                { name: "Science (CAO DN200)", details: "4 Years | €27,720" },
                { name: "Commerce (BComm)", details: "3 Years | €22,600" },
                { name: "Engineering (CAO DN150)", details: "4 Years | €27,720" }
            ],
            pg: [
                { name: "MSc in Business Analytics", details: "1 Year | €23,000" },
                { name: "MSc in Computer Science (Conversion)", details: "1.5 Years | €16,000" },
                { name: "Master of Engineering (ME)", details: "2 Years | €29,100" }
            ]
        }
    },
    {
        name: "University of Galway",
        location: "Galway",
        qsRanking: "289",
        webometricsWorld: "577",
        webometricsNational: "4",
        image: "/college/college-3.webp",
        dataAiHint: "historic university building",
        programs: {
            ug: [
                { name: "Undenominated Engineering", details: "4 Years | €27,250" },
                { name: "Commerce (BComm)", details: "3 Years | €20,140" },
                { name: "Computer Science & Information Technology", details: "4 Years | €27,250" }
            ],
            pg: [
                { name: "MSc in Business Analytics", details: "1 Year | €20,500" },
                { name: "MSc in Software Design & Development", details: "1 Year | €27,250" },
            ]
        }
    },
    { 
        name: "University College Cork (UCC)", 
        location: "Cork", 
        qsRanking: "292", 
        webometricsWorld: "317", 
        webometricsNational: "3", 
        image: "/college/college-4.webp", 
        dataAiHint: "modern campus library",
        programs: {
            ug: [
                { name: "Biological and Chemical Sciences", details: "4 Years | €25,000" },
                { name: "Commerce", details: "3 Years | €20,000" },
            ],
            pg: [
                { name: "MSc Data Science & Analytics", details: "1 Year | €21,000" },
                { name: "MSc Management Information & Managerial Accounting", details: "1 Year | €19,000" },
            ]
        }
    },
    { 
        name: "University of Limerick (UL)", 
        location: "Limerick", 
        qsRanking: "426", 
        webometricsWorld: "531", 
        webometricsNational: "5", 
        image: "/college/college-5.webp", 
        dataAiHint: "university building modern",
        programs: {
            ug: [
                { name: "BEng in Aeronautical Engineering", details: "4 Years | €20,000" },
                { name: "BSc in Computer Systems", details: "4 Years | €15,000" },
            ],
            pg: [
                { name: "MSc in Artificial Intelligence and Machine Learning", details: "1 Year | €18,000" },
                { name: "Master of Business Administration (MBA)", details: "1 Year | €25,000" },
            ]
        }
    },
    { 
        name: "Dublin City University (DCU)", 
        location: "Dublin", 
        qsRanking: "436", 
        webometricsWorld: "546", 
        webometricsNational: "6", 
        image: "/college/college-6.webp", 
        dataAiHint: "engineering students team",
        programs: {
            ug: [
                { name: "BSc in Data Science", details: "4 Years | €16,000" },
                { name: "BEng in Mechatronic Engineering", details: "4 Years | €16,000" },
            ],
            pg: [
                { name: "MSc in Computing (Data Analytics)", details: "1 Year | €18,000" },
                { name: "MSc in Management (Business)", details: "1 Year | €17,000" },
            ]
        }
    },
    { 
        name: "Maynooth University", 
        location: "Maynooth", 
        qsRanking: "801-850", 
        webometricsWorld: "796", 
        webometricsNational: "7", 
        image: "/college/college-7.webp", 
        dataAiHint: "university students on lawn",
        programs: {
            ug: [
                { name: "BSc in Computer Science & Software Engineering", details: "4 Years | €15,000" },
                { name: "Bachelor of Business Administration", details: "3 Years | €14,000" },
            ],
            pg: [
                { name: "MSc in Data Science and Analytics", details: "1 Year | €16,000" },
                { name: "MSc in IT-Enabled Innovation", details: "1 Year | €15,000" },
            ]
        }
    },
    { 
        name: "Technological University Dublin (TU Dublin)", 
        location: "Dublin", 
        qsRanking: "851-900", 
        webometricsWorld: "1036", 
        webometricsNational: "8", 
        image: "/college/college-8.webp", 
        dataAiHint: "diverse team meeting",
        programs: {
            ug: [
                { name: "BSc (Hons) in Computer Science", details: "4 Years | €14,500" },
                { name: "BEng (Hons) in Engineering", details: "4 Years | €14,500" },
            ],
            pg: [
                { name: "MSc in Computing (Applied AI)", details: "1 Year | €15,000" },
                { name: "MSc in Technology and Innovation Management", details: "1 Year | €14,500" },
            ]
        }
    },
    { 
        name: "South East Technological University (SETU)", 
        location: "Waterford/Carlow", 
        qsRanking: "N/A", 
        webometricsWorld: "2496", 
        webometricsNational: "10", 
        image: "/college/college-9.webp", 
        dataAiHint: "students outdoors",
        programs: {
            ug: [
                { name: "BSc (Hons) in Software Systems Development", details: "4 Years | €12,500" },
                { name: "BB (Hons) in Business", details: "3 Years | €11,500" },
            ],
            pg: [
                { name: "MSc in Information Systems Processes", details: "1 Year | €13,000" },
                { name: "Master of Business", details: "1 Year | €12,500" },
            ]
        }
    },
    { 
        name: "National College of Ireland (NCI)", 
        location: "Dublin", 
        qsRanking: "N/A", 
        webometricsWorld: "4535", 
        webometricsNational: "16", 
        image: "/college/college-10.webp", 
        dataAiHint: "students working together",
        programs: {
            ug: [
                { name: "BSc (Hons) in Computing", details: "4 Years | €12,000" },
                { name: "BA (Hons) in Business", details: "3 Years | €12,000" },
            ],
            pg: [
                { name: "MSc in Cybersecurity", details: "1 Year | €15,000" },
                { name: "MSc in Data Analytics", details: "1 Year | €15,000" },
            ]
        }
    },
    { 
        name: "Griffith College", 
        location: "Dublin/Cork/Limerick", 
        qsRanking: "N/A", 
        webometricsWorld: "3389", 
        webometricsNational: "13", 
        image: "/college/college-12.webp", 
        dataAiHint: "teamwork collaboration",
        programs: {
            ug: [
                { name: "BA (Hons) in Business", details: "3 Years | €12,000" },
                { name: "BSc (Hons) in Computing", details: "3 Years | €12,000" },
            ],
            pg: [
                { name: "MSc in Big Data Management and Analytics", details: "1 Year | €14,000" },
                { name: "MSc in International Business Management", details: "1 Year | €14,000" },
            ]
        }
    },
    { 
        name: "Dublin Business School (DBS)", 
        location: "Dublin", 
        qsRanking: "N/A", 
        webometricsWorld: "3925", 
        webometricsNational: "15", 
        image: "/college/college-13.webp", 
        dataAiHint: "team meeting discussion",
        programs: {
            ug: [
                { name: "BA (Hons) in Business", details: "3 Years | €9,850" },
                { name: "BSc (Hons) in Computing", details: "3 Years | €9,850" },
            ],
            pg: [
                { name: "MBA", details: "1 Year | €12,950" },
                { name: "MSc in Information Systems with Computing", details: "1 Year | €12,950" },
            ]
        }
    },
];

const admissionRequirements = {
    undergraduate: [
        "Higher Secondary School Certificate (HSC) with a minimum of 60-70%.",
        "Proof of English proficiency: IELTS (6.0-6.5) or TOEFL (80-90 iBT).",
        "Statement of Purpose (SOP) and Letters of Recommendation (LORs).",
        "Some courses may require specific subject scores or a portfolio.",
    ],
    postgraduate: [
        "A Bachelor's degree (usually 3 or 4 years) from a recognized institution.",
        "Proof of English proficiency: IELTS (6.5-7.0) or TOEFL (90-100 iBT).",
        "A strong Statement of Purpose (SOP) and academic/professional LORs.",
        "Some programs, especially MBAs, may require GMAT scores and relevant work experience.",
    ]
};

const studyCosts = [
    { item: "Undergraduate Tuition Fee", cost: "€12,000 - €25,000 per year" },
    { item: "Postgraduate Tuition Fee", cost: "€12,000 - €30,000 per year" },
    { item: "Accommodation", cost: "€7,000 - €12,000 per year" },
    { item: "Living Expenses (Food, Transport, etc.)", cost: "€5,000 - €7,000 per year" },
    { item: "Health Insurance", cost: "€400 - €600 per year" },
];

const requiredVisaDocs = [
    "Current Passport (valid for 12 months post-arrival in Ireland)",
    "2 recent passport-sized photographs (less than 6 months old)",
    "Original Letter of Acceptance from the Irish institution",
    "Proof of Fee Payment to the institution",
    "Evidence of Funds (€10,000 for living expenses)",
    "Evidence of strong academic ability and qualifications",
    "English Language Proficiency Proof (IELTS/TOEFL)",
    "Private Medical Insurance details",
    "A clear explanation for any gaps in your educational history",
    "A strong Application Letter or Statement of Purpose",
    "Details of any previous visa refusals, if applicable",
    "A comprehensive Summary of Finances Form",
    "Biometric Information (if required by your region)",
    "Special documents for unaccompanied applicants under 18",
];

const visaProcessSteps = [
    { title: "Choose Course & University", description: "Receive your offer letter from an Irish Higher Education Institution." },
    { title: "Apply for Admission", description: "Accept the offer and prepare the necessary documents for your visa." },
    { title: "Pay Tuition Fees", description: "Pay a minimum of €6,000 for your first year's tuition fees to the institution." },
    { title: "Prepare Documents", description: "Gather all required documents as per the checklist for the D Study Visa." },
    { title: "Apply for Visa Online (AVATS)", description: "Complete the online application form accurately on the AVATS portal." },
    { title: "Visit Visa Application Center", description: "Submit your documents and provide biometrics at the designated center." },
    { title: "Wait for Visa Decision", description: "The decision process typically takes around 8 weeks." },
];

const studentLife = [
    {
        icon: <Home className="w-8 h-8 text-blue-500" />,
        title: "Accommodation",
        description: "Modern, secure, and fully-equipped student housing is available close to the campus, offering a comfortable and convenient living experience."
    },
    {
        icon: <HeartHandshake className="w-8 h-8 text-green-500" />,
        title: "Student Support Services",
        description: "A dedicated team provides comprehensive support, including academic advising, wellness programs, and assistance for students with disabilities."
    },
    {
        icon: <Users className="w-8 h-8 text-orange-500" />,
        title: "Campus Life & Culture",
        description: "Experience a vibrant campus atmosphere with various clubs, events, and societies. Engage in networking opportunities and immerse yourself in rich Irish culture."
    },
    {
        icon: <Briefcase className="w-8 h-8 text-purple-500" />,
        title: "Career Services",
        description: "Benefit from a dedicated career services team offering resume workshops, interview coaching, and strong connections with industry partners for internships and job placements."
    }
];

const workQuiz = {
    question: "What is the maximum number of hours per week international students can work during academic semesters?",
    options: ["10 hours", "20 hours", "30 hours", "40 hours"],
    correctAnswer: "20 hours",
};

const faqsForSchema = [
    {
        questionName: "Why is Ireland a good study destination for Indian students?",
        acceptedAnswerText: "Ireland is an excellent choice for its world-class universities, English-speaking environment, safe communities, and generous post-study work opportunities for graduates."
    },
    {
        questionName: "What are the requirements to study in Ireland for Indian students?",
        acceptedAnswerText: "Typically, for undergraduate courses, you need a Higher Secondary Certificate with 60-70%. For postgraduate courses, a relevant bachelor's degree is required. You also need to prove English proficiency via IELTS (typically 6.0-6.5 for UG, 6.5-7.0 for PG) or an equivalent test."
    },
    {
        questionName: "What is the cost of studying in Ireland?",
        acceptedAnswerText: "Tuition fees for international students generally range from €12,000 to €25,000 per year for most courses. Living costs are estimated to be around €12,000 per year."
    },
    {
        questionName: "Can I work in Ireland after my studies?",
        acceptedAnswerText: "Yes, Ireland offers a Post-Study Work Permit that allows eligible graduates to stay and work in Ireland for up to 2 years after completing their studies."
    }
];

function TopUniversities() {
  return (
    <section className="py-16 sm:py-24 bg-muted dark:bg-slate-dark">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-foreground font-headline sm:text-4xl">Top Universities &amp; Colleges in Ireland</h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg leading-8 text-muted-foreground">
            Home to some of the world&apos;s best universities, offering a wide range of courses for Indian students.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {topUniversities.map((uni) => (
            <Card key={uni.name} className="overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col">
              <div className="relative h-56 w-full">
                <Image src={uni.image} alt={`Campus of ${uni.name}, a top university to study in Ireland for Indian students`} fill className="object-cover" data-ai-hint={uni.dataAiHint} />
              </div>
              <CardHeader>
                <h3 className="font-headline text-xl font-bold">{uni.name}</h3>
                <div className="flex items-center text-muted-foreground mt-2 text-sm">
                  <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span>{uni.location}</span>
                </div>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col">
                <div className="text-sm text-muted-foreground space-y-1">
                  <div className="flex items-center"><Star className="h-4 w-4 mr-2 text-yellow-500 fill-yellow-500 flex-shrink-0" /><span>QS World Ranking: {uni.qsRanking}</span></div>
                  <div className="flex items-center"><BarChart className="h-4 w-4 mr-2 flex-shrink-0" /><span>Webometrics World: {uni.webometricsWorld}</span></div>
                  <div className="flex items-center"><Book className="h-4 w-4 mr-2 flex-shrink-0" /><span>Webometrics National: {uni.webometricsNational}</span></div>
                </div>
                <div className="mt-4 flex-grow">
                  <Accordion type="single" collapsible className="w-full">
                    {uni.programs?.ug && uni.programs.ug.length > 0 && (
                        <AccordionItem value="ug-programs">
                            <AccordionTrigger className="font-semibold text-base py-2">Popular UG Programs</AccordionTrigger>
                            <AccordionContent>
                                <ul className="space-y-3 mt-2 text-sm">
                                    {uni.programs.ug.map(p => (
                                        <li key={p.name} className="grid grid-cols-[1fr,auto] gap-x-2 items-center">
                                            <span className="truncate">{p.name}</span>
                                            <span className="font-mono text-muted-foreground">{p.details}</span>
                                        </li>
                                    ))}
                                </ul>
                            </AccordionContent>
                        </AccordionItem>
                    )}
                    {uni.programs?.pg && uni.programs.pg.length > 0 && (
                         <AccordionItem value="pg-programs">
                            <AccordionTrigger className="font-semibold text-base py-2">Popular PG Programs</AccordionTrigger>
                            <AccordionContent>
                                <ul className="space-y-3 mt-2 text-sm">
                                    {uni.programs.pg.map(p => (
                                        <li key={p.name} className="grid grid-cols-[1fr,auto] gap-x-2 items-center">
                                            <span className="truncate">{p.name}</span>
                                            <span className="font-mono text-muted-foreground">{p.details}</span>
                                        </li>
                                    ))}
                                </ul>
                            </AccordionContent>
                        </AccordionItem>
                    )}
                  </Accordion>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

interface IrelandPageClientProps {
    children: React.ReactNode;
}

export default function IrelandPageClient({ children }: IrelandPageClientProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isPostgraduate, setIsPostgraduate] = useState(false);
  const [activePhase, setActivePhase] = useState(0);

  const timelineData = isPostgraduate ? pgTimeline : ugTimeline;
  const activePhaseData = timelineData[activePhase];


  const handleAnswerSelection = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const isCorrect = selectedAnswer === workQuiz.correctAnswer;
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
    <div>
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
       <section className="bg-slate-100 dark:bg-slate-dark py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <p className="text-base font-semibold text-primary uppercase tracking-wide">Study Abroad</p>
              <h1 className="font-headline text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                Study in Ireland: <span className="text-primary dark:text-white">Your Path to a Global Career</span>
              </h1>
              <p className="mt-6 text-lg text-muted-foreground">
                Discover world-class education, vibrant culture, and unparalleled career opportunities in the heart of Europe. As the top education consultant in Kolkata, we ensure your journey to Ireland is smooth and successful.
              </p>
              <div className="mt-10">
                  <Button asChild size="lg" className="dark:bg-slate-dark dark:text-white dark:border dark:border-white">
                      <Link href="/contact">
                          Get Free Consultation
                          <ArrowRight className="ml-2 h-5 w-5" />
                      </Link>
                  </Button>
              </div>
            </div>
             <div className="relative h-96 w-full overflow-hidden rounded-lg shadow-xl">
              <Image
                src="/destinations/studying-in-ireland.webp"
                alt="A scenic view of cliffs in Ireland, representing the beauty of studying in Ireland."
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                data-ai-hint="ireland cliffs"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 bg-background dark:bg-black">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold tracking-tight text-foreground font-headline sm:text-4xl">Why Study in Ireland?</h2>
                <p className="mt-4 max-w-2xl mx-auto text-lg leading-8 text-muted-foreground">
                    Explore the benefits that make Ireland a top choice for international students looking for quality education and career growth.
                </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {whyStudyInIreland.map((reason) => (
                    <Card key={reason.title} className="text-center p-6 border-0 shadow-lg hover:shadow-2xl transition-shadow duration-300 dark:bg-slate-900">
                        <div className='mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10'>
                            {reason.icon}
                        </div>
                        <CardTitle className="mt-6 font-headline text-xl">{reason.title}</CardTitle>
                        <CardDescription className="mt-2 text-base">{reason.description}</CardDescription>
                    </Card>
                ))}
            </div>
        </div>
    </section>

    <TopUniversities />

    <section className="py-16 sm:py-24 bg-background dark:bg-black">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2">
                    <h2 className="text-3xl font-bold tracking-tight text-foreground font-headline sm:text-4xl mb-8">Admission &amp; Costs for Studying in Ireland</h2>
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
                <div>
                     <Card className="bg-primary/5">
                         <CardHeader>
                             <CardTitle className="font-headline text-2xl flex items-center">€ Estimated Study Cost</CardTitle>
                             <CardDescription>
                                 An overview of the annual expenses for Indian students planning to study in Ireland.
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
                             <p className="text-xs text-muted-foreground mt-4">*Costs are approximate and may vary based on university, course, and lifestyle.</p>
                         </CardContent>
                     </Card>
                </div>
            </div>
        </div>
    </section>

     <section className="py-16 sm:py-24 bg-muted dark:bg-slate-dark">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold tracking-tight text-foreground font-headline sm:text-4xl">
                    Your Ireland Study Abroad Timeline
                </h2>
                <p className="mt-4 max-w-3xl mx-auto text-lg leading-8 text-muted-foreground">
                    Plan your journey with our step-by-step timeline. Use the toggle to switch between Undergraduate (UG) and Postgraduate (PG) application routes.
                </p>
            </div>

            <div className="flex items-center justify-center space-x-4 mb-8">
                <Label htmlFor="timeline-toggle" className={cn("font-medium", !isPostgraduate && "text-primary dark:text-white")}>Undergraduate</Label>
                <Switch id="timeline-toggle" checked={isPostgraduate} onCheckedChange={setIsPostgraduate} className="dark:border-input" aria-label="Toggle between undergraduate and postgraduate timelines" />
                <Label htmlFor="timeline-toggle" className={cn("font-medium", isPostgraduate && "text-primary dark:text-white")}>Postgraduate</Label>
            </div>

            <div className="text-center mb-10">
                <h3 className="text-2xl font-bold tracking-tight text-foreground font-headline">Planning Phases</h3>
            </div>

            <div className="flex items-center justify-start sm:justify-center space-x-2 sm:space-x-4 overflow-x-auto pb-4 -mx-4 px-4 py-4">
                {timelineData.map((phase, index) => (
                    <div key={index} className="flex items-center space-x-2 sm:space-x-4">
                        <button
                            onClick={() => setActivePhase(index)}
                            className={cn(
                                "flex-shrink-0 flex flex-col items-center justify-center w-28 h-28 sm:w-32 sm:h-32 rounded-full border-2 transition-all duration-300 text-center p-2",
                                activePhase === index
                                ? "bg-primary text-primary-foreground dark:bg-white dark:text-black shadow-lg scale-105"
                                : "bg-background border-border hover:border-primary hover:bg-primary/5 dark:bg-transparent dark:border-white"
                            )}
                            >
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
                                <h4 className="text-xl sm:text-2xl font-bold font-headline text-foreground">
                                    {activePhaseData.title}
                                </h4>
                            </div>
                        </div>
                        <ul className="space-y-3 list-disc pl-5">
                            {timelineData[activePhase].tasks.map((task, index) => (
                                <li key={index} className="text-muted-foreground">{task}</li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    </section>

    <section className="py-16 sm:py-24 bg-background dark:bg-black">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold tracking-tight text-foreground font-headline sm:text-4xl">Irish Student Visa Guide for Indian Students</h2>
                <p className="mt-4 max-w-2xl mx-auto text-lg leading-8 text-muted-foreground">
                    A clear and structured guide to navigating the Irish student visa application process.
                </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                <div>
                    <h3 className="font-headline text-2xl font-bold mb-6 flex items-center"><ListChecks className="mr-3 h-6 w-6 text-primary"/>Required Documents (D Study Visa)</h3>
                    <Card className="bg-background">
                        <CardContent className="p-6">
                            <ul className="space-y-3">
                                {requiredVisaDocs.map((doc, index) => (
                                    <li key={index} className="flex items-start">
                                        <CheckCircle2 className="h-5 w-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                                        <span>{doc}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </div>
                <div>
                    <h3 className="font-headline text-2xl font-bold mb-6 flex items-center"><Milestone className="mr-3 h-6 w-6 text-primary"/>Visa Application Process</h3>
                    <div className="relative">
                        {visaProcessSteps.map((step, index) => (
                            <div key={index} className="pl-8 relative pb-8 border-l border-border">
                                <div className="absolute -left-4 top-0 flex items-center justify-center w-8 h-8 bg-background border-2 border-primary rounded-full">
                                    <span className="font-bold text-primary">{index + 1}</span>
                                </div>
                                <h4 className="font-semibold">{step.title}</h4>
                                <p className="text-sm text-muted-foreground">{step.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
             <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="bg-background">
                    <CardHeader className="flex flex-row items-center gap-4">
                        <Euro className="h-8 w-8 text-primary" />
                        <CardTitle className="font-headline text-xl">Visa Application Fee</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">The standard application fee for an Irish Study Visa is **€60**. Additional charges may apply for VFS services. It&apos;s crucial to check the official Irish Immigration and VFS Global websites for the most current fees before applying.</p>
                    </CardContent>
                </Card>
                <Card className="bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-500/30">
                    <CardHeader className="flex flex-row items-center gap-4">
                        <Plane className="h-8 w-8 text-red-600" />
                        <CardTitle className="font-headline text-xl text-red-800 dark:text-red-300">Ireland &amp; the Schengen Area</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-red-700 dark:text-red-200">It&apos;s important to know that **Ireland is NOT part of the Schengen Area**. Your Irish student visa does not permit travel to Schengen countries like Germany, France, or Italy. You will need to apply for a separate Schengen visa for tourism or short visits to these countries.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    </section>

    <section className="py-16 sm:py-24 bg-muted dark:bg-slate-dark">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
                <h2 className="text-3xl font-bold tracking-tight text-foreground font-headline sm:text-4xl">Work Opportunities in Ireland</h2>
                <p className="mt-4 max-w-3xl mx-auto text-lg leading-8 text-muted-foreground">
                    Ireland offers excellent opportunities for students to gain work experience both during and after their studies, a key reason many Indian students choose to study here.
                </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                <Card className="shadow-lg flex flex-col">
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl flex items-center"><Briefcase className="mr-3 h-6 w-6 text-primary"/>Post-Study Work Visa (PSW)</CardTitle>
                        <CardDescription>Stay back and work in Ireland after you graduate.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 flex-grow flex flex-col">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <h4 className="font-semibold mb-1">Level 8 Graduates (Bachelors with Honours)</h4>
                            <p className="flex items-center text-blue-800 dark:text-blue-200"><CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />1-year Post-Study Work visa.</p>
                        </div>
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <h4 className="font-semibold mb-1">Level 9+ Graduates (Masters/PhD)</h4>
                            <p className="flex items-center text-blue-800 dark:text-blue-200"><CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />2-year Post-Study Work visa (extendable).</p>
                        </div>
                        <div className="mt-auto pt-4">
                            <h4 className="font-semibold text-lg mb-2">Key Benefits:</h4>
                            <ul className="space-y-2">
                                <li className="flex items-start"><CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-1 flex-shrink-0" /><span>Total stay for Level 9 graduates can be up to 8 years (study + post-study).</span></li>
                                <li className="flex items-start"><CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-1 flex-shrink-0" /><span>PSW eligibility is not tied to your initial IELTS score.</span></li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>
                <Card className="shadow-lg flex flex-col">
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl flex items-center"><Clock className="mr-3 h-6 w-6 text-primary"/>Part-Time Work While Studying</CardTitle>
                        <CardDescription>Earn while you learn and gain valuable experience.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow flex flex-col">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg text-center">
                                <p className="font-bold text-4xl text-indigo-700 dark:text-indigo-300">20</p>
                                <p className="text-sm text-indigo-600 dark:text-indigo-200">Hours/week during semester</p>
                            </div>
                            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg text-center">
                                <p className="font-bold text-4xl text-purple-700 dark:text-purple-400">40</p>
                                <p className="text-sm text-purple-600 dark:text-purple-300">Hours/week during holidays</p>
                            </div>
                        </div>
                        <p className="text-center text-muted-foreground mb-4">Minimum Pay: <span className="font-bold text-foreground">€9.15 - €10 per hour</span></p>
                         <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="eligibility">
                                <AccordionTrigger>Eligibility Criteria</AccordionTrigger>
                                <AccordionContent>
                                    <ul className="space-y-2 text-muted-foreground">
                                        <li className="flex items-start"><CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 shrink-0" /><span>Enrolled in a full-time course of at least one year&apos;s duration.</span></li>
                                        <li className="flex items-start"><CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 shrink-0" /><span>Course must be at NFQ Level 7 or above.</span></li>
                                        <li className="flex items-start"><CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 shrink-0" /><span>Received Stamp 2 permission on your passport.</span></li>
                                        <li className="flex items-start"><CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 shrink-0" /><span>Registered with the Garda National Immigration Bureau (GNIB).</span></li>
                                        <li className="flex items-start"><CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 shrink-0" /><span>Obtained a Personal Public Service Number (PPSN).</span></li>
                                        <li className="flex items-start"><CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 shrink-0" /><span>Meet tax requirements (USC, PRSI).</span></li>
                                    </ul>
                                </AccordionContent>
                            </AccordionItem>
                             <AccordionItem value="jobs">
                                <AccordionTrigger>Common Job Opportunities</AccordionTrigger>
                                <AccordionContent>
                                    <div className="space-y-2 text-muted-foreground">
                                        <p><span className="font-semibold">On-Campus:</span> Research/Teacher Assistant, Barista, Admin, Library Attendant, Tour Guide, Tutor</p>
                                        <p><span className="font-semibold">Off-Campus:</span> Call Centers, Cleaning, Tutoring, Waiter, Secretary, Store Assistant, Community Support Worker, Parking Agent, Househelp</p>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </CardContent>
                </Card>
            </div>
        </div>
    </section>

    <section className="py-16 sm:py-24 bg-background dark:bg-black">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
                <h2 className="text-3xl font-bold tracking-tight text-foreground font-headline sm:text-4xl">Student Life &amp; Resources in Ireland</h2>
                <p className="mt-4 max-w-2xl mx-auto text-lg leading-8 text-muted-foreground">
                    Experience a supportive and enriching environment that fosters both academic and personal growth.
                </p>
            </div>
            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                {studentLife.map((item) => (
                    <Card key={item.title} className="text-center p-6 dark:bg-slate-dark">
                        <div className="flex justify-center">{item.icon}</div>
                        <CardTitle className="mt-4 font-headline text-xl">{item.title}</CardTitle>
                        <CardDescription className="mt-2 text-base">{item.description}</CardDescription>
                    </Card>
                ))}
            </div>
        </div>
    </section>

    <section className="py-16 sm:py-24 bg-muted dark:bg-slate-dark">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="max-w-2xl mx-auto shadow-lg bg-primary/10 dark:bg-black border-primary/20 dark:border-primary/50">
                <CardHeader className="text-center">
                    <CardTitle className="font-headline text-2xl text-primary dark:text-white">Quick Check: Visa & Work!</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                    <p className="text-lg mb-6">{workQuiz.question}</p>
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
                            Not quite. The correct answer is 20 hours.
                        </p>
                    )}
                    {selectedAnswer && isCorrect && (
                        <p className="mt-6 text-green-600 font-semibold flex items-center justify-center">
                            <CheckCircle2 className="mr-2 h-5 w-5" />
                            Correct! It&apos;s 20 hours per week during term time.
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    </section>

      {children}
      <StudyAbroadCtaSection headline="Ready to Start Your Irish Journey?" />
    </div>
  );
}
