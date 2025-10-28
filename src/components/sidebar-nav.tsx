
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { BookMarked, LayoutDashboard, BarChart3, Users, Lightbulb, UserCheck, UserSquare, Megaphone, Award, FileText, Ticket, Rss, Package, ClipboardList, Mail } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";

const adminManagementLinks = [
    { href: "/admin/coupons", label: "Coupons", icon: Ticket },
    { href: "/admin/courses", label: "Courses", icon: BookMarked },
    { href: "/admin/blog", label: "Blog", icon: Rss },
    { href: "/instructor/tests", label: "Tests", icon: FileText },
    { href: "/admin/users", label: "Users", icon: Users },
];

const adminRequestLinks = [
    { href: "/admin/enrollments", label: "Enrollments", icon: UserCheck },
    { href: "/admin/certificates", label: "Certificates", icon: Award },
    { href: "/admin/contact-submissions", label: "Contact Forms", icon: Mail },
];

const adminReportLinks = [
    { href: "/admin/reports", label: "General", icon: BarChart3 },
    { href: "/admin/reports/instructors", label: "Instructors", icon: UserSquare },
    { href: "/admin/reports/tests", label: "Tests", icon: BarChart3 },
];

export function SidebarNav() {
  const { userData, loading } = useAuth();
  const pathname = usePathname();
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

  const renderAdminNav = () => (
     <div className="px-2 text-sm font-medium lg:px-4 space-y-1">
        <Link
            href="/admin/dashboard"
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
         <Link
            href="/admin/announcements"
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
        <Accordion type="multiple" className="w-full">
            <AccordionItem value="management" className="border-none">
                <AccordionTrigger className="px-3 py-2 rounded-lg text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground hover:no-underline [&[data-state=open]]:bg-primary-foreground/10">
                   <div className="flex items-center gap-3">
                     <Package className="h-5 w-5" />
                     Management
                   </div>
                </AccordionTrigger>
                <AccordionContent className="pl-8 pt-1 space-y-1">
                     {adminManagementLinks.map(link => {
                         const isActive = pathname.startsWith(link.href);
                         return (
                            <Link key={link.href} href={link.href} className={cn("flex items-center gap-3 rounded-md px-3 py-2 text-primary-foreground/70 transition-all hover:text-primary-foreground", isActive && "bg-primary-foreground/10 text-primary-foreground")}>
                                <link.icon className="h-4 w-4" />
                                {link.label}
                            </Link>
                         )
                     })}
                </AccordionContent>
            </AccordionItem>
             <AccordionItem value="requests" className="border-none">
                <AccordionTrigger className="px-3 py-2 rounded-lg text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground hover:no-underline [&[data-state=open]]:bg-primary-foreground/10">
                   <div className="flex items-center gap-3">
                     <ClipboardList className="h-5 w-5" />
                     Requests
                   </div>
                </AccordionTrigger>
                <AccordionContent className="pl-8 pt-1 space-y-1">
                     {adminRequestLinks.map(link => {
                          const isActive = pathname.startsWith(link.href);
                         return (
                            <Link key={link.href} href={link.href} className={cn("flex items-center gap-3 rounded-md px-3 py-2 text-primary-foreground/70 transition-all hover:text-primary-foreground", isActive && "bg-primary-foreground/10 text-primary-foreground")}>
                                <link.icon className="h-4 w-4" />
                                {link.label}
                            </Link>
                         )
                     })}
                </AccordionContent>
            </AccordionItem>
             <AccordionItem value="reports" className="border-none">
                <AccordionTrigger className="px-3 py-2 rounded-lg text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground hover:no-underline [&[data-state=open]]:bg-primary-foreground/10">
                   <div className="flex items-center gap-3">
                     <BarChart3 className="h-5 w-5" />
                     Reports
                   </div>
                </AccordionTrigger>
                <AccordionContent className="pl-8 pt-1 space-y-1">
                     {adminReportLinks.map(link => {
                          const isActive = pathname.startsWith(link.href);
                         return (
                            <Link key={link.href} href={link.href} className={cn("flex items-center gap-3 rounded-md px-3 py-2 text-primary-foreground/70 transition-all hover:text-primary-foreground", isActive && "bg-primary-foreground/10 text-primary-foreground")}>
                                <link.icon className="h-4 w-4" />
                                {link.label}
                            </Link>
                         )
                     })}
                </AccordionContent>
            </AccordionItem>
        </Accordion>
     </div>
  );

  const getNavLinks = () => {
    const allLinks = {
      instructor: [
          { href: "/instructor/dashboard", label: "Dashboard", icon: LayoutDashboard },
          { href: "/instructor/announcements", label: "Announcements", icon: Megaphone },
          { href: "/instructor/courses", label: "Courses & Reports", icon: BookMarked },
          { href: "/instructor/tests", label: "Tests", icon: FileText },
          { href: "/instructor/reports/tests", label: "Test Reports", icon: BarChart3 },
          { href: "/instructor/ai-suggester", label: "AI Suggester", icon: Lightbulb },
        ],
      student: [
          { href: "/student/dashboard", label: "My Dashboard", icon: LayoutDashboard },
          { href: "/student/tests", label: "Tests", icon: FileText },
          { href: "/student/certificates", label: "My Certificates", icon: Award },
      ],
    };
    
    return role && role !== 'admin' ? allLinks[role] : [];
  };

  const links = getNavLinks();
  
  if (role === 'admin') {
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
