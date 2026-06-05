export type BlogFaq = { question: string; answer: string };

/** Default FAQ content keyed by post slug — used for seeding and as fallback until DB is populated */
export const blogDefaultFaqsBySlug: Record<string, BlogFaq[]> = {
  'online-toefl-prep-courses-beat-self-study-results': [
    {
      question: 'Is self-study enough to reach a high TOEFL score?',
      answer:
        'Most self-study students struggle to reach competitive TOEFL scores without expert feedback, especially on Speaking and Writing. Structured online courses at Whiteboard Consultants Kolkata provide diagnostics, timed practice, and instructor review that typically improve scores faster.',
    },
    {
      question: 'How much can a structured TOEFL course improve my score?',
      answer:
        'Students in guided TOEFL programs often see improvements of 15–30+ points compared to self-study alone, depending on baseline level, practice consistency, and target university requirements.',
    },
    {
      question: 'Are online TOEFL courses available from Kolkata?',
      answer:
        'Yes. Whiteboard Consultants offers live and online TOEFL preparation with mock tests, essay feedback, and speaking practice — suitable for students across India preparing for US and global admissions.',
    },
    {
      question: 'When should I enroll in a TOEFL course instead of studying alone?',
      answer:
        'Enroll if your target score is 90+, you have less than three months before your test, speaking or writing is a weak area, or you have already self-studied without meaningful score gains.',
    },
  ],
  '8-week-ielts-intensive-course-success-stories': [
    {
      question: 'How long is the IELTS intensive course at Whiteboard Consultants?',
      answer:
        'Our intensive IELTS program runs approximately 8 weeks with live classes, section-wise drills, full mock tests, and personalized feedback to help students move toward band 7.0+ for study abroad admissions.',
    },
    {
      question: 'Can I improve my IELTS band score in 8 weeks?',
      answer:
        'Many students improve by 0.5–1.5 bands in 8 weeks with consistent attendance and practice. Starting band, study hours per week, and weak sections determine how much progress is realistic.',
    },
    {
      question: 'Does the course cover all four IELTS sections?',
      answer:
        'Yes. The curriculum covers Listening, Reading, Writing (Task 1 and Task 2), and Speaking with strategies tailored for UK, Ireland, Australia, and Canada university requirements.',
    },
    {
      question: 'Is this IELTS course suitable for first-time test takers?',
      answer:
        'Yes. The program includes foundation modules, diagnostic testing, and step-by-step guidance for students taking IELTS for the first time as well as those retaking the exam.',
    },
  ],
  'toefl-vs-ielts-complete-comparison-by-country': [
    {
      question: 'Should Indian students take TOEFL or IELTS?',
      answer:
        'Choose IELTS for UK, Ireland, Australia, and New Zealand applications. TOEFL is widely accepted in the USA and many Canadian programs. Whiteboard Consultants in Kolkata helps you pick the test that matches your destination and strengths.',
    },
    {
      question: 'Which test is easier for Indian students?',
      answer:
        'Neither test is universally easier. IELTS suits students comfortable with conversation-style speaking. TOEFL suits those who prefer integrated computer-based tasks. A diagnostic assessment is the best way to decide.',
    },
    {
      question: 'Do universities accept both TOEFL and IELTS?',
      answer:
        'Most international universities accept one or both tests, but requirements vary by country and program. Always verify the exact score requirement on your target university website before booking a test.',
    },
    {
      question: 'Can Whiteboard Consultants coach for both TOEFL and IELTS?',
      answer:
        'Yes. We offer preparation for both exams with separate batches, mock tests, and counselor guidance so you do not waste time preparing for the wrong test.',
    },
  ],
  'ielts-vs-toefl-2025-kolkata-guide': [
    {
      question: 'Should Indian students take TOEFL or IELTS in 2025?',
      answer:
        'Choose IELTS for UK, Ireland, Australia, and New Zealand. TOEFL is widely accepted in the USA and many Canadian programs. Whiteboard Consultants in Kolkata offers diagnostics to recommend the right test for your destination.',
    },
    {
      question: 'Which English test is better for Kolkata students studying abroad?',
      answer:
        'It depends on your target country and strengths. IELTS suits conversational speakers; TOEFL suits students comfortable with integrated computer tasks. Our counselors map your profile to the faster path.',
    },
    {
      question: 'What IELTS or TOEFL score do I need for top universities?',
      answer:
        'Requirements vary by institution — often IELTS 6.5–7.5 or TOEFL 80–100+. Verify each university’s minimum before booking a test date.',
    },
    {
      question: 'Where can I get IELTS and TOEFL coaching in Kolkata?',
      answer:
        'Whiteboard Consultants offers classroom and online IELTS and TOEFL preparation at Park Street, Kolkata, with mock tests and application counseling.',
    },
  ],
  'ireland-work-study-visa-tech-guide-20-hours': [
    {
      question: 'Can international students work while studying in Ireland?',
      answer:
        'Yes. Stamp 2 student permission generally allows 20 hours of work per week during term and full-time work during scheduled holidays, making Ireland attractive for tech students seeking practical experience.',
    },
    {
      question: 'What is the Ireland post-study work visa for graduates?',
      answer:
        'Eligible graduates can apply for the Third Level Graduate Programme, often referred to as a post-study work route, allowing up to two years to seek employment in Ireland after completing a qualifying course.',
    },
    {
      question: 'Is Ireland good for Indian tech students?',
      answer:
        'Ireland is a major European tech hub with offices from global companies, strong CS and engineering programs, and post-study work options — making it a popular destination for Indian STEM applicants.',
    },
    {
      question: 'How can Whiteboard Consultants help with studying in Ireland?',
      answer:
        'We provide university shortlisting, application and SOP support, IELTS/TOEFL coaching, visa documentation guidance, and pre-departure counseling for Indian students targeting Irish institutions.',
    },
  ],
  'uk-tier-2-visa-tech-universities-salary-guide': [
    {
      question: 'What is the UK Skilled Worker visa for graduates?',
      answer:
        'The Skilled Worker visa allows eligible graduates to work for a UK employer that can sponsor them, provided salary and skill thresholds are met. It is a common route from study to employment in the UK.',
    },
    {
      question: 'What salary do UK tech graduates typically earn?',
      answer:
        'Entry-level software and data roles in London often start around £35,000–£50,000+, with higher packages at leading firms and for in-demand specializations after experience.',
    },
    {
      question: 'Which UK universities are best for tech careers?',
      answer:
        'Strong options include Imperial College London, Manchester, Edinburgh, Warwick, and other Russell Group universities with reputable computer science, data, and engineering programs.',
    },
    {
      question: 'Does Whiteboard Consultants help with UK admissions and visas?',
      answer:
        'Yes. We support course selection, applications, test prep, and visa preparation for Indian students applying to UK universities and graduate roles.',
    },
  ],
  'australia-post-study-work-visa-psw-2-3-years': [
    {
      question: 'How long is the Australia post-study work visa?',
      answer:
        'Post-study work rights typically range from two to three years depending on qualification level and location of study, allowing graduates to work for Australian employers without immediate employer sponsorship.',
    },
    {
      question: 'Can I work anywhere in Australia on a PSW visa?',
      answer:
        'Yes. The post-study work visa generally lets you work for any employer in Australia in an eligible occupation, which supports gaining local experience before pursuing skilled migration pathways.',
    },
    {
      question: 'What are typical tech salaries in Australia for graduates?',
      answer:
        'Junior tech roles in cities like Sydney and Melbourne often start around AUD 60,000–75,000+, varying by role, company, and prior internship experience.',
    },
    {
      question: 'How do I start my Australia study abroad application?',
      answer:
        'Begin with course and university selection, English test preparation, financial planning, and a complete student visa application. Whiteboard Consultants guides Indian students through each step.',
    },
  ],
  'germany-free-tuition-unlimited-work-rights-tech': [
    {
      question: 'Is university tuition free in Germany for international students?',
      answer:
        'Many public universities in Germany charge little or no tuition for international students, though semester administrative fees apply. Private institutions have separate fee structures.',
    },
    {
      question: 'Can students work while studying in Germany?',
      answer:
        'International students can usually work part-time during studies within legal limits, and Germany offers strong post-study residence options for graduates who secure qualifying employment.',
    },
    {
      question: 'Do I need German language skills for tech programs?',
      answer:
        'Many English-taught master’s programs in computer science and engineering accept IELTS or TOEFL, but learning German improves internships, daily life, and long-term employment prospects.',
    },
    {
      question: 'Why choose Germany over UK or Ireland for tech?',
      answer:
        'Germany combines low tuition at public universities, a large engineering economy, EU mobility after graduation, and competitive graduate salaries — especially in Berlin, Munich, and Frankfurt.',
    },
  ],
  'dubai-tech-career-tax-free-salary-visa-guide': [
    {
      question: 'Are salaries tax-free in Dubai?',
      answer:
        'Yes. UAE employment income is generally not subject to personal income tax, which can significantly increase take-home pay compared with many Western countries.',
    },
    {
      question: 'How do Indian professionals get a Dubai work visa?',
      answer:
        'A UAE employer sponsors the employment visa after a job offer. Unlike quota-limited systems in some countries, sponsorship is typically straightforward once a qualifying role is secured.',
    },
    {
      question: 'What tech salaries can graduates expect in Dubai?',
      answer:
        'Junior software and cloud roles often start around AED 150,000–200,000 per year, with substantial increases for mid-level and senior specialists at multinational employers.',
    },
    {
      question: 'Can Whiteboard Consultants help with Dubai study or career pathways?',
      answer:
        'Yes. We advise on Dubai university programs, employability upskilling, and study abroad planning for Indian students and professionals targeting the UAE market.',
    },
  ],
  'hustle-culture-gen-z-student-burnout-2026': [
    {
      question: 'How does Hustle Culture affect Gen Z students in India?',
      answer:
        'Hustle Culture pushes Gen Z students in India to constantly optimise their time with extra courses, test prep and side projects, often at the cost of sleep, rest and mental health, which increases the risk of academic burnout.',
    },
    {
      question: 'What are signs of student burnout among Indian college students?',
      answer:
        'Common signs include chronic exhaustion, loss of motivation, increased irritability, declining performance despite long study hours and feeling guilty whenever you rest or say no to new commitments.',
    },
    {
      question: 'How can Gen Z students in India protect themselves from burnout?',
      answer:
        'Setting realistic limits, building tech-free time into each day, talking honestly about stress and seeking support from counsellors or education consultants can help students balance ambition with well-being.',
    },
    {
      question: 'How can Whiteboard Consultants help students facing burnout?',
      answer:
        'Whiteboard Consultants in Kolkata offers personalised counselling, test preparation and admissions guidance to help students across India create sustainable study plans and career paths without relying on Hustle Culture overload.',
    },
  ],
  '12-week-toefl-ibt-intensive-course-strategy': [
    {
      question: 'What is covered in a 12-week TOEFL intensive course?',
      answer:
        'A 12-week TOEFL IBT program typically includes reading and listening strategies, integrated speaking and writing tasks, weekly mock tests, and instructor feedback aligned with current ETS scoring patterns.',
    },
    {
      question: 'Who should join a 12-week TOEFL intensive batch?',
      answer:
        'Students targeting 100+ TOEFL scores, applicants with upcoming university deadlines, and learners who want structured accountability rather than unstructured self-study benefit most from an intensive schedule.',
    },
    {
      question: 'How many hours per week should I study for TOEFL?',
      answer:
        'Plan for 12–20 hours per week including classes, homework, and full-length practice tests. Consistency over 12 weeks usually outperforms cramming in the final fortnight.',
    },
    {
      question: 'Where can I enroll for TOEFL coaching in Kolkata?',
      answer:
        'Whiteboard Consultants offers TOEFL intensive preparation online and at our Park Street center in Kolkata, with mock tests and counselor support for US and global admissions.',
    },
  ],
  'cybersecurity-safeguard-the-digital-world': [
    {
      question: 'Why is cybersecurity important for students and graduates?',
      answer:
        'Cybersecurity skills are in high demand as organizations protect data, cloud systems, and digital infrastructure. Graduates with security awareness improve employability across tech, finance, and consulting roles.',
    },
    {
      question: 'Can I study cybersecurity without a computer science degree?',
      answer:
        'Yes. Many bootcamps, certifications, and master’s pathways accept STEM and motivated non-STEM graduates who build foundational networking and programming skills first.',
    },
    {
      question: 'What careers can cybersecurity training lead to?',
      answer:
        'Roles include security analyst, SOC analyst, penetration tester, cloud security engineer, and GRC consultant — with strong salary growth as experience increases.',
    },
    {
      question: 'Does Whiteboard Consultants offer cybersecurity or tech upskilling guidance?',
      answer:
        'We guide students on study abroad tech programs, aptitude test prep, and career upskilling pathways including emerging fields like cybersecurity through our courses and counseling.',
    },
  ],
  'indian-graduate-unemployment-skill-gap-solution': [
    {
      question: 'Why are many Indian graduates not job-ready?',
      answer:
        'A significant employability gap exists because academic curricula often lag industry needs, and graduates lack practical skills, internships, and career planning support.',
    },
    {
      question: 'How can graduates close the skill gap in India?',
      answer:
        'Focus on internships, industry certifications, communication skills, aptitude test scores where relevant, and targeted upskilling in high-demand domains aligned to your career goal.',
    },
    {
      question: 'Can education consultants help with graduate employability?',
      answer:
        'Yes. Whiteboard Consultants offers career counseling, RIASEC assessment, resume evaluation, internship guidance, and upskilling programs to bridge academics and employment.',
    },
    {
      question: 'Should I upskill locally in Kolkata or study abroad?',
      answer:
        'Both paths work. Upskilling and internships build immediate employability; study abroad expands global credentials. A counselor can recommend the right mix for your profile and budget.',
    },
  ],
  'tech-management-uk-roi-indian-students': [
    {
      question: 'Is a UK tech or management degree worth it for Indian students?',
      answer:
        'UK degrees can offer strong ROI through shorter program durations, global brand value, post-study work options, and access to European job markets — especially for data, tech, and business roles.',
    },
    {
      question: 'What is the cost of studying tech or management in the UK?',
      answer:
        'Tuition often ranges from £18,000–£35,000+ per year depending on university and course, plus living costs. Scholarships and part-time work can reduce net expense.',
    },
    {
      question: 'Which UK courses have the best ROI for Indian applicants?',
      answer:
        'Computer science, data science, fintech, MBA, and specialized management programs at accredited universities with strong placement records typically deliver the highest graduate outcomes.',
    },
    {
      question: 'How does Whiteboard Consultants help with UK admissions?',
      answer:
        'We support university shortlisting, SOP and application strategy, IELTS preparation, visa documentation, and counseling on ROI based on your academic and career profile.',
    },
  ],
  'soft-skills-career-breakthrough': [
    {
      question: 'Why do soft skills matter for career advancement?',
      answer:
        'Employers hire for communication, teamwork, leadership, and problem-solving as much as technical ability. Strong soft skills accelerate promotions and interview success.',
    },
    {
      question: 'Which soft skills should Indian students prioritize?',
      answer:
        'Prioritize spoken English fluency, professional communication, presentation skills, emotional intelligence, and interview readiness — especially for global and client-facing roles.',
    },
    {
      question: 'Can soft skills be learned through training?',
      answer:
        'Yes. Structured workshops, mock interviews, public speaking practice, and mentorship produce measurable confidence and performance gains over self-study alone.',
    },
    {
      question: 'Does Whiteboard Consultants offer soft skills development?',
      answer:
        'Yes. We offer communication coaching, career development programs, resume and interview prep, and upskilling workshops for students and professionals in Kolkata and online.',
    },
  ],
  'saas-a-students-guide-to-careers-opportunities': [
    {
      question: 'What is SaaS and why is it growing in 2026?',
      answer:
        'Software-as-a-Service delivers cloud-based applications on subscription models. SaaS powers modern business tools and creates sustained demand for sales, engineering, product, and customer success roles.',
    },
    {
      question: 'What careers exist in the SaaS industry for graduates?',
      answer:
        'Popular paths include SaaS sales, customer success, digital marketing, product management, software engineering, and solutions consulting — often with performance-based growth.',
    },
    {
      question: 'Do I need a tech degree to work in SaaS?',
      answer:
        'Not always. Sales, marketing, and customer-facing SaaS roles value communication and business acumen; technical roles require CS or upskilling. Internships help either path.',
    },
    {
      question: 'How can Whiteboard Consultants help students enter SaaS careers?',
      answer:
        'Our internship tracks include sales outreach and digital marketing, plus career counseling and upskilling to help students build portfolios and interview readiness for SaaS employers.',
    },
  ],
  'uow-india-scholarships-2025': [
    {
      question: 'What scholarships does UOW India offer in 2025?',
      answer:
        'University of Wollongong India programs offer merit-based and need-based scholarship opportunities for qualifying applicants. Specific awards and amounts vary by intake and program — check current prospectus details.',
    },
    {
      question: 'Who is eligible for UOW India scholarships?',
      answer:
        'Eligibility typically depends on academic performance, entrance criteria, program choice, and application timing. Early applications often improve scholarship consideration.',
    },
    {
      question: 'How do I apply for UOW India with scholarship support?',
      answer:
        'Complete the university application with academic documents, meet entry requirements, and indicate scholarship interest where applicable. Whiteboard Consultants assists with documentation and counseling.',
    },
    {
      question: 'Does Whiteboard Consultants partner with UOW India?',
      answer:
        'Yes. Whiteboard Consultants is an education partner helping Indian students navigate UOW India admissions, scholarships, and program selection from our Kolkata office.',
    },
  ],
  'dubai-masters-tech-digital-business-tax-free-salaries': [
    {
      question: 'Why are Dubai master’s programs popular for tech and business students?',
      answer:
        'Dubai offers English-taught master’s degrees in AI, data science, digital business, and management with strong industry links, tax-free graduate earning potential, and a fast-growing regional job market.',
    },
    {
      question: 'Are Dubai master’s degrees recognized internationally?',
      answer:
        'Many programs are offered by internationally accredited institutions and branch campuses. Verify accreditation, curriculum, and employer recognition for your target industry before applying.',
    },
    {
      question: 'What are typical costs for a master’s in Dubai?',
      answer:
        'Tuition varies by institution and specialization, often ranging from moderate to premium compared with some Western countries, but tax-free salaries and shorter programs can improve overall return on investment.',
    },
    {
      question: 'How can Whiteboard Consultants help with Dubai admissions?',
      answer:
        'We assist with program selection, application documents, test prep requirements, and counseling on study and career outcomes for Indian students considering Dubai universities.',
    },
  ],
};

export function getDefaultFaqsForSlug(slug: string): BlogFaq[] | null {
  return blogDefaultFaqsBySlug[slug] ?? null;
}
