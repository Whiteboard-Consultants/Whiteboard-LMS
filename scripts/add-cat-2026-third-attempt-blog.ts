import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase credentials");
}

const supabase = createClient(supabaseUrl, supabaseKey);

const SLUG = "cat-2026-third-attempt-last-chance-plan-b";

const title =
  "CAT 2026, Attempt Three: Give It Everything. Just Don't Spend a Fourth Year Waiting.";

const excerpt =
  "CAT 2026 is on Sunday, 29 November 2026, and a third attempt is real work that deserves a real plan. In your 20s, the expensive part of repeating CAT is the years: appraisals, promotions and savings that compound while you wait. On our assumptions, a fourth attempt followed by a full-time MBA is about Rs 30–34 Lacs all-in, against about Rs 2 Lacs for a UGC-DEB approved online MBA you can start while working. A Plan B does not weaken attempt three; it lets you write it without spending a fourth year waiting.";

const metaDescription =
  "On your 3rd CAT attempt in your 20s? Make CAT 2026 count, then compare a 4th year of waiting with an online MBA you can start while working.";

const content = `<div class="wb-cat">
<style>
  .wb-cat h2, .wb-cat h3 { color: #004B93; }
  .wb-cat .wb-label {
    font-family: Montserrat, ui-sans-serif, sans-serif;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    font-size: 13px;
    color: #004B93;
    margin: 0 0 1.25rem;
  }
  .wb-cat .wb-attempts { color: #C9002B; font-weight: 700; }
  .wb-cat .wb-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; }
  .wb-cat table { width: 100%; border-collapse: collapse; margin: 1.25rem 0 0.5rem; font-size: 0.95rem; }
  .wb-cat table.wb-wide { min-width: 680px; }
  .wb-cat th, .wb-cat td { border: 1px solid #d7dee8; padding: 0.75rem 0.85rem; text-align: left; vertical-align: top; }
  .wb-cat th { background: #004B93; color: #ffffff; font-weight: 700; }
  .wb-cat tbody tr:nth-child(even) td { background: #F5F7FA; }
  .wb-cat .wb-note { font-size: 0.95rem; color: #1A2340; }
</style>

<p class="wb-label">For CAT Repeaters</p>

<h2>A Confession We Hear Often</h2>
<blockquote>
<p>"I gave CAT <span class="wb-attempts">3 attempts</span> and lakhs on coaching. My career waited the whole time."</p>
</blockquote>
<p>That's a composite of what many aspirants in their mid-twenties tell our counsellors, not one person's story. You might know the details: a folder of mock scorecards, a coaching WhatsApp group that went quiet, and a college friend's LinkedIn post announcing a second promotion while you were on mock number 40.</p>
<p>What stands out every time: nobody regrets wanting an MBA. The regret is waiting for permission to start. "I didn't fail CAT. I just spent three years waiting for the next attempt to feel like the right one."</p>
<p>We're not here to talk you out of CAT, or to scare you. If you're writing CAT 2026 for the third time, this post does two things. It helps you make attempt three count. And it helps you decide your Plan B before result day, so you're never stuck waiting again.</p>

<h2>CAT 2026 at a Glance</h2>
<div style="overflow-x:auto;">
<table>
<thead>
<tr><th>Detail</th><th>CAT 2026</th></tr>
</thead>
<tbody>
<tr><td>Conducted by</td><td>IIM Indore</td></tr>
<tr><td>Exam date</td><td>Sunday, 29 November 2026</td></tr>
<tr><td>Format</td><td>Computer-based test, three sessions</td></tr>
<tr><td>Test cities</td><td>Around 170</td></tr>
<tr><td>Admit card</td><td>From 4 November 2026</td></tr>
<tr><td>Result</td><td>Expected between late December 2026 and early January 2027. Sources vary, so follow <a href="https://iimcat.ac.in" target="_blank" rel="noopener noreferrer">iimcat.ac.in</a>.</td></tr>
</tbody>
</table>
</div>

<h2>Make Attempt Three Different: A 5-Minute Honest Audit</h2>
<p>The same prep, a third time, rarely gives a different score. Grab your notes app and answer:</p>
<ol>
<li><strong>Where did attempts 1 and 2 actually break?</strong> Accuracy, speed, one section, or panic on the day? One line.</li>
<li><strong>What did you change?</strong> A new YouTube channel isn't a change. A new process is: timed sectionals, an error log, a fixed section order.</li>
<li><strong>How do your recent mocks compare with last year's cutoffs for your target colleges?</strong> Honest, not hopeful.</li>
<li><strong>Who can review your mock analysis?</strong> A fresh pair of eyes spots the leak you've stopped noticing.</li>
</ol>
<p>For the final weeks: analyse every mock like a case study, lock your section strategy before you walk in, protect your sleep, and mute the groups that make you feel behind.</p>

<h2>What Waiting Costs: Rupees, Time and Career Movement</h2>
<p>In your 20s, three things compound the fastest: money, experience and momentum. Waiting pauses all three. Here's the math, with numbers you can change.</p>

<h3>Rupees</h3>
<p>Our assumptions. Replace them with yours:</p>
<ul>
<li><strong>Current salary:</strong> Rs 6 Lacs per annum, growing 8% a year.</li>
<li><strong>Prep spend per retake cycle</strong> (coaching, mocks, test and application fees): Rs 70,000. Over two cycles so far, about Rs 1.4 Lacs. That's already spent, and it shouldn't steer what happens next.</li>
<li><strong>Full-time MBA fee:</strong> Rs 15 Lacs. Programmes run from about Rs 10 Lacs to Rs 25 Lacs and beyond.</li>
<li><strong>UGC-DEB approved online MBA:</strong> about Rs 2 Lacs in this model, roughly Rs 8,333 a month over 24 months. Partner programmes are typically 2 years, and fees commonly range from about Rs 1 Lac to Rs 5 Lacs. The exact fee varies by programme.</li>
<li><strong>Salary uplift an MBA might unlock:</strong> Rs 3 Lacs a year. This is a number you set, not a result we promise. No salary, placement or promotion outcome is promised. We show totals with and without it.</li>
</ul>

<h3>Three roads from the result day</h3>
<div class="wb-scroll">
<table class="wb-wide">
<thead>
<tr>
<th></th>
<th>Start online MBA at next intake</th>
<th>4th attempt, then full-time MBA</th>
<th>5th attempt, then full-time MBA</th>
</tr>
</thead>
<tbody>
<tr>
<td>Programme fee</td>
<td>Rs 2 Lacs</td>
<td>Rs 15 Lacs</td>
<td>Rs 15 Lacs</td>
</tr>
<tr>
<td>Extra prep and test spend</td>
<td>None</td>
<td>Rs 0.7 Lacs</td>
<td>Rs 1.4 Lacs</td>
</tr>
<tr>
<td>Salary forgone while studying full-time (about 2 years)</td>
<td>None. You keep earning.</td>
<td>About Rs 14.6 Lacs</td>
<td>About Rs 15.7 Lacs</td>
</tr>
<tr>
<td>All-in cost, zero uplift assumed</td>
<td>Rs 2 Lacs</td>
<td>About Rs 30.3 Lacs</td>
<td>About Rs 32.1 Lacs</td>
</tr>
<tr>
<td>Add: MBA-linked uplift postponed (at Rs 3 Lacs a year)</td>
<td>None</td>
<td>About Rs 4.2 Lacs</td>
<td>About Rs 7.2 Lacs</td>
</tr>
<tr>
<td><strong>All-in cost, with that uplift</strong></td>
<td><strong>Rs 2 Lacs</strong></td>
<td><strong>About Rs 34.5 Lacs</strong></td>
<td><strong>About Rs 39.4 Lacs</strong></td>
</tr>
</tbody>
</table>
</div>
<p class="wb-note">What the extra money has to buy. Over 10 years, the 4th-attempt route must pay roughly Rs 2.8 to Rs 3.3 Lacs more per year than the online route to break even. The 5th-attempt route needs roughly Rs 3.0 to Rs 3.7 Lacs more per year.</p>
<p>A top IIM, or a comparable programme, often clears that bar. This is exactly why you should give CAT 2026 everything.</p>
<p>An average programme may not cover the cost of the extra years. No conversion again means another year, the spend, and no credential. Nobody prints that on a coaching poster.</p>

<h3>Time: Where Will You Be, and How Old?</h3>
<div class="wb-scroll">
<table class="wb-wide">
<thead>
<tr>
<th>MBA credential in hand</th>
<th>Online MBA at next intake</th>
<th>4th attempt route</th>
<th>5th attempt route</th>
</tr>
</thead>
<tbody>
<tr>
<td>Around</td>
<td>Early 2029</td>
<td>Mid-2030</td>
<td>Mid-2031</td>
</tr>
<tr>
<td>If you're 24 today, you'd be about</td>
<td>26</td>
<td>28</td>
<td>29</td>
</tr>
<tr>
<td>If you're 27 today, you'd be about</td>
<td>29</td>
<td>31</td>
<td>32</td>
</tr>
</tbody>
</table>
</div>
<p>Small thought: if an online MBA had started after CAT 2024, it would be finishing about now. We don't say it to hurt. We say it because your 20s have a calendar, and it keeps moving.</p>

<h3>Career Movement</h3>
<p>A year of waiting is also an appraisal cycle where your new skills weren't in the room, a promotion conversation you had without the credential, and a stretch where your peers kept stacking experience and savings. It isn't a rupee figure, but you can feel it.</p>
<p class="wb-note"><strong>These are illustrative planning numbers, not promises.</strong> Use your own salary, fees and goals, or ask us to run the math with you.</p>

<h2>Here's What I'd Do Now: Decide Before You Write, Not After</h2>
<p>Result day is emotional, and decisions made that day are rarely the clearest. Write this down before 29 November:</p>
<div class="not-prose" style="background:#F5F7FA;border-left:4px solid #004B93;padding:20px 24px;border-radius:6px;margin:24px 0;">
<p style="margin:0 0 12px;color:#1A2340;font-weight:700;">After CAT 2026, I will…</p>
<ul style="margin:0;padding-left:1.25rem;color:#1A2340;">
<li style="margin-bottom:8px;">Accept my admit calls if my percentile meets my target college's cutoff.</li>
<li style="margin-bottom:8px;">Consider a 4th attempt only if my score is within reach of my target, I can name what I'll change, and I've set a hard stop in writing.</li>
<li>Start my Plan B at the next intake if my score is below my target band, or if this would repeat the same pattern.</li>
</ul>
</div>
<p>Share it with one person you trust. A decision made in advance is easier to keep.</p>
<div class="not-prose" style="background:#F5F7FA;border-left:4px solid #00A99D;padding:20px 24px;border-radius:6px;margin:24px 0;">
<p style="margin:0 0 8px;color:#1A2340;font-weight:700;">A 4th attempt can make sense if:</p>
<p style="margin:0;color:#1A2340;">You were very close to your target cutoffs, you know exactly what to fix, you'll keep working or building skills during prep, and it's your last one.</p>
</div>
<div class="not-prose" style="background:#F5F7FA;border-left:4px solid #E8A020;padding:20px 24px;border-radius:6px;margin:24px 0;">
<p style="margin:0 0 8px;color:#1A2340;font-weight:700;">It's time to start Plan B if:</p>
<p style="margin:0;color:#1A2340;">Your percentile has plateaued across three attempts, your target colleges keep getting lowered, or you're "preparing" more than you're improving.</p>
</div>

<h2>Plan B Isn't a Downgrade. It's How You Start.</h2>
<p>An online MBA from a UGC-DEB approved university changes the decision:</p>
<ul>
<li><strong>Keep your salary, keep your momentum.</strong> No career pause, no two-year gap on your resume, no moving out of your city.</li>
<li><strong>Typically no CAT-style entrance gate.</strong> Each university sets its own eligibility, so check the programme you're considering.</li>
<li><strong>Use it at work the same week you learn it.</strong> Live classes, with recordings for when work runs late. Partner programmes are typically 24 months to a degree.</li>
<li><strong>Built around your career.</strong> Specialisations in Finance, Marketing, HR and Analytics.</li>
<li><strong>A degree, not a pile of badges.</strong></li>
<li><strong>Recognised when the university is UGC-DEB entitled for your session.</strong> Confirm that entitlement for the current session before you enrol.</li>
</ul>
<p>We can compare partner programmes side by side with you, honestly, including when an online MBA is not the right move. If your goal is investment banking or top-tier consulting through campus placements, CAT remains the right route. If you want a promotion, a pivot or a leadership role, you may not need to wait another year to begin.</p>

<h2>Your Career Blueprint From Here</h2>
<p>The same five steps we use in counselling:</p>
<ol>
<li><strong>Discover.</strong> Do the 5-minute audit and write your rule before 29 November. Add our free <a href="/#RIASEC">RIASEC Career Assessment</a> to see which specialisation fits you.</li>
<li><strong>Decide.</strong> On result day, pause for 48 hours. Then compare your percentile with last year's cutoffs, and compare Plan B programmes on cost, schedule and fit.</li>
<li><strong>Develop.</strong> If you're heading to Plan B, we help you build a study plan and gather documents. Admissions are session-wise, so confirm dates on the UGC-DEB portal and with the university.</li>
<li><strong>Deploy.</strong> Admission and enrolment, with a clear fee and EMI plan.</li>
<li><strong>Dominate.</strong> Apply each module at work. Keep a short list of real outcomes for your next appraisal conversation.</li>
</ol>

<div class="not-prose" style="background:#004B93;color:#ffffff;padding:36px 28px;border-radius:10px;margin-top:40px;text-align:center;">
<p style="font-family:Montserrat,ui-sans-serif,sans-serif;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;font-size:12px;color:#F5F7FA;margin:0 0 12px;">For CAT Repeaters</p>
<h2 style="color:#ffffff;margin:0 0 12px;font-size:1.75rem;">Start your journey</h2>
<p style="color:#F5F7FA;margin:0 0 20px;font-size:1.05rem;">No pressure, no pushy calls. Let's do the math together.</p>
<a href="https://application.whiteboardconsultant.com/online-mba" style="background:#C9002B;color:#ffffff;padding:14px 28px;border-radius:6px;text-decoration:none;display:inline-block;font-weight:700;">Start Your Journey — Free Consultation</a>
<p style="color:#ffffff;margin:24px 0 0;font-weight:700;letter-spacing:0.02em;">Your Future. Our Focus.</p>
</div>

<p>Share this with a friend who's also on their third CAT. When you speak with a counsellor, tell them one thing you're doing differently this time.</p>
<p class="wb-note"><strong>References.</strong> IIM CAT 2026 notification and schedule as reported by Careers360, Physics Wallah, Deccan Herald and IMS India. UGC-DEB guidance as summarised by GradRight and Careers360. Cost figures are an illustrative model. Always verify programme details and UGC-DEB status before enrolling.</p>
</div>`;

const faqSection = [
  {
    question: "When is the CAT 2026 exam date?",
    answer:
      "CAT 2026 will be held on Sunday, 29 November 2026, in three sessions, conducted by IIM Indore. Admit cards are available from 4 November 2026.",
  },
  {
    question: "Is it worth giving CAT a fourth time?",
    answer:
      "It can be, if your score is close to your target cutoffs, you know exactly what to change, and you've set a hard stop. An open-ended \"one more year\" plan rarely is.",
  },
  {
    question: "What should I do if CAT doesn't go the way I hoped on the third attempt?",
    answer:
      "Don't decide on result day. Wait 48 hours, compare your percentile with your target colleges' cutoffs, and use the rule you wrote beforehand. If Plan B is the right call, a UGC-DEB approved online MBA lets you keep earning while you start.",
  },
  {
    question: "How much does a CAT retake actually cost?",
    answer:
      "Direct spend is around Rs 70,000 a cycle on our assumption. The bigger cost is the years and the salary growth that wait. In our model, a 4th attempt followed by a full-time MBA is about Rs 30–34 Lacs all-in versus about Rs 2 Lacs for an online MBA, depending on the uplift you assume. No outcome is promised.",
  },
  {
    question: "Can I do an online MBA right after graduation, or do I need work experience?",
    answer:
      "Eligibility differs by university and programme, so check each one. Many programmes accept graduates, and our counsellors can tell you which ones fit your profile.",
  },
  {
    question: "Can I start an online MBA and still keep CAT as an option?",
    answer:
      "Many aspirants keep doors open. Check each institute's eligibility rules and speak to our counsellors for a personalised view.",
  },
  {
    question: "Is a UGC-DEB approved online MBA equal to a regular MBA?",
    answer:
      "UGC regulations treat recognised online degrees as equivalent to conventional ones. Verify the university's entitlement for your session first.",
  },
  {
    question: "Can I do an online MBA while working full time?",
    answer:
      "Yes. Online MBA programmes for working professionals typically offer live classes and recorded lectures with flexible schedules.",
  },
];

async function addCat2026Post() {
  const wordCount = content.replace(/<[^>]*>/g, " ").split(/\s+/).filter(Boolean).length;
  const readTimeMinutes = Math.max(1, Math.round(wordCount / 200));

  const row = {
    title,
    slug: SLUG,
    excerpt,
    content,
    category: "Career Development",
    featured_image_url: "/images/blog/cat-2026-third-attempt.jpg",
    featured_image_alt:
      "A young professional in a blue blazer planning the next step after a third CAT attempt, with a notebook, laptop and whiteboard nearby.",
    author_name: "Whiteboard Consultants",
    status: "published",
    featured: false,
    published: true,
    tags: [
      "CAT 2026",
      "CAT retake",
      "Third attempt",
      "Online MBA",
      "Working professionals",
      "Career Development",
    ],
    seo_title: "CAT 2026 Third Attempt",
    seo_description: metaDescription,
    meta_description: metaDescription,
    faq_section: faqSection,
    read_time_minutes: readTimeMinutes,
    published_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data: existing, error: lookupError } = await supabase
    .from("posts")
    .select("id")
    .eq("slug", SLUG)
    .maybeSingle();

  if (lookupError) {
    console.error("Lookup failed:", lookupError);
    process.exit(1);
  }

  if (existing?.id) {
    const { error } = await supabase.from("posts").update(row).eq("id", existing.id);
    if (error) {
      console.error("Update failed:", error);
      process.exit(1);
    }
    console.log(`Updated existing post ${existing.id}`);
  } else {
    const { data, error } = await supabase
      .from("posts")
      .insert({ ...row, created_at: new Date().toISOString() })
      .select("id, slug")
      .single();
    if (error) {
      console.error("Insert failed:", error);
      process.exit(1);
    }
    console.log(`Created post ${data.id}`);
  }

  console.log(`Slug: /blog/${SLUG}`);
  console.log(`Words: ${wordCount}, read time: ${readTimeMinutes} min`);
  console.log(`Meta description length: ${metaDescription.length}`);
}

addCat2026Post();
