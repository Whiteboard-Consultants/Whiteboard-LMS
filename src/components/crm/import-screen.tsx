"use client";

import { useState } from "react";
import { IMPORT_FIELDS, type ImportFieldKey } from "@/lib/crm/constants";
import { Button } from "@/components/ui/button";
import { crmFetch, fieldClass } from "@/components/crm/bits";

type PreviewRow = {
  rowNumber: number;
  name: string;
  mobile: string;
  email: string;
  errors: string[];
  warnings: string[];
  duplicateOf: string | null;
};

export function ImportScreen() {
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [mapping, setMapping] = useState<Record<string, string | null>>({});
  const [preview, setPreview] = useState<PreviewRow[]>([]);
  const [strategy, setStrategy] = useState<"skip" | "update" | "import">("skip");
  const [report, setReport] = useState<{ created: number; updated: number; skipped: number; errors: { rowNumber: number; message: string }[] } | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onFile(file: File) {
    setBusy(true);
    setError("");
    setReport(null);
    const body = new FormData();
    body.set("file", file);
    try {
      const response = await fetch("/api/crm/import", { method: "POST", body });
      const data = (await response.json()) as { error?: string; headers: string[]; rows: Record<string, string>[]; mapping: Record<string, string | null> };
      if (!response.ok) throw new Error(data.error || "Could not read the file");
      setHeaders(data.headers);
      setRows(data.rows);
      setMapping(data.mapping);
      setPreview([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not read the file");
    } finally {
      setBusy(false);
    }
  }

  async function runPreview() {
    setBusy(true);
    setError("");
    try {
      const data = await crmFetch<{ preview: PreviewRow[] }>("/api/crm/import", {
        method: "POST",
        body: JSON.stringify({ action: "preview", rows, mapping }),
      });
      setPreview(data.preview);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Preview failed");
    } finally {
      setBusy(false);
    }
  }

  async function commit() {
    setBusy(true);
    setError("");
    try {
      const data = await crmFetch<{ created: number; updated: number; skipped: number; errors: { rowNumber: number; message: string }[] }>("/api/crm/import", {
        method: "POST",
        body: JSON.stringify({ action: "commit", rows, mapping, strategy }),
      });
      setReport(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-[#004B93]">Import</h1>
        <a className="text-sm font-semibold text-[#004B93] underline" href="/api/crm/import">Download CSV template</a>
      </div>
      <label className="block rounded-lg bg-white p-4 text-sm shadow-sm">
        <span className="font-medium">CSV or XLSX file</span>
        <input className="mt-2 block" type="file" accept=".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" onChange={(event) => { const file = event.target.files?.[0]; if (file) void onFile(file); }} />
      </label>
      {error ? <p role="alert" className="text-sm text-[#C9002B]">{error}</p> : null}
      {headers.length > 0 ? (
        <section className="space-y-3 rounded-lg bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold">Map columns</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {IMPORT_FIELDS.map((field) => (
              <label key={field.key} className="text-sm">
                <span className="font-medium">{field.label}{"required" in field && field.required ? " *" : ""}</span>
                <select className={fieldClass} value={mapping[field.key as ImportFieldKey] ?? ""} onChange={(event) => setMapping({ ...mapping, [field.key]: event.target.value || null })}>
                  <option value="">Ignore</option>
                  {headers.map((header) => <option key={header}>{header}</option>)}
                </select>
              </label>
            ))}
          </div>
          <p className="text-sm text-slate-600">{rows.length.toLocaleString("en-IN")} rows found.</p>
          <Button type="button" className="bg-[#004B93]" disabled={busy} onClick={() => void runPreview()}>Preview</Button>
        </section>
      ) : null}
      {preview.length > 0 ? (
        <section className="space-y-3 rounded-lg bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold">Preview</h2>
          <div className="max-h-80 overflow-auto">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-[#F2F4F8]"><tr>{["Row", "Name", "Mobile", "Issues", "Duplicate"].map((heading) => <th key={heading} className="px-2 py-1">{heading}</th>)}</tr></thead>
              <tbody>
                {preview.slice(0, 50).map((row) => (
                  <tr key={row.rowNumber} className="border-t">
                    <td className="px-2 py-1">{row.rowNumber}</td>
                    <td className="px-2 py-1">{row.name || "—"}</td>
                    <td className="px-2 py-1">{row.mobile || "—"}</td>
                    <td className="px-2 py-1 text-[#C9002B]">{[...row.errors, ...row.warnings].join("; ") || "OK"}</td>
                    <td className="px-2 py-1">{row.duplicateOf ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <fieldset className="space-y-1 text-sm">
            <legend className="font-medium">Duplicates</legend>
            <label className="block"><input type="radio" name="strategy" checked={strategy === "skip"} onChange={() => setStrategy("skip")} /> Skip duplicates</label>
            <label className="block"><input type="radio" name="strategy" checked={strategy === "update"} onChange={() => setStrategy("update")} /> Update existing</label>
            <label className="block"><input type="radio" name="strategy" checked={strategy === "import"} onChange={() => setStrategy("import")} /> Import anyway</label>
          </fieldset>
          <Button type="button" className="bg-[#C9002B] hover:bg-[#a30024]" disabled={busy} onClick={() => void commit()}>{busy ? "Importing…" : "Import"}</Button>
        </section>
      ) : null}
      {report ? (
        <section className="rounded-lg bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold">Import report</h2>
          <p className="text-sm">Created {report.created}, updated {report.updated}, skipped {report.skipped}.</p>
          {report.errors.length > 0 ? (
            <ul className="mt-2 list-disc pl-5 text-sm text-[#C9002B]">
              {report.errors.slice(0, 30).map((item) => <li key={`${item.rowNumber}-${item.message}`}>Row {item.rowNumber}: {item.message}</li>)}
            </ul>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
