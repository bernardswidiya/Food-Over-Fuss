"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, FormEvent } from "react";
import { forgotPassword } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const data = await forgotPassword(email);
      setSuccess(data.message);
      setEmail("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex h-screen w-full overflow-hidden bg-white text-text-main font-body">

      {/* ── LEFT: Visual Panel ── */}
      <section className="hidden lg:flex lg:w-1/2 relative bg-background-dark overflow-hidden">
        <Image
          src="/auth-preview.png"
          alt="Bahan-bahan segar"
          fill
          className="object-cover object-center"
          priority
          sizes="50vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background-dark/85 via-background-dark/60 to-background-dark/90" />
        <div className="relative z-10 p-12 flex flex-col justify-between h-full">
          <Link href="/" className="flex items-center gap-3 w-fit hover:opacity-80 transition-opacity">
            <Image src="/Logo.png" alt="Food Over Fuss logo" width={40} height={40} className="rounded-full object-contain" />
            <span className="text-white font-heading text-2xl font-extrabold tracking-tighter">Food Over Fuss</span>
          </Link>
          <div className="max-w-md animate-fade-slide-up">
            <span className="text-primary font-body text-sm uppercase tracking-widest mb-4 block font-bold">Keamanan Akun</span>
            <h1 className="text-white font-heading text-5xl font-bold leading-tight tracking-tight mb-6">
              Jangan khawatir,<br />kami bantu kamu<br />
              <span className="text-primary">masuk kembali.</span>
            </h1>
            <p className="text-white/70 text-lg leading-relaxed">
              Cukup masukkan email terdaftar dan kami akan kirimkan link untuk membuat kata sandi baru.
            </p>
          </div>
        </div>
      </section>

      {/* ── RIGHT: Form Panel ── */}
      <section className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 sm:p-12 md:p-24 overflow-y-auto bg-white relative">

        {/* Mobile logo */}
        <div className="lg:hidden mb-10 flex items-center gap-3">
          <Image src="/Logo.png" alt="Food Over Fuss logo" width={32} height={32} className="rounded-full object-contain" />
          <span className="font-heading text-xl font-extrabold tracking-tighter text-text-main">Food Over Fuss</span>
        </div>

        <div className="w-full max-w-[440px] flex flex-col gap-7">

          {/* Header */}
          <div className="animate-fade-slide-up flex flex-col gap-2 text-center lg:text-left">
            <h1 className="text-[32px] sm:text-[40px] font-bold font-heading tracking-tight text-text-main leading-tight">
              Lupa Kata Sandi?
            </h1>
            <p className="text-muted text-base font-medium">
              Masukkan alamat email kamu dan kami akan mengirimkan link reset.
            </p>
          </div>

          {/* Error banner */}
          {error && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 text-sm font-medium px-4 py-3 rounded-xl animate-fade-slide-up">
              <span className="material-symbols-outlined text-[18px] flex-shrink-0">error</span>
              {error}
            </div>
          )}

          {/* Success banner */}
          {success && (
            <div className="flex items-start gap-3 bg-green-50 border border-green-200 text-green-700 text-sm font-medium px-4 py-3 rounded-xl animate-fade-slide-up">
              <span className="material-symbols-outlined text-[18px] flex-shrink-0 mt-0.5">check_circle</span>
              <span>{success} Cek inbox (dan folder spam) kamu.</span>
            </div>
          )}

          {/* Form */}
          {!success && (
            <form onSubmit={handleSubmit} className="animate-fade-slide-up flex flex-col gap-4 w-full">
              <div className="input-wrapper rounded-xl border border-gray-200 focus-within:border-primary transition-colors">
                <input
                  className="floating-input"
                  id="email"
                  placeholder=" "
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
                <label className="floating-label" htmlFor="email">Alamat Email</label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-14 bg-primary text-white rounded-full font-semibold text-base tracking-wide hover:bg-primary-hover hover:scale-[1.02] active:scale-100 transition-all duration-200 shadow-soft flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-1"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Mengirim...
                  </>
                ) : (
                  <>
                    Kirim Link Reset
                    <span className="material-symbols-outlined text-[20px]">send</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Back to login */}
          <div className="text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              Kembali ke halaman Login
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
