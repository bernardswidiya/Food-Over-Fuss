"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { registerUser, loginWithGoogle } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordStrength = (() => {
    if (password.length === 0) return 0;
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score; // 0–4
  })();

  const strengthLabel = ["", "Lemah", "Lumayan", "Bagus", "Kuat"][passwordStrength];
  const strengthColor = ["", "#ef4444", "#f97316", "#eab308", "#05d66a"][passwordStrength];

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Kata sandi nggak cocok, nih.");
      return;
    }
    if (password.length < 8) {
      setError("Kata sandi minimal 8 karakter, ya.");
      return;
    }

    setLoading(true);
    try {
      await registerUser({ name, email, password });
      // Auto-redirect to login after successful registration
      router.push("/login?registered=true");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Pendaftaran gagal. Coba lagi, yuk.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen w-full overflow-hidden bg-white text-text-main font-body">

      {/* ── LEFT: Visual Panel ── */}
      <section className="hidden lg:flex lg:w-1/2 relative bg-background-dark overflow-hidden sticky top-0 h-screen">
        {/* Background photo */}
        <Image
          src="/auth-preview.png"
          alt="Bahan-bahan segar"
          fill
          className="object-cover object-center"
          priority
          sizes="50vw"
        />
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-background-dark/85 via-background-dark/60 to-background-dark/90" />

        <div className="relative z-10 p-12 flex flex-col justify-between h-full">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 w-fit hover:opacity-80 transition-opacity">
            <Image src="/Logo.png" alt="Food Over Fuss logo" width={40} height={40} className="rounded-full object-contain" />
            <span className="text-white font-heading text-2xl font-extrabold tracking-tighter">
              Food Over Fuss
            </span>
          </Link>

          {/* Hero copy */}
          <div className="max-w-md animate-fade-slide-up">
            <span className="text-primary font-body text-sm uppercase tracking-widest mb-4 block font-bold">
              Mulai Perjalananmu
            </span>
            <h1 className="text-white font-heading text-5xl font-bold leading-tight tracking-tight mb-6">
              Menu sempurnamu dimulai dari{" "}
              <span className="text-primary">sini.</span>
            </h1>
            <p className="text-white/70 text-lg leading-relaxed mb-10">
              Daftar dalam hitungan detik dan biarkan AI kami bikin menu mingguan
              pertamamu—dipersonalisasi sesuai target dan seleramu.
            </p>

            {/* Feature checklist */}
            <ul className="flex flex-col gap-4">
              {[
                "Menu makan mingguan berbasis AI",
                "Daftar belanja pintar otomatis",
                "Tracking makro & kalori",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-primary text-[14px]">check</span>
                  </div>
                  <span className="text-white/80 text-sm font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── RIGHT: Form Panel ── */}
      <section className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 sm:p-12 md:p-24 bg-white relative">

        {/* Mobile logo */}
        <div className="lg:hidden mb-10 flex items-center gap-3">
          <Image src="/Logo.png" alt="Food Over Fuss logo" width={32} height={32} className="rounded-full object-contain" />
          <span className="font-heading text-xl font-extrabold tracking-tighter text-text-main">
            Food Over Fuss
          </span>
        </div>

        <div className="w-full max-w-[440px] flex flex-col gap-7">

          {/* Header */}
          <div className="animate-fade-slide-up auth-form-delay-1 flex flex-col gap-2 text-center lg:text-left">
            <h1 className="text-[32px] sm:text-[40px] font-bold font-heading tracking-tight text-text-main leading-tight">
              Buat akun baru
            </h1>
            <p className="text-muted text-base font-medium">
              Gratis selamanya. Tanpa perlu kartu kredit.
            </p>
          </div>

          {/* Error banner */}
          {error && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 text-sm font-medium px-4 py-3 rounded-xl animate-fade-slide-up">
              <span className="material-symbols-outlined text-[18px] flex-shrink-0">error</span>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="animate-fade-slide-up auth-form-delay-2 flex flex-col gap-4 w-full">

            {/* Full Name */}
            <div className="input-wrapper rounded-xl border border-gray-200 focus-within:border-primary transition-colors">
              <input
                className="floating-input"
                id="name"
                placeholder=" "
                required
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
              <label className="floating-label" htmlFor="name">Nama Lengkap</label>
            </div>

            {/* Email */}
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

            {/* Password */}
            <div>
              <div className="input-wrapper relative rounded-xl border border-gray-200 focus-within:border-primary transition-colors">
                <input
                  className="floating-input pr-12"
                  id="password"
                  placeholder=" "
                  required
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                />
                <label className="floating-label" htmlFor="password">Kata Sandi</label>
                <button
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-text-main transition-colors focus:outline-none"
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <span className="material-symbols-outlined text-[22px]">
                    {showPassword ? "visibility" : "visibility_off"}
                  </span>
                </button>
              </div>

              {/* Password strength bar */}
              {password.length > 0 && (
                <div className="mt-2 px-1">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="h-1 flex-1 rounded-full transition-all duration-300"
                        style={{
                          backgroundColor: i <= passwordStrength ? strengthColor : "#e2e8f0",
                        }}
                      />
                    ))}
                  </div>
                  <p className="text-xs font-medium" style={{ color: strengthColor }}>
                    {strengthLabel}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="input-wrapper relative rounded-xl border border-gray-200 focus-within:border-primary transition-colors">
              <input
                className="floating-input pr-12"
                id="confirmPassword"
                placeholder=" "
                required
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />
              <label className="floating-label" htmlFor="confirmPassword">Konfirmasi Kata Sandi</label>
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-text-main transition-colors focus:outline-none"
                type="button"
                onClick={() => setShowConfirmPassword((v) => !v)}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                <span className="material-symbols-outlined text-[22px]">
                  {showConfirmPassword ? "visibility" : "visibility_off"}
                </span>
              </button>
              {/* Match indicator */}
              {confirmPassword.length > 0 && (
                <span
                  className="material-symbols-outlined absolute right-12 top-1/2 -translate-y-1/2 text-[18px] transition-colors"
                  style={{ color: password === confirmPassword ? "#05d66a" : "#ef4444" }}
                >
                  {password === confirmPassword ? "check_circle" : "cancel"}
                </span>
              )}
            </div>

            {/* Terms */}
            <div className="flex items-start gap-3 mt-1">
              <input
                id="terms"
                type="checkbox"
                required
                className="mt-1 w-4 h-4 accent-primary flex-shrink-0 cursor-pointer"
              />
              <label htmlFor="terms" className="text-sm text-muted font-medium cursor-pointer leading-relaxed">
                Saya setuju dengan{" "}
                <Link href="#" className="text-primary hover:text-primary-hover font-semibold">
                  Syarat & Ketentuan
                </Link>{" "}
                dan{" "}
                <Link href="#" className="text-primary hover:text-primary-hover font-semibold">
                  Kebijakan Privasi
                </Link>
              </label>
            </div>

            {/* Submit */}
            <button
              id="register-submit-btn"
              className="w-full h-14 bg-primary text-white rounded-full font-semibold text-base tracking-wide hover:bg-primary-hover hover:scale-[1.02] active:scale-100 transition-all duration-200 shadow-soft flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Membuat akun…
                </>
              ) : (
                <>
                  Buat Akun
                  <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="animate-fade-slide-up auth-form-delay-3 relative flex items-center py-2">
            <div className="flex-grow border-t border-muted/20" />
            <span className="flex-shrink-0 mx-4 text-sm text-muted font-medium">Atau daftar dengan</span>
            <div className="flex-grow border-t border-muted/20" />
          </div>

          {/* Google OAuth */}
          <div className="animate-fade-slide-up auth-form-delay-4 w-full">
            <button
              id="google-register-btn"
              onClick={loginWithGoogle}
              className="w-full h-14 bg-white border-2 border-gray-100 rounded-full flex items-center justify-center gap-3 hover:bg-surface hover:border-gray-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 hover:shadow-sm"
              type="button"
            >
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              <span className="text-base font-semibold text-text-main">Daftar dengan Google</span>
            </button>
          </div>

          {/* Toggle to Login */}
          <div className="animate-fade-slide-up auth-form-delay-5 text-center pb-8">
            <p className="text-sm text-muted font-medium">
              Sudah punya akun?{" "}
              <Link href="/login" className="text-primary font-bold hover:text-primary-hover transition-colors">
                Masuk
              </Link>
            </p>
          </div>
        </div>

        {/* Footer links */}
        <div className="absolute bottom-8 right-8 hidden lg:flex gap-6 text-xs text-muted font-medium">
          <Link href="#" className="hover:text-primary transition-colors">Kebijakan Privasi</Link>
          <Link href="#" className="hover:text-primary transition-colors">Syarat & Ketentuan</Link>
        </div>
      </section>
    </main>
  );
}
