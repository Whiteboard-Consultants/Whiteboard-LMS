
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { BookMarked, LayoutDashboard, BarChart3, Users, Lightbulb, UserCheck, UserSquare, Megaphone, Award, FileText, Ticket, Rss, Package, ClipboardList, Mail, Zap, DollarSign, MessageSquare, HelpCircle, Folder, Compass, type LucideIcon } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { canAccessPath, hasPermission, type PermissionKey } from "@/lib/permissions";
import type { User } from "@/types";

type NavLink = {
  href: string;
  label: string;
  icon: LucideIcon;
  permission?: PermissionKey | null;
};

const adminManagementLinks: NavLink[] = [
    { href: "/admin/coupons", label: "Coupons", icon: Ticket, permission: 'coupons' },
    { href: "/admin/courses", label: "Courses", icon: BookMarked, permission: 'courses' },
    { href: "/admin/programs", label: "Programs", icon: Folder, permission: 'programs' },
    { href: "/admin/blog", label: "Blog", icon: Rss, permission: 'blog' },
    { href: "/admin/commissions", label: "Commissions", icon: DollarSign, permission: 'commissions' },
    { href: "/instructor/tests", label: "Tests", icon: FileText, permission: 'tests' },
    { href: "/admin/users", label: "Users", icon: Users, permission: null }, // admin only
];

const adminRequestLinks: NavLink[] = [
    { href: "/admin/enrollments", label: "Enrollments", icon: UserCheck, permission: 'enrollments' },
    { href: "/admin/certificates", label: "Certificates", icon: Award, permission: 'certificates' },
    { href: "/admin/contact-submissions", label: "Contact Forms", icon: Mail, permission: 'contact_forms' },
    { href: "/admin/riasec", label: "RIASEC Leads", icon: Compass, permission: 'riasec' },
];

const adminReportLinks: NavLink[] = [
    { href: "/admin/reports", label: "General", icon: BarChart3, permission: 'reports' },
    { href: "/admin/reports/instructors", label: "Instructors", icon: UserSquare, permission: 'reports' },
    { href: "/admin/reports/commission", label: "Commission", icon: DollarSign, permission: 'reports' },
    { href: "/admin/reports/tests", label: "Tests", icon: BarChart3, permission: 'reports' },
];

function canSeeLink(user: User | null | undefined, link: NavLink): boolean {
  if (!user) return false;
  if (user.role === 'admin') return true;
  if (user.role !== 'manager') return false;
  if (link.permission === null) return false;
  if (!link.permission) return canAccessPath(user, link.href);
  return hasPermission(user, link.permission);
}

export function SidebarNav() {
  const { userData, loading } = useAuth();
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
  const role = userData?.role;

  if (loading) {
    return (
      <nav className="grid items-start gap-1 px-2 text-sm font-medium lg:px-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </nav>
    );
  }

  const renderAdminNav = () => {
    const management = adminManagementLinks.filter((link) => canSeeLink(userData, link));
    const requests = adminRequestLinks.filter((link) => canSeeLink(userData, link));
    const reports = adminReportLinks.filter((link) => canSeeLink(userData, link));
    const showDashboard = canSeeLink(userData, {
      href: '/admin/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      permission: 'dashboard',
    });
    const showAnnouncements = canSeeLink(userData, {
      href: '/admin/announcements',
      label: 'Announcements',
      icon: Megaphone,
      permission: 'announcements',
    });

    return (
     <div className="px-2 text-sm font-medium lg:px-4 space-y-1">
        {showDashboard && (
        <Link
            href="/admin/dashboard"
            onClick={() => setOpenMobile(false)}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-primary-foreground/80 transition-all",
              pathname === "/admin/dashboard"
                ? "bg-primary-foreground/20 text-primary-foreground"
                : "hover:bg-primary-foreground/10 hover:text-primary-foreground"
            )}
          >
            <LayoutDashboard className="h-5 w-5" />
            Dashboard
        </Link>
        )}
         {showAnnouncements && (
         <Link
            href="/admin/announcements"
            onClick={() => setOpenMobile(false)}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-primary-foreground/80 transition-all",
              pathname === "/admin/announcements"
                ? "bg-primary-foreground/20 text-primary-foreground"
                : "hover:bg-primary-foreground/10 hover:text-primary-foreground"
            )}
          >
            <Megaphone className="h-5 w-5" />
            Announcements
        </Link>
         )}
        <Accordion type="multiple" className="w-full" defaultValue={['management', 'requests', 'reports']}>
            {management.length > 0 && (
            <AccordionItem value="management" className="border-none">
                <AccordionTrigger className="px-3 py-2 rounded-lg text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground hover:no-underline [&[data-state=open]]:bg-primary-foreground/10">
                   <div className="flex items-center gap-3">
                     <Package className="h-5 w-5" />
                     Management
                   </div>
                </AccordionTrigger>
                <AccordionContent className="pl-8 pt-1 space-y-1">
                     {management.map(link => {
                         const isActive = pathname.startsWith(link.href);
                         return (
                            <Link key={link.href} href={link.href} onClick={() => setOpenMobile(false)} className={cn("flex items-center gap-3 rounded-md px-3 py-2 text-primary-foreground/70 transition-all hover:text-primary-foreground", isActive && "bg-primary-foreground/10 text-primary-foreground")}>
                                <link.icon className="h-4 w-4" />
                                {link.label}
                            </Link>
                         )
                     })}
                </AccordionContent>
            </AccordionItem>
            )}
             {requests.length > 0 && (
             <AccordionItem value="requests" className="border-none">
                <AccordionTrigger className="px-3 py-2 rounded-lg text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground hover:no-underline [&[data-state=open]]:bg-primary-foreground/10">
                   <div className="flex items-center gap-3">
                     <ClipboardList className="h-5 w-5" />
                     Requests
                   </div>
                </AccordionTrigger>
                <AccordionContent className="pl-8 pt-1 space-y-1">
                     {requests.map(link => {
                          const isActive = pathname.startsWith(link.href);
                         return (
                            <Link key={link.href} href={link.href} onClick={() => setOpenMobile(false)} className={cn("flex items-center gap-3 rounded-md px-3 py-2 text-primary-foreground/70 transition-all hover:text-primary-foreground", isActive && "bg-primary-foreground/10 text-primary-foreground")}>
                                <link.icon className="h-4 w-4" />
                                {link.label}
                            </Link>
                         )
                     })}
                </AccordionContent>
            </AccordionItem>
             )}
             {reports.length > 0 && (
             <AccordionItem value="reports" className="border-none">
                <AccordionTrigger className="px-3 py-2 rounded-lg text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground hover:no-underline [&[data-state=open]]:bg-primary-foreground/10">
                   <div className="flex items-center gap-3">
                     <BarChart3 className="h-5 w-5" />
                     Reports
                   </div>
                </AccordionTrigger>
                <AccordionContent className="pl-8 pt-1 space-y-1">
                     {reports.map(link => {
                          const isActive = pathname.startsWith(link.href);
                         return (
                            <Link key={link.href} href={link.href} onClick={() => setOpenMobile(false)} className={cn("flex items-center gap-3 rounded-md px-3 py-2 text-primary-foreground/70 transition-all hover:text-primary-foreground", isActive && "bg-primary-foreground/10 text-primary-foreground")}>
                                <link.icon className="h-4 w-4" />
                                {link.label}
                            </Link>
                         )
                     })}
                </AccordionContent>
            </AccordionItem>
             )}
        </Accordion>
     </div>
  );
  };

  const getNavLinks = () => {
    const allLinks = {
      instructor: [
          { href: "/instructor/dashboard", label: "Dashboard", icon: LayoutDashboard },
          { href: "/instructor/grading", label: "Grading", icon: ClipboardList },
          { href: "/instructor/announcements", label: "Announcements", icon: Megaphone },
          { href: "/instructor/messages", label: "Messages", icon: MessageSquare },
          { href: "/instructor/courses", label: "Courses & Reports", icon: BookMarked },
          { href: "/instructor/tests", label: "Tests", icon: FileText },
          { href: "/instructor/reports/tests", label: "Test Reports", icon: BarChart3 },
          { href: "/instructor/ai-suggester", label: "AI Suggester", icon: Lightbulb },
          { href: "/instructor/help", label: "Help & Documentation", icon: HelpCircle },
        ],
      student: [
          { href: "/student/dashboard", label: "My Dashboard", icon: LayoutDashboard },
          { href: "/student/notifications", label: "Notifications", icon: Mail },
          { href: "/student/messages", label: "Messages", icon: MessageSquare },
          { href: "/student/skills", label: "My Skills", icon: Zap },
          { href: "/student/tests", label: "Tests", icon: FileText },
          { href: "/student/certificates", label: "My Certificates", icon: Award },
          { href: "/student/help", label: "Help & Documentation", icon: HelpCircle },
      ],
    };
    
    return role && role !== 'admin' && role !== 'manager' ? allLinks[role as 'instructor' | 'student'] : [];
  };

  const links = getNavLinks();
  
  if (role === 'admin' || role === 'manager') {
      return renderAdminNav();
  }

  return (
    <nav className="grid items-start gap-1 px-2 text-sm font-medium lg:px-4">
      {links.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setOpenMobile(false)}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-primary-foreground/80 transition-all",
              isActive
                ? "bg-primary-foreground/20 text-primary-foreground"
                : "hover:bg-primary-foreground/10 hover:text-primary-foreground"
            )}
          >
            <link.icon className="h-5 w-5" />
            {link.label}
          </Link>
        )
      })}
    </nav>
  );
}
