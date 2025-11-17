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
        let session = null;
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
            session = data?.session;
          }
        } catch (err) {
          console.warn('getSessionFromUrl not available or failed:', err);
        }

        // Fallback: check if a session is already available after redirect
        if (!session) {
          try {
            const { data: { session: fetchedSession }, error: sessionErr } = await supabase.auth.getSession();
            console.log('Fallback getSession result:', { session: fetchedSession, sessionErr });
            if (sessionErr) {
              console.error('Session error:', sessionErr);
              router.replace('/login');
              return;
            }
            session = fetchedSession;
          } catch (err) {
            console.error('Fallback session check failed:', err);
            router.replace('/login');
            return;
          }
        }

        // If we have a session, get the user's role and redirect to appropriate dashboard
        if (session && session.user) {
          console.log('Session found for user:', session.user.email);
          
          try {
            // Fetch user profile from database to get their role
            const { data: userData, error: userError } = await supabase
              .from('users')
              .select('role, status')
              .eq('id', session.user.id)
              .single();

            if (userError) {
              console.error('Error fetching user profile:', userError);
              // If we can't get the profile, default to student dashboard
              router.replace('/student/dashboard');
              return;
            }

            if (!userData) {
              console.warn('No user data found');
              router.replace('/student/dashboard');
              return;
            }

            // Check user status
            if (userData.status === 'pending') {
              // For instructor accounts pending approval
              router.replace('/auth/pending-approval');
              return;
            }

            if (userData.status === 'suspended') {
              router.replace('/auth/account-suspended');
              return;
            }

            // Redirect based on role
            const role = userData.role;
            console.log('User role:', role, '— redirecting to appropriate dashboard');
            
            if (role === 'admin') {
              router.replace('/admin/dashboard');
            } else if (role === 'instructor') {
              router.replace('/instructor/dashboard');
            } else {
              router.replace('/student/dashboard');
            }
            return;
          } catch (err) {
            console.error('Error fetching user data:', err);
            // Default to student dashboard on error
            router.replace('/student/dashboard');
            return;
          }
        }

        // If no session, redirect to login
        console.log('No session found after callback');
        router.replace('/login');
      } catch (err) {
        console.error('Unexpected error handling auth callback:', err);
        router.replace('/login');
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
