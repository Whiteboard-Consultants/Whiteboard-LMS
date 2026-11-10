import { cached } from "@/lib/crm/cache";
import { prisma } from "@/lib/crm/db";

export type ReferenceLookup = {
  id: string;
  type: string;
  label: string;
  sortOrder: number;
  active: boolean;
  meta: unknown;
};

export type ReferenceUser = {
  id: string;
  name: string;
  role: string;
  active: boolean;
};

export type ReferenceSetting = {
  key: string;
  value: unknown;
};

export type CrmReference = {
  settings: ReferenceSetting[];
  lookups: ReferenceLookup[];
  users: ReferenceUser[];
  duplicateMobiles: string[];
  duplicateEmails: string[];
};

function asArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value) as unknown;
      return Array.isArray(parsed) ? (parsed as T[]) : [];
    } catch {
      return [];
    }
  }
  return [];
}

function isPostgres(): boolean {
  return (process.env.DATABASE_URL ?? "").startsWith("postgres");
}

async function loadReferenceSql(): Promise<CrmReference> {
  const rows = await prisma.$queryRaw<{ payload: unknown }[]>`
    SELECT json_build_object(
      'settings', (
        SELECT coalesce(json_agg(json_build_object('key', key, 'value', value)), '[]'::json)
        FROM crm."Setting"
      ),
      'lookups', (
        SELECT coalesce(
          json_agg(
            json_build_object(
              'id', id,
              'type', type,
              'label', label,
              'sortOrder', "sortOrder",
              'active', active,
              'meta', meta
            )
            ORDER BY type, "sortOrder"
          ),
          '[]'::json
        )
        FROM crm."LookupValue"
      ),
      'users', (
        SELECT coalesce(
          json_agg(json_build_object('id', id, 'name', name, 'role', role, 'active', active) ORDER BY name),
          '[]'::json
        )
        FROM crm."User"
        WHERE active = true
      ),
      'duplicateMobiles', (
        SELECT coalesce(json_agg(mobile), '[]'::json)
        FROM (
          SELECT mobile
          FROM crm."Lead"
          WHERE archived = false AND mobile IS NOT NULL AND btrim(mobile) <> ''
          GROUP BY mobile
          HAVING count(*) > 1
        ) mobiles
      ),
      'duplicateEmails', (
        SELECT coalesce(json_agg(lower(email)), '[]'::json)
        FROM (
          SELECT email
          FROM crm."Lead"
          WHERE archived = false AND email IS NOT NULL AND btrim(email) <> ''
          GROUP BY email
          HAVING count(*) > 1
        ) emails
      )
    ) AS payload
  `;
  const payload = rows[0]?.payload;
  const record =
    payload && typeof payload === "object"
      ? (payload as Record<string, unknown>)
      : typeof payload === "string"
        ? (JSON.parse(payload) as Record<string, unknown>)
        : {};
  return {
    settings: asArray<ReferenceSetting>(record.settings),
    lookups: asArray<ReferenceLookup>(record.lookups),
    users: asArray<ReferenceUser>(record.users),
    duplicateMobiles: asArray<string>(record.duplicateMobiles).filter((value) => value.trim()),
    duplicateEmails: asArray<string>(record.duplicateEmails).filter((value) => value.trim()),
  };
}

async function loadReferencePrisma(): Promise<CrmReference> {
  const [settings, lookups, users, mobiles, emails] = await Promise.all([
    prisma.setting.findMany(),
    prisma.lookupValue.findMany({ orderBy: [{ type: "asc" }, { sortOrder: "asc" }] }),
    prisma.user.findMany({
      where: { active: true },
      select: { id: true, name: true, role: true, active: true },
      orderBy: { name: "asc" },
    }),
    prisma.lead.groupBy({
      by: ["mobile"],
      where: { archived: false, mobile: { not: null } },
      _count: { _all: true },
    }),
    prisma.lead.groupBy({
      by: ["email"],
      where: { archived: false, email: { not: null } },
      _count: { _all: true },
    }),
  ]);
  return {
    settings: settings.map((row) => ({ key: row.key, value: row.value })),
    lookups,
    users,
    duplicateMobiles: mobiles
      .filter((row) => row.mobile && row.mobile.trim() && row._count._all > 1)
      .map((row) => row.mobile as string),
    duplicateEmails: emails
      .filter((row) => row.email && row.email.trim() && row._count._all > 1)
      .map((row) => row.email!.toLowerCase()),
  };
}

export function getCrmReference(): Promise<CrmReference> {
  return cached("crm-reference", 30_000, () => (isPostgres() ? loadReferenceSql() : loadReferencePrisma()));
}
