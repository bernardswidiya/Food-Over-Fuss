"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { logoutUser } from "@/lib/api";

interface Recipe {
  id: number;
  name: string;
  meal_type: string;
  prep_time: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: string[];
  instructions: string[];
  is_published: boolean;
}

export default function AdminRecipePage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  // State untuk form resep
  const [editingId, setEditingId] = useState<number | null>(null);
  const [recipeName, setRecipeName] = useState("");
  const [mealType, setMealType] = useState("sarapan");
  const [isPublished, setIsPublished] = useState(false);
  const [prepTime, setPrepTime] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [ingredients, setIngredients] = useState<string[]>([""]); // Input dinamis
  const [instructions, setInstructions] = useState<string[]>([""]); // Input dinamis

  const fetchRecipes = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/admin/recipes", {
        credentials: "include"
      });
      if (res.ok) {
        const data = await res.json();
        setRecipes(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  // Handler Input Dinamis
  const addField = (setter: React.Dispatch<React.SetStateAction<string[]>>, prev: string[]) => setter([...prev, ""]);
  const updateField = (setter: React.Dispatch<React.SetStateAction<string[]>>, prev: string[], index: number, value: string) => {
    const updated = [...prev];
    updated[index] = value;
    setter(updated);
  };

  const handleCancel = () => {
    setEditingId(null);
    setRecipeName("");
    setMealType("sarapan");
    setIsPublished(false);
    setPrepTime("");
    setCalories("");
    setProtein("");
    setCarbs("");
    setFat("");
    setIngredients([""]);
    setInstructions([""]);
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logoutUser();
    } catch {
      // Error handling fallbacks if any
    } finally {
      router.push("/login");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: recipeName,
      meal_type: mealType,
      prep_time: Number(prepTime) || 0,
      calories: Number(calories) || 0,
      protein: Number(protein) || 0,
      carbs: Number(carbs) || 0,
      fat: Number(fat) || 0,
      ingredients: ingredients.filter(i => i.trim() !== ""),
      instructions: instructions.filter(i => i.trim() !== ""),
      is_published: isPublished,
    };

    try {
      const url = editingId 
        ? `http://localhost:8000/api/admin/recipes/${editingId}`
        : "http://localhost:8000/api/admin/recipes";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        handleCancel();
        fetchRecipes();
      } else {
        alert("Gagal menyimpan resep");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin menghapus resep ini?")) return;
    try {
      const res = await fetch(`http://localhost:8000/api/admin/recipes/${id}`, {
        method: "DELETE",
        credentials: "include"
      });
      if (res.ok) {
        fetchRecipes();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (r: Recipe) => {
    setEditingId(r.id);
    setRecipeName(r.name || "");
    setMealType(r.meal_type || "sarapan");
    setPrepTime(r.prep_time?.toString() || "");
    setCalories(r.calories?.toString() || "");
    setProtein(r.protein?.toString() || "");
    setCarbs(r.carbs?.toString() || "");
    setFat(r.fat?.toString() || "");
    setIngredients(r.ingredients?.length ? r.ingredients : [""]);
    setInstructions(r.instructions?.length ? r.instructions : [""]);
    setIsPublished(r.is_published || false);
    
    // Scroll to form smoothly
    document.getElementById("recipe-form")?.scrollIntoView({ behavior: "smooth" });
  };

  const filteredRecipes = recipes.filter(r => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-background-light font-body text-text-main overflow-hidden">
      
      {/* SIDEBAR: Fokus hanya pada Database Resep */}
      <aside className="w-64 bg-white rounded-r-[32px] shadow-[4px_0_24px_rgba(0,0,0,0.03)] flex flex-col h-full flex-shrink-0 z-20 border-r border-gray-50">
        <div className="p-8 flex-1">
          <div className="flex items-center gap-3 mb-10">
            <Image src="/Logo.png" alt="Logo" width={32} height={32} />
            <span className="text-xl font-bold font-heading tracking-tight">Admin Portal</span>
          </div>
          <nav className="flex flex-col gap-2">
            <div className="px-4 py-3 rounded-full bg-primary/10 text-primary font-bold flex items-center gap-3">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>restaurant_menu</span>
              <span>Kelola Resep</span>
            </div>
          </nav>
        </div>
        <div className="p-6 border-t border-gray-50">
          <button 
            onClick={handleLogout} 
            disabled={loggingOut} 
            className="w-full flex items-center gap-3 px-4 py-3 rounded-full text-red-500 hover:bg-red-50 font-bold transition-all disabled:opacity-50"
          >
            <span className="material-symbols-outlined">{loggingOut ? "hourglass_empty" : "logout"}</span>
            <span>{loggingOut ? "Keluar..." : "Keluar"}</span>
          </button>
        </div>
      </aside>

      {/* KONTEN UTAMA */}
      <main className="flex-1 overflow-y-auto p-8 lg:p-12">
        <div className="max-w-6xl mx-auto space-y-12">
          
          {/* Header & Stats */}
          <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <h1 className="text-4xl font-heading font-extrabold tracking-tighter">Database Resep</h1>
              <p className="text-muted font-medium mt-1">Pusat data referensi untuk AI Menu Planner.</p>
            </div>
            <div className="flex gap-4">
              <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                <span className="text-xs font-bold text-muted uppercase tracking-widest">Total Resep</span>
                <span className="text-2xl font-heading font-bold text-primary">{recipes.length}</span>
              </div>
            </div>
          </section>

          {/* TABEL RESEP TERBARU */}
          <section className="bg-white rounded-[32px] border border-gray-100 shadow-soft overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex justify-between items-center">
              <h2 className="text-xl font-heading font-bold">Daftar Resep Terbaru</h2>
              <div className="relative">
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari resep..." 
                  className="bg-surface border-none rounded-full px-10 py-2 text-sm w-64 focus:ring-2 focus:ring-primary/20" 
                />
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted text-lg">search</span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-surface text-xs font-bold text-muted uppercase tracking-widest">
                    <th className="px-6 py-4">Resep</th>
                    <th className="px-6 py-4">Kategori</th>
                    <th className="px-6 py-4">Makro</th>
                    <th className="px-6 py-4">Status AI</th>
                    <th className="px-6 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-muted font-medium">Memuat data resep...</td>
                    </tr>
                  ) : filteredRecipes.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-muted font-medium">Belum ada resep ditemukan.</td>
                    </tr>
                  ) : (
                    filteredRecipes.map((recipe) => (
                      <tr key={recipe.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 font-bold text-sm">{recipe.name}</td>
                        <td className="px-6 py-4">
                          <span className="bg-primary/10 text-primary text-[10px] font-bold px-3 py-1 rounded-full uppercase">
                            {recipe.meal_type === "sarapan" ? "Breakfast" : recipe.meal_type === "siang" ? "Lunch" : "Dinner"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs font-medium text-muted">
                          {recipe.calories} Kkal • {recipe.protein}g P • {recipe.carbs}g C
                        </td>
                        <td className="px-6 py-4">
                          {recipe.is_published ? (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-green-500">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> PUBLISHED
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-gray-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span> DRAFT
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => handleEdit(recipe)} className="text-muted hover:text-primary p-1">
                            <span className="material-symbols-outlined text-lg">edit</span>
                          </button>
                          <button onClick={() => handleDelete(recipe.id)} className="text-muted hover:text-red-500 p-1">
                            <span className="material-symbols-outlined text-lg">delete</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* FORM TAMBAH RESEP BARU */}
          <section id="recipe-form" className="bg-white rounded-[32px] border border-gray-100 shadow-soft p-8 lg:p-10">
            <div className="flex justify-between items-center mb-8 border-b border-gray-50 pb-6">
              <h2 className="text-2xl font-heading font-bold">{editingId ? 'Edit Resep' : 'Input Resep Baru'}</h2>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-muted">Siap di-publish ke AI?</span>
                <button onClick={() => setIsPublished(!isPublished)} className={`w-12 h-6 rounded-full transition-all relative ${isPublished ? 'bg-primary' : 'bg-gray-200'}`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isPublished ? 'left-7' : 'left-1'}`}></div>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-6">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-muted ml-1">Nama Resep</label>
                  <input type="text" value={recipeName} onChange={e => setRecipeName(e.target.value)} required className="bg-surface h-12 rounded-2xl px-4 border-none focus:ring-2 focus:ring-primary/20 font-medium" placeholder="Contoh: Nasi Goreng Spesial" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-muted ml-1">Tipe Makan</label>
                    <select value={mealType} onChange={e => setMealType(e.target.value)} className="bg-surface h-12 rounded-2xl px-4 border-none focus:ring-2 focus:ring-primary/20 font-medium">
                      <option value="sarapan">Breakfast</option>
                      <option value="siang">Lunch</option>
                      <option value="malam">Dinner</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-muted ml-1">Waktu Masak (Menit)</label>
                    <input type="number" value={prepTime} onChange={e => setPrepTime(e.target.value)} className="bg-surface h-12 rounded-2xl px-4 border-none focus:ring-2 focus:ring-primary/20 font-medium" placeholder="30" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-muted ml-1">Kalori (Kkal)</label>
                    <input type="number" value={calories} onChange={e => setCalories(e.target.value)} className="bg-surface h-12 rounded-2xl px-4 border-none focus:ring-2 focus:ring-primary/20 font-medium" placeholder="450" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-muted ml-1">Protein (g)</label>
                    <input type="number" value={protein} onChange={e => setProtein(e.target.value)} className="bg-surface h-12 rounded-2xl px-4 border-none focus:ring-2 focus:ring-primary/20 font-medium" placeholder="40" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-muted ml-1">Karbohidrat (g)</label>
                    <input type="number" value={carbs} onChange={e => setCarbs(e.target.value)} className="bg-surface h-12 rounded-2xl px-4 border-none focus:ring-2 focus:ring-primary/20 font-medium" placeholder="30" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-muted ml-1">Lemak (g)</label>
                    <input type="number" value={fat} onChange={e => setFat(e.target.value)} className="bg-surface h-12 rounded-2xl px-4 border-none focus:ring-2 focus:ring-primary/20 font-medium" placeholder="10" />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-bold text-muted ml-1">Bahan-bahan (List Dinamis)</label>
                  {ingredients.map((ing, idx) => (
                    <div key={idx} className="flex gap-2 mb-2">
                      <input value={ing} onChange={e => updateField(setIngredients, ingredients, idx, e.target.value)} className="flex-1 bg-surface h-10 rounded-xl px-4 border-none focus:ring-2 focus:ring-primary/20 text-sm" placeholder={`Bahan ke-${idx + 1}`} />
                      <button type="button" onClick={() => setIngredients(ingredients.filter((_, i) => i !== idx))} className="text-red-400 hover:text-red-500 p-2"><span className="material-symbols-outlined text-sm">close</span></button>
                    </div>
                  ))}
                  <button type="button" onClick={() => addField(setIngredients, ingredients)} className="text-primary text-xs font-bold flex items-center gap-1 hover:underline">
                    <span className="material-symbols-outlined text-sm">add_circle</span> Tambah Baris Bahan
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                 {/* Upload Image Placeholder */}
                 <div className="w-full h-48 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center bg-surface hover:bg-gray-50 transition-colors cursor-pointer group">
                    <span className="material-symbols-outlined text-4xl text-gray-300 group-hover:text-primary mb-2">image_search</span>
                    <span className="text-xs font-bold text-muted">Klik untuk Upload Foto Resep</span>
                 </div>

                 <div className="space-y-4">
                  <label className="text-sm font-bold text-muted ml-1">Instruksi Memasak</label>
                  {instructions.map((ins, idx) => (
                    <div key={idx} className="flex gap-3 items-start mb-3">
                      <span className="bg-primary/10 text-primary w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-2">{idx + 1}</span>
                      <textarea value={ins} onChange={e => updateField(setInstructions, instructions, idx, e.target.value)} className="w-full bg-surface rounded-xl p-3 border-none focus:ring-2 focus:ring-primary/20 text-sm" rows={2} placeholder="Jelaskan langkah ini..." />
                      <button type="button" onClick={() => setInstructions(instructions.filter((_, i) => i !== idx))} className="text-red-400 hover:text-red-500 p-2 mt-1"><span className="material-symbols-outlined text-sm">close</span></button>
                    </div>
                  ))}
                  <button type="button" onClick={() => addField(setInstructions, instructions)} className="text-primary text-xs font-bold flex items-center gap-1 hover:underline">
                    <span className="material-symbols-outlined text-sm">add_circle</span> Tambah Langkah Instruksi
                  </button>
                </div>
              </div>

              <div className="lg:col-span-2 pt-8 flex justify-end gap-4 border-t border-gray-50">
                <button type="button" onClick={handleCancel} className="px-8 py-3 text-sm font-bold text-muted hover:bg-gray-100 rounded-full transition-colors">Batal</button>
                <button type="submit" className="bg-primary text-white px-10 py-3 rounded-full font-bold shadow-soft hover:shadow-lg transition-all hover:-translate-y-1">
                  {editingId ? 'Update Resep' : 'Simpan Resep'}
                </button>
              </div>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}
