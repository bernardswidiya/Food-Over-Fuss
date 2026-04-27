"use client";

import { useRouter } from "next/navigation";

export default function RecipeDetailPage() {
  const router = useRouter();

  return (
    <div className="bg-background-light min-h-screen text-text-main flex flex-col font-body pb-20">
      {/* Header Minimalis untuk Tampilan Fokus */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-gray-100 bg-white sticky top-0 z-50">
        <button 
          onClick={() => router.back()} 
          className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-surface transition-colors text-text-main"
        >
          <span className="material-symbols-outlined text-2xl">arrow_back</span>
        </button>
        <div className="flex gap-3 items-center">
          <div className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>restaurant</span>
            Makan Malam
          </div>
          <div className="text-muted text-sm font-bold">Kamis, 24 Okt</div>
        </div>
        <div className="w-10"></div> {/* Spacer agar posisi tengah seimbang */}
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          
          {/* KOLOM KIRI: Hero Image & Bahan-bahan */}
          <div className="w-full lg:w-5/12 flex flex-col gap-8">
            
            {/* Hero Image */}
            <div className="w-full relative rounded-2xl overflow-hidden shadow-soft group bg-slate-200">
              {/* Gunakan Image Placeholder atau Foto Asli */}
              <div className="h-80 w-full flex items-center justify-center text-slate-400 font-medium">
                Gambar Resep Placeholder
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none"></div>
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold text-text-main flex items-center gap-1.5 shadow-sm">
                  <span className="material-symbols-outlined text-[14px] text-muted">schedule</span>
                  35 Menit
                </div>
              </div>
            </div>

            {/* Header Resep & Makro */}
            <div className="flex flex-col gap-5">
              <h1 className="font-heading text-4xl lg:text-5xl font-extrabold leading-tight text-text-main tracking-tight">
                Ayam Panggang Bumbu Lemon
              </h1>
              
              {/* Kotak Makro */}
              <div className="flex flex-wrap gap-3">
                <div className="bg-surface px-4 py-2 rounded-2xl flex flex-col items-center justify-center min-w-[80px] border border-gray-100">
                  <span className="text-xs text-muted font-bold uppercase tracking-widest mb-0.5">Kkal</span>
                  <span className="font-heading font-extrabold text-lg">450</span>
                </div>
                <div className="bg-primary/10 px-4 py-2 rounded-2xl flex flex-col items-center justify-center min-w-[80px] border border-primary/20">
                  <span className="text-xs text-primary font-bold uppercase tracking-widest mb-0.5">Protein</span>
                  <span className="font-heading font-extrabold text-lg text-primary">42g</span>
                </div>
                <div className="bg-surface px-4 py-2 rounded-2xl flex flex-col items-center justify-center min-w-[80px] border border-gray-100">
                  <span className="text-xs text-muted font-bold uppercase tracking-widest mb-0.5">Karbo</span>
                  <span className="font-heading font-extrabold text-lg">35g</span>
                </div>
                <div className="bg-accent/10 px-4 py-2 rounded-2xl flex flex-col items-center justify-center min-w-[80px] border border-accent/20">
                  <span className="text-xs text-accent font-bold uppercase tracking-widest mb-0.5">Lemak</span>
                  <span className="font-heading font-extrabold text-lg text-accent">16g</span>
                </div>
              </div>
            </div>

            {/* Bahan-bahan */}
            <div className="bg-surface p-6 lg:p-8 rounded-[24px] flex flex-col gap-6 mt-2 border border-gray-100">
              <h2 className="font-heading text-2xl font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">shopping_basket</span>
                Bahan-bahan
              </h2>
              <ul className="flex flex-col gap-4">
                <li className="flex items-center justify-between pb-3 border-b border-gray-200 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <span className="font-bold">Dada Ayam</span>
                  </div>
                  <span className="text-muted text-sm font-medium">170 g</span>
                </li>
                <li className="flex items-center justify-between pb-3 border-b border-gray-200 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <span className="font-bold">Quinoa</span>
                  </div>
                  <span className="text-muted text-sm font-medium">100 g</span>
                </li>
                <li className="flex items-center justify-between pb-3 border-b border-gray-200 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <span className="font-bold">Alpukat</span>
                  </div>
                  <span className="text-muted text-sm font-medium">1/4 buah</span>
                </li>
                <li className="flex items-center justify-between pb-3 border-b border-gray-200 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <span className="font-bold">Sayuran Hijau</span>
                  </div>
                  <span className="text-muted text-sm font-medium">2 genggam</span>
                </li>
                <li className="flex items-center justify-between pb-3 border-b border-gray-200 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <span className="font-bold">Jus Lemon</span>
                  </div>
                  <span className="text-muted text-sm font-medium">2 sdm</span>
                </li>
                <li className="flex items-center justify-between pb-3 border-b border-gray-200 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <span className="font-bold">Minyak Zaitun</span>
                  </div>
                  <span className="text-muted text-sm font-medium">1 sdm</span>
                </li>
              </ul>
            </div>
          </div>

          {/* KOLOM KANAN: Instruksi & Alternatif Menu */}
          <div className="w-full lg:w-7/12 flex flex-col gap-10 mt-4 lg:mt-0">
            
            {/* Bar Aksi (Swap Menu) */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-surface p-2 pr-6 rounded-full border border-gray-100">
              <div className="flex items-center gap-3 pl-2">
                <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">restaurant_menu</span>
                </div>
                <span className="font-bold text-sm">Kurang suka menu ini?</span>
              </div>
              <button className="bg-white border border-gray-200 hover:border-primary hover:text-primary text-text-main font-bold py-2.5 px-6 rounded-full transition-all duration-200 flex items-center gap-2 shadow-sm">
                <span className="material-symbols-outlined text-[18px]">swap_horiz</span>
                Cari Pengganti
              </button>
            </div>

            {/* Instruksi Memasak */}
            <div className="flex flex-col gap-8">
              <h2 className="font-heading text-2xl font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-accent">local_fire_department</span>
                Cara Membuat
              </h2>
              
              <div className="flex flex-col gap-8">
                {/* Langkah 1 */}
                <div className="flex gap-5 group">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-surface text-muted font-heading font-extrabold flex items-center justify-center text-lg border-2 border-transparent group-hover:border-primary group-hover:text-primary group-hover:bg-primary/5 transition-all">
                      1
                    </div>
                  </div>
                  <div className="pt-2">
                    <h3 className="font-heading font-bold text-lg mb-2">Marinasi Ayam</h3>
                    <p className="text-muted leading-relaxed">Siapkan mangkuk, campurkan minyak zaitun, setengah porsi jus lemon, garam, dan lada. Masukkan dada ayam dan biarkan termarinasi minimal 15 menit sambil menyiapkan bahan lain.</p>
                  </div>
                </div>

                {/* Langkah 2 */}
                <div className="flex gap-5 group">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-surface text-muted font-heading font-extrabold flex items-center justify-center text-lg border-2 border-transparent group-hover:border-primary group-hover:text-primary group-hover:bg-primary/5 transition-all">
                      2
                    </div>
                  </div>
                  <div className="pt-2">
                    <h3 className="font-heading font-bold text-lg mb-2">Masak Quinoa</h3>
                    <p className="text-muted leading-relaxed">Bilas quinoa dengan air dingin. Rebus air, masukkan quinoa, kecilkan api, tutup panci, dan masak perlahan selama 15 menit hingga air menyusut. Aduk perlahan dengan garpu.</p>
                  </div>
                </div>

                {/* Langkah 3 */}
                <div className="flex gap-5 group">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-surface text-muted font-heading font-extrabold flex items-center justify-center text-lg border-2 border-transparent group-hover:border-primary group-hover:text-primary group-hover:bg-primary/5 transition-all">
                      3
                    </div>
                  </div>
                  <div className="pt-2">
                    <h3 className="font-heading font-bold text-lg mb-2">Panggang Ayam</h3>
                    <p className="text-muted leading-relaxed">Panaskan wajan anti lengket dengan api sedang. Panggang ayam yang sudah dimarinasi selama 6-7 menit di setiap sisi hingga matang sempurna. Angkat dan diamkan 5 menit sebelum diiris.</p>
                  </div>
                </div>

                {/* Langkah 4 */}
                <div className="flex gap-5 group">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-surface text-muted font-heading font-extrabold flex items-center justify-center text-lg border-2 border-transparent group-hover:border-primary group-hover:text-primary group-hover:bg-primary/5 transition-all">
                      4
                    </div>
                  </div>
                  <div className="pt-2">
                    <h3 className="font-heading font-bold text-lg mb-2">Penyajian</h3>
                    <p className="text-muted leading-relaxed">Tata sayuran hijau di mangkuk. Tambahkan quinoa matang, irisan ayam panggang, dan potongan alpukat. Siram dengan sisa jus lemon dan hidangkan segera.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Alternatif Menu (Sesuai Makro) */}
            <div className="mt-8 pt-8 border-t border-gray-100 flex flex-col gap-6 overflow-hidden">
              <div className="flex justify-between items-end">
                <div>
                  <h2 className="font-heading text-xl font-bold mb-1">Alternatif Sesuai Makro</h2>
                  <p className="text-sm text-muted">Nutrisi setara, rasa berbeda.</p>
                </div>
              </div>
              
              {/* Scroll Horizontal Container */}
              <div className="flex gap-4 overflow-x-auto pb-6 no-scrollbar snap-x snap-mandatory">
                
                {/* Swap Card 1 */}
                <div className="min-w-[260px] w-[260px] bg-white border border-gray-100 rounded-[24px] p-3 shadow-sm hover:shadow-soft transition-all cursor-pointer group snap-start shrink-0 flex flex-col gap-3">
                  <div className="w-full h-32 rounded-xl overflow-hidden relative bg-slate-200">
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <span className="material-symbols-outlined text-primary text-[18px]">swap_horiz</span>
                    </div>
                  </div>
                  <div className="px-1">
                    <h4 className="font-heading font-bold text-base mb-2 truncate">Salmon & Asparagus</h4>
                    <div className="flex gap-2 text-[11px] font-bold">
                      <span className="bg-surface px-2.5 py-1 rounded-full text-muted">480 Kkal</span>
                      <span className="bg-primary/10 text-primary px-2.5 py-1 rounded-full">38g Protein</span>
                    </div>
                  </div>
                </div>

                {/* Swap Card 2 */}
                <div className="min-w-[260px] w-[260px] bg-white border border-gray-100 rounded-[24px] p-3 shadow-sm hover:shadow-soft transition-all cursor-pointer group snap-start shrink-0 flex flex-col gap-3">
                  <div className="w-full h-32 rounded-xl overflow-hidden relative bg-slate-200">
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <span className="material-symbols-outlined text-primary text-[18px]">swap_horiz</span>
                    </div>
                  </div>
                  <div className="px-1">
                    <h4 className="font-heading font-bold text-base mb-2 truncate">Zoodles Bola Daging</h4>
                    <div className="flex gap-2 text-[11px] font-bold">
                      <span className="bg-surface px-2.5 py-1 rounded-full text-muted">410 Kkal</span>
                      <span className="bg-primary/10 text-primary px-2.5 py-1 rounded-full">40g Protein</span>
                    </div>
                  </div>
                </div>

                {/* Swap Card 3 */}
                <div className="min-w-[260px] w-[260px] bg-white border border-gray-100 rounded-[24px] p-3 shadow-sm hover:shadow-soft transition-all cursor-pointer group snap-start shrink-0 flex flex-col gap-3">
                  <div className="w-full h-32 rounded-xl overflow-hidden relative bg-slate-200">
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <span className="material-symbols-outlined text-primary text-[18px]">swap_horiz</span>
                    </div>
                  </div>
                  <div className="px-1">
                    <h4 className="font-heading font-bold text-base mb-2 truncate">Tumis Tahu Pedas</h4>
                    <div className="flex gap-2 text-[11px] font-bold">
                      <span className="bg-surface px-2.5 py-1 rounded-full text-muted">430 Kkal</span>
                      <span className="bg-primary/10 text-primary px-2.5 py-1 rounded-full">35g Protein</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
