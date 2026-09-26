<project-architecture-guidelines>

# Project Architecture Guidelines

## Overview

Monorepo arsitektur:
- **Frontend (`apps/web`)**: Next.js App Router (Port 3000)
- **Backend (`apps/api`)**: ElysiaJS on Bun runtime (Port 3001)
- **Database**: PostgreSQL (`english_ai`)
- **ORM**: Drizzle ORM (`drizzle-orm/pg-core`)
- **Package Manager & Runtime**: Bun (`bun run`, `bun add`)

Pola arsitektur: **Route (Elysia) → Service (BE Logic) → Dumb Component (FE Tailwind UI)**.

| Layer | Lokasi | Tanggung Jawab |
|---|---|---|
| **Elysia Route** | `apps/api/src/routes/*.ts` | Endpoint, schema validation (TypeBox `t`), panggil service |
| **Service** | `apps/api/src/services/*.service.ts` | Business logic, query Drizzle ORM, AI calls |
| **Database** | `apps/api/src/db/` | Schema Drizzle (`schema.ts`), connection (`index.ts`), seed |
| **FE Component** | `apps/web/src/components/` | Presentational UI murni (HTML + Tailwind). **NO logic** |
| **FE Page** | `apps/web/src/app/` | Layout, page wiring, hook consumption |

---

## ⚠️ ATURAN MUTLAK: Batas Maksimal 600 Baris Per File

Setiap file kode dalam repository **TIDAK BOLEH lebih dari 600 baris**.

- Jika sebuah file mendekati batas (misal > 400-500 baris), **wajib dipecah/dimodularisasi** menjadi sub-modul terpisah.
- Contoh yang sudah diterapkan: `gemini.ts` (awalnya ~800 baris) dipecah menjadi:
  - `gemini-tts.ts` (TTS & voice logic)
  - `gemini-chat.ts` (Chat & conversation logic)
  - `gemini-eval.ts` (Evaluation & scoring logic)
  - `gemini.ts` (Facade re-export sederhana)
- Jangan menggabungkan semua fungsi ke dalam satu file raksasa.

---

## Struktur Monorepo

```
english-ai/
├── apps/
│   ├── api/                      # ElysiaJS Backend (Bun)
│   │   ├── src/
│   │   │   ├── db/
│   │   │   │   ├── schema.ts     # Drizzle pgTable definitions
│   │   │   │   ├── index.ts      # Postgres connection instance
│   │   │   │   └── seed.ts       # Database seeder
│   │   │   ├── routes/           # Controller/Endpoint Elysia
│   │   │   ├── services/         # Usecase/Business logic
│   │   │   ├── lib/              # Utility & AI facades (Gemini, dll)
│   │   │   └── index.ts          # Server entrypoint (Port 3001)
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── web/                      # Next.js Frontend
│       ├── src/
│       │   ├── app/              # Next.js App Router (Pages)
│       │   ├── components/       # Presentational UI (Tailwind only)
│       │   ├── hooks/            # Client hooks (speech, audio, etc.)
│       │   └── lib/              # Client helpers
│       ├── next.config.ts        # Proxy rewrites /api/* -> :3001
│       ├── package.json
│       └── tailwind.config.ts
├── data/                         # Master curriculum & questions data
├── prompts/                      # AI system prompts
├── AGENTS.md                     # Architecture & coding guidelines
└── package.json                  # Root package config
```

---

## Layer: Backend Route (`apps/api/src/routes/*.ts`)

### Tanggung Jawab
- Menerima HTTP request (GET, POST, PUT, DELETE)
- Validasi schema input/body/query menggunakan TypeBox (`t`) bawaan Elysia
- Meneruskan data ke Service terkait
- Return response JSON terstandarisasi
- **DILARANG**: Melakukan query Drizzle atau logika bisnis langsung di file route

### Contoh Struktur Route
```typescript
import { Elysia, t } from 'elysia'
import { curriculumService } from '../services/curriculum.service'

export const curriculumRoutes = new Elysia({ prefix: '/api/curriculum' })
  .get('/modules', async () => {
    return await curriculumService.getAllModules()
  })
  .post('/progress', async ({ body }) => {
    return await curriculumService.saveProgress(body)
  }, {
    body: t.Object({
      moduleId: t.String(),
      score: t.Number(),
      status: t.String()
    })
  })
```

---

## Layer: Backend Service (`apps/api/src/services/*.service.ts`)

### Tanggung Jawab
- Seluruh logika bisnis aplikasi
- Query & mutasi database menggunakan **Drizzle Query Builder**
- Integrasi third-party (Google Gemini, ElevenLabs, dll)
- Handle error dan return standard result

### Format Response Standar
```typescript
export interface ServiceResult<T = unknown> {
  success: boolean
  data?: T
  message?: string
  error?: string
}
```

### Pola Query Drizzle (PostgreSQL)
```typescript
import { db } from '../db'
import { curriculumModules } from '../db/schema'
import { eq, asc } from 'drizzle-orm'

export class CurriculumService {
  async getAllModules() {
    try {
      const data = await db
        .select()
        .from(curriculumModules)
        .orderBy(asc(curriculumModules.orderIndex))

      return { success: true, data }
    } catch (e) {
      console.error(e)
      return { success: false, error: (e as Error).message }
    }
  }
}

export const curriculumService = new CurriculumService()
```

---

## Layer: Database (`apps/api/src/db/`)

- Database: PostgreSQL (koneksi default `postgresql://postgres@127.0.0.1:5432/english_ai`)
- Schema: Didefinisikan di `apps/api/src/db/schema.ts` menggunakan helper `drizzle-orm/pg-core`:
  - `pgTable`, `varchar`, `text`, `integer`, `boolean`, `jsonb`, `timestamp`
- Konvensi nama tabel: `snake_case` (e.g. `curriculum_modules`, `user_progress`)
- Relasi & migration via Drizzle Kit:
  - Push schema langsung: `bun run db:push` (di dalam `apps/api`)
  - Seed database: `bun run db:seed`

---

## Layer: Frontend (`apps/web/`)

### Aturan Komponen FE: "Mental HTML Tailwind"
Komponen UI di `apps/web/src/components/` harus **murni presentational / dumb components**:
- Hanya bertugas menampilkan data dan styling via **Tailwind CSS**.
- **JANGAN** menaruh business logic, kalkulasi scoring, atau manipulasi data rumit di dalam komponen.
- Interaksi diteruskan via props / callback functions (`onClick`, `onSubmit`, `onSelect`).
- State kompleks dipisah ke custom hooks di `apps/web/src/hooks/` (misal: `useAudioRecorder`, `useSpeechQueue`).

### Next.js Proxy Rewrite
Semua request FE ke `/api/*` diteruskan secara transparan oleh Next.js dev server ke Elysia backend di port 3001:
```typescript
// apps/web/next.config.ts
const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/api/:path*',
      },
    ]
  },
}
```
Client component cukup panggil `fetch('/api/voice/process', ...)` tanpa perlu tahu port Elysia.

---

## Workflow & Perintah Bun

Semua lifecycle project menggunakan **Bun**:

```bash
# Backend (apps/api)
cd apps/api
bun install              # Install dependencies
bun dev                  # Jalankan Elysia dev server (watch mode, port 3001)
bun run db:push          # Push schema Drizzle ke PostgreSQL
bun run db:seed          # Seed data kurikulum & user default

# Frontend (apps/web)
cd apps/web
bun install              # Install dependencies
bun dev                  # Jalankan Next.js dev server (port 3000)
bun run build            # Production build check
```

---

## Konvensi Penamaan

- File Service: `kebab-case.service.ts` (`curriculum.service.ts`)
- File Route: `kebab-case.ts` di `apps/api/src/routes/` (`voice.ts`, `placement.ts`)
- File Komponen React: `PascalCase.tsx` (`SpeechMeter.tsx`, `ModuleCard.tsx`)
- Tabel DB: `snake_case` di database, `camelCase` export di `schema.ts`
- Kolom DB: `snake_case` mapping ke `camelCase` di schema TypeScript

---

## Testing & Validasi

- Backend check: jalankan `bun run build` atau `bun test` di `apps/api`
- Frontend check: jalankan `bun run build` di `apps/web`
- Verifikasi batas baris: pastikan tidak ada file yang melebihi 600 baris.
</project-architecture-guidelines>
