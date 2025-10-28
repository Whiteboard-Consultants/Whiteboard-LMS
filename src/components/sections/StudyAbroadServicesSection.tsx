
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

const services = [
  {
    title: "University Selection",
    description: "Expert guidance in choosing the right university and program based on your profile and goals.",
    included: [
      "Personalized university recommendations",
      "Course and program analysis",
      "Ranking and accreditation verification",
      "Career prospects evaluation",
    ],
  },
  {
    title: "Application Assistance",
    description: "Complete support throughout the application process to maximize your chances of admission.",
    included: [
      "Application form completion",
      "Statement of Purpose writing",
      "Letter of recommendation guidance",
      "Document preparation and review",
    ],
  },
  {
    title: "Test Preparation",
    description: "Comprehensive preparation for TOEFL, IELTS, GRE, GMAT, SAT and other standardized tests.",
    included: [
      "Expert-led coaching sessions",
      "Practice tests and mock exams",
      "Personalized study plans",
      "Score improvement strategies",
    ],
  },
  {
    title: "Visa Guidance",
    description: "Step-by-step assistance with visa application process and interview preparation.",
    included: [
      "Visa documentation support",
      "Interview preparation",
      "Application tracking",
      "Pre-departure guidance",
    ],
  },
  {
    title: "Education Loan",
    description: "Comprehensive support to help you secure the right education loan and finance your international studies with ease.",
    included: [
      "Loan eligibility check",
      "Bank comparisons",
      "Application support",
      "Repayment advice",
    ],
  },
    {
    title: "Money Transfer",
    description: "Reliable solutions for safe and efficient international money transfers to manage your finances abroad.",
    included: [
      "Transfer service guidance",
      "Account setup help",
      "Currency exchange tips",
      "Fee minimization",
    ],
  },
  {
    title: "Accommodation",
    description: "Expert assistance in finding comfortable and affordable housing options tailored to your needs and preferences.",
    included: [
      "Verified, secure housing options",
      "Personalized accommodation advice",
      "Help with booking and contracts",
      "Local area and commute insights",
    ],
  },
  {
    title: "Health & Insurance Guidance",
    description: "Essential support to secure the right health insurance for your studies abroad, ensuring peace of mind and financial protection.",
    included: [
      "Help choosing student health plans",
      "Coverage options explained",
      "Help with documentation and enrollment processes",
      "Support for claims and renewals",
    ],
  },
  {
    title: "Pre-Departure Orientation",
    description: "Comprehensive preparation to ensure a smooth and confident start to your study abroad journey.",
    included: [
      "Visa and immigration guidance",
      "Travel planning and packing tips",
      "Cultural awareness and adaptation advice",
      "Academic expectations and course preparation",
      "Safety, health, and financial planning tips",
    ],
  },
    {
    title: "Post-Arrival Support",
    description: "Comprehensive assistance to help you settle smoothly into your new country and university life.",
    included: [
      "Airport pickup coordination",
      "Help with accommodation and local transport",
      "SIM card and bank account setup",
      "Campus orientation and resource guidance",
      "Emergency and safety support",
    ],
  },
];

export default function StudyAbroadServicesSection() {
  return (
    <section className="py-16 sm:py-24 bg-muted dark:bg-slate-dark">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl font-headline">
            Our Study Abroad Services
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-muted-foreground">
            Comprehensive support for every step of your study abroad journey.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {services.map((service) => (
            <Card key={service.title} className="shadow-lg">
              <CardHeader>
                <CardTitle className="font-headline text-2xl">{service.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{service.description}</p>
                <h4 className="font-semibold mb-2">What&apos;s Included:</h4>
                <ul className="space-y-2">
                  {service.included.map((item) => (
                    <li key={item} className="flex items-center">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
