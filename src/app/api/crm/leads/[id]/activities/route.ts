import { NextResponse } from "next/server";
import { requireCrmUser } from "@/lib/crm/auth";
import { jsonError, readJson, zodError } from "@/lib/crm/http";
import { addActivity } from "@/lib/crm/leads";
import { activitySchema } from "@/lib/crm/schemas";

export const runtime = "nodejs";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await requireCrmUser();
  if (!user) return jsonError(401, "Sign in required");
  const { id } = await context.params;
  const parsed = activitySchema.safeParse(await readJson(request));
  if (!parsed.success) return zodError(parsed.error);
  const activity = await addActivity({ ...parsed.data, leadId: id, date: parsed.data.date ?? "" }, user.id);
  if (!activity) return jsonError(404, "Lead not found");
  return NextResponse.json({ id: activity.id }, { status: 201 });
}
