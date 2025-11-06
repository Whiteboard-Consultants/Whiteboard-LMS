import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

const newContent = `<div class="prose prose-lg max-w-4xl mx-auto dark:prose-invert">
<h2>What's Inside an 8-Week IELTS Intensive Course?</h2>
<p>You're ready to take IELTS seriously – but what does an "intensive course" really involve? Here's a detailed breakdown of what happens week-by-week in our 8-week program, plus real student success stories and measurable results.</p>

<h2>8-Week Study Plan: How We Take You From Today's Band To Exam Success</h2>

<h3>Week 1: Foundations & Baseline Assessment</h3>
<ul>
<li>Diagnostic mock test—find your current band</li>
<li>Orientation: IELTS format, band descriptors, scoring methods</li>
<li>Strategy session: personalized study plan creation</li>
<li>Focus: Building habits (structured study, daily tasks)</li>
</ul>

<h3>Week 2: Mastering Listening Skills</h3>
<ul>
<li>Intensive listening practice (all four IELTS sections)</li>
<li>Techniques for capturing key details and main ideas</li>
<li>Learn common distractors and how to avoid traps</li>
<li>Vocabulary-building for audio comprehension</li>
</ul>

<h3>Week 3: Cracking Reading – Speed & Strategy</h3>
<ul>
<li>Skimming, scanning, and analytical reading techniques</li>
<li>Section-wise walkthrough: True/False/Not Given, Matching, Summary Completion</li>
<li>Speed-building drills and timed exercises</li>
<li>Weekly feedback on reading tasks</li>
</ul>

<h3>Week 4: Writing Task 1 Focus</h3>
<ul>
<li>Understanding academic/general writing task 1: Visuals, graphs, letters</li>
<li>Language for describing trends, processes, requesting information</li>
<li>Structure templates and sample answers</li>
<li>Individual essay feedback and improvement plan</li>
</ul>

<h3>Week 5: Writing Task 2 Intensive</h3>
<ul>
<li>Argument, discussion, opinion essays: Structure and vocabulary</li>
<li>Cohesion and coherence – connect ideas logically</li>
<li>Practice high-scoring sample essays</li>
<li>Weekly feedback with band predictions</li>
</ul>

<h3>Week 6: Speaking Skill Development</h3>
<ul>
<li>Mock interviews and practice with former IELTS examiners</li>
<li>Fluency, pronunciation, topic vocabulary</li>
<li>Overcoming anxiety and building confidence</li>
<li>Common questions, model answers, and role-play sessions</li>
</ul>

<h3>Week 7: Advanced Techniques & Mock Tests</h3>
<ul>
<li>Integrated strategies for raising overall band score</li>
<li>Timed full-length mock test—real exam simulation</li>
<li>Gap-analysis: pinpointing remaining weaknesses for targeted improvement</li>
<li>One-on-one post-mock reviews</li>
</ul>

<h3>Week 8: Final Boost & Exam Readiness</h3>
<ul>
<li>Last-minute tips: time management, stress control, exam-day strategy</li>
<li>Review key grammar and vocabulary for all sections</li>
<li>Personalized band prediction & actionable improvement checklist</li>
<li>Final mock test followed by custom feedback</li>
</ul>

<h2>Real Student Success Stories</h2>

<h3>Raj P.: From 5.5 to 7.5 bands in 8 weeks</h3>
<p>Writing was the weak area—improved to 7.0+ after focused training. Now at University of British Columbia (Canada).</p>

<h3>Priya M.: From 6.0 to 7.5 bands</h3>
<p>Speaking anxiety gone after 3 weeks of role-play. Final score: Speaking 7.5. Accepted to London School of Economics (UK).</p>

<h3>Arun K.: From 6.5 to 8.0 bands</h3>
<p>High achiever path. Mastered advanced vocabulary and reading speed. Final: 7.8. Accepted to University of Melbourne PhD.</p>

<h2>Results Summary: What Students Achieve</h2>

<table class="w-full border-collapse border border-gray-300">
<thead>
<tr class="bg-gray-100">
<th class="border border-gray-300 p-3 text-left">Starting Band</th>
<th class="border border-gray-300 p-3 text-left">Final Band (Average)</th>
<th class="border border-gray-300 p-3 text-left">Improvement</th>
<th class="border border-gray-300 p-3 text-left">% Reaching Goal</th>
</tr>
</thead>
<tbody>
<tr>
<td class="border border-gray-300 p-3">5.0–5.5</td>
<td class="border border-gray-300 p-3">6.5–7.0+</td>
<td class="border border-gray-300 p-3">+1.0–1.5</td>
<td class="border border-gray-300 p-3">81%</td>
</tr>
<tr class="bg-gray-50">
<td class="border border-gray-300 p-3">6.0–6.5</td>
<td class="border border-gray-300 p-3">7.0–7.5+</td>
<td class="border border-gray-300 p-3">+0.75–1.0</td>
<td class="border border-gray-300 p-3">87%</td>
</tr>
<tr>
<td class="border border-gray-300 p-3">7.0+</td>
<td class="border border-gray-300 p-3">7.5–8.0+</td>
<td class="border border-gray-300 p-3">+0.5–0.75</td>
<td class="border border-gray-300 p-3">72%</td>
</tr>
<tr class="bg-gray-100 font-semibold">
<td class="border border-gray-300 p-3">Overall</td>
<td class="border border-gray-300 p-3">+1.0</td>
<td class="border border-gray-300 p-3">+1.0</td>
<td class="border border-gray-300 p-3">82% reach their target band</td>
</tr>
</tbody>
</table>

<h2>The Whiteboard Promise</h2>
<div class="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg my-6">
<ul class="list-none">
<li class="mb-3"><span class="text-2xl mr-2">🏆</span> <strong>82% success rate</strong></li>
<li class="mb-3"><span class="text-2xl mr-2">👨‍🏫</span> <strong>Expert instructors</strong> – former IELTS examiners + 10+ years experience</li>
<li class="mb-3"><span class="text-2xl mr-2">📊</span> <strong>Personalized plans</strong> – based on your starting level</li>
<li class="mb-3"><span class="text-2xl mr-2">💬</span> <strong>Weekly feedback</strong> – on every essay, speaking test</li>
<li class="mb-3"><span class="text-2xl mr-2">🎯</span> <strong>Average +1 band improvement</strong> – in just 8 weeks</li>
<li><span class="text-2xl mr-2">💰</span> <strong>Money-back guarantee</strong> – 10 days, no questions asked</li>
</ul>
</div>

<h2>Ready to transform your IELTS score?</h2>
<p class="text-lg font-semibold">Join 400+ students who achieved 7.0–8.0 bands with our intensive course.</p>
<p>Average improvement: +1 band in 8 weeks. 82% reach their target on first attempt.</p>
</div>`;

async function updatePost() {
  try {
    console.log("🔍 Finding IELTS post...");

    const { data: post, error: fetchError } = await supabase
      .from("posts")
      .select("id, title, slug")
      .eq("slug", "8-week-ielts-intensive-course-success-stories")
      .single();

    if (fetchError || !post) {
      console.error("❌ Error finding post:", fetchError);
      process.exit(1);
    }

    console.log(`✅ Found post: ${post.title} (${post.id})`);

    console.log("📝 Updating content...");

    const { error: updateError } = await supabase
      .from("posts")
      .update({
        content: newContent,
        updated_at: new Date().toISOString(),
      })
      .eq("id", post.id);

    if (updateError) {
      console.error("❌ Error updating post:", updateError);
      process.exit(1);
    }

    console.log("✅ Post updated successfully!");
    console.log(`📊 Content length: ${newContent.length} characters`);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

updatePost();
