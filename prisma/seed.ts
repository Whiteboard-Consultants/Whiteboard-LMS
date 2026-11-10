import bcrypt from "bcryptjs";
import { LOOKUP_SEEDS, DEFAULT_SCORING, DEFAULT_LEAD_PREFIX, DEFAULT_FIRST_CONTACT_DAYS } from "@/lib/crm/constants";
import { isoToDb, kolkataToday } from "@/lib/crm/dates";
import { prisma } from "@/lib/crm/db";
import { SEED_PASSWORD, SEED_USERS, buildSeedLeads } from "@/lib/crm/seedData";

export async function seedCrm(today = kolkataToday()) {
  if (process.env.NODE_ENV === "production" && process.env.SEED_CONFIRM !== "yes") {
    throw new Error("Refusing to seed while NODE_ENV is production. Set SEED_CONFIRM=yes to continue.");
  }

  const passwordHash = await bcrypt.hash(SEED_PASSWORD, 10);
  for (const user of SEED_USERS) {
    await prisma.user.upsert({
      where: { email: user.email },
      create: { ...user, passwordHash, active: true },
      update: { name: user.name, role: user.role, passwordHash, active: true },
    });
  }

  await prisma.lookupValue.deleteMany();
  await prisma.lookupValue.createMany({
    data: LOOKUP_SEEDS.map((lookup) => ({
      type: lookup.type,
      label: lookup.label,
      sortOrder: lookup.sortOrder,
      active: true,
      meta: lookup.meta ?? undefined,
    })),
  });

  const users = await prisma.user.findMany();
  const ownerByName = new Map(users.map((user) => [user.name, user.id]));
  const leads = buildSeedLeads(today);
  await prisma.lead.deleteMany({ where: { leadCode: { in: leads.map((lead) => lead.leadCode) } } });

  for (const lead of leads) {
    const ownerId = ownerByName.get(lead.ownerName);
    if (!ownerId) throw new Error(`Missing seed user ${lead.ownerName}`);
    const created = await prisma.lead.create({
      data: {
        leadCode: lead.leadCode,
        name: lead.name,
        enquiryDate: isoToDb(lead.enquiryDate),
        source: lead.source,
        campaign: lead.campaign,
        ownerId,
        mobile: lead.mobile,
        email: lead.email,
        city: lead.city,
        currentLevel: lead.currentLevel,
        passoutYear: lead.passoutYear,
        stream: lead.stream,
        institution: lead.institution,
        parentName: lead.parentName,
        parentMobile: lead.parentMobile,
        consent: lead.consent,
        productCategory: lead.productCategory,
        programmeDetail: lead.programmeDetail,
        targetCountry: lead.targetCountry,
        targetIntake: lead.targetIntake,
        budget: lead.budget,
        stage: lead.stage,
        temperature: lead.temperature,
        firstContactDue: lead.firstContactDue ? isoToDb(lead.firstContactDue) : null,
        counsellingDate: lead.counsellingDate ? isoToDb(lead.counsellingDate) : null,
        expectedValue: lead.expectedValue,
        closedDate: lead.closedDate ? isoToDb(lead.closedDate) : null,
        lostReason: lead.lostReason,
        remarks: lead.remarks,
        archived: false,
        activities: {
          create: lead.activities.map((activity) => ({
            date: isoToDb(activity.date),
            channel: activity.channel,
            outcome: activity.outcome,
            summary: activity.summary,
            nextFollowUpDate: activity.nextFollowUpDate ? isoToDb(activity.nextFollowUpDate) : null,
            nextAction: activity.nextAction,
            loggedById: ownerId,
          })),
        },
        stageHistory: {
          create: { fromStage: null, toStage: lead.stage, changedById: ownerId },
        },
      },
    });
    if (!created.id) throw new Error(`Failed to seed ${lead.leadCode}`);
  }

  const highest = await prisma.lead.findMany({ select: { leadCode: true } });
  const prefix = DEFAULT_LEAD_PREFIX;
  const maxSeq = highest.reduce((max, lead) => {
    if (!lead.leadCode.startsWith(prefix)) return max;
    const seq = Number(lead.leadCode.slice(prefix.length));
    return Number.isFinite(seq) ? Math.max(max, seq) : max;
  }, leads.length);

  const settings: { key: string; value: unknown }[] = [
    { key: "leadCodePrefix", value: prefix },
    { key: "leadCodeSeq", value: maxSeq },
    { key: "autoAssign", value: false },
    { key: "defaultFirstContactDays", value: DEFAULT_FIRST_CONTACT_DAYS },
    { key: "scoring", value: DEFAULT_SCORING },
    { key: "roundRobinCursor", value: "" },
  ];
  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      create: { key: setting.key, value: setting.value as never },
      update: { value: setting.value as never },
    });
  }
}

async function main() {
  await seedCrm();
  console.log("CRM seed complete. Users use the password documented in README.md.");
  await prisma.$disconnect();
}

const entry = process.argv[1]?.replace(/\\/g, "/") ?? "";
if (entry.endsWith("/prisma/seed.ts") || entry.endsWith("/prisma/seed.js")) {
  main().catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
}
