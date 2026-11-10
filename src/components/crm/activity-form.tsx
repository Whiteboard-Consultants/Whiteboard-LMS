"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { DateField } from "@/components/crm/date-field";
import { CrmMeta, crmFetch, fieldClass, optionsOf } from "@/components/crm/bits";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const schema = z.object({
  date: z.string().min(1, "Date is required"),
  channel: z.string().min(1, "Channel is required"),
  outcome: z.string().min(1, "Outcome is required"),
  summary: z.string().trim().min(1, "Summary is required"),
  nextFollowUpDate: z.string(),
  nextAction: z.string(),
});

type Values = z.infer<typeof schema>;

export function ActivityForm({
  meta,
  leadId,
  onSaved,
}: {
  meta: CrmMeta;
  leadId: string;
  onSaved: () => void;
}) {
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      date: meta.today,
      channel: "",
      outcome: "",
      summary: "",
      nextFollowUpDate: "",
      nextAction: "",
    },
  });

  async function onSubmit(values: Values) {
    try {
      await crmFetch(`/api/crm/leads/${leadId}/activities`, {
        method: "POST",
        body: JSON.stringify({
          ...values,
          nextFollowUpDate: values.nextFollowUpDate || null,
          nextAction: values.nextAction || null,
        }),
      });
      form.reset({
        date: values.date,
        channel: values.channel,
        outcome: values.outcome,
        summary: "",
        nextFollowUpDate: "",
        nextAction: "",
      });
      onSaved();
    } catch (error) {
      form.setError("root", { message: error instanceof Error ? error.message : "Could not save the activity" });
    }
  }

  const error = (name: keyof Values) => form.formState.errors[name]?.message;

  return (
    <form className="space-y-3" onSubmit={form.handleSubmit(onSubmit)}>
      <DateField id={`act-date-${leadId}`} label="Date" required value={form.watch("date")} onChange={(value) => form.setValue("date", value, { shouldValidate: true })} error={error("date")} />
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span className="font-medium">Channel</span>
          <select className={fieldClass} {...form.register("channel")}>
            <option value="">Select</option>
            {optionsOf(meta, "channel").map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          {error("channel") ? <span className="text-xs text-[#C9002B]">{error("channel")}</span> : null}
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium">Outcome</span>
          <select className={fieldClass} {...form.register("outcome")}>
            <option value="">Select</option>
            {optionsOf(meta, "outcome").map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          {error("outcome") ? <span className="text-xs text-[#C9002B]">{error("outcome")}</span> : null}
        </label>
      </div>
      <div className="space-y-1">
        <Label htmlFor={`summary-${leadId}`}>Summary</Label>
        <Textarea id={`summary-${leadId}`} {...form.register("summary")} />
        {error("summary") ? <p className="text-xs text-[#C9002B]">{error("summary")}</p> : null}
      </div>
      <DateField id={`next-${leadId}`} label="Next follow-up" value={form.watch("nextFollowUpDate")} onChange={(value) => form.setValue("nextFollowUpDate", value)} />
      <label className="block space-y-1 text-sm">
        <span className="font-medium">Next action</span>
        <input className={fieldClass} {...form.register("nextAction")} />
      </label>
      <Button type="submit" className="bg-[#004B93] hover:bg-[#1A6CC8]" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "Saving…" : "Save activity"}
      </Button>
      {form.formState.errors.root ? <p className="text-sm text-[#C9002B]">{form.formState.errors.root.message}</p> : null}
    </form>
  );
}
