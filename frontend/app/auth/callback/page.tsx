"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const accessToken = searchParams.get("access_token");
    const hasPreferences = searchParams.get("has_preferences") === "true";

    if (accessToken) {
      // Simpan di localStorage
      localStorage.setItem("access_token", accessToken);
      // Simpan di cookie agar terbaca oleh middleware
      document.cookie = `access_token=${accessToken}; path=/; max-age=604800; samesite=lax`;

      // Redirect cerdas
      if (hasPreferences) {
        router.push("/dashboard");
      } else {
        router.push("/onboarding");
      }
    } else {
      // Jika token tidak ada, berarti ada error saat login
      router.push("/login?error=GoogleAuthFailed");
    }
  }, [router, searchParams]);

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
