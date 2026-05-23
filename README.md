# 🍱 FoodOverFuss 

> Sistem perencana menu harian berbasis AI yang personal, hemat, dan cerdas.

FoodOverFuss membantu masyarakat urban Indonesia merencanakan makan mingguan secara otomatis dengan mempertimbangkan keseimbangan nutrisi (kalori, protein, karbo, lemak), anggaran harian, dan kondisi khusus seperti alergi atau tujuan diet. Sistem rekomendasi menggunakan algoritma KNN-Affinity yang belajar dari preferensi pengguna secara adaptif. Semakin sering digunakan, semakin personal rekomendasinya.

**Live Demo:** [http://foodoverfuss.southeastasia.cloudapp.azure.com](http://foodoverfuss.southeastasia.cloudapp.azure.com)  
**API Docs:** [http://foodoverfuss.southeastasia.cloudapp.azure.com:8000/docs](http://foodoverfuss.southeastasia.cloudapp.azure.com:8000/docs)

---

## 👨‍💻 Tim Pengembang

**Kelompok Nonstop Notif — Universitas Gadjah Mada**

| Nama | NIM | Peran |
|------|-----|-------|
| Flavia Hidayriamraata Pualam | 22/494376/TK/54219 | Ketua Kelompok |
| Agatha Husna Amalia | 23/515562/TK/56686 | Anggota |
| Bernards Widiyazulfathirrochim | 23/512647/TK/56341 | Anggota |

---

##  🚀 Fitur Utama

- **Rekomendasi Menu Mingguan** — AI menyusun jadwal makan 7 hari berdasarkan profil nutrisi dan preferensi pengguna
- **Kalender Menu Interaktif** — Tampilan visual mingguan; tiap slot bisa diganti, di-regenerate, atau dikosongkan
- **Cari Pengganti Cerdas** — Temukan menu alternatif dengan profil makro setara (±20% kalori & protein)
- **Daftar Belanja Otomatis** — Agregasi bahan dari semua menu aktif dalam satu minggu
- **AI Chatbot Nutrisi** — Konsultasi gizi berbasis GPT-4o dengan konteks personal
- **Autentikasi Ganda** — Login email/password dan Google OAuth (via Supabase)
- **Dashboard Nutrisi Harian** — Ringkasan kalori, protein, karbo, lemak hari ini

---

## 🛠️ Tech Stack

### Frontend
| Teknologi | Versi | Keterangan |
|-----------|-------|------------|
| Next.js | 16.2.4 | App Router, standalone build |
| React | 19.2.3 | |
| TypeScript | 5.x | |
| Tailwind CSS | 4.x | |
| Supabase JS | latest | Google OAuth client |
<p>
      <img src="https://img.shields.io/badge/-Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white"/>
      <img src="https://img.shields.io/badge/-React-61DAFB?style=for-the-badge&logo=react&logoColor=black"/>
      <img src="https://img.shields.io/badge/-TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white"/>
      <img src="https://img.shields.io/badge/-Tailwind%20CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white"/>
      <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white"/>

### Backend
| Teknologi | Versi | Keterangan |
|-----------|-------|------------|
| FastAPI | 0.135.2 | REST API + Swagger auto-docs |
| SQLAlchemy | 2.0.48 | ORM |
| Pydantic | 2.12.5 | Schema validation |
| Uvicorn | 0.42.0 | ASGI server |
| python-jose | 3.5.0 | JWT HS256 + ES256 verification |
| passlib + bcrypt | 1.7.4 / 4.0.1 | Password hashing |
| scikit-learn | ≥1.4.0 | KNN feature scoring |
| OpenAI SDK | ≥1.30.0 | GPT-4o chatbot |

<p>
      <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white"/>
      <img src="https://img.shields.io/badge/SQLAlchemy-D71F00?style=for-the-badge&logo=sqlalchemy&logoColor=white"/>
      <img src="https://img.shields.io/badge/Pydantic-E92063?style=for-the-badge&logo=pydantic&logoColor=white"/>
      <img src="https://img.shields.io/badge/Uvicorn-4051B5?style=for-the-badge&logo=uvicorn&logoColor=white"/>
      <img src="https://img.shields.io/badge/Python--Jose-3776AB?style=for-the-badge&logo=python&logoColor=white"/>
      <img src="https://img.shields.io/badge/bcrypt-2A2A2A?style=for-the-badge&logo=securityscorecard&logoColor=white"/>
      <img src="https://img.shields.io/badge/scikit--learn-F7931E?style=for-the-badge&logo=scikitlearn&logoColor=white"/>
      <img src="https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white"/>
      <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white"/>
      <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white"/>

### Infrastruktur
| Komponen | Detail |
|----------|--------|
| Database | PostgreSQL 15 via Supabase |
| Auth Provider | Supabase Auth (Google OAuth ES256) |
| Cloud VM | Azure Standard B2s (Southeast Asia) |
| Container Registry | Azure Container Registry |
| Blob Storage | Azure Blob Storage (avatar & gambar resep) |
| CI/CD | GitHub Actions → ACR → Azure VM |

---

## 🧩 Arsitektur Sistem

```
Browser (Port 80)
      │
      ▼
┌─────────────────────┐
│  Frontend Service   │  Next.js 16 (standalone)
│  Docker Port 3000   │  → mapped ke Host :80
└────────┬────────────┘
         │  HTTP via Docker network
         ▼
┌─────────────────────┐
│  Backend Service    │  FastAPI + Uvicorn
│  Docker Port 8000   │  → mapped ke Host :8000
└────────┬────────────┘
         │  SSL/TLS
         ▼
┌─────────────────────┐
│  Supabase           │  PostgreSQL 15
│  + Auth (ES256 JWT) │
└─────────────────────┘
```

---

## ⚙️ Menjalankan Secara Lokal

### Prasyarat

- [Docker](https://docs.docker.com/get-docker/) & Docker Compose
- [Node.js 20+](https://nodejs.org/) (opsional, untuk dev tanpa Docker)
- [Python 3.11+](https://www.python.org/) (opsional, untuk dev tanpa Docker)
- Akun [Supabase](https://supabase.com/) (untuk database & Google OAuth)

### 1. Clone Repositori

```bash
git clone https://github.com/bernardsw/food-over-fuss.git
cd food-over-fuss
```

### 2. Konfigurasi Environment Variables

**Backend:**
```bash
cp backend/.env.example backend/.env
# Edit backend/.env dengan nilai yang sesuai
```

Isi minimal yang dibutuhkan di `backend/.env`:
```env
DATABASE_URL=postgresql://user:password@host:5432/dbname
SECRET_KEY=your-32-char-secret-key
SUPABASE_JWT_SECRET=your-supabase-jwt-secret
SUPABASE_URL=https://your-project.supabase.co
FRONTEND_URL=http://localhost:3000
GITHUB_TOKEN=your-openai-or-github-token
GITHUB_MODEL_NAME=gpt-4o-mini
SMTP_EMAIL=your-email@gmail.com
SMTP_PASSWORD=your-gmail-app-password
```

**Frontend:**
```bash
cp frontend/.env.local.example frontend/.env.local
# Edit frontend/.env.local dengan nilai yang sesuai
```

Isi minimal di `frontend/.env.local`:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. Jalankan dengan Docker Compose

```bash
# Build dan jalankan semua service
docker compose up --build

# Atau jalankan di background
docker compose up --build -d
```

Aplikasi akan tersedia di:
- **Frontend:** http://localhost:80
- **Backend API:** http://localhost:8000
- **API Docs (Swagger):** http://localhost:8000/docs

### 4. Jalankan Tanpa Docker (Development Mode)

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Jalankan migrasi database
alembic upgrade head

# Start server
uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

Frontend akan berjalan di http://localhost:3000

### 5. Migrasi Database

```bash
cd backend

# Buat migrasi baru (setelah mengubah models.py)
alembic revision --autogenerate -m "deskripsi perubahan"

# Terapkan semua migrasi
alembic upgrade head

# Rollback 1 langkah
alembic downgrade -1
```

---

## 📂 Struktur Proyek

```
food-over-fuss/
├── frontend/                    # Next.js 16 App Router
│   ├── app/
│   │   ├── (dashboard)/        # Layout dengan sidebar
│   │   │   ├── calendar/       # Kalender menu mingguan
│   │   │   ├── dashboard/      # Ringkasan menu harian
│   │   │   ├── grocery/        # Daftar belanja
│   │   │   ├── history/        # Riwayat meal plan
│   │   │   └── settings/       # Pengaturan profil
│   │   ├── auth/callback/      # Handler Google OAuth
│   │   ├── recipe/[id]/        # Detail resep & pengganti
│   │   └── onboarding/         # Setup preferensi awal
│   ├── lib/
│   │   ├── api.ts              # Semua fungsi API call
│   │   └── supabase.ts         # Supabase client
│   └── components/             # Komponen reusable
│
├── backend/                     # FastAPI
│   ├── app/
│   │   ├── api/
│   │   │   ├── routers/        # auth, meals, preferences, ...
│   │   │   └── dependencies.py # JWT auth middleware
│   │   ├── ai/
│   │   │   └── recommendation.py  # KNN-Affinity engine
│   │   ├── models.py           # SQLAlchemy models
│   │   ├── schemas.py          # Pydantic schemas
│   │   └── main.py             # FastAPI app + CORS
│   ├── alembic/                # Database migrations
│   └── requirements.txt
│
├── docker-compose.yml           # Orkestrasi container
└── .github/workflows/           # CI/CD GitHub Actions
```

---

## CI/CD Pipeline

Setiap push ke branch `main` akan memicu:

1. **Build** — Docker image frontend & backend di-build
2. **Push** — Image di-push ke Azure Container Registry
3. **Deploy** — SSH ke Azure VM, `docker compose pull && docker compose up -d`

```
git push origin main
       │
       ▼
GitHub Actions
  ├── Build backend image  → ACR
  ├── Build frontend image → ACR (dengan NEXT_PUBLIC_API_BASE_URL di-inject)
  └── SSH Deploy ke VM     → docker compose up -d
```

---

## ⚡ API Endpoints (Ringkasan)

Dokumentasi lengkap tersedia di `/docs` (Swagger UI).

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/api/auth/register` | Registrasi akun baru |
| POST | `/api/auth/login` | Login email/password |
| POST | `/api/auth/google-session` | Tukar Supabase token → cookie |
| GET | `/api/auth/me` | Data user saat ini |
| PUT | `/api/preferences` | Simpan preferensi nutrisi |
| POST | `/api/meals/generate-week` | Generate menu 7 hari |
| GET | `/api/meals` | Ambil menu berdasarkan rentang tanggal |
| PUT | `/api/meals/{id}/regenerate` | Regenerate satu slot menu |
| PUT | `/api/meals/{id}/set-recipe` | Ganti menu dengan resep spesifik |
| GET | `/api/meals/{id}/alternatives` | Alternatif dengan makro setara |
| GET | `/api/meals/{id}/substitute` | Satu pengganti terbaik |
| GET | `/api/groceries` | Daftar belanja teragregasi |
| POST | `/api/chat/` | Chat dengan AI nutrisi |

---

## 📄 Lisensi

Proyek ini dibuat untuk keperluan akademik — **Mata Kuliah Senior Project, Universitas Gadjah Mada 2026**.
