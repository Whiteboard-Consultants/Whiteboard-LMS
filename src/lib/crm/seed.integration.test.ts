import { readFileSync } from "fs";
import { beforeAll, describe, expect, it } from "vitest";
import { STAGE_SEEDS } from "@/lib/crm/constants";
import { addDays, kolkataToday } from "@/lib/crm/dates";
import { computeDashboard } from "@/lib/crm/dashboard";
import { prisma } from "@/lib/crm/db";
import { ingestEnquiry } from "@/lib/crm/intake";
import { listLeads } from "@/lib/crm/leads";
import { seedCrm } from "../../../prisma/seed";

const today = kolkataToday();
const sqliteProvider = readFileSync("prisma/schema.prisma", "utf8").includes('provider = "sqlite"');

describe.skipIf(!sqliteProvider)("seed database", () => {
  beforeAll(async () => {
    if (!process.env.DATABASE_URL?.includes("test.db")) {
      throw new Error("Refusing to run CRM integration tests against a non-test database");
    }
    await prisma.activity.deleteMany();
    await prisma.stageHistory.deleteMany();
    await prisma.lead.deleteMany();
    await seedCrm(today);
  });

  it("recomputes the acceptance numbers from stored leads", async () => {
    const admin = await prisma.user.findUniqueOrThrow({ where: { email: "admin@example.com" } });
    const listed = await listLeads({ exportAll: true, archived: "false" }, admin);
    const byCode = Object.fromEntries(listed.rows.map((lead) => [lead.leadCode, lead]));

    expect(byCode["WC-0001"].followUpStatus).toBe("Scheduled");
    expect(byCode["WC-0001"].nextFollowUpDate).toBe(addDays(today, 3));
    expect(byCode["WC-0001"].contactAttempts).toBe(3);
    expect(byCode["WC-0001"].daysToFirstContact).toBe(1);
    expect(byCode["WC-0001"].leadScore).toBe(78);
    expect(byCode["WC-0001"].leadGrade).toBe("A");

    expect(byCode["WC-0002"].followUpStatus).toBe("Overdue");
    expect(byCode["WC-0002"].contactAttempts).toBe(3);
    expect(byCode["WC-0002"].leadScore).toBe(74);
    expect(byCode["WC-0002"].leadGrade).toBe("A");

    expect(byCode["WC-0003"].followUpStatus).toBe("Due Today");
    expect(byCode["WC-0003"].contactAttempts).toBe(1);
    expect(byCode["WC-0003"].leadScore).toBe(58);
    expect(byCode["WC-0003"].leadGrade).toBe("B");

    expect(byCode["WC-0004"].followUpStatus).toBe("Closed");
    expect(byCode["WC-0004"].leadScore).toBeNull();
    expect(byCode["WC-0006"].followUpStatus).toBe("Closed");
    expect(byCode["WC-0006"].leadScore).toBeNull();

    expect(byCode["WC-0005"].followUpStatus).toBe("Scheduled");
    expect(byCode["WC-0005"].nextFollowUpDate).toBe(addDays(today, 1));
    expect(byCode["WC-0005"].contactAttempts).toBe(0);
    expect(byCode["WC-0005"].leadScore).toBe(39);
    expect(byCode["WC-0005"].leadGrade).toBe("C");

    for (const lead of listed.rows) {
      expect(lead.dataAlert, lead.leadCode).toBe("OK");
      expect(lead.duplicate, lead.leadCode).toBe(false);
    }

    const dashboard = computeDashboard(listed.rows, {
      today,
      stageOrder: STAGE_SEEDS.map((stage) => stage.label),
    });
    expect(dashboard.kpis).toMatchObject({
      totalLeads: 6,
      openLeads: 4,
      hotOpenLeads: 1,
      enrolled: 1,
      lost: 1,
      conversionPct: 16.7,
      overdueFollowUps: 1,
      dueToday: 1,
      revenueWon: 12000,
      avgDaysToFirstContact: 1.2,
      weightedOpenPipeline: 57550,
      avgLeadScore: 62.3,
      dataAlerts: 0,
    });
  });

  it("returns 409 for a duplicate intake and does not create a lead", async () => {
    const before = await prisma.lead.count();
    const created = await ingestEnquiry({
      name: "New Student",
      mobile: "9830000099",
      email: "new.student@example.com",
      source: "Website Form",
      campaign: null,
      productCategory: "Public Speaking",
      city: "Kolkata",
      currentLevel: "Graduate",
      passoutYear: 2024,
      stream: null,
      institution: null,
      parentName: null,
      parentMobile: null,
      programmeDetail: null,
      targetCountry: null,
      targetIntake: null,
      budget: null,
      temperature: null,
      expectedValue: null,
      remarks: null,
    });
    expect(created.status).toBe(201);
    expect(created.body.duplicate).toBe(false);
    expect(await prisma.lead.count()).toBe(before + 1);

    const duplicate = await ingestEnquiry({
      name: "New Student Again",
      mobile: "9830000001",
      email: "someone.else@example.com",
      source: "WhatsApp",
      campaign: null,
      productCategory: null,
      city: null,
      currentLevel: null,
      passoutYear: null,
      stream: null,
      institution: null,
      parentName: null,
      parentMobile: null,
      programmeDetail: null,
      targetCountry: null,
      targetIntake: null,
      budget: null,
      temperature: null,
      expectedValue: null,
      remarks: null,
    });
    expect(duplicate.status).toBe(409);
    expect(duplicate.body).toMatchObject({ leadCode: "WC-0001", duplicate: true });
    expect(await prisma.lead.count()).toBe(before + 1);

    const emailDuplicate = await ingestEnquiry({
      name: "Email Match",
      mobile: "9830000088",
      email: "priya.das@example.com",
      source: "Google Ads",
      campaign: null,
      productCategory: null,
      city: null,
      currentLevel: null,
      passoutYear: null,
      stream: null,
      institution: null,
      parentName: null,
      parentMobile: null,
      programmeDetail: null,
      targetCountry: null,
      targetIntake: null,
      budget: null,
      temperature: null,
      expectedValue: null,
      remarks: null,
    });
    expect(emailDuplicate.status).toBe(409);
    expect(emailDuplicate.body.leadCode).toBe("WC-0002");
    expect(await prisma.lead.count()).toBe(before + 1);

    const note = await prisma.activity.findFirst({
      where: { lead: { leadCode: "WC-0001" }, summary: { contains: "Duplicate enquiry received via WhatsApp" } },
    });
    expect(note).not.toBeNull();
  });
});
