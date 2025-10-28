
"use client";

import { AuthProvider as SupabaseAuthProvider } from "@/hooks/use-auth";

export function AuthProvider({ children }: { children: React.ReactNode }) {
    return <SupabaseAuthProvider>{children}</SupabaseAuthProvider>;
}
