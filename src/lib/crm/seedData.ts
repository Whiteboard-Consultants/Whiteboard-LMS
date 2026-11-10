import { addDays } from "@/lib/crm/dates";
import type { MetricActivity, MetricLead } from "@/lib/crm/leadMetrics";

export type SeedActivity = {
  date: string;
  channel: string;
  outcome: string;
  summary: string;
  nextFollowUpDate: string | null;
  nextAction: string | null;
};

export type SeedLead = {
  leadCode: string;
  name: string;
  enquiryDate: string;
  source: string;
  ownerName: string;
  mobile: string;
  email: string;
  city: string;
  currentLevel: string;
  passoutYear: number;
  stream: string;
  institution: string;
  parentName: string | null;
  parentMobile: string | null;
  consent: boolean;
  productCategory: string;
  programmeDetail: string;
  targetCountry: string;
  targetIntake: string;
  budget: number;
  stage: string;
  temperature: string;
  expectedValue: number;
  counsellingDate: string | null;
  firstContactDue: string | null;
  closedDate: string | null;
  lostReason: string | null;
  remarks: string;
  campaign: string | null;
  activities: SeedActivity[];
};

export const SEED_USERS = [
  { name: "Admin", email: "admin@example.com", role: "ADMIN" },
  { name: "Counsellor 1", email: "counsellor1@example.com", role: "COUNSELLOR" },
  { name: "Counsellor 2", email: "counsellor2@example.com", role: "COUNSELLOR" },
  { name: "Counsellor 3", email: "counsellor3@example.com", role: "COUNSELLOR" },
] as const;

export const SEED_PASSWORD = "ChangeMe123!";

export function buildSeedLeads(today: string): SeedLead[] {
  const d = (offset: number) => addDays(today, offset);

  return [
    {
      leadCode: "WC-0001",
      name: "Aarav Sen",
      enquiryDate: d(-12),
      source: "Instagram",
      ownerName: "Counsellor 1",
      mobile: "9830000001",
      email: "aarav.sen@example.com",
      city: "Kolkata",
      currentLevel: "Graduate",
      passoutYear: 2026,
      stream: "B.Tech CSE",
      institution: "Jadavpur University",
      parentName: null,
      parentMobile: null,
      consent: true,
      productCategory: "Study Abroad",
      programmeDetail: "MS Computer Science",
      targetCountry: "Canada",
      targetIntake: "Fall 2027",
      budget: 3500000,
      stage: "Counselling Done",
      temperature: "Hot",
      expectedValue: 75000,
      counsellingDate: d(-4),
      firstContactDue: null,
      closedDate: null,
      lostReason: null,
      remarks: "Wants co-op options in Canada.",
      campaign: "Canada MS — Instagram",
      activities: [
        {
          date: d(-11),
          channel: "Call",
          outcome: "Connected - Interested",
          summary: "Spoke with Aarav; he is keen on an MS in Canada and asked to book counselling.",
          nextFollowUpDate: d(-4),
          nextAction: "Book counselling",
        },
        {
          date: d(-4),
          channel: "Meeting (In-person)",
          outcome: "Counselling Done",
          summary: "In-person counselling completed. Aarav will share a draft statement of purpose.",
          nextFollowUpDate: d(3),
          nextAction: "Collect SOP draft",
        },
        {
          date: d(-3),
          channel: "WhatsApp",
          outcome: "Connected - Interested",
          summary: "WhatsApp follow-up. Aarav confirmed he will send the SOP draft.",
          nextFollowUpDate: d(3),
          nextAction: "Collect SOP draft",
        },
      ],
    },
    {
      leadCode: "WC-0002",
      name: "Priya Das",
      enquiryDate: d(-6),
      source: "Google Ads",
      ownerName: "Counsellor 2",
      mobile: "9830000002",
      email: "priya.das@example.com",
      city: "Howrah",
      currentLevel: "Working Professional",
      passoutYear: 2019,
      stream: "B.Com",
      institution: "University of Calcutta",
      parentName: null,
      parentMobile: null,
      consent: true,
      productCategory: "Upskilling - PG Programs",
      programmeDetail: "Executive PG in Data Analytics",
      targetCountry: "N/A (Not Study Abroad)",
      targetIntake: "Jan 2027",
      budget: 250000,
      stage: "Proposal / Quote Sent",
      temperature: "Warm",
      expectedValue: 30000,
      counsellingDate: d(-4),
      firstContactDue: null,
      closedDate: null,
      lostReason: null,
      remarks: "Prefers weekend classes.",
      campaign: "PG Data Analytics",
      activities: [
        {
          date: d(-5),
          channel: "Call",
          outcome: "Not Reachable",
          summary: "Called Priya. The phone was not reachable, so a retry was scheduled.",
          nextFollowUpDate: d(-4),
          nextAction: "Retry call",
        },
        {
          date: d(-4),
          channel: "Video Call",
          outcome: "Counselling Done",
          summary: "Video counselling completed for the executive PG in data analytics.",
          nextFollowUpDate: d(-2),
          nextAction: "Send quote",
        },
        {
          date: d(-2),
          channel: "Email",
          outcome: "Proposal Shared",
          summary: "Emailed the fee quote and the instalment options.",
          nextFollowUpDate: d(-1),
          nextAction: "Follow-up call on instalments",
        },
      ],
    },
    {
      leadCode: "WC-0003",
      name: "Rohit Mukherjee",
      enquiryDate: d(-4),
      source: "Walk-in",
      ownerName: "Counsellor 1",
      mobile: "9830000003",
      email: "rohit.mukherjee@example.com",
      city: "Kolkata",
      currentLevel: "Class 12",
      passoutYear: 2027,
      stream: "Science (PCM)",
      institution: "South Point High School",
      parentName: "Anita Mukherjee",
      parentMobile: "9831000003",
      consent: true,
      productCategory: "Domestic UG / PG Admissions",
      programmeDetail: "B.Tech admissions 2027",
      targetCountry: "N/A (Not Study Abroad)",
      targetIntake: "2027",
      budget: 600000,
      stage: "Contacted",
      temperature: "Warm",
      expectedValue: 20000,
      counsellingDate: null,
      firstContactDue: null,
      closedDate: null,
      lostReason: null,
      remarks: "Parents want a college in Kolkata or Bangalore.",
      campaign: null,
      activities: [
        {
          date: d(-3),
          channel: "Call",
          outcome: "Connected - Interested",
          summary:
            "Rohit is interested in B.Tech admissions for 2027. A meeting with his parents still needs to be fixed.",
          nextFollowUpDate: d(0),
          nextAction: "Fix parents meeting",
        },
      ],
    },
    {
      leadCode: "WC-0004",
      name: "Ananya Ghosh",
      enquiryDate: d(-25),
      source: "Referral",
      ownerName: "Counsellor 3",
      mobile: "9830000004",
      email: "ananya.ghosh@example.com",
      city: "Salt Lake",
      currentLevel: "UG Pursuing",
      passoutYear: 2027,
      stream: "BBA",
      institution: "The Bhawanipur Education Society College",
      parentName: null,
      parentMobile: null,
      consent: true,
      productCategory: "Corporate Communication",
      programmeDetail: "Corporate Communication Workshop",
      targetCountry: "N/A (Not Study Abroad)",
      targetIntake: "Dec 2026",
      budget: 15000,
      stage: "Enrolled (Won)",
      temperature: "Hot",
      expectedValue: 12000,
      counsellingDate: d(-20),
      firstContactDue: null,
      closedDate: d(-10),
      lostReason: null,
      remarks: "Enrolled for the December workshop.",
      campaign: "Referral programme",
      activities: [
        {
          date: d(-24),
          channel: "Call",
          outcome: "Connected - Interested",
          summary: "Ananya is interested in the corporate communication workshop. Counselling was booked.",
          nextFollowUpDate: d(-20),
          nextAction: "Counselling session",
        },
        {
          date: d(-20),
          channel: "Meeting (In-person)",
          outcome: "Counselling Done",
          summary: "Completed counselling and shared the enrolment steps.",
          nextFollowUpDate: d(-10),
          nextAction: "Collect payment",
        },
        {
          date: d(-10),
          channel: "Call",
          outcome: "Payment Received",
          summary: "Payment received and the enrolment was confirmed.",
          nextFollowUpDate: null,
          nextAction: null,
        },
      ],
    },
    {
      leadCode: "WC-0005",
      name: "Sneha Roy",
      enquiryDate: d(-2),
      source: "Facebook / Meta Ads",
      ownerName: "Counsellor 2",
      mobile: "9830000005",
      email: "sneha.roy@example.com",
      city: "Durgapur",
      currentLevel: "Graduate",
      passoutYear: 2025,
      stream: "B.A. English",
      institution: "University of Burdwan",
      parentName: null,
      parentMobile: null,
      consent: true,
      productCategory: "English Proficiency",
      programmeDetail: "IELTS Preparation",
      targetCountry: "United Kingdom",
      targetIntake: "Sep 2027",
      budget: 20000,
      stage: "New Lead",
      temperature: "Warm",
      expectedValue: 18000,
      counsellingDate: null,
      firstContactDue: d(1),
      closedDate: null,
      lostReason: null,
      remarks: "Targeting an IELTS score of 7.5.",
      campaign: "IELTS Sept 2027",
      activities: [],
    },
    {
      leadCode: "WC-0006",
      name: "Imran Sheikh",
      enquiryDate: d(-50),
      source: "School / College Seminar",
      ownerName: "Counsellor 3",
      mobile: "9830000006",
      email: "imran.sheikh@example.com",
      city: "Kolkata",
      currentLevel: "Class 11",
      passoutYear: 2028,
      stream: "Commerce",
      institution: "Don Bosco School, Park Circus",
      parentName: null,
      parentMobile: null,
      consent: true,
      productCategory: "Basic Spoken English",
      programmeDetail: "Spoken English - Foundation",
      targetCountry: "N/A (Not Study Abroad)",
      targetIntake: "Nov 2026",
      budget: 6000,
      stage: "Lost",
      temperature: "Cold",
      expectedValue: 8000,
      counsellingDate: null,
      firstContactDue: null,
      closedDate: d(-28),
      lostReason: "Budget constraints",
      remarks: "Lost on budget after the fee discussion.",
      campaign: "School seminar",
      activities: [
        {
          date: d(-48),
          channel: "Call",
          outcome: "Connected - Interested",
          summary: "Imran showed interest in spoken English. Fee details were promised.",
          nextFollowUpDate: d(-40),
          nextAction: "Share fee details",
        },
        {
          date: d(-30),
          channel: "Call",
          outcome: "Connected - Not Interested",
          summary: "Imran said the fee does not fit the family budget and will not continue.",
          nextFollowUpDate: null,
          nextAction: null,
        },
      ],
    },
  ];
}

export function seedLeadToMetric(
  lead: SeedLead,
  ownerId: string,
): MetricLead & { ownerName: string; leadCode: string } {
  const activities: MetricActivity[] = lead.activities.map((activity) => ({
    date: activity.date,
    nextFollowUpDate: activity.nextFollowUpDate,
    summary: activity.summary,
  }));

  return {
    id: lead.leadCode,
    leadCode: lead.leadCode,
    ownerName: lead.ownerName,
    mobile: lead.mobile,
    email: lead.email,
    city: lead.city,
    currentLevel: lead.currentLevel,
    passoutYear: lead.passoutYear,
    source: lead.source,
    ownerId,
    productCategory: lead.productCategory,
    budget: lead.budget,
    stage: lead.stage,
    temperature: lead.temperature,
    enquiryDate: lead.enquiryDate,
    firstContactDue: lead.firstContactDue,
    closedDate: lead.closedDate,
    lostReason: lead.lostReason,
    expectedValue: lead.expectedValue,
    targetCountry: lead.targetCountry,
    archived: false,
    activities,
  };
}
