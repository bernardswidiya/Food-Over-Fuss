"use client";

import { useState, useEffect, useCallback } from "react";
import { getGroceries } from "@/lib/api";
import type { AggregatedGroceryItem } from "@/lib/api";

function formatDateISO(date: Date): string {
  return date.toISOString().split("T")[0];
}

export default function GroceryListPage() {
  // Default range: current week (Mon-Sun)
  const today = new Date();
  const dayOfWeek = today.getDay() || 7;
  const monday = new Date(today);
  monday.setDate(today.getDate() - dayOfWeek + 1);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const [startDate, setStartDate] = useState(formatDateISO(monday));
  const [endDate, setEndDate] = useState(formatDateISO(sunday));
  const [sortBy, setSortBy] = useState("quantity_desc");
  const [items, setItems] = useState<AggregatedGroceryItem[]>([]);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchGroceries = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getGroceries(startDate, endDate, sortBy);
      setItems(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal memuat daftar belanja");
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, sortBy]);

  useEffect(() => {
    fetchGroceries();
  }, [fetchGroceries]);

  const toggleCheck = (name: string) => {
    setCheckedItems(prev => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  };

  const checkedCount = checkedItems.size;
  const totalCount = items.length;
  const progress = totalCount > 0 ? (checkedCount / totalCount) * 100 : 0;

  return (
    <>
      {/* AREA DAFTAR BELANJA */}
      <div className="flex-1 overflow-y-auto px-6 lg:px-10 py-8">
        <div className="max-w-6xl mx-auto">
          
          {/* Judul & Filter */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div className="space-y-1">
              <span className="text-primary font-bold text-sm tracking-widest uppercase block">Kebutuhan Dapur</span>
              <h1 className="text-4xl md:text-5xl font-heading font-extrabold tracking-tighter text-text-main">Daftar Belanja</h1>
            </div>
            
            {/* Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-3 min-w-[280px]">
              {/* Date Range */}
              <div className="bg-surface rounded-2xl p-3 border border-gray-100 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">date_range</span>
                <input 
                  type="date" 
                  value={startDate} 
                  onChange={e => setStartDate(e.target.value)}
                  className="bg-transparent border-none text-sm font-bold text-text-main focus:outline-none w-[120px]"
                />
                <span className="text-muted text-xs font-bold">s/d</span>
                <input 
                  type="date" 
                  value={endDate} 
                  onChange={e => setEndDate(e.target.value)}
                  className="bg-transparent border-none text-sm font-bold text-text-main focus:outline-none w-[120px]"
                />
              </div>
              
              {/* Sort Dropdown */}
              <div className="bg-surface rounded-2xl p-3 border border-gray-100 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">sort</span>
                <select 
                  value={sortBy} 
                  onChange={e => setSortBy(e.target.value)}
                  className="bg-transparent border-none text-sm font-bold text-text-main focus:outline-none cursor-pointer"
                >
                  <option value="quantity_desc">Jumlah Terbanyak</option>
                  <option value="date_asc">Berdasarkan Tanggal</option>
                </select>
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 text-sm font-medium px-4 py-3 rounded-2xl flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">error</span>
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Kolom Kiri: Daftar Bahan */}
            <div className="lg:col-span-8 space-y-6">
              
              {loading ? (
                <div className="flex items-center justify-center h-48">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-3 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                    <span className="text-muted text-sm font-bold">Memuat daftar belanja...</span>
                  </div>
                </div>
              ) : items.length === 0 ? (
                /* Empty State */
                <div className="flex flex-col items-center justify-center h-48 text-center bg-white rounded-3xl border border-gray-100 p-8">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-primary text-3xl">shopping_basket</span>
                  </div>
                  <h3 className="text-xl font-heading font-bold text-text-main mb-2">Belum ada bahan belanjaan</h3>
                  <p className="text-muted text-sm max-w-md">Generate menu terlebih dahulu di halaman Kalender, lalu kembali ke sini untuk melihat daftar bahan yang perlu dibeli.</p>
                </div>
              ) : (
                <div className="bg-white rounded-3xl p-2 border border-gray-100 shadow-sm">
                  <div className="flex flex-col">
                    {items.map((item, idx) => {
                      const isChecked = checkedItems.has(item.name);
                      return (
                        <label key={idx} className="group flex items-center justify-between p-4 hover:bg-surface rounded-2xl transition-colors cursor-pointer border-b border-gray-50 last:border-0">
                          <div className="flex items-center gap-4">
                            <input 
                              type="checkbox" 
                              checked={isChecked}
                              onChange={() => toggleCheck(item.name)}
                              className="w-6 h-6 rounded border-gray-300 text-primary focus:ring-primary/20 transition-all cursor-pointer"
                            />
                            <div className="flex flex-col">
                              <span className={`text-lg font-medium transition-all ${isChecked ? 'text-muted line-through' : 'text-text-main'}`}>
                                {item.name}
                              </span>
                              {item.source_meals.length > 0 && (
                                <span className="text-xs text-muted mt-0.5">
                                  {item.source_meals.join(" • ")}
                                </span>
                              )}
                            </div>
                          </div>
                          <span className="text-sm font-bold text-muted bg-surface px-4 py-1.5 rounded-full">
                            {item.qty}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Kolom Kanan: Ringkasan */}
            <aside className="lg:col-span-4 space-y-8">
              <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm sticky top-8">
                <h3 className="text-xl font-heading font-bold mb-8 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">shopping_basket</span>
                  Ringkasan Belanja
                </h3>
                
                {/* Stats */}
                <div className="bg-surface rounded-2xl p-5 mb-8 border border-gray-100">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-bold text-text-main text-sm">Total Bahan</span>
                    <span className="text-primary font-heading font-extrabold text-2xl">{totalCount}</span>
                  </div>
                  <div className="text-xs text-muted font-medium">
                    Dari rentang {new Date(startDate + "T00:00:00").toLocaleDateString("id-ID", { day: "numeric", month: "short" })} — {new Date(endDate + "T00:00:00").toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted font-medium">Barang Tercentang</span>
                    <span className="font-bold">{checkedCount} / {totalCount}</span>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full bg-surface h-2 rounded-full overflow-hidden">
                    <div className="bg-text-main h-full rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                  </div>
                </div>
                
                <button 
                  onClick={() => setCheckedItems(new Set(items.map(i => i.name)))}
                  className="w-full bg-primary hover:bg-primary-hover text-white rounded-full py-4 font-bold shadow-soft active:scale-95 transition-transform flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined">check_circle</span>
                  Centang Semua
                </button>
                
              </div>
            </aside>

          </div>
        </div>
      </div>
    </>
  );
}
