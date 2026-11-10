import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { requireCrmAdmin } from "@/lib/crm/auth";
import { prisma } from "@/lib/crm/db";
import { jsonError, readJson, zodError } from "@/lib/crm/http";
import { userPatchSchema } from "@/lib/crm/schemas";

export const runtime = "nodejs";

async function keepAnAdmin(userId: string, nextRole?: string, nextActive?: boolean) {
  const current = await prisma.user.findUnique({ where: { id: userId } });
  if (!current) return "User not found";
  const demoting = current.role === "ADMIN" && (nextRole === "COUNSELLOR" || nextActive === false);
  if (!demoting) return null;
  const others = await prisma.user.count({
    where: { role: "ADMIN", active: true, NOT: { id: userId } },
  });
  if (others === 0) return "Keep at least one active admin";
  return null;
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const admin = await requireCrmAdmin();
  if (!admin) return jsonError(403, "Admin access required");
  const { id } = await context.params;
  const parsed = userPatchSchema.safeParse(await readJson(request));
  if (!parsed.success) return zodError(parsed.error);
  if (parsed.data.active === false && id === admin.id) {
    return jsonError(400, "You cannot deactivate your own account");
  }
  const blocked = await keepAnAdmin(id, parsed.data.role, parsed.data.active);
  if (blocked === "User not found") return jsonError(404, blocked);
  if (blocked) return jsonError(400, blocked);

  const user = await prisma.user.update({
    where: { id },
    data: {
      name: parsed.data.name,
      role: parsed.data.role,
      active: parsed.data.active,
      passwordHash: parsed.data.password ? await bcrypt.hash(parsed.data.password, 10) : undefined,
    },
    select: { id: true, name: true, email: true, role: true, active: true },
  });
  return NextResponse.json(user);
}
