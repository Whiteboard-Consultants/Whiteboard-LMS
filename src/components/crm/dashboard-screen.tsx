"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CrmMeta, ErrorBlock, LoadingBlock, crmFetch, fieldClass } from "@/components/crm/bits";
import { DateField } from "@/components/crm/date-field";
import { Button } from "@/components/ui/button";
import { formatMonthLabel } from "@/lib/crm/dates";
import { formatInr, formatNumberIn } from "@/lib/crm/format";

type Slice = { key: string; leads: number; enrolled: number; conversionPct: number; revenueWon: number; weightedOpenPipeline: number };
type Dashboard = {
  kpis: Record<string, number | null>;
  byStage: Slice[];
  byProduct: Slice[];
  bySource: Slice[];
  byCountry: Slice[];
  byCounsellor: Slice[];
  trend: { month: string; newLeads: number; enrolled: number; revenue: number }[];
};

const CARDS: { key: string; label: string; money?: boolean; percent?: boolean }[] = [
  { key: "totalLeads", label: "Total leads" },
  { key: "openLeads", label: "Open leads" },
  { key: "hotOpenLeads", label: "Hot leads (open)" },
  { key: "enrolled", label: "Enrolled" },
  { key: "lost", label: "Lost" },
  { key: "conversionPct", label: "Conversion", percent: true },
  { key: "overdueFollowUps", label: "Overdue follow-ups" },
  { key: "dueToday", label: "Due today" },
  { key: "revenueWon", label: "Revenue won", money: true },
  { key: "avgDaysToFirstContact", label: "Avg days to first contact" },
  { key: "weightedOpenPipeline", label: "Weighted open pipeline", money: true },
  { key: "avgLeadScore", label: "Avg lead score (open)" },
  { key: "dataAlerts", label: "Data alerts" },
];

export function DashboardScreen() {
  const [meta, setMeta] = useState<CrmMeta | null>(null);
  const [data, setData] = useState<Dashboard | null>(null);
  const [ownerId, setOwnerId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function load(nextOwner = ownerId, nextFrom = from, nextTo = to) {
    setLoading(true);
    setError("");
    const params = new URLSearchParams();
    if (nextOwner) params.set("ownerId", nextOwner);
    if (nextFrom) params.set("enquiryFrom", nextFrom);
    if (nextTo) params.set("enquiryTo", nextTo);
    try {
      setData(await crmFetch<Dashboard>(`/api/crm/dashboard?${params.toString()}`));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load the dashboard");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    crmFetch<CrmMeta>("/api/crm/meta").then(setMeta).catch((err: unknown) => setError(err instanceof Error ? err.message : "Could not load"));
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!data && loading) return <LoadingBlock />;
  if (error && !data) return <ErrorBlock message={error} onRetry={() => void load()} />;
  if (!data) return null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-2xl font-semibold text-[#004B93]">Dashboard</h1>
        <div className="flex flex-wrap items-end gap-2">
          <label className="text-sm"><span className="font-medium">Counsellor</span>
            <select className={fieldClass} value={ownerId} onChange={(event) => setOwnerId(event.target.value)}>
              <option value="">All</option>
              <option value="me">Me</option>
              {meta?.users.map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}
            </select>
          </label>
          <DateField id="dash-from" label="Enquiry from" value={from} onChange={setFrom} />
          <DateField id="dash-to" label="Enquiry to" value={to} onChange={setTo} />
          <Button type="button" className="bg-[#004B93]" onClick={() => void load()}>Apply</Button>
        </div>
      </div>
      {error ? <ErrorBlock message={error} /> : null}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {CARDS.map((card) => {
          const value = data.kpis[card.key];
          const shown = value === null || value === undefined ? "—" : card.money ? formatInr(value) : card.percent ? `${value}%` : formatNumberIn(value);
          return (
            <div key={card.key} className="rounded-lg bg-white p-3 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-slate-500">{card.label}</p>
              <p className="mt-1 text-2xl font-semibold text-[#1A2340]">{shown}</p>
            </div>
          );
        })}
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <ChartCard title="Funnel by stage">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.byStage}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="key" interval={0} angle={-25} height={70} tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="leads" fill="#004B93" name="Leads" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Leads vs enrolled by product">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.byProduct}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="key" interval={0} angle={-25} height={80} tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="leads" fill="#004B93" name="Leads" />
              <Bar dataKey="enrolled" fill="#C9002B" name="Enrolled" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Leads by source">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.bySource}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="key" interval={0} angle={-25} height={80} tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="leads" fill="#1A6CC8" name="Leads" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="12-month trend">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.trend.map((point) => ({ ...point, label: formatMonthLabel(point.month) }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line dataKey="newLeads" stroke="#004B93" name="New leads" />
              <Line dataKey="enrolled" stroke="#C9002B" name="Enrolled" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
      <SliceTable title="By stage" rows={data.byStage} />
      <SliceTable title="By product" rows={data.byProduct} />
      <SliceTable title="By source" rows={data.bySource} />
      <SliceTable title="By country" rows={data.byCountry} />
      <SliceTable title="By counsellor" rows={data.byCounsellor} />
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-lg bg-white p-3 shadow-sm">
      <h2 className="mb-2 text-lg font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function SliceTable({ title, rows }: { title: string; rows: Slice[] }) {
  return (
    <section className="overflow-auto rounded-lg bg-white shadow-sm">
      <h2 className="px-3 pt-3 text-lg font-semibold">{title}</h2>
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="sticky top-0 bg-[#F2F4F8] text-xs uppercase">
          <tr>
            {["Group", "Leads", "Enrolled", "Conversion", "Revenue won", "Weighted pipeline"].map((heading) => (
              <th key={heading} className="px-3 py-2">{heading}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key} className="border-t border-slate-100">
              <td className="px-3 py-2">{row.key}</td>
              <td className="px-3 py-2">{formatNumberIn(row.leads)}</td>
              <td className="px-3 py-2">{formatNumberIn(row.enrolled)}</td>
              <td className="px-3 py-2">{row.conversionPct}%</td>
              <td className="px-3 py-2">{formatInr(row.revenueWon)}</td>
              <td className="px-3 py-2">{formatInr(row.weightedOpenPipeline)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
