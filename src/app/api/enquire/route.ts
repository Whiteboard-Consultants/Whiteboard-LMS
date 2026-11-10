import { NextResponse } from "next/server";
import { prisma } from "@/lib/crm/db";
import { jsonError, readJson, zodError } from "@/lib/crm/http";
import { ingestEnquiry } from "@/lib/crm/intake";
import { clientIp, rateLimit } from "@/lib/crm/rateLimit";
import { intakeSchema } from "@/lib/crm/schemas";

export const runtime = "nodejs";

export async function GET() {
  const lookups = await prisma.lookupValue.findMany({
    where: { active: true, type: { in: ["source", "productCategory", "currentLevel"] } },
    orderBy: { sortOrder: "asc" },
    select: { type: true, label: true },
  });
  const grouped: Record<string, string[]> = { source: [], productCategory: [], currentLevel: [] };
  for (const lookup of lookups) grouped[lookup.type]?.push(lookup.label);
  return NextResponse.json(grouped);
}

export async function POST(request: Request) {
  if (!rateLimit(`enquire:${clientIp(request)}`)) {
    return jsonError(429, "Too many enquiries from this network. Please try again shortly.");
  }
  const body = (await readJson(request)) as Record<string, unknown> | null;
  if (!body || typeof body !== "object") return jsonError(400, "Invalid input");
  if (typeof body.website === "string" && body.website.trim()) {
    return NextResponse.json({ ok: true });
  }
  const parsed = intakeSchema.safeParse(body);
  if (!parsed.success) return zodError(parsed.error);
  if (!parsed.data.consent) return jsonError(400, "Consent is required");
  const result = await ingestEnquiry({
    ...parsed.data,
    source: parsed.data.source || "Website Form",
    stream: parsed.data.stream ?? null,
    institution: parsed.data.institution ?? null,
    parentName: parsed.data.parentName ?? null,
    parentMobile: parsed.data.parentMobile ?? null,
    programmeDetail: parsed.data.programmeDetail ?? null,
    targetCountry: parsed.data.targetCountry ?? null,
    targetIntake: parsed.data.targetIntake ?? null,
    budget: parsed.data.budget ?? null,
    temperature: parsed.data.temperature ?? null,
    expectedValue: parsed.data.expectedValue ?? null,
    remarks: parsed.data.remarks ?? null,
  });
  if (result.status === 409) {
    return NextResponse.json(
      { ok: true, duplicate: true, message: "We already have your details and have noted this enquiry." },
      { status: 200 },
    );
  }
  return NextResponse.json({ ok: true, leadCode: result.body.leadCode, duplicate: false });
}
