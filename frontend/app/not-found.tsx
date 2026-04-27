import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12 bg-gray-50 font-body overflow-hidden relative">
      
      {/* Dekorasi Background Ambient (Lingkaran hijau menyebar) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-5%] w-[40vw] h-[40vw] max-w-[600px] max-h-[600px] rounded-full bg-primary/10 blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[35vw] h-[35vw] max-w-[500px] max-h-[500px] rounded-full bg-primary/10 blur-[100px]"></div>
        <div className="absolute top-[30%] right-[10%] w-[25vw] h-[25vw] max-w-[400px] max-h-[400px] rounded-full bg-primary/5 blur-[80px]"></div>
        <div className="absolute bottom-[20%] left-[10%] w-[30vw] h-[30vw] max-w-[450px] max-h-[450px] rounded-full bg-primary/5 blur-[90px]"></div>
      </div>

      {/* Container Utama */}
      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-16 items-center bg-white/90 backdrop-blur-xl rounded-[40px] p-10 md:p-20 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] relative overflow-hidden z-10 border border-white/60">
        
        {/* SISI KIRI: Gambar Piring Kosong */}
        <div className="relative order-2 md:order-1 animate-fade-in">
          <div className="aspect-square w-full rounded-[32px] overflow-hidden bg-slate-100 flex items-center justify-center relative border border-white">
            <Image
              src="/notfound-preview.png"
              alt="Piring kosong - halaman nggak ditemukan"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-primary/5 z-20 pointer-events-none"></div>
          </div>
          
          {/* Aksen Ikon Garpu/Pisau di Pojok Gambar */}
          <div className="absolute -bottom-6 -left-6 bg-white p-5 rounded-2xl shadow-xl border border-gray-50/50">
            <span className="material-symbols-outlined text-primary text-4xl">restaurant</span>
          </div>
        </div>

        {/* SISI KANAN: Teks Konten */}
        <div className="flex flex-col items-start space-y-10 order-1 md:order-2">
          <div className="space-y-6 animate-fade-slide-up">
            <span className="text-primary font-heading font-bold tracking-widest text-base uppercase bg-primary/10 px-4 py-2 rounded-full inline-block">Error 404</span>
            <h1 className="text-5xl md:text-6xl font-heading font-extrabold text-text-main tracking-tighter leading-[1.1]">
              Waduh! Halamannya Keburu Dimakan
            </h1>
            <p className="text-xl text-muted leading-relaxed font-body">
              Halaman yang kamu cari nggak ketemu, nih. Mungkin lagi nyempil di balik kulkas?
            </p>
          </div>
          
          {/* Tombol Kembali ke Halaman Utama */}
          <div className="animate-fade-slide-up" style={{ animationDelay: '0.1s' }}>
            <Link 
              href="/dashboard" 
              className="bg-primary text-white px-8 py-4 rounded-full font-heading font-bold flex items-center justify-center gap-2 hover:bg-primary-hover shadow-soft hover:shadow-xl transition-all hover:-translate-y-1 active:scale-95"
            >
              Kembali ke Dashboard
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </Link>
          </div>
        </div>
      </div>


      
    </main>
  );
}
