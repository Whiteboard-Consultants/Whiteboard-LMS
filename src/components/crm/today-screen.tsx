"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ActivityForm } from "@/components/crm/activity-form";
import {
  CrmMeta,
  EmptyBlock,
  ErrorBlock,
  GradeBadge,
  LoadingBlock,
  StatusBadge,
  TemperatureBadge,
  crmFetch,
  fieldClass,
} from "@/components/crm/bits";
import { formatDisplay } from "@/lib/crm/dates";

type Row = {
  id: string;
  leadCode: string;
  name: string;
  mobile: string | null;
  ownerName: string | null;
  productCategory: string | null;
  stage: string | null;
  temperature: string | null;
  nextFollowUpDate: string | null;
  followUpStatus: string;
  daysOverdue: number;
  leadScore: number | null;
  leadGrade: string | null;
  latestNote: string | null;
};

export function TodayScreen() {
  const [meta, setMeta] = useState<CrmMeta | null>(null);
  const [ownerId, setOwnerId] = useState("me");
  const [rows, setRows] = useState<Row[]>([]);
  const [summary, setSummary] = useState({ overdue: 0, dueToday: 0 });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<Row | null>(null);

  async function load(nextOwner = ownerId) {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        status: "Overdue,Due Today",
        sort: "daysOverdue",
        dir: "desc",
        pageSize: "100",
      });
      if (nextOwner) params.set("ownerId", nextOwner);
      const data = await crmFetch<{ rows: Row[]; summary: { overdue: number; dueToday: number } }>(
        `/api/crm/leads?${params.toString()}`,
      );
      setRows(data.rows);
      setSummary(data.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load today's list");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let ignore = false;
    const params = new URLSearchParams({
      status: "Overdue,Due Today",
      sort: "daysOverdue",
      dir: "desc",
      pageSize: "100",
      ownerId: "me",
    });
    Promise.all([
      crmFetch<CrmMeta>("/api/crm/meta"),
      crmFetch<{ rows: Row[]; summary: { overdue: number; dueToday: number } }>(`/api/crm/leads?${params.toString()}`),
    ])
      .then(([value, data]) => {
        if (ignore) return;
        setMeta(value);
        setOwnerId("me");
        setRows(data.rows);
        setSummary(data.summary);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (ignore) return;
        setError(err instanceof Error ? err.message : "Could not load CRM");
        setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, []);

  if (!meta && !error) return <LoadingBlock />;
  if (error && !meta) return <ErrorBlock message={error} onRetry={() => window.location.reload()} />;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-[#004B93]">Today</h1>
          <p className="text-sm text-slate-600">Overdue and due-today follow-ups, most overdue first.</p>
        </div>
        <label className="text-sm">
          <span className="mb-1 block font-medium">Counsellor</span>
          <select
            className={fieldClass}
            value={ownerId}
            onChange={(event) => {
              setOwnerId(event.target.value);
              void load(event.target.value);
            }}
          >
            <option value="me">My leads</option>
            <option value="">All counsellors</option>
            {meta?.users.map((user) => (
              <option key={user.id} value={user.id}>{user.name}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-600">Overdue</p>
          <p className="text-3xl font-semibold text-[#C9002B]">{summary.overdue}</p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-600">Due today</p>
          <p className="text-3xl font-semibold text-[#1A2340]">{summary.dueToday}</p>
        </div>
      </div>
      {loading ? <LoadingBlock /> : null}
      {error && meta ? <ErrorBlock message={error} onRetry={() => void load()} /> : null}
      {!loading && rows.length === 0 ? <EmptyBlock title="Nothing due" body="No overdue or due-today leads for this counsellor." /> : null}
      <div className="space-y-3 md:hidden">
        {rows.map((row) => (
          <article key={row.id} className="space-y-2 rounded-lg bg-white p-3 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <div>
                <Link href={`/crm/leads/${row.id}`} className="font-semibold text-[#004B93]">{row.name}</Link>
                <p className="text-xs text-slate-500">{row.leadCode}</p>
              </div>
              <StatusBadge status={row.followUpStatus} />
            </div>
            <PhoneLinks mobile={row.mobile} />
            <p className="text-sm">{row.productCategory} · {row.stage}</p>
            <div className="flex items-center gap-2">
              <TemperatureBadge value={row.temperature} />
              <GradeBadge value={row.leadGrade} />
              <span className="text-sm">{row.daysOverdue ? `${row.daysOverdue}d overdue` : "Due today"}</span>
            </div>
            {row.latestNote ? <p className="text-sm text-slate-600">{row.latestNote}</p> : null}
            <button type="button" className="text-sm font-semibold text-[#004B93]" onClick={() => setActive(row)}>
              Log activity
            </button>
          </article>
        ))}
      </div>
      {!loading && rows.length > 0 ? (
        <div className="hidden max-h-[70vh] overflow-auto rounded-lg bg-white shadow-sm md:block">
          <table className="w-full min-w-[1100px] text-left text-sm">
            <thead className="sticky top-0 bg-[#F2F4F8] text-xs uppercase tracking-wide text-slate-600">
              <tr>
                {["Code", "Name", "Mobile", "Counsellor", "Product", "Stage", "Temp", "Next", "Status", "Overdue", "Score", "Note", ""].map((heading) => (
                  <th key={heading} className="px-3 py-2 font-semibold">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t border-slate-100">
                  <td className="px-3 py-2 font-medium">{row.leadCode}</td>
                  <td className="px-3 py-2"><Link className="text-[#004B93] underline" href={`/crm/leads/${row.id}`}>{row.name}</Link></td>
                  <td className="px-3 py-2"><PhoneLinks mobile={row.mobile} /></td>
                  <td className="px-3 py-2">{row.ownerName ?? "—"}</td>
                  <td className="px-3 py-2">{row.productCategory ?? "—"}</td>
                  <td className="px-3 py-2">{row.stage ?? "—"}</td>
                  <td className="px-3 py-2"><TemperatureBadge value={row.temperature} /></td>
                  <td className="px-3 py-2">{formatDisplay(row.nextFollowUpDate)}</td>
                  <td className="px-3 py-2"><StatusBadge status={row.followUpStatus} /></td>
                  <td className="px-3 py-2">{row.daysOverdue || "—"}</td>
                  <td className="px-3 py-2"><span className="inline-flex items-center gap-1">{row.leadScore ?? "—"} <GradeBadge value={row.leadGrade} /></span></td>
                  <td className="max-w-[220px] truncate px-3 py-2">{row.latestNote ?? "—"}</td>
                  <td className="px-3 py-2">
                    <button type="button" className="font-semibold text-[#004B93]" onClick={() => setActive(row)}>Log activity</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      <Sheet open={Boolean(active)} onOpenChange={(open) => !open && setActive(null)}>
        <SheetContent className="overflow-y-auto sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Log activity</SheetTitle>
            <SheetDescription>{active ? `${active.leadCode} · ${active.name}` : ""}</SheetDescription>
          </SheetHeader>
          {active && meta ? (
            <div className="mt-4">
              <ActivityForm
                meta={meta}
                leadId={active.id}
                onSaved={() => {
                  setActive(null);
                  void load();
                }}
              />
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function PhoneLinks({ mobile }: { mobile: string | null }) {
  if (!mobile) return <span>—</span>;
  return (
    <span className="flex flex-wrap gap-2">
      <a className="text-[#004B93] underline" href={`tel:${mobile}`}>{mobile}</a>
      <a className="text-[#0E7A45] underline" href={`https://wa.me/91${mobile}`} target="_blank" rel="noreferrer">WhatsApp</a>
    </span>
  );
}
