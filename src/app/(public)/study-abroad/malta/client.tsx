
'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, CheckCircle2, Award, BookOpen, Briefcase, Globe, HeartHandshake, Shield, Users, Star, BarChart, Book, Milestone, ListChecks, Clock, Banknote, Home, Plane, Telescope, CalendarCheck, Landmark, MapPin, XCircle, Euro, Palmtree } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import StudyAbroadCtaSection from "@/components/sections/StudyAbroadCtaSection";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from '@/lib/utils';
import { QuickAnswer } from '@/components/quick-answer';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const ugTimeline = [
    { range: "12-15 Months Before Intake", title: "Research & Exploration", icon: Telescope, tasks: [
        "Explore Malta as a destination alongside options like the UK, Ireland, Germany and New Zealand.",
        "Understand MQF Level 6 Bachelor options that match your stream (Science, Commerce, Arts).",
        "Discuss budget and preferred intakes (September / February) with your family and counsellor.",
        "Start preparing for IELTS/PTE/TOEFL if needed.",
    ] },
    { range: "9-12 Months Before Intake", title: "Applications & Tests", icon: BookOpen, tasks: [
        "Shortlist 4–6 suitable Bachelor programmes across 2–3 Maltese institutions.",
        "Register for and complete your English proficiency test.",
        "Prepare your SOP and collect any required references from school.",
        "Submit applications well before deadlines and track offer updates.",
    ] },
    { range: "6-8 Months Before Intake", title: "Offers, Fees & Visa Preparation", icon: Landmark, tasks: [
        "Review offers with your counsellor and choose the best-fit option based on academics, budget and career plans.",
        "Pay the necessary tuition fee deposit to secure your place.",
        "Organise academic and financial documents (bank statements, sponsor proofs, loan sanctions, FDs).",
        "Start putting together your Malta National D visa file.",
    ] },
    { range: "3-5 Months Before Intake", title: "Visa Application & Practical Planning", icon: CalendarCheck, tasks: [
        "Book your visa appointment and submit a well-structured visa application with all supporting documents.",
        "Research and shortlist accommodation options (shared apartments, student housing).",
        "Plan for health insurance, flight bookings and initial living expenses.",
        "Stay alert to any communication from the visa office and respond promptly.",
    ] },
    { range: "1-2 Months Before Intake", title: "Pre-Departure & Arrival", icon: Plane, tasks: [
        "Confirm accommodation and book flights once your visa is approved.",
        "Attend pre-departure sessions with Whiteboard Consultants for practical guidance.",
        "Arrange forex, international cards and emergency funds.",
        "Connect with future classmates and student groups to ease your arrival in Malta.",
    ] },
];

const pgTimeline = [
    { range: "12-15 Months Before Intake", title: "Profile Review & Destination Fit", icon: Telescope, tasks: [
        "Assess your Bachelor percentage, backlog history and work experience (if any).",
        "Decide whether Malta fits your goals versus other destinations for your specialisation.",
        "Identify MQF Level 7 Master / PG Diploma options aligned with Malta's job market (business, IT, hospitality, finance, engineering).",
        "Plan IELTS/PTE/TOEFL timing, especially if targeting higher score bands.",
    ] },
    { range: "9-12 Months Before Intake", title: "Shortlisting & Applications", icon: BookOpen, tasks: [
        "Finalise 3–5 target courses across 2–3 institutions in Malta.",
        "Prepare a strong SOP linking your past education/experience to your chosen course and Malta.",
        "Collect Letters of Recommendation and update your CV with projects and work experience.",
        "Submit applications early to avoid last-minute processing rush.",
    ] },
    { range: "6-8 Months Before Intake", title: "Offer Decisions, Fees & Finance", icon: Landmark, tasks: [
        "Compare offers based on tuition, course content, internship opportunities and long-term career fit.",
        "Pay your tuition deposit as per offer conditions.",
        "Finalise your funding plan: savings, sanctioned education loan and acceptable fixed deposits.",
        "Compile your financial and academic documents for the visa file.",
    ] },
    { range: "3-5 Months Before Intake", title: "Visa Application & Logistics", icon: CalendarCheck, tasks: [
        "Book your Malta National D visa appointment and submit the application with complete documents.",
        "Shortlist and contact accommodation providers close to your institution or in student-friendly areas.",
        "Plan for health insurance, travel bookings and arrival dates.",
        "Keep track of visa status and respond quickly to any additional queries.",
    ] },
    { range: "1-2 Months Before Intake", title: "Final Preparation & Networking", icon: Plane, tasks: [
        "Confirm your accommodation and book flights after visa approval.",
        "Attend pre-departure guidance sessions focused on academics, networking and part-time work strategy.",
        "Arrange finances for the first 3–4 months and understand local banking options.",
        "Connect with alumni, seniors or LinkedIn contacts studying or working in Malta.",
    ] },
];

const whyStudyInMalta = [
    {
        icon: <Award className="w-8 h-8 text-blue-500" />,
        title: "EU-recognised degrees",
        description: "Study programmes aligned with the Malta Qualifications Framework (MQF) and European Qualifications Framework (EQF), making your qualification recognisable across Europe and beyond.",
    },
    {
        icon: <Globe className="w-8 h-8 text-green-500" />,
        title: "English-speaking environment",
        description: "Live and learn in a country where English is an official language and the primary medium of instruction in universities and daily life.",
    },
    {
        icon: <Plane className="w-8 h-8 text-orange-500" />,
        title: "Schengen access",
        description: "Benefit from living in an EU and Schengen member state, with easier short-term travel to other European countries for tourism, conferences and networking.",
    },
    {
        icon: <Banknote className="w-8 h-8 text-yellow-500" />,
        title: "Moderate tuition and living costs",
        description: "Enjoy lower overall costs than many larger destinations like the UK, USA, Canada or Australia, while still earning an EU-recognised qualification.",
    },
    {
        icon: <Briefcase className="w-8 h-8 text-red-500" />,
        title: "Growing job market",
        description: "Tap into Malta's expanding sectors such as hospitality and tourism, iGaming, fintech, aviation, logistics, shared services and corporate support.",
    },
    {
        icon: <Shield className="w-8 h-8 text-indigo-500" />,
        title: "Safe and compact island",
        description: "Experience short commutes, close-knit communities and generally lower levels of violent crime compared to many big-city destinations.",
    },
    {
        icon: <Users className="w-8 h-8 text-purple-500" />,
        title: "International student community",
        description: "Join classrooms with a high proportion of international students, giving you a diverse peer group and global connections.",
    },
    {
        icon: <HeartHandshake className="w-8 h-8 text-teal-500" />,
        title: "Gateway to broader careers",
        description: "Use Malta as a stepping stone to build EU work experience and then explore opportunities in other European markets or back in India at a higher level.",
    },
];


const topUniversities = [
    {
        name: "University of Malta",
        location: "Msida, Malta",
        qsRanking: "741–750",
        webometricsWorld: "829",
        webometricsNational: "1",
        image: "/college/college-1.webp",
        dataAiHint: "university campus mediterranean",
        programs: {
            ug: [
                { name: "Computer Science", details: "3–4 Years | €6,000–€10,000/yr" },
                { name: "Business and IT / Management", details: "3 Years | €6,000–€9,000/yr" },
                { name: "Engineering", details: "4 Years | €7,000–€11,000/yr" },
            ],
            pg: [
                { name: "MSc in Information and Communication Technology", details: "1–2 Years | €8,000–€12,000" },
                { name: "MBA / Management-related Master's", details: "1–2 Years | €12,000–€20,000" },
                { name: "MSc in Engineering", details: "1–2 Years | €8,000–€15,000" },
            ],
        },
    },
    {
        name: "MCAST (Malta College of Arts, Science and Technology)",
        location: "Paola, Malta",
        qsRanking: "N/A",
        webometricsWorld: "7,400",
        webometricsNational: "3",
        image: "/college/college-2.webp",
        dataAiHint: "technical college campus",
        programs: {
            ug: [
                { name: "Engineering and Electronics", details: "3 Years | €4,500–€7,000/yr" },
                { name: "ICT, Networking and Software Development", details: "3 Years | €4,000–€6,500/yr" },
                { name: "Business Management and Entrepreneurship", details: "3 Years | €3,500–€6,000/yr" },
            ],
            pg: [
                { name: "Top-up degrees in Engineering / ICT", details: "1 Year | €5,000–€8,000" },
                { name: "Advanced vocational programmes (Level 5+)", details: "1–2 Years | €3,500–€6,500/yr" },
            ],
        },
    },
    {
        name: "Global College Malta",
        location: "SmartCity / Kalkara, Malta",
        qsRanking: "N/A",
        webometricsWorld: "16,200",
        webometricsNational: "7",
        image: "/college/college-3.webp",
        dataAiHint: "modern business school",
        programs: {
            ug: [
                { name: "BSc (Hons) Business Management", details: "3 Years | €4,500–€9,000/yr" },
                { name: "BSc Management with Marketing", details: "3 Years | €4,500–€9,000/yr" },
                { name: "Business and Finance-related routes", details: "3 Years | €4,500–€9,000/yr" },
            ],
            pg: [
                { name: "MBA (General / specialisations)", details: "1–1.5 Years | €8,500–€10,000" },
                { name: "MSc in Management and Leadership", details: "1–1.5 Years | €7,000–€10,000" },
            ],
        },
    },
    {
        name: "GBS Malta (Global Banking School Malta)",
        location: "St Julian's, Malta",
        qsRanking: "N/A",
        webometricsWorld: "N/A",
        webometricsNational: "N/A",
        image: "/college/college-4.webp",
        dataAiHint: "finance education building",
        programs: {
            ug: [
                { name: "BA (Hons) Business and Management", details: "3 Years | €6,000/yr" },
                { name: "Banking, Finance and Accounting pathways", details: "3 Years | €6,000/yr" },
            ],
            pg: [
                { name: "MBA", details: "1 Year | €10,000" },
                { name: "MA / MSc in International Business & Management", details: "1 Year | €7,000" },
            ],
        },
    },
    {
        name: "Institute of Tourism Studies (ITS)",
        location: "St Julian's and Luqa, Malta",
        qsRanking: "N/A",
        webometricsWorld: "9,600",
        webometricsNational: "4",
        image: "/college/college-5.webp",
        dataAiHint: "hospitality training campus",
        programs: {
            ug: [
                { name: "Hospitality Management", details: "3 Years | €3,500–€7,000/yr" },
                { name: "Tourism and Travel Management", details: "3 Years | €3,500–€7,000/yr" },
                { name: "Culinary Arts and Professional Cookery", details: "3 Years | €3,500–€7,000/yr" },
            ],
            pg: [
                { name: "Advanced Hospitality and Tourism Management", details: "1–2 Years | €4,000–€8,000" },
                { name: "Specialised Culinary / Gastronomy programmes", details: "1–2 Years | €4,000–€8,000/yr" },
            ],
        },
    },
];

const admissionRequirements = {
    undergraduate: [
        "Typically 50–60% or above in Class 12 from a recognised board; some competitive programmes may expect 65–75% or higher.",
        "Many programmes expect IELTS 5.5 (no band below 5.0) or equivalent scores in PTE/TOEFL/Duolingo.",
        "SOP explaining your academic and career goals and Letters of Recommendation where applicable.",
        "A clear explanation of any study/work gaps.",
    ],
    postgraduate: [
        "Usually 50–55% or above in a Bachelor degree, with stronger grades and relevant background preferred for technical or selective courses.",
        "Many programmes expect IELTS 6.0 (no band below 5.5) or equivalent scores in PTE/TOEFL/Duolingo.",
        "SOP linking your past education/experience to your chosen course, LORs where applicable, and an updated CV.",
        "A clear explanation of any study/work gaps.",
    ],
};

const studyCosts = [
    { item: "Undergraduate tuition fees", cost: "€4,500 – €11,000 per year" },
    { item: "Postgraduate tuition fees", cost: "€5,000 – €18,000 per year" },
    { item: "Living expenses", cost: "€750 – €950 per month" },
    { item: "Health insurance", cost: "€300 – €600 per year" },
    { item: "Typical first-year outlay (mid-range)", cost: "€14,000 – €16,000" },
];

const requiredVisaDocs = [
    "Completed and signed National D visa application form.",
    "Valid passport with sufficient validity after course start date and copies of all used pages.",
    "Recent passport-size photographs as per specified guidelines.",
    "Official offer or enrolment letter from a recognised Maltese institution with details of course, duration and fees.",
    "Proof of tuition fee payment or deposit as required by the institution.",
    "Academic documents: Class 10, Class 12 and degree mark sheets and certificates with translations/apostilles where required.",
    "Bank statements and balance certificates (typically 3–6 months) demonstrating funds for tuition and living costs.",
    "Sponsor documents if applicable: sponsorship letter, relationship proof, income proofs and tax returns.",
    "Evidence of acceptable funds such as savings accounts, fully sanctioned education loans and eligible fixed deposits.",
    "Medical and travel insurance with coverage (often at least €30,000) valid for Schengen and study period.",
    "Accommodation proof for initial stay (hostel, hotel booking, lease agreement or provider letter).",
    "Flight itinerary aligned with the course start date and visa rules.",
];

const visaProcessSteps = [
    { title: "Confirm Offer & Pay Deposit", description: "Confirm your offer and pay the required tuition deposit to the institution." },
    { title: "Collect Documents", description: "Gather all academic, financial and identity documents as per the latest checklist." },
    { title: "Book Visa Appointment", description: "Book a visa appointment with the relevant embassy/consulate or VFS office." },
    { title: "Submit Application", description: "Submit your National D visa application along with biometrics and supporting documents." },
    { title: "Respond to Queries", description: "Respond promptly if the visa office requests any additional information or clarification." },
    { title: "Track Application", description: "Track your application and wait for the decision." },
    { title: "Prepare for Departure", description: "Once the visa is approved, arrange final travel and accommodation, and prepare for departure." },
];

const studentLife = [
    {
        icon: <Home className="w-8 h-8 text-blue-500" />,
        title: "Accommodation",
        description: "Students typically live in shared apartments, purpose-built student housing or homestays. Coastal areas like Sliema and St. Julian's offer a lively atmosphere, while inland localities can provide more budget-friendly options."
    },
    {
        icon: <HeartHandshake className="w-8 h-8 text-green-500" />,
        title: "Student Support Services",
        description: "Most institutions offer academic advising, orientation programmes and basic counselling services. International offices help with enrolment, visa-related queries, and adjusting to academic expectations."
    },
    {
        icon: <Users className="w-8 h-8 text-orange-500" />,
        title: "Campus Life & Culture",
        description: "Student life in Malta often includes clubs, societies, cultural events and outdoor activities. The small size of the country makes it easy to explore beaches, historic sites and nearby islands, even with a busy study schedule."
    },
    {
        icon: <Briefcase className="w-8 h-8 text-purple-500" />,
        title: "Career Services",
        description: "Universities and colleges may provide career guidance, CV workshops, employer events and internship leads. Engaging with these services early can open doors to part-time and full-time opportunities."
    },
];

const workQuiz = {
    question: "After roughly how many days in Malta can you usually begin part-time work, and what is the typical maximum hours per week during term time?",
    options: ["30 days / 10 hours", "90 days / 20 hours", "180 days / 40 hours", "60 days / 20 hours"],
    correctAnswer: "90 days / 20 hours",
};

const faqsForSchema = [
    {
        questionName: "Why is Malta a good study destination for Indian students?",
        acceptedAnswerText: "Malta offers EU-recognised degrees, an English-speaking environment, Schengen access, moderate costs compared to the UK or USA, and growing work opportunities in sectors like hospitality, iGaming and fintech."
    },
    {
        questionName: "What are the requirements to study in Malta for Indian students?",
        acceptedAnswerText: "For undergraduate courses, students typically need 50–60% or above in Class 12 and IELTS 5.5. For postgraduate courses, a relevant bachelor's degree with 50–55% or above and IELTS 6.0 is commonly expected, along with an SOP and supporting documents."
    },
    {
        questionName: "What is the cost of studying in Malta?",
        acceptedAnswerText: "Undergraduate tuition fees range from roughly €4,500 to €11,000 per year, while postgraduate fees range from €5,000 to €18,000 per year. Living expenses are often around €750 to €950 per month, with a typical first-year outlay of €14,000 to €16,000 for a mid-range programme."
    },
    {
        questionName: "Can I work in Malta while and after studying?",
        acceptedAnswerText: "Eligible non-EU students on a long-stay study visa can usually work up to 20 hours per week during study periods after roughly 90 days of lawful stay. Graduates may apply for post-study permission to stay and look for work related to their qualification."
    },
];

function TopUniversities() {
  return (
    <section className="py-16 sm:py-24 bg-muted dark:bg-slate-dark">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-foreground font-headline sm:text-4xl">Top Universities &amp; Institutions in Malta</h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg leading-8 text-muted-foreground">
            Key higher education providers in Malta that attract international students, including many from India.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {topUniversities.map((uni) => (
            <Card key={uni.name} className="overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col">
              <div className="relative h-56 w-full">
                <Image
                  src={uni.image}
                  alt={`Campus of ${uni.name}, a top university to study in Malta for Indian students`}
                  fill
                  className="object-cover"
                  quality={75}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  data-ai-hint={uni.dataAiHint}
                />
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
                  <Accordion type="single" collapsible className="w-full" suppressHydrationWarning>
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

interface MaltaPageClientProps {
    children: React.ReactNode;
}

export default function MaltaPageClient({ children }: MaltaPageClientProps) {
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
                Study in Malta: <span className="text-primary dark:text-white">Your Gateway to Europe&apos;s Hidden Mediterranean Gem</span>
              </h1>
              <p className="mt-6 text-lg text-muted-foreground">
                Discover EU-recognised degrees, an English-speaking environment, realistic costs, and genuine work options on a safe, sunny island nation in the heart of the Mediterranean. Whiteboard Consultants helps Indian students turn Malta into a launchpad for global careers.
              </p>
              <QuickAnswer>
                <p>
                  To study in Malta from India, students typically apply to Maltese institutions with proof of English proficiency (IELTS/PTE/TOEFL), academic transcripts, and a Statement of Purpose. Whiteboard Consultants in Kolkata provides end-to-end counseling for Maltese admissions, National D visa filing, and post-study work pathways.
                </p>
              </QuickAnswer>
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
                src="/destinations/studying-in-malta.webp"
                alt="A scenic view of Malta, representing the beauty of studying in Malta."
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                data-ai-hint="malta mediterranean"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 bg-background dark:bg-black">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold tracking-tight text-foreground font-headline sm:text-4xl">Why Study in Malta?</h2>
                <p className="mt-4 max-w-2xl mx-auto text-lg leading-8 text-muted-foreground">
                    Explore why Malta is becoming a smart, emerging choice for Indian students who want an EU education with practical work options and a comfortable lifestyle.
                </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {whyStudyInMalta.map((reason) => (
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
                    <h2 className="text-3xl font-bold tracking-tight text-foreground font-headline sm:text-4xl mb-8">Admission &amp; Costs for Studying in Malta</h2>
                    <p className="text-muted-foreground mb-6">Entry requirements and costs vary between institutions and programmes. Always verify exact criteria on the official institution website before applying.</p>
                    <Accordion type="single" collapsible defaultValue="item-1" className="w-full" suppressHydrationWarning>
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
                                 An overview of the indicative expenses for Indian students planning to study in Malta.
                             </CardDescription>
                         </CardHeader>
                         <CardContent>
                             <ul className="space-y-3">
                                 {studyCosts.map(item => (
                                     <li key={item.item} className="flex justify-between items-start gap-4 text-sm">
                                         <span>{item.item}</span>
                                         <span className="font-semibold text-right">{item.cost}</span>
                                     </li>
                                 ))}
                             </ul>
                             <p className="text-xs text-muted-foreground mt-4">*Costs are approximate planning estimates and may vary based on institution, city area, lifestyle choices and currency fluctuations.</p>
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
                    Your Malta Study Abroad Timeline
                </h2>
                <p className="mt-4 max-w-3xl mx-auto text-lg leading-8 text-muted-foreground">
                    Timelines for Bachelor and Master applicants are similar but not identical. Use the toggle to switch between Undergraduate (UG) and Postgraduate (PG) application routes.
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
                <h2 className="text-3xl font-bold tracking-tight text-foreground font-headline sm:text-4xl">Malta Student Visa Guide for Indian Students</h2>
                <p className="mt-4 max-w-2xl mx-auto text-lg leading-8 text-muted-foreground">
                    Most full-time students heading to Malta apply for a National D Visa (long-stay) for study. A well-organised visa file improves your chances of smooth approval.
                </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                <div>
                    <h3 className="font-headline text-2xl font-bold mb-6 flex items-center"><ListChecks className="mr-3 h-6 w-6 text-primary dark:text-sky-400"/>Key Documents Checklist (Indicative)</h3>
                    <Card className="bg-background dark:bg-slate-900 dark:border dark:border-slate-700">
                        <CardContent className="p-6">
                            <ul className="space-y-3">
                                {requiredVisaDocs.map((doc, index) => (
                                    <li key={index} className="flex items-start">
                                        <CheckCircle2 className="h-5 w-5 text-green-500 dark:text-emerald-400 mr-3 mt-1 flex-shrink-0" />
                                        <span>{doc}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </div>
                <div>
                    <h3 className="font-headline text-2xl font-bold mb-6 flex items-center"><Milestone className="mr-3 h-6 w-6 text-primary dark:text-sky-400"/>Typical Visa Process</h3>
                    <div className="relative">
                        {visaProcessSteps.map((step, index) => (
                            <div key={index} className="pl-8 relative pb-8 border-l border-border dark:border-sky-400/40">
                                <div className="absolute -left-4 top-0 flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground border-2 border-primary rounded-full dark:bg-white dark:text-primary dark:border-white">
                                    <span className="font-bold">{index + 1}</span>
                                </div>
                                <h4 className="font-semibold">{step.title}</h4>
                                <p className="text-sm text-muted-foreground">{step.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
             <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-500/30">
                    <CardHeader className="flex flex-row items-center gap-4">
                        <Palmtree className="h-8 w-8 text-green-600" />
                        <CardTitle className="font-headline text-xl text-green-800 dark:text-green-300">Malta &amp; the Schengen Area</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-green-700 dark:text-green-200">Malta is a member of both the European Union and the Schengen Area. Your long-stay student visa allows you to live and study in Malta, and your residence status also enables easier short-term travel within the Schengen zone for tourism and networking.</p>
                    </CardContent>
                </Card>
                <Card className="bg-background">
                    <CardHeader className="flex flex-row items-center gap-4">
                        <Euro className="h-8 w-8 text-primary dark:text-sky-400" />
                        <CardTitle className="font-headline text-xl">Financial Proof</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">Visa applications typically require evidence of funds covering tuition and living costs, including bank statements (3–6 months), sanctioned education loans, and eligible fixed deposits. Medical and travel insurance with coverage of at least €30,000 is also commonly required.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    </section>

    <section className="py-16 sm:py-24 bg-muted dark:bg-slate-dark">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
                <h2 className="text-3xl font-bold tracking-tight text-foreground font-headline sm:text-4xl">Work Opportunities in Malta</h2>
                <p className="mt-4 max-w-3xl mx-auto text-lg leading-8 text-muted-foreground">
                    Malta offers possibilities to work part-time during studies and to explore work options after graduation, subject to current regulations. Students should focus on academics first while using work opportunities strategically.
                </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch mt-12">
                <Card className="shadow-lg flex flex-col">
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl flex items-center"><Briefcase className="mr-3 h-6 w-6 text-primary dark:text-sky-400"/>Post-Study Work and Career Options</CardTitle>
                        <CardDescription>Stay back and explore career opportunities after you graduate.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 flex-grow flex flex-col">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <p className="flex items-start text-blue-800 dark:text-blue-200"><CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />Graduates may apply for a post-study or job-search permission allowing them to stay in Malta for a defined period (often up to about 12 months) to look for work related to their qualification.</p>
                        </div>
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <p className="flex items-start text-blue-800 dark:text-blue-200"><CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />Once a full-time job is secured, students can typically apply to switch to a Single Work Permit linked to a specific employer, role and salary level.</p>
                        </div>
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <p className="flex items-start text-blue-800 dark:text-blue-200"><CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />Highly skilled roles in sectors like IT, engineering, finance and specialist technical areas may have priority or fast-track pathways with higher salary thresholds.</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="shadow-lg flex flex-col">
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl flex items-center"><Clock className="mr-3 h-6 w-6 text-primary dark:text-violet-400"/>Part-Time Work While Studying</CardTitle>
                        <CardDescription>Earn while you learn and gain valuable experience.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow flex flex-col">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg text-center">
                                <p className="font-bold text-4xl text-indigo-700 dark:text-indigo-300">20</p>
                                <p className="text-sm text-indigo-600 dark:text-indigo-200">Hours/week during study periods</p>
                            </div>
                            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg text-center">
                                <p className="font-bold text-4xl text-purple-700 dark:text-purple-400">90</p>
                                <p className="text-sm text-purple-600 dark:text-purple-300">Days before work eligibility</p>
                            </div>
                        </div>
                        <p className="text-center text-muted-foreground mb-4">Typical hourly pay: <span className="font-bold text-foreground">€6 – €9 per hour</span></p>
                         <Accordion type="single" collapsible className="w-full" suppressHydrationWarning>
                            <AccordionItem value="eligibility">
                                <AccordionTrigger>Eligibility Criteria</AccordionTrigger>
                                <AccordionContent>
                                    <ul className="space-y-2 text-muted-foreground">
                                        <li className="flex items-start"><CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 shrink-0" /><span>Eligible non-EU students on a long-stay study visa can usually work up to 20 hours per week during study periods once they have completed roughly 90 days of lawful stay.</span></li>
                                        <li className="flex items-start"><CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 shrink-0" /><span>Employers generally need to obtain a Jobsplus employment licence for the student before work can begin.</span></li>
                                    </ul>
                                </AccordionContent>
                            </AccordionItem>
                             <AccordionItem value="jobs">
                                <AccordionTrigger>Common Job Opportunities</AccordionTrigger>
                                <AccordionContent>
                                    <p className="text-muted-foreground">Common part-time roles are found in hospitality, retail, customer service, delivery and basic office/admin work. Hourly pay for entry-level part-time work often falls in the €6 – €9 per hour range, helping students cover a portion of their living costs.</p>
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
                <h2 className="text-3xl font-bold tracking-tight text-foreground font-headline sm:text-4xl">Student Life &amp; Resources in Malta</h2>
                <p className="mt-4 max-w-2xl mx-auto text-lg leading-8 text-muted-foreground">
                    Beyond academics, Malta offers a relaxed Mediterranean lifestyle, a welcoming community and practical support services that make it easier for international students to settle in.
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
                    <CardTitle className="font-headline text-2xl text-primary dark:text-white">Quick Check: Work Rights in Malta</CardTitle>
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
                                        "h-auto py-4 text-sm sm:text-base",
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
                            Not quite. The correct answer is 90 days / 20 hours.
                        </p>
                    )}
                    {selectedAnswer && isCorrect && (
                        <p className="mt-6 text-green-600 font-semibold flex items-center justify-center">
                            <CheckCircle2 className="mr-2 h-5 w-5" />
                            Correct! You can usually work up to 20 hours per week after roughly 90 days in Malta.
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    </section>

      {children}
      <StudyAbroadCtaSection headline="Ready to Start Your Malta Journey?" />
    </div>
  );
}
