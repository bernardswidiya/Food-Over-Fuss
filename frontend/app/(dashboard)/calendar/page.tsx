"use client";

import { useState, useEffect } from "react";

export default function CalendarPage() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  // Hitung tanggal dinamis berdasarkan offset minggu
  const getWeekDays = (offset: number) => {
    const today = new Date();
    const dayOfWeek = today.getDay() || 7; // Jadikan Minggu sebagai hari ke-7
    const monday = new Date(today);
    monday.setDate(today.getDate() - dayOfWeek + 1 + (offset * 7));

    return Array.from({length: 7}).map((_, i) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      return {
        dayName: date.toLocaleDateString('id-ID', { weekday: 'short' }).toUpperCase().replace('.', ''),
        dateNum: date.getDate(),
        month: date.toLocaleDateString('id-ID', { month: 'long' }),
        year: date.getFullYear(),
        isToday: offset === 0 && date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear()
      };
    });
  };

  // Fallback untuk menghindari hydration error
  const weekDays = mounted ? getWeekDays(weekOffset) : Array.from({length: 7}).map((_, i) => ({
    dayName: ['SEN', 'SEL', 'RAB', 'KAM', 'JUM', 'SAB', 'MIN'][i],
    dateNum: 12 + i,
    month: 'Bulan',
    year: 2026,
    isToday: weekOffset === 0 && i === 2
  }));

  const firstDay = weekDays[0];
  const lastDay = weekDays[6];
  const monthYearStr = firstDay.month === lastDay.month 
    ? `${firstDay.month} ${firstDay.year}`
    : firstDay.year === lastDay.year 
      ? `${firstDay.month} - ${lastDay.month} ${firstDay.year}`
      : `${firstDay.month} ${firstDay.year} - ${lastDay.month} ${lastDay.year}`;

  // Fungsi Mockup untuk aksi tombol
  const handleRegenerateWeek = () => alert("Membangun ulang menu untuk 1 minggu penuh...");
  const handleRegenerateDay = (day: string) => alert(`Membangun ulang menu untuk hari ${day}...`);
  const handleRegenerateMeal = (meal: string) => alert(`Mencari alternatif untuk ${meal}...`);
  const handleClearMeal = (meal: string) => alert(`Mengosongkan jadwal ${meal}.`);

  return (
    <>

        {/* HEADER KALENDER & TOMBOL GENERATE WEEK */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between px-8 lg:px-10 py-8 shrink-0 gap-4">
          <div>
            <h2 className="text-text-main font-heading text-3xl md:text-4xl font-extrabold tracking-tight">Kalender Menu</h2>
            <p className="text-muted mt-1 text-sm font-medium">Atur, ganti, atau kosongkan jadwal makan mingguanmu.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            {/* Navigasi Minggu */}
            <div className="flex items-center gap-3 bg-white px-2 py-1.5 rounded-full border border-gray-100 shadow-sm w-full sm:w-auto justify-between">
              <button 
                onClick={() => setWeekOffset(w => w - 1)}
                className="w-9 h-9 rounded-full flex items-center justify-center text-muted hover:bg-surface hover:text-text-main transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">chevron_left</span>
              </button>
              <span className="font-bold text-[11px] min-w-[120px] text-center text-primary uppercase tracking-widest">
                {monthYearStr}
              </span>
              <button 
                onClick={() => setWeekOffset(w => w + 1)}
                className="w-9 h-9 rounded-full flex items-center justify-center text-muted hover:bg-surface hover:text-text-main transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">chevron_right</span>
              </button>
            </div>

            <button onClick={handleRegenerateWeek} className="flex items-center justify-center gap-2 rounded-full h-12 px-8 w-full sm:w-auto bg-primary hover:bg-primary-hover text-white font-bold transition-all shadow-soft hover:shadow-lg hover:-translate-y-1">
              <span className="material-symbols-outlined text-[20px]">magic_button</span>
              <span>Buat Menu Seminggu</span>
            </button>
          </div>
        </div>

        {/* AREA GRID KALENDER (Bisa di-scroll horizontal) */}
        <div className="flex-1 overflow-auto px-8 lg:px-10 pb-20">
          <div className="min-w-[1040px] px-10"> {/* px-10 memberi ruang di kiri dan kanan untuk label dan navigasi */}
            
            {/* BARIS HEADER HARI */}
            <div className="grid grid-cols-7 gap-4 mb-6 sticky top-0 bg-background-light z-20 pb-4 pt-4">
                {weekDays.map((day, i) => (
                  <div key={i} className="flex flex-col items-center group relative">
                    <span className="text-muted text-xs font-bold uppercase tracking-wider mb-2">{day.dayName}</span>
                    <div className={`size-10 rounded-full flex items-center justify-center font-heading font-extrabold text-lg mb-2 transition-colors ${day.isToday ? 'bg-primary text-white shadow-soft' : 'text-text-main hover:bg-surface'}`}>
                      {day.dateNum}
                    </div>
                    {/* Tombol Regenerate per Hari (Muncul saat header di-hover) */}
                    <button onClick={() => handleRegenerateDay(day.dayName)} className="absolute -top-2 -right-2 bg-white border border-gray-100 shadow-sm rounded-full p-1.5 text-primary opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary hover:text-white">
                       <span className="material-symbols-outlined text-[14px]">autorenew</span>
                    </button>
                  </div>
                ))}
            </div>

            <div className="flex flex-col gap-8">
              
              {/* BARIS SARAPAN */}
              <div className="relative">
                <div className="absolute -left-10 top-0 bottom-0 w-10 flex items-center justify-center">
                  <div className="-rotate-90 text-xs font-bold text-muted uppercase tracking-widest whitespace-nowrap">Sarapan</div>
                </div>
                <div className="grid grid-cols-7 gap-4">
                  {/* Card Makanan Terisi */}
                  <div className="bg-surface rounded-[20px] p-3 border border-transparent hover:border-primary/20 group relative overflow-hidden transition-all">
                    <div className="aspect-video rounded-xl bg-slate-200 mb-3 relative overflow-hidden">
                       <span className="absolute inset-0 flex items-center justify-center text-[10px] text-slate-400">Img</span>
                    </div>
                    <h4 className="font-bold text-sm text-text-main mb-1 truncate">Roti Alpukat</h4>
                    <span className="text-xs font-bold text-muted">450 Kkal</span>
                    
                    {/* Overlay Aksi Granular (Regenerate & Clear) */}
                    <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                       <button onClick={() => handleRegenerateMeal("Roti Alpukat")} className="w-10 h-10 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white flex items-center justify-center transition-colors" title="Ganti Menu Ini">
                         <span className="material-symbols-outlined text-[18px]">autorenew</span>
                       </button>
                       <button onClick={() => handleClearMeal("Roti Alpukat")} className="w-10 h-10 rounded-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors" title="Kosongkan">
                         <span className="material-symbols-outlined text-[18px]">delete</span>
                       </button>
                    </div>
                  </div>

                  {/* Card Kosong (Menunggu di-generate) */}
                  <div className="bg-surface/50 rounded-[20px] p-3 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center min-h-[140px] hover:border-primary hover:bg-primary/5 cursor-pointer transition-colors group">
                     <span className="material-symbols-outlined text-muted group-hover:text-primary text-3xl mb-1">add_circle</span>
                     <span className="text-xs font-bold text-muted group-hover:text-primary">Tambah Menu</span>
                  </div>
                  
                  {/* Placeholder Card Kosong untuk Kolom lainnya */}
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="bg-surface/50 rounded-[20px] p-3 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center min-h-[140px]"></div>
                  ))}
                </div>
              </div>

              {/* BARIS MAKAN SIANG */}
              <div className="relative">
                <div className="absolute -left-10 top-0 bottom-0 w-10 flex items-center justify-center">
                  <div className="-rotate-90 text-xs font-bold text-muted uppercase tracking-widest whitespace-nowrap">Makan Siang</div>
                </div>
                <div className="grid grid-cols-7 gap-4">
                  {/* Contoh Card Terisi */}
                  <div className="bg-surface rounded-[20px] p-3 border border-transparent hover:border-primary/20 group relative overflow-hidden transition-all">
                    <div className="aspect-video rounded-xl bg-slate-200 mb-3 relative overflow-hidden">
                       <span className="absolute inset-0 flex items-center justify-center text-[10px] text-slate-400">Img</span>
                    </div>
                    <h4 className="font-bold text-sm text-text-main mb-1 truncate">Salad Quinoa</h4>
                    <span className="text-xs font-bold text-muted">550 Kkal</span>
                    
                    <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                       <button onClick={() => handleRegenerateMeal("Salad Quinoa")} className="w-10 h-10 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white flex items-center justify-center transition-colors"><span className="material-symbols-outlined text-[18px]">autorenew</span></button>
                       <button onClick={() => handleClearMeal("Salad Quinoa")} className="w-10 h-10 rounded-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors"><span className="material-symbols-outlined text-[18px]">delete</span></button>
                    </div>
                  </div>
                  
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-surface/50 rounded-[20px] p-3 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center min-h-[140px]"></div>
                  ))}
                </div>
              </div>

              {/* BARIS MAKAN MALAM */}
              <div className="relative">
                <div className="absolute -left-10 top-0 bottom-0 w-10 flex items-center justify-center">
                  <div className="-rotate-90 text-xs font-bold text-muted uppercase tracking-widest whitespace-nowrap">Makan Malam</div>
                </div>
                <div className="grid grid-cols-7 gap-4">
                  {[...Array(7)].map((_, i) => (
                    <div key={i} className="bg-surface/50 rounded-[20px] p-3 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center min-h-[140px]"></div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
    </>
  );
}
