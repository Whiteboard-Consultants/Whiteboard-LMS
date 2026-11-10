import type { Metadata } from "next";
import { EnquireForm } from "@/components/crm/enquire-form";

export const metadata: Metadata = {
  title: "Enquire",
  description: "Send an enquiry to Whiteboard Consultants.",
};

export default function EnquirePage() {
  return <EnquireForm />;
}
