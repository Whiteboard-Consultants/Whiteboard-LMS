import { NextResponse } from "next/server";
import { requireCrmUser } from "@/lib/crm/auth";
import { formatDisplay } from "@/lib/crm/dates";
import { toCsv } from "@/lib/crm/format";
import { jsonError } from "@/lib/crm/http";
import { listLeads } from "@/lib/crm/leads";
import { leadQueryFromUrl } from "@/lib/crm/query";

export const runtime = "nodejs";
export const preferredRegion = "bom1";

const COLUMNS: { header: string; value: (row: Awaited<ReturnType<typeof listLeads>>["rows"][number]) => unknown }[] = [
  { header: "Lead code", value: (row) => row.leadCode },
  { header: "Name", value: (row) => row.name },
  { header: "Enquiry date", value: (row) => formatDisplay(row.enquiryDate) },
  { header: "Source", value: (row) => row.source },
  { header: "Campaign", value: (row) => row.campaign },
  { header: "Owner", value: (row) => row.ownerName },
  { header: "Mobile", value: (row) => row.mobile },
  { header: "Email", value: (row) => row.email },
  { header: "City", value: (row) => row.city },
  { header: "Current level", value: (row) => row.currentLevel },
  { header: "Passout year", value: (row) => row.passoutYear },
  { header: "Stream", value: (row) => row.stream },
  { header: "Institution", value: (row) => row.institution },
  { header: "Product", value: (row) => row.productCategory },
  { header: "Vertical", value: (row) => row.businessVertical },
  { header: "Programme", value: (row) => row.programmeDetail },
  { header: "Country", value: (row) => row.targetCountry },
  { header: "Intake", value: (row) => row.targetIntake },
  { header: "Budget", value: (row) => row.budget },
  { header: "Stage", value: (row) => row.stage },
  { header: "Temperature", value: (row) => row.temperature },
  { header: "Status", value: (row) => row.followUpStatus },
  { header: "Next follow-up", value: (row) => formatDisplay(row.nextFollowUpDate) },
  { header: "Score", value: (row) => row.leadScore },
  { header: "Grade", value: (row) => row.leadGrade },
  { header: "Expected value", value: (row) => row.expectedValue },
  { header: "Weighted value", value: (row) => row.weightedValue },
  { header: "Data alert", value: (row) => row.dataAlert },
  { header: "Duplicate", value: (row) => (row.duplicate ? "Yes" : "No") },
  { header: "Latest note", value: (row) => row.latestNote },
];

export async function GET(request: Request) {
  const user = await requireCrmUser();
  if (!user) return jsonError(401, "Sign in required");
  const url = new URL(request.url);
  const result = await listLeads({ ...leadQueryFromUrl(url), exportAll: true }, user);
  const csv = toCsv(
    COLUMNS.map((column) => column.header),
    result.rows.map((row) => COLUMNS.map((column) => column.value(row))),
  );
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=leads.csv",
    },
  });
}
