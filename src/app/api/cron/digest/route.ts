import { NextResponse } from "next/server";
import { jsonError } from "@/lib/crm/http";
import { sendDailyDigests } from "@/lib/crm/digest";

export const runtime = "nodejs";

function allowed(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return process.env.NODE_ENV !== "production";
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

async function run(request: Request) {
  if (!allowed(request)) return jsonError(401, "Unauthorized");
  const result = await sendDailyDigests();
  return NextResponse.json(result);
}

export const GET = run;
export const POST = run;
