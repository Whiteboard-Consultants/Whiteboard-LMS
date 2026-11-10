import { NextResponse } from "next/server";
import { requireCrmAdmin, requireCrmUser } from "@/lib/crm/auth";
import { jsonError, readJson, zodError } from "@/lib/crm/http";
import { deleteLead, getLeadDetail, setLeadArchived, updateLead } from "@/lib/crm/leads";
import { leadPatchSchema } from "@/lib/crm/schemas";

export const runtime = "nodejs";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Context) {
  const user = await requireCrmUser();
  if (!user) return jsonError(401, "Sign in required");
  const { id } = await context.params;
  const detail = await getLeadDetail(id);
  if (!detail) return jsonError(404, "Lead not found");
  if (detail.lead.archived && user.role !== "ADMIN") return jsonError(404, "Lead not found");
  return NextResponse.json(detail);
}

export async function PATCH(request: Request, context: Context) {
  const user = await requireCrmUser();
  if (!user) return jsonError(401, "Sign in required");
  const { id } = await context.params;
  const body = await readJson(request);
  if (body && typeof body === "object" && "archived" in body) {
    const admin = await requireCrmAdmin();
    if (!admin) return jsonError(403, "Only an admin can archive leads");
    const archived = Boolean((body as { archived?: unknown }).archived);
    const lead = await setLeadArchived(id, archived);
    if (!lead) return jsonError(404, "Lead not found");
    return NextResponse.json({ id: lead.id, archived: lead.archived });
  }
  const parsed = leadPatchSchema.safeParse(body);
  if (!parsed.success) return zodError(parsed.error);
  const lead = await updateLead(id, parsed.data, user.id);
  if (!lead) return jsonError(404, "Lead not found");
  return NextResponse.json({ id: lead.id, leadCode: lead.leadCode });
}

export async function DELETE(_request: Request, context: Context) {
  const admin = await requireCrmAdmin();
  if (!admin) return jsonError(403, "Only an admin can delete leads");
  const { id } = await context.params;
  const lead = await deleteLead(id);
  if (!lead) return jsonError(404, "Lead not found");
  return NextResponse.json({ id: lead.id, leadCode: lead.leadCode });
}
