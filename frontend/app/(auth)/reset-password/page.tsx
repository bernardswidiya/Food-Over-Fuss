"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, FormEvent, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { resetPassword } from "@/lib/api";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (newPassword.length < 8) { setError("Kata sandi minimal 8 karakter."); return; }
    if (newPassword !== confirmPassword) { setError("Kata sandi dan konfirmasi tidak cocok."); return; }
    if (!token) { setError("Token tidak ditemukan. Pastikan kamu membuka link dari email."); return; }

    setLoading(true);
    try {
      const data = await resetPassword(token, newPassword);
      setSuccess(data.message);
      setTimeout(() => router.push("/login"), 2500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="w-full max-w-110 flex flex-col items-center gap-6 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
          <span className="material-symbols-outlined text-red-500 text-3xl">link_off</span>
        </div>
        <h2 className="text-2xl font-heading font-bold text-text-main">Link Tidak Valid</h2>
        <p className="text-muted text-sm">Token reset tidak ditemukan. Pastikan kamu membuka link yang ada di email.</p>
        <Link href="/forgot-password" className="text-primary font-bold hover:text-primary-hover text-sm transition-colors">
          Minta link baru
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-110 flex flex-col gap-7">
      <div className="animate-fade-slide-up flex flex-col gap-2 text-center lg:text-left">
        <h1 className="text-[32px] sm:text-[40px] font-bold font-heading tracking-tight text-text-main leading-tight">
          Buat Kata Sandi Baru
        </h1>
        <p className="text-muted text-base font-medium">Pilih kata sandi baru yang kuat untuk akunmu.</p>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 text-sm font-medium px-4 py-3 rounded-xl animate-fade-slide-up">
          <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
          {error}
        </div>
      )}
      {success && (
        <div className="flex items-start gap-3 bg-green-50 border border-green-200 text-green-700 text-sm font-medium px-4 py-3 rounded-xl animate-fade-slide-up">
          <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">check_circle</span>
          <span>{success} Mengalihkan ke halaman login...</span>
        </div>
      )}

      {!success && (
        <form onSubmit={handleSubmit} className="animate-fade-slide-up flex flex-col gap-4 w-full">
          <div>
            <div className="input-wrapper relative rounded-xl border border-gray-200 focus-within:border-primary transition-colors">
              <input className="floating-input pr-12" id="new-password" placeholder=" " required
                type={showNew ? "text" : "password"} value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)} autoComplete="new-password" />
              <label className="floating-label" htmlFor="new-password">Kata Sandi Baru</label>
              <button type="button" onClick={() => setShowNew(v => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-text-main transition-colors focus:outline-none">
                <span className="material-symbols-outlined text-[22px]">{showNew ? "visibility" : "visibility_off"}</span>
              </button>
            </div>
            <p className="text-[11px] text-muted mt-1 ml-1">Minimal 8 karakter</p>
          </div>

          <div className="input-wrapper relative rounded-xl border border-gray-200 focus-within:border-primary transition-colors">
            <input className="floating-input pr-12" id="confirm-password" placeholder=" " required
              type={showConfirm ? "text" : "password"} value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" />
            <label className="floating-label" htmlFor="confirm-password">Konfirmasi Kata Sandi</label>
            <button type="button" onClick={() => setShowConfirm(v => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-text-main transition-colors focus:outline-none">
              <span className="material-symbols-outlined text-[22px]">{showConfirm ? "visibility" : "visibility_off"}</span>
            </button>
          </div>

          <button type="submit" disabled={loading}
            className="w-full h-14 bg-primary text-white rounded-full font-semibold text-base tracking-wide hover:bg-primary-hover hover:scale-[1.02] active:scale-100 transition-all duration-200 shadow-soft flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-1">
            {loading ? (
              <><svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>Menyimpan...</>
            ) : (
              <>Simpan Kata Sandi Baru<span className="material-symbols-outlined text-[20px]">lock_reset</span></>
            )}
          </button>
        </form>
      )}

      <div className="text-center">
        <Link href="/login" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-primary transition-colors">
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          Kembali ke halaman Login
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="flex h-screen w-full overflow-hidden bg-white text-text-main font-body">
      <section className="hidden lg:flex lg:w-1/2 relative bg-background-dark overflow-hidden">
        <Image src="/auth-preview.png" alt="Bahan-bahan segar" fill className="object-cover object-center" priority sizes="50vw" />
        <div className="absolute inset-0 bg-linear-to-b from-background-dark/85 via-background-dark/60 to-background-dark/90" />
        <div className="relative z-10 p-12 flex flex-col justify-between h-full">
          <Link href="/" className="flex items-center gap-3 w-fit hover:opacity-80 transition-opacity">
            <Image src="/Logo.png" alt="Food Over Fuss logo" width={40} height={40} className="rounded-full object-contain" />
            <span className="text-white font-heading text-2xl font-extrabold tracking-tighter">Food Over Fuss</span>
          </Link>
          <div className="max-w-md animate-fade-slide-up">
            <span className="text-primary font-body text-sm uppercase tracking-widest mb-4 block font-bold">Keamanan Akun</span>
            <h1 className="text-white font-heading text-5xl font-bold leading-tight tracking-tight mb-6">
              Hampir selesai.<br />Buat kata sandi<br /><span className="text-primary">yang kuat.</span>
            </h1>
          </div>
        </div>
      </section>

      <section className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 sm:p-12 md:p-24 overflow-y-auto bg-white">
        <div className="lg:hidden mb-10 flex items-center gap-3">
          <Image src="/Logo.png" alt="Food Over Fuss logo" width={32} height={32} className="rounded-full object-contain" />
          <span className="font-heading text-xl font-extrabold tracking-tighter text-text-main">Food Over Fuss</span>
        </div>
        <Suspense fallback={<div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />}>
          <ResetPasswordForm />
        </Suspense>
      </section>
    </main>
  );
}
