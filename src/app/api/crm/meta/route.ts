import { NextResponse } from "next/server";
import { requireCrmUser } from "@/lib/crm/auth";
import { kolkataToday } from "@/lib/crm/dates";
import { jsonError } from "@/lib/crm/http";
import { getCrmReference, type ReferenceLookup } from "@/lib/crm/reference";

export const runtime = "nodejs";
export const preferredRegion = "bom1";

export async function GET() {
  const user = await requireCrmUser();
  if (!user) return jsonError(401, "Sign in required");
  const reference = await getCrmReference();
  const grouped: Record<string, ReferenceLookup[]> = {};
  for (const lookup of reference.lookups) {
    grouped[lookup.type] ??= [];
    grouped[lookup.type].push(lookup);
  }
  return NextResponse.json({
    today: kolkataToday(),
    me: { id: user.id, name: user.name, email: user.email, role: user.role },
    users: reference.users,
    lookups: grouped,
  });
}
