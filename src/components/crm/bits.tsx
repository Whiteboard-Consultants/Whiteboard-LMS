"use client";

import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export type LookupOption = {
  id: string;
  label: string;
  active: boolean;
  sortOrder: number;
  meta: Record<string, unknown> | null;
};

export type CrmMeta = {
  today: string;
  me: { id: string; name: string; email: string; role: string };
  users: { id: string; name: string; role: string; active: boolean }[];
  lookups: Record<string, LookupOption[]>;
};

export async function crmFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  if (init?.body && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const response = await fetch(url, { ...init, headers });
  const data = (await response.json().catch(() => ({}))) as { error?: string };
  if (!response.ok) throw new Error(data.error || "Request failed");
  return data as T;
}

export function optionsOf(meta: CrmMeta | null, type: string, current?: string | null) {
  const rows = (meta?.lookups[type] ?? []).filter((item) => item.active || item.label === current);
  return rows.map((item) => ({ value: item.label, label: item.label }));
}

export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Overdue: "bg-[#C9002B] text-white",
    "Due Today": "bg-[#E8A020] text-[#1A2340]",
    Scheduled: "bg-[#0E7A45] text-white",
    "No Follow-up Set": "bg-[#C2410C] text-white",
    Closed: "bg-[#6B7280] text-white",
  };
  return <span className={cn("inline-flex rounded-full px-2 py-0.5 text-xs font-semibold", styles[status] ?? "bg-slate-200")}>{status}</span>;
}

export function TemperatureBadge({ value }: { value: string | null }) {
  if (!value) return <span>—</span>;
  const styles: Record<string, string> = {
    Hot: "bg-[#C9002B] text-white",
    Warm: "bg-[#E8A020] text-[#1A2340]",
    Cold: "bg-[#1A6CC8] text-white",
  };
  return <span className={cn("inline-flex rounded-full px-2 py-0.5 text-xs font-semibold", styles[value] ?? "bg-slate-200")}>{value}</span>;
}

export function GradeBadge({ value }: { value: string | null }) {
  if (!value) return <span>—</span>;
  const styles: Record<string, string> = {
    A: "bg-[#0E7A45] text-white",
    B: "bg-[#004B93] text-white",
    C: "bg-[#1A2340] text-white",
  };
  return <span className={cn("inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold", styles[value])}>{value}</span>;
}

export function LoadingBlock() {
  return (
    <div className="space-y-3" aria-busy="true" aria-live="polite">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

export function ErrorBlock({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="rounded-lg border border-[#C9002B]/30 bg-white p-4">
      <p className="font-medium text-[#C9002B]">{message}</p>
      {onRetry ? (
        <button type="button" className="mt-3 text-sm font-semibold text-[#004B93] underline" onClick={onRetry}>
          Try again
        </button>
      ) : null}
    </div>
  );
}

export function EmptyBlock({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-lg border border-dashed border-[#004B93]/30 bg-white p-8 text-center">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-slate-600">{body}</p>
    </div>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-1 text-sm">
      <span className="font-medium text-[#1A2340]">{label}</span>
      {children}
    </label>
  );
}

export const fieldClass =
  "h-10 w-full rounded-md border border-slate-300 bg-white px-2 text-sm text-[#1A2340] focus:outline-none focus:ring-2 focus:ring-[#004B93]";
