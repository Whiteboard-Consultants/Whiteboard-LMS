import { NextResponse } from "next/server";
import { requireCrmUser } from "@/lib/crm/auth";
import { kolkataToday } from "@/lib/crm/dates";
import { prisma } from "@/lib/crm/db";
import { jsonError } from "@/lib/crm/http";

export const runtime = "nodejs";

export async function GET() {
  const user = await requireCrmUser();
  if (!user) return jsonError(401, "Sign in required");
  const [users, lookups] = await Promise.all([
    prisma.user.findMany({
      where: { active: true },
      select: { id: true, name: true, role: true, active: true },
      orderBy: { name: "asc" },
    }),
    prisma.lookupValue.findMany({ orderBy: [{ type: "asc" }, { sortOrder: "asc" }] }),
  ]);
  const grouped: Record<string, typeof lookups> = {};
  for (const lookup of lookups) {
    grouped[lookup.type] ??= [];
    grouped[lookup.type].push(lookup);
  }
  return NextResponse.json({
    today: kolkataToday(),
    me: { id: user.id, name: user.name, email: user.email, role: user.role },
    users,
    lookups: grouped,
  });
}
