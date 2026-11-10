import { last12MonthKeys } from "@/lib/crm/dates";
import { isClosedStage, type FollowUpStatus } from "@/lib/crm/leadMetrics";

export type DashboardLead = {
  archived: boolean;
  ownerId: string | null;
  ownerName?: string | null;
  enquiryDate: string;
  closedDate: string | null;
  stage: string | null;
  temperature: string | null;
  productCategory: string | null;
  source: string | null;
  targetCountry: string | null;
  expectedValue: number | null;
  followUpStatus: FollowUpStatus;
  daysToFirstContact: number | null;
  leadScore: number | null;
  dataAlert: string;
  weightedValue: number | null;
};

export type SliceRow = {
  key: string;
  leads: number;
  enrolled: number;
  conversionPct: number;
  revenueWon: number;
  weightedOpenPipeline: number;
};

export type DashboardTrendPoint = {
  month: string;
  newLeads: number;
  enrolled: number;
  revenue: number;
};

export type DashboardResult = {
  kpis: {
    totalLeads: number;
    openLeads: number;
    hotOpenLeads: number;
    enrolled: number;
    lost: number;
    conversionPct: number;
    overdueFollowUps: number;
    dueToday: number;
    revenueWon: number;
    avgDaysToFirstContact: number | null;
    weightedOpenPipeline: number;
    avgLeadScore: number | null;
    dataAlerts: number;
  };
  byStage: SliceRow[];
  byProduct: SliceRow[];
  bySource: SliceRow[];
  byCountry: SliceRow[];
  byCounsellor: SliceRow[];
  trend: DashboardTrendPoint[];
};

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function isEnrolled(lead: DashboardLead): boolean {
  return lead.stage === "Enrolled (Won)";
}

function isLost(lead: DashboardLead): boolean {
  return lead.stage === "Lost";
}

function isOpen(lead: DashboardLead): boolean {
  return !isClosedStage(lead.stage);
}

function sliceBy(
  leads: DashboardLead[],
  keyFn: (lead: DashboardLead) => string,
  order?: string[],
): SliceRow[] {
  const groups = new Map<string, DashboardLead[]>();
  for (const lead of leads) {
    const key = keyFn(lead);
    const list = groups.get(key) ?? [];
    list.push(lead);
    groups.set(key, list);
  }

  const keys = order
    ? [...order, ...[...groups.keys()].filter((key) => !order.includes(key))]
    : [...groups.keys()].sort((a, b) => a.localeCompare(b));

  return keys.map((key) => {
    const rows = groups.get(key) ?? [];
    const enrolled = rows.filter(isEnrolled);
    const open = rows.filter(isOpen);
    return {
      key,
      leads: rows.length,
      enrolled: enrolled.length,
      conversionPct: rows.length ? round1((enrolled.length / rows.length) * 100) : 0,
      revenueWon: enrolled.reduce((sum, lead) => sum + (lead.expectedValue ?? 0), 0),
      weightedOpenPipeline:
        Math.round(open.reduce((sum, lead) => sum + (lead.weightedValue ?? 0), 0) * 100) / 100,
    };
  });
}

export function computeDashboard(
  leads: DashboardLead[],
  options: {
    today: string;
    stageOrder: string[];
    ownerId?: string | null;
    enquiryFrom?: string | null;
    enquiryTo?: string | null;
  },
): DashboardResult {
  const active = leads.filter((lead) => !lead.archived);
  const owned = options.ownerId ? active.filter((lead) => lead.ownerId === options.ownerId) : active;
  const filtered = owned.filter((lead) => {
    if (options.enquiryFrom && lead.enquiryDate < options.enquiryFrom) return false;
    if (options.enquiryTo && lead.enquiryDate > options.enquiryTo) return false;
    return true;
  });

  const open = filtered.filter(isOpen);
  const enrolled = filtered.filter(isEnrolled);
  const lost = filtered.filter(isLost);
  const firstContactDays = filtered
    .map((lead) => lead.daysToFirstContact)
    .filter((value): value is number => value !== null);
  const scores = open
    .map((lead) => lead.leadScore)
    .filter((value): value is number => value !== null);

  const kpis = {
    totalLeads: filtered.length,
    openLeads: open.length,
    hotOpenLeads: open.filter((lead) => lead.temperature === "Hot").length,
    enrolled: enrolled.length,
    lost: lost.length,
    conversionPct: filtered.length ? round1((enrolled.length / filtered.length) * 100) : 0,
    overdueFollowUps: filtered.filter((lead) => lead.followUpStatus === "Overdue").length,
    dueToday: filtered.filter((lead) => lead.followUpStatus === "Due Today").length,
    revenueWon: enrolled.reduce((sum, lead) => sum + (lead.expectedValue ?? 0), 0),
    avgDaysToFirstContact: firstContactDays.length
      ? round1(firstContactDays.reduce((sum, value) => sum + value, 0) / firstContactDays.length)
      : null,
    weightedOpenPipeline:
      Math.round(open.reduce((sum, lead) => sum + (lead.weightedValue ?? 0), 0) * 100) / 100,
    avgLeadScore: scores.length
      ? round1(scores.reduce((sum, value) => sum + value, 0) / scores.length)
      : null,
    dataAlerts: filtered.filter((lead) => lead.dataAlert !== "OK").length,
  };

  const months = last12MonthKeys(options.today);
  const trend = months.map((month) => {
    const won = owned.filter((lead) => isEnrolled(lead) && lead.closedDate?.slice(0, 7) === month);
    return {
      month,
      newLeads: owned.filter((lead) => lead.enquiryDate.slice(0, 7) === month).length,
      enrolled: won.length,
      revenue: won.reduce((sum, lead) => sum + (lead.expectedValue ?? 0), 0),
    };
  });

  return {
    kpis,
    byStage: sliceBy(filtered, (lead) => lead.stage || "(No stage)", options.stageOrder),
    byProduct: sliceBy(filtered, (lead) => lead.productCategory || "(No product)"),
    bySource: sliceBy(filtered, (lead) => lead.source || "(No source)"),
    byCountry: sliceBy(filtered, (lead) => lead.targetCountry || "(No country)"),
    byCounsellor: sliceBy(filtered, (lead) => lead.ownerName || "Unassigned"),
    trend,
  };
}
