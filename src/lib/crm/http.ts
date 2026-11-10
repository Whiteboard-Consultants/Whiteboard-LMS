import { NextResponse } from "next/server";
import type { ZodError } from "zod";

export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export function jsonError(status: number, error: string) {
  return NextResponse.json({ error }, { status });
}

export function zodError(error: ZodError) {
  return jsonError(400, error.issues[0]?.message ?? "Invalid input");
}
