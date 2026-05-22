"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { getMealDetail, getMealAlternatives, getMealSubstitute, MealDetail, RecipeCard } from "@/lib/api";

interface IngredientItem {
  name: string;
  qty: number | string;
  unit: string;
}

const MEAL_TYPE_LABELS: Record<string, string> = {
  sarapan: "Sarapan",
  siang: "Makan Siang",
  malam: "Makan Malam",
};

function parseIngredients(raw: string | null): IngredientItem[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.map((item: unknown) => {
        if (typeof item === "string") return { name: item, qty: "", unit: "" };
        const obj = item as Record<string, unknown>;
        return {
          name: String(obj.name ?? ""),
          qty: obj.qty != null ? (obj.qty as number) : "",
          unit: String(obj.unit ?? ""),
        };
      });
    }
  } catch {
    return raw.split("\n").filter(Boolean).map((line) => ({ name: line, qty: "", unit: "" }));
  }
  return [];
}

function Spinner({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  );
}

function MacroBadge({ label, value, colorClass }: { label: string; value: string; colorClass: string }) {
  return (
    <div className={`px-4 py-2 rounded-2xl flex flex-col items-center justify-center min-w-20 border ${colorClass}`}>
      <span className="text-xs font-bold uppercase tracking-widest mb-0.5">{label}</span>
      <span className="font-heading font-extrabold text-lg">{value}</span>
    </div>
  );
}

function AlternativeCard({ recipe }: { recipe: RecipeCard }) {
  return (
    <div className="min-w-65 w-65 bg-white border border-gray-100 rounded-[24px] p-3 shadow-sm hover:shadow-soft transition-all snap-start shrink-0 flex flex-col gap-3">
      <div className="w-full h-32 rounded-xl overflow-hidden relative bg-slate-100">
        {recipe.image_url ? (
          <Image src={recipe.image_url} alt={recipe.name} fill className="object-cover" unoptimized />
        ) : (
          <div className="h-full flex items-center justify-center">
            <span className="material-symbols-outlined text-3xl text-slate-400">restaurant</span>
          </div>
        )}
      </div>
      <div className="px-1">
        <h4 className="font-heading font-bold text-base mb-2 truncate">{recipe.name}</h4>
        <div className="flex gap-2 text-[11px] font-bold">
          <span className="bg-surface px-2.5 py-1 rounded-full text-muted">{recipe.calories} Kkal</span>
          <span className="bg-primary/10 text-primary px-2.5 py-1 rounded-full">{recipe.protein}g Protein</span>
        </div>
      </div>
    </div>
  );
}

export default function RecipeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const menuId = Number(id);

  const [meal, setMeal] = useState<MealDetail | null>(null);
  const [alternatives, setAlternatives] = useState<RecipeCard[]>([]);
  const [loadingPage, setLoadingPage] = useState(true);
  const [loadingAlts, setLoadingAlts] = useState(false);
  const [error, setError] = useState("");

  const [substituteLoading, setSubstituteLoading] = useState(false);
  const [substitute, setSubstitute] = useState<RecipeCard | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!menuId || isNaN(menuId)) {
      setError("ID menu tidak valid");
      setLoadingPage(false);
      return;
    }

    getMealDetail(menuId)
      .then((data) => {
        setMeal(data);
        setLoadingPage(false);
        setLoadingAlts(true);
        return getMealAlternatives(menuId);
      })
      .then((alts) => setAlternatives(alts))
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Gagal memuat data resep");
        setLoadingPage(false);
      })
      .finally(() => setLoadingAlts(false));
  }, [menuId]);

  async function handleFindSubstitute() {
    setSubstituteLoading(true);
    try {
      const result = await getMealSubstitute(menuId);
      setSubstitute(result);
      setShowModal(true);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Gagal menemukan pengganti");
    } finally {
      setSubstituteLoading(false);
    }
  }

  if (loadingPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light">
        <div className="flex flex-col items-center gap-4">
          <Spinner className="w-10 h-10 text-primary" />
          <p className="text-muted font-medium font-body">Memuat resep...</p>
        </div>
      </div>
    );
  }

  if (error || !meal) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light">
        <div className="text-center flex flex-col items-center gap-4">
          <span className="material-symbols-outlined text-5xl text-muted">error_outline</span>
          <p className="text-text-main font-bold font-body">{error || "Resep tidak ditemukan"}</p>
          <button onClick={() => router.back()} className="text-primary font-bold hover:underline font-body">
            Kembali
          </button>
        </div>
      </div>
    );
  }

  const ingredients = parseIngredients(meal.ingredients);

  return (
    <div className="bg-background-light min-h-screen text-text-main flex flex-col font-body pb-20">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-gray-100 bg-white sticky top-0 z-50">
        <button
          onClick={() => router.back()}
          className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-surface transition-colors text-text-main"
        >
          <span className="material-symbols-outlined text-2xl">arrow_back</span>
        </button>
        <div className="flex gap-3 items-center">
          <div className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              restaurant
            </span>
            {MEAL_TYPE_LABELS[meal.meal_type] ?? meal.meal_type}
          </div>
          <div className="text-muted text-sm font-bold">
            {new Date(meal.date + "T00:00:00").toLocaleDateString("id-ID", {
              weekday: "short",
              day: "numeric",
              month: "short",
            })}
          </div>
        </div>
        <div className="w-10" />
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          {/* ── Kolom Kiri ── */}
          <div className="w-full lg:w-5/12 flex flex-col gap-8">
            {/* Hero Image */}
            <div className="w-full relative rounded-2xl overflow-hidden shadow-soft bg-slate-200 h-80">
              {meal.image_url ? (
                <Image src={meal.image_url} alt={meal.recipe_name} fill className="object-cover object-center" unoptimized />
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-6xl text-slate-400">restaurant</span>
                </div>
              )}
              <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />
              {meal.prep_time && (
                <div className="absolute bottom-4 left-4">
                  <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold text-text-main flex items-center gap-1.5 shadow-sm">
                    <span className="material-symbols-outlined text-[14px] text-muted">schedule</span>
                    {meal.prep_time} Menit
                  </div>
                </div>
              )}
            </div>

            {/* Judul & Makro */}
            <div className="flex flex-col gap-5">
              <h1 className="font-heading text-4xl lg:text-5xl font-extrabold leading-tight text-text-main tracking-tight">
                {meal.recipe_name}
              </h1>
              <div className="flex flex-wrap gap-3">
                <MacroBadge label="Kkal" value={String(meal.calories)} colorClass="bg-surface border-gray-100 text-text-main" />
                <MacroBadge label="Protein" value={`${meal.protein}g`} colorClass="bg-primary/10 border-primary/20 text-primary" />
                <MacroBadge label="Karbo" value={`${meal.carbs}g`} colorClass="bg-surface border-gray-100 text-text-main" />
                <MacroBadge label="Lemak" value={`${meal.fat}g`} colorClass="bg-accent/10 border-accent/20 text-accent" />
              </div>
            </div>

            {/* Bahan-bahan */}
            {ingredients.length > 0 && (
              <div className="bg-surface p-6 lg:p-8 rounded-[24px] flex flex-col gap-6 mt-2 border border-gray-100">
                <h2 className="font-heading text-2xl font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">shopping_basket</span>
                  Bahan-bahan
                </h2>
                <ul className="flex flex-col gap-4">
                  {ingredients.map((ing, idx) => (
                    <li key={idx} className="flex items-center justify-between pb-3 border-b border-gray-200 last:border-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                        <span className="font-bold">{ing.name}</span>
                      </div>
                      {(ing.qty !== "" || ing.unit) && (
                        <span className="text-muted text-sm font-medium">
                          {ing.qty} {ing.unit}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* ── Kolom Kanan ── */}
          <div className="w-full lg:w-7/12 flex flex-col gap-10 mt-4 lg:mt-0">
            {/* Cari Pengganti Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-surface p-2 pr-6 rounded-full border border-gray-100">
              <div className="flex items-center gap-3 pl-2">
                <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">restaurant_menu</span>
                </div>
                <span className="font-bold text-sm">Kurang suka menu ini?</span>
              </div>
              <button
                onClick={handleFindSubstitute}
                disabled={substituteLoading}
                className="bg-white border border-gray-200 hover:border-primary hover:text-primary text-text-main font-bold py-2.5 px-6 rounded-full transition-all duration-200 flex items-center gap-2 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {substituteLoading ? (
                  <>
                    <Spinner />
                    Mencari...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">swap_horiz</span>
                    Cari Pengganti
                  </>
                )}
              </button>
            </div>

            {/* Cara Membuat */}
            <div className="flex flex-col gap-8">
              <h2 className="font-heading text-2xl font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-accent">local_fire_department</span>
                Cara Membuat
              </h2>
              {meal.instructions && meal.instructions.length > 0 ? (
                <div className="flex flex-col gap-8">
                  {meal.instructions.map((step, idx) => (
                    <div key={idx} className="flex gap-5 group">
                      <div className="shrink-0">
                        <div className="w-10 h-10 rounded-full bg-surface text-muted font-heading font-extrabold flex items-center justify-center text-lg border-2 border-transparent group-hover:border-primary group-hover:text-primary group-hover:bg-primary/5 transition-all">
                          {idx + 1}
                        </div>
                      </div>
                      <div className="pt-2">
                        <p className="text-muted leading-relaxed">{step}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted italic text-sm">Instruksi memasak belum tersedia untuk menu ini.</p>
              )}
            </div>

            {/* Alternatif Sesuai Makro */}
            <div className="mt-8 pt-8 border-t border-gray-100 flex flex-col gap-6">
              <div>
                <h2 className="font-heading text-xl font-bold mb-1">Alternatif Sesuai Makro</h2>
                <p className="text-sm text-muted">Nutrisi setara, rasa berbeda.</p>
              </div>

              {loadingAlts ? (
                <div className="flex gap-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="min-w-65 w-65 h-52 bg-surface rounded-[24px] animate-pulse" />
                  ))}
                </div>
              ) : alternatives.length === 0 ? (
                <div className="bg-surface rounded-2xl p-6 text-center border border-gray-100">
                  <span className="material-symbols-outlined text-3xl text-muted mb-2 block">search_off</span>
                  <p className="text-muted text-sm">Belum ada alternatif dengan nilai gizi setara.</p>
                </div>
              ) : (
                <div className="flex gap-4 overflow-x-auto pb-6 no-scrollbar snap-x snap-mandatory">
                  {alternatives.map((alt) => (
                    <AlternativeCard key={alt.id} recipe={alt} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Substitute Modal */}
      {showModal && substitute && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setShowModal(false)}
        >
          <div
            className="w-full max-w-lg bg-white rounded-t-4xl p-6 pb-10 flex flex-col gap-5 animate-fade-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-xl font-bold">Pengganti Ditemukan</h3>
              <button
                onClick={() => setShowModal(false)}
                className="w-9 h-9 rounded-full bg-surface flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Recipe Preview */}
            <div className="flex gap-4 items-start">
              <div className="w-24 h-24 rounded-2xl overflow-hidden bg-slate-100 shrink-0 relative">
                {substitute.image_url ? (
                  <Image src={substitute.image_url} alt={substitute.name} fill className="object-cover" unoptimized />
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-3xl text-slate-400">restaurant</span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-heading text-lg font-bold mb-3 leading-snug">{substitute.name}</h4>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-surface px-2.5 py-1 rounded-full text-[11px] font-bold text-muted">
                    {substitute.calories} Kkal
                  </span>
                  <span className="bg-primary/10 text-primary px-2.5 py-1 rounded-full text-[11px] font-bold">
                    {substitute.protein}g Protein
                  </span>
                  <span className="bg-surface px-2.5 py-1 rounded-full text-[11px] font-bold text-muted">
                    {substitute.carbs}g Karbo
                  </span>
                  <span className="bg-accent/10 text-accent px-2.5 py-1 rounded-full text-[11px] font-bold">
                    {substitute.fat}g Lemak
                  </span>
                </div>
              </div>
            </div>

            {/* Prep time */}
            {substitute.prep_time && (
              <div className="flex items-center gap-2 text-sm text-muted">
                <span className="material-symbols-outlined text-[16px]">schedule</span>
                <span>{substitute.prep_time} menit</span>
              </div>
            )}

            {/* Actions */}
            <button
              onClick={handleFindSubstitute}
              disabled={substituteLoading}
              className="w-full py-3 border border-gray-200 rounded-full text-sm font-bold text-muted hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {substituteLoading ? (
                <>
                  <Spinner />
                  Mencari...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">refresh</span>
                  Cari yang lain
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
