import { NextResponse } from "next/server";
import { requireCrmAdmin } from "@/lib/crm/auth";
import { jsonError, readJson } from "@/lib/crm/http";
import { getCrmSettings, saveSetting } from "@/lib/crm/settings";

export const runtime = "nodejs";

export async function GET() {
  const admin = await requireCrmAdmin();
  if (!admin) return jsonError(403, "Admin access required");
  const settings = await getCrmSettings();
  return NextResponse.json({
    ...settings,
    smtpConfigured: Boolean(process.env.SMTP_HOST),
  });
}

export async function POST(request: Request) {
  const admin = await requireCrmAdmin();
  if (!admin) return jsonError(403, "Admin access required");
  const body = (await readJson(request)) as {
    scoring?: unknown;
    leadCodePrefix?: string;
    autoAssign?: boolean;
    defaultFirstContactDays?: number;
  } | null;
  if (!body) return jsonError(400, "Invalid input");
  if (typeof body.leadCodePrefix === "string" && body.leadCodePrefix.trim()) {
    await saveSetting("leadCodePrefix", body.leadCodePrefix.trim());
  }
  if (typeof body.autoAssign === "boolean") await saveSetting("autoAssign", body.autoAssign);
  if (typeof body.defaultFirstContactDays === "number") {
    await saveSetting(
      "defaultFirstContactDays",
      Math.max(0, Math.min(30, Math.round(body.defaultFirstContactDays))),
    );
  }
  if (body.scoring && typeof body.scoring === "object") await saveSetting("scoring", body.scoring as never);
  return NextResponse.json({ ok: true });
}
