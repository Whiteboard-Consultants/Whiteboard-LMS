import { NextResponse } from "next/server";
import { requireCrmAdmin } from "@/lib/crm/auth";
import { prisma } from "@/lib/crm/db";
import { jsonError } from "@/lib/crm/http";

export const runtime = "nodejs";

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const admin = await requireCrmAdmin();
  if (!admin) return jsonError(403, "Admin access required");
  const { id } = await context.params;
  await prisma.apiKey.update({ where: { id }, data: { active: false } });
  return NextResponse.json({ ok: true });
}
