import { z } from "zod";
import { isOnOrAfter2020, parseDateInput } from "@/lib/crm/dates";

function optionalText(max = 2000) {
  return z
    .string()
    .trim()
    .max(max)
    .nullish()
    .transform((value) => (value ? value : null));
}

function dateField(required: boolean) {
  return z.any().transform((value, ctx) => {
    if (value === undefined || value === null || value === "") {
      if (required) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Date is required" });
        return z.NEVER;
      }
      return null;
    }
    if (typeof value !== "string") {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Enter a valid date" });
      return z.NEVER;
    }
    const iso = parseDateInput(value);
    if (!iso) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Enter a valid date" });
      return z.NEVER;
    }
    if (!isOnOrAfter2020(iso)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Date must be on or after 01-Jan-2020" });
      return z.NEVER;
    }
    return iso;
  });
}

const optionalNumber = z.any().transform((value, ctx) => {
  if (value === undefined || value === null || value === "") return null;
  const numeric = typeof value === "number" ? value : Number(String(value).replace(/,/g, ""));
  if (!Number.isFinite(numeric)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Enter a valid number" });
    return z.NEVER;
  }
  return numeric;
});

const optionalInt = z.any().transform((value, ctx) => {
  if (value === undefined || value === null || value === "") return null;
  const numeric = typeof value === "number" ? value : Number(String(value).replace(/,/g, ""));
  if (!Number.isInteger(numeric)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Enter a whole number" });
    return z.NEVER;
  }
  if (numeric < 1990 || numeric > 2100) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Enter a year between 1990 and 2100" });
    return z.NEVER;
  }
  return numeric;
});

const optionalEmail = z.any().transform((value, ctx) => {
  if (value === undefined || value === null || String(value).trim() === "") return null;
  const email = String(value).trim().toLowerCase();
  const parsed = z.string().email().safeParse(email);
  if (!parsed.success) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Enter a valid email" });
    return z.NEVER;
  }
  return parsed.data;
});

const consentField = z.any().transform((value) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return ["true", "yes", "y", "1"].includes(normalized);
  }
  return false;
});

export const leadWriteSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  enquiryDate: dateField(true),
  source: optionalText(),
  campaign: optionalText(),
  ownerId: optionalText(100),
  mobile: optionalText(30),
  email: optionalEmail,
  city: optionalText(120),
  currentLevel: optionalText(120),
  passoutYear: optionalInt,
  stream: optionalText(200),
  institution: optionalText(200),
  parentName: optionalText(200),
  parentMobile: optionalText(30),
  consent: consentField,
  productCategory: optionalText(200),
  programmeDetail: optionalText(500),
  targetCountry: optionalText(120),
  targetIntake: optionalText(120),
  budget: optionalNumber,
  stage: optionalText(120),
  temperature: optionalText(40),
  firstContactDue: dateField(false),
  counsellingDate: dateField(false),
  expectedValue: optionalNumber,
  closedDate: dateField(false),
  lostReason: optionalText(200),
  remarks: optionalText(5000),
});

export const leadPatchSchema = leadWriteSchema.partial();

export const activitySchema = z.object({
  leadId: z.string().trim().min(1).optional(),
  date: dateField(true),
  channel: z.string().trim().min(1, "Channel is required").max(80),
  outcome: z.string().trim().min(1, "Outcome is required").max(80),
  summary: z.string().trim().min(1, "Summary is required").max(5000),
  nextFollowUpDate: dateField(false),
  nextAction: optionalText(500),
});

export const intakeSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  mobile: optionalText(30),
  email: optionalEmail,
  source: optionalText(120),
  campaign: optionalText(),
  productCategory: optionalText(200),
  city: optionalText(120),
  currentLevel: optionalText(120),
  passoutYear: optionalInt,
  stream: optionalText(200),
  institution: optionalText(200),
  parentName: optionalText(200),
  parentMobile: optionalText(30),
  consent: consentField.optional(),
  programmeDetail: optionalText(500),
  targetCountry: optionalText(120),
  targetIntake: optionalText(120),
  budget: optionalNumber,
  temperature: optionalText(40),
  expectedValue: optionalNumber,
  remarks: optionalText(5000),
});

export const userCreateSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  email: z.string().trim().email("Enter a valid email").transform((value) => value.toLowerCase()),
  password: z.string().min(8, "Password must be at least 8 characters").max(200),
  role: z.enum(["ADMIN", "COUNSELLOR"]),
});

export const userPatchSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  role: z.enum(["ADMIN", "COUNSELLOR"]).optional(),
  active: z.boolean().optional(),
  password: z.string().min(8, "Password must be at least 8 characters").max(200).optional(),
});

export const settingsSchema = z.object({
  leadCodePrefix: z.string().trim().min(1).max(12).optional(),
  autoAssign: z.boolean().optional(),
  defaultFirstContactDays: z.number().int().min(0).max(30).optional(),
  scoring: z
    .object({
      closureWeight: z.number().min(0).max(100),
      temperaturePoints: z.record(z.string(), z.number().min(0).max(100)),
      recencyWithin7: z.number().min(0).max(100),
      recencyWithin14: z.number().min(0).max(100),
      profileWeight: z.number().min(0).max(100),
      budgetPoints: z.number().min(0).max(100),
      gradeA: z.number().min(0).max(100),
      gradeB: z.number().min(0).max(100),
    })
    .optional(),
});

export const lookupWriteSchema = z.object({
  id: z.string().optional(),
  type: z.string().trim().min(1).optional(),
  label: z.string().trim().min(1).max(120).optional(),
  active: z.boolean().optional(),
  meta: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
  order: z.array(z.string()).optional(),
});

export function firstZodError(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Invalid input";
}
