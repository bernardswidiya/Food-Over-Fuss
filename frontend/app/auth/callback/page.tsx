"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export default function AuthCallbackPage() {
  const router = useRouter();
  const handled = useRef(false);

  useEffect(() => {
    async function handleSession(accessToken: string) {
      if (handled.current) return;
      handled.current = true;

      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/google-session`, {
          method: "POST",
          credentials: "include",
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!res.ok) {
          router.push("/login?error=GoogleAuthFailed");
          return;
        }

        const data = await res.json();
        if (data.role === "admin") {
          router.push("/admin/dashboard");
        } else if (data.has_preferences) {
          router.push("/dashboard");
        } else {
          router.push("/onboarding");
        }
      } catch {
        router.push("/login?error=GoogleAuthFailed");
      }
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session?.access_token) {
        handleSession(session.access_token);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.access_token) handleSession(session.access_token);
    });

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
