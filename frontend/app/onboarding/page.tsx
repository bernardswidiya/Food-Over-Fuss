"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { savePreferences } from "@/lib/api";

export default function OnboardingPage() {
  const router = useRouter();
  
  // State Navigasi
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // State Form
  const [goal, setGoal] = useState("maintain");
  const [budget, setBudget] = useState(300000);
  const [selectedDiets, setSelectedDiets] = useState<string[]>([]);

  // Daftar Data Opsi
  const goals = [
    { id: "lose_weight", label: "Turun Berat Badan", icon: "trending_down" },
    { id: "maintain", label: "Pertahankan Berat", icon: "balance" },
    { id: "build_muscle", label: "Bangun Otot", icon: "fitness_center" }
  ];

  const dietOptions = [
    { id: "vegan", label: "Vegan", icon: "spa" },
    { id: "vegetarian", label: "Vegetarian", icon: "eco" },
    { id: "gluten_free", label: "Bebas Gluten", icon: "grass" },
    { id: "dairy_free", label: "Bebas Susu", icon: "local_drink" },
    { id: "nut_allergy", label: "Alergi Kacang", icon: "do_not_disturb" },
    { id: "seafood_allergy", label: "Alergi Seafood", icon: "set_meal" }
  ];

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(angka);
  };

  const toggleDiet = (id: string) => {
    setSelectedDiets(prev => prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]);
  };

  const handleNext = () => {
    if (currentStep < 3) setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  };

  const handleSave = async () => {
    setIsLoading(true);
    setError("");
    try {
      await savePreferences({
        diet_goal: goal,
        daily_budget: budget,
        allergies: selectedDiets.length > 0 ? selectedDiets.join(",") : undefined,
      });
      // Redirect ke Dashboard setelah berhasil
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan preferensi. Coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const progressPercentage = (currentStep / 3) * 100;

  return (
    <div className="min-h-screen bg-background-light flex flex-col items-center justify-center p-6 font-body text-text-main relative overflow-hidden">
      
      {/* Background Ornamen */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Logo Wrapper */}
      <div className="mb-8 flex flex-col items-center z-10">
        <Image src="/Logo.png" alt="Food Over Fuss Logo" width={48} height={48} className="mb-3 w-12 h-12 object-contain" />
        <h1 className="text-2xl font-heading font-extrabold tracking-tight">Food Over Fuss</h1>
      </div>

      {/* Card Utama (Modal) */}
      <div className="w-full max-w-lg bg-white rounded-[32px] shadow-[0_20px_60px_rgba(0,0,0,0.05)] border border-gray-50 flex flex-col overflow-hidden z-10 transition-all duration-300">
        
        {/* Header & Progress Bar */}
        <div className="px-8 pt-8 pb-6 border-b border-gray-50 bg-white sticky top-0 z-20">
          <div className="flex items-center justify-between mb-6">
            {currentStep > 1 ? (
              <button onClick={handleBack} className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-muted hover:text-text-main hover:bg-gray-100 transition-colors">
                <span className="material-symbols-outlined text-xl">arrow_back</span>
              </button>
            ) : (
              <div className="w-10" aria-hidden="true"></div>
            )}
            <div className="text-sm font-bold text-muted uppercase tracking-widest">Langkah {currentStep} dari 3</div>
            <div className="w-10" aria-hidden="true"></div>
          </div>

          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary rounded-full transition-all duration-500 ease-out" 
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Form Body - Transisi Dinamis */}
        <div className="p-8 flex-1 flex flex-col gap-8 min-h-[360px]">
          
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-medium px-4 py-3 rounded-2xl">
              {error}
            </div>
          )}

          {/* STEP 1: TUJUAN */}
          {currentStep === 1 && (
            <div className="flex flex-col gap-6 animate-fade-slide-up">
              <div>
                <h2 className="text-3xl font-heading font-bold mb-2">Apa tujuan utama kamu?</h2>
                <p className="text-muted text-sm leading-relaxed">Pilih tujuan agar kami bisa merekomendasikan porsi dan kalori yang sesuai untukmu.</p>
              </div>
              
              <div className="flex flex-col gap-4 mt-2">
                {goals.map(item => (
                  <label key={item.id} className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all cursor-pointer ${goal === item.id ? 'border-primary bg-primary/5' : 'border-gray-100 hover:border-gray-200 hover:bg-surface'}`}>
                    <input 
                      type="radio" 
                      name="goal" 
                      value={item.id} 
                      checked={goal === item.id} 
                      onChange={() => setGoal(item.id)} 
                      className="sr-only" 
                    />
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${goal === item.id ? 'bg-primary text-white' : 'bg-surface text-muted'}`}>
                      <span className="material-symbols-outlined">{item.icon}</span>
                    </div>
                    <span className={`font-bold text-lg ${goal === item.id ? 'text-primary' : 'text-text-main'}`}>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: ANGGARAN */}
          {currentStep === 2 && (
            <div className="flex flex-col gap-6 animate-fade-slide-up">
              <div>
                <h2 className="text-3xl font-heading font-bold mb-2">Berapa anggaran mingguanmu?</h2>
                <p className="text-muted text-sm leading-relaxed">Atur anggaran belanja mingguamu, kami akan mencari resep yang masuk akal dan terjangkau.</p>
              </div>
              
              <div className="mt-8 flex flex-col gap-8">
                <div className="bg-surface rounded-2xl py-8 px-6 text-center border border-gray-100">
                  <span className="text-sm font-bold text-muted uppercase tracking-widest block mb-2">Estimasi Budget</span>
                  <span className="text-4xl md:text-5xl font-heading font-extrabold text-primary tracking-tight">
                    {formatRupiah(budget)}
                  </span>
                </div>
                
                <div className="px-2">
                  <input 
                    type="range" 
                    min="100000" 
                    max="1000000" 
                    step="50000" 
                    value={budget} 
                    onChange={e => setBudget(Number(e.target.value))} 
                    className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all" 
                  />
                  <div className="flex justify-between mt-3 text-xs font-bold text-muted">
                    <span>100rb</span>
                    <span>1 Juta+</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: PANTANGAN & ALERGI */}
          {currentStep === 3 && (
            <div className="flex flex-col gap-6 animate-fade-slide-up">
              <div>
                <h2 className="text-3xl font-heading font-bold mb-2">Ada pantangan makanan?</h2>
                <p className="text-muted text-sm leading-relaxed">Pilih alergi atau gaya hidup dietmu. Kosongkan jika kamu bisa makan semuanya.</p>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mt-4">
                {dietOptions.map(diet => {
                  const isSelected = selectedDiets.includes(diet.id);
                  return (
                    <button 
                      key={diet.id} 
                      onClick={() => toggleDiet(diet.id)} 
                      type="button" 
                      className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all ${isSelected ? 'bg-primary/5 border-primary text-primary' : 'bg-white border-gray-100 text-muted hover:border-gray-200 hover:bg-surface'}`}
                    >
                      <span className="material-symbols-outlined text-3xl mb-1">{diet.icon}</span>
                      <span className="font-bold text-sm text-center leading-tight">{diet.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Footer & Tombol Navigasi */}
        <div className="p-8 border-t border-gray-50 bg-gray-50/50">
          {currentStep < 3 ? (
            <button 
              onClick={handleNext} 
              className="w-full h-14 bg-primary text-white rounded-full font-bold text-lg flex items-center justify-center gap-2 hover:bg-primary-hover transition-all active:scale-[0.98] shadow-soft"
            >
              Selanjutnya
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          ) : (
            <button 
              onClick={handleSave} 
              disabled={isLoading}
              className="w-full h-14 bg-primary text-white rounded-full font-bold text-lg flex items-center justify-center gap-2 hover:bg-primary-hover transition-all active:scale-[0.98] shadow-soft disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  Selesai & Masuk
                  <span className="material-symbols-outlined">check_circle</span>
                </>
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
