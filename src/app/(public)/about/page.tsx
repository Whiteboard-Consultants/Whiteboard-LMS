
import { MissionVisionCard } from '@/components/mission-vision-card';
import { CoreValueCard, CoreValueProps } from '@/components/core-value-card';
import { Target, Globe } from 'lucide-react';
import Image from "next/image";
import { AboutStat, AboutStatProps } from '@/components/about-stat';
import { ExpertCard } from '@/components/expert-card';
import DomesticCtaSection from '@/components/sections/DomesticCtaSection';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about Whiteboard Consultants, the top education consultant in Kolkata. Discover our story, mission, vision, and the expert team dedicated to your academic and career success.',
};

const stats: AboutStatProps[] = [
    { value: 31, label: "Countries", subLabel: "Global Reach Across Continents", suffix: "+" },
    { value: 850, label: "Partner Universities", subLabel: "Top Ranked Universities World-wide", suffix: "+" },
    { value: 1500, label: "Students Impacted", subLabel: "Dreams Turned Into Reality", suffix: "+" },
    { value: 98, label: "Test Prep Success Ratio", subLabel: "Exceptional Results Guaranteed", suffix: "%" },
];

const missionVision = [
    {
        icon: <Target className="h-10 w-10 text-blue-500" />,
        title: "Our Mission",
        description: "To be the most trusted and respected education consultancy, empowering students to achieve their dreams of a global education through ethical, transparent, and personalized guidance.",
    },
    {
        icon: <Globe className="h-10 w-10 text-green-500" />,
        title: "Our Vision",
        description: "To create a world where every student has the opportunity to access quality education, regardless of their background, and to become a global citizen who contributes positively to society.",
    }
];

const coreValues: CoreValueProps[] = [
    { icon: "CheckCircle2", title: "Integrity", description: "We uphold the highest ethical standards, ensuring transparency and honesty in all our interactions." },
    { icon: "Users", title: "Student-Centric Approach", description: "Your success is our priority. We provide personalized guidance tailored to your unique needs." },
    { icon: "Lightbulb", title: "Empowerment", description: "We empower you with the knowledge and skills to make informed decisions about your future." },
    { icon: "Handshake", title: "Collaboration", description: "We work with you, your family, and our partners to create a seamless path to your goals." }
];

const experts = [
    {
        name: "Navnit Daniel Alley",
        title: "Co-Founder - Career Coach & Sales Trainer",
        description: "I help students, parents, and early professionals make confident, future-ready career decisions through personalized education consulting, practical real-world training, career development support, and sales coaching.",
        imageUrl: "/Navnit.png",
        linkedinUrl: "https://www.linkedin.com/in/navnit-daniel-alley-sales-and-career-coach",
        dataAiHint: "male professional portrait",
    },
    {
        name: "Prateek Chaudhuri",
        title: "Co-Founder - Study Abroad Expert",
        description: "I help solve complex student and institutional challenges. My work spans Study Abroad, Test Prep, and Employability, where I drive growth, build meaningful partnerships, and deliver tailored consulting solutions that lead to real, measurable outcomes.",
        imageUrl: "/Prateek-Chaudhuri.png",
        linkedinUrl: "https://www.linkedin.com/in/prateek-chaudhuri-6a003b23/",
        dataAiHint: "male executive portrait",
    },
    {
        name: "Nigel Vincent",
        title: "Linguistic Coach and Quiz Master",
        description: "With over 2 decades of experience, I offer expert coaching in English language, communication, and public speaking. My unique approach blends academic rigor with engaging tools like quizzes and spelling bees to build confidence and fluency—empowering learners for academic and professional success.",
        imageUrl: "/Nigel-Vincent.png",
        linkedinUrl: "https://www.linkedin.com/in/nigel-vincent-823131316/",
        dataAiHint: "male business portrait",
    },
    {
        name: "Shomaila Ali Shaukat",
        title: "Student Relation - Lead Career Advisor",
        description: "I lead career advisory and student relations to ensure every student experiences a smooth, supportive, and goal-oriented journey—from counseling to career readiness. I specialize in guiding students with personalized college and higher education program suggestions across Indian and international universities.",
        imageUrl: "/Shumaila-Ali.png",
        linkedinUrl: "https://www.linkedin.com/in/shumaila-ali-shaukat-0259a0215/",
        dataAiHint: "female professional portrait",
    }
];


export default function AboutPage() {
    return (
        <>
        <section className="bg-slate-100 dark:bg-slate-dark py-16 sm:py-24">
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div>
                        <h1 className="font-headline text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
                            About Whiteboard Consultants
                        </h1>
                        <p className="mt-6 text-lg text-muted-foreground">
                            At Whiteboard Consultants - the top education consultants in Kolkata, we are passionate about empowering students to reach their full potential. Our dedicated team of education experts provides comprehensive guidance, from <Link href="/study-abroad" className="text-primary hover:underline dark:text-white">application assistance</Link> to <Link href="/study-abroad" className="text-primary hover:underline dark:text-white">visa processing</Link>, from program selection to <Link href="/courses" className="text-primary hover:underline dark:text-white">test preparation</Link> and from helping with public speaking to spoken English.
                        </p>
                    </div>
                    <div className="relative h-80 w-full overflow-hidden rounded-lg shadow-xl">
                        <Image
                            src="/whiteboard-team.webp"
                            alt="A diverse team of professionals collaborating in an office"
                            fill
                            sizes="(max-width: 768px) 100vw, 50vw"
                            className="object-cover"
                            data-ai-hint="team collaboration"
                            priority
                        />
                    </div>
                </div>
            </div>
        </section>

        <section className="py-16 sm:py-24 bg-background dark:bg-black">
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                    <div className="relative h-96 w-full overflow-hidden rounded-lg shadow-xl">
                        <Image
                            src="/home-hero.webp"
                            alt="A team of education consultants reviewing charts and data"
                            fill
                            sizes="(max-width: 1024px) 100vw, 50vw"
                            className="object-cover"
                            data-ai-hint="team business charts"
                        />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-foreground font-headline sm:text-4xl">Our Story: Kolkata&apos;s Top Education Consultants</h2>
                        <div className="mt-6 space-y-4 text-lg text-muted-foreground">
                            <p>With over 2 decades of experience in education and edtech, we have played diverse roles in guiding students towards their career goals. We immersed ourselves in understanding the industry&apos;s requirements, operations, and support mechanisms.</p>
                            <p>Expanding our network, we aimed to offer and receive assistance effectively. Leveraging our experience, we have honed the student journey, highlighting pitfalls to avoid and showcasing the benefits of understanding chosen career paths for success.</p>
                            <p>We empathetically stepped into the shoes of students and career seekers, navigating the journey to understand and overcome obstacles in pursuing higher education.</p>
                            <p>This journey led us to establish Whiteboard Consultants, a top <Link href="/college-admissions" className="text-primary hover:underline dark:text-white">education consultant in Kolkata</Link>, where you can seek guidance and meticulously plan your career or higher education path with a fresh perspective.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        
        <section className="py-16 sm:py-24 bg-primary dark:bg-slate-dark">
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {stats.map((stat, index) => (
                        <AboutStat key={index} {...stat} />
                    ))}
                </div>
            </div>
        </section>

        <section className="py-16 sm:py-24 bg-muted/20 dark:bg-black">
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {missionVision.map((item, index) => (
                        <MissionVisionCard key={index} {...item} />
                    ))}
                </div>
            </div>
        </section>
            
            <section className="py-16 sm:py-24 bg-muted/20 dark:bg-slate-dark">
                <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold tracking-tight text-foreground font-headline sm:text-4xl">
                            Our Core Values
                        </h2>
                        <p className="mt-4 max-w-2xl mx-auto text-lg leading-8 text-muted-foreground">
                            The principles that guide our commitment to your success.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {coreValues.map((value, index) => (
                            <CoreValueCard key={index} {...value} />
                        ))
                        }
                    </div>
                </div>
            </section>
            
            <section className="py-16 sm:py-24 bg-background dark:bg-black">
                <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold tracking-tight text-foreground font-headline sm:text-4xl">
                            Meet Our Expert Team
                        </h2>
                        <p className="mt-4 max-w-2xl mx-auto text-lg leading-8 text-muted-foreground">
                            Our team of dedicated professionals is here to guide you every step of the way.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {experts.map((expert, index) => (
                            <ExpertCard key={index} {...expert} />
                        ))
                        }
                    </div>
                </div>
            </section>
            <section className="py-16 sm:py-24 bg-muted/20 dark:bg-slate-dark">
              <DomesticCtaSection />
            </section>
        </>
    )
}
