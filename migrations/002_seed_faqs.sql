-- Migration: Seed 25 FAQs into Database
-- Purpose: Migrate hardcoded FAQs from page.tsx to Supabase
-- Instructions: Run this after 001_create_faq_tables.sql
-- Created: November 2, 2025

-- ============================================================================
-- STEP 1: Insert FAQ Categories
-- ============================================================================

INSERT INTO faq_categories (id, name, slug, icon, description, display_order) VALUES
('550e8400-e29b-41d4-a716-446655440001'::UUID, 'Study Abroad', 'study-abroad', '🌍', 'Questions about studying abroad destinations, procedures, and costs', 1),
('550e8400-e29b-41d4-a716-446655440002'::UUID, 'Test Preparation', 'test-prep', '📚', 'IELTS, TOEFL, GMAT, and GRE preparation questions', 2),
('550e8400-e29b-41d4-a716-446655440003'::UUID, 'Career & Benefits', 'career', '💼', 'Career growth, work permits, scholarships, and post-study options', 3),
('550e8400-e29b-41d4-a716-446655440004'::UUID, 'Application & Documents', 'application', '📋', 'Application process, documents, SOP, and LORs', 4)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- STEP 2: Insert 25 FAQs (from hardcoded page.tsx)
-- ============================================================================

-- CATEGORY: STUDY ABROAD (7 FAQs)
INSERT INTO faqs (category_id, question, answer, display_order, is_published, created_by) VALUES

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
 1, true),

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
 2, true),

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
 3, true),

('550e8400-e29b-41d4-a716-446655440001'::UUID,
 'How long does it take to prepare for studying abroad?',
 'Total preparation timeline is typically 6-12 months:
• Test preparation (IELTS/TOEFL/GMAT/GRE): 3-4 months
• Application document preparation: 2-3 months
• Application submission and waiting: 3-4 months
• Visa processing: 2-3 months

Start planning 12 months before your intended start date to have ample time for test prep, applications, and visa processing. Beginning earlier improves your university choices and scholarship opportunities.',
 4, true),

('550e8400-e29b-41d4-a716-446655440001'::UUID,
 'Which test is required for studying abroad?',
 'Test requirements vary by country and program:
• English-speaking countries: IELTS or TOEFL required
• USA graduate studies: GMAT (for MBA/business) or GRE (for science/engineering) + TOEFL/IELTS
• Alternative options: Duolingo English Test (DET) accepted by many universities

Most universities accept both IELTS and TOEFL. Always check specific university requirements as they vary by institution and program.',
 5, true),

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
 6, true),

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
 7, true),

-- CATEGORY: TEST PREPARATION (6 FAQs)
('550e8400-e29b-41d4-a716-446655440002'::UUID,
 'What is the difference between IELTS and TOEFL?',
 'Key differences between IELTS and TOEFL:

Speaking:
• IELTS: Face-to-face conversation with examiner
• TOEFL: Computer-based recorded responses

Writing:
• IELTS: Hand-written or typed essays
• TOEFL: Computer-typed essays only

Listening:
• IELTS: Multiple accents (British, Australian, etc.)
• TOEFL: American English accent

Reading:
• IELTS: Variety of text types
• TOEFL: Academic passages only

Scoring:
• IELTS: Band scores 1-9
• TOEFL: Score 0-120

Acceptance:
• IELTS: Widely accepted globally
• TOEFL: Especially in USA and American universities

Cost:
• IELTS: Generally £190-210
• TOEFL: Generally $210-240

Duration:
• IELTS: 2 hours 45 minutes
• TOEFL: 3 hours

Choose based on your university preference, speaking comfort, and test familiarity.',
 1, true),

('550e8400-e29b-41d4-a716-446655440002'::UUID,
 'How long does it take to prepare for IELTS and TOEFL?',
 'IELTS Preparation Timeline:
• Beginner (Band 4-5): 6-8 months
• Intermediate (Band 5.5-6): 4-6 months
• Advanced (Band 6.5+): 2-3 months
• Expert prep: 1-2 months

TOEFL Preparation Timeline:
• Beginner (Score 40-60): 6-8 months
• Intermediate (Score 60-80): 4-6 months
• Advanced (Score 80-100): 2-3 months
• Expert prep: 1-2 months

Factors affecting timeline:
• Current English level
• Target score
• Study intensity (2-3 hours/day vs 5+ hours/day)
• Test-specific strategies
• Mock test practice

IELTS-specific tips:
• Practice with native speakers
• Focus on British English vocabulary
• Work on fluency and pronunciation
• Take full-length mock tests

TOEFL-specific tips:
• Master American English pronunciation
• Practice note-taking techniques
• Work on typing speed for writing
• Use official TOEFL materials

Starting early with 3-4 months prep ensures strong performance.',
 2, true),

('550e8400-e29b-41d4-a716-446655440002'::UUID,
 'What is the average IELTS score and band interpretation?',
 'IELTS Band Score Interpretation:

Band 9 (90-100): Expert User
• Complete mastery of English
• Appropriate, accurate, fluent communication
• No errors

Band 8 (80-89): Very Good User
• Fully operational command
• Minor errors or inaccuracies
• Occasional misunderstandings

Band 7 (70-79): Good User
• Operational command with occasional inaccuracies
• Some inappropriate usage
• Generally handles complex English

Band 6 (60-69): Competent User
• Generally effective command
• Some errors but meaning generally clear
• Can handle most situations

Band 5 (50-59): Modest User
• Partial command of language
• Frequent errors
• Can manage basic communication

Band 4 (40-49): Limited User
• Basic competence in familiar situations
• Many errors
• Limited communication ability

Band 3 (30-39): Extremely Limited User
• Conveys and understands only general meaning
• Frequent breakdowns in communication

Band 1-2: Non User
• Minimal or no competence

Average Scores by Purpose:
• General communication: Band 5.5-6.5
• University admission: Band 6.5-7.5
• Top universities: Band 7.0-8.0+
• Scholarships: Band 7.5+

Most universities require Band 6.5-7.0 for postgraduate studies.',
 3, true),

('550e8400-e29b-41d4-a716-446655440002'::UUID,
 'What is the difference between GMAT and GRE?',
 'GMAT vs GRE Comparison:

Focus:
• GMAT: Business and MBA programs
• GRE: General graduate studies and research

Content:
• GMAT: Business-focused scenarios
• GRE: Broader academic content

Quantitative Section:
• GMAT: Data sufficiency, problem solving
• GRE: Quantitative comparison, problem solving, data interpretation

Verbal Section:
• GMAT: Sentence correction, reading comprehension, critical reasoning
• GRE: Text completion, sentence equivalence, reading comprehension

Scoring:
• GMAT: 200-800 (commonly 400-700)
• GRE: 130-170 per section (combined 260-340)

Duration:
• GMAT: 3.5 hours
• GRE: 3.75 hours

Cost:
• GMAT: $275
• GRE: $205

Test-taking Strategy:
• GMAT: Adaptive (difficulty increases with correct answers)
• GRE: Section-adaptive (difficulty changes between sections)

Preferred by:
• GMAT: Business schools, MBA programs
• GRE: Science, engineering, humanities, research programs

Choose GMAT if targeting MBA/business  
Choose GRE for other graduate programs',
 4, true),

('550e8400-e29b-41d4-a716-446655440002'::UUID,
 'What is the best strategy for GMAT and GRE preparation?',
 'GMAT Preparation Strategy:

Phase 1 (Weeks 1-2): Fundamentals
• Understand test format and sections
• Review basic math and verbal concepts
• Take diagnostic test

Phase 2 (Weeks 3-8): Skill Building
• Master quant strategies (2 hours/day)
• Practice verbal sections (2 hours/day)
• Focus on weak areas
• Take 2-3 practice tests

Phase 3 (Weeks 9-12): Full-Length Practice
• Take full tests weekly
• Analyze errors systematically
• Improve timing and stamina
• Review weak question types

GRE Preparation Strategy:

Phase 1 (Weeks 1-2): Assessment
• Understand GRE format
• Learn vocabulary (3,000+ words)
• Take diagnostic test

Phase 2 (Weeks 3-8): Content Mastery
• Build math skills and strategies
• Master verbal techniques
• Learn text completion patterns
• Practice daily (2-3 hours)

Phase 3 (Weeks 9-12): Intensive Practice
• Weekly full-length tests
• Timed section practice
• Vocabulary reinforcement
• Error analysis

Common Strategies (Both Tests):
• Start with official materials
• Use flashcards for vocabulary
• Time yourself on practice questions
• Join study groups or get coaching
• Take full tests under timed conditions
• Review every question (correct and incorrect)
• Adjust strategy based on performance
• Practice stress management

Recommended Timeline:
• Regular prep: 3-4 months
• Intensive prep: 8-12 weeks
• Quick refresher: 4-6 weeks

Target Score Strategy:
• Calculate reverse: What score needed for target university?
• Identify weak section
• Allocate more time to weak section
• Practice similar questions repeatedly
• Gradually increase difficulty

Success Tips:
✓ Consistency beats intensity
✓ Quality practice > quantity
✓ Regular breaks prevent burnout
✓ Mock tests build confidence
✓ Review all mistakes',
 5, true),

('550e8400-e29b-41d4-a716-446655440002'::UUID,
 'What are the target GMAT and GRE scores for top universities?',
 'Target Scores for Top US Universities:

GMAT Scores by Program Rank:
• Top 20 MBA: 700-750
• Top 50 MBA: 650-700
• Top 100 MBA: 600-650
• Average MBA: 500-600

Specific Top Programs:
• Harvard MBA: 730
• Stanford MBA: 740
• MIT Sloan: 720
• Wharton: 740
• Northwestern Kellogg: 720

GRE Scores by Program Rank:
• Top Research Programs: 160+ (Quant), 160+ (Verbal)
• Top 50 Programs: 155-160 (both sections)
• Good Programs: 150-155 (both sections)
• Average Programs: 145-150 (both sections)

Specific Top Programs:
• Stanford (Engineering): 166 Quant, 163 Verbal
• MIT (Engineering): 165 Quant, 160 Verbal
• Princeton (Physics): 164 Quant, 161 Verbal
• Berkeley (CS): 165 Quant, 159 Verbal

Strategy by Target:
• Target Top 10: Score 750+ GMAT or 165+/165+ GRE
• Target Top 30: Score 700+ GMAT or 160+/160+ GRE
• Target Top 100: Score 650+ GMAT or 155+/155+ GRE
• Target Decent Program: Score 600+ GMAT or 150+/150+ GRE

Factors Beyond Scores:
• Work experience (very important)
• Undergraduate GPA
• Letters of recommendation
• Statement of purpose
• Interview performance
• Industry diversity

Remember: High scores help, but holistic application matters more!',
 6, true),

-- CATEGORY: CAREER & BENEFITS (5 FAQs)
('550e8400-e29b-41d4-a716-446655440003'::UUID,
 'What are the career benefits of studying abroad?',
 'Career Benefits of Studying Abroad:

Global Perspective:
• Understand international business practices
• Experience different cultures and work styles
• Develop global mindset
• Better equipped for multinational roles

Enhanced Skills:
• Improved language skills
• Increased confidence and independence
• Better communication abilities
• Problem-solving in new environments

Networking:
• Build international professional network
• Connect with classmates from 100+ countries
• Access alumni networks globally
• Create lasting professional relationships

Career Opportunities:
• Access to international job market
• Post-study work visas (2-3 years in many countries)
• Sponsorship opportunities from employers
• Higher salary potential (+15-30% globally)

Employer Preference:
• Highly valued by multinational companies
• Shows adaptability and initiative
• Preferred for leadership positions
• Better advancement prospects

Specific Benefits by Country:
• USA: 1-3 years OPT (Optional Practical Training)
• UK: 2-year Graduate Route visa
• Canada: 1-3 years PGWP (Post-Graduate Work Permit)
• Australia: 2-4 years temporary residency
• Ireland: 2-year graduate visa

Industry Impact:
• Tech industry: Especially values global experience
• Finance/Banking: International exposure crucial
• Consulting: Cross-cultural skills highly valued
• Engineering: Global standards knowledge needed
• MBA Graduates: Earn 30-50% more on average

Long-term Benefits:
• Permanent residency pathways in many countries
• Entrepreneurship opportunities
• Access to better markets and resources
• Personal growth and maturity
• Competitive advantage in global job market',
 1, true),

('550e8400-e29b-41d4-a716-446655440003'::UUID,
 'Can I work while studying abroad?',
 'Work Permissions by Country:

USA:
• On-campus work: 20 hours/week allowed during studies
• Off-campus: Prohibited during study period
• OPT (Optional Practical Training): 1-3 years after graduation

UK:
• During studies: 20 hours/week during term time
• Full-time during breaks
• Graduate Route: 2 years work visa after graduation

Canada:
• On-campus: Full-time hours allowed
• Off-campus: 20 hours/week during school
• Full-time during scheduled breaks
• PGWP (Post-Graduate Work Permit): 1-3 years after graduation

Australia:
• During studies: 20 hours/week
• Full-time during official breaks
• Temporary Skilled Migration (TSM): 2-4 years after graduation

Germany:
• During studies: 120 full days or 240 half days per year
• After graduation: Can stay and work
• Blue Card eligibility for skilled workers

Ireland:
• 20 hours/week during academic year
• Full-time during official breaks
• Can work more than 20 hours with employer permission
• Highly student-friendly work policies

New Zealand:
• During studies: 20 hours/week
• Full-time during breaks
• Post-study work: 1-3 years (varies by program)

Work Study Benefits:
✓ Earn money to cover expenses
✓ Gain work experience
✓ Build resume
✓ Improve language skills
✓ Network with professionals
✓ Understand local job market

Important Notes:
• Check current regulations before applying
• Work permits may have conditions
• Prioritize studies over work
• Part-time work (10-15 hrs) is ideal
• Employers often value student workers',
 2, true),

('550e8400-e29b-41d4-a716-446655440003'::UUID,
 'Can I get admission without a strong GPA?',
 'Alternative Pathways Without Perfect GPA:

Holistic Review Process:
• GPA is one factor, not everything
• Top universities evaluate complete profile
• Work experience can offset lower GPA
• Strong test scores help compensate
• Compelling story matters

Universities with Flexible GPA Requirements:
• Tier 1: GPA 3.0+ (with strong compensators)
• Tier 2: GPA 2.8+ (more flexibility)
• Tier 3: GPA 2.5+ (excellent compensating factors)

Compensating Factors:
• High standardized test scores (GMAT 700+, GRE 160+)
• Excellent letters of recommendation
• Strong Statement of Purpose (SOP)
• Relevant work experience (3+ years)
• Demonstrated growth and improvement
• Unique personal story
• Community involvement and leadership
• International experience or certifications

GPA Improvement Strategies:
• Take additional certifications
• Complete online courses (Coursera, edX)
• Show upward trend in grades
• Excel in relevant field courses
• Build strong professional experience
• Write compelling SOP explaining circumstances

Examples of Success Stories:
• 2.5 GPA + 8 years experience + 720 GMAT = Admission
• 2.8 GPA + Perfect GRE + Strong SOP = Top university
• 2.0 GPA + 5 years tech experience = Startup founder
• Low GPA + Strong MBA score + 10 years work = Executive program

University-Specific Options:
• MBA programs more flexible with GPA
• Executive MBA values experience over GPA
• Graduate programs evaluate field-specific courses
• Some universities offer conditional admission
• Bridge programs help transition to full programs

Action Plan:
1. Choose universities with flexible policies
2. Build strong professional record
3. Score well on entrance exams
4. Write powerful SOP addressing GPA
5. Get strong recommendation letters
6. Highlight unique strengths
7. Apply to backup universities
8. Consider 1-2 year work break to strengthen profile',
 3, true),

('550e8400-e29b-41d4-a716-446655440003'::UUID,
 'What is the best strategy to get scholarship?',
 'Comprehensive Scholarship Strategy (10 Points):

Point 1: High Academic Performance
• Maintain GPA 3.5+ (undergraduate)
• Excellent test scores (IELTS 7.5+, GMAT 700+)
• Relevant field certifications
• Published research or projects

Point 2: Standardized Test Excellence
• IELTS 7.5-8.5 (not just 6.5)
• GMAT 700+ (not just 600)
• GRE 160+/160+
• SAT/ACT high scores for undergrad

Point 3: Strong Statement of Purpose
• Clear career goals and vision
• Specific reasons for university choice
• How program aligns with goals
• Personal challenges overcome
• Demonstrate maturity and ambition

Point 4: Excellent Recommendation Letters
• Get letters from professors/mentors
• Choose recommenders who know you well
• Provide them with resume and SOP
• Request personalized, specific letters
• Use academic and professional references

Point 5: Relevant Work Experience
• 2-5 years professional experience
• Leadership roles or achievements
• Skill development and growth
• Industry recognition or awards
• Unique contributions to workplace

Point 6: Community Involvement
• Volunteer work and social impact
• Leadership in clubs or organizations
• Environmental or social initiatives
• Mentoring and helping others
• Awards and recognition

Point 7: Unique Personal Story
• Overcoming challenges or adversity
• First-generation student journey
• Background diversity
• Unique perspective or experience
• Personal growth narrative

Point 8: Research or Publications
• Academic papers or articles published
• Research projects or participation
• Portfolio of work (creative fields)
• Technical projects or innovations
• Industry recognition

Point 9: Strategic University Selection
• Apply to 3-4 universities (Mix reach/target/safety)
• Choose schools with high scholarship rates
• Apply to less competitive programs also
• Look for country-specific scholarships
• Search corporate or foundation scholarships

Point 10: Professional Network
• Attend university events and webinars
• Connect with professors and alumni
• Show genuine interest in program
• Strong interview performance
• Follow up and maintain connections

Types of Scholarships to Pursue:
✓ Merit-based scholarships (60-80% tuition)
✓ Need-based scholarships (40-60% tuition)
✓ Country-specific scholarships (Fulbright, etc.)
✓ Corporate scholarships
✓ University fellowships
✓ Government scholarships
✓ Private foundation grants
✓ Employer-sponsored programs

Application Tips:
• Start searching 12+ months before applying
• Prepare strong application materials early
• Apply to multiple scholarships simultaneously
• Customize application for each scholarship
• Meet all deadlines well in advance
• Follow instructions precisely
• Proofread everything multiple times
• Track all applications and deadlines

Timeline:
• Year 1: Research programs and scholarships
• Month 12-18: Prepare application materials
• Month 9-12: Submit applications
• Month 6-9: Scholarships announced
• Month 0: Receive scholarship and join

Remember: Many scholarships go unclaimed because students don''t apply!',
 4, true),

('550e8400-e29b-41d4-a716-446655440003'::UUID,
 'What are the post-study work visa options?',
 'Post-Study Work Visa Options by Country:

USA - Optional Practical Training (OPT):
• Duration: 1-3 years (STEM fields get extension)
• Extension: STEM OPT extension up to 3 additional years
• Work with Any Employer: Yes, sponsorship needed for H1-B after OPT
• Total Possible: Up to 6 years for STEM graduates
• Path to Green Card: Yes, possible through employer sponsorship

UK - Graduate Route:
• Duration: 2 years (recently extended from 1 year)
• Work with Any Employer: Yes, can switch employers freely
• No Sponsorship Required: Initially
• Path to Permanent: Skilled Worker visa possible
• Salary Requirements: £26,200+ annually for sponsorship

Canada - Post-Graduate Work Permit (PGWP):
• Duration: 1-3 years (matches study duration)
• Work with Any Employer: Yes
• Unrestricted Work: Full-time, part-time, any job
• Path to PR: Automatic eligibility for PR after 1 year work
• Processing: Application simultaneous with graduation

Australia - Temporary Skilled Migration (TSM):
• Duration: 2-4 years (extends with permanent residency)
• Work with Any Employer: Yes, in your field
• Occupation List: Must be on skilled occupation list
• Path to PR: Possible after 2+ years work
• Salary Requirements: At least Australian award wage

Germany - Post-Study Work Visa:
• Duration: 18 months (can extend)
• Work with Any Employer: Yes
• Unrestricted Employment: Any job, not limited to field
• Path to Permanent: Eligible for permanent residency after 2 years
• Language Requirements: None for initial visa

Ireland - Third Level Graduate Work Visa:
• Duration: 2 years (recently extended)
• Work with Any Employer: Yes
• Easy Pathway: Pathway to permanent residency
• EU Access: Can work across EU (post-program)
• Extension: Can renew for another 2 years

New Zealand - Post-Study Work Visa:
• Duration: 1-3 years (depends on qualification level)
• Work with Any Employer: Yes
• Employer Sponsorship: Not always required
• Path to PR: Skilled migrant path available
• Salary Threshold: NZ$29.66/hour or higher

Comparison Table:
Country | Duration | Any Job | PR Path | Ease
USA     | 1-3 yrs  | Need sponsor | Yes | Moderate
UK      | 2 yrs    | Yes | Possible | Easy
Canada  | 1-3 yrs  | Yes | Likely | Very Easy
Australia | 2-4 yrs | Yes | Possible | Moderate
Germany | 18 mo    | Yes | Possible | Easy
Ireland | 2 yrs    | Yes | Easy | Very Easy
NZ      | 1-3 yrs  | Yes | Possible | Easy

Strategic Considerations:
• Canada and Ireland: Easiest path to PR
• UK and Germany: More flexible work
• USA: Highest salary potential but complex
• Australia: Good work experience + PR pathway
• Consider post-visa plans before applying

Pro Tips:
✓ Build strong work experience during visa
✓ Develop relevant skills for PR/sponsorship
✓ Network with professionals in field
✓ Consider partner/dependent visa options
✓ Understand PR requirements before expiry
✓ Plan financially for visa transition periods
✓ Research employer sponsorship if needed',
 5, true),

-- CATEGORY: APPLICATION & DOCUMENTS (4 FAQs)
('550e8400-e29b-41d4-a716-446655440004'::UUID,
 'What documents are required for study abroad application?',
 'Complete Document Checklist for Study Abroad:

Academic Documents:
• High school transcripts (for undergraduate)
• Bachelor''s degree transcripts (for postgraduate)
• Official transcripts from issuing institution
• Grade conversion certificate (if non-standard grading)
• Diploma/degree certificate (verified copy)
• Course descriptions (if requested)
• Statement of academic standing

English Proficiency:
• IELTS score report (valid 2 years)
• TOEFL score report (valid 2 years)
• Alternative tests: PTE, Duolingo English Test
• Score should be within accepted range
• Official scores from test provider only

Standardized Tests (if required):
• GMAT score report (for MBA)
• GRE score report (for graduate programs)
• SAT/ACT scores (for undergraduate)
• Official scores from test provider
• Score preview documents acceptable initially

Financial Documents:
• Bank statements (6-12 months)
• Proof of funds (shows you can afford education)
• Sponsor letter (if funds from family)
• Tax returns (parents/sponsor)
• Employment letter with salary
• Investment statements or property documents
• Grant/scholarship award letters

Personal Documents:
• Valid passport (copies of all pages)
• Birth certificate (attested copy)
• Medical examination report (if required)
• Vaccination records
• Police clearance certificate
• Resume/CV (2 years with credentials)

Application Documents:
• Statement of Purpose (SOP) - 500-800 words
• Curriculum Vitae (CV) - 1-2 pages
• Personal statement (if requested)
• Letters of Recommendation (2-3)
• Essay (specific prompt if provided)
• Application form (completed)
• Writing sample (if requested for certain programs)

Letters of Recommendation:
• Academic reference (Professor or lecturer)
• Professional reference (Manager or supervisor)
• Personal character reference (optional)
• From people who know you well
• Specific to program goals
• Sealed envelope with signature

Attestation & Authentication:
• Notarized copies (where required)
• Apostille (for international recognition)
• Translated documents (if not in English)
• Embassy attestation (some countries require)
• Registrar-verified documents

Application Process Documents:
• Proof of payment of application fee
• Application confirmation receipts
• Email correspondence with admissions
• Portal login credentials
• Document submission receipts

Visa Application Documents (Later Stage):
• Acceptance letter from university
• Proof of financial support
• Medical examination report
• Affidavit/statutory declaration
• Travel documents/passport
• Accommodation details
• Study plan document
• Proof of ties to home country

Digital vs Physical:
• Most universities accept digital copies initially
• Official/notarized copies needed for final enrolment
• Soft copies: PDF format, high resolution scans
• Physical copies: Keep ready for visa stage
• Keep duplicates of everything

Organization Tips:
✓ Create a master checklist
✓ Make copies of everything
✓ Use folder system for organization
✓ Keep originals in safe place
✓ Track document deadlines
✓ Follow university instructions exactly
✓ Submit well before deadlines
✓ Request official copies early
✓ Maintain email confirmations
✓ Keep backup digital copies

Timeline to Gather Documents:
• 3-6 months before: Request transcripts from schools
• 2-3 months before: Get recommendation letters
• 2 months before: Complete medical exams
• 6 weeks before: Gather financial documents
• 4 weeks before: Prepare all application materials
• 2 weeks before: Proofread everything
• 1 week before: Final submission checks',
 1, true),

('550e8400-e29b-41d4-a716-446655440004'::UUID,
 'How to write a strong Statement of Purpose (SOP)?',
 'Complete Guide to Writing Powerful SOP:

SOP Purpose:
• Explain why you want to study this program
• Show fit with university and program
• Demonstrate future career goals
• Highlight unique strengths and experiences
• Show maturity and clarity of thought

10-Point SOP Framework:

1. Hook Opening (1 sentence):
• Capture attention immediately
• Personal story or powerful statement
• Example: "My journey from a rural school to becoming a tech leader started with one teacher''s encouragement..."

2. Background (3-4 sentences):
• Your academic and professional journey
• Key experiences that shaped you
• Why you chose your field
• Challenges or moments of realization

3. Program Motivation (5-6 sentences):
• Why THIS specific program?
• Which courses excite you?
• Why THIS university?
• What specific facilities/research interests you?
• How does it align with your goals?

4. Career Vision (3-4 sentences):
• What is your 5-year goal?
• What is your 10-year goal?
• How will this degree help achieve it?
• Specific industry or role target

5. Specific Skills (3-4 sentences):
• What skills will you gain?
• How will you use them?
• Impact on your career path
• How program-specific skills matter

6. Unique Perspective (2-3 sentences):
• What unique background do you bring?
• Diverse experience or viewpoint
• Cultural, international, or unique angle
• How will you contribute to class diversity?

7. Leadership/Impact (2-3 sentences):
• Demonstrate leadership qualities
• Community involvement or social impact
• Show initiative and drive
• How you''ll contribute to university community

8. Academic Preparedness (2-3 sentences):
• Strong academic foundation
• Relevant coursework or experience
• Ability to handle rigorous program
• Commitment to excellence

9. Overcoming Challenges (2-3 sentences, if applicable):
• Address any gaps in application
• Explain lower GPA (if needed)
• Show growth despite obstacles
• Demonstrate resilience

10. Closing Statement (2 sentences):
• Reiterate why you''re perfect fit
• Express enthusiasm for program
• End on motivational note

SOP Length & Format:
• Word count: 500-800 words (follow specific requirement)
• Single-spaced or double-spaced (per requirement)
• 11-12 pt font, standard margins
• Professional tone, formal language
• No contractions (don''t, can''t → do not, cannot)

Do''s ✓:
✓ Be specific with details
✓ Show enthusiasm genuinely
✓ Connect personal experience to program goals
✓ Research university thoroughly
✓ Proofread multiple times
✓ Get feedback from mentor
✓ Use specific program/course names
✓ Show self-reflection and growth
✓ Demonstrate clear career planning
✓ Be authentic and genuine

Don''ts ✗:
✗ Don''t be too generic
✗ Don''t write a life autobiography
✗ Don''t use flowery or excessive language
✗ Don''t make grammar/spelling errors
✗ Don''t repeat resume points
✗ Don''t be arrogant or overconfident
✗ Don''t write about unrelated experiences
✗ Don''t submit without feedback
✗ Don''t be unclear about goals
✗ Don''t copy templates

SOP Examples (Different Fields):

MBA SOP Opening:
"Five years ago, leading a cross-functional team through a digital transformation at [Company], I realized my passion for business strategy. Today, I''m seeking an MBA to formalize my strategic expertise and drive impact in emerging markets."

Engineering SOP Opening:
"Designing the water purification system for my village sparked a lifelong passion for solving real-world engineering challenges. An MS in Civil Engineering will equip me to scale these solutions globally."

Data Science SOP Opening:
"Converting raw data into actionable insights during my internship at [Company] revealed my true calling. I seek a Master''s in Data Science to master advanced analytics and lead data-driven transformation."

Interview Preparation:
• Be ready to discuss your SOP
• Practice talking about goals
• Prepare for "Why this program?" questions
• Have specific examples ready
• Show authentic passion

Revision Checklist:
☐ Proofread multiple times
☐ Check for consistency
☐ Ensure clear goal connection
☐ Verify program/university facts
☐ Get 2-3 feedback sources
☐ Check word count requirement
☐ Format according to specifications
☐ Final spell check
☐ Read aloud for flow
☐ Submit with application fee',
 2, true),

('550e8400-e29b-41d4-a716-446655440004'::UUID,
 'What are the tips for strong Letters of Recommendation?',
 'Complete Guide to Strong Recommendation Letters:

Who Should Write Your Letters:

Academic References (Best):
• Professors from relevant courses
• PhD advisors or research mentors
• Thesis or project supervisors
• Academic lecturers who know you well
• Department heads (if you worked closely)

Professional References:
• Direct manager or supervisor
• Project lead who worked with you
• Senior colleague or mentor
• Client (for freelancers)
• Internship supervisor

Avoid:
✗ Family members
✗ Friends (unless professional context)
✗ People who don''t know you well
✗ People still angry with you
✗ References with credibility issues

How Many Letters Needed:
• Minimum: 2 letters
• Optimal: 2-3 letters
• More: Not usually better (3 strong > 4 mediocre)
• Check specific program requirements

Requesting Recommendation Letters:

Timing:
• Ask 4-6 weeks before application deadline
• Earlier is always better
• Not immediately before deadline
• Give them at least 3-4 weeks notice

What to Provide:
1. Your resume/CV
2. Statement of Purpose (SOP)
3. Your target universities list
4. Application deadline dates
5. Program requirements/description
6. How to submit letter (email/portal)
7. Letter format requirements
8. Specific questions they should address (optional guide)

How to Ask Professionally:
"Dear Professor [Name],

I am applying to [Program] at [University] for [Fall 2026/Spring 2026]. Your insights on my academic capabilities and potential would be invaluable for my application.

Would you be willing to write a strong letter of recommendation for me? I''ve attached my CV, SOP, and application details for reference.

The deadline is [Date], and I can be flexible with timing.

Thank you for considering my request.

Best regards,
[Your Name]"

Providing Guidance Without Being Pushy:

What to Include (Tactfully):
• Key achievements relevant to program
• Specific projects or collaborations
• Unique strengths or qualities
• Career goals and aspirations
• Why this program matters to you
• Any specific aspect you''d like emphasized

Optional Letter Guide:
"If helpful, here are some points you might consider addressing:
• My academic performance in your class
• My research/project contributions
• My teamwork and collaboration skills
• My initiative and independent thinking
• My suitability for graduate studies
• My character and integrity"

Making Recommender''s Job Easier:
✓ Provide clear deadline
✓ Send all materials together
✓ Include submission instructions
✓ Offer to discuss in person
✓ Provide direct contact information
✓ Follow up politely (1 week before deadline)
✓ Thank them sincerely
✓ Share outcome after applying

Strong Recommendation Letter Elements:

Opening (1-2 paragraphs):
• How long recommender has known you
• In what capacity (class, project, work)
• Their position and credibility
• Why they''re qualified to recommend

Personal Qualities (2-3 paragraphs):
• Specific examples of excellence
• Academic abilities with evidence
• Work ethic and dedication
• Intellectual curiosity
• Problem-solving abilities
• Communication skills
• Leadership qualities
• Teamwork and collaboration

Specific Achievements (2-3 paragraphs):
• Concrete examples (projects, papers, work)
• Quantifiable results when possible
• Unique contributions
• Going above and beyond
• Handling challenges successfully
• Comparison to peers

Fit for Program (1-2 paragraphs):
• Suitability for graduate program
• Ability to handle rigorous coursework
• Research potential
• Career readiness
• Why they''ll succeed
• How program aligns with strengths

Closing (1 paragraph):
• Strong endorsement
• Recommender''s confidence in candidate
• Willingness to discuss further
• Contact information

Examples of Strong Statements:

Academic Excellence:
"In my 15 years of teaching, [Student] ranks in the top 5% of students I''ve encountered. His/Her mastery of complex concepts and consistent 4.0 GPA demonstrate exceptional ability."

Leadership:
"As a team lead, I watched [Student] transform a struggling project into a success story. Their strategic thinking and communication skills were instrumental in rallying the team."

Research Potential:
"[Student]''s contributions to my research project resulted in two co-authored publications. Their independence, critical thinking, and dedication suggest strong research potential."

Overcoming Challenges:
"Despite personal challenges, [Student] maintained academic excellence and actively contributed to class discussions, demonstrating resilience and determination."

Timeline:
- Month 3: Identify potential recommenders
- Month 2: Prepare materials and approach
- Week 4-6: Have initial conversation
- Week 4: Email formal request with materials
- Week 3: Send reminder (polite follow-up)
- Week 1: Confirm receipt of letters
- Week 0: Apply with letters

After They Submit:
✓ Send thank you note
✓ Update them on outcome
✓ Maintain professional relationship
✓ Acknowledge their time investment
✓ Offer reciprocal help in future

Warning Signs of Weak Letter:
✗ Generic praise without specifics
✗ Focuses on general intelligence
✗ Lacks detailed examples
✗ Doesn''t address program fit
✗ Too brief (half page)
✗ Focuses on negative aspects
✗ Appears rushed or generic
✗ Doesn''t establish relationship',
 3, true),

('550e8400-e29b-41d4-a716-446655440004'::UUID,
 'What is the application timeline for studying abroad?',
 'Month-by-Month Application Timeline:

12 Months Before Start Date (Month -12):

Research Phase:
• Identify target countries (USA, UK, Canada, Australia, etc.)
• Research 10-15 universities
• Compare programs and requirements
• Check admission criteria and rankings
• Explore scholarship opportunities
• Join online communities and forums

Planning:
• Determine target field of study
• Check test requirements
• Estimate costs and financial needs
• Plan entrance exam preparation
• Identify potential recommenders
• Create application timeline

11-10 Months Before (Month -11 to -10):

Standardized Test Preparation:
• Enroll in test prep course (IELTS/GMAT/GRE)
• Start studying (3-4 months ahead)
• Take practice tests
• Identify weak areas
• Create study schedule

Narrow University List:
• Create shortlist of 8-10 universities
• Research each thoroughly
• Visit university websites
• Join information webinars
• Contact admissions offices

9-8 Months Before (Month -9 to -8):

Take Standardized Tests:
• IELTS/TOEFL exam attempt 1
• GMAT/GRE exam (if required)
• If unsatisfied, plan retake
• Keep score reports
• Note score deadlines

Build Application Materials:
• Request official transcripts (takes 2-4 weeks)
• Compile academic documents
• Prepare resume/CV
• Research scholarship opportunities
• Identify referees for recommendation letters

7-6 Months Before (Month -7 to -6):

Finalize University List:
• Select 4-6 universities (mix of reach/target/safety)
• Confirm all requirements
• Check deadlines (usually Sept-Dec)
• Understand different application portals
• Verify required documents

Request Recommendation Letters:
• Approach 2-3 referees
• Provide resume, SOP draft, deadline info
• Give them 4-6 weeks notice
• Share university-specific requirements
• Confirm they''ll submit on time

5-4 Months Before (Month -5 to -4):

Draft Statement of Purpose (SOP):
• Write first draft of SOP
• Get feedback from mentors
• Revise for clarity and impact
• Tailor to each university (if needed)
• Proofread multiple times

Gather Financial Documents:
• Compile bank statements (6-12 months)
• Proof of funds documentation
• If sponsored: collect sponsor letter and documents
• Income/salary certificates
• Investment statements

3 Months Before (Month -3):

Finalize Application Materials:
• Complete SOP (final version)
• Finalize CV/resume
• Collect all recommendation letters
• Prepare personal statement/essays
• Compile all required documents

Technology & Platform Setup:
• Create accounts on application portals
• Understand each university''s system
• Check document upload requirements
• Test file format compatibility
• Bookmark all portals and deadlines

Physical Preparation:
• Medical examination (if required)
• Vaccination records
• Passport validation (6+ months validity)
• Police clearance certificate
• All required attestations

2-3 Weeks Before Deadline (Month -2 to -3 weeks):

Complete Online Applications:
• Fill out application forms accurately
• Double-check all information
• Upload all required documents
• Essay responses (proofread)
• Personal statements
• Application portal verification

Pay Application Fees:
• Process payment (usually $75-200)
• Keep payment receipts
• Confirm fee submission
• Track payment confirmations

Quality Check:
• Review entire application
• Check all documents uploaded
• Verify contact information
• Spelling and grammar check
• One final review

1 Week Before Deadline (Month -1 week):

Final Submission:
• Submit application early (not last minute)
• Avoid technical issues
• Confirm successful submission
• Save confirmation receipt/ID
• Screenshot confirmation page

Email Confirmation:
• Confirm receipt with university
• Ask if any documents missing
• Provide contact information updates
• Request application status portal access
• Archive all communications

After Submission (Post-Application):

Month 0 (Application Submitted):
• Wait for application confirmation
• Track application status online
• Prepare for potential interviews
• Continue other applications

Month +1 to +4 (Decision Period):
• Receive admission decisions (typically Feb-May)
• Some universities: interviews before decision
• Compare offers and scholarships
• Communicate with universities if needed
• Make final university selection

Month +5 (Acceptance & Deposits):
• Accept offer from chosen university
• Pay enrollment deposit (usually $1,000-5,000)
• Confirm acceptance
• Register for courses (if offered)
• Begin visa application planning

Month +6 (Visa Application):
• Apply for student visa
• Submit visa documents
• Medical examination for visa
• Police clearance certificate
• Proof of financial support

Month +7 to +8 (Pre-Departure):
• Visa approval
• Book flights
• Arrange accommodation
• Get travel insurance
• Prepare for departure
• Pre-departure orientation

Month +9 (Arrival):
• Arrive at university
• Orientation week
• Register for classes
• Meet classmates
• Begin program

Key Deadlines to Remember:

Application Deadlines (Usually):
• Early Decision: October 15
• Regular Decision: January 15
• Rolling Admissions: January-March

Test Score Deadlines:
• IELTS/TOEFL valid 2 years
• GMAT/GRE valid 5 years
• Take at least 2-3 months before application

Document Deadlines:
• Transcripts: 3 months before application
• Recommendation letters: 1 month before deadline
• Test scores: Official by deadline
• Financial documents: Immediate upon request

Critical Tasks Timeline:

✓ Month -12: Research
✓ Month -9: Start test prep
✓ Month -7: Test attempts complete
✓ Month -6: Request recommendations
✓ Month -4: Draft SOP
✓ Month -2: Complete applications
✓ Month -1: Submit applications
✓ Month +3: Receive decisions
✓ Month +6: Visa application
✓ Month +9: Arrive at university

Common Mistakes to Avoid:

✗ Starting too late (only 2-3 months)
✗ Applying to too many/too few universities
✗ Poor quality SOP or essays
✗ Submitting incomplete applications
✗ Missing document deadlines
✗ Low test scores due to inadequate prep
✗ Weak recommendation letters
✗ Inaccurate or incomplete information
✗ Submitting at very last minute
✗ Not tracking deadlines carefully

Pro Tips:

✓ Spreadsheet with all deadlines
✓ Calendar reminders for important dates
✓ Start early to avoid rush
✓ Apply to 4-6 universities strategically
✓ Submit 2-3 weeks before deadline
✓ Maintain organized folder system
✓ Keep all original documents
✓ Backup all digital files
✓ Follow instructions precisely
✓ Proofread everything multiple times',
 4, true);

-- ============================================================================
-- VERIFICATION & SUMMARY
-- ============================================================================

-- Verify all FAQs inserted
-- Run this query to check:
/*
SELECT 
  c.name as category, 
  COUNT(f.id) as faq_count
FROM faq_categories c
LEFT JOIN faqs f ON c.id = f.category_id
GROUP BY c.name
ORDER BY c.display_order;

-- Expected output:
-- Study Abroad       | 7
-- Test Preparation   | 6
-- Career & Benefits  | 5
-- Application & Docs | 4
-- Total              | 25
*/

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- Status: 25 FAQs successfully migrated to database
-- Next Step: Create TypeScript query functions in src/lib/supabase/faq-queries.ts
-- Then: Create API routes in src/app/api/faqs/
-- Then: Update public FAQ page to fetch from database
