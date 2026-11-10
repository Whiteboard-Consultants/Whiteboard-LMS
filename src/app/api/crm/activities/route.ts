import { NextResponse } from "next/server";
import { requireCrmUser } from "@/lib/crm/auth";
import { jsonError, readJson, zodError } from "@/lib/crm/http";
import { addActivity, listActivities } from "@/lib/crm/leads";
import { activitySchema } from "@/lib/crm/schemas";

export const runtime = "nodejs";
export const preferredRegion = "bom1";

export async function GET(request: Request) {
  const user = await requireCrmUser();
  if (!user) return jsonError(401, "Sign in required");
  const url = new URL(request.url);
  const page = url.searchParams.get("page");
  const pageSize = url.searchParams.get("pageSize");
  const result = await listActivities({
    from: url.searchParams.get("from") || undefined,
    to: url.searchParams.get("to") || undefined,
    counsellorId: url.searchParams.get("counsellorId") || undefined,
    channel: url.searchParams.get("channel") || undefined,
    outcome: url.searchParams.get("outcome") || undefined,
    page: page ? Number(page) : undefined,
    pageSize: pageSize ? Number(pageSize) : undefined,
  });
  return NextResponse.json(result);
}

export async function POST(request: Request) {
  const user = await requireCrmUser();
  if (!user) return jsonError(401, "Sign in required");
  const parsed = activitySchema.safeParse(await readJson(request));
  if (!parsed.success) return zodError(parsed.error);
  if (!parsed.data.leadId || !parsed.data.date) return jsonError(400, "Choose a lead and a date");
  const activity = await addActivity(
    {
      leadId: parsed.data.leadId,
      date: parsed.data.date,
      channel: parsed.data.channel,
      outcome: parsed.data.outcome,
      summary: parsed.data.summary,
      nextFollowUpDate: parsed.data.nextFollowUpDate,
      nextAction: parsed.data.nextAction,
    },
    user.id,
  );
  if (!activity) return jsonError(404, "Lead not found");
  return NextResponse.json({ id: activity.id }, { status: 201 });
}
