import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="bg-background-light font-body text-text-main antialiased selection:bg-primary/20">
      {/* Navbar - Simplified */}
      <nav className="sticky top-0 w-full z-50 bg-white/80 backdrop-blur-md shadow-sm flex justify-between items-center px-6 md:px-12 lg:px-24 py-4 transition-all">
        <Link href="/" className="flex items-center gap-3 group">
          <Image src="/Logo.png" alt="Food Over Fuss logo" width={32} height={32} className="h-8 w-8 object-contain transition-transform group-hover:scale-105" priority />
          <span className="text-xl font-bold text-text-main font-heading tracking-tight">Food Over Fuss</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/register" className="flex items-center justify-center rounded-full h-10 px-6 bg-primary hover:bg-primary-hover text-white text-sm font-bold transition-all shadow-soft hover:shadow-lg hover:-translate-y-0.5">
            Daftar
          </Link>
          <Link href="/login" className="flex items-center justify-center rounded-full h-10 px-6 bg-surface border border-gray-200 hover:bg-gray-50 text-text-main text-sm font-bold transition-all">
            Masuk
          </Link>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative min-h-[85vh] flex items-center overflow-hidden px-6 md:px-12 lg:px-24 py-20">
          <div className="container mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="col-span-1 lg:col-span-6 z-10">
              <div className="mb-6 inline-flex items-center px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-bold tracking-tight border border-primary/20">
                <span className="material-symbols-outlined text-sm mr-2">auto_awesome</span>
                Revolusi Masak di Rumah
              </div>
              <h1 className="font-heading text-6xl md:text-7xl lg:text-8xl font-extrabold text-text-main tracking-tighter leading-[1.05] mb-8">
                Makan Enak. <br />
                <span className="text-primary">Tanpa Ribet.</span>
              </h1>
              <p className="text-muted text-xl md:text-2xl leading-relaxed mb-10 max-w-lg">
                Bye-bye bingung mau masak apa. Kami kurasi menu profesional yang cocok sama gaya hidup, dapur, dan selera kamu.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/register" className="bg-primary hover:bg-primary-hover text-white px-10 py-5 rounded-full font-bold text-lg text-center shadow-soft hover:shadow-xl transition-all hover:-translate-y-1">
                  Bikin Menu Sekarang
                </Link>
              </div>
            </div>

            <div className="col-span-1 lg:col-span-6 relative mt-12 lg:mt-0">
              <div className="relative w-full aspect-square rounded-[32px] overflow-hidden shadow-2xl">
                <Image
                  src="/landing-preview1.png"
                  alt="Sajian makanan sehat yang menggugah selera"
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent z-20 pointer-events-none"></div>
              </div>
              
              {/* Floating Editorial Card */}
              <div className="absolute -bottom-6 -left-6 md:-left-12 bg-white p-6 rounded-2xl shadow-xl max-w-xs border border-gray-100 z-30 animate-fade-slide-up">
                <div className="flex gap-4 items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
                    <span className="material-symbols-outlined text-slate-400">person</span>
                  </div>
                  <div>
                    <p className="font-heading font-bold text-text-main leading-tight">Catatan Chef</p>
                    <p className="text-xs text-primary font-bold tracking-wide uppercase">Pilihan Minggu Ini</p>
                  </div>
                </div>
                <p className="text-sm text-muted italic leading-relaxed">&ldquo;Fokus minggu ini: menu tinggi protein, prep cuma 20 menit, tapi tetap kaya rasa dari seluruh dunia.&rdquo;</p>
              </div>
            </div>

          </div>
          {/* Abstract background shape */}
          <div className="absolute -right-40 top-20 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl -z-10"></div>
        </section>

        {/* Features Grid */}
        <section id="features" className="w-full bg-white py-24 px-6 md:px-12 lg:px-24">
          <div className="container mx-auto">
            <div className="max-w-2xl mb-16">
              <p className="text-primary font-bold tracking-widest text-sm uppercase mb-4">Fitur Unggulan</p>
              <h2 className="font-heading text-4xl md:text-5xl font-extrabold tracking-tight text-text-main">Semua yang kamu butuhkan, tanpa yang nggak perlu.</h2>
              <p className="font-body text-muted text-lg mt-4">Permudah nutrisimu dengan tools yang didesain biar kamu nggak pusing mikirin makan sehat.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature Card 1 */}
              <div className="bg-surface rounded-[24px] p-8 lg:p-10 flex flex-col items-start border border-gray-100 hover:shadow-soft transition-all duration-300 hover:-translate-y-2">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-8 text-primary">
                  <span className="material-symbols-outlined text-3xl">calendar_month</span>
                </div>
                <h3 className="font-heading font-bold text-2xl text-text-main mb-4">Menu Mingguan Otomatis</h3>
                <p className="font-body text-muted leading-relaxed text-lg">Dapetin menu harian yang pas sama tujuanmu secara instan. Nggak perlu lagi bengong di depan kulkas.</p>
              </div>

              {/* Feature Card 2 */}
              <div className="bg-surface rounded-[24px] p-8 lg:p-10 flex flex-col items-start border border-gray-100 hover:shadow-soft transition-all duration-300 hover:-translate-y-2">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-8 text-accent">
                  <span className="material-symbols-outlined text-3xl">shopping_cart</span>
                </div>
                <h3 className="font-heading font-bold text-2xl text-text-main mb-4">Daftar Belanja Pintar</h3>
                <p className="font-body text-muted leading-relaxed text-lg">Checklist interaktif yang udah dikelompokin per rak supermarket, lengkap sama estimasi biaya biar tetap hemat.</p>
              </div>

              {/* Feature Card 3 */}
              <div className="bg-surface rounded-[24px] p-8 lg:p-10 flex flex-col items-start border border-gray-100 hover:shadow-soft transition-all duration-300 hover:-translate-y-2">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-8 text-primary">
                  <span className="material-symbols-outlined text-3xl">pie_chart</span>
                </div>
                <h3 className="font-heading font-bold text-2xl text-text-main mb-4">Tracking Makro Anti Ribet</h3>
                <p className="font-body text-muted leading-relaxed text-lg">Visual ring buat lacak Protein, Karbo, dan Lemak harianmu tanpa perlu buka spreadsheet.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Bento Grid */}
        <section className="py-24 px-6 md:px-12 lg:px-24 overflow-hidden bg-background-light">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              <div className="col-span-1 lg:col-span-8 rounded-[32px] overflow-hidden h-[500px] relative group border border-gray-100">
                <Image
                  src="/landing-preview2.png"
                  alt="Autumn Harvest Bowl - Menu Favorit"
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 768px) 100vw, 66vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-20"></div>
                <div className="absolute bottom-10 left-10 text-white z-30">
                  <span className="bg-primary text-white px-4 py-1.5 rounded-full text-xs font-bold mb-4 inline-block tracking-widest uppercase">Lagi Trending</span>
                  <h3 className="text-4xl md:text-5xl font-heading font-bold mb-3">Autumn Harvest Bowl</h3>
                  <p className="text-white/90 max-w-md text-lg">Perpaduan sempurna antara manisnya panggang dan segarnya sayuran hijau buat makan siang kamu.</p>
                </div>
              </div>
              
              <div className="col-span-1 lg:col-span-4 flex flex-col gap-6">
                <div className="flex-1 bg-primary text-white p-10 rounded-[32px] flex flex-col justify-center shadow-soft relative overflow-hidden">
                  <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                  <h4 className="text-3xl font-heading font-bold mb-4">Gabung 50rb+ Pengguna</h4>
                  <p className="text-white/90 mb-8 text-lg">Rasakan transformasi dapurmu jadi pusat kuliner yang next level.</p>
                  <Link href="/register" className="text-white font-bold inline-flex items-center group text-lg w-fit">
                    Mulai Sekarang 
                    <span className="material-symbols-outlined ml-2 transition-transform group-hover:translate-x-2">arrow_forward</span>
                  </Link>
                </div>
                
                <div className="flex-1 bg-white border border-gray-100 p-10 rounded-[32px] relative overflow-hidden shadow-sm">
                  <span className="material-symbols-outlined text-primary absolute -right-6 -top-6 text-9xl opacity-5">local_fire_department</span>
                  <p className="text-muted font-bold tracking-widest text-sm uppercase mb-2">Target Mingguan</p>
                  <p className="text-4xl font-heading font-extrabold text-text-main">12 Resep Baru</p>
                  <p className="text-sm text-primary mt-4 font-bold flex items-center bg-primary/10 w-fit px-3 py-1 rounded-full">
                    <span className="material-symbols-outlined text-sm mr-1">trending_up</span>
                    +14% dari minggu lalu
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-6 md:px-12 lg:px-24 bg-white">
          <div className="container mx-auto max-w-5xl text-center bg-background-light py-20 px-10 rounded-[40px] relative overflow-hidden border border-gray-100">
            <div className="absolute top-0 left-0 w-full h-2 bg-primary"></div>
            <h2 className="font-heading text-4xl md:text-6xl font-extrabold text-text-main mb-6 tracking-tighter">Siap hidup tanpa ribet?</h2>
            <p className="text-muted text-xl mb-12 max-w-2xl mx-auto">
              Ambil kembali waktu malammu. Mulai perjalananmu bareng Food Over Fuss dan rasakan serunya hidup sehat tanpa drama.
            </p>
            <div className="flex justify-center">
              <Link href="/register" className="bg-primary text-white px-12 py-5 rounded-full font-bold text-xl hover:bg-primary-hover shadow-soft hover:shadow-xl transition-all hover:-translate-y-1">
                Bikin Menu Sekarang
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white py-16 px-6 md:px-12 lg:px-24 border-t border-gray-100">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-12 gap-12">
          
          <div className="col-span-1 md:col-span-6">
            <Link href="/" className="flex items-center gap-3 mb-6">
              <Image src="/Logo.png" alt="Food Over Fuss logo" width={24} height={24} className="h-6 w-6 object-contain" />
              <span className="text-xl font-bold text-text-main font-heading tracking-tight">Food Over Fuss</span>
            </Link>
            <p className="text-muted leading-relaxed mb-8 max-w-sm">
              Mengubah ritual makan harianmu lewat perencanaan pintar dan kurasi AI. Gratis sepenuhnya.
            </p>
          </div>
          
          <div className="col-span-1 md:col-span-3">
            <h5 className="font-heading font-bold text-text-main mb-6">Platform</h5>
            <ul className="space-y-4 text-muted text-sm font-medium">
              <li><Link href="#" className="hover:text-primary transition-colors">Jelajahi Menu</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Rencana Makan</Link></li>
            </ul>
          </div>
          
          <div className="col-span-1 md:col-span-3">
            <h5 className="font-heading font-bold text-text-main mb-6">Sumber Daya</h5>
            <ul className="space-y-4 text-muted text-sm font-medium">
              <li><Link href="#" className="hover:text-primary transition-colors">Jurnal</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Pusat Bantuan</Link></li>
            </ul>
          </div>

        </div>
        
        <div className="container mx-auto mt-16 pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted font-medium">© 2026 Food Over Fuss. Hak cipta dilindungi.</p>
          <div className="flex gap-8 text-sm text-muted font-medium">
            <Link href="#" className="hover:text-primary transition-colors">Kebijakan Privasi</Link>
            <Link href="#" className="hover:text-primary transition-colors">Syarat & Ketentuan</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}