-- Migration: Seed 25 FAQs into Database (CORRECTED FOR ACTUAL SCHEMA)
-- Purpose: Migrate hardcoded FAQs from page.tsx to Supabase with correct column names
-- Schema match: view_count, created_by (NOT NULL), excerpt, unhelpful_count, last_cached_at
-- Created: November 2, 2025

-- ============================================================================
-- STEP 0: Get or Create Admin User for created_by field
-- ============================================================================
-- NOTE: This requires an existing user in auth.users table
-- Replace '2a6a9e51-e874-4a3b-bc69-c8a2aa29e83c' with your actual admin user ID
-- You can find your user ID in Supabase Auth > Users

-- ============================================================================
-- STEP 1: Insert FAQ Categories (if not already exists)
-- ============================================================================

INSERT INTO faq_categories (id, name, slug, icon, description, display_order) VALUES
('550e8400-e29b-41d4-a716-446655440001'::UUID, 'Study Abroad', 'study-abroad', '🌍', 'Questions about studying abroad destinations, procedures, and costs', 1),
('550e8400-e29b-41d4-a716-446655440002'::UUID, 'Test Preparation', 'test-prep', '📚', 'IELTS, TOEFL, GMAT, and GRE preparation questions', 2),
('550e8400-e29b-41d4-a716-446655440003'::UUID, 'Career & Benefits', 'career', '💼', 'Career growth, work permits, scholarships, and post-study options', 3),
('550e8400-e29b-41d4-a716-446655440004'::UUID, 'Application & Documents', 'application', '📋', 'Application process, documents, SOP, and LORs', 4)
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- STEP 2: Insert 25 FAQs (from hardcoded page.tsx)
-- IMPORTANT: Replace '2a6a9e51-e874-4a3b-bc69-c8a2aa29e83c' with your admin user ID
-- ============================================================================

-- CATEGORY: STUDY ABROAD (7 FAQs)
INSERT INTO faqs (category_id, question, answer, display_order, is_published, created_by, excerpt, view_count, helpful_count, unhelpful_count) VALUES

('550e8400-e29b-41d4-a716-446655440001'::UUID, 
 'Which is the best country to study abroad from India?',
 'The best country depends on your goals and priorities:
• Ireland - Top 5% globally ranked Universities, offering world-class research opportunities and academic excellence.
• USA - Top-ranked universities and diverse opportunities
• UK - Shorter, specialized programs (1-2 years)
• Canada - Better immigration pathways and PR options
• Germany - Affordable education with quality standards
• Australia - Combines quality education with lifestyle

Consider your budget, field of study, post-study work rights, and long-term visa options when deciding.',
 1, true, '2a6a9e51-e874-4a3b-bc69-c8a2aa29e83c'::UUID, 'Best country to study abroad depends on goals', 0, 0, 0),

('550e8400-e29b-41d4-a716-446655440001'::UUID,
 'How much does it cost to study abroad?',
 'Annual costs vary significantly by country and university:
• Ireland: €12,000-30,000/year 
• USA: $30,000-70,000/year
• UK: £25,000-45,000/year
• Canada: $20,000-40,000/year
• Germany: €10,000-20,000/year
• Australia: $25,000-50,000/year

These include tuition, accommodation, and living expenses. Financial aid, scholarships, and part-time work can reduce costs substantially. Plan for total 2-4 year costs ranging from $40,000 to $300,000+ depending on country and program.',
 2, true, '2a6a9e51-e874-4a3b-bc69-c8a2aa29e83c'::UUID, 'Study abroad costs vary by country and university', 0, 0, 0),

('550e8400-e29b-41d4-a716-446655440001'::UUID,
 'What is the procedure to study abroad?',
 'The typical study abroad procedure:
1. Research universities and programs aligned with your goals
2. Prepare for entrance exams (IELTS, GMAT, GRE)
3. Prepare application documents (transcripts, certificates, portfolio)
4. Write Statement of Purpose (SOP) and get Letters of Recommendation (LOR)
5. Apply to universities (usually Sept-Dec)
6. Receive acceptances and financial aid offers
7. Choose university and pay deposit
8. Apply for student visa
9. Arrange accommodation and finances

The entire process typically takes 6-12 months.',
 3, true, '2a6a9e51-e874-4a3b-bc69-c8a2aa29e83c'::UUID, 'Study abroad procedure involves research, tests, and applications', 0, 0, 0),

('550e8400-e29b-41d4-a716-446655440001'::UUID,
 'How long does it take to prepare for studying abroad?',
 'Total preparation timeline is typically 6-12 months:
• Test preparation (IELTS/TOEFL/GMAT/GRE): 3-4 months
• Application document preparation: 2-3 months
• Application submission and waiting: 3-4 months
• Visa processing: 2-3 months

Start planning 12 months before your intended start date to have ample time for test prep, applications, and visa processing. Beginning earlier improves your university choices and scholarship opportunities.',
 4, true, '2a6a9e51-e874-4a3b-bc69-c8a2aa29e83c'::UUID, 'Preparation for studying abroad takes 6-12 months', 0, 0, 0),

('550e8400-e29b-41d4-a716-446655440001'::UUID,
 'Which test is required for studying abroad?',
 'Test requirements vary by country and program:
• English-speaking countries: IELTS or TOEFL required
• USA graduate studies: GMAT (for MBA/business) or GRE (for science/engineering) + TOEFL/IELTS
• Alternative options: Duolingo English Test (DET) accepted by many universities

Most universities accept both IELTS and TOEFL. Always check specific university requirements as they vary by institution and program.',
 5, true, '2a6a9e51-e874-4a3b-bc69-c8a2aa29e83c'::UUID, 'IELTS and TOEFL are required for most countries', 0, 0, 0),

('550e8400-e29b-41d4-a716-446655440001'::UUID,
 'What is the minimum IELTS and TOEFL score for studying abroad?',
 'Minimum IELTS score requirements:
• Undergraduate: 6.0-6.5
• Postgraduate: 6.5-7.0
• Top UK universities: 7.0-8.0+
• Australian universities: 6.5-7.5+
• Canadian universities: 6.5-7.0+
• USA universities: 7.0+
• Scholarships: 7.0-8.0+

Minimum TOEFL score requirements:
• Undergraduate: 79-87
• Postgraduate: 87-100
• Top UK universities: 100-120+
• Australian universities: 87-105+
• Canadian universities: 87-100+
• USA universities: 90-100+
• Scholarships: 100-120+

Note: IELTS bands convert to TOEFL scores (6.5 IELTS ≈ 79-93 TOEFL, 7.0 IELTS ≈ 93-101 TOEFL, 7.5 IELTS ≈ 102-110 TOEFL)

Higher scores significantly improve admission chances and scholarship opportunities.',
 6, true, '2a6a9e51-e874-4a3b-bc69-c8a2aa29e83c'::UUID, 'Minimum IELTS 6.0-8.0 and TOEFL 79-120 required', 0, 0, 0),

('550e8400-e29b-41d4-a716-446655440001'::UUID,
 'Can I study abroad without IELTS?',
 'Alternative English proficiency tests and options:
• TOEFL - Accepted globally, especially in USA
• Pearson English Test (PTE) - Growing acceptance
• Duolingo English Test (DET) - Increasingly accepted
• CEFR certification - European standard
• Conditional admission - Complete pre-university English courses
• Test waiver - If you studied in English-medium schools/universities

Always check specific university requirements as policies vary by institution.',
 7, true, '2a6a9e51-e874-4a3b-bc69-c8a2aa29e83c'::UUID, 'Alternatives to IELTS include TOEFL, PTE, DET', 0, 0, 0),

-- CATEGORY: TEST PREPARATION (6 FAQs)
('550e8400-e29b-41d4-a716-446655440002'::UUID,
 'What is the difference between IELTS and TOEFL?',
 'Key differences between IELTS and TOEFL:

Speaking:
• IELTS: Face-to-face conversation with examiner
• TOEFL: Computer-based recorded responses

Writing:
• IELTS: Hand-written or typed essays
• TOEFL: Typed responses only

Accent:
• IELTS: British English focus
• TOEFL: American English focus

Vocabulary:
• IELTS: British-American mix
• TOEFL: American English vocabulary

Acceptance:
• IELTS: Preferred in UK, Australia, Canada, Ireland, Germany
• TOEFL: Required in USA, some institutions worldwide

Scoring:
• IELTS: 0-9 band system
• TOEFL: 0-120 point system

Test type:
• IELTS: Paper or computer-based
• TOEFL: Computer-based only

Duration:
• IELTS: 2 hours 45 minutes
• TOEFL: 3 hours

Both are equally valid. Choose based on: destination country preference, career plans, and personal strengths.',
 1, true, '2a6a9e51-e874-4a3b-bc69-c8a2aa29e83c'::UUID, 'IELTS vs TOEFL differences in format, scoring, acceptance', 0, 0, 0),

('550e8400-e29b-41d4-a716-446655440002'::UUID,
 'How can I prepare for IELTS and TOEFL in 3 months?',
 '3-Month IELTS & TOEFL Preparation Plan:

Month 1: Foundation Building (Weeks 1-4)
• Week 1-2: Understand test format, question types, scoring criteria
• Week 3-4: Basic vocabulary building (1,000-2,000 words), grammar refresher
• Daily: 1-2 hours practice, 30 min vocabulary, 30 min listening

Month 2: Skills Development (Weeks 5-8)
• Week 5-6: Practice each section separately, focus on weak areas
• Week 7-8: Timed practice tests, speed building
• Daily: 2-3 hours practice, including full mock tests twice weekly

Month 3: Final Preparation (Weeks 9-12)
• Week 9-10: Full-length mock tests under exam conditions
• Week 11-12: Review mistakes, targeted practice on weak sections, relaxation and confidence building
• Daily: 2-3 hours with emphasis on full tests

Resources:
• Official practice materials (IELTS/TOEFL official websites)
• Online courses (British Council, ETS)
• Mock tests (minimum 10-15 full tests)
• English media consumption (movies, podcasts, news)
• Speaking practice (language exchange partners)

Success factors:
• Consistency over intensity
• Identify and focus on weak areas
• Take full mock tests regularly
• Analyze mistakes thoroughly

With dedicated effort, most students improve 0.5-1.5 bands/15-25 points in 3 months.',
 2, true, '2a6a9e51-e874-4a3b-bc69-c8a2aa29e83c'::UUID, '3-month preparation plan for IELTS and TOEFL', 0, 0, 0),

('550e8400-e29b-41d4-a716-446655440002'::UUID,
 'What is the best IELTS and TOEFL coaching in Kolkata?',
 'Top IELTS/TOEFL Coaching Options in Kolkata:

Traditional Coaching Centers:
• British Council Kolkata - Official IELTS partner, experienced trainers
• IDP Education Centers - Test conduct center with coaching
• ETS centers - TOEFL official partner
• Whitedge Consultants - Comprehensive test prep + university guidance

Online Coaching:
• Oxford House - Specialized IELTS training
• Magoosh/Manhattan - Global platforms with excellent resources
• British Council online courses - Official online training
• TOEFL official prep tools - By ETS

Choosing the right coaching:
1. Verify trainer qualifications (minimum 7.5+ IELTS score or 100+ TOEFL)
2. Check success rates and student testimonials
3. Prefer centers that offer personalized feedback and weak area focus
4. Look for mock test facilities
5. Choose coaches with university admission guidance
6. Ensure flexible schedules for working professionals

Recommendation:
Combine structured coaching (12-16 weeks) with self-study and resources. Coaching provides strategy and feedback; self-study builds discipline and consistency.

At Whitedge, we provide:
• Expert trainers with international qualifications
• Personalized weak area analysis
• Weekly mock tests with detailed feedback
• Free consultation on study abroad planning
• Post-test university selection guidance',
 3, true, '2a6a9e51-e874-4a3b-bc69-c8a2aa29e83c'::UUID, 'Best IELTS TOEFL coaching centers in Kolkata', 0, 0, 0),

('550e8400-e29b-41d4-a716-446655440002'::UUID,
 'What is GMAT and GRE? Which should I take?',
 'GMAT vs GRE for Graduate Studies:

GMAT (Graduate Management Admission Test):
• Purpose: MBA and business graduate programs
• Scoring: 200-800 (5 point increments)
• Duration: 3.5 hours (including breaks)
• Sections: Analytical Writing (1), Integrated Reasoning (1), Quantitative (1), Verbal (1)
• Cost: $250-275
• Validity: 5 years
• Difficulty: More focused on business logic, data interpretation
• Acceptance: Primarily business schools

GRE (Graduate Record Examination):
• Purpose: All graduate programs (science, engineering, humanities, MBA)
• Scoring: 130-170 per section (verbal + quant), 0-6 (analytical writing)
• Duration: 3 hours 45 minutes
• Sections: Analytical Writing (1), Verbal Reasoning (2), Quantitative Reasoning (2)
• Cost: $213-223
• Validity: 5 years
• Difficulty: More vocabulary-focused, diverse content
• Acceptance: Universally accepted

Which Should You Take?

Choose GMAT if:
• Pursuing MBA or business management programs
• Comfortable with data interpretation and business logic
• Want focused test for specific program type

Choose GRE if:
• Pursuing diverse fields (engineering, science, humanities, MBA)
• Prefer vocabulary-based exam
• Applying to multiple program types
• Want more program flexibility

Many schools now accept both. Check specific program requirements. For flexibility and broader acceptance, GRE is increasingly preferred.',
 4, true, '2a6a9e51-e874-4a3b-bc69-c8a2aa29e83c'::UUID, 'GMAT vs GRE for graduate studies and MBA', 0, 0, 0),

('550e8400-e29b-41d4-a716-446655440002'::UUID,
 'How do I choose between test prep strategies?',
 'Test Prep Strategy Selection Guide:

Self-Study Approach:
• Duration: 4-6 months
• Cost: $100-300 (books, practice tests, online resources)
• Best for: Disciplined learners, limited budget, already strong in English
• Pros: Flexible, economical, self-paced
• Cons: Needs self-motivation, may miss targeted feedback
• Resources: Official test prep books, Khan Academy, YouTube channels

Online Coaching:
• Duration: 8-12 weeks
• Cost: $300-800
• Best for: Working professionals, flexible schedules, remote learners
• Pros: Structured learning, recorded sessions, flexible timing
• Cons: Less personalized feedback, self-discipline required
• Platforms: Magoosh, Manhattan Prep, British Council Online

In-Person Coaching:
• Duration: 12-16 weeks (3-4 months)
• Cost: $500-1,500
• Best for: Struggling with tests, need personalized feedback, prefer classroom
• Pros: Personalized attention, immediate doubt clarification, community support
• Cons: Fixed schedules, higher cost, location-dependent
• Centers: British Council, IDP, Whitedge Consultants

Hybrid Approach (Recommended):
• Duration: 10-14 weeks
• Cost: $400-1,000
• Combine: Online coaching (structure) + self-study (flexibility) + mock tests (practice)
• Best for: Most students - balances cost, flexibility, and effectiveness

Choosing factors:
1. Current English level (6.0+ IELTS: self-study, below 6.0: coaching)
2. Time available (Full-time: 3-4 months coaching, Part-time: 4-6 months hybrid)
3. Budget constraints
4. Learning style (visual, auditory, kinesthetic)
5. Target score requirements

Success rate by approach:
• Self-study: 40-50% achieve target scores
• Online coaching: 60-70% achieve target scores
• In-person coaching: 75-85% achieve target scores
• Hybrid: 80-90% achieve target scores',
 5, true, '2a6a9e51-e874-4a3b-bc69-c8a2aa29e83c'::UUID, 'Test prep strategy selection and comparison', 0, 0, 0),

-- CATEGORY: CAREER & BENEFITS (5 FAQs)
('550e8400-e29b-41d4-a716-446655440003'::UUID,
 'What are post-study work visa options by country?',
 'Post-Study Work Visa Options by Country:

USA:
• OPT (Optional Practical Training): 12 months (STEM: 24 months)
• H1B: Sponsorship-based, 3-6 years, high visa lottery
• Route: Bachelor''s → OPT (1-3 years) → H1B → Green Card

UK:
• Graduate Route: 2 years post-graduation (recently extended from 6 months)
• Skilled Worker Visa: After 1-2 years UK work experience
• Route: Degree → Graduate Route (2 years) → Skilled Worker

Canada:
• PGWP (Post-Graduation Work Permit): 1-3 years based on study duration
• Can lead directly to PR (Permanent Residency)
• Route: Degree → PGWP → Express Entry → PR (fastest path to citizenship)

Ireland:
• Third Level Graduate Work Visa: 2 years post-graduation
• Extension possible with job offer
• Route: Degree → Work Visa (2 years) → Irish Residency → Citizenship

Australia:
• Post-Study Work Visa (subclass 485): 2-3 years
• Can transition to Skilled Migration visa
• Route: Degree → Work Visa (2-3 years) → Permanent Residency

Germany:
• Job Seeker Visa: 6 months after graduation to find work
• Work Visa/Settlement Permit: After securing employment (unlimited)
• Route: Degree → Job Seeker (6 months) → Work Visa → Permanent Settlement

New Zealand:
• Post-Study Work Visa: 1-3 years based on study level
• Can lead to residency
• Route: Degree → Work Visa → Residency → Citizenship

Best for PR (Permanent Residency):
1. Canada (fastest, 2-3 years)
2. Australia (3-5 years)
3. Germany (3-4 years + language)
4. Ireland (4-5 years)
5. New Zealand (2-3 years)',
 1, true, '2a6a9e51-e874-4a3b-bc69-c8a2aa29e83c'::UUID, 'Post-study work visa options and immigration pathways', 0, 0, 0),

('550e8400-e29b-41d4-a716-446655440003'::UUID,
 'Can I work while studying abroad?',
 'Work While Studying Options by Country:

USA:
• On-campus: 20 hours/week during term, unlimited during breaks
• Off-campus: Limited, requires authorization (CPT/OPT)
• Earnings: $15,000-20,000/year
• Coverage: Tuition 10-15%, living 40-50%

UK:
• International students: 20 hours/week during term, full-time during breaks
• Post-graduation: Full-time work on Graduate Route
• Earnings: £15,000-20,000/year
• Coverage: Living expenses 30-40%

Canada:
• On-campus: 20 hours/week during studies, full-time during breaks
• Off-campus: 20 hours/week with work permit
• Earnings: $20,000-25,000/year (CAD)
• Coverage: Living expenses 50-60%

Ireland:
• Students: 20 hours/week during term, full-time during breaks
• Post-study: Full-time work on Graduate Work Visa
• Earnings: €15,000-20,000/year
• Coverage: Living expenses 40-50%

Australia:
• International students: 48 hours/week during term (reduced from previous)
• Full-time during breaks
• Earnings: $20,000-25,000/year (AUD)
• Coverage: Living expenses 60-70%

Germany:
• Students: 20 hours/week or 40 days full-time/year
• No work permit needed for EU students (soon changing)
• Earnings: €15,000-18,000/year
• Coverage: Living expenses 50-60%

Best Countries for Work-Study Balance:
1. Australia (highest hourly rates, good work culture)
2. Canada (good earnings, work-study balance)
3. Ireland (flexible hours, good post-study path)
4. Germany (affordable, flexible hours)

Tips for working while studying:
• Start with campus employment (better flexibility)
• Build professional experience for post-study
• Avoid compromising academics
• Plan finances to balance work-study',
 2, true, '2a6a9e51-e874-4a3b-bc69-c8a2aa29e83c'::UUID, 'Working part-time while studying abroad', 0, 0, 0),

('550e8400-e29b-41d4-a716-446655440003'::UUID,
 'What scholarships are available for Indian students?',
 'Scholarship Opportunities for Indian Students:

US Scholarships:
• Fulbright Scholarship: Full funding, merit-based, ~200 awards/year for India
• INLAKS Scholarship: $20,000-40,000/year
• Hubert Humphrey Fellowship: Masters programs
• University-specific: MIT, Harvard, Stanford offer merit aid
• Amount: $0-60,000/year
• Percentage: 5-10% of Indian students

UK Scholarships:
• Chevening Scholarship: Full funding (~150/year for India)
• INLAKS Scholarship: Partial funding
• British Council scholarships: Variable
• University-specific: Oxford, Cambridge, LSE
• Amount: £10,000-40,000/year
• Percentage: 2-5% of Indian students

Canada Scholarships:
• Global Knowledge Scholarship: Partial funding
• Vanier Canada Graduate Scholarship: Full funding (limited international)
• University-specific: Toronto, UBC, McGill
• Amount: CAD $10,000-40,000/year
• Percentage: 10-15% of Indian students

Ireland Scholarships:
• Irish Aid Scholarship: Limited, merit-based
• Government of Ireland Postgraduate Scholarship: Full funding
• University-specific: Trinity College, UCD
• Amount: €5,000-25,000/year
• Percentage: 3-8% of Indian students

Australia Scholarships:
• Australia Awards Scholarship: Full funding (~300/year Asia-wide)
• University-specific: Go8 universities
• Amount: AUD $15,000-50,000/year
• Percentage: 5-10% of Indian students

Germany Scholarships:
• DAAD Scholarship: Full funding (~500/year for India)
• German Academic Exchange Service: Competitive
• Amount: €934/month + tuition waiver
• Percentage: 8-12% of Indian students

Eligibility for most scholarships:
• Academic excellence (8.5+ CGPA)
• Strong test scores (IELTS 7.5+, GMAT 700+, GRE 320+)
• Leadership experience, extracurricular activities
• Strong SOP and LOR
• Financial need (for some)

Application timeline:
• Start: 12-18 months before intended start
• Apply with: Academic records, test scores, SOP, LOR
• Decision: 2-4 months after application

Strategy:
• Apply to 5-8 universities with and without scholarships
• Apply to 2-3 specific scholarship programs
• Have backup self-funded options',
 3, true, '2a6a9e51-e874-4a3b-bc69-c8a2aa29e83c'::UUID, 'Scholarships for Indian students studying abroad', 0, 0, 0),

('550e8400-e29b-41d4-a716-446655440003'::UUID,
 'How do I choose between career options after studying abroad?',
 'Career Decision Framework Post-Study Abroad:

Step 1: Assess Your Priorities
• Immediate income vs. long-term growth
• Local country (stay abroad) vs. return to India
• Industry/sector alignment with degree
• Work-life balance preferences
• Immigration/PR goals
• Family considerations

Step 2: Evaluate Opportunities

Stay in Destination Country:
• Pros: Direct pathway to PR, better salaries, professional development
• Cons: Distance from family, cultural adjustment, competitive job market
• Best for: Tech, finance, research, healthcare professionals

Return to India:
• Pros: Family, familiar culture, entrepreneurship opportunities
• Cons: Lower salaries initially, limited PR/residency benefits
• Best for: Entrepreneurship, management, specialized technical roles

Hybrid Approach:
• Work abroad 2-3 years → Return to India with experience
• Benefits: Global experience, higher starting salary in India, network building

Step 3: Job Search Strategy

Destination Country Job Market:
1. LinkedIn networking and job applications
2. University career services and alumni network
3. Company internships → full-time conversion
4. Industry-specific job boards
5. Recruitment agencies
6. Informational interviews

Timeline:
• Start 3-6 months before graduation
• Active applications and networking
• Interviews during final semester
• Offer typically 2-3 months before graduation

Salary Expectations:
• USA: $60,000-100,000 starting
• UK: £25,000-40,000 starting
• Canada: CAD $50,000-70,000 starting
• Australia: AUD $55,000-75,000 starting
• Germany: €35,000-50,000 starting
• Ireland: €30,000-45,000 starting

Return to India:
• Salary: ₹8,00,000-25,00,000 LPA depending on industry
• Job search: 2-4 weeks with international experience
• Premium: 30-50% above domestic equivalent
• Roles: Senior roles, management, specialized positions

Step 4: Long-term Strategy
• 3-5 years abroad → Skill building, PR pathway, higher salary
• Return with: Global experience, certification, professional network
• Advantage: 50%+ salary advantage in India vs. domestic graduates

Success factors:
• Clear prioritization (money vs. family vs. growth)
• Flexibility (willingness to relocate, role changes)
• Continuous learning (upskilling throughout career)
• Network building (maintaining connections)
• Financial planning (savings, investments)',
 4, true, '2a6a9e51-e874-4a3b-bc69-c8a2aa29e83c'::UUID, 'Career options after studying abroad', 0, 0, 0),

('550e8400-e29b-41d4-a716-446655440003'::UUID,
 'What is the cost of living by country for Indian students?',
 'Annual Cost of Living for Indian Students (in INR & USD):

USA:
• Tuition: $25,000-70,000 (₹21,00,000-58,00,000)
• Accommodation: $9,000-15,000 (₹7,50,000-12,50,000)
• Food: $3,000-6,000 (₹2,50,000-5,00,000)
• Transport: $800-2,000 (₹66,000-1,66,000)
• Total: $38,000-93,000/year (₹31,00,000-77,50,000)

UK:
• Tuition: £18,000-45,000 (₹18,00,000-45,00,000)
• Accommodation: £6,000-10,000 (₹6,00,000-10,00,000)
• Food: £2,500-4,000 (₹2,50,000-4,00,000)
• Transport: £500-1,200 (₹50,000-1,20,000)
• Total: £27,000-60,000/year (₹27,00,000-60,00,000)

Canada:
• Tuition: CAD $18,000-35,000 (₹11,00,000-21,00,000)
• Accommodation: CAD $9,000-14,000 (₹5,50,000-8,50,000)
• Food: CAD $3,000-5,000 (₹1,80,000-3,00,000)
• Transport: CAD $1,000-1,500 (₹60,000-90,000)
• Total: CAD $31,000-56,000/year (₹18,50,000-33,50,000)

Ireland:
• Tuition: €12,000-30,000 (₹10,50,000-26,00,000)
• Accommodation: €7,000-11,000 (₹6,00,000-9,50,000)
• Food: €2,500-4,000 (₹2,15,000-3,45,000)
• Transport: €600-1,200 (₹51,000-1,03,000)
• Total: €22,000-46,000/year (₹19,00,000-39,70,000)

Australia:
• Tuition: AUD $20,000-50,000 (₹11,00,000-27,50,000)
• Accommodation: AUD $12,000-18,000 (₹6,60,000-9,90,000)
• Food: AUD $4,000-6,000 (₹2,20,000-3,30,000)
• Transport: AUD $1,000-2,000 (₹55,000-1,10,000)
• Total: AUD $37,000-76,000/year (₹20,35,000-41,80,000)

Germany:
• Tuition: €10,000-20,000 (₹8,60,000-17,20,000)
• Accommodation: €6,000-10,000 (₹5,15,000-8,60,000)
• Food: €2,000-3,500 (₹1,72,000-3,01,000)
• Transport: €500-1,000 (₹43,000-86,000)
• Total: €18,500-34,500/year (₹15,90,000-29,70,000)

New Zealand:
• Tuition: NZD $22,000-35,000 (₹11,00,000-17,50,000)
• Accommodation: NZD $10,000-16,000 (₹5,00,000-8,00,000)
• Food: NZD $3,500-5,500 (₹1,75,000-2,75,000)
• Transport: NZD $1,000-2,000 (₹50,000-1,00,000)
• Total: NZD $36,500-58,500/year (₹18,25,000-29,25,000)

Cost Ranking (Most to Least Expensive):
1. USA: ₹31,00,000-77,50,000/year
2. UK: ₹27,00,000-60,00,000/year
3. Australia: ₹20,35,000-41,80,000/year
4. Canada: ₹18,50,000-33,50,000/year
5. Ireland: ₹19,00,000-39,70,000/year
6. New Zealand: ₹18,25,000-29,25,000/year
7. Germany: ₹15,90,000-29,70,000/year

Budget Tips:
• Choose university town (lower rent than big cities)
• Part-time work: Covers 40-60% of living costs
• Scholarships: Reduce financial burden 30-50%
• Shared accommodation: Save 20-30% on rent
• Cook at home: Save 30-40% on food
• Use public transport: Save on daily costs

Estimated 2-Year Total (with scholarship 25%):
• USA: ₹58,50,000-1,46,50,000
• Germany: ₹30,00,000-56,20,000
• Ireland: ₹36,10,000-75,60,000
• Canada: ₹35,20,000-63,70,000',
 5, true, '2a6a9e51-e874-4a3b-bc69-c8a2aa29e83c'::UUID, 'Cost of living for Indian students by country', 0, 0, 0),

-- CATEGORY: APPLICATION & DOCUMENTS (4 FAQs)
('550e8400-e29b-41d4-a716-446655440004'::UUID,
 'What documents are needed for a student visa?',
 'Student Visa Documentation Checklist:

Universal Documents (All Countries):
1. Valid Passport (6+ months validity)
2. Visa application form (country-specific)
3. Passport-sized photos (4x6 cm, specific background)
4. University Acceptance Letter
5. Proof of financial support/sponsorship letter
6. Bank statements (last 6-12 months)
7. Sponsor details (parents, relatives)
8. Proof of accommodation (university/private)
9. Medical test results (if required)
10. Police clearance certificate

Academic Documents:
1. Bachelor''s degree/diploma certificates
2. Mark sheets (all years)
3. University transcript
4. School certificates (10th, 12th)
5. Character reference from previous institution
6. Curriculum vitae

English Language Proficiency:
1. IELTS or TOEFL score (original copy)
2. Test receipt/official documentation
3. Score validity confirmation

Financial Documents:
1. Bank statements (6-12 months)
2. Property documents (land, house)
3. Income tax returns (parents)
4. Employer''s letter (salary details)
5. Scholarship letter (if applicable)
6. Financial sponsorship affidavit
7. Gift deed (if funds are gifted)
8. Investment proof (stocks, bonds)

Country-Specific Documents:

USA:
• Form I-20 (from university)
• Proof of funds ($40,000-100,000 minimum)
• Social Security Number (if applicable)
• State police clearance

UK:
• CAS letter (Confirmation of Acceptance for Studies)
• TB test certificate
• Proof of funds (course fee + living expenses)
• Tuition fee payment receipt

Canada:
• Letter of Acceptance from DLI (Designated Learning Institution)
• Proof of funds (CAD equivalent for 2 years)
• Affidavit of financial support
• Police clearance certificate
• Medical exam (by panel physician)

Australia:
• eCoE (electronic Confirmation of Enrolment)
• Proof of financial capacity (AUD 20,000+ per year)
• English language proficiency
• Health insurance documentation
• Character certificate

Ireland:
• Acceptance Letter from university
• Proof of funds (€20,000+ per year)
• Accommodation proof
• Travel documents
• Employment history (if applicable)

Germany:
• Acceptance letter from university
• Proof of funds (€10,000 per year)
• English language proficiency (depends on program)
• Health insurance
• Blocked account or sponsorship letter

Document Timeline:
• 6 months before: Collect educational documents, organise finances
• 4 months before: Apply to universities, get acceptance
• 3 months before: Arrange sponsorship, collect bank documents
• 2 months before: Medical tests, police clearance
• 6-8 weeks before: Submit visa application
• 2-4 weeks: Visa processing
• Final week: Receive visa

Pro Tips:
• Get all documents attested/notarized
• Keep digital and physical copies
• Ensure all documents are recent (less than 6 months old)
• Follow country-specific document requirements exactly
• Translate documents if required (certified translation)
• Maintain document organization with checklist
• Submit complete applications (missing documents delay processing)',
 1, true, '2a6a9e51-e874-4a3b-bc69-c8a2aa29e83c'::UUID, 'Student visa documents and requirements checklist', 0, 0, 0),

('550e8400-e29b-41d4-a716-446655440004'::UUID,
 'What is a Statement of Purpose (SOP) and how to write it?',
 'Statement of Purpose (SOP) Guide:

What is an SOP?
A 250-500 word essay explaining:
• Why you want to study abroad
• Which program and university fit your goals
• How your background prepared you for this program
• What you plan to do after graduation
• Why you''re the ideal candidate

SOP Structure:

Paragraph 1: Academic Background & Motivation (80-100 words)
• Your educational journey and academic interests
• Why you chose your field of study
• Key academic achievements and milestones
• Specific incident that inspired this choice
• Example: "During my Bachelor''s degree in Commerce at [University], I discovered my passion for financial analysis while working on a project about portfolio management. This experience motivated me to pursue an MBA in Finance to deepen my expertise."

Paragraph 2: Program & University Selection (80-100 words)
• Why this specific program and university
• How it aligns with your career goals
• Specific courses, professors, or resources that attract you
• Research opportunities or campus features
• Example: "Your MBA program''s focus on fintech and investment analysis, combined with the experienced faculty and global network, makes it the perfect platform for my career aspirations. The internship partnerships with Fortune 500 companies align perfectly with my goal to work in investment banking."

Paragraph 3: Career Goals & Future Plans (80-100 words)
• Short-term goals (2-3 years post-graduation)
• Long-term goals (5-10 years)
• How the program supports these goals
• Contribution to your country/society
• Example: "After graduation, I aim to work with a leading financial institution in portfolio management for 3 years, gaining practical experience. Long-term, I aspire to establish my own investment firm in India, creating employment opportunities and promoting financial literacy among small business owners."

Paragraph 4: Personal Strengths & Conclusion (50-80 words)
• Unique qualities that make you suitable
• Determination and commitment
• Why you''ll be an asset to the program
• Closing statement expressing enthusiasm
• Example: "My strong analytical skills, dedication, and passion for finance make me committed to excelling in your program. I am eager to contribute to your diverse student community and leverage this education to create meaningful impact."

SOP Writing Tips:

DO''s:
• Be specific and authentic
• Highlight relevant achievements and skills
• Show genuine interest in the program
• Use professional, clear language
• Address potential concerns (low scores, career changes)
• Proofread multiple times
• Customize for each university
• Keep it concise (not exceeding word limit)
• Use active voice
• Tell a coherent story from past → present → future

DON''Ts:
• Copy templates or generic SOPs
• Include irrelevant personal details
• Exceed word count
• Use overly complex language
• Focus on university rankings alone
• Make spelling or grammatical errors
• Be too humble or overly confident
• Mention visa/immigration plans
• Criticize other universities or programs
• Include salary expectations

SOP Examples by Field:

MBA/Business:
Focus on: Business acumen, leadership experience, industry insights, financial goals, network value

Engineering:
Focus on: Technical projects, innovation, problem-solving skills, industry applications, research interests

Data Science:
Focus on: Data projects, analytical mindset, programming skills, business impact, innovation goals

Medical/Healthcare:
Focus on: Clinical experience, patient care, research interests, specialization goals, community contribution

Revision Checklist:
• Does it answer "Why this program, why now, why you?"
• Is it free of grammatical errors?
• Does it tell a compelling story?
• Is it customized for this university?
• Have you proofread 3+ times?
• Have you had someone review it?
• Is the tone professional and positive?

Timeline:
• Start writing: 3-4 months before application
• First draft: Allow 2-3 weeks
• Revisions: Get feedback from 2-3 people
• Final version: 1 week before submission
• Final check: Day before submission',
 2, true, '2a6a9e51-e874-4a3b-bc69-c8a2aa29e83c'::UUID, 'Statement of Purpose (SOP) writing guide for universities', 0, 0, 0),

('550e8400-e29b-41d4-a716-446655440004'::UUID,
 'What is a Letter of Recommendation (LOR) and how important is it?',
 'Letter of Recommendation (LOR) Guide:

What is an LOR?
A formal letter from an academic or professional recommender, typically 300-500 words, vouching for:
• Your academic capabilities
• Your character and work ethic
• Your potential for success
• Specific examples of your abilities
• Comparison with peer group
• Recommendation for admission

Importance of LOR:

Weight in Admissions:
• Typically 10-15% of admission decision
• Highly weighted at top universities (Harvard, MIT, Oxford, Cambridge)
• Less important for large state universities
• Varies by program and institution
• Strong LOR can overcome mediocre test scores

What Universities Look For:
• Honest, detailed assessment
• Specific examples and anecdotes
• Credibility of recommender
• Alignment with your goals
• Unique insights about your abilities
• Comparison with peer group
• Writing quality and professionalism

Who Should Write Your LOR?

Best Recommenders (in order of preference):
1. Academic professors (best option)
   - Know you well in academic setting
   - Can assess intellectual capability
   - Understand program requirements
   - Have credibility with universities

2. Research supervisors/project guides
   - Can speak to research abilities
   - Demonstrate project outcomes
   - Show technical competence
   - Valuable for MS/PhD programs

3. Internship supervisors
   - Can speak to work experience
   - Professional competence
   - Skills and impact
   - Valuable for MBA programs

4. Work supervisors/managers
   - Professional achievements
   - Leadership and team skills
   - Industry experience
   - Best for MBA/executive programs

Avoid:
• Family members
• Friends or relatives
• People who don''t know you well
• People in the same institution (for same program)
• Political figures or famous people who don''t know you
• Non-academic/professional contacts

How Many LORs Needed?

By Program:
• Bachelor''s: 2-3 LORs
• Master''s (MS/MA): 2-3 LORs, preferably academic
• MBA: 2-3 LORs, mix of academic and professional
• PhD: 3-4 LORs, preferably research supervisors
• Professional programs: 2-3 LORs, mix of academic and professional

Number vs. Quality:
• 2 excellent LORs > 4 mediocre LORs
• Quality matters more than quantity
• Focus on recommenders who know you best

How to Get Strong LORs:

Step 1: Choose Appropriate Recommenders (2-3 months before)
• Professors who taught you in major courses
• Professors who know you beyond grades
• Supervisors who can speak to relevant skills
• People who can write specific, detailed letters

Step 2: Request in Person (6-8 weeks before deadline)
• Meet with professor/supervisor in person
• Explain program and why you''re applying
• Discuss your goals and interests
• Ask if they can write a strong letter
• Never assume they''ll say yes

Step 3: Provide Information (6-8 weeks before deadline)
• Send email with deadline and submission process
• Attach copy of your CV/resume
• Attach copy of your SOP
• Share university details and submission portal
• Mention specific achievements or qualities to highlight
• Provide institutional email/form if applicable

Step 4: Follow Up (2 weeks before deadline)
• Send reminder 2 weeks before deadline
• One more gentle reminder 1 week before
• Thank them after they submit
• Update them on admission decisions

LOR Content Elements:

Strong LORs Include:
• Specific examples of your abilities
• Comparison with other students
• Your intellectual curiosity and engagement
• Evidence of hard work and dedication
• Relevant skills for your program
• Your character and interpersonal skills
• Specific achievements and contributions
• How you''ve grown over time
• Unique qualities that stand out
• Genuine recommendation and enthusiasm

Weak LORs Avoid:
• Generic praise without examples
• No comparison with peer group
• Obvious template use
• Grammatical errors or poor writing
• Irrelevant information
• Weak or non-committal language
• Negative or unclear recommendation
• Vague or unclear statements
• Excessive focus on grades alone
• Weak closing statement

LOR Timeline:

12 months before: Plan to request LORs
10-11 months before: Select 2-3 recommenders
8-10 weeks before deadline: Request LORs in person
6-8 weeks before deadline: Provide information to recommenders
2 weeks before deadline: First reminder
1 week before deadline: Final reminder
Day of deadline: Verify submission

Red Flags in LORs:

Universities notice:
• LORs submitted by student (suggests weak recommender)
• Template-like letters (generic language)
• LORs that contradict SOP
• Multiple LORs with identical language
• Negative or unenthusiastic recommendations
• LORs that focus on weaknesses
• Poor writing quality
• Delays in submission (submitted last moment)

Managing LOR Submission:

University Portals:
• Most universities use online portals
• Recommender receives direct link
• Submits directly to university
• You don''t see the letter (confidential)

Timeline:
• Provide link to recommender 6-8 weeks before
• Follow up 2 weeks before deadline
• Most recommenders submit 1-2 days before deadline
• Final reminder if not submitted 1 day before

Tips for Success:
• Build strong relationships with professors early
• Participate actively in class (stand out)
• Visit office hours and ask thoughtful questions
• Maintain communication with supervisors
• Thank recommenders genuinely
• Keep them updated on your progress
• Provide all necessary information upfront
• Give them adequate time (6-8 weeks minimum)

International Student Considerations:
• Recommenders understand requirements
• English language proficiency of letter is important
• Some universities want letters in English only
• Cultural differences in letter writing considered
• International recommenders equally valued
• Ensure letter format matches university requirements',
 3, true, '2a6a9e51-e874-4a3b-bc69-c8a2aa29e83c'::UUID, 'Letter of Recommendation (LOR) importance and tips', 0, 0, 0),

('550e8400-e29b-41d4-a716-446655440004'::UUID,
 'What are common mistakes in the application process?',
 'Common Study Abroad Application Mistakes:

1. Starting Application Too Late

Mistake:
• Starting 2-3 weeks before deadline
• Rushing through SOP and essays
• Last-minute document collection
• No time for LOR coordination
• Incomplete application submission

Impact:
• Careless errors in application
• Weak SOP and essays
• Missing or incomplete documents
• Late or missing LORs
• Automatic rejection at some universities

Prevention:
• Start 5-6 months before deadline
• Create application timeline
• Set internal deadlines 2 weeks before
• Gather documents 4 months ahead
• Request LORs 8 weeks before deadline

2. Poor Quality or Generic SOP

Mistake:
• Using template-based SOP
• Generic motivation statements
• No specific program research
• Doesn''t connect goals with program
• Poor writing and grammar
• Copy-paste from university website

Impact:
• Admission committee sees 500+ generic SOPs
• Application gets rejected
• Stands out negatively
• Shows lack of serious interest

Prevention:
• Write 3-4 versions customized per university
• Research program thoroughly
• Tell your personal story authentically
• Get feedback from multiple people
• Proofread 5+ times
• Have English teacher review
• Spend 2-3 weeks on SOP

3. Weak or Inappropriate LORs

Mistake:
• Asking someone who doesn''t know you well
• Requesting LOR from friend/family
• Not giving recommender enough information
• Forgetting to remind recommender
• Submitting generic LORs
• Asking recommender last minute

Impact:
• Weak letters with no specific examples
• Generic praise without substance
• Shows lack of genuine academic relationships
• Admission committee doubts credibility

Prevention:
• Request from professors who taught relevant courses
• Provide recommender with your SOP and CV
• Give 6-8 weeks minimum
• Remind 2 weeks and 1 week before
• Verify submission before deadline
• Build relationships with 3-4 strong recommenders

4. Ignoring Test Score Requirements

Mistake:
• Applying without meeting minimum scores
• Weak IELTS/TOEFL scores (below 6.5/79)
• Low GMAT/GRE scores (below 500/300)
• Taking test too late
• Retaking test without prep
• Submitting below-requirement scores

Impact:
• Automatic rejection at many universities
• Weak application overall
• Reduces scholarship chances
• May require conditional admission

Prevention:
• Check minimum requirements 12 months ahead
• Start test prep 4-6 months before
• Take test 2-3 times if needed
• Target scores 0.5-1 band above minimum
• Verify scores are within validity (2-5 years)
• Plan test dates in application timeline

5. Incomplete or Missing Documents

Mistake:
• Not collecting all required documents
• Outdated documents (older than 6 months)
• Missing transcripts or certificates
• Incomplete financial documents
• Missing notarization or certification
• Submitting poor quality scans

Impact:
• Application marked incomplete
• Missed submission deadline
• Automatic rejection at some universities
• Delays processing
• May be unable to apply later

Prevention:
• Create document checklist per university
• Collect 4-5 months before deadline
• Verify document requirements multiple times
• Get documents attested/notarized
• Maintain copies (physical and digital)
• Scan high-quality documents
• Submit all documents 1 week early

6. Financial Document Issues

Mistake:
• Insufficient proof of funds
• Out-dated bank statements
• Vague or unclear sponsorship
• Mismatched sponsor details
• Weak financial documentation
• Not accounting for full costs

Impact:
• Visa rejection or extension denied
• Need for additional financial proof
• Delays in visa processing
• May need to reapply

Prevention:
• Research full costs (tuition + living)
• Ensure funds for 1-2 years minimum
• Provide recent bank statements (2-3 months)
• Clear sponsorship documentation
• Sponsor details match in all documents
• Have additional proof ready
• Consult financial advisor if needed

7. Visa Application Mistakes

Mistake:
• Applying for visa too late
• Incomplete visa application
• Wrong visa category
• Insufficient supporting documents
• Inconsistent information across forms
• Visa interview unprepared

Impact:
• Visa rejection
• Missed university start date
• Application need to reapply (6-12 month wait)
• Travel plans disrupted

Prevention:
• Apply visa immediately after admission
• Verify visa requirements and timeline
• Double-check visa category
• Gather all required documents
• Ensure consistency across all forms
• Prepare for visa interview (practice Q&A)
• Start visa process 8-12 weeks before start date

8. Application Portal and Submission Errors

Mistake:
• Wrong application portal/link
• Incomplete form submission
• Incorrect file formats (PDF vs. DOC)
• File size too large
• Name mismatch across documents
• Submitting after deadline

Impact:
• Application not received
• Cannot process submission
• Marked as incomplete
• Automatic rejection

Prevention:
• Carefully verify application portal/link
• Download official documents and links
• Test file uploads ahead of time
• Use consistent name across all documents
• Submit 1-2 days before deadline
• Verify submission confirmation
• Keep submission receipt

9. Ignoring University-Specific Requirements

Mistake:
• Generic application for all universities
• Ignoring specific essay prompts
• Wrong format or structure
• Missing supplementary documents
• Ignoring word limits
• Not following specific instructions

Impact:
• Automatic rejection for not following instructions
• Shows lack of attention to detail
• Viewed as lazy or not serious
• Wastes application fee

Prevention:
• Read instructions 3-4 times carefully
• Customize every application
• Follow format/structure exactly
• Answer all prompts completely
• Adhere to word limits strictly
• Gather all supplementary documents
• Check university website multiple times

10. Weak Profile Management

Mistake:
• Poor GPA throughout college
• No extracurricular activities
• No work experience or internships
• No relevant skills or certifications
• No leadership or volunteer experience
• Building profile last-minute

Impact:
• Weak overall application
• Rejected despite high test scores
• Lower scholarship opportunities
• Reduced admission chances

Prevention:
• Start profile building in 1st year of college
• Maintain strong GPA (8.5+ CGPA)
• Participate in 2-3 relevant clubs/activities
• Intern during summers (relevant to field)
• Develop relevant skills (language, technical)
• Volunteer or community service
• Build leadership experience gradually

Pre-Application Checklist:

1 Month Before:
☐ Verify all requirements for target universities
☐ Finalize test scores and dates
☐ Complete SOP with feedback
☐ Collect all documents

2 Weeks Before:
☐ Create user accounts on all portals
☐ Review application questions one more time
☐ Verify all document requirements
☐ Double-check LOR submission

1 Week Before:
☐ Submit all applications with review
☐ Verify submission confirmations
☐ Prepare backup documents

Day of Deadline:
☐ Final verification
☐ One last check of everything
☐ Submit with time to spare (not last minute)',
 4, true, '2a6a9e51-e874-4a3b-bc69-c8a2aa29e83c'::UUID, 'Common mistakes in study abroad applications', 0, 0, 0);

-- ============================================================================
-- STEP 3: Verification Query
-- ============================================================================

-- Count inserted FAQs by category
SELECT 
  c.name as category,
  COUNT(f.id) as faq_count
FROM faqs f
JOIN faq_categories c ON f.category_id = c.id
GROUP BY c.id, c.name
ORDER BY c.display_order;

-- Show all FAQs with their categories
SELECT 
  f.id,
  c.name as category,
  f.question,
  SUBSTRING(f.answer, 1, 50) || '...' as answer_preview,
  f.display_order,
  f.is_published,
  f.created_by
FROM faqs f
JOIN faq_categories c ON f.category_id = c.id
ORDER BY c.display_order, f.display_order;
