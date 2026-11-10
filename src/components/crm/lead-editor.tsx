"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ActivityForm } from "@/components/crm/activity-form";
import {
  CrmMeta,
  ErrorBlock,
  GradeBadge,
  LoadingBlock,
  StatusBadge,
  TemperatureBadge,
  crmFetch,
  fieldClass,
  optionsOf,
} from "@/components/crm/bits";
import { DateField } from "@/components/crm/date-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatDisplay } from "@/lib/crm/dates";
import { formatInr } from "@/lib/crm/format";

const schema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  enquiryDate: z.string().min(1, "Enquiry date is required"),
  source: z.string(),
  campaign: z.string(),
  ownerId: z.string(),
  mobile: z.string(),
  email: z.string().refine((value) => value === "" || z.string().email().safeParse(value).success, "Enter a valid email"),
  city: z.string(),
  currentLevel: z.string(),
  passoutYear: z.string(),
  stream: z.string(),
  institution: z.string(),
  parentName: z.string(),
  parentMobile: z.string(),
  consent: z.boolean(),
  productCategory: z.string(),
  programmeDetail: z.string(),
  targetCountry: z.string(),
  targetIntake: z.string(),
  budget: z.string(),
  stage: z.string(),
  temperature: z.string(),
  firstContactDue: z.string(),
  counsellingDate: z.string(),
  expectedValue: z.string(),
  closedDate: z.string(),
  lostReason: z.string(),
  remarks: z.string(),
});

type Values = z.infer<typeof schema>;
type LeadDetail = Values & {
  id: string;
  leadCode: string;
  archived: boolean;
  businessVertical: string | null;
  followUpStatus: string;
  nextFollowUpDate: string | null;
  leadScore: number | null;
  leadGrade: string | null;
  dataAlert: string;
  duplicate: boolean;
  profileCompleteness: number;
  closureProbability: number | null;
  weightedValue: number | null;
  contactAttempts: number;
  daysToFirstContact: number | null;
  daysSinceEnquiry: number;
};

const emptyValues = (today = ""): Values => ({
  name: "",
  enquiryDate: today,
  source: "",
  campaign: "",
  ownerId: "",
  mobile: "",
  email: "",
  city: "",
  currentLevel: "",
  passoutYear: "",
  stream: "",
  institution: "",
  parentName: "",
  parentMobile: "",
  consent: false,
  productCategory: "",
  programmeDetail: "",
  targetCountry: "",
  targetIntake: "",
  budget: "",
  stage: "New Lead",
  temperature: "",
  firstContactDue: "",
  counsellingDate: "",
  expectedValue: "",
  closedDate: "",
  lostReason: "",
  remarks: "",
});

function payload(values: Values) {
  const text = (value: string) => (value.trim() ? value.trim() : null);
  const num = (value: string) => (value.trim() ? value.trim() : null);
  return {
    ...values,
    source: text(values.source),
    campaign: text(values.campaign),
    ownerId: text(values.ownerId),
    mobile: text(values.mobile),
    email: text(values.email),
    city: text(values.city),
    currentLevel: text(values.currentLevel),
    passoutYear: num(values.passoutYear),
    stream: text(values.stream),
    institution: text(values.institution),
    parentName: text(values.parentName),
    parentMobile: text(values.parentMobile),
    productCategory: text(values.productCategory),
    programmeDetail: text(values.programmeDetail),
    targetCountry: text(values.targetCountry),
    targetIntake: text(values.targetIntake),
    budget: num(values.budget),
    stage: text(values.stage),
    temperature: text(values.temperature),
    firstContactDue: text(values.firstContactDue),
    counsellingDate: text(values.counsellingDate),
    expectedValue: num(values.expectedValue),
    closedDate: text(values.closedDate),
    lostReason: text(values.lostReason),
    remarks: text(values.remarks),
  };
}

export function LeadEditor({ id }: { id?: string }) {
  const router = useRouter();
  const [meta, setMeta] = useState<CrmMeta | null>(null);
  const [detail, setDetail] = useState<LeadDetail | null>(null);
  const [activities, setActivities] = useState<{ id: string; date: string | null; channel: string; outcome: string; summary: string; nextFollowUpDate: string | null; nextAction: string | null; loggedBy: string }[]>([]);
  const [duplicates, setDuplicates] = useState<{ id: string; leadCode: string; name: string }[]>([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: emptyValues() });

  async function load() {
    const nextMeta = meta ?? (await crmFetch<CrmMeta>("/api/crm/meta"));
    setMeta(nextMeta);
    if (!id) {
      form.reset({ ...emptyValues(nextMeta.today), ownerId: nextMeta.me.role === "COUNSELLOR" ? nextMeta.me.id : "" });
      return;
    }
    const data = await crmFetch<{
      lead: LeadDetail & Record<string, unknown>;
      activities: typeof activities;
      duplicates: typeof duplicates;
    }>(`/api/crm/leads/${id}`);
    const lead = data.lead;
    setDetail(lead);
    setActivities(data.activities);
    setDuplicates(data.duplicates);
    form.reset({
      ...emptyValues(nextMeta.today),
      name: lead.name ?? "",
      enquiryDate: String(lead.enquiryDate ?? ""),
      source: lead.source ?? "",
      campaign: lead.campaign ?? "",
      ownerId: lead.ownerId ?? "",
      mobile: lead.mobile ?? "",
      email: lead.email ?? "",
      city: lead.city ?? "",
      currentLevel: lead.currentLevel ?? "",
      passoutYear: lead.passoutYear ? String(lead.passoutYear) : "",
      stream: lead.stream ?? "",
      institution: lead.institution ?? "",
      parentName: lead.parentName ?? "",
      parentMobile: lead.parentMobile ?? "",
      consent: Boolean(lead.consent),
      productCategory: lead.productCategory ?? "",
      programmeDetail: lead.programmeDetail ?? "",
      targetCountry: lead.targetCountry ?? "",
      targetIntake: lead.targetIntake ?? "",
      budget: lead.budget ? String(lead.budget) : "",
      stage: lead.stage ?? "",
      temperature: lead.temperature ?? "",
      firstContactDue: lead.firstContactDue ?? "",
      counsellingDate: lead.counsellingDate ?? "",
      expectedValue: lead.expectedValue ? String(lead.expectedValue) : "",
      closedDate: lead.closedDate ?? "",
      lostReason: lead.lostReason ?? "",
      remarks: lead.remarks ?? "",
    });
  }

  useEffect(() => {
    load().catch((err: unknown) => setError(err instanceof Error ? err.message : "Could not load the lead"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function onSubmit(values: Values) {
    setMessage("");
    const body = payload(values);
    try {
      if (id) {
        await crmFetch(`/api/crm/leads/${id}`, { method: "PATCH", body: JSON.stringify(body) });
        setMessage("Saved");
        await load();
        return;
      }
      const created = await crmFetch<{ id: string }>(`/api/crm/leads`, { method: "POST", body: JSON.stringify(body) });
      router.push(`/crm/leads/${created.id}`);
    } catch (err) {
      form.setError("root", { message: err instanceof Error ? err.message : "Could not save the lead" });
    }
  }

  async function changeStage(stage: string) {
    form.setValue("stage", stage);
    if (!id) return;
    await crmFetch(`/api/crm/leads/${id}`, { method: "PATCH", body: JSON.stringify({ stage }) });
    await load();
  }

  const mobile = form.watch("mobile");
  const digits = mobile.replace(/\D/g, "");
  const mobileWarning = digits.length > 0 && digits.length !== 10 && !(digits.length === 12 && digits.startsWith("91"));

  if (error && !meta) return <ErrorBlock message={error} onRetry={() => void load()} />;
  if (!meta) return <LoadingBlock />;

  const select = (name: keyof Values, label: string, type: string) => (
    <label className="space-y-1 text-sm">
      <span className="font-medium">{label}</span>
      <select className={fieldClass} {...form.register(name)}>
        <option value="">Select</option>
        {optionsOf(meta, type, String(form.watch(name) || "")).map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </label>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-[#004B93]">{id ? detail?.leadCode ?? "Lead" : "New lead"}</h1>
          {detail ? <p className="text-sm text-slate-600">{detail.name}</p> : null}
        </div>
        {id && meta.me.role === "ADMIN" && detail ? (
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={async () => {
                await crmFetch(`/api/crm/leads/${id}`, { method: "PATCH", body: JSON.stringify({ archived: !detail.archived }) });
                await load();
              }}
            >
              {detail.archived ? "Restore" : "Archive"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="border-[#C9002B] text-[#C9002B] hover:bg-[#C9002B] hover:text-white"
              onClick={async () => {
                const confirmed = window.confirm(
                  `Delete ${detail.leadCode} ${detail.name}? This cannot be undone. The lead, its activities, and its stage history are removed.`,
                );
                if (!confirmed) return;
                try {
                  await crmFetch(`/api/crm/leads/${id}`, { method: "DELETE" });
                  router.push("/crm/leads");
                } catch (err) {
                  setError(err instanceof Error ? err.message : "Could not delete the lead");
                }
              }}
            >
              Delete
            </Button>
          </div>
        ) : null}
      </div>
      {detail?.duplicate && duplicates[0] ? (
        <p role="status" className="rounded-md border border-[#E8A020] bg-[#fff8eb] p-3 text-sm">
          This lead matches another record.{" "}
          <Link className="font-semibold text-[#004B93] underline" href={`/crm/leads/${duplicates[0].id}`}>
            Open {duplicates[0].leadCode} · {duplicates[0].name}
          </Link>
        </p>
      ) : null}
      {detail ? (
        <div className="flex gap-2 overflow-x-auto rounded-lg bg-white p-3 text-sm shadow-sm">
          <StatusBadge status={detail.followUpStatus} />
          <TemperatureBadge value={form.watch("temperature")} />
          <GradeBadge value={detail.leadGrade} />
          <span>Score {detail.leadScore ?? "—"}</span>
          <span>Vertical {detail.businessVertical ?? "—"}</span>
          <span>Next {formatDisplay(detail.nextFollowUpDate)}</span>
          <span>Attempts {detail.contactAttempts}</span>
          <span>Profile {Math.round(detail.profileCompleteness * 100)}%</span>
          <span>Weighted {formatInr(detail.weightedValue)}</span>
          <span>Alert {detail.dataAlert}</span>
          <span>Since enquiry {detail.daysSinceEnquiry}d</span>
        </div>
      ) : null}
      <form className="space-y-6 rounded-lg bg-white p-4 shadow-sm" onSubmit={form.handleSubmit(onSubmit)}>
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Capture</h2>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="name">Name</Label>
              <Input id="name" {...form.register("name")} />
              {form.formState.errors.name ? <p className="text-xs text-[#C9002B]">{form.formState.errors.name.message}</p> : null}
            </div>
            <DateField id="enquiryDate" label="Enquiry date" required value={form.watch("enquiryDate")} onChange={(value) => form.setValue("enquiryDate", value, { shouldValidate: true })} error={form.formState.errors.enquiryDate?.message} />
            {select("source", "Source", "source")}
            <label className="space-y-1 text-sm"><span className="font-medium">Campaign</span><input className={fieldClass} {...form.register("campaign")} /></label>
            <label className="space-y-1 text-sm">
              <span className="font-medium">Owner</span>
              <select className={fieldClass} {...form.register("ownerId")}>
                <option value="">Unassigned</option>
                {meta.users.map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}
              </select>
            </label>
            <div className="space-y-1">
              <Label htmlFor="mobile">Mobile</Label>
              <Input id="mobile" inputMode="tel" {...form.register("mobile")} />
              {mobileWarning ? <p className="text-xs text-[#C2410C]">Expected 10 digits. You can still save.</p> : null}
            </div>
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...form.register("email")} />
              {form.formState.errors.email ? <p className="text-xs text-[#C9002B]">{form.formState.errors.email.message}</p> : null}
            </div>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" {...form.register("consent")} /> Consent to contact</label>
          </div>
        </section>
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Profile</h2>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="space-y-1 text-sm"><span className="font-medium">City</span><input className={fieldClass} {...form.register("city")} /></label>
            {select("currentLevel", "Current level", "currentLevel")}
            <label className="space-y-1 text-sm"><span className="font-medium">Passout year</span><input className={fieldClass} {...form.register("passoutYear")} /></label>
            <label className="space-y-1 text-sm"><span className="font-medium">Stream</span><input className={fieldClass} {...form.register("stream")} /></label>
            <label className="space-y-1 text-sm"><span className="font-medium">Institution</span><input className={fieldClass} {...form.register("institution")} /></label>
            <label className="space-y-1 text-sm"><span className="font-medium">Parent name</span><input className={fieldClass} {...form.register("parentName")} /></label>
            <label className="space-y-1 text-sm"><span className="font-medium">Parent mobile</span><input className={fieldClass} {...form.register("parentMobile")} /></label>
          </div>
        </section>
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Interest</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {select("productCategory", "Product", "productCategory")}
            <label className="space-y-1 text-sm"><span className="font-medium">Programme detail</span><input className={fieldClass} {...form.register("programmeDetail")} /></label>
            {select("targetCountry", "Target country", "targetCountry")}
            <label className="space-y-1 text-sm"><span className="font-medium">Target intake</span><input className={fieldClass} {...form.register("targetIntake")} /></label>
            <label className="space-y-1 text-sm"><span className="font-medium">Budget (INR)</span><input className={fieldClass} {...form.register("budget")} /></label>
          </div>
        </section>
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Pipeline</h2>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="space-y-1 text-sm">
              <span className="font-medium">Stage</span>
              <select className={fieldClass} value={form.watch("stage")} onChange={(event) => void changeStage(event.target.value)}>
                <option value="">Select</option>
                {optionsOf(meta, "stage", form.watch("stage")).map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>
            {select("temperature", "Temperature", "temperature")}
            <DateField id="firstContactDue" label="First contact due" value={form.watch("firstContactDue")} onChange={(value) => form.setValue("firstContactDue", value)} />
            <DateField id="counsellingDate" label="Counselling date" value={form.watch("counsellingDate")} onChange={(value) => form.setValue("counsellingDate", value)} />
            <label className="space-y-1 text-sm"><span className="font-medium">Expected value (INR)</span><input className={fieldClass} {...form.register("expectedValue")} /></label>
            <DateField id="closedDate" label="Closed date" value={form.watch("closedDate")} onChange={(value) => form.setValue("closedDate", value)} />
            {select("lostReason", "Lost reason", "lostReason")}
            <label className="space-y-1 text-sm md:col-span-2"><span className="font-medium">Remarks</span><Textarea {...form.register("remarks")} /></label>
          </div>
        </section>
        {message ? <p className="text-sm text-[#0E7A45]">{message}</p> : null}
        {form.formState.errors.root ? <p className="text-sm text-[#C9002B]">{form.formState.errors.root.message}</p> : null}
        <Button type="submit" className="bg-[#004B93] hover:bg-[#1A6CC8]" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Saving…" : id ? "Save lead" : "Create lead"}
        </Button>
      </form>
      {id && detail ? (
        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-lg font-semibold">Add activity</h2>
            <ActivityForm meta={meta} leadId={id} onSaved={() => void load()} />
          </div>
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-lg font-semibold">Timeline</h2>
            {activities.length === 0 ? <p className="text-sm text-slate-600">No activity yet.</p> : null}
            <ol className="space-y-3">
              {activities.map((activity) => (
                <li key={activity.id} className="border-l-2 border-[#1A6CC8] pl-3">
                  <p className="text-sm font-semibold">{formatDisplay(activity.date)} · {activity.channel} · {activity.outcome}</p>
                  <p className="text-sm">{activity.summary}</p>
                  <p className="text-xs text-slate-500">
                    {activity.loggedBy}
                    {activity.nextFollowUpDate ? ` · next ${formatDisplay(activity.nextFollowUpDate)}` : ""}
                    {activity.nextAction ? ` · ${activity.nextAction}` : ""}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      ) : null}
    </div>
  );
}
