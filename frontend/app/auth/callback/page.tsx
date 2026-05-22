"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getMe, getPreferences } from "@/lib/api";

export default function AuthCallbackPage() {
  const router = useRouter();
  const handled = useRef(false);

  useEffect(() => {
    async function handleSession() {
      if (handled.current) return;
      handled.current = true;

      try {
        const user = await getMe();
        if (user.role === "admin") { router.push("/admin/dashboard"); return; }
        try {
          await getPreferences();
          router.push("/dashboard");
        } catch {
          router.push("/onboarding");
        }
      } catch {
        router.push("/login?error=GoogleAuthFailed");
      }
    }

    // Listen for SIGNED_IN event from Supabase (fired after hash is processed)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        handleSession();
      }
    });

    // Also check if session already exists (user refreshed the callback page)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) handleSession();
    });

    // Fallback: redirect to login if nothing happens within 10s
    const timeout = setTimeout(() => {
      if (!handled.current) router.push("/login?error=GoogleAuthFailed");
    }, 10000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-light">
      <div className="flex flex-col items-center gap-4">
        <svg className="animate-spin w-10 h-10 text-primary" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
        <p className="text-muted font-medium font-body animate-pulse">Menghubungkan ke Google...</p>
      </div>
    </div>
  );
}
