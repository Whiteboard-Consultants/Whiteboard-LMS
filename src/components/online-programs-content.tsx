'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, CheckCircle2, Zap, Globe, BookOpen, Target, ChevronDown } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import Link from 'next/link';
import Image from 'next/image';

const benefits = [
  {
    icon: Zap,
    title: 'Flexible Learning for Busy Schedules',
    description: 'Study when it fits you best. Perfect for professionals balancing work, family, and personal commitments while continuing to grow.',
  },
  {
    icon: Globe,
    title: 'Affordable and Accessible Opportunities',
    description: 'Skip relocation expenses and high tuition fees. Online degrees deliver affordable, world-class education that fits your lifestyle and budget.',
  },
  {
    icon: BookOpen,
    title: 'Industry-Relevant Curriculum',
    description: 'Courses are created in collaboration with leading universities and industry experts — ensuring every lesson equips you with future-ready skills.',
  },
  {
    icon: Target,
    title: 'Globally Recognized Credentials',
    description: 'Earn respected certifications and degrees that boost your résumé and open doors to global career opportunities.',
  },
];

const programBenefits = [
  'Learn at Your Own Pace',
  'Practical, Hands-On Learning',
  'Build a Global Network',
  'Advance or Switch Your Career',
  'Embrace Lifelong Learning',
];

const ctaFeatures = [
  'Choose from globally recognized universities and institutions.',
  'Learn from industry leaders and subject experts.',
  'Study on your schedule — anywhere, anytime.',
  'Gain credentials that employers value.',
];

const faqs = [
  {
    question: 'Are online degrees as recognized as traditional degrees?',
    answer: 'Yes, online degrees from accredited institutions are equally recognized and respected by employers worldwide. Our partner universities maintain the same accreditation standards for both online and on-campus programs. Employers value the credentials based on the institution and program quality, not the delivery method.',
  },
  {
    question: 'How much does an online degree program typically cost?',
    answer: 'Online programs are generally 20-40% more affordable than traditional campus-based programs, as they eliminate costs like campus facilities, housing, and commuting. Prices vary by university and program, ranging from affordable certificates to comprehensive degree programs. We offer flexible payment plans and scholarships to make education accessible.',
  },
  {
    question: 'Can I study while working full-time?',
    answer: 'Absolutely! Our programs are specifically designed for working professionals. You can study at your own pace, choosing when and where to learn. Most students balance full-time work with part-time study, completing courses over 2-4 years depending on the program intensity you select.',
  },
  {
    question: 'What kind of support and interaction will I receive?',
    answer: 'You\'ll have access to dedicated instructors, peer discussion forums, live webinars, and academic advisors. Many programs include synchronous (live) and asynchronous (on-demand) components to ensure you can connect with instructors and classmates, regardless of your timezone.',
  },
  {
    question: 'How long does it typically take to earn an online degree?',
    answer: 'Most bachelor\'s degrees take 3-4 years, master\'s degrees take 1-2 years, and professional certificates take 3-12 months, all depending on your pace and program. You can accelerate by taking more courses per term or study at a comfortable pace that fits your schedule.',
  },
  {
    question: 'What are the technology requirements?',
    answer: 'You\'ll need a reliable internet connection, a computer (laptop or desktop), and basic software like a web browser and PDF reader. Most courses use learning management systems and video conferencing tools. We provide technical support to help you set up and troubleshoot any issues.',
  },
  {
    question: 'Can I interact with other students online?',
    answer: 'Yes! Online students form vibrant communities through discussion forums, group projects, live study sessions, and virtual networking events. You\'ll collaborate with peers from around the world, building a diverse professional network that extends far beyond traditional classrooms.',
  },
  {
    question: 'Will I receive the same diploma as on-campus graduates?',
    answer: 'Yes, upon graduation, you receive an identical diploma and official transcript. There is no distinction between degrees earned online versus on-campus from accredited universities. Your achievement is recognized and valued equally in the job market.',
  },
  {
    question: 'What if I need to take a break from my studies?',
    answer: 'Most programs allow you to take leave of absence without losing your progress. You can pause your studies temporarily and resume when you\'re ready. Some programs offer flexible deadlines or allow you to extend timelines based on your circumstances.',
  },
  {
    question: 'How do I get started?',
    answer: 'Contact our education consultants to discuss your career goals and explore programs that match your interests. We\'ll guide you through the application process, help you select courses, and provide ongoing support throughout your learning journey. Schedule a free consultation today!',
  },
];

export default function OnlineProgramsContent() {
  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Hero Section */}
      <section className="relative py-16 sm:py-24 bg-gradient-to-br from-slate-100 via-blue-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="backdrop-blur-md bg-white/40 dark:bg-slate-900/40 rounded-2xl border border-white/60 dark:border-slate-700/60 p-8 space-y-6 shadow-lg hover:shadow-xl transition-all hover:bg-white/50 dark:hover:bg-slate-900/50">
              <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl leading-tight">
                Online Degrees and Certification Programs for Career Growth
              </h1>
              <p className="text-xl text-slate-600 dark:text-slate-300 font-semibold">
                Learn, Upskill, and Redefine Your Career Path
              </p>
              <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                Take charge of your growth with accredited online degrees and certification programs designed for working professionals, college graduates, and career switchers. Build relevant, high-demand skills, earn recognized credentials, and learn at your own schedule — from anywhere in the world.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                  asChild
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 dark:bg-white dark:text-black dark:hover:bg-slate-100"
                >
                  <Link href="/contact">
                    Explore Programs
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="dark:bg-slate-900 dark:text-white dark:border-white dark:hover:bg-slate-800"
                >
                  <Link href="/courses">View All Courses</Link>
                </Button>
              </div>
            </div>
            <div className="relative h-96 w-full overflow-hidden rounded-xl shadow-lg border border-white/20 dark:border-slate-700/40 backdrop-blur-sm">
              <Image
                src="/online_program.webp"
                alt="Online learning and career development"
                fill
                className="object-cover"
                priority
                quality={75}
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-16 sm:py-24 backdrop-blur-sm bg-white/80 dark:bg-slate-950/60 border-y border-white/20 dark:border-slate-700/40">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl mb-4">
              Why Choose Online Degrees and Certification Programs?
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Online learning eliminates barriers of location and time, offering accessible pathways to professional success.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              const variants = ['blue', 'green', 'orange', 'indigo'];
              const colorClasses = [
                { variant: 'blue' as const, icon: 'bg-blue-200/60 dark:bg-blue-900/40', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200/80 dark:border-blue-800/50 hover:border-blue-300/90 dark:hover:border-blue-700/70' },
                { variant: 'green' as const, icon: 'bg-green-200/60 dark:bg-green-900/40', text: 'text-green-600 dark:text-green-400', border: 'border-green-200/80 dark:border-green-800/50 hover:border-green-300/90 dark:hover:border-green-700/70' },
                { variant: 'orange' as const, icon: 'bg-orange-200/60 dark:bg-orange-900/40', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-200/80 dark:border-orange-800/50 hover:border-orange-300/90 dark:hover:border-orange-700/70' },
                { variant: 'indigo' as const, icon: 'bg-indigo-200/60 dark:bg-indigo-900/40', text: 'text-indigo-600 dark:text-indigo-400', border: 'border-indigo-200/80 dark:border-indigo-800/50 hover:border-indigo-300/90 dark:hover:border-indigo-700/70' },
              ];
              const colors = colorClasses[index % 4];
              return (
                <Card
                  variant={colors.variant}
                  key={benefit.title}
                  className={`backdrop-blur-md ${colors.border} shadow-md hover:shadow-lg transition-all`}
                >
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className={`p-3 ${colors.icon} rounded-lg`}>
                        <Icon className={`h-6 w-6 ${colors.text}`} />
                      </div>
                      <CardTitle className="text-xl text-slate-900 dark:text-white">
                        {benefit.title}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 dark:text-slate-400">{benefit.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Program Benefits Section */}
      <section className="py-16 sm:py-24 backdrop-blur-sm bg-slate-50/80 dark:bg-slate-900/40 border-y border-slate-200/40 dark:border-slate-700/40">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl mb-12 text-center">
            Benefits of Enrolling in Online Programs
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {programBenefits.map((benefit, index) => {
              const colorSchemes = [
                { bg: 'from-blue-50/60 to-cyan-50/50 dark:from-blue-950/30 dark:to-blue-900/20', border: 'border-blue-200/80 dark:border-blue-800/50 hover:border-blue-300/90 dark:hover:border-blue-700/70', icon: 'text-blue-500 dark:text-blue-400', bgHover: 'hover:from-blue-50/70 hover:to-cyan-50/60 dark:hover:from-blue-950/40 dark:hover:to-blue-900/30' },
                { bg: 'from-green-50/60 to-emerald-50/50 dark:from-green-950/30 dark:to-green-900/20', border: 'border-green-200/80 dark:border-green-800/50 hover:border-green-300/90 dark:hover:border-green-700/70', icon: 'text-green-500 dark:text-green-400', bgHover: 'hover:from-green-50/70 hover:to-emerald-50/60 dark:hover:from-green-950/40 dark:hover:to-green-900/30' },
                { bg: 'from-orange-50/60 to-amber-50/50 dark:from-orange-950/30 dark:to-orange-900/20', border: 'border-orange-200/80 dark:border-orange-800/50 hover:border-orange-300/90 dark:hover:border-orange-700/70', icon: 'text-orange-500 dark:text-orange-400', bgHover: 'hover:from-orange-50/70 hover:to-amber-50/60 dark:hover:from-orange-950/40 dark:hover:to-orange-900/30' },
                { bg: 'from-indigo-50/60 to-purple-50/50 dark:from-indigo-950/30 dark:to-purple-900/20', border: 'border-indigo-200/80 dark:border-indigo-800/50 hover:border-indigo-300/90 dark:hover:border-indigo-700/70', icon: 'text-indigo-500 dark:text-indigo-400', bgHover: 'hover:from-indigo-50/70 hover:to-purple-50/60 dark:hover:from-indigo-950/40 dark:hover:to-purple-900/30' },
                { bg: 'from-pink-50/60 to-rose-50/50 dark:from-pink-950/30 dark:to-rose-900/20', border: 'border-pink-200/80 dark:border-pink-800/50 hover:border-pink-300/90 dark:hover:border-pink-700/70', icon: 'text-pink-500 dark:text-pink-400', bgHover: 'hover:from-pink-50/70 hover:to-rose-50/60 dark:hover:from-pink-950/40 dark:hover:to-rose-900/30' },
              ];
              const colors = colorSchemes[index % 5];
              return (
                <div
                  key={index}
                  className={`backdrop-blur-md bg-gradient-to-br ${colors.bg} rounded-lg border ${colors.border} p-6 shadow-md hover:shadow-lg transition-all hover:bg-gradient-to-br ${colors.bgHover}`}
                >
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className={`h-6 w-6 ${colors.icon} flex-shrink-0 mt-1`} />
                    <p className="text-slate-900 dark:text-white font-semibold">{benefit}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How Online Courses Help Section */}
      <section className="py-16 sm:py-24 backdrop-blur-sm bg-white/80 dark:bg-slate-950/60 border-y border-white/20 dark:border-slate-700/40">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl mb-12 text-center">
            How Online Courses Help You Upskill
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Stay Relevant in a Dynamic Job Market',
                description:
                  'With rapid technological change, online certification programs help you stay ahead with the latest tools, techniques, and industry practices.',
              },
              {
                title: 'Develop Specialized Expertise',
                description:
                  'Focus on emerging fields like Artificial Intelligence, Business Analytics, UX Design, or Digital Marketing — tailor your learning to your ambitions.',
              },
              {
                title: 'Learn and Apply in Real Time',
                description:
                  'Continue working as you learn and apply new insights directly to your current projects or role, reinforcing skill retention and creating visible results.',
              },
            ].map((item, index) => (
              <div
                key={index}
                className="backdrop-blur-md bg-gradient-to-br from-indigo-50/60 via-indigo-50/50 to-purple-50/50 dark:from-indigo-950/30 dark:via-indigo-950/25 dark:to-purple-900/20 rounded-xl border border-indigo-200/80 dark:border-indigo-800/50 p-8 shadow-md hover:shadow-lg hover:border-indigo-300/90 dark:hover:border-indigo-700/70 transition-all hover:bg-gradient-to-br hover:from-indigo-50/70 hover:via-indigo-50/60 hover:to-purple-50/60 dark:hover:from-indigo-950/40 dark:hover:via-indigo-950/35 dark:hover:to-purple-900/30"
              >
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">{item.title}</h3>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 bg-[#004C94] dark:bg-slate-900/40 dark:backdrop-blur-md dark:border dark:border-slate-700/40">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl mb-4">
                  Ready to Advance Your Career?
                </h2>
                <p className="text-xl text-blue-100">
                  Explore Programs. Upgrade Your Future.
                </p>
              </div>
              <p className="text-lg text-blue-100 leading-relaxed">
                Discover accredited online degree programs and professional certifications that align with your career goals.
              </p>

              <div className="space-y-4">
                {ctaFeatures.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-blue-200 flex-shrink-0 mt-0.5" />
                    <p className="text-blue-50 text-lg">{feature}</p>
                  </div>
                ))}
              </div>

              <Button
                asChild
                size="lg"
                className="bg-white text-blue-600 hover:bg-blue-50 dark:bg-slate-100 dark:text-blue-900 dark:hover:bg-slate-200 w-full sm:w-auto"
              >
                <Link href="/contact">
                  Get Started Today
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>

            <div className="relative h-96 w-full overflow-hidden rounded-lg shadow-xl">
              <Image
                src="/student_consulting.webp"
                alt="Career advancement and professional growth"
                fill
                className="object-cover"
                quality={75}
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Secondary CTA */}
      <section className="py-16 sm:py-24 backdrop-blur-sm bg-white/80 dark:bg-slate-950/60 border-t border-white/20 dark:border-slate-700/40">
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl mb-6">
            Not sure where to start?
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto">
            Our education consultants can help you choose the right program based on your career goals and learning preferences.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 dark:bg-white dark:text-black dark:hover:bg-slate-100"
            >
              <Link href="/contact">Schedule a Consultation</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="dark:bg-slate-900 dark:text-white dark:border-white dark:hover:bg-slate-800"
            >
              <Link href="/courses">Browse Courses</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 sm:py-24 bg-white dark:bg-black">
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Find answers to common questions about online programs, admissions, and student support.
            </p>
          </div>

          <div className="backdrop-blur-md bg-white/50 dark:bg-slate-950/40 rounded-2xl border border-white/60 dark:border-slate-700/40 p-8 shadow-lg">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border-b border-slate-200 dark:border-slate-700/50 last:border-b-0">
                  <AccordionTrigger className="py-4 hover:text-blue-600 dark:hover:text-blue-400 transition-colors [&[data-state=open]>svg]:rotate-180">
                    <span className="text-left text-lg font-semibold text-slate-900 dark:text-white">
                      {faq.question}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4 text-slate-700 dark:text-slate-300 leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          <div className="mt-12 text-center">
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Still have questions? Our team is here to help!
            </p>
            <Button
              asChild
              size="lg"
              className="bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              <Link href="/contact">
                Contact Our Team
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
