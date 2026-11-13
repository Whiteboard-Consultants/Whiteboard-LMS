"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut as signOutCrm, useSession } from "next-auth/react";
import { useEffect, useState, type ReactNode } from "react";
import { LoadingBlock } from "@/components/crm/bits";
import { useLmsBridge } from "@/components/crm/use-lms-bridge";
import { signOut as signOutAdmin } from "@/lib/supabase-auth";

const LINKS = [
  { href: "/crm/today", label: "Today" },
  { href: "/crm/leads", label: "Leads" },
  { href: "/crm/activity", label: "Activity" },
  { href: "/crm/dashboard", label: "Dashboard" },
  { href: "/crm/import", label: "Import" },
  { href: "/crm/settings", label: "Settings", admin: true },
];

export function CrmShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const bridge = useLmsBridge();
  const [leaving, setLeaving] = useState(false);

  async function signOutOfApp() {
    if (leaving) return;
    setLeaving(true);
    const fallback = window.setTimeout(() => {
      window.location.assign("/");
    }, 4000);
    try {
      await signOutAdmin();
      await signOutCrm({ redirect: false });
    } finally {
      window.clearTimeout(fallback);
      window.location.assign("/");
    }
  }

  useEffect(() => {
    if (leaving || pathname === "/crm/login" || status === "loading") return;
    if (session?.user?.id || bridge.state === "waiting" || bridge.state === "working" || bridge.state === "signed-in") return;
    if (bridge.state === "not-staff") router.replace("/crm/login");
  }, [leaving, pathname, status, session?.user?.id, bridge.state, router]);

  if (pathname === "/crm/login") return <>{children}</>;

  if (leaving) {
    return (
      <div className="p-6">
        <LoadingBlock label="Signing out…" />
      </div>
    );
  }

  if (status === "loading" || bridge.state === "waiting" || bridge.state === "working" || (bridge.state === "signed-in" && !session?.user?.id)) {
    return (
      <div className="p-6">
        <LoadingBlock label="Opening the CRM with your admin login…" />
      </div>
    );
  }

  if (!session?.user?.id && bridge.state === "not-staff") {
    return (
      <div className="p-6">
        <LoadingBlock label="Opening sign in…" />
      </div>
    );
  }

  if (!session?.user?.id) {
    return (
      <div className="p-6">
        <p className="text-sm text-[#C9002B]">{bridge.message || "The CRM could not use your admin login."}</p>
      </div>
    );
  }

  const admin = session.user.role === "ADMIN";

  return (
    <div className="min-h-screen md:grid md:grid-cols-[15rem_minmax(0,1fr)]">
      <aside className="hidden bg-[#1A2340] text-white md:sticky md:top-0 md:flex md:h-screen md:flex-col">
        <div className="px-4 py-5">
          <p className="text-xs uppercase tracking-wider text-white/70">Whiteboard</p>
          <h1 className="text-xl font-semibold">CRM</h1>
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-3" aria-label="CRM">
          {LINKS.filter((link) => !link.admin || admin).map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-md px-3 py-2 text-sm font-medium ${active ? "bg-white text-[#004B93]" : "text-white/90 hover:bg-white/10"}`}
                aria-current={active ? "page" : undefined}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="space-y-2 px-4 py-4 text-sm">
          <p className="truncate text-white/80">{session.user.name}</p>
          <Link href="/admin/dashboard" className="block text-white/70 underline">
            Back to admin
          </Link>
          <button type="button" className="text-left text-white underline" onClick={() => void signOutOfApp()}>
            Sign out
          </button>
        </div>
      </aside>
      <div className="min-w-0">
        <div className="sticky top-0 z-20 flex gap-2 overflow-x-auto border-b border-[#004B93]/10 bg-[#1A2340] px-3 py-2 md:hidden">
          {LINKS.filter((link) => !link.admin || admin).map((link) => (
            <Link key={link.href} href={link.href} className="shrink-0 rounded-full bg-white/10 px-3 py-1 text-sm text-white">
              {link.label}
            </Link>
          ))}
          <Link href="/admin/dashboard" className="shrink-0 rounded-full bg-white/10 px-3 py-1 text-sm text-white">
            Admin
          </Link>
          <button type="button" className="shrink-0 rounded-full bg-white/10 px-3 py-1 text-sm text-white" onClick={() => void signOutOfApp()}>
            Sign out
          </button>
        </div>
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
