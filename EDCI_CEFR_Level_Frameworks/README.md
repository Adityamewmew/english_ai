# EDCI CEFR Module Frameworks

Dokumen ini memisahkan framework pembelajaran menjadi satu file untuk setiap level CEFR agar lebih mudah diberikan kepada AI sebagai instruksi saat menghasilkan materi dari dataset klien.

## Daftar file

- `A1_Framework.md` — Beginner
- `A2_Framework.md` — Elementary
- `B1_Framework.md` — Intermediate
- `B2_Framework.md` — Upper-intermediate
- `C1_Framework.md` — Advanced
- `C2_Framework.md` — Proficiency

## Aturan universal

Berlaku untuk semua level dan seluruh skill:
- Post-test: minimal **5 item yang dinilai**.
- Challenge yang dinilai: minimal **5 item yang dinilai**.
- Practicum: minimal **10 item/komponen penilaian yang didefinisikan dengan jelas**.
- Vocabulary mendukung semua skill, tetapi tidak boleh menggantikan latihan skill utama.
- Reading practicum memakai teks baru; Listening practicum memakai audio baru; Writing dan Speaking memakai prompt/skenario baru.
- Writing dan Speaking dinilai dengan rubrik yang jelas, bukan hanya pilihan ganda.
- Materi yang dihasilkan harus sesuai level, bersumber dari dataset klien, tidak mengarang fakta yang bertentangan dengan sumber, dan melewati pemeriksaan kualitas.

## Alur unlock default

`Reading → Listening → Writing → Speaking → Module Complete`

Submodul berikutnya terbuka setelah practicum submodul saat ini lulus dan hasilnya tersimpan. Jika gagal, learner mendapatkan feedback, remedial yang relevan, dan kesempatan mengulang.

## Catatan

Ini adalah usulan framework produk yang disejajarkan secara umum dengan CEFR, bukan klaim bahwa EDCI telah menetapkan atau mengesahkan kurikulum resmi ini. Satu modul tidak otomatis menjadi bukti sertifikasi CEFR formal.
