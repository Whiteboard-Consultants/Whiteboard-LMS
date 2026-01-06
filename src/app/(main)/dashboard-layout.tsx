
'use client';

import { UserNav } from "@/components/user-nav";
import { Sidebar, SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import Link from "next/link";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { SearchInput } from "@/components/search-input";
import { useAuth } from "@/hooks/use-auth";
import { CartNav } from "@/components/cart-nav";
import { SidebarNav } from "@/components/sidebar-nav";

function MobileSidebar() {
    const { isMounted, isMobile } = useSidebar();

    if (!isMounted || !isMobile) {
        return null;
    }

    return (
        <div className="flex items-center gap-2 lg:hidden [&_button]:bg-transparent [&_button]:text-primary-foreground [&_button]:border-primary-foreground/50 [&_button:hover]:bg-primary-foreground/20">
            <Sidebar>
                <SheetHeader>
                    <SheetTitle className="sr-only">Main Menu</SheetTitle>
                    <SheetDescription className="sr-only">The main navigation menu for the application.</SheetDescription>
                    <div className="flex items-center justify-start border-b -mt-2 -mx-6 px-4 lg:px-6 bg-primary text-primary-foreground border-primary-foreground/10 dark:bg-black h-[120px] py-2">
                        <Link href="/" className="flex items-center gap-2 font-semibold shrink-0">
                            <Image src="/Whitedge-Logo.png" alt="Whiteboard Consultants Logo" width={80} height={80} priority />
                        </Link>
                    </div>
                </SheetHeader>
                <div className="flex flex-1 flex-col justify-between py-4">
                    <div className="px-2 space-y-4">
                        <SidebarNav />
                        <Separator className="bg-border h-[2px]" />
                        <UserNav />
                    </div>
                </div>
            </Sidebar>
        </div>
    );
}


export function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userData } = useAuth();
  
  return (
    <SidebarProvider>
      <div className="relative">
        <div className="hidden border-r border-primary/10 bg-gradient-to-b from-primary to-primary/95 text-primary-foreground lg:flex lg:flex-col lg:fixed lg:left-0 lg:top-0 lg:h-full lg:w-[220px] xl:w-[280px] z-40 dark:from-black dark:to-black dark:border-primary/20 shadow-lg">
            <div className="flex items-center justify-start border-b border-primary-foreground/10 px-4 lg:px-6 h-[120px] py-2">
                <Link href="/" className="flex items-center gap-2 font-semibold shrink-0">
                  <Image src="/Whitedge-Logo.png" alt="Whiteboard Consultants Logo" width={80} height={80} priority />
                </Link>
            </div>
            <div className="flex-1 py-2 overflow-y-auto">
              <SidebarNav />
            </div>
        </div>

        <div className="lg:ml-[220px] xl:ml-[280px] flex flex-col flex-1 min-h-screen">
            <header className="sticky top-0 z-30 flex h-[60px] items-center gap-4 border-b border-primary/20 bg-gradient-to-r from-primary to-primary/80 px-4 sm:px-6 dark:from-black dark:to-black shadow-sm">
              <MobileSidebar />
              <div className="w-full flex-1">
                  <SearchInput />
              </div>
              <div className="flex items-center gap-4">
                 {userData?.role === 'student' && <CartNav />}
                 <div className="hidden lg:flex items-center gap-2">
                    <UserNav />
                 </div>
              </div>
            </header>
            <main className="flex-1 bg-gradient-to-b from-background via-background to-background/95 text-foreground dark:from-black dark:via-black dark:to-black">
                <div className="p-4 sm:p-6 lg:p-8">{children}</div>
            </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
