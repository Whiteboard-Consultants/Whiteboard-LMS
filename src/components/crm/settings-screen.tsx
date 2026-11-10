"use client";

import { useEffect, useState } from "react";
import { BUSINESS_VERTICALS, LOOKUP_TYPES } from "@/lib/crm/constants";
import { ErrorBlock, LoadingBlock, crmFetch, fieldClass } from "@/components/crm/bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Lookup = { id: string; type: string; label: string; sortOrder: number; active: boolean; meta: Record<string, unknown> | null };
type Settings = {
  leadCodePrefix: string;
  autoAssign: boolean;
  defaultFirstContactDays: number;
  scoring: {
    closureWeight: number;
    temperaturePoints: Record<string, number>;
    recencyWithin7: number;
    recencyWithin14: number;
    profileWeight: number;
    budgetPoints: number;
    gradeA: number;
    gradeB: number;
  };
  smtpConfigured: boolean;
};
type UserRow = { id: string; name: string; email: string; role: string; active: boolean };
type KeyRow = { id: string; name: string; keyPrefix: string; createdAt: string };

export function SettingsScreen() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [lookups, setLookups] = useState<Lookup[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [keys, setKeys] = useState<KeyRow[]>([]);
  const [type, setType] = useState("source");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [freshKey, setFreshKey] = useState("");

  async function load() {
    const [settingsData, lookupData, userData, keyData] = await Promise.all([
      crmFetch<Settings>("/api/crm/settings"),
      crmFetch<{ lookups: Lookup[] }>("/api/crm/lookups"),
      crmFetch<{ users: UserRow[] }>("/api/crm/users"),
      crmFetch<{ keys: KeyRow[] }>("/api/crm/api-keys"),
    ]);
    setSettings(settingsData);
    setLookups(lookupData.lookups);
    setUsers(userData.users);
    setKeys(keyData.keys);
  }

  useEffect(() => {
    load().catch((err: unknown) => setError(err instanceof Error ? err.message : "Could not load settings"));
  }, []);

  if (error && !settings) return <ErrorBlock message={error} onRetry={() => void load()} />;
  if (!settings) return <LoadingBlock />;

  const ofType = lookups.filter((item) => item.type === type).sort((a, b) => a.sortOrder - b.sortOrder);

  async function saveGeneral() {
    await crmFetch("/api/crm/settings", { method: "POST", body: JSON.stringify(settings) });
    setNotice("Settings saved");
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-[#004B93]">Settings</h1>
      {notice ? <p className="text-sm text-[#0E7A45]">{notice}</p> : null}
      {error ? <p className="text-sm text-[#C9002B]">{error}</p> : null}
      <Tabs defaultValue="general">
        <TabsList className="flex h-auto flex-wrap">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="lookups">Lookups</TabsTrigger>
          <TabsTrigger value="scoring">Scoring</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="keys">API keys</TabsTrigger>
        </TabsList>
        <TabsContent value="general" className="space-y-3 rounded-lg bg-white p-4 shadow-sm">
          <label className="block text-sm"><span className="font-medium">Lead code prefix</span>
            <Input value={settings.leadCodePrefix} onChange={(event) => setSettings({ ...settings, leadCodePrefix: event.target.value })} />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={settings.autoAssign} onChange={(event) => setSettings({ ...settings, autoAssign: event.target.checked })} />
            Auto-assign new intake leads round-robin
          </label>
          <label className="block text-sm"><span className="font-medium">Default first-contact lead time (days)</span>
            <Input type="number" min={0} max={30} value={settings.defaultFirstContactDays} onChange={(event) => setSettings({ ...settings, defaultFirstContactDays: Number(event.target.value) })} />
          </label>
          <p className="text-sm text-slate-600">{settings.smtpConfigured ? "SMTP is configured. The daily digest will send email." : "SMTP is not configured. The daily digest logs to the server console."}</p>
          <Button type="button" className="bg-[#004B93]" onClick={() => void saveGeneral()}>Save</Button>
        </TabsContent>
        <TabsContent value="lookups" className="space-y-3 rounded-lg bg-white p-4 shadow-sm">
          <select className={fieldClass} value={type} onChange={(event) => setType(event.target.value)}>
            {LOOKUP_TYPES.map((item) => <option key={item.type} value={item.type}>{item.label}</option>)}
          </select>
          <ul className="space-y-2">
            {ofType.map((item, index) => (
              <li key={item.id} className="grid gap-2 rounded-md border p-2 md:grid-cols-[1fr_auto_auto]">
                <input className={fieldClass} defaultValue={item.label} onBlur={(event) => {
                  if (event.target.value !== item.label) {
                    void crmFetch("/api/crm/lookups", { method: "PUT", body: JSON.stringify({ id: item.id, label: event.target.value }) }).then(load);
                  }
                }} />
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={item.active} onChange={(event) => void crmFetch("/api/crm/lookups", { method: "PUT", body: JSON.stringify({ id: item.id, active: event.target.checked }) }).then(load)} />
                  Active
                </label>
                <div className="flex gap-1">
                  <Button type="button" variant="outline" disabled={index === 0} onClick={() => {
                    const order = ofType.map((row) => row.id);
                    [order[index - 1], order[index]] = [order[index], order[index - 1]];
                    void crmFetch("/api/crm/lookups", { method: "PUT", body: JSON.stringify({ order }) }).then(load);
                  }}>Up</Button>
                  <Button type="button" variant="outline" disabled={index === ofType.length - 1} onClick={() => {
                    const order = ofType.map((row) => row.id);
                    [order[index + 1], order[index]] = [order[index], order[index + 1]];
                    void crmFetch("/api/crm/lookups", { method: "PUT", body: JSON.stringify({ order }) }).then(load);
                  }}>Down</Button>
                </div>
                {type === "stage" ? (
                  <label className="text-sm md:col-span-3">Probability %
                    <input className={fieldClass} type="number" defaultValue={Number(item.meta?.probability ?? 0) * 100} onBlur={(event) => {
                      const probability = Number(event.target.value) / 100;
                      void crmFetch("/api/crm/lookups", { method: "PUT", body: JSON.stringify({ id: item.id, meta: { ...(item.meta ?? {}), probability } }) }).then(load);
                    }} />
                  </label>
                ) : null}
                {type === "productCategory" ? (
                  <label className="text-sm md:col-span-3">Vertical
                    <select className={fieldClass} value={String(item.meta?.vertical ?? "")} onChange={(event) => void crmFetch("/api/crm/lookups", { method: "PUT", body: JSON.stringify({ id: item.id, meta: { ...(item.meta ?? {}), vertical: event.target.value } }) }).then(load)}>
                      {BUSINESS_VERTICALS.map((vertical) => <option key={vertical}>{vertical}</option>)}
                    </select>
                  </label>
                ) : null}
              </li>
            ))}
          </ul>
          <form className="flex gap-2" onSubmit={(event) => {
            event.preventDefault();
            const form = event.currentTarget;
            const data = new FormData(form);
            void crmFetch("/api/crm/lookups", { method: "PUT", body: JSON.stringify({ type, label: String(data.get("label") || "") }) }).then(() => { form.reset(); return load(); });
          }}>
            <Input name="label" placeholder="New label" required />
            <Button type="submit" className="bg-[#004B93]">Add</Button>
          </form>
        </TabsContent>
        <TabsContent value="scoring" className="grid gap-3 rounded-lg bg-white p-4 shadow-sm md:grid-cols-2">
          {([
            ["closureWeight", "Closure weight"],
            ["recencyWithin7", "Recency within 7 days"],
            ["recencyWithin14", "Recency within 14 days"],
            ["profileWeight", "Profile weight"],
            ["budgetPoints", "Budget points"],
            ["gradeA", "Grade A from"],
            ["gradeB", "Grade B from"],
          ] as const).map(([key, label]) => (
            <label key={key} className="text-sm"><span className="font-medium">{label}</span>
              <Input type="number" value={settings.scoring[key]} onChange={(event) => setSettings({ ...settings, scoring: { ...settings.scoring, [key]: Number(event.target.value) } })} />
            </label>
          ))}
          {Object.entries(settings.scoring.temperaturePoints).map(([name, points]) => (
            <label key={name} className="text-sm"><span className="font-medium">{name} points</span>
              <Input type="number" value={points} onChange={(event) => setSettings({ ...settings, scoring: { ...settings.scoring, temperaturePoints: { ...settings.scoring.temperaturePoints, [name]: Number(event.target.value) } } })} />
            </label>
          ))}
          <Button type="button" className="bg-[#004B93]" onClick={() => void saveGeneral()}>Save scoring</Button>
        </TabsContent>
        <TabsContent value="users" className="space-y-3 rounded-lg bg-white p-4 shadow-sm">
          <form className="grid gap-2 md:grid-cols-4" onSubmit={async (event) => {
            event.preventDefault();
            const form = event.currentTarget;
            const data = new FormData(form);
            await crmFetch("/api/crm/users", { method: "POST", body: JSON.stringify({ name: data.get("name"), email: data.get("email"), password: data.get("password"), role: data.get("role") }) });
            form.reset();
            await load();
          }}>
            <Input name="name" placeholder="Name" required />
            <Input name="email" type="email" placeholder="Email" required />
            <Input name="password" type="password" placeholder="Password" required minLength={8} />
            <select name="role" className={fieldClass}><option value="COUNSELLOR">Counsellor</option><option value="ADMIN">Admin</option></select>
            <Button type="submit" className="bg-[#004B93]">Create user</Button>
          </form>
          <ul className="space-y-2 text-sm">
            {users.map((user) => (
              <li key={user.id} className="flex flex-wrap items-center gap-2 border-b py-2">
                <span className="font-medium">{user.name}</span>
                <span className="text-slate-500">{user.email}</span>
                <select className={fieldClass} value={user.role} onChange={(event) => void crmFetch(`/api/crm/users/${user.id}`, { method: "PATCH", body: JSON.stringify({ role: event.target.value }) }).then(load)}>
                  <option value="ADMIN">ADMIN</option>
                  <option value="COUNSELLOR">COUNSELLOR</option>
                </select>
                <Button type="button" variant="outline" onClick={() => void crmFetch(`/api/crm/users/${user.id}`, { method: "PATCH", body: JSON.stringify({ active: !user.active }) }).then(load)}>{user.active ? "Deactivate" : "Activate"}</Button>
                <form onSubmit={(event) => { event.preventDefault(); const password = new FormData(event.currentTarget).get("password"); void crmFetch(`/api/crm/users/${user.id}`, { method: "PATCH", body: JSON.stringify({ password }) }).then(() => setNotice(`Password updated for ${user.name}`)); }}>
                  <Input name="password" type="password" placeholder="New password" minLength={8} required className="inline-block w-40" />
                  <Button type="submit" variant="outline">Reset</Button>
                </form>
              </li>
            ))}
          </ul>
        </TabsContent>
        <TabsContent value="keys" className="space-y-3 rounded-lg bg-white p-4 shadow-sm">
          <form className="flex gap-2" onSubmit={async (event) => {
            event.preventDefault();
            const form = event.currentTarget;
            const name = String(new FormData(form).get("name") || "");
            const created = await crmFetch<{ apiKey: string }>("/api/crm/api-keys", { method: "POST", body: JSON.stringify({ name }) });
            setFreshKey(created.apiKey);
            form.reset();
            await load();
          }}>
            <Input name="name" placeholder="Key name" required />
            <Button type="submit" className="bg-[#004B93]">Create key</Button>
          </form>
          {freshKey ? <p role="status" className="rounded-md bg-[#fff8eb] p-3 text-sm">Copy this key now. It will not be shown again: <code>{freshKey}</code></p> : null}
          <ul className="space-y-2 text-sm">
            {keys.map((key) => (
              <li key={key.id} className="flex items-center justify-between border-b py-2">
                <span>{key.name} · {key.keyPrefix}…</span>
                <Button type="button" variant="outline" onClick={() => void crmFetch(`/api/crm/api-keys/${key.id}`, { method: "DELETE" }).then(load)}>Revoke</Button>
              </li>
            ))}
          </ul>
        </TabsContent>
      </Tabs>
    </div>
  );
}
