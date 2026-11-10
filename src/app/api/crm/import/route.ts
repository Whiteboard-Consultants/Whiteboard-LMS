import { NextResponse } from "next/server";
import { requireCrmUser } from "@/lib/crm/auth";
import { IMPORT_FIELDS } from "@/lib/crm/constants";
import { toCsv } from "@/lib/crm/format";
import { jsonError, readJson } from "@/lib/crm/http";
import { commitImport, parseSpreadsheet, previewImport, suggestMapping, type ImportStrategy } from "@/lib/crm/importLeads";

export const runtime = "nodejs";
export const preferredRegion = "bom1";

export async function GET() {
  const user = await requireCrmUser();
  if (!user) return jsonError(401, "Sign in required");
  const csv = toCsv(
    IMPORT_FIELDS.map((field) => field.label),
    [],
  );
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=lead-import-template.csv",
    },
  });
}

export async function POST(request: Request) {
  const user = await requireCrmUser();
  if (!user) return jsonError(401, "Sign in required");
  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return jsonError(400, "Choose a CSV or XLSX file");
    const buffer = Buffer.from(await file.arrayBuffer());
    try {
      const parsed = await parseSpreadsheet(buffer, file.name);
      return NextResponse.json({ ...parsed, mapping: suggestMapping(parsed.headers) });
    } catch (error) {
      return jsonError(400, error instanceof Error ? error.message : "Could not read that file");
    }
  }

  const body = (await readJson(request)) as {
    action?: string;
    rows?: Record<string, string>[];
    mapping?: Record<string, string | null>;
    strategy?: ImportStrategy;
  } | null;
  if (!body?.rows || !body.mapping) return jsonError(400, "Rows and a column mapping are required");
  if (body.action === "commit") {
    const strategy = body.strategy ?? "skip";
    if (!["skip", "update", "import"].includes(strategy)) return jsonError(400, "Choose how to handle duplicates");
    const report = await commitImport(body.rows, body.mapping, strategy, user.id);
    return NextResponse.json(report);
  }
  const preview = await previewImport(body.rows, body.mapping);
  return NextResponse.json(preview);
}
