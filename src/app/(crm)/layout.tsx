import type { ReactNode } from "react";
import { Lato, Montserrat } from "next/font/google";
import { CrmProviders } from "@/components/crm/providers";

const lato = Lato({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-lato",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-montserrat",
  display: "swap",
});

export default function CrmGroupLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${lato.variable} ${montserrat.variable} crm-app min-h-screen`}>
      <CrmProviders>{children}</CrmProviders>
    </div>
  );
}
