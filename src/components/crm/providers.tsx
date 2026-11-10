"use client";

import type { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";

export function CrmProviders({ children }: { children: ReactNode }) {
  return <SessionProvider basePath="/api/crm-auth">{children}</SessionProvider>;
}
