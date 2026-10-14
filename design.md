---
version: 1.0
name: EddysEnglish
description: Design system resmi EDDY'S English — berbasis identitas visual nyata dengan palet tricolor (Deep Navy, Golden Yellow, Crimson Red), tipografi sans-serif berbobot tegas, tata letak kartu modern, dan aksen kurva organik.
colors:
  primary: "#0D3B66"
  primary-hover: "#092C4D"
  primary-dark: "#082542"
  accent-yellow: "#F4B41A"
  accent-yellow-hover: "#DDA012"
  accent-red: "#9E1B1B"
  accent-red-hover: "#841515"
  secondary: "#1B4965"
  neutral-bg: "#F8FAFC"
  neutral-card: "#FFFFFF"
  text-primary: "#0F172A"
  text-secondary: "#475569"
  text-muted: "#64748B"
  text-on-dark: "#FFFFFF"
  border-subtle: "#E2E8F0"
  footer-navy: "#0A2540"
  footer-stripe: "#8A1414"
typography:
  font-heading: "Plus Jakarta Sans, Montserrat, sans-serif"
  font-body: "Inter, sans-serif"
  h1:
    fontFamily: "{typography.font-heading}"
    fontSize: 2.75rem
    fontWeight: 800
    lineHeight: 1.15
  h2:
    fontFamily: "{typography.font-heading}"
    fontSize: 2rem
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "0.025em"
  h3:
    fontFamily: "{typography.font-heading}"
    fontSize: 1.375rem
    fontWeight: 700
    lineHeight: 1.3
  body:
    fontFamily: "{typography.font-body}"
    fontSize: 0.9375rem
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "{typography.font-heading}"
    fontSize: 0.75rem
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: "0.05em"
rounded:
  sm: 4px
  md: 8px
  lg: 12px
  xl: 16px
  2xl: 20px
  3xl: 28px
  pill: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  3xl: 64px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#FFFFFF"
    rounded: "{rounded.lg}"
    padding: "py-2.5 px-5"
    fontWeight: 700
  button-yellow:
    backgroundColor: "{colors.accent-yellow}"
    textColor: "#0F172A"
    rounded: "{rounded.lg}"
    padding: "py-2.5 px-5"
    fontWeight: 700
  button-red:
    backgroundColor: "{colors.accent-red}"
    textColor: "#FFFFFF"
    rounded: "{rounded.lg}"
    padding: "py-2.5 px-5"
    fontWeight: 700
  card-program:
    backgroundColor: "#FFFFFF"
    borderColor: "{colors.border-subtle}"
    rounded: "{rounded.2xl}"
    shadow: "shadow-sm hover:shadow-md"
---

# DESIGN SYSTEM — EDDY'S ENGLISH

## 1. Brand Overview & Visual Character

Design system ini merefleksikan identitas visual resmi **EDDY'S English** sebagaimana ditampilkan pada desain landing page institusi:
- **Tricolor Dominant**: Kombinasi kontras tinggi antara **Deep Navy (`#0D3B66`)**, **Golden Yellow (`#F4B41A`)**, dan **Crimson Red (`#9E1B1B`)**.
- **Karakter**: Edukatif, dinamis, ramah pemula namun tetap berbobot kredibilitas tinggi.
- **Bentuk Grafis**: Memadukan sudut membulat modern (`rounded-xl` / `rounded-2xl`) dengan kurva organik (*wave blobs*) pada area hero.

---

## 2. Color Palette (Semantic & Brand Tokens)

| Token | Nilai Hex | Peran / Penggunaan Utama |
|---|---|---|
| **Primary Navy** | `#0D3B66` | Header navigasi, judul section utama, tombol "Explore", container hero tengah, footer. |
| **Accent Yellow** | `#F4B41A` | Tombol CTA "FREE TRIAL", tombol "SEE MORE", aksen blob hero, tombol aksi sekunder. |
| **Accent Red** | `#9E1B1B` | Kategori badge aktif ("REGULAR CLASS"), wave blob hero kanan, tombol "Conversation", bar copyright footer. |
| **Secondary Teal/Navy** | `#1B4965` | Tombol filter alternatif, kartu pendukung. |
| **Neutral Surface** | `#FFFFFF` | Background kartu program, card review, modal, form input. |
| **Neutral Background** | `#F8FAFC` | Latar belakang section bodi untuk kontras dengan kartu putih. |
| **Footer Deep Navy** | `#0A2540` | Background utama footer lembaga. |
| **Footer Bottom Stripe** | `#8A1414` | Garis penutup hak cipta di bagian terbawah halaman. |

---

## 3. Typography Hierarchy

Menggunakan kombinasi font sans-serif tebal untuk *headlines* berenergi dan font netral untuk teks bacaan panjang:

1. **Heading Font**: `Plus Jakarta Sans` / `Montserrat` / `Inter` (Font Display, All-Caps untuk Section Headers).
   - `H1` (Hero Headline): `2.75rem` / `44px`, Bold 800, leading tight (`1.15`). Contoh: *"Think English, Think EDDY's"*.
   - `H2` (Section Titles): `2.00rem` / `32px`, Extra Bold 800, tracking wide, All-Caps (`ABOUT US`, `FEATURED PROGRAMS`, `PROGRAMS`, `LATEST PROMOTIONS`, `TESTIMONIALS`, `TEST YOUR ENGLISH`).
   - `H3` (Card Titles): `1.25rem` – `1.375rem`, Bold 700. Contoh: *"Sparkling Star"*, *"Little Stars"*, *"Young Learners"*.
2. **Body Font**: `Inter` / `system-ui`.
   - Bodi utama: `0.9375rem` / `15px`, Regular 400, leading `1.6`, warna `#475569`.
   - Price Display: `2.25rem` / `36px`, Extra Bold 800 Navy dengan simbol mata uang superskrip.
3. **Category Pills & Tags**:
   - `0.75rem` / `12px`, Bold 700, All-Caps, tracking `0.05em`.

---

## 4. Key Sections & Component Architecture

### A. Navigation Bar (Top Header)
- **Background**: Putih bersih (`#FFFFFF`) dengan border halus bawah (`#E2E8F0`).
- **Elemen Kiri**: Logo resmi EDDY'S English (icon biru + logotype).
- **Elemen Tengah**: Navigasi teks abu gelap (`Home`, `About`, `Programs`, `Events`, `Test English`).
- **Elemen Kanan**: Tombol Pill Golden Yellow `#F4B41A` bertuliskan **"FREE TRIAL"** (teks hitam tegas).

### B. Hero Section (Dynamic Organic Waves)
- **Komposisi Visual**: Memadukan 3 bidang warna organik bertumpuk:
  - Golden Yellow wave di kiri atas (`#F4B41A`).
  - Deep Navy shape di tengah (`#0D3B66`) menampung judul putih *"Think English, Think EDDY's"* dan deskripsi singkat.
  - Crimson Red wave di kanan bawah (`#9E1B1B`).
  - Dotted grid accent di sudut kanan atas.
- **CTA**: Tombol Golden Yellow berteks tegas.

### C. About Us
- Judul tengah `ABOUT US` berwarna Deep Navy.
- Paragraf ringkas berpusat di tengah.
- 3 Ikon Fitur Berjajar:
  1. *Certified Teachers* (Ikon Guru/Topi Akademik)
  2. *Accredited* (Ikon Ijazah/Kelulusan)
  3. *Facilities* (Ikon Ruang Kelas/Presentasi)

### D. Featured Programs (Split Banner)
- **Kiri**: Subtitle merah `REGULAR CLASS`, headline `Sparkling Star`, deskripsi program, dan tombol kuning `SEE MORE`.
- **Kanan**: Foto ruang kelas interaktif berbingkai bersih dengan aksen sudut kuning.

### E. Program Catalog Cards (4-Column / 2x2 Grid)
- **Filter Tabs**: Tab kapsul horizontal. Tab aktif berwarna Crimson Red (`#9E1B1B` teks putih), tab non-aktif abu netral.
- **Struktur Kartu Program**:
  - Foto kegiatan siswa di bagian atas (`rounded-t-2xl`).
  - Judul program merah tebal (mis. `Little Stars`, `Young Learners`, `Adults`).
  - Subteks usia / level target.
  - Tampilan harga menonjol (`100`, `200`, `250`).
  - Tombol aksi ganda: Tombol Navy **"Explore Program"** + Tombol Aksen Kuning.

### F. Test Your English (Assessment Banner)
- **Headline**: `TEST YOUR ENGLISH`.
- **Sub-headline**: *"Discover your level of English with our quick, free online test!"*.
- **3 Tombol Pilihan Tes**:
  1. **General English** (Deep Navy `#0D3B66`)
  2. **English for Work / Study** (Golden Yellow `#F4B41A`)
  3. **Conversation** (Crimson Red `#9E1B1B`)

### G. Footer (Institution Standard)
- **Background Utama**: Deep Navy (`#0A2540`).
- **Kolom Kiri**: Logo putih EDDY'S English + ikon sosial media bulat.
- **Kolom Tengah**: *"Get in Touch"* dengan pill highlight kuning, alamat, dan nomor telepon.
- **Kolom Kanan**: Form kontak / pendaftaran cepat dengan input putih dan tombol submit kuning.
- **Bottom Stripe**: Baris merah tua (`#8A1414`) dengan hak cipta di bagian paling bawah.

---

## 5. Shape, Radius, and Shadow Tokens

| Elemen | Radius | Shadow |
|---|---|---|
| Tombol Standar | `rounded-lg` (8px) s/d `rounded-xl` (12px) | `shadow-xs hover:shadow-sm` |
| Tombol CTA Header ("FREE TRIAL") | `rounded-full` (Pill) | `shadow-sm` |
| Kartu Program | `rounded-2xl` (16px) | `shadow-sm border border-slate-200/80` |
| Filter Tabs | `rounded-md` (6px) | Datar |
| Input Form | `rounded-md` (6px) | Border netral `#CBD5E1` |

---

## 6. Anti-Slop & Implementation Rules

1. **Warna Wajib Setia**: Dilarang mengganti warna khas EDDY'S English dengan warna generik (seperti biru Tailwind default `#2563EB` atau ungu SaaS). Gunakan selalu **Deep Navy (`#0D3B66`)**, **Golden Yellow (`#F4B41A`)**, dan **Crimson Red (`#9E1B1B`)**.
2. **Keterbacaan Kontras (WCAG AA)**: Teks di atas Golden Yellow wajib berwarna gelap (`#0F172A`). Teks di atas Navy dan Red wajib putih (`#FFFFFF`).
3. **Tanpa Dekorasi Palsu**: Jangan menambahkan badge AI mengambang, emoji dekoratif acak, atau gradien neon pelangi yang tidak ada pada identitas institusi EDDY'S English.
4. **Hierarki Judul Jelas**: Judul section harus berbobot tegas (Extra Bold/Black, All-Caps) untuk mempertahankan karakter tegas lembaga pendidikan internasional.
