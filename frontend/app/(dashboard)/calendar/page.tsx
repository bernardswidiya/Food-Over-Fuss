"use client";

import { useState, useEffect, useCallback } from "react";
import { getMeals, generateWeekMeals, regenerateMeal, clearMeal } from "@/lib/api";
import type { DailyMenuResponse } from "@/lib/api";

// ── Helpers ────────────────────────────────────────────────────────────────

function formatDateISO(date: Date): string {
  return date.toISOString().split("T")[0];
}

const DAY_FULL: Record<string, string> = {
  SEN: "Senin", SEL: "Selasa", RAB: "Rabu", KAM: "Kamis",
  JUM: "Jumat", SAB: "Sabtu", MIN: "Minggu",
};

// ── Types ──────────────────────────────────────────────────────────────────

interface WeekDay {
  dateStr: string;
  dayName: string;
  dateNum: number;
  month: string;
  year: number;
  isToday: boolean;
}

// ── Sub-components ─────────────────────────────────────────────────────────

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-48">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-[3px] border-primary/30 border-t-primary rounded-full animate-spin" />
        <span className="text-muted text-sm font-bold">Memuat jadwal...</span>
      </div>
    </div>
  );
}

function EmptySlot() {
  return (
    <div className="bg-surface/60 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center min-h-15">
      <span className="text-xs text-gray-300 font-medium">Belum dijadwal</span>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function CalendarPage() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [meals, setMeals] = useState<DailyMenuResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  // Mobile: selected day index
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  // ── Week calculation ───────────────────────────────────────────────────

  const getWeekDays = (offset: number): WeekDay[] => {
    const today = new Date();
    const dayOfWeek = today.getDay() || 7;
    const monday = new Date(today);
    monday.setDate(today.getDate() - dayOfWeek + 1 + offset * 7);

    return Array.from({ length: 7 }).map((_, i) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      return {
        dateStr: formatDateISO(date),
        dayName: date.toLocaleDateString("id-ID", { weekday: "short" }).toUpperCase().replace(".", ""),
        dateNum: date.getDate(),
        month: date.toLocaleDateString("id-ID", { month: "long" }),
        year: date.getFullYear(),
        isToday:
          offset === 0 &&
          date.getDate() === today.getDate() &&
          date.getMonth() === today.getMonth() &&
          date.getFullYear() === today.getFullYear(),
      };
    });
  };

  const weekDays: WeekDay[] = mounted
    ? getWeekDays(weekOffset)
    : Array.from({ length: 7 }).map((_, i) => ({
        dateStr: `2026-01-${12 + i}`,
        dayName: ["SEN", "SEL", "RAB", "KAM", "JUM", "SAB", "MIN"][i],
        dateNum: 12 + i,
        month: "Bulan",
        year: 2026,
        isToday: false,
      }));

  const startDate = weekDays[0].dateStr;
  const endDate = weekDays[6].dateStr;

  const firstDay = weekDays[0];
  const lastDay = weekDays[6];
  const monthYearStr =
    firstDay.month === lastDay.month
      ? `${firstDay.month} ${firstDay.year}`
      : firstDay.year === lastDay.year
      ? `${firstDay.month} – ${lastDay.month} ${firstDay.year}`
      : `${firstDay.month} ${firstDay.year} – ${lastDay.month} ${lastDay.year}`;

  const mealTypes = [
    { key: "sarapan", label: "Sarapan" },
    { key: "siang", label: "Makan Siang" },
    { key: "malam", label: "Makan Malam" },
  ];

  // ── Auto-select today on mount / week change ───────────────────────────

  useEffect(() => {
    if (!mounted) return;
    const todayIdx = weekDays.findIndex((d) => d.isToday);
    setSelectedDayIdx(todayIdx >= 0 ? todayIdx : 0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, weekOffset]);

  // ── API calls ──────────────────────────────────────────────────────────

  const fetchMeals = useCallback(async () => {
    if (!mounted) return;
    setLoading(true);
    setError("");
    try {
      const data = await getMeals(startDate, endDate);
      setMeals(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal memuat menu");
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, mounted]);

  useEffect(() => {
    fetchMeals();
  }, [fetchMeals]);

  const getMealForSlot = (dateStr: string, mealType: string): DailyMenuResponse | undefined =>
    meals.find((m) => m.date === dateStr && m.meal_type === mealType);

  const handleRegenerateWeek = async () => {
    setGenerating(true);
    setError("");
    try {
      await generateWeekMeals(startDate, endDate);
      await fetchMeals();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal generate menu");
    } finally {
      setGenerating(false);
    }
  };

  const handleRegenerateMeal = async (menuId: number) => {
    try {
      await regenerateMeal(menuId);
      await fetchMeals();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Gagal regenerate");
    }
  };

  const handleClearMeal = async (menuId: number) => {
    try {
      await clearMeal(menuId);
      await fetchMeals();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Gagal menghapus menu");
    }
  };

  const handleWeekChange = (delta: number) => {
    setWeekOffset((w) => w + delta);
  };

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Page Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between px-5 md:px-8 lg:px-10 pt-6 pb-4 md:py-8 shrink-0 gap-4">
        <div>
          <h2 className="text-text-main font-heading text-2xl md:text-4xl font-extrabold tracking-tight">
            Kalender Menu
          </h2>
          <p className="text-muted mt-0.5 text-sm font-medium">
            Atur, ganti, atau kosongkan jadwal makan mingguanmu.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          {/* Week navigator */}
          <div className="flex items-center gap-2 bg-white px-2 py-1.5 rounded-full border border-gray-100 shadow-sm justify-between">
            <button
              onClick={() => handleWeekChange(-1)}
              className="w-9 h-9 rounded-full flex items-center justify-center text-muted hover:bg-surface hover:text-text-main transition-colors"
            >
              <span className="material-symbols-outlined text-xl">chevron_left</span>
            </button>
            <span className="font-bold text-[11px] min-w-32.5 text-center text-primary uppercase tracking-widest">
              {monthYearStr}
            </span>
            <button
              onClick={() => handleWeekChange(1)}
              className="w-9 h-9 rounded-full flex items-center justify-center text-muted hover:bg-surface hover:text-text-main transition-colors"
            >
              <span className="material-symbols-outlined text-xl">chevron_right</span>
            </button>
          </div>

          {/* Generate week button */}
          <button
            onClick={handleRegenerateWeek}
            disabled={generating}
            className="flex items-center justify-center gap-2 rounded-full h-11 px-7 bg-primary hover:bg-primary-hover text-white font-bold transition-all shadow-soft hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-70 disabled:translate-y-0"
          >
            {generating ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <span className="material-symbols-outlined text-xl">magic_button</span>
            )}
            <span className="text-sm">{generating ? "Memproses..." : "Buat Menu Seminggu"}</span>
          </button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mx-5 md:mx-8 lg:mx-10 mb-3 bg-red-50 border border-red-200 text-red-600 text-sm font-medium px-4 py-3 rounded-2xl flex items-center gap-2 shrink-0">
          <span className="material-symbols-outlined text-lg">error</span>
          {error}
        </div>
      )}

      {/* ── Content area (mobile vs desktop) ────────────────────────── */}
      <div className="flex-1 overflow-hidden flex flex-col min-h-0">

        {/* ════ MOBILE VIEW (< md) ════ */}
        <div className="md:hidden flex-1 flex flex-col min-h-0 overflow-hidden">
          {loading ? (
            <LoadingSpinner />
          ) : (
            <>
              {/* Day picker strip */}
              <div className="flex gap-2 overflow-x-auto hide-scrollbar px-5 pb-3 shrink-0">
                {weekDays.map((day, i) => (
                  <button
                    key={day.dateStr}
                    onClick={() => setSelectedDayIdx(i)}
                    className={`shrink-0 flex flex-col items-center gap-0.5 px-4 py-2.5 rounded-2xl transition-all font-heading ${
                      selectedDayIdx === i
                        ? "bg-primary text-white shadow-soft"
                        : day.isToday
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : "bg-white text-text-main border border-gray-100"
                    }`}
                  >
                    <span className="text-[9px] font-bold uppercase tracking-wider">{day.dayName}</span>
                    <span className="text-xl font-extrabold leading-tight">{day.dateNum}</span>
                  </button>
                ))}
              </div>

              {/* Selected day detail */}
              <div className="flex-1 overflow-y-auto px-5 pb-24 space-y-4 hide-scrollbar">
                {/* Day title */}
                <div className="flex items-center gap-2 py-1">
                  <div className={`w-2 h-2 rounded-full ${weekDays[selectedDayIdx]?.isToday ? "bg-primary" : "bg-gray-300"}`} />
                  <p className="text-sm font-bold text-text-main">
                    {DAY_FULL[weekDays[selectedDayIdx]?.dayName] ?? weekDays[selectedDayIdx]?.dayName},{" "}
                    {weekDays[selectedDayIdx]?.dateNum} {weekDays[selectedDayIdx]?.month}
                  </p>
                  {weekDays[selectedDayIdx]?.isToday && (
                    <span className="bg-primary text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Hari Ini
                    </span>
                  )}
                </div>

                {/* Meal slots */}
                {mealTypes.map((mt) => {
                  const meal = weekDays[selectedDayIdx]
                    ? getMealForSlot(weekDays[selectedDayIdx].dateStr, mt.key)
                    : undefined;

                  return (
                    <div key={mt.key}>
                      <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-2 px-1">
                        {mt.label}
                      </p>
                      {meal ? (
                        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                          <div className="flex items-start justify-between gap-3">
                            {/* Meal icon placeholder */}
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                              <span
                                className="material-symbols-outlined text-primary text-2xl"
                                style={{ fontVariationSettings: "'FILL' 1" }}
                              >
                                restaurant
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-sm text-text-main truncate">{meal.recipe_name}</h4>
                              <p className="text-xs text-muted mt-0.5">
                                {meal.calories} kkal · {meal.protein}g protein · {meal.carbs}g karbo
                              </p>
                            </div>
                            {/* Action buttons — always visible on mobile */}
                            <div className="flex gap-1.5 shrink-0">
                              <button
                                onClick={() => handleRegenerateMeal(meal.id)}
                                className="w-9 h-9 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors flex items-center justify-center"
                                title="Ganti menu ini"
                              >
                                <span className="material-symbols-outlined text-[18px]">autorenew</span>
                              </button>
                              <button
                                onClick={() => handleClearMeal(meal.id)}
                                className="w-9 h-9 rounded-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center"
                                title="Kosongkan"
                              >
                                <span className="material-symbols-outlined text-[18px]">delete</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <EmptySlot />
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* ════ DESKTOP VIEW (md+) ════ */}
        <div className="hidden md:block flex-1 overflow-auto px-8 lg:px-10 pb-20">
          {loading ? (
            <LoadingSpinner />
          ) : (
            <div className="min-w-260 px-10">
              {/* Day header row */}
              <div className="grid grid-cols-7 gap-4 mb-6 sticky top-0 bg-background-light z-20 pb-4 pt-4">
                {weekDays.map((day, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <span className="text-muted text-xs font-bold uppercase tracking-wider mb-2">
                      {day.dayName}
                    </span>
                    <div
                      className={`size-10 rounded-full flex items-center justify-center font-heading font-extrabold text-lg mb-2 transition-colors ${
                        day.isToday
                          ? "bg-primary text-white shadow-soft"
                          : "text-text-main hover:bg-surface"
                      }`}
                    >
                      {day.dateNum}
                    </div>
                  </div>
                ))}
              </div>

              {/* Meal rows */}
              <div className="flex flex-col gap-8">
                {mealTypes.map((mt) => (
                  <div key={mt.key} className="relative">
                    {/* Rotated label */}
                    <div className="absolute -left-10 top-0 bottom-0 w-10 flex items-center justify-center">
                      <div className="-rotate-90 text-xs font-bold text-muted uppercase tracking-widest whitespace-nowrap">
                        {mt.label}
                      </div>
                    </div>

                    <div className="grid grid-cols-7 gap-4">
                      {weekDays.map((day, i) => {
                        const meal = getMealForSlot(day.dateStr, mt.key);

                        if (meal) {
                          return (
                            <div
                              key={i}
                              className="bg-surface rounded-[20px] p-3 border border-transparent hover:border-primary/20 group relative overflow-hidden transition-all"
                            >
                              <div className="aspect-video rounded-xl bg-slate-200 mb-3 flex items-center justify-center">
                                <span className="material-symbols-outlined text-slate-300 text-3xl">
                                  restaurant
                                </span>
                              </div>
                              <h4 className="font-bold text-sm text-text-main mb-1 truncate">
                                {meal.recipe_name}
                              </h4>
                              <span className="text-xs font-bold text-muted">{meal.calories} Kkal</span>

                              {/* Hover overlay with actions */}
                              <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                <button
                                  onClick={() => handleRegenerateMeal(meal.id)}
                                  className="w-10 h-10 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white flex items-center justify-center transition-colors"
                                  title="Ganti Menu Ini"
                                >
                                  <span className="material-symbols-outlined text-[18px]">autorenew</span>
                                </button>
                                <button
                                  onClick={() => handleClearMeal(meal.id)}
                                  className="w-10 h-10 rounded-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors"
                                  title="Kosongkan"
                                >
                                  <span className="material-symbols-outlined text-[18px]">delete</span>
                                </button>
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div
                            key={i}
                            className="bg-surface/50 rounded-[20px] p-3 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center min-h-35"
                          />
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </>
  );
}
