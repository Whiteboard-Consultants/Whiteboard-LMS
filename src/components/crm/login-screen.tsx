"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { LoadingBlock } from "@/components/crm/bits";
import { useLmsBridge } from "@/components/crm/use-lms-bridge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type Values = z.infer<typeof schema>;

export function LoginScreen() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const bridge = useLmsBridge();
  const [error, setError] = useState("");
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { email: "", password: "" } });

  useEffect(() => {
    if (status === "authenticated" || bridge.state === "signed-in") {
      router.replace("/crm/today");
    }
  }, [status, bridge.state, router]);

  if (status === "loading" || bridge.state === "waiting" || bridge.state === "working" || bridge.state === "signed-in" || session?.user?.id) {
    return (
      <main className="mx-auto max-w-md px-4 py-16">
        <LoadingBlock label="Opening the CRM with your admin login…" />
      </main>
    );
  }

  if (bridge.lmsStaff) {
    return (
      <main className="mx-auto max-w-md px-4 py-16">
        <h1 className="text-2xl font-semibold text-[#004B93]">CRM</h1>
        <p role="alert" className="mt-3 text-sm text-[#C9002B]">
          {bridge.message || "Your admin login was recognised, but the CRM could not open."}
        </p>
      </main>
    );
  }

  async function onSubmit(values: Values) {
    setError("");
    const result = await signIn("credentials", { ...values, redirect: false });
    if (result?.error) {
      setError("Those details were not recognised, or the account is inactive.");
      return;
    }
    router.replace("/crm/today");
    router.refresh();
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-4">
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-4 rounded-xl bg-white p-6 shadow-sm">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#1A6CC8]">Whiteboard Consultants</p>
          <h1 className="text-2xl font-semibold text-[#004B93]">CRM sign in</h1>
        </div>
        <div className="space-y-1">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="username" {...form.register("email")} />
          {form.formState.errors.email ? <p className="text-xs text-[#C9002B]">{form.formState.errors.email.message}</p> : null}
        </div>
        <div className="space-y-1">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" autoComplete="current-password" {...form.register("password")} />
        </div>
        {error ? <p role="alert" className="text-sm text-[#C9002B]">{error}</p> : null}
        <Button type="submit" className="w-full bg-[#004B93] hover:bg-[#1A6CC8]" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </main>
  );
}
