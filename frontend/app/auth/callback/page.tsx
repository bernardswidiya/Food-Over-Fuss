"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Backend sudah set HttpOnly Cookie — kita hanya perlu baca query params
    const hasPreferences = searchParams.get("has_preferences") === "true";
    const role = searchParams.get("role") || "user";
    const error = searchParams.get("error");

    if (error) {
      router.push(`/login?error=${encodeURIComponent(error)}`);
      return;
    }

    // Smart routing berdasarkan role
    if (role === "admin") {
      router.push("/admin/dashboard");
    } else if (hasPreferences) {
      router.push("/dashboard");
    } else {
      router.push("/onboarding");
    }
  }, [router, searchParams]);

  return <AuthCallbackLoading />;
}

function AuthCallbackLoading() {
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

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<AuthCallbackLoading />}>
      <AuthCallbackContent />
    </Suspense>
  );
}
