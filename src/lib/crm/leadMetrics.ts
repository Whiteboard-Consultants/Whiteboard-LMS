import { diffDays } from "@/lib/crm/dates";

export const CLOSED_STAGES = ["Enrolled (Won)", "Lost"] as const;

export type FollowUpStatus = "Closed" | "No Follow-up Set" | "Overdue" | "Due Today" | "Scheduled";

export type LeadGrade = "A" | "B" | "C";

export type ScoringConfig = {
  closureWeight: number;
  temperaturePoints: Record<string, number>;
  recencyWithin7: number;
  recencyWithin14: number;
  profileWeight: number;
  budgetPoints: number;
  gradeA: number;
  gradeB: number;
};

export type MetricActivity = {
  date: string;
  nextFollowUpDate: string | null;
  summary?: string | null;
  createdAt?: string | null;
};

export type MetricLead = {
  id: string;
  mobile: string | null;
  email: string | null;
  city: string | null;
  currentLevel: string | null;
  passoutYear: number | null;
  source: string | null;
  ownerId: string | null;
  productCategory: string | null;
  budget: number | null;
  stage: string | null;
  temperature: string | null;
  enquiryDate: string;
  firstContactDue: string | null;
  closedDate: string | null;
  lostReason: string | null;
  expectedValue: number | null;
  targetCountry: string | null;
  archived: boolean;
  activities: MetricActivity[];
};

export type LeadComputed = {
  businessVertical: string | null;
  firstContactDate: string | null;
  lastContactDate: string | null;
  contactAttempts: number;
  daysToFirstContact: number | null;
  daysSinceEnquiry: number;
  nextFollowUpDate: string | null;
  followUpStatus: FollowUpStatus;
  duplicate: boolean;
  profileCompleteness: number;
  closureProbability: number | null;
  weightedValue: number | null;
  leadScore: number | null;
  leadGrade: LeadGrade | null;
  dataAlert: string;
  latestNote: string | null;
  daysOverdue: number;
};

export type MetricsContext = {
  today: string;
  stageProbability: Record<string, number>;
  verticalByProduct: Record<string, string>;
  scoring: ScoringConfig;
  duplicate: boolean;
};

const STUDY_ABROAD = "Study Abroad";
const NA_COUNTRY = "N/A (Not Study Abroad)";

export function isClosedStage(stage: string | null | undefined): boolean {
  return stage === "Enrolled (Won)" || stage === "Lost";
}

function filled(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  return true;
}

export function computeNextFollowUp(
  lead: Pick<MetricLead, "activities" | "firstContactDue">,
): string | null {
  if (lead.activities.length === 0) return lead.firstContactDue;
  let lastContact: string | null = null;
  let maxFollow: string | null = null;
  for (const activity of lead.activities) {
    if (!lastContact || activity.date > lastContact) lastContact = activity.date;
    if (activity.nextFollowUpDate && (!maxFollow || activity.nextFollowUpDate > maxFollow)) {
      maxFollow = activity.nextFollowUpDate;
    }
  }
  if (!maxFollow || !lastContact || maxFollow <= lastContact) return null;
  return maxFollow;
}

export function profileCompleteness(lead: MetricLead): number {
  const fields = [
    lead.mobile,
    lead.email,
    lead.city,
    lead.currentLevel,
    lead.passoutYear,
    lead.source,
    lead.ownerId,
    lead.productCategory,
    lead.budget,
  ];
  const count = fields.filter(filled).length;
  return Math.round((count / 9) * 100) / 100;
}

function latestActivity(activities: MetricActivity[]): MetricActivity | null {
  let best: MetricActivity | null = null;
  for (const activity of activities) {
    if (!best) {
      best = activity;
      continue;
    }
    if (activity.date > best.date) {
      best = activity;
      continue;
    }
    if (activity.date === best.date && (activity.createdAt ?? "") >= (best.createdAt ?? "")) {
      best = activity;
    }
  }
  return best;
}

export function isStudyAbroadCountryMissing(
  productCategory: string | null,
  targetCountry: string | null,
): boolean {
  if (productCategory !== STUDY_ABROAD) return false;
  if (!targetCountry || !targetCountry.trim()) return true;
  const country = targetCountry.trim();
  return country === NA_COUNTRY || country.toUpperCase() === "N/A" || country.toUpperCase().startsWith("N/A ");
}

export function computeLeadMetrics(lead: MetricLead, ctx: MetricsContext): LeadComputed {
  const orderedDates = lead.activities.map((activity) => activity.date).sort();
  const firstContactDate = orderedDates[0] ?? null;
  const lastContactDate = orderedDates[orderedDates.length - 1] ?? null;
  const nextFollowUpDate = computeNextFollowUp(lead);

  let followUpStatus: FollowUpStatus;
  if (isClosedStage(lead.stage)) followUpStatus = "Closed";
  else if (!nextFollowUpDate) followUpStatus = "No Follow-up Set";
  else if (nextFollowUpDate < ctx.today) followUpStatus = "Overdue";
  else if (nextFollowUpDate === ctx.today) followUpStatus = "Due Today";
  else followUpStatus = "Scheduled";

  const completeness = profileCompleteness(lead);
  const probability = lead.stage ? (ctx.stageProbability[lead.stage] ?? 0) : null;
  const weightedValue =
    lead.expectedValue === null || lead.expectedValue === undefined || probability === null
      ? null
      : Math.round(lead.expectedValue * probability * 100) / 100;

  let leadScore: number | null = null;
  if (lead.stage && !isClosedStage(lead.stage)) {
    const temperaturePoints = ctx.scoring.temperaturePoints[lead.temperature ?? ""] ?? 0;
    let recency = 0;
    if (lastContactDate) {
      const daysSinceContact = diffDays(ctx.today, lastContactDate);
      if (daysSinceContact <= 7) recency = ctx.scoring.recencyWithin7;
      else if (daysSinceContact <= 14) recency = ctx.scoring.recencyWithin14;
    }
    const budgetPoints = filled(lead.budget) ? ctx.scoring.budgetPoints : 0;
    const raw =
      (probability ?? 0) * ctx.scoring.closureWeight +
      temperaturePoints +
      recency +
      completeness * ctx.scoring.profileWeight +
      budgetPoints;
    leadScore = Math.min(100, Math.round(raw));
  }

  let leadGrade: LeadGrade | null = null;
  if (leadScore !== null) {
    if (leadScore >= ctx.scoring.gradeA) leadGrade = "A";
    else if (leadScore >= ctx.scoring.gradeB) leadGrade = "B";
    else leadGrade = "C";
  }

  let dataAlert = "OK";
  if (!filled(lead.mobile)) dataAlert = "Missing mobile";
  else if (!filled(lead.ownerId)) dataAlert = "Assign owner";
  else if (!filled(lead.productCategory)) dataAlert = "Select product";
  else if (isStudyAbroadCountryMissing(lead.productCategory, lead.targetCountry)) {
    dataAlert = "Set target country";
  } else if (lead.stage === "Lost" && !filled(lead.lostReason)) dataAlert = "Add lost reason";
  else if ((lead.stage === "Enrolled (Won)" || lead.stage === "Lost") && !filled(lead.closedDate)) {
    dataAlert = "Add closed date";
  } else if (followUpStatus === "No Follow-up Set") dataAlert = "Set next follow-up";

  const latest = latestActivity(lead.activities);

  return {
    businessVertical: lead.productCategory
      ? (ctx.verticalByProduct[lead.productCategory] ?? null)
      : null,
    firstContactDate,
    lastContactDate,
    contactAttempts: lead.activities.length,
    daysToFirstContact: firstContactDate ? diffDays(firstContactDate, lead.enquiryDate) : null,
    daysSinceEnquiry: diffDays(ctx.today, lead.enquiryDate),
    nextFollowUpDate,
    followUpStatus,
    duplicate: ctx.duplicate,
    profileCompleteness: completeness,
    closureProbability: probability,
    weightedValue,
    leadScore,
    leadGrade,
    dataAlert,
    latestNote: latest?.summary?.trim() ? latest.summary.trim() : null,
    daysOverdue:
      followUpStatus === "Overdue" && nextFollowUpDate ? diffDays(ctx.today, nextFollowUpDate) : 0,
  };
}

export function duplicateIdSet(
  leads: { id: string; mobile: string | null; email: string | null; archived: boolean }[],
): Set<string> {
  const byMobile = new Map<string, string[]>();
  const byEmail = new Map<string, string[]>();

  for (const lead of leads) {
    if (lead.archived) continue;
    const mobile = lead.mobile?.trim();
    const email = lead.email?.trim().toLowerCase();
    if (mobile) {
      const list = byMobile.get(mobile) ?? [];
      list.push(lead.id);
      byMobile.set(mobile, list);
    }
    if (email) {
      const list = byEmail.get(email) ?? [];
      list.push(lead.id);
      byEmail.set(email, list);
    }
  }

  const ids = new Set<string>();
  for (const list of byMobile.values()) {
    if (list.length > 1) list.forEach((id) => ids.add(id));
  }
  for (const list of byEmail.values()) {
    if (list.length > 1) list.forEach((id) => ids.add(id));
  }
  return ids;
}
