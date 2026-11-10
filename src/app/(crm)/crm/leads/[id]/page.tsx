"use client";

import { useParams } from "next/navigation";
import { LeadEditor } from "@/components/crm/lead-editor";

export default function LeadPage() {
  const params = useParams<{ id: string }>();
  return <LeadEditor id={params.id} />;
}
