import { createHash, randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { requireCrmAdmin } from "@/lib/crm/auth";
import { prisma } from "@/lib/crm/db";
import { jsonError, readJson } from "@/lib/crm/http";

export const runtime = "nodejs";
export const preferredRegion = "bom1";

export async function GET() {
  const admin = await requireCrmAdmin();
  if (!admin) return jsonError(403, "Admin access required");
  const keys = await prisma.apiKey.findMany({
    where: { active: true },
    select: { id: true, name: true, keyPrefix: true, createdAt: true, active: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ keys });
}

export async function POST(request: Request) {
  const admin = await requireCrmAdmin();
  if (!admin) return jsonError(403, "Admin access required");
  const body = (await readJson(request)) as { name?: string } | null;
  const name = body?.name?.trim();
  if (!name) return jsonError(400, "Name is required");
  const apiKey = `wc_${randomBytes(24).toString("hex")}`;
  const created = await prisma.apiKey.create({
    data: {
      name,
      keyHash: createHash("sha256").update(apiKey).digest("hex"),
      keyPrefix: apiKey.slice(0, 10),
      active: true,
    },
  });
  return NextResponse.json(
    { id: created.id, name: created.name, keyPrefix: created.keyPrefix, apiKey },
    { status: 201 },
  );
}
