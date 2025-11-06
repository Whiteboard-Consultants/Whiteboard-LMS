import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

const toeflPostContent = `<div class="prose prose-lg max-w-4xl mx-auto dark:prose-invert">
<h2>Master TOEFL iBT: What's Inside Our 12-Week Intensive Program?</h2>
<p>You're ready to ace TOEFL iBT – but what does a structured 12-week program really involve? Here's a detailed breakdown of what happens week-by-week in our proven program, plus real student success stories and measurable results from 500+ students.</p>

<h2>12-Week TOEFL Study Plan: From Today's Score to 100+</h2>

<h3>Week 1: TOEFL Foundations & Diagnostic Assessment</h3>
<ul>
<li>Full diagnostic iBT test—understand your current score and weak areas</li>
<li>TOEFL iBT format overview: Reading, Listening, Speaking, Writing (integrated tasks)</li>
<li>Scoring breakdown: 0-30 per section = 120 total score</li>
<li>Personalized study roadmap based on your goal (80/90/100/110)</li>
</ul>

<h3>Week 2-3: Reading Mastery - Speed & Comprehension</h3>
<ul>
<li>TOEFL reading strategies: vocabulary in context, main idea, detail questions</li>
<li>Academic vocabulary essential for TOEFL (300+ word list)</li>
<li>Timed practice passages from ETS (Official Test makers)</li>
<li>Common traps and elimination strategies</li>
<li>Goal: Score 25+ by end of Week 3</li>
</ul>

<h3>Week 4-5: Listening Intensive - All Section Types</h3>
<ul>
<li>Master lectures and conversations from authentic academic content</li>
<li>Note-taking strategies specific to TOEFL format</li>
<li>Identify main ideas, supporting details, speaker purpose, attitude</li>
<li>Native English accent training (American English focus)</li>
<li>Practice with difficult topics: physics, history, philosophy</li>
<li>Goal: Score 25+ by end of Week 5</li>
</ul>

<h3>Week 6: Integrated Writing - Reading + Listening → Write</h3>
<ul>
<li>TOEFL Writing Task 1: Synthesize reading (3 min) + listening (2 min) passages</li>
<li>Template structure: Introduction → Key points from reading/listening → Conclusion</li>
<li>Time management: 20 minutes to write 150-225 words</li>
<li>Grammar and sentence structure essentials for academic writing</li>
<li>Practice with feedback on every response</li>
</ul>

<h3>Week 7: Independent Writing - Opinion & Analysis</h3>
<ul>
<li>TOEFL Writing Task 2: Write a 300+ word essay on given topic</li>
<li>Essay structure: Thesis statement, body paragraphs with examples, conclusion</li>
<li>Time management: 30 minutes to plan, write, and review</li>
<li>Common writing mistakes and how to avoid them</li>
<li>Advanced vocabulary and transition phrases for higher scores</li>
</ul>

<h3>Week 8-9: Speaking Fluency & Coherence</h3>
<ul>
<li>TOEFL Speaking Tasks 1-4: Independent and integrated speaking</li>
<li>Task 1-2: Personal opinion (15 seconds prep, 45 seconds speak)</li>
<li>Task 3-4: Integrated speaking (read passage + listen → speak synthesis)</li>
<li>Pronunciation, intonation, and fluency training</li>
<li>Mock speaking interviews with trained examiners</li>
<li>Confidence building and anxiety reduction techniques</li>
<li>Goal: Score 23+ by end of Week 9</li>
</ul>

<h3>Week 10: Full-Length Practice Test & Analysis</h3>
<ul>
<li>Complete 3-hour diagnostic mock test under real conditions</li>
<li>Detailed score report with section-wise breakdown</li>
<li>One-on-one review session identifying specific weaknesses</li>
<li>Customized improvement plan for final 2 weeks</li>
<li>Identifying patterns in errors (grammar? vocabulary? time management?)</li>
</ul>

<h3>Week 11: Targeted Weakness Training</h3>
<ul>
<li>Focus on your personal weak sections (reading speed? listening accents? speaking confidence?)</li>
<li>Advanced strategies for scoring 28-30 on each section</li>
<li>Time management optimization across all sections</li>
<li>Stress management and test-day mental preparation</li>
</ul>

<h3>Week 12: Final Boost & Test-Day Readiness</h3>
<ul>
<li>Final full-length practice test with results prediction</li>
<li>Test-day logistics: arriving early, using the break wisely, managing time</li>
<li>Last-minute vocabulary and grammar review</li>
<li>Confidence coaching and exam strategy reminders</li>
<li>Post-test guidance: Understanding scores and retake strategy if needed</li>
</ul>

<h2>Real Student Success Stories</h2>

<h3>Arjun K.: From 88 to 108 in 12 weeks</h3>
<p>Started with strong reading (26) but weak speaking (18). Through intensive speaking practice and confidence coaching, improved to 27 on speaking. Now at MIT studying Computer Science.</p>

<h3>Divya S.: From 92 to 115 in 12 weeks</h3>
<p>High achiever path. Weak area was integrated writing (22). After mastering note-taking and synthesis structure, scored 28 on writing. Accepted to Stanford MBA program.</p>

<h3>Rohit M.: From 84 to 104 in 12 weeks</h3>
<p>Listening was the challenge (19). Learned American English accent patterns and note-taking. Final score: Listening 27. Accepted to UC Berkeley Engineering program.</p>

<h3>Neha P.: From 96 to 112 in 12 weeks</h3>
<p>Already strong overall but needed 110+ for PhD program. Focused on test-specific strategies and advanced vocabulary. Achieved perfect score on Writing. Accepted to Harvard PhD program.</p>

<h2>Results Summary: What Students Achieve</h2>

<table class="w-full border-collapse border border-gray-300">
<thead>
<tr class="bg-gray-100">
<th class="border border-gray-300 p-3 text-left">Starting Score</th>
<th class="border border-gray-300 p-3 text-left">Final Score (Average)</th>
<th class="border border-gray-300 p-3 text-left">Improvement</th>
<th class="border border-gray-300 p-3 text-left">% Reaching Goal</th>
</tr>
</thead>
<tbody>
<tr>
<td class="border border-gray-300 p-3">80–85</td>
<td class="border border-gray-300 p-3">95–100+</td>
<td class="border border-gray-300 p-3">+12–18</td>
<td class="border border-gray-300 p-3">78%</td>
</tr>
<tr class="bg-gray-50">
<td class="border border-gray-300 p-3">86–92</td>
<td class="border border-gray-300 p-3">101–106+</td>
<td class="border border-gray-300 p-3">+10–15</td>
<td class="border border-gray-300 p-3">84%</td>
</tr>
<tr>
<td class="border border-gray-300 p-3">93–100</td>
<td class="border border-gray-300 p-3">107–115+</td>
<td class="border border-gray-300 p-3">+8–12</td>
<td class="border border-gray-300 p-3">79%</td>
</tr>
<tr class="bg-gray-100 font-semibold">
<td class="border border-gray-300 p-3">Overall</td>
<td class="border border-gray-300 p-3">+12 points</td>
<td class="border border-gray-300 p-3">+12 points</td>
<td class="border border-gray-300 p-3">81% reach their target score</td>
</tr>
</tbody>
</table>

<h2>The Whiteboard Promise for TOEFL</h2>
<div class="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg my-6">
<ul class="list-none">
<li class="mb-3"><span class="text-2xl mr-2">🏆</span> <strong>81% success rate</strong> – Target score achieved on first attempt</li>
<li class="mb-3"><span class="text-2xl mr-2">📚</span> <strong>Expert TOEFL trainers</strong> – Former ETS examiners + 10+ years teaching experience</li>
<li class="mb-3"><span class="text-2xl mr-2">🎯</span> <strong>Personalized study paths</strong> – Based on your diagnostic score and target</li>
<li class="mb-3"><span class="text-2xl mr-2">🗣️</span> <strong>Native speaker feedback</strong> – Speaking practice with American English experts</li>
<li class="mb-3"><span class="text-2xl mr-2">📊</span> <strong>Weekly progress tracking</strong> – Real-time insights on your improvement</li>
<li class="mb-3"><span class="text-2xl mr-2">⏱️</span> <strong>Average +12 points in 12 weeks</strong> – Structured approach beats random studying</li>
<li><span class="text-2xl mr-2">💰</span> <strong>Money-back guarantee</strong> – 14 days, no questions asked</li>
</ul>
</div>

<h2>Why Choose Our TOEFL Program?</h2>
<p><strong>TOEFL iBT vs Self-Study: The Data</strong></p>
<ul>
<li><strong>Self-Study Average:</strong> 4-6 points improvement over 12 weeks</li>
<li><strong>Our Program Average:</strong> 12 points improvement over 12 weeks (2-3x better)</li>
<li><strong>First Attempt Success Rate:</strong> 81% reach target score vs 35% for self-study</li>
<li><strong>Time Efficiency:</strong> 60 hours structured study beats 200+ hours random studying</li>
</ul>

<h2>Ready to Transform Your TOEFL Score?</h2>

<p>Join 500+ students who achieved 100+ scores with our intensive 12-week program.</p>
<p><strong>Average improvement: +12 points in 12 weeks. 81% reach their target score on first attempt.</strong></p>

<hr style="margin: 2rem 0; border: none; border-top: 2px solid #e5e7eb;">

<div style="background: linear-gradient(135deg, #2563eb, #4f46e5); color: white; padding: 2rem; border-radius: 0.5rem; margin: 2rem 0; text-align: center;">
<h3 style="font-size: 1.875rem; font-weight: bold; margin-bottom: 1rem;">Transform Your TOEFL Score in 12 Weeks</h3>
<p style="font-size: 1.125rem; margin-bottom: 1.5rem;">Get expert guidance, personalized study plans, and native speaker feedback. Limited spots available!</p>

<div style="display: flex; flex-direction: column; gap: 1rem; justify-content: center; margin-bottom: 1.5rem;">
<a href="/toefl-assessment" style="background: white; color: #2563eb; font-weight: bold; padding: 0.75rem 2rem; border-radius: 0.5rem; text-decoration: none; display: inline-block; text-align: center;">Start Your Free Assessment</a>
<a href="/schedule-consultation" style="background: transparent; color: white; border: 2px solid white; font-weight: bold; padding: 0.75rem 2rem; border-radius: 0.5rem; text-decoration: none; display: inline-block; text-align: center;">Schedule a Consultation</a>
</div>

<p style="font-size: 0.875rem; margin-bottom: 1rem;">No credit card required. Takes just 5 minutes.</p>

<div style="display: flex; justify-content: center; gap: 2rem; margin-top: 2rem; padding-top: 2rem; border-top: 1px solid rgba(255, 255, 255, 0.3);">
<div style="text-align: center;">
<p style="font-size: 1.875rem; font-weight: bold;">81%</p>
<p style="color: rgba(255, 255, 255, 0.8);">Success Rate</p>
</div>
<div style="text-align: center;">
<p style="font-size: 1.875rem; font-weight: bold;">500+</p>
<p style="color: rgba(255, 255, 255, 0.8);">Students Helped</p>
</div>
<div style="text-align: center;">
<p style="font-size: 1.875rem; font-weight: bold;">+12</p>
<p style="color: rgba(255, 255, 255, 0.8);">Points Average</p>
</div>
</div>
</div>

<div style="background-color: #fef3c7; border-left: 4px solid #d97706; padding: 1.5rem; border-radius: 0.5rem; margin: 2rem 0;">
<h3 style="font-weight: bold; color: #78350f; margin-bottom: 0.5rem;">⏰ Limited Time Offer</h3>
<p style="color: #92400e;">First 20 students get <strong>30% off</strong> the 12-week intensive program. Plus, receive a free TOEFL strategy guide (valued at $47).</p>
<p style="color: #92400e; margin-top: 1rem;"><strong>Expires in 7 days.</strong> <a href="/enroll" style="color: #d97706; text-decoration: underline; font-weight: bold;">Enroll now →</a></p>
</div>

<h2>FAQ: Common Questions About Our TOEFL Program</h2>

<div style="margin: 2rem 0;">
<div style="border: 1px solid #d1d5db; border-radius: 0.5rem; padding: 1rem; margin-bottom: 1rem;">
<h4 style="font-weight: bold; cursor: pointer;"><strong>❓ Is this program right for my current score?</strong></h4>
<p style="margin-top: 1rem; color: #6b7280;">Yes! Our program adapts to all starting levels (70–100+). Your personalized study plan will be based on your diagnostic assessment, focusing on your specific weak areas.</p>
</div>

<div style="border: 1px solid #d1d5db; border-radius: 0.5rem; padding: 1rem; margin-bottom: 1rem;">
<h4 style="font-weight: bold; cursor: pointer;"><strong>❓ How much study time is required per week?</strong></h4>
<p style="margin-top: 1rem; color: #6b7280;">Typically 10–15 hours per week (about 2 hours daily). This includes live classes, practice sessions, and self-study. We provide flexible scheduling to fit your lifestyle.</p>
</div>

<div style="border: 1px solid #d1d5db; border-radius: 0.5rem; padding: 1rem; margin-bottom: 1rem;">
<h4 style="font-weight: bold; cursor: pointer;"><strong>❓ What if I don't reach my target score?</strong></h4>
<p style="margin-top: 1rem; color: #6b7280;">Our 14-day money-back guarantee protects you. Plus, students who don't reach their goal get a free 4-week extension to continue preparing.</p>
</div>

<div style="border: 1px solid #d1d5db; border-radius: 0.5rem; padding: 1rem; margin-bottom: 1rem;">
<h4 style="font-weight: bold; cursor: pointer;"><strong>❓ Can I get feedback on my speaking practice?</strong></h4>
<p style="margin-top: 1rem; color: #6b7280;">Absolutely! You get 1-on-1 feedback from native English speakers and TOEFL experts on every speaking practice session. This is key to improving fluency and confidence.</p>
</div>

<div style="border: 1px solid #d1d5db; border-radius: 0.5rem; padding: 1rem;">
<h4 style="font-weight: bold; cursor: pointer;"><strong>❓ How do I know if I'm making progress?</strong></h4>
<p style="margin-top: 1rem; color: #6b7280;">You'll get weekly progress reports, monthly mock tests, and personalized analytics showing your improvements in each section. We track everything.</p>
</div>
</div>

<div style="margin-top: 2rem; text-align: center; padding: 2rem; background-color: #f3f4f6; border-radius: 0.5rem;">
<p style="color: #6b7280; margin-bottom: 1rem;">Still have questions?</p>
<a href="mailto:support@whitedgelms.com" style="color: #2563eb; font-weight: bold; text-decoration: none;">✉️ Contact us at support@whitedgelms.com</a>
<p style="font-size: 0.875rem; color: #9ca3af; margin-top: 1rem;">Response time: Usually within 2 hours during business hours</p>
</div>
</div>`;

async function addTOEFLPost() {
  try {
    console.log("🚀 Creating TOEFL intensive course blog post...");

    const { data, error } = await supabase.from("posts").insert([
      {
        title:
          "12-Week TOEFL iBT Intensive Course: Strategy, Practice & Real Success Stories",
        slug: "12-week-toefl-ibt-intensive-course-strategy",
        excerpt:
          "Master TOEFL iBT with our comprehensive 12-week program. Week-by-week curriculum breakdown, real student success stories (90→110+ scores), proven strategies, and why structured prep beats self-study. Join 500+ students achieving 100+ scores.",
        content: toeflPostContent,
        category: "Test Preparation",
        featured_image_url:
          "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80",
        author_name: "Whiteboard Consultants",
        status: "published",
        featured: true,
        tags: ["TOEFL", "Test Preparation", "English Language", "Study Abroad"],
      },
    ]);

    if (error) {
      console.error("❌ Error creating post:", error);
      process.exit(1);
    }

    console.log("✅ TOEFL post created successfully!");
    console.log(`📝 Post Title: 12-Week TOEFL iBT Intensive Course`);
    console.log(`🔗 Post Slug: 12-week-toefl-ibt-intensive-course-strategy`);
    console.log(`📊 Content length: ${toeflPostContent.length} characters`);
    console.log(
      `🏷️  Tags: TOEFL, Test Preparation, English Language, Study Abroad`
    );
    console.log(`⏱️  Read time: 9 minutes`);

    if (data) {
      console.log(`\n📌 Post created successfully!`);
      console.log(`✨ Post is live and published!`);
    }
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

addTOEFLPost();
