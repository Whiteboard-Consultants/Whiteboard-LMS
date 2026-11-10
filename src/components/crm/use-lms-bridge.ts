"use client";

import { signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";

export type BridgeState = "waiting" | "working" | "signed-in" | "not-staff" | "failed";

export function useLmsBridge() {
  const { userData, accessToken, loading } = useAuth();
  const [state, setState] = useState<BridgeState>("waiting");
  const [message, setMessage] = useState("");
  const lmsStaff = userData?.role === "admin" || userData?.role === "manager";

  useEffect(() => {
    if (loading) return;
    if (!lmsStaff || !accessToken) {
      setState("not-staff");
      return;
    }

    let cancelled = false;
    setState("working");
    setMessage("");

    fetch("/api/crm/bridge", {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then(async (response) => {
        const data = (await response.json().catch(() => ({}))) as { bridgeToken?: string; error?: string };
        if (!response.ok || !data.bridgeToken) {
          throw new Error(data.error || "The CRM could not use your admin login.");
        }
        const result = await signIn("credentials", { bridgeToken: data.bridgeToken, redirect: false });
        if (result?.error) throw new Error("The CRM could not use your admin login.");
        if (!cancelled) setState("signed-in");
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setMessage(error instanceof Error ? error.message : "The CRM could not use your admin login.");
        setState("failed");
      });

    return () => {
      cancelled = true;
    };
  }, [loading, lmsStaff, accessToken]);

  return { state: loading ? "waiting" : state, message, lmsStaff };
}
