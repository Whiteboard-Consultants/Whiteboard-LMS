
'use client';

import Link from "next/link";
import Image from "next/image";
import { MainNav } from "@/components/main-nav";
import { UserActions } from "./user-actions";
import { Sidebar, SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Separator } from "./ui/separator";

function MobileSidebar() {
    return (
        <div className="flex items-center gap-2 lg:hidden [&_button]:bg-transparent [&_button]:text-primary-foreground [&_button:hover]:bg-primary-foreground/10 [&_button:hover]:text-primary-foreground [&_button]:dark:border-white">
            <Sidebar>
                <SheetHeader>
                    <SheetTitle className="sr-only">Main Menu</SheetTitle>
                    <SheetDescription className="sr-only">The main navigation menu for the application.</SheetDescription>
                    <div className="flex h-14 items-center border-b -mt-2 -mx-6 px-4 lg:h-[60px] lg:px-6 bg-primary text-primary-foreground border-primary-foreground/10 dark:bg-black">
                        <Link href="/" className="flex items-center gap-2 font-semibold shrink-0">
                            <Image src="/logo.png" alt="Whiteboard Consultants Logo" width={180} height={40} className="h-auto w-auto" />
                        </Link>
                    </div>
                </SheetHeader>
                <div className="flex flex-1 flex-col justify-between py-4">
                    <div className="px-2 space-y-4">
                        <MainNav isMobileLayout={true} />
                        <Separator className="bg-border h-[2px]" />
                        <UserActions />
                    </div>
                </div>
            </Sidebar>
        </div>
    );
}

export function PublicHeader() {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-primary text-primary-foreground dark:bg-black dark:border-primary-foreground/20">
            <SidebarProvider>
                <div className="container flex h-[60px] items-center">
                    <Link href="/" className="mr-6 flex items-center space-x-2">
                        <Image src="/logo.png" alt="Whiteboard Consultants Logo" width={120} height={40} className="h-auto w-auto" priority />
                    </Link>
                    <div className="hidden lg:flex flex-1 items-center justify-center relative">
                        <MainNav />
                    </div>
                    <div className="flex flex-1 items-center justify-end space-x-4 lg:flex-none">
                        <div className="hidden lg:block">
                            <UserActions />
                        </div>
                        <MobileSidebar />
                    </div>
                </div>
            </SidebarProvider>
        </header>
    )
}
