import { clearCrmCache } from "@/lib/crm/cache";
import { isoToDb, kolkataToday } from "@/lib/crm/dates";
import { prisma } from "@/lib/crm/db";
import { channelForSource, createLead, findExistingLead, normalizeMobile, type LeadInput } from "@/lib/crm/leads";

export type IntakeBody = {
  name: string;
  mobile: string | null;
  email: string | null;
  source: string | null;
  campaign: string | null;
  productCategory: string | null;
  city: string | null;
  currentLevel: string | null;
  passoutYear: number | null;
  stream: string | null;
  institution: string | null;
  parentName: string | null;
  parentMobile: string | null;
  consent?: boolean;
  programmeDetail: string | null;
  targetCountry: string | null;
  targetIntake: string | null;
  budget: number | null;
  temperature: string | null;
  expectedValue: number | null;
  remarks: string | null;
};

export async function ingestEnquiry(input: IntakeBody) {
  const mobile = normalizeMobile(input.mobile);
  const email = input.email?.trim().toLowerCase() || null;
  const today = kolkataToday();
  const existing = await findExistingLead(mobile, email);

  if (existing) {
    const sourceLabel = input.source || "unknown source";
    await prisma.$transaction([
      prisma.activity.create({
        data: {
          leadId: existing.id,
          date: isoToDb(today),
          channel: channelForSource(input.source),
          outcome: "Other",
          summary: `Duplicate enquiry received via ${sourceLabel}`,
        },
      }),
      prisma.lead.update({ where: { id: existing.id }, data: { updatedAt: new Date() } }),
    ]);
    clearCrmCache();
    return { status: 409 as const, body: { leadCode: existing.leadCode, duplicate: true } };
  }

  const leadInput: LeadInput = {
    name: input.name,
    enquiryDate: today,
    source: input.source,
    campaign: input.campaign,
    ownerId: null,
    mobile,
    email,
    city: input.city,
    currentLevel: input.currentLevel,
    passoutYear: input.passoutYear,
    stream: input.stream,
    institution: input.institution,
    parentName: input.parentName,
    parentMobile: input.parentMobile,
    consent: input.consent ?? false,
    productCategory: input.productCategory,
    programmeDetail: input.programmeDetail,
    targetCountry: input.targetCountry,
    targetIntake: input.targetIntake,
    budget: input.budget,
    stage: "New Lead",
    temperature: input.temperature,
    firstContactDue: null,
    counsellingDate: null,
    expectedValue: input.expectedValue,
    closedDate: null,
    lostReason: null,
    remarks: input.remarks,
  };
  const lead = await createLead(leadInput, null);
  return { status: 201 as const, body: { leadCode: lead.leadCode, duplicate: false } };
}
