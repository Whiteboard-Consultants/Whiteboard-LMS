"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ActivityForm } from "@/components/crm/activity-form";
import { CrmMeta, EmptyBlock, ErrorBlock, LoadingBlock, crmFetch, fieldClass, optionsOf } from "@/components/crm/bits";
import { DateField } from "@/components/crm/date-field";
import { formatDisplay } from "@/lib/crm/dates";

type ActivityRow = {
  id: string;
  leadId: string;
  leadCode: string;
  leadName: string;
  date: string | null;
  channel: string;
  outcome: string;
  summary: string;
  nextFollowUpDate: string | null;
  nextAction: string | null;
  loggedBy: string;
};

export function ActivityScreen() {
  const [meta, setMeta] = useState<CrmMeta | null>(null);
  const [rows, setRows] = useState<ActivityRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [counsellorId, setCounsellorId] = useState("");
  const [channel, setChannel] = useState("");
  const [outcome, setOutcome] = useState("");
  const [leadId, setLeadId] = useState("");
  const [leadQuery, setLeadQuery] = useState("");
  const [matches, setMatches] = useState<{ id: string; leadCode: string; name: string }[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function load(nextPage = 1) {
    setLoading(true);
    const params = new URLSearchParams({ page: String(nextPage), pageSize: "50" });
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    if (counsellorId) params.set("counsellorId", counsellorId);
    if (channel) params.set("channel", channel);
    if (outcome) params.set("outcome", outcome);
    try {
      const data = await crmFetch<{ rows: ActivityRow[]; total: number }>(`/api/crm/activities?${params.toString()}`);
      setRows(data.rows);
      setTotal(data.total);
      setPage(nextPage);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load activities");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    crmFetch<CrmMeta>("/api/crm/meta").then(setMeta).catch((err: unknown) => setError(err instanceof Error ? err.message : "Could not load"));
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (leadQuery.trim().length < 2) {
      setMatches([]);
      return;
    }
    const handle = setTimeout(() => {
      void crmFetch<{ rows: { id: string; leadCode: string; name: string }[] }>(`/api/crm/leads?search=${encodeURIComponent(leadQuery)}&pageSize=8`)
        .then((data) => setMatches(data.rows));
    }, 250);
    return () => clearTimeout(handle);
  }, [leadQuery]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-[#004B93]">Activity</h1>
      <section className="rounded-lg bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold">Quick add</h2>
        <label className="block max-w-md text-sm">
          <span className="font-medium">Find a lead</span>
          <input className={fieldClass} value={leadQuery} placeholder="Name, mobile, or code" onChange={(event) => setLeadQuery(event.target.value)} />
        </label>
        {matches.length > 0 ? (
          <ul className="mt-2 max-w-md rounded-md border bg-white">
            {matches.map((lead) => (
              <li key={lead.id}>
                <button type="button" className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50" onClick={() => { setLeadId(lead.id); setLeadQuery(`${lead.leadCode} ${lead.name}`); setMatches([]); }}>
                  {lead.leadCode} · {lead.name}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
        {meta && leadId ? <div className="mt-4 max-w-xl"><ActivityForm meta={meta} leadId={leadId} onSaved={() => void load(1)} /></div> : null}
      </section>
      <div className="grid gap-3 rounded-lg bg-white p-3 shadow-sm md:grid-cols-5">
        <DateField id="act-from" label="From" value={from} onChange={setFrom} />
        <DateField id="act-to" label="To" value={to} onChange={setTo} />
        <label className="text-sm"><span className="font-medium">Counsellor</span>
          <select className={fieldClass} value={counsellorId} onChange={(event) => setCounsellorId(event.target.value)}>
            <option value="">All</option>
            {meta?.users.map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}
          </select>
        </label>
        <label className="text-sm"><span className="font-medium">Channel</span>
          <select className={fieldClass} value={channel} onChange={(event) => setChannel(event.target.value)}>
            <option value="">All</option>
            {optionsOf(meta, "channel").map((option) => <option key={option.value}>{option.label}</option>)}
          </select>
        </label>
        <label className="text-sm"><span className="font-medium">Outcome</span>
          <select className={fieldClass} value={outcome} onChange={(event) => setOutcome(event.target.value)}>
            <option value="">All</option>
            {optionsOf(meta, "outcome").map((option) => <option key={option.value}>{option.label}</option>)}
          </select>
        </label>
        <button type="button" className="h-10 self-end rounded-md bg-[#004B93] px-3 text-sm font-semibold text-white" onClick={() => void load(1)}>Apply</button>
      </div>
      {error ? <ErrorBlock message={error} onRetry={() => void load(page)} /> : null}
      {loading ? <LoadingBlock /> : null}
      {!loading && rows.length === 0 ? <EmptyBlock title="No activity" body="Nothing matches these filters." /> : null}
      {rows.length > 0 ? (
        <div className="max-h-[65vh] overflow-auto rounded-lg bg-white shadow-sm">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="sticky top-0 bg-[#F2F4F8] text-xs uppercase">
              <tr>{["Date", "Lead", "Channel", "Outcome", "Summary", "Next", "Logged by"].map((heading) => <th key={heading} className="px-3 py-2">{heading}</th>)}</tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t border-slate-100">
                  <td className="px-3 py-2">{formatDisplay(row.date)}</td>
                  <td className="px-3 py-2"><Link className="text-[#004B93] underline" href={`/crm/leads/${row.leadId}`}>{row.leadCode} {row.leadName}</Link></td>
                  <td className="px-3 py-2">{row.channel}</td>
                  <td className="px-3 py-2">{row.outcome}</td>
                  <td className="px-3 py-2">{row.summary}</td>
                  <td className="px-3 py-2">{formatDisplay(row.nextFollowUpDate)}{row.nextAction ? ` · ${row.nextAction}` : ""}</td>
                  <td className="px-3 py-2">{row.loggedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      <p className="text-sm">{total.toLocaleString("en-IN")} activities</p>
    </div>
  );
}
