import { NextResponse } from "next/server";
import { requireCrmUser } from "@/lib/crm/auth";
import { kolkataToday } from "@/lib/crm/dates";
import { computeDashboard } from "@/lib/crm/dashboard";
import { jsonError } from "@/lib/crm/http";
import { listLeads } from "@/lib/crm/leads";
import { metricContext } from "@/lib/crm/settings";

export const runtime = "nodejs";
export const preferredRegion = "bom1";

export async function GET(request: Request) {
  const user = await requireCrmUser();
  if (!user) return jsonError(401, "Sign in required");
  const url = new URL(request.url);
  const ownerParam = url.searchParams.get("ownerId");
  const ownerId = ownerParam === "me" ? user.id : ownerParam || null;
  const today = kolkataToday();
  const [listed, ctx] = await Promise.all([
    listLeads({ archived: "false", exportAll: true }, user),
    metricContext(today),
  ]);
  const dashboard = computeDashboard(listed.rows, {
    today,
    stageOrder: ctx.stageOrder,
    ownerId,
    enquiryFrom: url.searchParams.get("enquiryFrom"),
    enquiryTo: url.searchParams.get("enquiryTo"),
  });
  return NextResponse.json(dashboard);
}
