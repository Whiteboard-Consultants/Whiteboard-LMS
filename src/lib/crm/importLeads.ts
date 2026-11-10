import ExcelJS from "exceljs";
import { Readable } from "stream";
import { IMPORT_FIELDS, type ImportFieldKey } from "@/lib/crm/constants";
import { isOnOrAfter2020, kolkataToday, parseDateInput } from "@/lib/crm/dates";
import { prisma } from "@/lib/crm/db";
import { createLead, findExistingLead, normalizeMobile, updateLead, type LeadInput } from "@/lib/crm/leads";

export type ImportStrategy = "skip" | "update" | "import";

const HEADER_ALIASES: Record<string, ImportFieldKey> = {
  name: "name",
  "full name": "name",
  "student name": "name",
  mobile: "mobile",
  phone: "mobile",
  "phone number": "mobile",
  email: "email",
  "enquiry date": "enquiryDate",
  enquirydate: "enquiryDate",
  source: "source",
  "lead source": "source",
  campaign: "campaign",
  "owner email": "ownerEmail",
  owner: "ownerEmail",
  city: "city",
  "current level": "currentLevel",
  level: "currentLevel",
  "passout year": "passoutYear",
  passout: "passoutYear",
  stream: "stream",
  institution: "institution",
  college: "institution",
  "parent name": "parentName",
  "parent mobile": "parentMobile",
  consent: "consent",
  product: "productCategory",
  "product category": "productCategory",
  programme: "programmeDetail",
  "programme detail": "programmeDetail",
  program: "programmeDetail",
  country: "targetCountry",
  "target country": "targetCountry",
  intake: "targetIntake",
  "target intake": "targetIntake",
  budget: "budget",
  stage: "stage",
  temperature: "temperature",
  "first contact due": "firstContactDue",
  "counselling date": "counsellingDate",
  "expected value": "expectedValue",
  "closed date": "closedDate",
  "lost reason": "lostReason",
  remarks: "remarks",
  notes: "remarks",
};

function cellText(value: ExcelJS.CellValue): string {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) {
    const year = value.getUTCFullYear();
    const month = String(value.getUTCMonth() + 1).padStart(2, "0");
    const day = String(value.getUTCDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  if (typeof value === "object" && value && "text" in value) return String(value.text ?? "").trim();
  if (typeof value === "object" && value && "result" in value) return cellText(value.result as ExcelJS.CellValue);
  return String(value).trim();
}

export async function parseSpreadsheet(buffer: Buffer, filename: string): Promise<{
  headers: string[];
  rows: Record<string, string>[];
}> {
  const workbook = new ExcelJS.Workbook();
  if (filename.toLowerCase().endsWith(".csv")) {
    await workbook.csv.read(Readable.from(buffer));
  } else {
    await workbook.xlsx.load(buffer as unknown as Parameters<ExcelJS.Xlsx["load"]>[0]);
  }
  const sheet = workbook.worksheets[0];
  if (!sheet) return { headers: [], rows: [] };
  const headerRow = sheet.getRow(1);
  const headers: string[] = [];
  headerRow.eachCell({ includeEmpty: false }, (cell, col) => {
    headers[col - 1] = cellText(cell.value);
  });
  const rows: Record<string, string>[] = [];
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const record: Record<string, string> = {};
    let hasValue = false;
    headers.forEach((header, index) => {
      if (!header) return;
      const text = cellText(row.getCell(index + 1).value);
      if (text) hasValue = true;
      record[header] = text;
    });
    if (hasValue) rows.push(record);
  });
  if (rows.length > 5000) {
    throw new Error("Import is limited to 5,000 rows at a time");
  }
  return { headers: headers.filter(Boolean), rows };
}

export function suggestMapping(headers: string[]): Record<ImportFieldKey, string | null> {
  const mapping = Object.fromEntries(IMPORT_FIELDS.map((field) => [field.key, null])) as Record<
    ImportFieldKey,
    string | null
  >;
  for (const header of headers) {
    const key = HEADER_ALIASES[header.trim().toLowerCase()];
    if (key && !mapping[key]) mapping[key] = header;
  }
  return mapping;
}

function mappedValue(row: Record<string, string>, mapping: Record<string, string | null>, field: string): string {
  const column = mapping[field];
  if (!column) return "";
  return (row[column] ?? "").trim();
}

export type ImportPreviewRow = {
  rowNumber: number;
  name: string;
  mobile: string;
  email: string;
  errors: string[];
  warnings: string[];
  duplicateOf: string | null;
};

function parseConsent(value: string): boolean {
  return ["true", "yes", "y", "1"].includes(value.trim().toLowerCase());
}

function validateMapped(
  row: Record<string, string>,
  mapping: Record<string, string | null>,
  lookupLabels: Record<string, Set<string>>,
  ownerEmails: Set<string>,
): { errors: string[]; warnings: string[]; values: Record<string, string> } {
  const values: Record<string, string> = {};
  for (const field of IMPORT_FIELDS) values[field.key] = mappedValue(row, mapping, field.key);
  const errors: string[] = [];
  const warnings: string[] = [];
  if (!values.name) errors.push("Name is required");
  if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errors.push("Email format is invalid");
  if (values.ownerEmail && !ownerEmails.has(values.ownerEmail.toLowerCase())) {
    errors.push("Owner email does not match a CRM user");
  }
  for (const field of ["enquiryDate", "firstContactDue", "counsellingDate", "closedDate"] as const) {
    if (!values[field]) continue;
    const iso = parseDateInput(values[field]);
    if (!iso) errors.push(`${field} is not a valid date`);
    else if (!isOnOrAfter2020(iso)) errors.push(`${field} is before 2020`);
  }
  for (const field of ["budget", "expectedValue", "passoutYear"] as const) {
    if (!values[field]) continue;
    const numeric = Number(values[field].replace(/,/g, ""));
    if (!Number.isFinite(numeric)) errors.push(`${field} is not a number`);
  }
  const lookupFields: { field: ImportFieldKey; type: string }[] = [
    { field: "source", type: "source" },
    { field: "currentLevel", type: "currentLevel" },
    { field: "productCategory", type: "productCategory" },
    { field: "targetCountry", type: "targetCountry" },
    { field: "stage", type: "stage" },
    { field: "temperature", type: "temperature" },
    { field: "lostReason", type: "lostReason" },
  ];
  for (const item of lookupFields) {
    const value = values[item.field];
    if (value && lookupLabels[item.type] && !lookupLabels[item.type].has(value)) {
      warnings.push(`${value} is not in the ${item.type} list and will be saved as typed`);
    }
  }
  return { errors, warnings, values };
}

async function referenceData() {
  const [lookups, users, leads] = await Promise.all([
    prisma.lookupValue.findMany({ where: { active: true }, select: { type: true, label: true } }),
    prisma.user.findMany({ select: { id: true, email: true } }),
    prisma.lead.findMany({
      where: { archived: false },
      select: { id: true, leadCode: true, mobile: true, email: true },
    }),
  ]);
  const lookupLabels: Record<string, Set<string>> = {};
  for (const lookup of lookups) {
    lookupLabels[lookup.type] ??= new Set();
    lookupLabels[lookup.type].add(lookup.label);
  }
  const owners = new Map(users.map((user) => [user.email.toLowerCase(), user.id]));
  return { lookupLabels, owners, leads };
}

export async function previewImport(rows: Record<string, string>[], mapping: Record<string, string | null>) {
  const { lookupLabels, owners, leads } = await referenceData();
  const seenMobile = new Map<string, string>();
  const seenEmail = new Map<string, string>();
  const preview: ImportPreviewRow[] = rows.map((row, index) => {
    const checked = validateMapped(row, mapping, lookupLabels, new Set(owners.keys()));
    const mobile = normalizeMobile(checked.values.mobile);
    const email = checked.values.email.toLowerCase();
    let duplicateOf: string | null = null;
    const existing = leads.find(
      (lead) => (mobile && lead.mobile === mobile) || (email && lead.email === email),
    );
    if (existing) duplicateOf = existing.leadCode;
    else if (mobile && seenMobile.has(mobile)) duplicateOf = seenMobile.get(mobile) ?? null;
    else if (email && seenEmail.has(email)) duplicateOf = seenEmail.get(email) ?? null;
    if (mobile) seenMobile.set(mobile, `row ${index + 2}`);
    if (email) seenEmail.set(email, `row ${index + 2}`);
    return {
      rowNumber: index + 2,
      name: checked.values.name,
      mobile: mobile ?? "",
      email,
      errors: checked.errors,
      warnings: checked.warnings,
      duplicateOf,
    };
  });
  return {
    preview,
    errorCount: preview.filter((row) => row.errors.length > 0).length,
    duplicateCount: preview.filter((row) => row.duplicateOf).length,
  };
}

function toLeadInput(
  values: Record<string, string>,
  ownerId: string | null,
  enquiryDate: string,
): LeadInput {
  const date = (field: string) => {
    const value = values[field];
    return value ? parseDateInput(value) : null;
  };
  const amount = (field: string) => {
    if (!values[field]) return null;
    const numeric = Number(values[field].replace(/,/g, ""));
    return Number.isFinite(numeric) ? numeric : null;
  };
  return {
    name: values.name,
    enquiryDate: date("enquiryDate") ?? enquiryDate,
    source: values.source || null,
    campaign: values.campaign || null,
    ownerId,
    mobile: values.mobile || null,
    email: values.email ? values.email.toLowerCase() : null,
    city: values.city || null,
    currentLevel: values.currentLevel || null,
    passoutYear: amount("passoutYear"),
    stream: values.stream || null,
    institution: values.institution || null,
    parentName: values.parentName || null,
    parentMobile: values.parentMobile || null,
    consent: parseConsent(values.consent),
    productCategory: values.productCategory || null,
    programmeDetail: values.programmeDetail || null,
    targetCountry: values.targetCountry || null,
    targetIntake: values.targetIntake || null,
    budget: amount("budget"),
    stage: values.stage || null,
    temperature: values.temperature || null,
    firstContactDue: date("firstContactDue"),
    counsellingDate: date("counsellingDate"),
    expectedValue: amount("expectedValue"),
    closedDate: date("closedDate"),
    lostReason: values.lostReason || null,
    remarks: values.remarks || null,
  };
}

export async function commitImport(
  rows: Record<string, string>[],
  mapping: Record<string, string | null>,
  strategy: ImportStrategy,
  actorId: string,
) {
  const { lookupLabels, owners } = await referenceData();
  const todayIso = kolkataToday();
  let created = 0;
  let updated = 0;
  let skipped = 0;
  const errors: { rowNumber: number; message: string }[] = [];

  for (let index = 0; index < rows.length; index += 1) {
    const rowNumber = index + 2;
    const checked = validateMapped(rows[index], mapping, lookupLabels, new Set(owners.keys()));
    if (checked.errors.length > 0) {
      errors.push({ rowNumber, message: checked.errors.join("; ") });
      skipped += 1;
      continue;
    }
    const mobile = normalizeMobile(checked.values.mobile);
    const email = checked.values.email ? checked.values.email.toLowerCase() : null;
    const existing = await findExistingLead(mobile, email);
    if (existing && strategy === "skip") {
      skipped += 1;
      continue;
    }
    const ownerId = checked.values.ownerEmail ? (owners.get(checked.values.ownerEmail.toLowerCase()) ?? null) : null;
    const input = toLeadInput(checked.values, ownerId, todayIso);
    if (existing && strategy === "update") {
      const patch: Partial<LeadInput> = {};
      for (const [key, value] of Object.entries(input)) {
        if (key === "consent" && !checked.values.consent) continue;
        if (value !== null && value !== "" && key !== "enquiryDate") {
          (patch as Record<string, unknown>)[key] = value;
        }
      }
      if (checked.values.enquiryDate) patch.enquiryDate = input.enquiryDate;
      await updateLead(existing.id, patch, actorId);
      updated += 1;
      continue;
    }
    await createLead(input, actorId);
    created += 1;
  }

  return { created, updated, skipped, errors };
}
