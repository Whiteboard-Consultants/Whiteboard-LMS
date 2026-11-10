import type { Prisma } from "@prisma/client";
import { clearCrmCache } from "@/lib/crm/cache";
import {
  DEFAULT_FIRST_CONTACT_DAYS,
  DEFAULT_LEAD_PREFIX,
  DEFAULT_SCORING,
} from "@/lib/crm/constants";
import { prisma } from "@/lib/crm/db";
import type { ScoringConfig } from "@/lib/crm/leadMetrics";
import { getCrmReference, type ReferenceLookup, type ReferenceSetting } from "@/lib/crm/reference";

export type CrmSettings = {
  leadCodePrefix: string;
  leadCodeSeq: number;
  autoAssign: boolean;
  defaultFirstContactDays: number;
  scoring: ScoringConfig;
  roundRobinCursor: string | null;
};

type Db = Prisma.TransactionClient | typeof prisma;

function asNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

export function normalizeScoring(value: unknown): ScoringConfig {
  const raw = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  const temps =
    raw.temperaturePoints && typeof raw.temperaturePoints === "object"
      ? (raw.temperaturePoints as Record<string, unknown>)
      : {};
  const temperaturePoints: Record<string, number> = { ...DEFAULT_SCORING.temperaturePoints };
  for (const [key, points] of Object.entries(temps)) {
    if (typeof points === "number" && Number.isFinite(points)) temperaturePoints[key] = points;
  }
  return {
    closureWeight: asNumber(raw.closureWeight, DEFAULT_SCORING.closureWeight),
    temperaturePoints,
    recencyWithin7: asNumber(raw.recencyWithin7, DEFAULT_SCORING.recencyWithin7),
    recencyWithin14: asNumber(raw.recencyWithin14, DEFAULT_SCORING.recencyWithin14),
    profileWeight: asNumber(raw.profileWeight, DEFAULT_SCORING.profileWeight),
    budgetPoints: asNumber(raw.budgetPoints, DEFAULT_SCORING.budgetPoints),
    gradeA: asNumber(raw.gradeA, DEFAULT_SCORING.gradeA),
    gradeB: asNumber(raw.gradeB, DEFAULT_SCORING.gradeB),
  };
}

function settingsFromRows(rows: ReferenceSetting[]): CrmSettings {
  const values = new Map(rows.map((row) => [row.key, row.value]));
  const prefix = values.get("leadCodePrefix");
  const cursor = values.get("roundRobinCursor");
  return {
    leadCodePrefix: typeof prefix === "string" && prefix.length > 0 ? prefix : DEFAULT_LEAD_PREFIX,
    leadCodeSeq: asNumber(values.get("leadCodeSeq"), 0),
    autoAssign: values.get("autoAssign") === true,
    defaultFirstContactDays: asNumber(values.get("defaultFirstContactDays"), DEFAULT_FIRST_CONTACT_DAYS),
    scoring: normalizeScoring(values.get("scoring")),
    roundRobinCursor: typeof cursor === "string" && cursor.length > 0 ? cursor : null,
  };
}

export async function getCrmSettings(db: Db = prisma): Promise<CrmSettings> {
  if (db === prisma) return settingsFromRows((await getCrmReference()).settings);
  const rows = await db.setting.findMany();
  return settingsFromRows(rows.map((row) => ({ key: row.key, value: row.value })));
}

export async function saveSetting(key: string, value: Prisma.InputJsonValue, db: Db = prisma) {
  await db.setting.upsert({
    where: { key },
    create: { key, value },
    update: { value },
  });
  if (db === prisma) clearCrmCache();
}

function buildMetricContext(today: string, settings: CrmSettings, stages: ReferenceLookup[], products: ReferenceLookup[]) {
  const stageProbability: Record<string, number> = {};
  const stageOrder: string[] = [];
  const orderedStages = [...stages].sort((a, b) => a.sortOrder - b.sortOrder);
  for (const stage of orderedStages) {
    stageOrder.push(stage.label);
    const meta = stage.meta && typeof stage.meta === "object" ? (stage.meta as { probability?: unknown }) : {};
    stageProbability[stage.label] = asNumber(meta.probability, 0);
  }

  const verticalByProduct: Record<string, string> = {};
  for (const product of products) {
    const meta =
      product.meta && typeof product.meta === "object" ? (product.meta as { vertical?: unknown }) : {};
    if (typeof meta.vertical === "string" && meta.vertical) {
      verticalByProduct[product.label] = meta.vertical;
    }
  }

  return { today, stageProbability, verticalByProduct, scoring: settings.scoring, stageOrder, settings };
}

export async function metricContext(today: string, db: Db = prisma) {
  if (db !== prisma) {
    const [settings, stages, products] = await Promise.all([
      getCrmSettings(db),
      db.lookupValue.findMany({ where: { type: "stage" } }),
      db.lookupValue.findMany({ where: { type: "productCategory" } }),
    ]);
    return buildMetricContext(today, settings, stages, products);
  }
  const reference = await getCrmReference();
  return buildMetricContext(
    today,
    settingsFromRows(reference.settings),
    reference.lookups.filter((lookup) => lookup.type === "stage"),
    reference.lookups.filter((lookup) => lookup.type === "productCategory"),
  );
}

export async function allocateLeadCode(db: Db): Promise<string> {
  const settings = await getCrmSettings(db);
  const next = settings.leadCodeSeq + 1;
  await saveSetting("leadCodeSeq", next, db);
  return `${settings.leadCodePrefix}${String(next).padStart(4, "0")}`;
}

export async function nextCounsellorId(db: Db): Promise<string | null> {
  const settings = await getCrmSettings(db);
  if (!settings.autoAssign) return null;
  const counsellors = await db.user.findMany({
    where: { role: "COUNSELLOR", active: true },
    orderBy: [{ createdAt: "asc" }, { name: "asc" }],
    select: { id: true },
  });
  if (counsellors.length === 0) return null;
  const current = counsellors.findIndex((user) => user.id === settings.roundRobinCursor);
  const next = counsellors[(current + 1) % counsellors.length];
  await saveSetting("roundRobinCursor", next.id, db);
  return next.id;
}

export async function productCategoriesForVertical(vertical: string, db: Db = prisma): Promise<string[]> {
  const products =
    db === prisma
      ? (await getCrmReference()).lookups.filter((lookup) => lookup.type === "productCategory")
      : await db.lookupValue.findMany({ where: { type: "productCategory" } });
  return products
    .filter((product) => {
      const meta =
        product.meta && typeof product.meta === "object" ? (product.meta as { vertical?: unknown }) : {};
      return meta.vertical === vertical;
    })
    .map((product) => product.label);
}
