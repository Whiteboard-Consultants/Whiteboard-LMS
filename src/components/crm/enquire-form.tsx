"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { fieldClass } from "@/components/crm/bits";

const schema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  mobile: z.string(),
  email: z.string().refine((value) => value === "" || z.string().email().safeParse(value).success, "Enter a valid email"),
  source: z.string(),
  productCategory: z.string(),
  city: z.string(),
  currentLevel: z.string(),
  passoutYear: z.string(),
  remarks: z.string(),
  consent: z.boolean().refine((value) => value, "Consent is required"),
  website: z.string(),
});

type Values = z.infer<typeof schema>;
type Lists = { source: string[]; productCategory: string[]; currentLevel: string[] };

export function EnquireForm() {
  const [lists, setLists] = useState<Lists>({ source: [], productCategory: [], currentLevel: [] });
  const [done, setDone] = useState("");
  const [error, setError] = useState("");
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", mobile: "", email: "", source: "Website Form", productCategory: "", city: "", currentLevel: "", passoutYear: "", remarks: "", consent: false, website: "" },
  });

  useEffect(() => {
    fetch("/api/enquire")
      .then((response) => response.json())
      .then((data: Lists) => setLists(data))
      .catch(() => undefined);
  }, []);

  async function onSubmit(values: Values) {
    setError("");
    const response = await fetch("/api/enquire", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...values, passoutYear: values.passoutYear || null }),
    });
    const data = (await response.json()) as { error?: string; message?: string; leadCode?: string; duplicate?: boolean };
    if (!response.ok) {
      setError(data.error || "Could not send the enquiry");
      return;
    }
    setDone(data.duplicate ? data.message || "We already have your details." : `Thank you. Your enquiry reference is ${data.leadCode}.`);
    form.reset();
  }

  if (done) {
    return (
      <main className="mx-auto max-w-lg px-4 py-16">
        <h1 className="text-3xl font-semibold text-[#004B93]">Enquiry received</h1>
        <p className="mt-3 text-slate-700">{done}</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-10">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#1A6CC8]">Whiteboard Consultants</p>
      <h1 className="text-3xl font-semibold text-[#004B93]">Talk to a counsellor</h1>
      <p className="mt-2 text-sm text-slate-600">Tell us what you want to study or learn. We will call you back.</p>
      <form className="mt-6 space-y-3" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="absolute -left-[9999px]" aria-hidden="true">
          <label htmlFor="website">Website</label>
          <input id="website" tabIndex={-1} autoComplete="off" {...form.register("website")} />
        </div>
        <div className="space-y-1"><Label htmlFor="name">Name</Label><Input id="name" {...form.register("name")} />{form.formState.errors.name ? <p className="text-xs text-[#C9002B]">{form.formState.errors.name.message}</p> : null}</div>
        <div className="space-y-1"><Label htmlFor="mobile">Mobile</Label><Input id="mobile" inputMode="tel" {...form.register("mobile")} /></div>
        <div className="space-y-1"><Label htmlFor="email">Email</Label><Input id="email" type="email" {...form.register("email")} />{form.formState.errors.email ? <p className="text-xs text-[#C9002B]">{form.formState.errors.email.message}</p> : null}</div>
        <label className="block text-sm"><span className="font-medium">I am interested in</span>
          <select className={fieldClass} {...form.register("productCategory")}><option value="">Select</option>{lists.productCategory.map((item) => <option key={item}>{item}</option>)}</select>
        </label>
        <label className="block text-sm"><span className="font-medium">Current level</span>
          <select className={fieldClass} {...form.register("currentLevel")}><option value="">Select</option>{lists.currentLevel.map((item) => <option key={item}>{item}</option>)}</select>
        </label>
        <label className="block text-sm"><span className="font-medium">How did you hear about us?</span>
          <select className={fieldClass} {...form.register("source")}>{lists.source.map((item) => <option key={item}>{item}</option>)}{lists.source.length === 0 ? <option>Website Form</option> : null}</select>
        </label>
        <div className="space-y-1"><Label htmlFor="city">City</Label><Input id="city" {...form.register("city")} /></div>
        <div className="space-y-1"><Label htmlFor="passout">Passout year</Label><Input id="passout" {...form.register("passoutYear")} /></div>
        <div className="space-y-1"><Label htmlFor="remarks">Anything else</Label><Textarea id="remarks" {...form.register("remarks")} /></div>
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" className="mt-1" {...form.register("consent")} />
          I agree to be contacted about this enquiry.
        </label>
        {form.formState.errors.consent ? <p className="text-xs text-[#C9002B]">{form.formState.errors.consent.message}</p> : null}
        {error ? <p role="alert" className="text-sm text-[#C9002B]">{error}</p> : null}
        <Button type="submit" className="bg-[#004B93] hover:bg-[#1A6CC8]" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? "Sending…" : "Send enquiry"}</Button>
      </form>
    </main>
  );
}
