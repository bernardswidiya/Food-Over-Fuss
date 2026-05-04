"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { getMeals, getMe } from "@/lib/api";
import type { DailyMenuResponse, UserResponse } from "@/lib/api";

function formatDateISO(date: Date): string {
  return date.toISOString().split("T")[0];
}

export default function DashboardPage() {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [todayMeals, setTodayMeals] = useState<DailyMenuResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const today = new Date();
  const todayStr = formatDateISO(today);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userData, mealsData] = await Promise.all([
          getMe(),
          getMeals(todayStr, todayStr),
        ]);
        setUser(userData);
        setTodayMeals(mealsData);
      } catch {
        // Silent fail — user will see empty state
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [todayStr]);

  // Get greeting based on time
  const hour = today.getHours();
  const greeting = hour < 12 ? "Selamat Pagi" : hour < 17 ? "Selamat Siang" : "Selamat Malam";

  // Compute daily totals from today's meals
  const totalCalories = todayMeals.reduce((sum, m) => sum + m.calories, 0);
  const totalProtein = todayMeals.reduce((sum, m) => sum + m.protein, 0);
  const totalCarbs = todayMeals.reduce((sum, m) => sum + m.carbs, 0);
  const totalFat = todayMeals.reduce((sum, m) => sum + m.fat, 0);

  // Targets (could come from preferences later)
  const targetCalories = 2000;
  const targetProtein = 140;
  const targetCarbs = 210;
  const targetFat = 65;

  const caloriesPct = Math.min(100, Math.round((totalCalories / targetCalories) * 100));
  const proteinPct = Math.min(100, Math.round((totalProtein / targetProtein) * 100));
  const carbsPct = Math.min(100, Math.round((totalCarbs / targetCarbs) * 100));
  const fatPct = Math.min(100, Math.round((totalFat / targetFat) * 100));

  const remainingCalories = Math.max(0, targetCalories - totalCalories);

  // Map meal type to icon & label
  const mealMeta: Record<string, { icon: string; label: string; color: string }> = {
    sarapan: { icon: "egg_alt", label: "Sarapan", color: "primary" },
    siang: { icon: "restaurant", label: "Makan Siang", color: "accent" },
    malam: { icon: "dinner_dining", label: "Makan Malam", color: "blue-500" },
  };

  // Build week strip (Mon-Sun)
  const dayOfWeek = today.getDay() || 7;
  const monday = new Date(today);
  monday.setDate(today.getDate() - dayOfWeek + 1);
  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return {
      name: d.toLocaleDateString("id-ID", { weekday: "short" }).toUpperCase().replace(".", ""),
      num: d.getDate(),
      isToday: formatDateISO(d) === todayStr,
    };
  });

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden relative">
      <div className="px-6 lg:px-10 py-8 max-w-7xl mx-auto">
        <div className="mb-10">
          <span className="text-primary font-bold text-sm tracking-widest uppercase mb-1 block">{greeting}, {user?.name || "User"} 👋</span>
          <h2 className="text-4xl md:text-5xl font-heading font-extrabold tracking-tighter text-text-main">Dashboard</h2>
        </div>

        {/* Strip Kalender Mingguan */}
        <section className="mb-10">
          <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
            {weekDays.map((day) => (
              <div key={day.name + day.num} className={`flex-none w-20 md:w-24 h-28 md:h-32 flex flex-col items-center justify-center rounded-2xl cursor-pointer transition-all ${day.isToday ? 'bg-primary text-white shadow-soft -mt-2 h-32 md:h-36' : 'bg-white text-muted hover:bg-gray-50 border border-gray-100'}`}>
                <span className={`text-xs font-bold mb-1 ${day.isToday ? 'opacity-80' : ''}`}>{day.name}</span>
                <span className="text-2xl font-heading font-extrabold">{day.num}</span>
                {day.isToday && <div className="mt-2 w-1.5 h-1.5 bg-white rounded-full"></div>}
              </div>
            ))}
          </div>
        </section>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* KOLOM KIRI: Statistik Makro */}
          <div className="lg:col-span-4 flex flex-col gap-8">
            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
              <h3 className="text-xl font-heading font-bold mb-8">Nutrisi Harian</h3>
              <div className="flex items-center justify-center mb-10 relative">
                <svg className="w-48 h-48 transform -rotate-90">
                  <circle className="text-gray-100" cx="96" cy="96" fill="transparent" r="88" stroke="currentColor" strokeWidth="12"></circle>
                  <circle className="text-primary" cx="96" cy="96" fill="transparent" r="88" stroke="currentColor" strokeDasharray="552.92" strokeDashoffset={552.92 * (1 - caloriesPct / 100)} strokeLinecap="round" strokeWidth="12"></circle>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-4xl font-heading font-extrabold">{remainingCalories.toLocaleString("id-ID")}</span>
                  <span className="text-xs text-muted font-bold uppercase tracking-widest mt-1">Sisa Kkal</span>
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2"><div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-primary"></div><span className="text-sm font-bold text-muted">Protein</span></div><span className="text-sm font-bold text-text-main">{totalProtein}g / {targetProtein}g</span></div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden"><div className="bg-primary h-full rounded-full transition-all" style={{ width: `${proteinPct}%` }}></div></div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2"><div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-accent"></div><span className="text-sm font-bold text-muted">Karbo</span></div><span className="text-sm font-bold text-text-main">{totalCarbs}g / {targetCarbs}g</span></div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden"><div className="bg-accent h-full rounded-full transition-all" style={{ width: `${carbsPct}%` }}></div></div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2"><div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-gray-400"></div><span className="text-sm font-bold text-muted">Lemak</span></div><span className="text-sm font-bold text-text-main">{totalFat}g / {targetFat}g</span></div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden"><div className="bg-gray-400 h-full rounded-full transition-all" style={{ width: `${fatPct}%` }}></div></div>
                </div>
              </div>
            </div>
          </div>

          {/* KOLOM KANAN: Menu Makanan */}
          <div className="lg:col-span-8 space-y-6">
            <div className="px-2 mb-2">
              <h3 className="text-2xl font-heading font-bold tracking-tight">Menu Hari Ini</h3>
            </div>

            {todayMeals.length === 0 ? (
              <div className="bg-white rounded-[24px] p-10 border border-gray-100 shadow-sm flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-primary text-3xl">calendar_month</span>
                </div>
                <h4 className="text-xl font-heading font-bold mb-2">Belum ada menu hari ini</h4>
                <p className="text-muted text-sm mb-6 max-w-sm">Buat jadwal makan mingguan di halaman Kalender untuk melihat menu harianmu di sini.</p>
                <Link href="/calendar" className="bg-primary hover:bg-primary-hover text-white px-8 py-3 rounded-full font-bold shadow-soft transition-all hover:-translate-y-1 inline-flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">magic_button</span>
                  Buka Kalender
                </Link>
              </div>
            ) : (
              todayMeals.map((meal) => {
                const meta = mealMeta[meal.meal_type] || mealMeta.sarapan;
                return (
                  <Link key={meal.id} href={`/recipe/${meal.id}`} className="group bg-white rounded-[24px] overflow-hidden flex flex-col md:flex-row shadow-sm hover:shadow-md transition-shadow border border-gray-100 cursor-pointer block">
                    <div className="md:w-1/3 h-48 md:h-auto overflow-hidden bg-slate-100 flex items-center justify-center">
                      <span className="material-symbols-outlined text-6xl text-slate-300">{meta.icon}</span>
                    </div>
                    <div className="md:w-2/3 p-6 md:p-8 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-extrabold uppercase tracking-widest rounded-full">{meta.label}</span>
                        </div>
                        <h4 className="text-2xl font-heading font-bold mb-2 group-hover:text-primary transition-colors">{meal.recipe_name}</h4>
                      </div>
                      <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
                        <div className="flex gap-4 md:gap-6">
                          <div className="flex flex-col"><span className="text-[10px] text-muted uppercase font-bold">Protein</span><span className="text-text-main font-bold">{meal.protein}g</span></div>
                          <div className="flex flex-col"><span className="text-[10px] text-muted uppercase font-bold">Karbo</span><span className="text-text-main font-bold">{meal.carbs}g</span></div>
                          <div className="flex flex-col"><span className="text-[10px] text-muted uppercase font-bold">Kalori</span><span className="text-primary font-bold">{meal.calories} kkal</span></div>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-muted group-hover:bg-primary group-hover:text-white transition-all"><span className="material-symbols-outlined">chevron_right</span></div>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </div>

      <div className="h-24 md:hidden"></div>
    </div>
  );
}
