import type { ScoringConfig } from "@/lib/crm/leadMetrics";

export const CLOSED_STAGE_LABELS = ["Enrolled (Won)", "Lost"] as const;

export const STUDY_ABROAD_PRODUCT = "Study Abroad";
export const NOT_STUDY_ABROAD_COUNTRY = "N/A (Not Study Abroad)";

export const BUSINESS_VERTICALS = [
  "Upskilling",
  "Language & Communication",
  "Study Abroad",
  "Domestic Admissions",
] as const;

export const DEFAULT_SCORING: ScoringConfig = {
  closureWeight: 40,
  temperaturePoints: { Hot: 25, Warm: 15, Cold: 5 },
  recencyWithin7: 15,
  recencyWithin14: 8,
  profileWeight: 10,
  budgetPoints: 10,
  gradeA: 70,
  gradeB: 45,
};

export const DEFAULT_LEAD_PREFIX = "WC-";
export const DEFAULT_FIRST_CONTACT_DAYS = 1;

export type LookupSeed = {
  type: string;
  label: string;
  sortOrder: number;
  meta?: Record<string, string | number | boolean>;
};

const productVertical: Record<string, string> = {
  "Upskilling - Certification Programs": "Upskilling",
  "Upskilling - PG Programs": "Upskilling",
  "English Proficiency": "Language & Communication",
  "Public Speaking": "Language & Communication",
  "Corporate Communication": "Language & Communication",
  "Basic Spoken English": "Language & Communication",
  "Study Abroad": "Study Abroad",
  "Domestic UG / PG Admissions": "Domestic Admissions",
};

export const PRODUCT_VERTICALS = productVertical;

export function defaultStageProbability(): Record<string, number> {
  return Object.fromEntries(STAGE_SEEDS.map((stage) => [stage.label, stage.probability]));
}

export const STAGE_SEEDS: { label: string; probability: number; closed: boolean }[] = [
  { label: "New Lead", probability: 0.1, closed: false },
  { label: "Contacted", probability: 0.2, closed: false },
  { label: "Counselling Scheduled", probability: 0.3, closed: false },
  { label: "Counselling Done", probability: 0.45, closed: false },
  { label: "Proposal / Quote Sent", probability: 0.6, closed: false },
  { label: "Application In Progress", probability: 0.8, closed: false },
  { label: "Enrolled (Won)", probability: 1, closed: true },
  { label: "On Hold", probability: 0.05, closed: false },
  { label: "Lost", probability: 0, closed: true },
];

export const LOOKUP_SEEDS: LookupSeed[] = [
  ...[
    "Website Form",
    "Instagram",
    "Facebook / Meta Ads",
    "Google Ads",
    "WhatsApp",
    "Walk-in",
    "Referral",
    "School / College Seminar",
    "Webinar / Event",
    "Cold Call / Database",
    "Other",
  ].map((label, index) => ({ type: "source", label, sortOrder: index + 1 })),
  ...[
    "Class 11",
    "Class 12",
    "UG Pursuing",
    "Graduate",
    "PG Pursuing",
    "Post Graduate",
    "Working Professional",
  ].map((label, index) => ({ type: "currentLevel", label, sortOrder: index + 1 })),
  ...Object.entries(productVertical).map(([label, vertical], index) => ({
    type: "productCategory",
    label,
    sortOrder: index + 1,
    meta: { vertical },
  })),
  ...[
    "United States",
    "Canada",
    "United Kingdom",
    "Ireland",
    "Germany",
    "France",
    "Spain",
    "Malta",
    "Dubai/UAE",
    "Singapore",
    "Other EU Nations",
    "Australia",
    "New Zealand",
    NOT_STUDY_ABROAD_COUNTRY,
  ].map((label, index) => ({ type: "targetCountry", label, sortOrder: index + 1 })),
  ...STAGE_SEEDS.map((stage, index) => ({
    type: "stage",
    label: stage.label,
    sortOrder: index + 1,
    meta: { probability: stage.probability, closed: stage.closed },
  })),
  ...["Hot", "Warm", "Cold"].map((label, index) => ({
    type: "temperature",
    label,
    sortOrder: index + 1,
  })),
  ...[
    "Budget constraints",
    "Chose competitor",
    "Not responding",
    "Not eligible",
    "Changed plans",
    "Timing not right",
    "Other",
  ].map((label, index) => ({ type: "lostReason", label, sortOrder: index + 1 })),
  ...["Call", "WhatsApp", "Email", "Video Call", "Meeting (In-person)", "Walk-in"].map(
    (label, index) => ({ type: "channel", label, sortOrder: index + 1 }),
  ),
  ...[
    "Connected - Interested",
    "Connected - Not Interested",
    "Not Reachable",
    "Callback Requested",
    "Counselling Done",
    "Proposal Shared",
    "Payment Received",
    "Other",
  ].map((label, index) => ({ type: "outcome", label, sortOrder: index + 1 })),
];

export const LOOKUP_TYPES = [
  { type: "source", label: "Lead source" },
  { type: "currentLevel", label: "Current level" },
  { type: "productCategory", label: "Product category" },
  { type: "targetCountry", label: "Target country" },
  { type: "stage", label: "Lead stage" },
  { type: "temperature", label: "Lead temperature" },
  { type: "lostReason", label: "Lost reason" },
  { type: "channel", label: "Contact channel" },
  { type: "outcome", label: "Contact outcome" },
] as const;

export const DATA_ALERTS = [
  "Missing mobile",
  "Assign owner",
  "Select product",
  "Set target country",
  "Add lost reason",
  "Add closed date",
  "Set next follow-up",
  "OK",
] as const;

export const COLUMN_GROUPS: Record<string, string[]> = {
  Capture: [
    "leadCode",
    "name",
    "enquiryDate",
    "source",
    "campaign",
    "ownerName",
    "mobile",
    "email",
    "consent",
  ],
  Profile: [
    "leadCode",
    "name",
    "city",
    "currentLevel",
    "passoutYear",
    "stream",
    "institution",
    "parentName",
    "parentMobile",
    "profileCompleteness",
  ],
  Interest: [
    "leadCode",
    "name",
    "productCategory",
    "businessVertical",
    "programmeDetail",
    "targetCountry",
    "targetIntake",
    "budget",
  ],
  Pipeline: [
    "leadCode",
    "name",
    "stage",
    "temperature",
    "firstContactDue",
    "counsellingDate",
    "followUpStatus",
    "nextFollowUpDate",
    "closedDate",
    "lostReason",
  ],
  Scoring: [
    "leadCode",
    "name",
    "leadScore",
    "leadGrade",
    "dataAlert",
    "duplicate",
    "contactAttempts",
    "daysToFirstContact",
    "daysSinceEnquiry",
    "firstContactDate",
    "lastContactDate",
  ],
  Value: ["leadCode", "name", "expectedValue", "closureProbability", "weightedValue", "remarks"],
};

export const IMPORT_FIELDS = [
  { key: "name", label: "Name", required: true },
  { key: "enquiryDate", label: "Enquiry date" },
  { key: "source", label: "Source" },
  { key: "campaign", label: "Campaign" },
  { key: "ownerEmail", label: "Owner email" },
  { key: "mobile", label: "Mobile" },
  { key: "email", label: "Email" },
  { key: "city", label: "City" },
  { key: "currentLevel", label: "Current level" },
  { key: "passoutYear", label: "Passout year" },
  { key: "stream", label: "Stream" },
  { key: "institution", label: "Institution" },
  { key: "parentName", label: "Parent name" },
  { key: "parentMobile", label: "Parent mobile" },
  { key: "consent", label: "Consent" },
  { key: "productCategory", label: "Product category" },
  { key: "programmeDetail", label: "Programme detail" },
  { key: "targetCountry", label: "Target country" },
  { key: "targetIntake", label: "Target intake" },
  { key: "budget", label: "Budget" },
  { key: "stage", label: "Stage" },
  { key: "temperature", label: "Temperature" },
  { key: "firstContactDue", label: "First contact due" },
  { key: "counsellingDate", label: "Counselling date" },
  { key: "expectedValue", label: "Expected value" },
  { key: "closedDate", label: "Closed date" },
  { key: "lostReason", label: "Lost reason" },
  { key: "remarks", label: "Remarks" },
] as const;

export type ImportFieldKey = (typeof IMPORT_FIELDS)[number]["key"];
