"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getMe, getPreferences } from "@/lib/api";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    async function handleCallback() {
      // Supabase processes the URL hash (#access_token=...) automatically.
      // We wait for the session to be established before redirecting.
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error || !session) {
        router.push("/login?error=GoogleAuthFailed");
        return;
      }

      try {
        const user = await getMe();

        if (user.role === "admin") {
          router.push("/admin/dashboard");
          return;
        }

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

    // Give supabase-js a tick to process the URL hash before we call getSession
    const timer = setTimeout(handleCallback, 100);
    return () => clearTimeout(timer);
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
