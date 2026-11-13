"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut as signOutCrm, useSession } from "next-auth/react";
import { useEffect, useState, type ReactNode } from "react";
import {
  ArrowLeft,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Settings,
  Upload,
  Users,
  type LucideIcon,
} from "lucide-react";
import { LoadingBlock } from "@/components/crm/bits";
import { useLmsBridge } from "@/components/crm/use-lms-bridge";
import { signOut as signOutAdmin } from "@/lib/supabase-auth";

const SIDEBAR_KEY = "crm-sidebar-collapsed";

const LINKS: { href: string; label: string; icon: LucideIcon; admin?: boolean }[] = [
  { href: "/crm/today", label: "Today", icon: CalendarDays },
  { href: "/crm/leads", label: "Leads", icon: Users },
  { href: "/crm/activity", label: "Activity", icon: ClipboardList },
  { href: "/crm/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/crm/import", label: "Import", icon: Upload },
  { href: "/crm/settings", label: "Settings", icon: Settings, admin: true },
];

export function CrmShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const bridge = useLmsBridge();
  const [leaving, setLeaving] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setCollapsed(window.localStorage.getItem(SIDEBAR_KEY) === "1");
  }, []);

  function toggleSidebar() {
    setCollapsed((current) => {
      const next = !current;
      window.localStorage.setItem(SIDEBAR_KEY, next ? "1" : "0");
      return next;
    });
  }

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

  const links = LINKS.filter((link) => !link.admin || admin);

  return (
    <div className={`min-h-screen md:grid ${collapsed ? "md:grid-cols-[4.25rem_minmax(0,1fr)]" : "md:grid-cols-[15rem_minmax(0,1fr)]"}`}>
      <aside className="hidden bg-[#1A2340] text-white md:sticky md:top-0 md:flex md:h-screen md:flex-col">
        <div className={`flex items-center ${collapsed ? "justify-center px-2 py-4" : "justify-between px-4 py-5"}`}>
          {collapsed ? null : (
            <div>
              <p className="text-xs uppercase tracking-wider text-white/70">Whiteboard</p>
              <h1 className="text-xl font-semibold">CRM</h1>
            </div>
          )}
          <button
            type="button"
            onClick={toggleSidebar}
            aria-expanded={!collapsed}
            aria-label={collapsed ? "Show the sidebar" : "Collapse the sidebar"}
            title={collapsed ? "Show the sidebar" : "Collapse the sidebar"}
            className="rounded-md p-2 text-white/80 hover:bg-white/10"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>
        <nav className={`flex flex-1 flex-col gap-1 ${collapsed ? "px-2" : "px-3"}`} aria-label="CRM">
          {links.map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                title={link.label}
                className={`flex items-center gap-2 rounded-md py-2 text-sm font-medium ${collapsed ? "justify-center px-2" : "px-3"} ${active ? "bg-white text-[#004B93]" : "text-white/90 hover:bg-white/10"}`}
                aria-current={active ? "page" : undefined}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className={collapsed ? "sr-only" : ""}>{link.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className={`space-y-2 py-4 text-sm ${collapsed ? "px-2" : "px-4"}`}>
          {collapsed ? null : <p className="truncate text-white/80">{session.user.name}</p>}
          <Link
            href="/admin/dashboard"
            title="Back to admin"
            className={`flex items-center gap-2 text-white/70 hover:text-white ${collapsed ? "justify-center rounded-md px-2 py-2 hover:bg-white/10" : ""}`}
          >
            <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className={collapsed ? "sr-only" : "underline"}>Back to admin</span>
          </Link>
          <button
            type="button"
            title="Sign out"
            className={`flex items-center gap-2 text-white/90 hover:text-white ${collapsed ? "w-full justify-center rounded-md px-2 py-2 hover:bg-white/10" : ""}`}
            onClick={() => void signOutOfApp()}
          >
            <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className={collapsed ? "sr-only" : "underline"}>Sign out</span>
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
