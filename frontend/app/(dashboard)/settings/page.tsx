"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { getMe, getPreferences, savePreferences, logoutUser, uploadAvatar, deleteAvatar, deleteAccount } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const router = useRouter();
  const [isDirty, setIsDirty] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const initialLoadDone = useRef(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // State Informasi Pribadi
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  
  // Avatar Upload State
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State Preferensi AI
  const [goal, setGoal] = useState("maintain");
  const [budget, setBudget] = useState(300000);
  const [selectedDiets, setSelectedDiets] = useState<string[]>([]);

  // Load data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        const [userData, prefsData] = await Promise.all([
          getMe(),
          getPreferences().catch(() => null),
        ]);
        setName(userData.name);
        setEmail(userData.email);
        setProfilePicture(userData.profile_picture);
        
        if (prefsData) {
          setGoal(prefsData.diet_goal || "maintain");
          setBudget(prefsData.daily_budget || 300000);
          setSelectedDiets(prefsData.allergies ? prefsData.allergies.split(",") : []);
        }
      } catch {
        // Silent fail
      } finally {
        setLoading(false);
        // Mark initial load done after next render
        setTimeout(() => { initialLoadDone.current = true; }, 100);
      }
    };
    loadData();
  }, []);

  // Track changes after initial load
  useEffect(() => {
    if (initialLoadDone.current) {
      setIsDirty(true);
    }
  }, [name, goal, budget, selectedDiets]);

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(angka);
  };

  const toggleDiet = (id: string) => {
    setSelectedDiets(prev => prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await savePreferences({
        diet_goal: goal,
        daily_budget: budget,
        allergies: selectedDiets.length > 0 ? selectedDiets.join(",") : undefined,
      });
      setIsDirty(false);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    setIsDirty(false);
    // Re-fetch would be ideal, but for simplicity just reset dirty state
    window.location.reload();
  };

  const handleDeleteAccount = () => {
    setShowDeleteModal(true);
  };

  const confirmDeleteAccount = async () => {
    setDeletingAccount(true);
    try {
      await deleteAccount();
      await logoutUser();
      router.push("/login");
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Gagal menghapus akun. Silakan coba lagi.");
      setDeletingAccount(false);
      setShowDeleteModal(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran file maksimal 5MB");
      return;
    }

    setUploadingAvatar(true);
    try {
      const updatedUser = await uploadAvatar(file);
      setProfilePicture(updatedUser.profile_picture);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Gagal mengunggah foto");
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleAvatarDelete = async () => {
    if (!confirm("Yakin ingin menghapus foto profil?")) return;

    setUploadingAvatar(true);
    try {
      const updatedUser = await deleteAvatar();
      setProfilePicture(updatedUser.profile_picture);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Gagal menghapus foto");
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      {/* AREA FORM SETTINGS */}
      <div className="flex-1 overflow-y-auto px-6 lg:px-10 py-8 pb-32">
        <div className="max-w-4xl mx-auto flex flex-col gap-12">
          
          {/* BAGIAN 1: INFORMASI PRIBADI */}
          <section className="flex flex-col gap-6">
            <h2 className="text-xl font-heading font-bold text-text-main border-b border-gray-100 pb-4">Informasi Pribadi</h2>
            <div className="flex items-center gap-6 mb-2">
              <div className="relative w-24 h-24 rounded-full shadow-sm border-4 border-white bg-slate-200 overflow-hidden flex items-center justify-center">
                {uploadingAvatar ? (
                  <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                ) : (
                  <Image src={profilePicture || "/default-avatar.png"} alt="Profile Photo" fill sizes="96px" loading="eager" className="object-cover" />
                )}
              </div>
              <div className="flex flex-col gap-2">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleAvatarUpload} 
                  accept="image/png, image/jpeg, image/webp" 
                  className="hidden" 
                />
                <button 
                  onClick={() => fileInputRef.current?.click()} 
                  disabled={uploadingAvatar}
                  className="rounded-full bg-surface text-text-main px-5 py-2 text-sm font-bold hover:bg-gray-100 transition-colors border border-gray-200 disabled:opacity-50"
                >
                  Ubah Foto
                </button>
                {profilePicture && (
                  <button 
                    onClick={handleAvatarDelete}
                    disabled={uploadingAvatar}
                    className="text-muted text-sm font-bold hover:text-red-500 transition-colors text-left px-2 disabled:opacity-50"
                  >
                    Hapus
                  </button>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-1.5 relative md:col-span-2">
                <label className="text-sm font-bold text-muted ml-1">Nama Lengkap</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full h-12 bg-surface border border-transparent rounded-xl px-4 text-text-main focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none font-medium" />
              </div>
              <div className="flex flex-col gap-1.5 relative md:col-span-2">
                <label className="text-sm font-bold text-muted ml-1">Alamat Email</label>
                <input type="email" value={email} disabled className="w-full h-12 bg-gray-100 border border-transparent rounded-xl px-4 text-muted cursor-not-allowed font-medium" title="Email tidak bisa diubah" />
              </div>
            </div>
          </section>

          {/* BAGIAN 2: PREFERENSI AI */}
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

          {/* BAGIAN 3: ZONA BERBAHAYA */}
          <section className="flex flex-col gap-6 mt-4">
            <h2 className="text-xl font-heading font-bold text-red-500 border-b border-gray-100 pb-4 flex items-center gap-2">
              <span className="material-symbols-outlined">warning</span> Zona Berbahaya
            </h2>
            <div className="border border-red-200 rounded-[24px] p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 bg-red-50/50">
              <div className="flex flex-col gap-2">
                <h3 className="font-bold text-text-main">Hapus Akun Permanen</h3>
                <p className="text-sm text-muted max-w-md leading-relaxed">Tindakan ini akan menghapus semua data Anda secara permanen dan tidak dapat dikembalikan lagi.</p>
              </div>
              <button 
                onClick={handleDeleteAccount} 
                disabled={deletingAccount}
                className="flex-shrink-0 rounded-full bg-white border border-red-500 text-red-500 px-6 py-3 text-sm font-bold hover:bg-red-500 hover:text-white transition-colors shadow-sm disabled:opacity-50"
              >
                {deletingAccount ? "Menghapus..." : "Hapus Akun"}
              </button>
            </div>
          </section>

        </div>
      </div>
    
      {/* FLOATING SAVE BAR */}
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
            <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 rounded-full bg-primary text-white text-sm font-bold hover:bg-primary-hover transition-colors shadow-soft disabled:opacity-70">
              {saving ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </div>
      </div>

      {/* DELETE ACCOUNT MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl flex flex-col gap-4 animate-scale-up">
            <div className="w-12 h-12 bg-red-100 text-red-500 rounded-full flex items-center justify-center self-center mb-2">
              <span className="material-symbols-outlined text-[28px]">warning</span>
            </div>
            <h3 className="text-xl font-heading font-bold text-center text-text-main">Hapus Akun Permanen?</h3>
            <p className="text-center text-sm text-muted leading-relaxed">
              Tindakan ini tidak dapat dibatalkan. Semua riwayat makan, pengeluaran, dan pengaturan Anda akan hilang selamanya.
            </p>
            <div className="flex gap-3 mt-4">
              <button 
                onClick={() => setShowDeleteModal(false)}
                disabled={deletingAccount}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-text-main bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button 
                onClick={confirmDeleteAccount}
                disabled={deletingAccount}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-50 shadow-sm"
              >
                {deletingAccount ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
