"use client";

import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden relative">

        <div className="px-6 lg:px-10 py-8 max-w-7xl mx-auto">
          <div className="mb-10">
            <span className="text-primary font-bold text-sm tracking-widest uppercase mb-1 block">Menu Mingguanmu</span>
            <h2 className="text-4xl md:text-5xl font-heading font-extrabold tracking-tighter text-text-main">Dashboard</h2>
          </div>

          {/* Strip Kalender Mingguan */}
          <section className="mb-10">
            <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
              {['SEN', 'SEL', 'RAB', 'KAM', 'JUM', 'SAB', 'MIN'].map((day, i) => {
                const isActive = i === 2; 
                return (
                  <div key={day} className={`flex-none w-20 md:w-24 h-28 md:h-32 flex flex-col items-center justify-center rounded-2xl cursor-pointer transition-all ${isActive ? 'bg-primary text-white shadow-soft -mt-2 h-32 md:h-36' : 'bg-white text-muted hover:bg-gray-50 border border-gray-100'}`}>
                    <span className={`text-xs font-bold mb-1 ${isActive ? 'opacity-80' : ''}`}>{day}</span>
                    <span className="text-2xl font-heading font-extrabold">{12 + i}</span>
                    {isActive && <div className="mt-2 w-1.5 h-1.5 bg-white rounded-full"></div>}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Bento Grid (Makro & Menu) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* KOLOM KIRI: Statistik Makro */}
            <div className="lg:col-span-4 flex flex-col gap-8">
              <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
                <h3 className="text-xl font-heading font-bold mb-8">Nutrisi Harian</h3>
                <div className="flex items-center justify-center mb-10 relative">
                  <svg className="w-48 h-48 transform -rotate-90">
                    <circle className="text-gray-100" cx="96" cy="96" fill="transparent" r="88" stroke="currentColor" strokeWidth="12"></circle>
                    <circle className="text-primary" cx="96" cy="96" fill="transparent" r="88" stroke="currentColor" strokeDasharray="552.92" strokeDashoffset="165.87" strokeLinecap="round" strokeWidth="12"></circle>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-4xl font-heading font-extrabold">1.420</span>
                    <span className="text-xs text-muted font-bold uppercase tracking-widest mt-1">Sisa Kkal</span>
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2"><div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-primary"></div><span className="text-sm font-bold text-muted">Protein</span></div><span className="text-sm font-bold text-text-main">82g / 140g</span></div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden"><div className="bg-primary h-full w-[58%] rounded-full"></div></div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2"><div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-accent"></div><span className="text-sm font-bold text-muted">Karbo</span></div><span className="text-sm font-bold text-text-main">120g / 210g</span></div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden"><div className="bg-accent h-full w-[45%] rounded-full"></div></div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2"><div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-gray-400"></div><span className="text-sm font-bold text-muted">Lemak</span></div><span className="text-sm font-bold text-text-main">45g / 65g</span></div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden"><div className="bg-gray-400 h-full w-[70%] rounded-full"></div></div>
                  </div>
                </div>
              </div>
            </div>

            {/* KOLOM KANAN: Menu Makanan */}
            <div className="lg:col-span-8 space-y-6">
              <div className="px-2 mb-2">
                <h3 className="text-2xl font-heading font-bold tracking-tight">Menu Hari Ini</h3>
              </div>

              {/* Card Sarapan */}
              <Link href="/recipe/sarapan" className="group bg-white rounded-[24px] overflow-hidden flex flex-col md:flex-row shadow-sm hover:shadow-md transition-shadow border border-gray-100 cursor-pointer block">
                <div className="md:w-1/3 h-48 md:h-auto overflow-hidden bg-slate-100 flex items-center justify-center">
                  <span className="material-symbols-outlined text-6xl text-slate-300">egg_alt</span>
                </div>
                <div className="md:w-2/3 p-6 md:p-8 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3"><span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-extrabold uppercase tracking-widest rounded-full">Sarapan</span><span className="text-xs text-muted font-bold">08:00 WIB</span></div>
                    <h4 className="text-2xl font-heading font-bold mb-2 group-hover:text-primary transition-colors">Roti Bakar Alpukat Telur</h4>
                    <p className="text-muted text-sm line-clamp-2">Roti gandum utuh dengan alpukat tumbuk organik, telur rebus setengah matang, dan taburan cabai.</p>
                  </div>
                  <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
                    <div className="flex gap-4 md:gap-6"><div className="flex flex-col"><span className="text-[10px] text-muted uppercase font-bold">Protein</span><span className="text-text-main font-bold">18g</span></div><div className="flex flex-col"><span className="text-[10px] text-muted uppercase font-bold">Karbo</span><span className="text-text-main font-bold">32g</span></div><div className="flex flex-col"><span className="text-[10px] text-muted uppercase font-bold">Kalori</span><span className="text-primary font-bold">420 kkal</span></div></div>
                    <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-muted group-hover:bg-primary group-hover:text-white transition-all"><span className="material-symbols-outlined">chevron_right</span></div>
                  </div>
                </div>
              </Link>

              {/* Card Makan Siang */}
              <Link href="/recipe/makan-siang" className="group bg-white rounded-[24px] overflow-hidden flex flex-col md:flex-row shadow-sm hover:shadow-md transition-shadow border border-gray-100 cursor-pointer block">
                <div className="md:w-1/3 h-48 md:h-auto overflow-hidden bg-slate-100 flex items-center justify-center">
                  <span className="material-symbols-outlined text-6xl text-slate-300">restaurant</span>
                </div>
                <div className="md:w-2/3 p-6 md:p-8 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3"><span className="px-3 py-1 bg-accent/10 text-accent text-[10px] font-extrabold uppercase tracking-widest rounded-full">Makan Siang</span><span className="text-xs text-muted font-bold">12:30 WIB</span></div>
                    <h4 className="text-2xl font-heading font-bold mb-2 group-hover:text-primary transition-colors">Ayam Panggang Mediterania</h4>
                    <p className="text-muted text-sm line-clamp-2">Dada ayam panggang bumbu lemon dengan quinoa, sayuran panggang, dan saus tahini.</p>
                  </div>
                  <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
                    <div className="flex gap-4 md:gap-6"><div className="flex flex-col"><span className="text-[10px] text-muted uppercase font-bold">Protein</span><span className="text-text-main font-bold">42g</span></div><div className="flex flex-col"><span className="text-[10px] text-muted uppercase font-bold">Karbo</span><span className="text-text-main font-bold">55g</span></div><div className="flex flex-col"><span className="text-[10px] text-muted uppercase font-bold">Kalori</span><span className="text-primary font-bold">580 kkal</span></div></div>
                    <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-muted group-hover:bg-primary group-hover:text-white transition-all"><span className="material-symbols-outlined">chevron_right</span></div>
                  </div>
                </div>
              </Link>

              {/* Card Makan Malam */}
              <Link href="/recipe/makan-malam" className="group bg-white rounded-[24px] overflow-hidden flex flex-col md:flex-row shadow-sm hover:shadow-md transition-shadow border border-gray-100 cursor-pointer block">
                <div className="md:w-1/3 h-48 md:h-auto overflow-hidden bg-slate-100 flex items-center justify-center">
                  <span className="material-symbols-outlined text-6xl text-slate-300">dinner_dining</span>
                </div>
                <div className="md:w-2/3 p-6 md:p-8 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3"><span className="px-3 py-1 bg-blue-50 text-blue-500 text-[10px] font-extrabold uppercase tracking-widest rounded-full">Makan Malam</span><span className="text-xs text-muted font-bold">19:00 WIB</span></div>
                    <h4 className="text-2xl font-heading font-bold mb-2 group-hover:text-primary transition-colors">Salmon Teriyaki Bowl</h4>
                    <p className="text-muted text-sm line-clamp-2">Fillet salmon panggang dengan saus teriyaki homemade, nasi merah, edamame, dan acar mentimun.</p>
                  </div>
                  <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
                    <div className="flex gap-4 md:gap-6"><div className="flex flex-col"><span className="text-[10px] text-muted uppercase font-bold">Protein</span><span className="text-text-main font-bold">38g</span></div><div className="flex flex-col"><span className="text-[10px] text-muted uppercase font-bold">Karbo</span><span className="text-text-main font-bold">48g</span></div><div className="flex flex-col"><span className="text-[10px] text-muted uppercase font-bold">Kalori</span><span className="text-primary font-bold">520 kkal</span></div></div>
                    <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-muted group-hover:bg-primary group-hover:text-white transition-all"><span className="material-symbols-outlined">chevron_right</span></div>
                  </div>
                </div>
              </Link>

            </div>
          </div>
        </div>

        {/* Spacer buat mobile bottom nav */}
        <div className="h-24 md:hidden"></div>
    </div>
  );
}
