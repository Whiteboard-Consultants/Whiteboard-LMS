
import { Globe, BookOpenCheck, FilePenLine, Files, University, Plane } from "lucide-react";
import { StepCard } from "@/components/step-card";

const steps = [
    {
        stepNumber: "01",
        icon: <Globe className="h-6 w-6 text-blue-500" />,
        title: "Choose Your Destination",
        description: "Select the country and university that aligns with your academic goals and career aspirations.",
        checklist: [
            "Research top universities worldwide",
            "Compare education systems and costs",
            "Consider climate and cultural factors",
            "Evaluate post-graduation opportunities",
        ],
    },
    {
        stepNumber: "02",
        icon: <BookOpenCheck className="h-6 w-6 text-green-500" />,
        title: "Select Your Course",
        description: "Find the perfect program that matches your interests, career goals, and academic background.",
        checklist: [
            "Explore various fields of study",
            "Check course curriculum and duration",
            "Verify accreditation and rankings",
            "Consider specialization options",
        ],
    },
    {
        stepNumber: "03",
        icon: <FilePenLine className="h-6 w-6 text-orange-500" />,
        title: "Prepare for Tests",
        description: "Take standardized tests like IELTS, TOEFL, GRE, GMAT, or SAT based on your chosen destination.",
        checklist: [
            "Identify required standardized tests",
            "Enroll in preparation courses",
            "Practice with mock tests",
            "Achieve target scores",
        ],
    },
    {
        stepNumber: "04",
        icon: <Files className="h-6 w-6 text-purple-500" />,
        title: "Apply to Universities",
        description: "Submit compelling applications with all required documents to your shortlisted universities.",
        checklist: [
            "Complete application forms",
            "Write statement of purpose",
            "Gather recommendation letters",
            "Submit academic transcripts",
        ],
    },
    {
        stepNumber: "05",
        icon: <University className="h-6 w-6 text-red-500" />,
        title: "Secure Funding",
        description: "Explore scholarships, education loans, and financial aid options to fund your education.",
        checklist: [
            "Research scholarship opportunities",
            "Apply for education loans",
            "Calculate total expenses",
            "Plan financial resources",
        ],
    },
    {
        stepNumber: "06",
        icon: <Plane className="h-6 w-6 text-teal-500" />,
        title: "Apply for Visa",
        description: "Complete visa application process and prepare for your journey to study abroad.",
        checklist: [
            "Gather visa documentation",
            "Schedule visa interview",
            "Prepare for departure",
            "Arrange accommodation",
        ],
    },
];

export default function StudyAbroadSteps() {
    return (
        <section className="w-full py-12 md:py-24 lg:py-32 bg-background dark:bg-black">
            <div className="container">
                <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                    <h2 className="text-4xl font-bold tracking-tighter font-headline">
                        6 Steps to Study Abroad
                    </h2>
                    <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                        Follow our proven roadmap to make your study abroad dreams a reality
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {steps.map((step) => (
                        <StepCard key={step.stepNumber} {...step} />
                    ))}
                </div>
            </div>
      </section>
    )
}
