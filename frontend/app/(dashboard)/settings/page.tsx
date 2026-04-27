"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function SettingsPage() {
  const [isDirty, setIsDirty] = useState(false); // State untuk mendeteksi perubahan

  // State Informasi Pribadi
  const [firstName, setFirstName] = useState("Bernards");
  const [lastName, setLastName] = useState("Widiya");
  const [email, setEmail] = useState("bernards@example.com");

  // State Preferensi AI (Dari Onboarding)
  const [goal, setGoal] = useState("maintain");
  const [budget, setBudget] = useState(300000);
  const [selectedDiets, setSelectedDiets] = useState<string[]>(["dairy_free"]);

  // State Preferensi Aplikasi (Toggles)
  const [notifReminders, setNotifReminders] = useState(true);
  const [emailList, setEmailList] = useState(false);

  // Pantau perubahan untuk memunculkan tombol Save
  useEffect(() => {
    const timer = setTimeout(() => setIsDirty(true), 0);
    return () => clearTimeout(timer);
  }, [firstName, lastName, email, goal, budget, selectedDiets, notifReminders, emailList]);

  // Simulasi Reset 'isDirty' saat komponen pertama dimuat agar bar tidak langsung muncul
  useEffect(() => {
    const timer = setTimeout(() => setIsDirty(false), 0);
    return () => clearTimeout(timer);
  }, []);

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(angka);
  };

  const toggleDiet = (id: string) => {
    setSelectedDiets(prev => prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]);
  };

  const handleSave = () => {
    setIsDirty(false);
    alert("Perubahan berhasil disimpan ke database!");
  };

  const handleDiscard = () => {
    setIsDirty(false);
    // Logika reset ke data awal bisa ditaruh di sini
  };

  return (
    <>
        {/* AREA FORM SETTINGS */}
        <div className="flex-1 overflow-y-auto px-6 lg:px-10 py-8 pb-32">
          <div className="max-w-4xl mx-auto flex flex-col gap-12">
            
            {/* BAGIAN 1: INFORMASI PRIBADI */}
            <section className="flex flex-col gap-6">
              <h2 className="text-xl font-heading font-bold text-text-main border-b border-gray-100 pb-4">Informasi Pribadi</h2>
              <div className="flex items-center gap-6 mb-2">
                <div className="relative w-24 h-24 rounded-full shadow-sm border-4 border-white bg-slate-200 overflow-hidden">
                   <Image src="/default-avatar.png" alt="Profile Photo" fill className="object-cover" />
                </div>
                <div className="flex flex-col gap-2">
                  <button className="rounded-full bg-surface text-text-main px-5 py-2 text-sm font-bold hover:bg-gray-100 transition-colors border border-gray-200">Ubah Foto</button>
                  <button className="text-muted text-sm font-bold hover:text-red-500 transition-colors text-left px-2">Hapus</button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5 relative">
                  <label className="text-sm font-bold text-muted ml-1">Nama Depan</label>
                  <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full h-12 bg-surface border border-transparent rounded-xl px-4 text-text-main focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none font-medium" />
                </div>
                <div className="flex flex-col gap-1.5 relative">
                  <label className="text-sm font-bold text-muted ml-1">Nama Belakang</label>
                  <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full h-12 bg-surface border border-transparent rounded-xl px-4 text-text-main focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none font-medium" />
                </div>
                <div className="flex flex-col gap-1.5 relative md:col-span-2">
                  <label className="text-sm font-bold text-muted ml-1">Alamat Email</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} disabled className="w-full h-12 bg-gray-100 border border-transparent rounded-xl px-4 text-muted cursor-not-allowed font-medium" title="Email terhubung dengan Google OAuth tidak bisa diubah" />
                </div>
              </div>
            </section>

            {/* BAGIAN 2: PREFERENSI AI (DARI ONBOARDING) */}
            <section className="flex flex-col gap-6">
              <h2 className="text-xl font-heading font-bold text-text-main border-b border-gray-100 pb-4">Preferensi AI & Makanan</h2>
              
              <div className="space-y-8">
                {/* Edit Tujuan */}
                <div>
                  <label className="text-sm font-bold text-muted ml-1 mb-2 block">Tujuan Utama</label>
                  <div className="flex flex-col sm:flex-row p-1 bg-surface rounded-full border border-gray-100 w-full md:w-3/4">
                    {[{ id: "lose_weight", label: "Turun Berat" }, { id: "maintain", label: "Pertahankan" }, { id: "build_muscle", label: "Bangun Otot" }].map(item => (
                      <label key={item.id} className="flex-1 text-center cursor-pointer relative">
                        <input type="radio" name="goal" value={item.id} checked={goal === item.id} onChange={e => setGoal(e.target.value)} className="peer sr-only" />
                        <div className="py-2 px-4 rounded-full text-sm font-bold text-muted transition-all duration-200 peer-checked:bg-white peer-checked:text-primary peer-checked:shadow-sm">
                          {item.label}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Edit Budget */}
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <label className="text-sm font-bold text-muted ml-1">Anggaran Mingguan</label>
                    <span className="text-primary font-bold">{formatRupiah(budget)}</span>
                  </div>
                  <input type="range" min="100000" max="1000000" step="50000" value={budget} onChange={e => setBudget(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary" />
                </div>

                {/* Edit Pantangan */}
                <div>
                  <label className="text-sm font-bold text-muted ml-1 mb-3 block">Pantangan & Alergi</label>
                  <div className="flex flex-wrap gap-3">
                    {[
                      { id: "vegan", label: "Vegan" }, { id: "vegetarian", label: "Vegetarian" },
                      { id: "gluten_free", label: "Bebas Gluten" }, { id: "dairy_free", label: "Bebas Susu" },
                      { id: "nut_allergy", label: "Alergi Kacang" }, { id: "seafood_allergy", label: "Alergi Seafood" }
                    ].map(diet => {
                      const isSelected = selectedDiets.includes(diet.id);
                      return (
                        <button key={diet.id} onClick={() => toggleDiet(diet.id)} type="button" className={`px-4 py-2 rounded-full text-sm font-bold border transition-colors ${isSelected ? 'bg-primary/10 border-primary text-primary' : 'bg-surface border-transparent text-muted hover:border-primary/30'}`}>
                          {diet.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>

            {/* BAGIAN 3: PREFERENSI APLIKASI */}
            <section className="flex flex-col gap-6">
              <h2 className="text-xl font-heading font-bold text-text-main border-b border-gray-100 pb-4">Pengaturan Aplikasi</h2>
              <div className="flex flex-col gap-2">
                <label className="flex items-center justify-between p-4 rounded-2xl hover:bg-surface transition-colors cursor-pointer border border-transparent hover:border-gray-100">
                  <div className="flex flex-col gap-1 pr-4">
                    <span className="font-bold text-text-main">Pengingat Memasak</span>
                    <span className="text-sm text-muted">Dapatkan notifikasi push saat waktunya menyiapkan makanan.</span>
                  </div>
                  <div className="relative">
                    <input type="checkbox" checked={notifReminders} onChange={() => setNotifReminders(!notifReminders)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </div>
                </label>
                <label className="flex items-center justify-between p-4 rounded-2xl hover:bg-surface transition-colors cursor-pointer border border-transparent hover:border-gray-100">
                  <div className="flex flex-col gap-1 pr-4">
                    <span className="font-bold text-text-main">Kirim Daftar Belanja ke Email</span>
                    <span className="text-sm text-muted">Sistem akan otomatis mengirim PDF belanja setiap hari Minggu.</span>
                  </div>
                  <div className="relative">
                    <input type="checkbox" checked={emailList} onChange={() => setEmailList(!emailList)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </div>
                </label>
              </div>
            </section>

            {/* BAGIAN 4: ZONA BERBAHAYA */}
            <section className="flex flex-col gap-6 mt-4">
              <h2 className="text-xl font-heading font-bold text-red-500 border-b border-gray-100 pb-4 flex items-center gap-2">
                <span className="material-symbols-outlined">warning</span> Zona Berbahaya
              </h2>
              <div className="border border-red-200 rounded-[24px] p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 bg-red-50/50">
                <div className="flex flex-col gap-2">
                  <h3 className="font-bold text-text-main">Hapus Akun Permanen</h3>
                  <p className="text-sm text-muted max-w-md leading-relaxed">Tindakan ini tidak dapat dibatalkan. Semua data profil, jadwal makan, dan preferensi Anda akan dihapus secara permanen dari server.</p>
                </div>
                <button className="flex-shrink-0 rounded-full bg-white border border-red-500 text-red-500 px-6 py-3 text-sm font-bold hover:bg-red-500 hover:text-white transition-colors shadow-sm">
                  Hapus Akun Saya
                </button>
              </div>
            </section>

          </div>
        </div>
      
      {/* FLOATING SAVE BAR (Muncul jika ada perubahan) */}
      <div className={`fixed bottom-24 md:bottom-6 left-1/2 transform -translate-x-1/2 w-full max-w-2xl px-4 z-50 transition-all duration-500 ${isDirty ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}`}>
        <div className="bg-white rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-gray-100 p-3 pl-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse"></div>
            <span className="font-bold text-text-main text-sm hidden sm:block">Ada perubahan yang belum disimpan.</span>
            <span className="font-bold text-text-main text-sm sm:hidden">Belum disimpan</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleDiscard} className="px-5 py-2.5 rounded-full text-muted text-sm font-bold hover:bg-surface hover:text-text-main transition-colors">
              Batal
            </button>
            <button onClick={handleSave} className="px-6 py-2.5 rounded-full bg-primary text-white text-sm font-bold hover:bg-primary-hover transition-colors shadow-soft">
              Simpan
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
