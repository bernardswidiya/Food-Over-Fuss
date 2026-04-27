"use client";

import { useState } from "react";

export default function GroceryListPage() {

  // State untuk Checklist Barang (Simulasi)
  const [items, setItems] = useState([
    { id: 1, name: "Bayam Organik", qty: "2 Ikat", category: "produce", checked: false },
    { id: 2, name: "Tomat Ceri", qty: "500 gram", category: "produce", checked: true },
    { id: 3, name: "Alpukat (Matang)", qty: "3 Buah", category: "produce", checked: false },
    { id: 4, name: "Yogurt Tanpa Rasa", qty: "1 Liter", category: "dairy", checked: false },
    { id: 5, name: "Roti Gandum Utuh", qty: "1 Bungkus", category: "dairy", checked: false },
    { id: 6, name: "Minyak Zaitun", qty: "500 ml", category: "dairy", checked: true },
  ]);

  const toggleCheck = (id: number) => {
    setItems(items.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  const checkedCount = items.filter(i => i.checked).length;
  const totalCount = items.length;
  const progress = (checkedCount / totalCount) * 100;

  return (
    <>
        {/* AREA DAFTAR BELANJA */}
        <div className="flex-1 overflow-y-auto px-6 lg:px-10 py-8">
          <div className="max-w-6xl mx-auto">
            
            {/* Judul & Filter Tanggal */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
              <div className="space-y-1">
                <span className="text-primary font-bold text-sm tracking-widest uppercase block">Kebutuhan Dapur</span>
                <h1 className="text-4xl md:text-5xl font-heading font-extrabold tracking-tighter text-text-main">Daftar Belanja</h1>
              </div>
              
              {/* Filter Rentang Tanggal yang Baru */}
              <div className="bg-surface rounded-2xl p-4 border border-gray-100 flex flex-col gap-2 min-w-[280px]">
                <span className="text-xs font-bold text-muted uppercase tracking-wider">Pilih Rentang Waktu</span>
                <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-gray-200 cursor-pointer hover:border-primary transition-colors">
                  <span className="material-symbols-outlined text-primary">date_range</span>
                  <div className="flex-1 flex justify-between items-center text-sm font-bold">
                    <span>Sen, 12 Okt</span>
                    <span className="text-muted text-xs mx-2">s/d</span>
                    <span>Min, 18 Okt</span>
                  </div>
                  <span className="material-symbols-outlined text-muted text-[18px]">expand_more</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Kolom Kiri: Kategori Barang */}
              <div className="lg:col-span-8 space-y-10">
                
                {/* Kategori: Sayuran & Buah */}
                <section>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary">eco</span>
                    </div>
                    <h2 className="text-2xl font-heading font-bold tracking-tight">Sayuran & Buah</h2>
                  </div>
                  
                  <div className="bg-white rounded-3xl p-2 border border-gray-100 shadow-sm">
                    <div className="flex flex-col">
                      {items.filter(i => i.category === "produce").map(item => (
                        <label key={item.id} className="group flex items-center justify-between p-4 hover:bg-surface rounded-2xl transition-colors cursor-pointer border-b border-gray-50 last:border-0">
                          <div className="flex items-center gap-4">
                            <input 
                              type="checkbox" 
                              checked={item.checked}
                              onChange={() => toggleCheck(item.id)}
                              className="w-6 h-6 rounded border-gray-300 text-primary focus:ring-primary/20 transition-all cursor-pointer"
                            />
                            <span className={`text-lg font-medium transition-all ${item.checked ? 'text-muted line-through' : 'text-text-main'}`}>
                              {item.name}
                            </span>
                          </div>
                          <span className="text-sm font-bold text-muted bg-surface px-4 py-1.5 rounded-full">
                            {item.qty}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </section>

                {/* Kategori: Produk Susu & Dapur */}
                <section>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-accent">bakery_dining</span>
                    </div>
                    <h2 className="text-2xl font-heading font-bold tracking-tight">Susu & Kebutuhan Dapur</h2>
                  </div>
                  
                  <div className="bg-white rounded-3xl p-2 border border-gray-100 shadow-sm">
                    <div className="flex flex-col">
                      {items.filter(i => i.category === "dairy").map(item => (
                        <label key={item.id} className="group flex items-center justify-between p-4 hover:bg-surface rounded-2xl transition-colors cursor-pointer border-b border-gray-50 last:border-0">
                          <div className="flex items-center gap-4">
                            <input 
                              type="checkbox" 
                              checked={item.checked}
                              onChange={() => toggleCheck(item.id)}
                              className="w-6 h-6 rounded border-gray-300 text-primary focus:ring-primary/20 transition-all cursor-pointer"
                            />
                            <span className={`text-lg font-medium transition-all ${item.checked ? 'text-muted line-through' : 'text-text-main'}`}>
                              {item.name}
                            </span>
                          </div>
                          <span className="text-sm font-bold text-muted bg-surface px-4 py-1.5 rounded-full">
                            {item.qty}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </section>
              </div>

              {/* Kolom Kanan: Ringkasan Keranjang */}
              <aside className="lg:col-span-4 space-y-8">
                <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm sticky top-8">
                  <h3 className="text-xl font-heading font-bold mb-8 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">shopping_basket</span>
                    Ringkasan Keranjang
                  </h3>
                  
                  {/* Kalkulasi Harga & Anggaran */}
                  <div className="bg-surface rounded-2xl p-5 mb-8 border border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-bold text-text-main text-sm">Estimasi Biaya</span>
                      <span className="text-primary font-heading font-extrabold text-2xl">Rp 215.000</span>
                    </div>
                    <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden mb-2">
                      {/* Asumsi budget Rp 300.000 dari onboarding */}
                      <div className="bg-primary h-full rounded-full" style={{ width: '71%' }}></div> 
                    </div>
                    <div className="flex justify-between text-xs font-bold text-muted">
                      <span>Rp 0</span>
                      <span>Anggaran: Rp 300.000</span>
                    </div>
                  </div>

                  <div className="space-y-4 mb-8">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted font-medium">Barang Tercentang</span>
                      <span className="font-bold">{checkedCount} / {totalCount}</span>
                    </div>
                    {/* Progress Bar Items */}
                    <div className="w-full bg-surface h-2 rounded-full overflow-hidden">
                       <div className="bg-text-main h-full rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                    </div>
                  </div>
                  
                  <button className="w-full bg-primary hover:bg-primary-hover text-white rounded-full py-4 font-bold shadow-soft active:scale-95 transition-transform flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined">check_circle</span>
                    Selesai Belanja
                  </button>
                  
                </div>
              </aside>

            </div>
          </div>
        </div>
    </>
  );
}
