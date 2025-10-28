"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    async function finalizeAuth() {
      try {
        console.log('Auth callback landed — attempting to finalize session');

        // Some versions of the Supabase JS client expose a helper to parse the URL
        // after an OAuth redirect (getSessionFromUrl). It may not exist on all
        // SDK versions, so call it dynamically and fall back to checking the
        // session directly.
        try {
          const maybeFn = (supabase.auth as any).getSessionFromUrl;
          if (typeof maybeFn === 'function') {
            console.log('Calling supabase.auth.getSessionFromUrl()');
            const { data, error } = await maybeFn({ storeSession: true });
            console.log('getSessionFromUrl result:', { data, error });
            if (error) {
              console.error('Error processing auth callback:', error);
              router.replace('/login');
              return;
            }
            router.replace('/');
            return;
          }
        } catch (err) {
          console.warn('getSessionFromUrl not available or failed:', err);
        }

        // Fallback: check if a session is already available after redirect
        try {
          const { data: { session }, error: sessionErr } = await supabase.auth.getSession();
          console.log('Fallback getSession result:', { session, sessionErr });
          if (session) {
            router.replace('/');
            return;
          }
          // If no session, still redirect to login to allow user to retry
          router.replace('/login');
          return;
        } catch (err) {
          console.error('Fallback session check failed:', err);
          router.replace('/login');
          return;
        }
      } catch (err) {
        console.error('Unexpected error handling auth callback:', err);
        router.replace('/');
      }
    }

    finalizeAuth();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-lg font-medium">Signing you in…</h2>
        <p className="mt-2 text-sm text-muted-foreground">Completing authentication with the provider.</p>
      </div>
    </div>
  );
}
