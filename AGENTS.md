<project-architecture-guidelines>

# Project Architecture Guidelines

## Overview

Monorepo arsitektur:
- **Frontend (`apps/web`)**: Next.js App Router (Port 3000)
- **Backend (`apps/api`)**: ElysiaJS on Bun runtime (Port 3001)
- **Shared (`packages/shared`)**: Runtime constants & pure utils
- **Database**: PostgreSQL (`english_ai`)
- **ORM**: Drizzle ORM (`drizzle-orm/pg-core`)
- **Auth**: Better Auth (Session cookie + Elysia macro)
- **Data Fetching**: Eden Treaty (`@elysiajs/eden`) + TanStack Query (`@tanstack/react-query`)
- **Package Manager & Workspaces**: Bun (`bun run`, `bun add`, `workspaces: ["apps/*", "packages/*"]`)

Pola arsitektur: **Feature-Based + Clean Layered (Controller → Usecase → Repository → Schema)**.

| Layer | Lokasi | Tanggung Jawab |
|---|---|---|
| **Shared** | `packages/shared/src/` | Konstanta runtime & utilitas murni (bebas dependensi framework) |
| **Controller** | `apps/api/src/features/<f>/<f>.controller.ts` | Validasi model (TypeBox `t`), ambil `user` dari auth macro, panggil usecase |
| **Model** | `apps/api/src/features/<f>/<f>.model.ts` | Skema validasi TypeBox & tipe turunan |
| **Usecase** | `apps/api/src/features/<f>/usecases/*.usecase.ts` | Business logic murni, orkestrasi repository, lempar `AppError` |
| **Repository** | `apps/api/src/features/<f>/<f>.repository.ts` | Drizzle Query Builder mutasi/akses database |
| **Schema** | `apps/api/src/features/<f>/<f>.schema.ts` | Definisi tabel Drizzle ORM |
| **FE Feature** | `apps/web/src/features/<f>/` | Komponen fitur, custom hooks (TanStack Query), Eden API wrapper, query keys |
| **FE Page** | `apps/web/src/app/` | Routing tipis (thin page), render feature component |

---

## ⚠️ ATURAN MUTLAK: Batas Maksimal 600 Baris Per File

Setiap file kode dalam repository **TIDAK BOLEH lebih dari 600 baris**.

- Jika sebuah file mendekati batas (misal > 400-500 baris), **wajib dipecah/dimodularisasi** menjadi sub-modul terpisah.
- Contoh: satu file usecase untuk satu aksi (`create-post.usecase.ts`, `list-posts.usecase.ts`), pecah utilitas AI/facade ke file spesifik.
- Jangan menggabungkan semua fungsi ke dalam satu file raksasa.

---

## Struktur Monorepo

```
english-ai/
├── apps/
│   ├── api/                           # ElysiaJS Backend (Bun)
│   │   ├── src/
│   │   │   ├── core/                  # Utilitas lintas fitur (agnostik fitur)
│   │   │   │   ├── config/env.ts      # Validasi environment variable
│   │   │   │   ├── errors/app-error.ts# AppError, NotFoundError, dll.
│   │   │   │   └── plugins/           # cors.ts, error-handler.ts
│   │   │   ├── db/
│   │   │   │   ├── index.ts           # Koneksi Drizzle instance
│   │   │   │   ├── schema.ts          # Re-export semua *.schema.ts dari features
│   │   │   │   └── seed.ts            # Seeder database
│   │   │   ├── features/              # Fitur modular (1 fitur = 1 folder)
│   │   │   │   ├── auth/              # Better Auth config, plugin, schema
│   │   │   │   ├── users/             # Controller, model, repo, usecases
│   │   │   │   ├── curriculum/        # Controller, model, schema, repo, usecases
│   │   │   │   ├── voice/             # Speech, audio, AI conversation
│   │   │   │   └── placement/         # Placement test & CEFR assessment
│   │   │   ├── app.ts                 # Rakit plugin & controller, export type App
│   │   │   └── index.ts               # app.listen(3001) saja
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── web/                           # Next.js Frontend
│       ├── src/
│       │   ├── app/                   # Next.js App Router (thin routes saja)
│       │   ├── features/              # Feature modules
│       │   │   └── <feature>/
│       │   │       ├── api/           # Eden Treaty callers (*.api.ts)
│       │   │       ├── components/    # Feature UI components
│       │   │       ├── hooks/         # TanStack Query & state hooks
│       │   │       ├── query-keys.ts  # Konsistensi invalidasi query cache
│       │   │       └── index.ts       # Public API feature
│       │   ├── components/            # Generic dumb UI (ui/, layout/)
│       │   ├── lib/
│       │   │   ├── api-client.ts      # treaty<App>(...) instance Eden
│       │   │   └── query-client.ts    # TanStack QueryClient
│       │   ├── providers/             # QueryProvider, dll.
│       │   └── middleware.ts          # Cookie session auth guard
│       ├── package.json
│       └── tailwind.config.ts
│
├── packages/
│   └── shared/                        # Runtime constants & pure utils (@english-ai/shared)
│       ├── src/
│       │   ├── constants/             # Roles, CEFR levels, statuses
│       │   ├── utils/                 # Pure helper functions
│       │   └── index.ts
│       ├── package.json
│       └── tsconfig.json
│
├── data/                              # Master curriculum data
├── prompts/                           # AI system prompts
├── ARCHITECTURE.md                    # Detailed architectural standard
├── AGENTS.md                          # Architecture & coding guidelines for agents
├── tsconfig.base.json                 # Base TypeScript compiler options
└── package.json                       # Root workspace config
```

---

## Aturan Dependensi Antar-Layer

```
web ──► shared ◄── api
web ──(import type saja)──► api
```

| Dari | Boleh import | Dilarang |
|---|---|---|
| `apps/web` | `packages/shared`, `import type { App } from 'api'` | Import runtime apa pun dari `api` |
| `apps/api` | `packages/shared` | Apa pun dari `web` |
| `packages/shared` | Hanya dependensi stdlib/murni | `elysia`, `drizzle`, `react`, `next` |
| `features/A` | `core/`, `db/`, `shared`, `features/B/index.ts` | File internal `features/B/*` langsung |
| `core/` | `shared` | `features/*` |

---

## Layer: Backend Rules

### 1. Controller (`<feature>.controller.ts`)
- Tanggung jawab: definisi endpoint, validasi input dengan TypeBox (`t`), ambil `user` dari macro `{ auth: true }`, panggil usecase, return hasil.
- **DILARANG**: Memiliki logika bisnis, kalkulasi kompleks, atau query Drizzle langsung.

### 2. Model (`<feature>.model.ts`)
- Tanggung jawab: skema TypeBox untuk body, query params, path params, dan type turunan (`type X = typeof X.static`).
- **DILARANG**: Akses database atau import dependensi runtime selain TypeBox.

### 3. Usecase (`usecases/<verb-noun>.usecase.ts`)
- Aturan: **1 file = 1 aksi bisnis** (misal `getModuleDetailUsecase`, `submitPlacementUsecase`).
- Parameter: Menerima data polos (primitives / plain objects, bukan objek Elysia `Context` atau `request`).
- Error Handling: Lempar turunan `AppError` (`NotFoundError`, `ConflictError`, dll.). Ditangkap otomatis oleh `error-handler.ts`.
- **DILARANG**: Import Elysia, membaca `set`/`request`, atau query DB tanpa repository.

### 4. Repository (`<feature>.repository.ts`)
- Tanggung jawab: isolasi query & mutasi Drizzle ORM ke database.
- **DILARANG**: Aturan bisnis, kalkulasi nilai domain, atau melempar error bisnis.

### 5. Schema (`<feature>.schema.ts`)
- Definisi tabel Drizzle (`pgTable`). Semua tabel fitur di-reexport di `apps/api/src/db/schema.ts`.
- Konvensi nama tabel: `snake_case` (e.g. `curriculum_modules`, `call_sessions`).

### 6. App Contract (`apps/api/src/app.ts`)
- Backend mengekspor `export type App = typeof app`.
- `apps/api/src/index.ts` hanya memanggil `app.listen(3001)` agar aman saat di-import type oleh frontend.

---

## Layer: Frontend Rules

### 1. Data Fetching via Eden Treaty + TanStack Query
- FE tidak menduplikasi type response/payload BE. Semua type otomatis mengalir dari Eden Treaty:
```typescript
// apps/web/src/lib/api-client.ts
import { treaty } from '@elysiajs/eden'
import type { App } from 'api'

export const apiClient = treaty<App>(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001', {
  fetch: { credentials: 'include' }
})
```
- Setiap pemanggilan API dibungkus di `features/<feature>/api/<feature>.api.ts`.
- State server diatur oleh **TanStack Query** melalui custom hook di `features/<feature>/hooks/`.
- Query key dikelola terpusat di `features/<feature>/query-keys.ts` untuk konsistensi invalidasi cache.

### 2. Thin App Router (`apps/web/src/app/`)
- File `page.tsx` di `app/` harus **tipis**: hanya membaca route params/searchParams dan me-render feature component.
- Tidak ada query/fetch data langsung di file page tanpa melalui feature layer.

### 3. Generic Components (`apps/web/src/components/`)
- Hanya untuk komponen generik yang tidak mengenal fitur bisnis (misal `ui/button.tsx`, `layout/navbar.tsx`).
- **DILARANG** mengimpor dari `features/`.

---

## Konvensi Penamaan

| Hal | Format | Contoh |
|---|---|---|
| File | `kebab-case` | `get-module-detail.usecase.ts` |
| Suffix File BE | `.controller` `.usecase` `.repository` `.model` `.schema` | `curriculum.repository.ts` |
| Fungsi Usecase | `camelCase` (`verbNounUsecase`) | `getModuleDetailUsecase` |
| Komponen React | `PascalCase` (nama file `kebab-case.tsx`) | `ModuleCard` di `module-card.tsx` |
| Hook | `camelCase` (`useXxx`) | `useModuleDetail` |
| Query Keys | `camelCase` object | `curriculumKeys.detail(id)` |
| Tabel DB | `snake_case` jamak | `curriculum_modules`, `users` |
| Folder Fitur | `kebab-case` jamak | `curriculum`, `users`, `voice` |

---

## Workflow & Perintah Bun

```bash
# Root
bun install                  # Install seluruh workspace (api, web, shared)
bun run dev                  # Jalankan api & web secara paralel
bun run typecheck            # Validasi typecheck seluruh workspace

# Backend (apps/api)
cd apps/api
bun dev                      # Jalankan Elysia dev server (watch mode, port 3001)
bun run db:push              # Push schema Drizzle ke PostgreSQL
bun run db:seed              # Seed data kurikulum & user default

# Frontend (apps/web)
cd apps/web
bun dev                      # Jalankan Next.js dev server (port 3000)
bun run build                # Production build check
```

---

## Testing & Validasi

1. **Batas Baris File**: Pastikan tidak ada file yang melebihi **600 baris**.
2. **Typecheck Kontrak**: Jalankan `bun run typecheck`. Jika ada perubahan pada endpoint BE, pastikan typecheck di FE otomatis mendeteksi dan lulus uji.
3. **Build Check**: Jalankan `bun run build` pada `apps/web` dan `apps/api`.
</project-architecture-guidelines>
