
"use client";

import { useSidebar } from "./ui/sidebar";
import { Skeleton } from "./ui/skeleton";
import { UserNav } from "./user-nav";
import { useAuth } from "@/hooks/use-auth";

export function UserActions() {
  const { isMounted } = useSidebar();
  const { isClient } = useAuth();

  // Server renders false for isMounted and isClient to prevent hydration mismatch
  // CSS media queries and CSS display properties handle visibility on client
  // This component is hidden on mobile via CSS (hidden lg:block), not JS
  if (!isClient || !isMounted) {
    // Return same height placeholder during SSR to prevent layout shift
    return <div className="h-10 w-[152px]" />;
  }
  
  return <UserNav />;
}
