import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/crm/db";
import { jsonError, readJson, zodError } from "@/lib/crm/http";
import { ingestEnquiry } from "@/lib/crm/intake";
import { intakeSchema } from "@/lib/crm/schemas";

export const runtime = "nodejs";

async function authorized(request: Request): Promise<boolean> {
  const raw = request.headers.get("x-api-key");
  if (!raw) return false;
  const keyHash = createHash("sha256").update(raw).digest("hex");
  const key = await prisma.apiKey.findFirst({ where: { keyHash, active: true } });
  return Boolean(key);
}

export async function POST(request: Request) {
  if (!(await authorized(request))) return jsonError(401, "A valid x-api-key header is required");
  const parsed = intakeSchema.safeParse(await readJson(request));
  if (!parsed.success) return zodError(parsed.error);
  const result = await ingestEnquiry({
    ...parsed.data,
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
  return NextResponse.json(result.body, { status: result.status });
}
