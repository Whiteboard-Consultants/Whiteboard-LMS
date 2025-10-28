"use client";

import Link from "next/link";
import React from "react";
import { useAuth } from "@/hooks/use-auth";
import { NavigationMenuItem, NavigationMenuLink } from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";

/**
 * AuthNav: client-only small navigation block that renders links
 * which depend on the authenticated user. Kept intentionally tiny
 * so MainNav can be fully server-rendered for public links.
 */
export function AuthNav() {
  const { user, userData, isClient } = useAuth();

  // Don't render on server or before client auth has been initialized
  if (!isClient) return null;

  if (!user) return null;

  const role = userData?.role || "student";

  return (
    <NavigationMenuItem>
      <NavigationMenuLink asChild>
        <Link
          href={`/${role}/dashboard`}
          className={cn(navigationMenuTriggerStyle(), "bg-transparent hover:bg-primary-foreground/10 text-primary-foreground hover:text-primary-foreground focus:text-primary-foreground")}
        >
          My Dashboard
        </Link>
      </NavigationMenuLink>
    </NavigationMenuItem>
  );
}

export default AuthNav;
