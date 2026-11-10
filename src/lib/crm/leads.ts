import type { Prisma } from "@prisma/client";
import { addDays, dbToIso, isoToDb, kolkataToday } from "@/lib/crm/dates";
import { clearCrmCache } from "@/lib/crm/cache";
import { prisma } from "@/lib/crm/db";
import { getCrmReference } from "@/lib/crm/reference";
import { computeLeadMetrics, type LeadComputed, type MetricLead } from "@/lib/crm/leadMetrics";
import { allocateLeadCode, metricContext, nextCounsellorId, productCategoriesForVertical } from "@/lib/crm/settings";

export type LeadInput = {
  name: string;
  enquiryDate: string | null;
  source: string | null;
  campaign: string | null;
  ownerId: string | null;
  mobile: string | null;
  email: string | null;
  city: string | null;
  currentLevel: string | null;
  passoutYear: number | null;
  stream: string | null;
  institution: string | null;
  parentName: string | null;
  parentMobile: string | null;
  consent: boolean;
  productCategory: string | null;
  programmeDetail: string | null;
  targetCountry: string | null;
  targetIntake: string | null;
  budget: number | null;
  stage: string | null;
  temperature: string | null;
  firstContactDue: string | null;
  counsellingDate: string | null;
  expectedValue: number | null;
  closedDate: string | null;
  lostReason: string | null;
  remarks: string | null;
};

export type LeadView = Omit<LeadInput, "enquiryDate" | "firstContactDue" | "counsellingDate" | "closedDate"> & {
  id: string;
  leadCode: string;
  enquiryDate: string;
  firstContactDue: string | null;
  counsellingDate: string | null;
  closedDate: string | null;
  ownerName: string | null;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
} & LeadComputed;

export type LeadQuery = {
  search?: string;
  ownerId?: string;
  stage?: string;
  productCategory?: string;
  vertical?: string;
  source?: string;
  targetCountry?: string;
  temperature?: string;
  grade?: string;
  status?: string;
  duplicate?: string;
  dataAlert?: string;
  enquiryFrom?: string;
  enquiryTo?: string;
  archived?: string;
  sort?: string;
  dir?: "asc" | "desc";
  page?: number;
  pageSize?: number;
  exportAll?: boolean;
};

const leadSelect = {
  id: true,
  leadCode: true,
  name: true,
  enquiryDate: true,
  source: true,
  campaign: true,
  ownerId: true,
  mobile: true,
  email: true,
  city: true,
  currentLevel: true,
  passoutYear: true,
  stream: true,
  institution: true,
  parentName: true,
  parentMobile: true,
  consent: true,
  productCategory: true,
  programmeDetail: true,
  targetCountry: true,
  targetIntake: true,
  budget: true,
  stage: true,
  temperature: true,
  firstContactDue: true,
  counsellingDate: true,
  expectedValue: true,
  closedDate: true,
  lostReason: true,
  remarks: true,
  archived: true,
  createdAt: true,
  updatedAt: true,
  owner: { select: { id: true, name: true } },
  activities: {
    select: { date: true, nextFollowUpDate: true, summary: true, createdAt: true },
    orderBy: [{ date: "desc" as const }, { createdAt: "desc" as const }],
  },
} satisfies Prisma.LeadSelect;

type LeadRow = Prisma.LeadGetPayload<{ select: typeof leadSelect }>;

const DERIVED_SORTS = new Set([
  "leadScore",
  "leadGrade",
  "followUpStatus",
  "nextFollowUpDate",
  "daysOverdue",
  "weightedValue",
  "profileCompleteness",
  "contactAttempts",
  "daysSinceEnquiry",
  "daysToFirstContact",
  "dataAlert",
  "duplicate",
  "businessVertical",
]);

export function normalizeMobile(input: string | null | undefined): string | null {
  if (!input) return null;
  const digits = input.replace(/\D/g, "");
  if (!digits) return null;
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) return digits.slice(1);
  return digits;
}

function contains(value: string): Prisma.StringFilter {
  if ((process.env.DATABASE_URL ?? "").startsWith("postgres")) {
    return { contains: value, mode: "insensitive" } as Prisma.StringFilter;
  }
  return { contains: value };
}

function needsFullScan(query: LeadQuery): boolean {
  return Boolean(
    query.exportAll ||
      query.grade ||
      query.status ||
      query.duplicate ||
      query.dataAlert ||
      (query.sort && DERIVED_SORTS.has(query.sort)),
  );
}

async function buildWhere(query: LeadQuery, actorId: string, isAdmin: boolean): Promise<Prisma.LeadWhereInput> {
  const where: Prisma.LeadWhereInput = {};
  if (!isAdmin || query.archived === "false" || !query.archived) where.archived = false;
  else if (query.archived === "true") where.archived = true;

  if (query.ownerId === "me") where.ownerId = actorId;
  else if (query.ownerId === "unassigned") where.ownerId = null;
  else if (query.ownerId) where.ownerId = query.ownerId;

  if (query.stage) where.stage = query.stage;
  if (query.productCategory) where.productCategory = query.productCategory;
  if (query.source) where.source = query.source;
  if (query.targetCountry) where.targetCountry = query.targetCountry;
  if (query.temperature) where.temperature = query.temperature;
  if (query.vertical) {
    const categories = await productCategoriesForVertical(query.vertical);
    where.productCategory = { in: categories.length > 0 ? categories : ["__none__"] };
  }

  if (query.enquiryFrom || query.enquiryTo) {
    where.enquiryDate = {};
    if (query.enquiryFrom) where.enquiryDate.gte = isoToDb(query.enquiryFrom);
    if (query.enquiryTo) where.enquiryDate.lte = isoToDb(query.enquiryTo);
  }

  const search = query.search?.trim();
  if (search) {
    where.OR = [
      { name: contains(search) },
      { mobile: contains(search) },
      { email: contains(search) },
      { leadCode: contains(search) },
    ];
  }
  return where;
}

async function duplicateSets() {
  const reference = await getCrmReference();
  return {
    mobiles: new Set(reference.duplicateMobiles),
    emails: new Set(reference.duplicateEmails),
  };
}

function rowIsDuplicate(row: LeadRow, sets: { mobiles: Set<string>; emails: Set<string> }): boolean {
  if (row.archived) return false;
  const mobile = row.mobile?.trim();
  const email = row.email?.trim().toLowerCase();
  return Boolean((mobile && sets.mobiles.has(mobile)) || (email && sets.emails.has(email)));
}

function toView(
  row: LeadRow,
  ctx: Awaited<ReturnType<typeof metricContext>>,
  sets: { mobiles: Set<string>; emails: Set<string> },
): LeadView {
  const metricLead: MetricLead = {
    id: row.id,
    mobile: row.mobile,
    email: row.email,
    city: row.city,
    currentLevel: row.currentLevel,
    passoutYear: row.passoutYear,
    source: row.source,
    ownerId: row.ownerId,
    productCategory: row.productCategory,
    budget: row.budget,
    stage: row.stage,
    temperature: row.temperature,
    enquiryDate: dbToIso(row.enquiryDate) ?? ctx.today,
    firstContactDue: dbToIso(row.firstContactDue),
    closedDate: dbToIso(row.closedDate),
    lostReason: row.lostReason,
    expectedValue: row.expectedValue,
    targetCountry: row.targetCountry,
    archived: row.archived,
    activities: row.activities.map((activity) => ({
      date: dbToIso(activity.date) ?? ctx.today,
      nextFollowUpDate: dbToIso(activity.nextFollowUpDate),
      summary: activity.summary,
      createdAt: activity.createdAt.toISOString(),
    })),
  };
  const computed = computeLeadMetrics(metricLead, {
    today: ctx.today,
    stageProbability: ctx.stageProbability,
    verticalByProduct: ctx.verticalByProduct,
    scoring: ctx.scoring,
    duplicate: rowIsDuplicate(row, sets),
  });
  return {
    id: row.id,
    leadCode: row.leadCode,
    name: row.name,
    enquiryDate: metricLead.enquiryDate,
    source: row.source,
    campaign: row.campaign,
    ownerId: row.ownerId,
    ownerName: row.owner?.name ?? null,
    mobile: row.mobile,
    email: row.email,
    city: row.city,
    currentLevel: row.currentLevel,
    passoutYear: row.passoutYear,
    stream: row.stream,
    institution: row.institution,
    parentName: row.parentName,
    parentMobile: row.parentMobile,
    consent: row.consent,
    productCategory: row.productCategory,
    programmeDetail: row.programmeDetail,
    targetCountry: row.targetCountry,
    targetIntake: row.targetIntake,
    budget: row.budget,
    stage: row.stage,
    temperature: row.temperature,
    firstContactDue: metricLead.firstContactDue,
    counsellingDate: dbToIso(row.counsellingDate),
    expectedValue: row.expectedValue,
    closedDate: metricLead.closedDate,
    lostReason: row.lostReason,
    remarks: row.remarks,
    archived: row.archived,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    ...computed,
  };
}

function applyDerived(views: LeadView[], query: LeadQuery): LeadView[] {
  let rows = views;
  if (query.status) {
    const allowed = new Set(query.status.split(",").map((item) => item.trim()).filter(Boolean));
    rows = rows.filter((lead) => allowed.has(lead.followUpStatus));
  }
  if (query.grade) rows = rows.filter((lead) => lead.leadGrade === query.grade);
  if (query.duplicate === "true") rows = rows.filter((lead) => lead.duplicate);
  if (query.duplicate === "false") rows = rows.filter((lead) => !lead.duplicate);
  if (query.dataAlert === "any") rows = rows.filter((lead) => lead.dataAlert !== "OK");
  else if (query.dataAlert) rows = rows.filter((lead) => lead.dataAlert === query.dataAlert);
  return rows;
}

function sortValue(lead: LeadView, sort: string): string | number | null {
  const value = lead[sort as keyof LeadView];
  if (typeof value === "number" || typeof value === "string") return value;
  if (typeof value === "boolean") return value ? 1 : 0;
  return null;
}

function compareViews(a: LeadView, b: LeadView, sort = "daysOverdue", dir: "asc" | "desc" = "desc"): number {
  const av = sortValue(a, sort);
  const bv = sortValue(b, sort);
  if (av === null && bv === null) return a.leadCode.localeCompare(b.leadCode);
  if (av === null) return 1;
  if (bv === null) return -1;
  let result = 0;
  if (typeof av === "number" && typeof bv === "number") result = av - bv;
  else result = String(av).localeCompare(String(bv), "en");
  if (dir === "desc") result *= -1;
  if (result === 0 && sort === "daysOverdue") result = (b.leadScore ?? -1) - (a.leadScore ?? -1);
  if (result === 0) result = a.leadCode.localeCompare(b.leadCode);
  return result;
}

function sqlOrder(query: LeadQuery): Prisma.LeadOrderByWithRelationInput {
  const dir = query.dir === "asc" ? "asc" : "desc";
  const sort = query.sort ?? "enquiryDate";
  const allowed = [
    "leadCode",
    "name",
    "enquiryDate",
    "stage",
    "temperature",
    "expectedValue",
    "city",
    "source",
    "budget",
    "updatedAt",
  ] as const;
  if ((allowed as readonly string[]).includes(sort)) {
    return { [sort]: dir };
  }
  return { enquiryDate: "desc" };
}

export async function listLeads(query: LeadQuery, actor: { id: string; role: string }) {
  const today = kolkataToday();
  const page = Math.max(1, query.page ?? 1);
  const pageSize = query.exportAll ? 20000 : Math.min(200, Math.max(1, query.pageSize ?? 50));
  const isAdmin = actor.role === "ADMIN";
  const where = await buildWhere(query, actor.id, isAdmin);

  if (!needsFullScan(query)) {
    const [sets, ctx, total, records] = await Promise.all([
      duplicateSets(),
      metricContext(today),
      prisma.lead.count({ where }),
      prisma.lead.findMany({
        where,
        orderBy: sqlOrder(query),
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: leadSelect,
      }),
    ]);
    return {
      rows: records.map((record) => toView(record, ctx, sets)),
      total,
      page,
      pageSize,
      summary: { overdue: 0, dueToday: 0 },
    };
  }

  const [sets, ctx, records] = await Promise.all([
    duplicateSets(),
    metricContext(today),
    prisma.lead.findMany({ where, select: leadSelect }),
  ]);
  const views = applyDerived(
    records.map((record) => toView(record, ctx, sets)),
    query,
  );
  views.sort((a, b) => compareViews(a, b, query.sort ?? "enquiryDate", query.dir ?? "desc"));
  const summary = {
    overdue: views.filter((lead) => lead.followUpStatus === "Overdue").length,
    dueToday: views.filter((lead) => lead.followUpStatus === "Due Today").length,
  };
  const start = query.exportAll ? 0 : (page - 1) * pageSize;
  const end = query.exportAll ? views.length : start + pageSize;
  return { rows: views.slice(start, end), total: views.length, page, pageSize, summary };
}

function cleanLead(input: Partial<LeadInput>): Partial<LeadInput> {
  const next = { ...input };
  if ("mobile" in next) next.mobile = normalizeMobile(next.mobile);
  if ("parentMobile" in next) next.parentMobile = normalizeMobile(next.parentMobile);
  if ("email" in next && next.email) next.email = next.email.trim().toLowerCase();
  return next;
}

function toPrismaData(input: Partial<LeadInput>): Prisma.LeadUncheckedUpdateInput {
  const data: Prisma.LeadUncheckedUpdateInput = {};
  const cleaned = cleanLead(input);
  const copy = [
    "name",
    "source",
    "campaign",
    "ownerId",
    "mobile",
    "email",
    "city",
    "currentLevel",
    "passoutYear",
    "stream",
    "institution",
    "parentName",
    "parentMobile",
    "consent",
    "productCategory",
    "programmeDetail",
    "targetCountry",
    "targetIntake",
    "budget",
    "stage",
    "temperature",
    "expectedValue",
    "lostReason",
    "remarks",
  ] as const;
  for (const key of copy) {
    if (key in cleaned) data[key] = cleaned[key] as never;
  }
  if (cleaned.enquiryDate) data.enquiryDate = isoToDb(cleaned.enquiryDate);
  if ("firstContactDue" in cleaned) {
    data.firstContactDue = cleaned.firstContactDue ? isoToDb(cleaned.firstContactDue) : null;
  }
  if ("counsellingDate" in cleaned) {
    data.counsellingDate = cleaned.counsellingDate ? isoToDb(cleaned.counsellingDate) : null;
  }
  if ("closedDate" in cleaned) data.closedDate = cleaned.closedDate ? isoToDb(cleaned.closedDate) : null;
  return data;
}

export async function createLead(input: LeadInput, actorId: string | null) {
  const today = kolkataToday();
  const lead = await prisma.$transaction(async (tx) => {
    const settingsCtx = await metricContext(today, tx);
    const leadCode = await allocateLeadCode(tx);
    const ownerId = input.ownerId || (await nextCounsellorId(tx));
    const stage = input.stage || "New Lead";
    const enquiryDate = input.enquiryDate || today;
    const firstContactDue =
      input.firstContactDue || addDays(enquiryDate, settingsCtx.settings.defaultFirstContactDays);
    const lead = await tx.lead.create({
      data: {
        ...(toPrismaData({ ...input, ownerId, stage, enquiryDate, firstContactDue }) as Prisma.LeadUncheckedCreateInput),
        leadCode,
      },
    });
    await tx.stageHistory.create({
      data: { leadId: lead.id, fromStage: null, toStage: stage, changedById: actorId },
    });
    return lead;
  });
  return fresh(lead);
}

function fresh<T>(result: T): T {
  clearCrmCache();
  return result;
}

export async function updateLead(id: string, patch: Partial<LeadInput>, actorId: string | null) {
  const existing = await prisma.lead.findUnique({ where: { id } });
  if (!existing || existing.archived) return null;
  const data = toPrismaData(patch);
  const nextStage = typeof data.stage === "string" ? data.stage : existing.stage;
  const lead = await prisma.$transaction(async (tx) => {
    const updated = await tx.lead.update({ where: { id }, data });
    if (typeof patch.stage !== "undefined" && nextStage && nextStage !== existing.stage) {
      await tx.stageHistory.create({
        data: {
          leadId: id,
          fromStage: existing.stage,
          toStage: nextStage,
          changedById: actorId,
        },
      });
    }
    return updated;
  });
  return fresh(lead);
}

export async function setLeadArchived(id: string, archived: boolean) {
  const existing = await prisma.lead.findUnique({ where: { id } });
  if (!existing) return null;
  return fresh(await prisma.lead.update({ where: { id }, data: { archived } }));
}

export async function deleteLead(id: string) {
  const existing = await prisma.lead.findUnique({
    where: { id },
    select: { id: true, leadCode: true, name: true },
  });
  if (!existing) return null;
  await prisma.$transaction([
    prisma.activity.deleteMany({ where: { leadId: id } }),
    prisma.stageHistory.deleteMany({ where: { leadId: id } }),
    prisma.lead.delete({ where: { id } }),
  ]);
  return fresh(existing);
}

export async function getLeadDetail(id: string) {
  const today = kolkataToday();
  const [row, sets, ctx] = await Promise.all([
    prisma.lead.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, name: true } },
        activities: {
          orderBy: [{ date: "desc" }, { createdAt: "desc" }],
          include: { loggedBy: { select: { id: true, name: true } } },
        },
        stageHistory: {
          orderBy: { changedAt: "desc" },
          include: { changedBy: { select: { id: true, name: true } } },
        },
      },
    }),
    duplicateSets(),
    metricContext(today),
  ]);
  if (!row) return null;
  const view = toView(row, ctx, sets);
  const or: Prisma.LeadWhereInput[] = [];
  if (row.mobile) or.push({ mobile: row.mobile });
  if (row.email) or.push({ email: row.email });
  const duplicates =
    or.length === 0
      ? []
      : await prisma.lead.findMany({
          where: { archived: false, id: { not: row.id }, OR: or },
          select: { id: true, leadCode: true, name: true, mobile: true, email: true },
          take: 5,
        });
  return {
    lead: view,
    activities: row.activities.map((activity) => ({
      id: activity.id,
      date: dbToIso(activity.date),
      channel: activity.channel,
      outcome: activity.outcome,
      summary: activity.summary,
      nextFollowUpDate: dbToIso(activity.nextFollowUpDate),
      nextAction: activity.nextAction,
      loggedBy: activity.loggedBy?.name ?? "System",
      createdAt: activity.createdAt.toISOString(),
    })),
    stageHistory: row.stageHistory.map((entry) => ({
      id: entry.id,
      fromStage: entry.fromStage,
      toStage: entry.toStage,
      changedBy: entry.changedBy?.name ?? "System",
      changedAt: entry.changedAt.toISOString(),
    })),
    duplicates,
  };
}

export async function addActivity(
  input: {
    leadId: string;
    date: string;
    channel: string;
    outcome: string;
    summary: string;
    nextFollowUpDate: string | null;
    nextAction: string | null;
  },
  actorId: string | null,
) {
  const lead = await prisma.lead.findUnique({ where: { id: input.leadId } });
  if (!lead) return null;
  return fresh(
    await prisma.activity.create({
      data: {
        leadId: input.leadId,
        date: isoToDb(input.date),
        channel: input.channel,
        outcome: input.outcome,
        summary: input.summary,
        nextFollowUpDate: input.nextFollowUpDate ? isoToDb(input.nextFollowUpDate) : null,
        nextAction: input.nextAction,
        loggedById: actorId,
      },
    }),
  );
}

export async function listActivities(query: {
  from?: string;
  to?: string;
  counsellorId?: string;
  channel?: string;
  outcome?: string;
  page?: number;
  pageSize?: number;
}) {
  const page = Math.max(1, query.page ?? 1);
  const pageSize = Math.min(200, Math.max(1, query.pageSize ?? 50));
  const where: Prisma.ActivityWhereInput = {};
  if (query.from || query.to) {
    where.date = {};
    if (query.from) where.date.gte = isoToDb(query.from);
    if (query.to) where.date.lte = isoToDb(query.to);
  }
  if (query.counsellorId) where.loggedById = query.counsellorId;
  if (query.channel) where.channel = query.channel;
  if (query.outcome) where.outcome = query.outcome;
  const [total, rows] = await Promise.all([
    prisma.activity.count({ where }),
    prisma.activity.findMany({
      where,
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        loggedBy: { select: { name: true } },
        lead: { select: { id: true, leadCode: true, name: true, mobile: true } },
      },
    }),
  ]);
  return {
    total,
    page,
    pageSize,
    rows: rows.map((row) => ({
      id: row.id,
      leadId: row.leadId,
      leadCode: row.lead.leadCode,
      leadName: row.lead.name,
      mobile: row.lead.mobile,
      date: dbToIso(row.date),
      channel: row.channel,
      outcome: row.outcome,
      summary: row.summary,
      nextFollowUpDate: dbToIso(row.nextFollowUpDate),
      nextAction: row.nextAction,
      loggedBy: row.loggedBy?.name ?? "System",
    })),
  };
}

export async function findExistingLead(mobile: string | null, email: string | null) {
  const or: Prisma.LeadWhereInput[] = [];
  if (mobile) or.push({ mobile });
  if (email) or.push({ email });
  if (or.length === 0) return null;
  return prisma.lead.findFirst({
    where: { archived: false, OR: or },
    orderBy: { updatedAt: "desc" },
  });
}

export function channelForSource(source: string | null | undefined): string {
  const value = (source ?? "").toLowerCase();
  if (value.includes("whatsapp")) return "WhatsApp";
  if (value.includes("email") || value.includes("website")) return "Email";
  if (value.includes("walk")) return "Walk-in";
  return "Call";
}
