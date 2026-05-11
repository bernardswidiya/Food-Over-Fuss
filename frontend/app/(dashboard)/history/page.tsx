"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { getMealHistory } from "@/lib/api";
import type { MealPlanResponse, DailyMenuResponse } from "@/lib/api";

const MEAL_META: Record<string, { label: string; icon: string }> = {
  sarapan: { label: "Sarapan", icon: "egg_alt" },
  siang: { label: "Makan Siang", icon: "restaurant" },
  malam: { label: "Makan Malam", icon: "dinner_dining" },
};

function formatDateRange(start: string, end: string): string {
  const s = new Date(start + "T00:00:00");
  const e = new Date(end + "T00:00:00");
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "long" };
  if (s.getFullYear() !== e.getFullYear()) {
    return `${s.toLocaleDateString("id-ID", { ...opts, year: "numeric" })} – ${e.toLocaleDateString("id-ID", { ...opts, year: "numeric" })}`;
  }
  if (s.getMonth() !== e.getMonth()) {
    return `${s.toLocaleDateString("id-ID", opts)} – ${e.toLocaleDateString("id-ID", { ...opts, year: "numeric" })}`;
  }
  return `${s.toLocaleDateString("id-ID", opts)} – ${e.toLocaleDateString("id-ID", { ...opts, year: "numeric" })}`;
}

function groupByDate(menus: DailyMenuResponse[]): Record<string, DailyMenuResponse[]> {
  return menus
    .filter((m) => !m.is_cleared)
    .reduce<Record<string, DailyMenuResponse[]>>((acc, menu) => {
      if (!acc[menu.date]) acc[menu.date] = [];
      acc[menu.date].push(menu);
      return acc;
    }, {});
}

function PlanCard({ plan }: { plan: MealPlanResponse }) {
  const [expanded, setExpanded] = useState(false);

  const activeMenus = plan.daily_menus.filter((m) => !m.is_cleared);
  const totalCalories = activeMenus.reduce((sum, m) => sum + m.calories, 0);
  const menusByDate = groupByDate(plan.daily_menus);
  const sortedDates = Object.keys(menusByDate).sort();

  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">

      {/* Card Header */}
      <button
        onClick={() => setExpanded((prev) => !prev)}
        className="w-full flex items-center justify-between px-8 py-6 hover:bg-surface transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-primary text-2xl">
              calendar_month
            </span>
          </div>

          <div className="text-left">
            <p className="font-heading font-bold text-lg text-text-main">
              {formatDateRange(plan.start_date, plan.end_date)}
            </p>
            <p className="text-sm text-muted font-medium mt-0.5">
              {activeMenus.length} menu &nbsp;·&nbsp; {totalCalories.toLocaleString("id-ID")} kkal total
            </p>
          </div>
        </div>

        <span
          className={`material-symbols-outlined text-muted transition-transform duration-200 ${
            expanded ? "rotate-180" : ""
          }`}
        >
          expand_more
        </span>
      </button>

      {/* Expanded Detail */}
      {expanded && (
        <div className="border-t border-gray-100 px-8 py-6 space-y-6">
          {sortedDates.map((dateStr) => {
            const menus = menusByDate[dateStr];
            const date = new Date(dateStr + "T00:00:00");
            const dayLabel = date.toLocaleDateString("id-ID", {
              weekday: "long",
              day: "numeric",
              month: "long",
            });

            return (
              <div key={dateStr}>
                <p className="text-xs font-extrabold uppercase tracking-widest text-muted mb-3">
                  {dayLabel}
                </p>

                <div className="flex flex-col gap-2">
                  {menus.map((menu) => {
                    const meta = MEAL_META[menu.meal_type] || MEAL_META.sarapan;
                    return (
                      <div
                        key={menu.id}
                        className="flex items-center justify-between bg-surface rounded-2xl px-5 py-3"
                      >
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-primary text-xl">
                            {meta.icon}
                          </span>
                          <div>
                            <p className="font-bold text-sm text-text-main">
                              {menu.recipe_name}
                            </p>
                            <p className="text-xs text-muted font-medium">
                              {meta.label}
                            </p>
                          </div>
                        </div>
                        <span className="text-sm font-bold text-primary">
                          {menu.calories} kkal
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function HistoryPage() {
  const [plans, setPlans] = useState<MealPlanResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getMealHistory();
      setPlans(data);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Gagal memuat riwayat"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return (
    <div className="flex-1 overflow-y-auto px-6 lg:px-10 py-8">
      <div className="max-w-4xl mx-auto">

        {/* Judul */}
        <div className="mb-10">
          <span className="text-primary font-bold text-sm tracking-widest uppercase block mb-1">
            Jejak Menu
          </span>
          <h1 className="text-4xl md:text-5xl font-heading font-extrabold tracking-tighter text-text-main">
            Riwayat Menu
          </h1>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 text-sm font-medium px-4 py-3 rounded-2xl flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">error</span>
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
              <span className="text-muted text-sm font-bold">
                Memuat riwayat...
              </span>
            </div>
          </div>

        ) : plans.length === 0 ? (

          /* Empty State */
          <div className="flex flex-col items-center justify-center h-48 text-center bg-white rounded-3xl border border-gray-100 p-8">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-primary text-3xl">
                history
              </span>
            </div>
            <h3 className="text-xl font-heading font-bold text-text-main mb-2">
              Belum ada riwayat menu
            </h3>
            <p className="text-muted text-sm max-w-md mb-6">
              Buat jadwal makan mingguan di halaman Kalender untuk mulai mencatat riwayat menumu.
            </p>
            <Link
              href="/calendar"
              className="bg-primary hover:bg-primary-hover text-white px-8 py-3 rounded-full font-bold shadow-soft transition-all hover:-translate-y-1 inline-flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">
                magic_button
              </span>
              Buka Kalender
            </Link>
          </div>

        ) : (
          <div className="space-y-4">
            {plans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} />
            ))}
          </div>
        )}
      </div>

      <div className="h-24 md:hidden"></div>
    </div>
  );
}
