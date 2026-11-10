import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getAppUserFromRequest } from "@/lib/admin-auth";
import { signBridgeToken } from "@/lib/crm/auth";
import { clearCrmCache } from "@/lib/crm/cache";
import { prisma } from "@/lib/crm/db";
import { jsonError } from "@/lib/crm/http";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
export const preferredRegion = "bom1";

export async function POST(request: NextRequest) {
  try {
    const appUser = await getAppUserFromRequest(request);
    const role = String(appUser?.role ?? "").toLowerCase();
    if (!appUser || (role !== "admin" && role !== "manager")) {
      return jsonError(401, "Sign in to the admin site first");
    }
    if (!supabaseAdmin) return jsonError(500, "Supabase is not configured");

    const { data, error } = await supabaseAdmin
      .from("users")
      .select("email, name")
      .eq("id", appUser.id)
      .maybeSingle();
    if (error || !data?.email) return jsonError(400, "Could not read the admin profile");

    const email = String(data.email).trim().toLowerCase();
    const name = String(data.name || "CRM user");
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name,
          role: role === "admin" ? "ADMIN" : "COUNSELLOR",
          active: true,
          passwordHash: await bcrypt.hash(randomBytes(24).toString("hex"), 10),
        },
      });
      clearCrmCache();
    }
    if (!user.active) return jsonError(403, "This CRM account is inactive");
    return NextResponse.json({ bridgeToken: signBridgeToken(user.id) });
  } catch (error) {
    console.error("[crm-bridge]", error);
    return jsonError(500, "The CRM database is not available from this site yet.");
  }
}
