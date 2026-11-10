import { NextResponse } from "next/server";
import { requireCrmUser } from "@/lib/crm/auth";
import { kolkataToday } from "@/lib/crm/dates";
import { jsonError, readJson, zodError } from "@/lib/crm/http";
import { createLead, listLeads } from "@/lib/crm/leads";
import { leadQueryFromUrl } from "@/lib/crm/query";
import { leadWriteSchema } from "@/lib/crm/schemas";

export const runtime = "nodejs";
export const preferredRegion = "bom1";

export async function GET(request: Request) {
  const user = await requireCrmUser();
  if (!user) return jsonError(401, "Sign in required");
  const url = new URL(request.url);
  const result = await listLeads(leadQueryFromUrl(url), user);
  return NextResponse.json(result);
}

export async function POST(request: Request) {
  const user = await requireCrmUser();
  if (!user) return jsonError(401, "Sign in required");
  const body = await readJson(request);
  const parsed = leadWriteSchema.safeParse(body);
  if (!parsed.success) return zodError(parsed.error);
  if (!parsed.data.enquiryDate) {
    parsed.data.enquiryDate = kolkataToday();
  }
  const lead = await createLead(parsed.data, user.id);
  return NextResponse.json({ id: lead.id, leadCode: lead.leadCode }, { status: 201 });
}
