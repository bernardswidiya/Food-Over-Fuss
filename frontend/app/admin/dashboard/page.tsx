"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { logoutUser } from "@/lib/api";

// ── Types ──────────────────────────────────────────────────────────────────

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

interface AdminStats {
  total_users: number;
  total_recipes: number;
  total_published_recipes: number;
  total_meal_plans: number;
}

interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

type Section = "overview" | "recipes" | "users";

// ── Stat Card ──────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon,
  accent,
  loading,
}: {
  label: string;
  value: number | string;
  icon: string;
  accent: string;
  loading: boolean;
}) {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-soft p-6 flex items-center gap-5">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${accent}`}>
        <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
          {icon}
        </span>
      </div>
      <div>
        <p className="text-xs font-bold text-muted uppercase tracking-widest mb-1">{label}</p>
        {loading ? (
          <div className="h-8 w-16 bg-gray-100 rounded-lg animate-pulse" />
        ) : (
          <p className="text-3xl font-heading font-extrabold text-text-main">{value}</p>
        )}
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const router = useRouter();

  // Sidebar & navigation
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<Section>("overview");
  const [loggingOut, setLoggingOut] = useState(false);

  // Stats
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Recipes
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [recipesLoading, setRecipesLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Recipe form state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [recipeName, setRecipeName] = useState("");
  const [mealType, setMealType] = useState("sarapan");
  const [isPublished, setIsPublished] = useState(false);
  const [prepTime, setPrepTime] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [ingredients, setIngredients] = useState<string[]>([""]);
  const [instructions, setInstructions] = useState<string[]>([""]);

  // Users
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [pendingRoles, setPendingRoles] = useState<Record<number, string>>({});
  const [savingUserId, setSavingUserId] = useState<number | null>(null);
  const [roleSaveStatus, setRoleSaveStatus] = useState<Record<number, "success" | "error">>({});

  // ── Data fetchers ──────────────────────────────────────────────────────

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/admin/stats", { credentials: "include" });
      if (res.ok) setStats(await res.json());
    } catch { /* silently fail */ }
    finally { setStatsLoading(false); }
  }, []);

  const fetchRecipes = useCallback(async () => {
    setRecipesLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/admin/recipes", { credentials: "include" });
      if (res.ok) setRecipes(await res.json());
    } catch { /* silently fail */ }
    finally { setRecipesLoading(false); }
  }, []);

  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/admin/users", { credentials: "include" });
      if (res.ok) setUsers(await res.json());
    } catch { /* silently fail */ }
    finally { setUsersLoading(false); }
  }, []);

  useEffect(() => {
    fetchStats();
    fetchRecipes();
  }, [fetchStats, fetchRecipes]);

  useEffect(() => {
    if (activeSection === "users" && users.length === 0) fetchUsers();
  }, [activeSection, fetchUsers, users.length]);

  // ── Handlers ───────────────────────────────────────────────────────────

  const handleLogout = async () => {
    setLoggingOut(true);
    try { await logoutUser(); } catch { /* ignore */ }
    finally { router.push("/login"); }
  };

  const handleNav = (section: Section) => {
    setActiveSection(section);
    setSidebarOpen(false);
  };

  const resetForm = () => {
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
    setActiveSection("recipes");
    setTimeout(() => document.getElementById("recipe-form")?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin menghapus resep ini?")) return;
    try {
      const res = await fetch(`http://localhost:8000/api/admin/recipes/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) { fetchRecipes(); fetchStats(); }
    } catch { /* silently fail */ }
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
      ingredients: ingredients.filter((i) => i.trim() !== ""),
      instructions: instructions.filter((i) => i.trim() !== ""),
      is_published: isPublished,
    };
    try {
      const url = editingId
        ? `http://localhost:8000/api/admin/recipes/${editingId}`
        : "http://localhost:8000/api/admin/recipes";
      const res = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (res.ok) { resetForm(); fetchRecipes(); fetchStats(); }
      else alert("Gagal menyimpan resep.");
    } catch { /* silently fail */ }
  };

  const addField = (setter: React.Dispatch<React.SetStateAction<string[]>>, arr: string[]) =>
    setter([...arr, ""]);
  const updateField = (
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    arr: string[],
    idx: number,
    val: string
  ) => {
    const updated = [...arr];
    updated[idx] = val;
    setter(updated);
  };
  const removeField = (setter: React.Dispatch<React.SetStateAction<string[]>>, arr: string[], idx: number) =>
    setter(arr.filter((_, i) => i !== idx));

  const filteredRecipes = recipes.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRoleUpdate = async (userId: number) => {
    const newRole = pendingRoles[userId];
    if (!newRole) return;
    setSavingUserId(userId);
    try {
      const res = await fetch(`http://localhost:8000/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
        setPendingRoles((prev) => { const n = { ...prev }; delete n[userId]; return n; });
        setRoleSaveStatus((prev) => ({ ...prev, [userId]: "success" }));
        fetchStats();
        setTimeout(() => setRoleSaveStatus((prev) => { const n = { ...prev }; delete n[userId]; return n; }), 2500);
      } else {
        setRoleSaveStatus((prev) => ({ ...prev, [userId]: "error" }));
        setTimeout(() => setRoleSaveStatus((prev) => { const n = { ...prev }; delete n[userId]; return n; }), 2500);
      }
    } catch {
      setRoleSaveStatus((prev) => ({ ...prev, [userId]: "error" }));
    } finally {
      setSavingUserId(null);
    }
  };

  // ── Nav items ──────────────────────────────────────────────────────────

  const navItems: { id: Section; label: string; icon: string }[] = [
    { id: "overview", label: "Overview", icon: "dashboard" },
    { id: "recipes", label: "Kelola Resep", icon: "restaurant_menu" },
    { id: "users", label: "Kelola Pengguna", icon: "group" },
  ];

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="flex h-screen bg-background-light font-body text-text-main overflow-hidden">

      {/* ── Mobile overlay ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-40
          w-64 bg-white rounded-r-4xl
          shadow-[4px_0_24px_rgba(0,0,0,0.04)]
          flex flex-col h-full shrink-0
          border-r border-gray-50
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <div className="p-8 flex-1 overflow-y-auto">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10">
            <Image src="/Logo.png" alt="Logo" width={32} height={32} />
            <span className="text-xl font-bold font-heading tracking-tight">Admin Portal</span>
          </div>

          {/* Nav */}
          <nav className="flex flex-col gap-1.5">
            {navItems.map((item) => {
              const active = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-full font-medium transition-all ${
                    active
                      ? "bg-primary/10 text-primary font-bold"
                      : "text-muted hover:text-text-main hover:bg-gray-50"
                  }`}
                >
                  <span
                    className="material-symbols-outlined"
                    style={active ? { fontVariationSettings: "'FILL' 1" } : {}}
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Quick stats mini in sidebar */}
          {stats && (
            <div className="mt-8 p-4 bg-surface rounded-2xl border border-gray-100 space-y-2">
              <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-3">Ringkasan</p>
              <div className="flex justify-between text-xs font-medium text-text-main">
                <span className="text-muted">Pengguna</span>
                <span className="font-bold">{stats.total_users}</span>
              </div>
              <div className="flex justify-between text-xs font-medium text-text-main">
                <span className="text-muted">Resep Published</span>
                <span className="font-bold text-primary">{stats.total_published_recipes}</span>
              </div>
              <div className="flex justify-between text-xs font-medium text-text-main">
                <span className="text-muted">Meal Plans</span>
                <span className="font-bold">{stats.total_meal_plans}</span>
              </div>
            </div>
          )}
        </div>

        {/* Logout */}
        <div className="p-6 border-t border-gray-50">
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-full text-red-500 hover:bg-red-50 font-bold transition-all disabled:opacity-50"
          >
            <span className="material-symbols-outlined">
              {loggingOut ? "hourglass_empty" : "logout"}
            </span>
            <span>{loggingOut ? "Keluar..." : "Keluar"}</span>
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">

        {/* Mobile top bar */}
        <header className="md:hidden flex items-center justify-between px-5 py-4 bg-white border-b border-gray-100 shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <span className="material-symbols-outlined text-xl">menu</span>
          </button>
          <div className="flex items-center gap-2">
            <Image src="/Logo.png" alt="Logo" width={24} height={24} />
            <span className="font-bold font-heading text-sm">Admin Portal</span>
          </div>
          <div className="w-10" />
        </header>

        <main className="flex-1 overflow-y-auto px-5 py-6 md:p-10 lg:p-12">
          <div className="max-w-6xl mx-auto space-y-10">

            {/* ═══ OVERVIEW SECTION ═══ */}
            {activeSection === "overview" && (
              <>
                {/* Page header */}
                <div>
                  <h1 className="text-3xl md:text-4xl font-heading font-extrabold tracking-tighter">
                    Overview
                  </h1>
                  <p className="text-muted font-medium mt-1">
                    Statistik dan ringkasan platform Food Over Fuss.
                  </p>
                </div>

                {/* Stat cards grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                  <StatCard
                    label="Total Pengguna"
                    value={stats?.total_users ?? 0}
                    icon="group"
                    accent="bg-blue-50 text-blue-500"
                    loading={statsLoading}
                  />
                  <StatCard
                    label="Resep Aktif (AI)"
                    value={stats?.total_published_recipes ?? 0}
                    icon="check_circle"
                    accent="bg-primary/10 text-primary"
                    loading={statsLoading}
                  />
                  <StatCard
                    label="Total Resep"
                    value={stats?.total_recipes ?? 0}
                    icon="restaurant_menu"
                    accent="bg-orange-50 text-accent"
                    loading={statsLoading}
                  />
                  <StatCard
                    label="Total Meal Plans"
                    value={stats?.total_meal_plans ?? 0}
                    icon="calendar_month"
                    accent="bg-purple-50 text-purple-500"
                    loading={statsLoading}
                  />
                </div>

                {/* Quick actions */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-soft p-6 md:p-8">
                  <h2 className="text-lg font-heading font-bold mb-5">Aksi Cepat</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      onClick={() => handleNav("recipes")}
                      className="flex items-center gap-4 p-4 rounded-2xl bg-surface hover:bg-primary/5 border border-gray-100 hover:border-primary/20 transition-all text-left group"
                    >
                      <span className="material-symbols-outlined text-2xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                        restaurant_menu
                      </span>
                      <div>
                        <p className="font-bold text-sm">Tambah Resep Baru</p>
                        <p className="text-xs text-muted mt-0.5">Input resep ke database AI</p>
                      </div>
                      <span className="material-symbols-outlined text-muted ml-auto group-hover:text-primary transition-colors">chevron_right</span>
                    </button>
                    <button
                      onClick={() => handleNav("users")}
                      className="flex items-center gap-4 p-4 rounded-2xl bg-surface hover:bg-blue-50 border border-gray-100 hover:border-blue-200 transition-all text-left group"
                    >
                      <span className="material-symbols-outlined text-2xl text-blue-500" style={{ fontVariationSettings: "'FILL' 1" }}>
                        group
                      </span>
                      <div>
                        <p className="font-bold text-sm">Kelola Pengguna</p>
                        <p className="text-xs text-muted mt-0.5">Lihat dan atur role pengguna</p>
                      </div>
                      <span className="material-symbols-outlined text-muted ml-auto group-hover:text-blue-500 transition-colors">chevron_right</span>
                    </button>
                  </div>
                </div>

                {/* Recent recipes preview */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-soft overflow-hidden">
                  <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between">
                    <h2 className="font-heading font-bold text-lg">Resep Terbaru</h2>
                    <button
                      onClick={() => handleNav("recipes")}
                      className="text-xs font-bold text-primary hover:underline"
                    >
                      Lihat semua →
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-surface text-[10px] font-bold text-muted uppercase tracking-widest">
                          <th className="px-6 py-3">Nama Resep</th>
                          <th className="px-6 py-3 hidden sm:table-cell">Kategori</th>
                          <th className="px-6 py-3 hidden md:table-cell">Kalori</th>
                          <th className="px-6 py-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {recipesLoading ? (
                          Array.from({ length: 4 }).map((_, i) => (
                            <tr key={i}>
                              <td colSpan={4} className="px-6 py-4">
                                <div className="h-4 bg-gray-100 rounded-full animate-pulse w-3/4" />
                              </td>
                            </tr>
                          ))
                        ) : recipes.slice(0, 5).map((r) => (
                          <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-6 py-4 font-bold text-sm">{r.name}</td>
                            <td className="px-6 py-4 hidden sm:table-cell">
                              <span className="bg-primary/10 text-primary text-[10px] font-bold px-3 py-1 rounded-full uppercase">
                                {r.meal_type === "sarapan" ? "Breakfast" : r.meal_type === "siang" ? "Lunch" : "Dinner"}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-muted hidden md:table-cell">{r.calories} kkal</td>
                            <td className="px-6 py-4">
                              {r.is_published ? (
                                <span className="flex items-center gap-1.5 text-[10px] font-bold text-green-600">
                                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" /> PUBLISHED
                                </span>
                              ) : (
                                <span className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400">
                                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" /> DRAFT
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {/* ═══ RECIPES SECTION ═══ */}
            {activeSection === "recipes" && (
              <>
                {/* Page header */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div>
                    <h1 className="text-3xl md:text-4xl font-heading font-extrabold tracking-tighter">
                      Kelola Resep
                    </h1>
                    <p className="text-muted font-medium mt-1">Database referensi untuk AI Menu Planner.</p>
                  </div>
                  <div className="flex gap-3 shrink-0">
                    <div className="bg-white px-5 py-3 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                      <span className="text-[10px] font-bold text-muted uppercase tracking-widest">Total Resep</span>
                      <span className="text-2xl font-heading font-bold text-primary">{recipes.length}</span>
                    </div>
                    <div className="bg-white px-5 py-3 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                      <span className="text-[10px] font-bold text-muted uppercase tracking-widest">Published</span>
                      <span className="text-2xl font-heading font-bold text-green-500">
                        {recipes.filter((r) => r.is_published).length}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Recipe table */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-soft overflow-hidden">
                  <div className="p-5 border-b border-gray-50 flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
                    <h2 className="text-lg font-heading font-bold">Daftar Resep</h2>
                    <div className="relative">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Cari resep..."
                        className="bg-surface border-none rounded-full px-10 py-2.5 text-sm w-full sm:w-64 focus:ring-2 focus:ring-primary/20"
                      />
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted text-lg">
                        search
                      </span>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-surface text-[10px] font-bold text-muted uppercase tracking-widest">
                          <th className="px-6 py-4">Resep</th>
                          <th className="px-6 py-4 hidden sm:table-cell">Kategori</th>
                          <th className="px-6 py-4 hidden md:table-cell">Makro</th>
                          <th className="px-6 py-4">Status AI</th>
                          <th className="px-6 py-4 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {recipesLoading ? (
                          <tr>
                            <td colSpan={5} className="px-6 py-8 text-center text-muted font-medium">
                              Memuat data resep...
                            </td>
                          </tr>
                        ) : filteredRecipes.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-6 py-10 text-center text-muted font-medium">
                              <span className="material-symbols-outlined text-4xl block mb-2 text-gray-200">search_off</span>
                              Belum ada resep ditemukan.
                            </td>
                          </tr>
                        ) : (
                          filteredRecipes.map((recipe) => (
                            <tr key={recipe.id} className="hover:bg-gray-50/50 transition-colors">
                              <td className="px-6 py-4 font-bold text-sm">{recipe.name}</td>
                              <td className="px-6 py-4 hidden sm:table-cell">
                                <span className="bg-primary/10 text-primary text-[10px] font-bold px-3 py-1 rounded-full uppercase">
                                  {recipe.meal_type === "sarapan" ? "Breakfast" : recipe.meal_type === "siang" ? "Lunch" : "Dinner"}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-xs font-medium text-muted hidden md:table-cell">
                                {recipe.calories} Kkal · {recipe.protein}g P · {recipe.carbs}g C
                              </td>
                              <td className="px-6 py-4">
                                {recipe.is_published ? (
                                  <span className="flex items-center gap-1.5 text-[10px] font-bold text-green-600">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" /> PUBLISHED
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400">
                                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" /> DRAFT
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4 text-right whitespace-nowrap">
                                <button
                                  onClick={() => handleEdit(recipe)}
                                  className="text-muted hover:text-primary p-1.5 rounded-lg hover:bg-primary/5 transition-colors"
                                >
                                  <span className="material-symbols-outlined text-lg">edit</span>
                                </button>
                                <button
                                  onClick={() => handleDelete(recipe.id)}
                                  className="text-muted hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                                >
                                  <span className="material-symbols-outlined text-lg">delete</span>
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Recipe form */}
                <div id="recipe-form" className="bg-white rounded-3xl border border-gray-100 shadow-soft p-6 md:p-10">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-gray-50 pb-6">
                    <h2 className="text-2xl font-heading font-bold">
                      {editingId ? "Edit Resep" : "Input Resep Baru"}
                    </h2>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-muted">Publish ke AI?</span>
                      <button
                        type="button"
                        onClick={() => setIsPublished(!isPublished)}
                        className={`w-12 h-6 rounded-full relative transition-colors ${isPublished ? "bg-primary" : "bg-gray-200"}`}
                      >
                        <div
                          className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${isPublished ? "left-7" : "left-1"}`}
                        />
                      </button>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12">
                    {/* Left column */}
                    <div className="space-y-5">
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-muted ml-1">Nama Resep</label>
                        <input
                          type="text"
                          value={recipeName}
                          onChange={(e) => setRecipeName(e.target.value)}
                          required
                          className="bg-surface h-12 rounded-2xl px-4 border-none focus:ring-2 focus:ring-primary/20 font-medium"
                          placeholder="Contoh: Nasi Goreng Spesial"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                          <label className="text-sm font-bold text-muted ml-1">Tipe Makan</label>
                          <select
                            value={mealType}
                            onChange={(e) => setMealType(e.target.value)}
                            className="bg-surface h-12 rounded-2xl px-4 border-none focus:ring-2 focus:ring-primary/20 font-medium"
                          >
                            <option value="sarapan">Breakfast</option>
                            <option value="siang">Lunch</option>
                            <option value="malam">Dinner</option>
                          </select>
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-sm font-bold text-muted ml-1">Waktu Masak (menit)</label>
                          <input
                            type="number"
                            value={prepTime}
                            onChange={(e) => setPrepTime(e.target.value)}
                            className="bg-surface h-12 rounded-2xl px-4 border-none focus:ring-2 focus:ring-primary/20 font-medium"
                            placeholder="30"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { label: "Kalori (Kkal)", val: calories, set: setCalories, ph: "450" },
                          { label: "Protein (g)", val: protein, set: setProtein, ph: "40" },
                          { label: "Karbohidrat (g)", val: carbs, set: setCarbs, ph: "30" },
                          { label: "Lemak (g)", val: fat, set: setFat, ph: "10" },
                        ].map(({ label, val, set, ph }) => (
                          <div key={label} className="flex flex-col gap-2">
                            <label className="text-sm font-bold text-muted ml-1">{label}</label>
                            <input
                              type="number"
                              value={val}
                              onChange={(e) => set(e.target.value)}
                              className="bg-surface h-12 rounded-2xl px-4 border-none focus:ring-2 focus:ring-primary/20 font-medium"
                              placeholder={ph}
                            />
                          </div>
                        ))}
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold text-muted ml-1">Bahan-bahan</label>
                        {ingredients.map((ing, idx) => (
                          <div key={idx} className="flex gap-2">
                            <input
                              value={ing}
                              onChange={(e) => updateField(setIngredients, ingredients, idx, e.target.value)}
                              className="flex-1 bg-surface h-10 rounded-xl px-4 border-none focus:ring-2 focus:ring-primary/20 text-sm"
                              placeholder={`Bahan ke-${idx + 1}`}
                            />
                            <button
                              type="button"
                              onClick={() => removeField(setIngredients, ingredients, idx)}
                              className="text-red-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <span className="material-symbols-outlined text-sm">close</span>
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => addField(setIngredients, ingredients)}
                          className="text-primary text-xs font-bold flex items-center gap-1 hover:underline mt-1"
                        >
                          <span className="material-symbols-outlined text-sm">add_circle</span>
                          Tambah Bahan
                        </button>
                      </div>
                    </div>

                    {/* Right column */}
                    <div className="space-y-5">
                      <div className="w-full h-44 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center bg-surface hover:bg-gray-50 transition-colors cursor-pointer group">
                        <span className="material-symbols-outlined text-4xl text-gray-300 group-hover:text-primary mb-2">
                          image_search
                        </span>
                        <span className="text-xs font-bold text-muted">Upload Foto Resep</span>
                        <span className="text-[10px] text-gray-300 mt-1">PNG, JPG max 5MB</span>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold text-muted ml-1">Instruksi Memasak</label>
                        {instructions.map((ins, idx) => (
                          <div key={idx} className="flex gap-3 items-start">
                            <span className="bg-primary/10 text-primary w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-2">
                              {idx + 1}
                            </span>
                            <textarea
                              value={ins}
                              onChange={(e) => updateField(setInstructions, instructions, idx, e.target.value)}
                              className="w-full bg-surface rounded-xl p-3 border-none focus:ring-2 focus:ring-primary/20 text-sm resize-none"
                              rows={2}
                              placeholder="Jelaskan langkah ini..."
                            />
                            <button
                              type="button"
                              onClick={() => removeField(setInstructions, instructions, idx)}
                              className="text-red-400 hover:text-red-500 p-2 mt-1 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <span className="material-symbols-outlined text-sm">close</span>
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => addField(setInstructions, instructions)}
                          className="text-primary text-xs font-bold flex items-center gap-1 hover:underline mt-1"
                        >
                          <span className="material-symbols-outlined text-sm">add_circle</span>
                          Tambah Langkah
                        </button>
                      </div>
                    </div>

                    {/* Submit row */}
                    <div className="lg:col-span-2 pt-6 flex justify-end gap-3 border-t border-gray-50">
                      <button
                        type="button"
                        onClick={resetForm}
                        className="px-8 py-3 text-sm font-bold text-muted hover:bg-gray-100 rounded-full transition-colors"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="bg-primary text-white px-10 py-3 rounded-full font-bold shadow-soft hover:shadow-lg transition-all hover:-translate-y-0.5 active:translate-y-0"
                      >
                        {editingId ? "Update Resep" : "Simpan Resep"}
                      </button>
                    </div>
                  </form>
                </div>
              </>
            )}

            {/* ═══ USERS SECTION ═══ */}
            {activeSection === "users" && (
              <>
                <div>
                  <h1 className="text-3xl md:text-4xl font-heading font-extrabold tracking-tighter">
                    Kelola Pengguna
                  </h1>
                  <p className="text-muted font-medium mt-1">
                    Daftar seluruh pengguna terdaftar dan manajemen role.
                  </p>
                </div>

                {/* Warning banner */}
                <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3.5">
                  <span
                    className="material-symbols-outlined text-amber-500 shrink-0 mt-0.5 text-xl"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    warning
                  </span>
                  <p className="text-sm text-amber-700 font-medium leading-relaxed">
                    Hati-hati saat mengubah role. Mempromosikan user menjadi{" "}
                    <strong>Admin</strong> memberi akses penuh ke seluruh panel ini.
                  </p>
                </div>

                <div className="bg-white rounded-3xl border border-gray-100 shadow-soft overflow-hidden">
                  <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between">
                    <h2 className="font-heading font-bold text-lg">Semua Pengguna</h2>
                    <span className="text-xs font-bold text-muted bg-surface px-3 py-1.5 rounded-full">
                      {usersLoading ? "..." : `${users.length} akun`}
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-surface text-[10px] font-bold text-muted uppercase tracking-widest">
                          <th className="px-6 py-4">Pengguna</th>
                          <th className="px-6 py-4 hidden sm:table-cell">Email</th>
                          <th className="px-6 py-4">Role Saat Ini</th>
                          <th className="px-6 py-4">Ubah Role</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {usersLoading ? (
                          Array.from({ length: 5 }).map((_, i) => (
                            <tr key={i}>
                              <td colSpan={4} className="px-6 py-4">
                                <div className="h-4 bg-gray-100 rounded-full animate-pulse w-1/2" />
                              </td>
                            </tr>
                          ))
                        ) : users.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="px-6 py-10 text-center text-muted font-medium">
                              Tidak ada pengguna.
                            </td>
                          </tr>
                        ) : (
                          users.map((u) => {
                            const pendingRole = pendingRoles[u.id];
                            const hasChange = !!pendingRole && pendingRole !== u.role;
                            const isSaving = savingUserId === u.id;
                            const status = roleSaveStatus[u.id];

                            return (
                              <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                                      {u.name?.[0]?.toUpperCase() ?? "?"}
                                    </div>
                                    <span className="font-bold text-sm">{u.name}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-muted hidden sm:table-cell">{u.email}</td>
                                <td className="px-6 py-4">
                                  {u.role === "admin" ? (
                                    <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-[10px] font-bold px-3 py-1 rounded-full uppercase">
                                      <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
                                      Admin
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1.5 bg-gray-100 text-muted text-[10px] font-bold px-3 py-1 rounded-full uppercase">
                                      <span className="material-symbols-outlined text-[12px]">person</span>
                                      User
                                    </span>
                                  )}
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <select
                                      value={pendingRole ?? u.role}
                                      onChange={(e) =>
                                        setPendingRoles((prev) => ({ ...prev, [u.id]: e.target.value }))
                                      }
                                      disabled={isSaving}
                                      className="bg-surface border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary/40 disabled:opacity-50 cursor-pointer"
                                    >
                                      <option value="user">User</option>
                                      <option value="admin">Admin</option>
                                    </select>

                                    {hasChange && (
                                      <button
                                        onClick={() => handleRoleUpdate(u.id)}
                                        disabled={isSaving}
                                        className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-hover transition-colors disabled:opacity-50"
                                      >
                                        {isSaving ? (
                                          <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                          <span className="material-symbols-outlined text-xs">save</span>
                                        )}
                                        {isSaving ? "..." : "Simpan"}
                                      </button>
                                    )}

                                    {status === "success" && (
                                      <span className="flex items-center gap-1 text-green-600 text-xs font-bold">
                                        <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                                        Tersimpan!
                                      </span>
                                    )}
                                    {status === "error" && (
                                      <span className="flex items-center gap-1 text-red-500 text-xs font-bold">
                                        <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
                                        Gagal
                                      </span>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}
