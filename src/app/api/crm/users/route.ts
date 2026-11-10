import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { requireCrmAdmin } from "@/lib/crm/auth";
import { prisma } from "@/lib/crm/db";
import { jsonError, readJson, zodError } from "@/lib/crm/http";
import { userCreateSchema } from "@/lib/crm/schemas";

export const runtime = "nodejs";

export async function GET() {
  const admin = await requireCrmAdmin();
  if (!admin) return jsonError(403, "Admin access required");
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, active: true, createdAt: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json({ users });
}

export async function POST(request: Request) {
  const admin = await requireCrmAdmin();
  if (!admin) return jsonError(403, "Admin access required");
  const parsed = userCreateSchema.safeParse(await readJson(request));
  if (!parsed.success) return zodError(parsed.error);
  try {
    const user = await prisma.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        role: parsed.data.role,
        active: true,
        passwordHash: await bcrypt.hash(parsed.data.password, 10),
      },
      select: { id: true, name: true, email: true, role: true, active: true },
    });
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return jsonError(400, "A user with that email already exists");
    }
    throw error;
  }
}
