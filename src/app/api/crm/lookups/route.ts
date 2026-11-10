import { NextResponse } from "next/server";
import { requireCrmAdmin } from "@/lib/crm/auth";
import { clearCrmCache } from "@/lib/crm/cache";
import { prisma } from "@/lib/crm/db";
import { jsonError, readJson, zodError } from "@/lib/crm/http";
import { lookupWriteSchema } from "@/lib/crm/schemas";
import { saveSetting } from "@/lib/crm/settings";

export const runtime = "nodejs";
export const preferredRegion = "bom1";

const LEAD_FIELDS = {
  source: "source",
  currentLevel: "currentLevel",
  productCategory: "productCategory",
  targetCountry: "targetCountry",
  stage: "stage",
  temperature: "temperature",
  lostReason: "lostReason",
} as const;

async function renameStoredValues(type: string, from: string, to: string) {
  const field = LEAD_FIELDS[type as keyof typeof LEAD_FIELDS];
  if (field) {
    await prisma.lead.updateMany({ where: { [field]: from }, data: { [field]: to } });
  }
  if (type === "channel") {
    await prisma.activity.updateMany({ where: { channel: from }, data: { channel: to } });
  }
  if (type === "outcome") {
    await prisma.activity.updateMany({ where: { outcome: from }, data: { outcome: to } });
  }
}

export async function GET() {
  const admin = await requireCrmAdmin();
  if (!admin) return jsonError(403, "Admin access required");
  const lookups = await prisma.lookupValue.findMany({ orderBy: [{ type: "asc" }, { sortOrder: "asc" }] });
  return NextResponse.json({ lookups });
}

export async function PUT(request: Request) {
  const admin = await requireCrmAdmin();
  if (!admin) return jsonError(403, "Admin access required");
  const parsed = lookupWriteSchema.safeParse(await readJson(request));
  if (!parsed.success) return zodError(parsed.error);
  const body = parsed.data;

  if (body.order && body.order.length > 0) {
    await prisma.$transaction(
      body.order.map((id, index) =>
        prisma.lookupValue.update({ where: { id }, data: { sortOrder: index + 1 } }),
      ),
    );
    clearCrmCache();
    return NextResponse.json({ ok: true });
  }

  if (!body.id) {
    if (!body.type || !body.label) return jsonError(400, "Type and label are required");
    const last = await prisma.lookupValue.findFirst({
      where: { type: body.type },
      orderBy: { sortOrder: "desc" },
    });
    const created = await prisma.lookupValue.create({
      data: {
        type: body.type,
        label: body.label,
        sortOrder: (last?.sortOrder ?? 0) + 1,
        active: body.active ?? true,
        meta: body.meta,
      },
    });
    clearCrmCache();
    return NextResponse.json(created, { status: 201 });
  }

  const existing = await prisma.lookupValue.findUnique({ where: { id: body.id } });
  if (!existing) return jsonError(404, "Lookup not found");
  if (body.label && body.label !== existing.label) {
    const clash = await prisma.lookupValue.findFirst({
      where: { type: existing.type, label: body.label, NOT: { id: existing.id } },
    });
    if (clash) return jsonError(400, "That label already exists");
    await renameStoredValues(existing.type, existing.label, body.label);
  }
  const updated = await prisma.lookupValue.update({
    where: { id: existing.id },
    data: {
      label: body.label ?? existing.label,
      active: body.active ?? existing.active,
      meta: body.meta ?? (existing.meta === null ? undefined : existing.meta),
    },
  });
  clearCrmCache();
  return NextResponse.json(updated);
}

export async function POST(request: Request) {
  const admin = await requireCrmAdmin();
  if (!admin) return jsonError(403, "Admin access required");
  const body = (await readJson(request)) as { scoring?: unknown; leadCodePrefix?: string; autoAssign?: boolean; defaultFirstContactDays?: number } | null;
  if (!body) return jsonError(400, "Invalid input");
  if (typeof body.leadCodePrefix === "string" && body.leadCodePrefix.trim()) {
    await saveSetting("leadCodePrefix", body.leadCodePrefix.trim());
  }
  if (typeof body.autoAssign === "boolean") await saveSetting("autoAssign", body.autoAssign);
  if (typeof body.defaultFirstContactDays === "number") {
    await saveSetting("defaultFirstContactDays", Math.max(0, Math.min(30, Math.round(body.defaultFirstContactDays))));
  }
  if (body.scoring && typeof body.scoring === "object") await saveSetting("scoring", body.scoring as never);
  return NextResponse.json({ ok: true });
}
