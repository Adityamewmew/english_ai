# ARCHITECTURE

Monorepo **Next.js (FE)** + **Elysia/Bun (BE)** dengan pola **feature-based + usecase**, **Better Auth**, **Drizzle ORM**, dan folder **shared** yang minimal.

---

## 1. Prinsip Utama

1. **BE adalah sumber kebenaran type.** FE mengambil type lewat `import type` dan Eden Treaty, tidak menulis ulang.
2. **Satu fitur = satu folder** di FE maupun BE.
3. **BE berlapis**: controller → usecase → repository → db. Tiap layer punya satu tugas.
4. **`shared` hanya untuk nilai runtime** yang dipakai dua sisi (konstanta, util murni).
5. **Dependensi satu arah**, tidak ada import melingkar.

## 2. Tech Stack

| Area | Teknologi |
|---|---|
| Runtime BE | Bun |
| Framework BE | Elysia |
| ORM | Drizzle + PostgreSQL |
| Auth | Better Auth |
| Framework FE | Next.js (App Router) |
| Data fetching FE | Eden Treaty + TanStack Query |
| Monorepo | Bun workspaces |

---

## 3. Root

```
my-project/
├── apps/
│   ├── api/                     → Elysia (Bun)
│   └── web/                     → Next.js
├── packages/
│   └── shared/                  → konstanta & util runtime
├── package.json
├── bun.lock
├── tsconfig.base.json
├── .gitignore
├── .env.example
├── docker-compose.yml           → postgres untuk dev
└── ARCHITECTURE.md
```

```json
// package.json (root)
{
  "name": "my-project",
  "private": true,
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "dev": "bun run --filter '*' dev",
    "dev:api": "bun --cwd apps/api dev",
    "dev:web": "bun --cwd apps/web dev",
    "db:generate": "bun --cwd apps/api db:generate",
    "db:migrate": "bun --cwd apps/api db:migrate",
    "typecheck": "bun run --filter '*' typecheck"
  }
}
```

```json
// tsconfig.base.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "noUncheckedIndexedAccess": true
  }
}
```

---

## 4. Backend: `apps/api`

```
apps/api/
├── src/
│   ├── index.ts                      → app.listen() saja
│   ├── app.ts                        → rakit plugin & feature, export type App
│   │
│   ├── core/                         → utilitas lintas fitur (tidak tahu isi fitur)
│   │   ├── config/
│   │   │   └── env.ts                → validasi env
│   │   ├── errors/
│   │   │   └── app-error.ts          → AppError, NotFoundError, ConflictError, dst
│   │   ├── plugins/
│   │   │   ├── cors.ts
│   │   │   └── error-handler.ts      → onError global
│   │   └── utils/
│   │       └── pagination.ts
│   │
│   ├── db/                           → komposisi database
│   │   ├── index.ts                  → koneksi drizzle
│   │   ├── schema.ts                 → re-export semua *.schema.ts dari features
│   │   ├── migrations/               → hasil drizzle-kit generate
│   │   └── seed.ts
│   │
│   └── features/
│       ├── auth/
│       │   ├── auth.ts               → config betterAuth
│       │   ├── auth.plugin.ts        → mount handler + macro `auth`
│       │   ├── auth.schema.ts        → hasil generate CLI (user, session, account, verification)
│       │   └── index.ts
│       │
│       ├── users/
│       │   ├── users.controller.ts
│       │   ├── users.model.ts        → validasi TypeBox + type turunan
│       │   ├── users.repository.ts
│       │   ├── usecases/
│       │   │   ├── get-user.usecase.ts
│       │   │   ├── list-users.usecase.ts
│       │   │   └── update-profile.usecase.ts
│       │   └── index.ts              → public API fitur
│       │
│       └── posts/                    → contoh fitur bisnis
│           ├── posts.controller.ts
│           ├── posts.model.ts
│           ├── posts.schema.ts       → tabel Drizzle
│           ├── posts.repository.ts
│           ├── usecases/
│           │   ├── create-post.usecase.ts
│           │   └── list-posts.usecase.ts
│           └── index.ts
│
├── tests/
│   └── features/
│       └── posts/
│           └── create-post.usecase.test.ts
├── drizzle.config.ts
├── package.json
├── tsconfig.json
└── .env
```

### package.json

```json
{
  "name": "@my-project/api",
  "private": true,
  "type": "module",
  "main": "./src/app.ts",
  "types": "./src/app.ts",
  "scripts": {
    "dev": "bun --watch src/index.ts",
    "start": "bun src/index.ts",
    "typecheck": "tsc --noEmit",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "test": "bun test"
  },
  "dependencies": {
    "@my-project/shared": "workspace:*",
    "elysia": "latest",
    "@elysiajs/cors": "latest",
    "better-auth": "latest",
    "drizzle-orm": "latest",
    "postgres": "latest"
  },
  "devDependencies": { "drizzle-kit": "latest" }
}
```

### Konfigurasi inti

```ts
// drizzle.config.ts
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/features/**/*.schema.ts',
  out: './src/db/migrations',
  dbCredentials: { url: process.env.DATABASE_URL! }
})
```

```ts
// src/db/schema.ts
export * from '../features/auth/auth.schema'
export * from '../features/posts/posts.schema'
```

```ts
// src/app.ts
import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { errorHandler } from './core/plugins/error-handler'
import { authPlugin } from './features/auth'
import { usersController } from './features/users'
import { postsController } from './features/posts'

export const app = new Elysia()
  .use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }))
  .use(errorHandler)
  .use(authPlugin)
  .use(usersController)
  .use(postsController)

export type App = typeof app
```

```ts
// src/index.ts
import { app } from './app'
app.listen(3001)
```

`App` di-export dari `app.ts` supaya FE yang `import type` tidak pernah menyentuh `listen()`.

### Core: error

```ts
// core/errors/app-error.ts
export class AppError extends Error {
  constructor(message: string, public status = 400) {
    super(message)
  }
}
export class ConflictError extends AppError {
  constructor(msg = 'Data sudah ada') { super(msg, 409) }
}
export class NotFoundError extends AppError {
  constructor(msg = 'Data tidak ditemukan') { super(msg, 404) }
}
```

```ts
// core/plugins/error-handler.ts
import { Elysia } from 'elysia'
import { AppError } from '../errors/app-error'

export const errorHandler = new Elysia()
  .error({ AppError })
  .onError({ as: 'global' }, ({ error, set }) => {
    if (error instanceof AppError) {
      set.status = error.status
      return { message: error.message }
    }
  })
```

### Auth (Better Auth)

```bash
bun add better-auth
bunx @better-auth/cli generate   # hasilnya taruh di auth.schema.ts
bunx drizzle-kit generate && bunx drizzle-kit migrate
```

```ts
// features/auth/auth.ts
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db } from '../../db'
import * as schema from './auth.schema'

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: 'pg', schema }),
  emailAndPassword: { enabled: true },
  trustedOrigins: [process.env.CORS_ORIGIN!],
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL
})
```

```ts
// features/auth/auth.plugin.ts
import { Elysia } from 'elysia'
import { auth } from './auth'

export const authPlugin = new Elysia({ name: 'better-auth' })
  .mount(auth.handler)   // melayani /api/auth/*
  .macro({
    auth: {
      async resolve({ status, request: { headers } }) {
        const session = await auth.api.getSession({ headers })
        if (!session) return status(401)
        return { user: session.user, session: session.session }
      }
    }
  })
```

Route terproteksi cukup menambahkan `{ auth: true }`, lalu `user` tersedia di handler.

### Contoh satu fitur utuh: `posts`

```ts
// posts.schema.ts
import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core'
import { user } from '../auth/auth.schema'

export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  body: text('body').notNull(),
  authorId: text('author_id').notNull().references(() => user.id),
  createdAt: timestamp('created_at').defaultNow().notNull()
})
```

```ts
// posts.repository.ts
import { eq, desc } from 'drizzle-orm'
import { db } from '../../db'
import { posts } from './posts.schema'

export const postsRepository = {
  findAll: () => db.select().from(posts).orderBy(desc(posts.createdAt)),
  findById: async (id: number) =>
    (await db.select().from(posts).where(eq(posts.id, id)))[0],
  create: async (data: typeof posts.$inferInsert) =>
    (await db.insert(posts).values(data).returning())[0]
}
```

```ts
// usecases/create-post.usecase.ts
import { postsRepository } from '../posts.repository'

type Input = { title: string; body: string; authorId: string }

export async function createPostUsecase(input: Input) {
  // aturan bisnis ada di sini (cek kuota, sanitasi, dst)
  return postsRepository.create(input)
}
```

```ts
// posts.model.ts
import { t } from 'elysia'

export const CreatePostBody = t.Object({
  title: t.String({ minLength: 3 }),
  body: t.String({ minLength: 1 })
})
export type CreatePostBody = typeof CreatePostBody.static
```

```ts
// posts.controller.ts
import { Elysia } from 'elysia'
import { CreatePostBody } from './posts.model'
import { createPostUsecase } from './usecases/create-post.usecase'
import { listPostsUsecase } from './usecases/list-posts.usecase'

export const postsController = new Elysia({ prefix: '/posts' })
  .get('/', () => listPostsUsecase())
  .post(
    '/',
    ({ body, user }) => createPostUsecase({ ...body, authorId: user.id }),
    { auth: true, body: CreatePostBody }
  )
```

```ts
// index.ts
export { postsController } from './posts.controller'
```

---

## 5. Frontend: `apps/web`

```
apps/web/
├── src/
│   ├── app/                          → routing saja (tipis)
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── globals.css
│   │   ├── error.tsx
│   │   ├── not-found.tsx
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   └── (dashboard)/
│   │       ├── layout.tsx
│   │       ├── dashboard/page.tsx
│   │       └── posts/
│   │           ├── page.tsx
│   │           ├── new/page.tsx
│   │           └── [id]/page.tsx
│   │
│   ├── features/
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   │   ├── login-form.tsx
│   │   │   │   └── register-form.tsx
│   │   │   ├── hooks/
│   │   │   │   └── use-session.ts
│   │   │   ├── lib/
│   │   │   │   └── auth-client.ts
│   │   │   └── index.ts
│   │   │
│   │   └── posts/
│   │       ├── components/
│   │       │   ├── post-list.tsx
│   │       │   └── post-form.tsx
│   │       ├── hooks/
│   │       │   ├── use-posts.ts
│   │       │   └── use-create-post.ts
│   │       ├── api/
│   │       │   └── posts.api.ts      → bungkus Eden
│   │       ├── query-keys.ts
│   │       └── index.ts
│   │
│   ├── components/                   → generik, tidak tahu fitur
│   │   ├── ui/                       → button, input, modal, dst
│   │   └── layout/                   → navbar, sidebar, footer
│   │
│   ├── lib/
│   │   ├── api-client.ts             → instance Eden Treaty
│   │   ├── query-client.ts
│   │   └── utils.ts
│   │
│   ├── providers/
│   │   └── query-provider.tsx
│   │
│   └── middleware.ts
│
├── public/
├── next.config.ts
├── package.json
├── tsconfig.json
└── .env.local
```

### Konfigurasi inti

```ts
// next.config.ts
import type { NextConfig } from 'next'

const config: NextConfig = {
  transpilePackages: ['@my-project/shared']
}
export default config
```

```ts
// lib/api-client.ts
import { treaty } from '@elysiajs/eden'
import type { App } from '@my-project/api'

export const apiClient = treaty<App>(process.env.NEXT_PUBLIC_API_URL!, {
  fetch: { credentials: 'include' }
})
```

```ts
// features/auth/lib/auth-client.ts
import { createAuthClient } from 'better-auth/react'

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL
})

export const { signIn, signUp, signOut, useSession } = authClient
```

```ts
// middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import { getSessionCookie } from 'better-auth/cookies'

export function middleware(req: NextRequest) {
  const session = getSessionCookie(req)
  if (!session) return NextResponse.redirect(new URL('/login', req.url))
  return NextResponse.next()
}

export const config = { matcher: ['/dashboard/:path*', '/posts/:path*'] }
```

Middleware hanya cek keberadaan cookie (untuk redirect). Validasi sebenarnya ada di BE lewat `auth: true`.

### Contoh satu fitur: `posts`

```ts
// features/posts/query-keys.ts
export const postKeys = {
  all: ['posts'] as const,
  detail: (id: number) => ['posts', id] as const
}
```

```ts
// features/posts/api/posts.api.ts
import { apiClient } from '@/lib/api-client'

export const postsApi = {
  list: async () => {
    const { data, error } = await apiClient.posts.get()
    if (error) throw error
    return data
  },
  create: async (body: { title: string; body: string }) => {
    const { data, error } = await apiClient.posts.post(body)
    if (error) throw error
    return data
  }
}
```

```ts
// features/posts/hooks/use-posts.ts
'use client'
import { useQuery } from '@tanstack/react-query'
import { postsApi } from '../api/posts.api'
import { postKeys } from '../query-keys'

export const usePosts = () =>
  useQuery({ queryKey: postKeys.all, queryFn: postsApi.list })
```

```ts
// features/posts/hooks/use-create-post.ts
'use client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { postsApi } from '../api/posts.api'
import { postKeys } from '../query-keys'

export const useCreatePost = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: postsApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: postKeys.all })
  })
}
```

```tsx
// app/(dashboard)/posts/page.tsx  → tipis
import { PostList } from '@/features/posts'

export default function PostsPage() {
  return <PostList />
}
```

---

## 6. Shared: `packages/shared`

```
packages/shared/
├── src/
│   ├── constants/
│   │   ├── roles.ts
│   │   └── post-status.ts
│   ├── utils/
│   │   ├── format-rupiah.ts
│   │   └── slugify.ts
│   └── index.ts
├── package.json
└── tsconfig.json
```

```json
{
  "name": "@my-project/shared",
  "private": true,
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts"
}
```

```ts
// constants/roles.ts
export const ROLES = ['admin', 'user'] as const
export type Role = (typeof ROLES)[number]
```

```ts
// utils/format-rupiah.ts
export const formatRupiah = (n: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', maximumFractionDigits: 0
  }).format(n)
```

Isi `shared` hanya **konstanta dan fungsi murni**. Type body/response endpoint **tidak** ditaruh di sini, karena sudah otomatis dari BE via Eden.

---

## 7. Aturan Dependensi

```
web ──► shared ◄── api
web ──(import type saja)──► api
```

| Dari | Boleh import | Dilarang |
|---|---|---|
| `apps/web` | `shared`, `import type` dari `api` | import runtime dari `api` |
| `apps/api` | `shared` | apa pun dari `web` |
| `packages/shared` | tidak ada app | `api`, `web`, `elysia`, `drizzle`, `react` |
| `features/A` | `core/`, `db/`, `shared`, `features/B/index.ts` | file internal `features/B/*` |
| `core/` | `shared` | `features/*` |

---

## 8. Aturan per Layer (BE)

| Layer | Tugas | Dilarang |
|---|---|---|
| **controller** | validasi (model), ambil `user` dari macro, panggil usecase, return | logika bisnis, query DB |
| **model** | skema validasi TypeBox, type turunan | akses DB |
| **usecase** | aturan bisnis, orkestrasi beberapa repo, lempar `AppError` | import Elysia, akses `set`/`request`, query langsung |
| **repository** | query Drizzle, hanya urusan data | aturan bisnis, lempar error bisnis |
| **schema** | definisi tabel | logika |

Aturan tambahan:

- **Satu file usecase = satu aksi**, nama fungsi `verbNounUsecase`.
- **Usecase menerima data polos** (`authorId`, bukan objek `user` Elysia), jadi mudah dites.
- **Transaksi** yang melibatkan beberapa repo dikontrol di usecase.
- **Error** dilempar lewat `AppError` dan ditangkap `error-handler`, controller tidak perlu try/catch.
- **Tabel `user`** milik Better Auth. Fitur lain cukup referensi ke `user.id`, jangan buat tabel `users` sendiri.
- **Kolom tambahan user** (misal `role`) lewat `user.additionalFields` di config Better Auth, lalu generate ulang schema.

---

## 9. Aturan di FE

- **`app/` hanya routing**: ambil params, render komponen fitur. Tidak ada fetch atau logika.
- **Alur data**: component → hook (TanStack Query) → `*.api.ts` (Eden) → BE.
- **Komponen tidak memanggil Eden langsung**, harus lewat hook atau api layer.
- **Server state di TanStack Query**, bukan `useState`/`useEffect`.
- **Query key dikumpulkan** di `query-keys.ts` per fitur supaya invalidasi konsisten.
- **`components/ui` generik**: tidak boleh import dari `features/`.
- **Antar fitur lewat `index.ts`**, jangan masuk ke folder dalam fitur lain.
- **Auth**: `authClient` untuk `/api/auth/*` (tidak ter-type di Eden), Eden untuk endpoint lainnya.
- **Server component** yang butuh session: teruskan header cookie ke `authClient.getSession({ fetchOptions: { headers: await headers() } })`.
- **Validasi form**: andalkan validasi HTML dasar plus pesan error dari BE. Kalau perlu validasi kaya, taruh schema di `shared`.

---

## 10. Penamaan

| Hal | Format | Contoh |
|---|---|---|
| File | kebab-case | `create-post.usecase.ts` |
| Suffix BE | `.controller` `.usecase` `.repository` `.model` `.schema` | `posts.repository.ts` |
| Fungsi usecase | `verbNounUsecase` | `createPostUsecase` |
| Komponen React | PascalCase (file kebab-case) | `PostList` di `post-list.tsx` |
| Hook | `useXxx` | `useCreatePost` |
| Tabel DB | snake_case jamak | `posts`, `post_tags` |
| Folder fitur | jamak, huruf kecil | `posts`, `users` |

---

## 11. Environment

```
# apps/api/.env
DATABASE_URL=postgres://user:pass@localhost:5432/mydb
BETTER_AUTH_SECRET=isi-random-panjang
BETTER_AUTH_URL=http://localhost:3001
CORS_ORIGIN=http://localhost:3000

# apps/web/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3001
```

- Commit `.env.example` saja, `.env*` masuk `.gitignore`.
- Validasi env BE di `core/config/env.ts` supaya gagal cepat kalau ada yang kurang.
- Di production, pakai domain induk yang sama (`app.domain.com` dan `api.domain.com`) agar cookie session jalan, dan pastikan `trustedOrigins` serta CORS `credentials: true` benar.

---

## 12. Alur Request Lengkap

```
Browser
  → Next.js page (app/) → komponen fitur → hook → api (Eden)
  → HTTP + cookie session
  → Elysia: cors → macro auth → controller (validasi body)
  → usecase (aturan bisnis)
  → repository (Drizzle)
  → PostgreSQL
  ← JSON, type-nya otomatis sampai ke FE
```

---

## 13. Checklist Tambah Fitur Baru

1. **BE**: buat `features/<nama>/` berisi schema, repository, usecases, model, controller, `index.ts`.
2. Tambah `export *` di `db/schema.ts`, lalu `.use(controller)` di `app.ts`.
3. Jalankan `bun db:generate` lalu `bun db:migrate`.
4. **FE**: buat `features/<nama>/` berisi `api`, `hooks`, `components`, `query-keys.ts`, `index.ts`.
5. Tambah halaman tipis di `app/`.
6. Kalau ada konstanta atau util yang dipakai dua sisi, taruh di `shared`.
7. Jalankan `bun typecheck`. Kalau FE merah, berarti kontrak BE berubah dan harus disesuaikan.

---

## 14. Kesalahan Umum yang Dihindari

- Menaruh query DB di controller atau logika bisnis di route handler.
- Usecase yang meng-import `Elysia` atau membaca `request`.
- Import runtime dari `apps/api` ke `apps/web` (hanya `import type`).
- Menulis ulang type body/response di FE.
- `shared` diisi kode yang butuh `elysia`, `drizzle`, atau `react`.
- Fitur saling mengimpor file internal, bukan lewat `index.ts`.
- Membuat usecase untuk semua hal padahal hanya meneruskan ke repo. Kalau mayoritas begitu, boleh dilewati untuk read sederhana, tapi pilih satu konvensi dan konsisten.
