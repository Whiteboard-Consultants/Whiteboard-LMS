"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type VisibilityState,
} from "@tanstack/react-table";
import { COLUMN_GROUPS, DATA_ALERTS } from "@/lib/crm/constants";
import { formatDisplay } from "@/lib/crm/dates";
import { formatInr } from "@/lib/crm/format";
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
  optionsOf,
} from "@/components/crm/bits";
import { DateField } from "@/components/crm/date-field";
import { Button } from "@/components/ui/button";

type Row = Record<string, unknown> & {
  id: string;
  leadCode: string;
  name: string;
  mobile: string | null;
  followUpStatus: string;
  temperature: string | null;
  leadGrade: string | null;
  leadScore: number | null;
  duplicate: boolean;
};

const DEFAULT_VISIBLE = [
  "leadCode", "name", "mobile", "ownerName", "productCategory", "stage", "temperature",
  "followUpStatus", "nextFollowUpDate", "leadScore", "leadGrade", "dataAlert",
];

function text(row: Row, key: string) {
  const value = row[key];
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (key.toLowerCase().includes("date") || key === "nextFollowUpDate" || key === "firstContactDate" || key === "lastContactDate") {
    return formatDisplay(String(value));
  }
  if (["budget", "expectedValue", "weightedValue"].includes(key) && typeof value === "number") return formatInr(value);
  if (key === "closureProbability" && typeof value === "number") return `${Math.round(value * 100)}%`;
  if (key === "profileCompleteness" && typeof value === "number") return `${Math.round(value * 100)}%`;
  return String(value);
}

export function LeadsScreen() {
  const router = useRouter();
  const [meta, setMeta] = useState<CrmMeta | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [ownerId, setOwnerId] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [sort, setSort] = useState("enquiryDate");
  const [dir, setDir] = useState<"asc" | "desc">("desc");
  const [visibility, setVisibility] = useState<VisibilityState>({});
  const [ready, setReady] = useState(false);
  const appliedInitialList = useRef(false);

  useEffect(() => {
    const stored = window.localStorage.getItem("crm-columns");
    const initial: VisibilityState = {};
    const visible = stored ? (JSON.parse(stored) as string[]) : DEFAULT_VISIBLE;
    for (const id of Object.values(COLUMN_GROUPS).flat()) initial[id] = visible.includes(id);
    setVisibility(initial);
  }, []);

  useEffect(() => {
    let ignore = false;
    const firstList = crmFetch<{ rows: Row[]; total: number }>(
      "/api/crm/leads?page=1&pageSize=50&sort=enquiryDate&dir=desc",
    );
    crmFetch<CrmMeta>("/api/crm/meta")
      .then(async (value) => {
        if (ignore) return;
        setMeta(value);
        if (value.me.role === "COUNSELLOR") {
          void firstList.catch(() => undefined);
          setOwnerId("me");
          setReady(true);
          return;
        }
        const data = await firstList;
        if (ignore) return;
        setRows(data.rows);
        setTotal(data.total);
        setPage(1);
        setLoading(false);
        setReady(true);
      })
      .catch((err: unknown) => {
        if (ignore) return;
        setError(err instanceof Error ? err.message : "Could not load leads");
        setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, []);

  async function load(nextPage = page) {
    setLoading(true);
    setError("");
    const params = new URLSearchParams({ page: String(nextPage), pageSize: "50", sort, dir });
    if (search.trim()) params.set("search", search.trim());
    if (ownerId) params.set("ownerId", ownerId);
    for (const [key, value] of Object.entries(filters)) if (value) params.set(key, value);
    try {
      const data = await crmFetch<{ rows: Row[]; total: number }>(`/api/crm/leads?${params.toString()}`);
      setRows(data.rows);
      setTotal(data.total);
      setPage(nextPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load leads");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!ready) return;
    if (!appliedInitialList.current) {
      appliedInitialList.current = true;
      if (ownerId === "") return;
    }
    void load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, ownerId, sort, dir, filters]);

  const isAdmin = meta?.me.role === "ADMIN";

  const columns = useMemo<ColumnDef<Row>[]>(() => {
    const ids = [...new Set(Object.values(COLUMN_GROUPS).flat())];
    const dataColumns: ColumnDef<Row>[] = ids.map((id) => ({
      id,
      accessorKey: id,
      header: id.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase()),
      cell: ({ row }) => {
        if (id === "name") return <Link className="font-medium text-[#004B93] underline" href={`/crm/leads/${row.original.id}`}>{row.original.name}</Link>;
        if (id === "followUpStatus") return <StatusBadge status={row.original.followUpStatus} />;
        if (id === "temperature") return <TemperatureBadge value={row.original.temperature} />;
        if (id === "leadGrade") return <GradeBadge value={row.original.leadGrade} />;
        if (id === "mobile" && row.original.mobile) {
          return <a className="text-[#004B93] underline" href={`tel:${row.original.mobile}`}>{row.original.mobile}</a>;
        }
        return text(row.original, id);
      },
    }));
    if (!isAdmin) return dataColumns;
    return [
      ...dataColumns,
      {
        id: "actions",
        header: "",
        enableHiding: false,
        cell: ({ row }) => (
          <Button
            type="button"
            variant="outline"
            className="h-8 border-[#C9002B] px-2 text-[#C9002B] hover:bg-[#C9002B] hover:text-white"
            onClick={() => {
              const confirmed = window.confirm(
                `Delete ${row.original.leadCode} ${row.original.name}? This cannot be undone.`,
              );
              if (!confirmed) return;
              void crmFetch(`/api/crm/leads/${row.original.id}`, { method: "DELETE" })
                .then(() => {
                  setRows((current) => current.filter((item) => item.id !== row.original.id));
                  setTotal((count) => Math.max(0, count - 1));
                })
                .catch((err: unknown) => {
                  setError(err instanceof Error ? err.message : "Could not delete the lead");
                });
            }}
          >
            Delete
          </Button>
        ),
      },
    ];
  }, [isAdmin]);

  const table = useReactTable({
    data: rows,
    columns,
    state: { columnVisibility: visibility },
    onColumnVisibilityChange: setVisibility,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    manualPagination: true,
  });

  function applyGroup(name: string) {
    const visible = COLUMN_GROUPS[name];
    const next: VisibilityState = {};
    for (const column of table.getAllColumns()) {
      next[column.id] = column.id === "actions" || visible.includes(column.id);
    }
    setVisibility(next);
    window.localStorage.setItem("crm-columns", JSON.stringify(visible));
  }

  async function exportCsv() {
    const params = new URLSearchParams({ sort, dir });
    if (search.trim()) params.set("search", search.trim());
    if (ownerId) params.set("ownerId", ownerId);
    for (const [key, value] of Object.entries(filters)) if (value) params.set(key, value);
    const response = await fetch(`/api/crm/leads/export?${params.toString()}`);
    if (!response.ok) return;
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "leads.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  if (!meta && !error) return <LoadingBlock />;
  if (!meta && error) return <ErrorBlock message={error} />;

  const pages = Math.max(1, Math.ceil(total / 50));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-[#004B93]">Leads</h1>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => void exportCsv()}>Export CSV</Button>
          <Button type="button" className="bg-[#004B93] hover:bg-[#1A6CC8]" onClick={() => router.push("/crm/leads/new")}>New lead</Button>
        </div>
      </div>
      <div className="grid gap-3 rounded-lg bg-white p-3 shadow-sm md:grid-cols-4">
        <label className="text-sm md:col-span-2">
          <span className="font-medium">Search</span>
          <input className={fieldClass} value={search} placeholder="Name, mobile, email, code" onChange={(event) => setSearch(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") void load(1); }} />
        </label>
        <label className="text-sm"><span className="font-medium">Owner</span>
          <select className={fieldClass} value={ownerId} onChange={(event) => setOwnerId(event.target.value)}>
            <option value="">All</option>
            <option value="me">My leads</option>
            <option value="unassigned">Unassigned</option>
            {meta?.users.map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}
          </select>
        </label>
        <Filter meta={meta} label="Stage" name="stage" type="stage" filters={filters} setFilters={setFilters} />
        <Filter meta={meta} label="Product" name="productCategory" type="productCategory" filters={filters} setFilters={setFilters} />
        <label className="text-sm"><span className="font-medium">Vertical</span>
          <select className={fieldClass} value={filters.vertical ?? ""} onChange={(event) => setFilters({ ...filters, vertical: event.target.value })}>
            <option value="">All</option>
            <option>Upskilling</option>
            <option>Language & Communication</option>
            <option>Study Abroad</option>
            <option>Domestic Admissions</option>
          </select>
        </label>
        <Filter meta={meta} label="Source" name="source" type="source" filters={filters} setFilters={setFilters} />
        <Filter meta={meta} label="Country" name="targetCountry" type="targetCountry" filters={filters} setFilters={setFilters} />
        <Filter meta={meta} label="Temperature" name="temperature" type="temperature" filters={filters} setFilters={setFilters} />
        <label className="text-sm"><span className="font-medium">Grade</span>
          <select className={fieldClass} value={filters.grade ?? ""} onChange={(event) => setFilters({ ...filters, grade: event.target.value })}>
            <option value="">All</option><option>A</option><option>B</option><option>C</option>
          </select>
        </label>
        <label className="text-sm"><span className="font-medium">Status</span>
          <select className={fieldClass} value={filters.status ?? ""} onChange={(event) => setFilters({ ...filters, status: event.target.value })}>
            <option value="">All</option>
            {["Overdue", "Due Today", "Scheduled", "No Follow-up Set", "Closed"].map((status) => <option key={status}>{status}</option>)}
          </select>
        </label>
        <label className="text-sm"><span className="font-medium">Duplicate</span>
          <select className={fieldClass} value={filters.duplicate ?? ""} onChange={(event) => setFilters({ ...filters, duplicate: event.target.value })}>
            <option value="">All</option><option value="true">Duplicates</option><option value="false">Unique</option>
          </select>
        </label>
        <label className="text-sm"><span className="font-medium">Data alert</span>
          <select className={fieldClass} value={filters.dataAlert ?? ""} onChange={(event) => setFilters({ ...filters, dataAlert: event.target.value })}>
            <option value="">All</option>
            <option value="any">Any alert</option>
            {DATA_ALERTS.map((alert) => <option key={alert}>{alert}</option>)}
          </select>
        </label>
        <DateField id="enquiryFrom" label="Enquiry from" value={filters.enquiryFrom ?? ""} onChange={(value) => setFilters({ ...filters, enquiryFrom: value })} />
        <DateField id="enquiryTo" label="Enquiry to" value={filters.enquiryTo ?? ""} onChange={(value) => setFilters({ ...filters, enquiryTo: value })} />
      </div>
      <div className="flex flex-wrap gap-2">
        {Object.keys(COLUMN_GROUPS).map((name) => (
          <button key={name} type="button" className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#004B93] shadow-sm" onClick={() => applyGroup(name)}>{name}</button>
        ))}
        <details className="text-sm">
          <summary className="cursor-pointer font-medium">Columns</summary>
          <div className="mt-2 grid max-h-48 grid-cols-2 gap-1 overflow-auto rounded-md bg-white p-2 shadow-sm">
            {table.getAllColumns().filter((column) => column.id !== "actions").map((column) => (
              <label key={column.id} className="flex items-center gap-2">
                <input type="checkbox" checked={column.getIsVisible()} onChange={column.getToggleVisibilityHandler()} />
                {column.id}
              </label>
            ))}
          </div>
        </details>
      </div>
      {error ? <ErrorBlock message={error} onRetry={() => void load()} /> : null}
      {loading ? <LoadingBlock /> : null}
      {!loading && rows.length === 0 ? <EmptyBlock title="No leads" body="Nothing matches these filters." /> : null}
      {rows.length > 0 ? (
        <div className="max-h-[70vh] overflow-auto rounded-lg bg-white shadow-sm">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="sticky top-0 z-10 bg-[#F2F4F8]">
              {table.getHeaderGroups().map((group) => (
                <tr key={group.id}>
                  {group.headers.map((header) => (
                    <th key={header.id} className="whitespace-nowrap px-3 py-2 text-xs font-semibold uppercase">
                      {header.column.id === "actions" ? null : (
                        <button
                          type="button"
                          className="text-left"
                          onClick={() => {
                            const nextDir = sort === header.column.id && dir === "asc" ? "desc" : "asc";
                            setSort(header.column.id);
                            setDir(nextDir);
                          }}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </button>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-t border-slate-100 hover:bg-slate-50">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className={`px-3 py-2 ${cell.column.id === "leadCode" ? "sticky left-0 bg-white" : ""}`}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      <div className="flex items-center justify-between text-sm">
        <p>{total.toLocaleString("en-IN")} leads</p>
        <div className="flex gap-2">
          <Button type="button" variant="outline" disabled={page <= 1} onClick={() => void load(page - 1)}>Previous</Button>
          <span>Page {page} of {pages}</span>
          <Button type="button" variant="outline" disabled={page >= pages} onClick={() => void load(page + 1)}>Next</Button>
        </div>
      </div>
    </div>
  );
}

function Filter({
  meta,
  label,
  name,
  type,
  filters,
  setFilters,
}: {
  meta: CrmMeta | null;
  label: string;
  name: string;
  type: string;
  filters: Record<string, string>;
  setFilters: (value: Record<string, string>) => void;
}) {
  return (
    <label className="text-sm">
      <span className="font-medium">{label}</span>
      <select className={fieldClass} value={filters[name] ?? ""} onChange={(event) => setFilters({ ...filters, [name]: event.target.value })}>
        <option value="">All</option>
        {optionsOf(meta, type).map((option) => <option key={option.value}>{option.label}</option>)}
      </select>
    </label>
  );
}
