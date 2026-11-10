import type { Metadata } from "next";
import type { ReactNode } from "react";
import { CrmShell } from "@/components/crm/shell";

export const metadata: Metadata = {
  title: "CRM",
  robots: { index: false, follow: false },
};

export default function CrmLayout({ children }: { children: ReactNode }) {
  return <CrmShell>{children}</CrmShell>;
}
