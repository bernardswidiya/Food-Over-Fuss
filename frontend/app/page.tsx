import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <>
      {/* Shared TopNavBar Component */}
      <div className="relative flex h-auto w-full flex-col bg-surface group/design-root overflow-x-hidden" style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}>
        <div className="layout-container flex h-full grow flex-col">
          <div className="px-4 md:px-8 lg:px-40 flex flex-1 justify-center py-5 max-w-360 mx-auto w-full">
            <div className="layout-content-container flex flex-col w-full flex-1">
              <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-gray-100 px-4 md:px-10 py-3">
                <div className="flex items-center gap-4 text-text-main">
                  <Image src="/Logo.png" alt="Food Over Fuss logo" width={32} height={32} className="h-8 w-8 rounded-sm object-contain" priority />
                  <h2 className="text-text-main text-lg font-bold leading-tight tracking-[-0.015em] font-heading">Food Over Fuss</h2>
                </div>
                <div className="flex flex-1 justify-end gap-8">
                  <div className="flex items-center gap-9 max-md:hidden">
                    <Link href="#features" className="text-text-main text-sm font-medium leading-normal hover:text-primary transition-colors">Features</Link>
                    <Link href="#pricing" className="text-text-main text-sm font-medium leading-normal hover:text-primary transition-colors">Pricing</Link>
                  </div>
                  <div className="flex gap-2">
                    <Link href="/register" className="flex min-w-21 max-w-120 cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-primary hover:bg-primary-hover text-white text-sm font-bold leading-normal tracking-[0.015em] transition-colors">
                      <span className="truncate">Sign Up</span>
                    </Link>
                    <Link href="/login" className="flex min-w-21 max-w-120 cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-gray-100 hover:bg-gray-200 text-text-main text-sm font-bold leading-normal tracking-[0.015em] transition-colors">
                      <span className="truncate">Log In</span>
                    </Link>
                  </div>
                </div>
              </header>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="grow flex flex-col items-center w-full">
        
        {/* Hero Section */}
        <section className="w-full max-w-300 mx-auto px-6 pt-24 pb-16 flex flex-col items-center text-center">
          <h1 className="font-heading font-bold text-5xl md:text-6xl text-text-main mb-6 tracking-tight max-w-4xl leading-tight">
            Eat Well. Zero Fuss.
          </h1>
          <p className="font-body text-lg text-muted max-w-2xl mb-10">
            Automates weekly menus, generates categorized grocery lists, and tracks macros—all wrapped in a hyper-clean interface.
          </p>
          <Link href="/register" className="bg-primary hover:bg-primary-hover text-white font-heading font-semibold text-lg px-8 py-4 rounded-full shadow-soft transition-all duration-300 hover:scale-105 mb-20 flex items-center gap-2 group">
            Build My Menu
            <span className="material-symbols-outlined text-xl transition-transform group-hover:translate-x-1">arrow_forward</span>
          </Link>

          {/* App Preview Mockup */}
          <div className="w-full max-w-5xl rounded-[28px] overflow-hidden border border-gray-200 bg-white p-4 shadow-soft">
            <div className="relative mx-auto aspect-2283/1446 w-full overflow-hidden rounded-[20px] bg-slate-50">
              <Image
                src="/dashboard-preview.png"
                alt="Food Over Fuss dashboard preview"
                fill
                className="object-contain object-center"
                sizes="(max-width: 768px) 100vw, 1200px"
                priority
              />
              <div className="absolute inset-0 z-20 pointer-events-none rounded-[20px] border-8 border-white/50 mix-blend-overlay"></div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="w-full bg-white py-24 px-6">
          <div className="max-w-300 mx-auto">
            <div className="text-center mb-16">
              <h2 className="font-heading font-bold text-3xl md:text-4xl text-text-main mb-4">Everything you need, nothing you don't.</h2>
              <p className="font-body text-muted text-lg max-w-2xl mx-auto">Streamline your nutrition with tools designed to eliminate the cognitive load of eating well.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 justify-items-center">
              {/* Feature Card 1 */}
              <div className="bg-surface rounded-[24px] p-8 w-full max-w-85 flex flex-col items-start border border-gray-100 hover:shadow-soft transition-shadow duration-300">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-6 text-primary">
                  <span className="material-symbols-outlined text-2xl">calendar_month</span>
                </div>
                <h3 className="font-heading font-bold text-xl text-text-main mb-3">Automated Weekly Menus</h3>
                <p className="font-body text-muted leading-relaxed">Get a custom daily menu tailored to your goals instantly. No more staring blankly at the fridge.</p>
              </div>

              {/* Feature Card 2 */}
              <div className="bg-surface rounded-[24px] p-8 w-full max-w-85 flex flex-col items-start border border-gray-100 hover:shadow-soft transition-shadow duration-300">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-6 text-accent">
                  <span className="material-symbols-outlined text-2xl">shopping_cart</span>
                </div>
                <h3 className="font-heading font-bold text-xl text-text-main mb-3">Dynamic Grocery Lists</h3>
                <p className="font-body text-muted leading-relaxed">Interactive checklists categorized by supermarket aisle, complete with cost tracking to fit your budget.</p>
              </div>

              {/* Feature Card 3 */}
              <div className="bg-surface rounded-[24px] p-8 w-full max-w-85 flex flex-col items-start border border-gray-100 hover:shadow-soft transition-shadow duration-300">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-6 text-primary">
                  <span className="material-symbols-outlined text-2xl">pie_chart</span>
                </div>
                <h3 className="font-heading font-bold text-xl text-text-main mb-3">Effortless Macro Tracking</h3>
                <p className="font-body text-muted leading-relaxed">Visual rings tracking your daily Protein, Carbs, and Fat without the spreadsheet complexity.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}