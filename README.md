# Kasbon - Aplikasi Pencatat Utang Piutang

Aplikasi web sederhana untuk melacak utang piutang pribadi. Dibangun menggunakan Next.js 16 (App Router), Supabase (Auth + PostgreSQL), dan Tailwind CSS v4.

## Setup & Instalasi Lokal

1. Clone repositori ini.
2. Install dependensi dengan `npm install`.
3. Buat file `.env.local` dan isi dengan kredensial Supabase Anda:

- NEXT_PUBLIC_SUPABASE_URL=key_anda
- NEXT_PUBLIC_SUPABASE_ANON_KEY=key_anda
-SUPABASE_SECRET_KEY=key_anda

4. Jalankan SQL migration yang terdapat di `supabase/migrations/20240101000000_init_debts.sql` pada SQL Editor di dashboard Supabase Anda untuk membuat tabel dan mengaktifkan RLS.
5. Jalankan *development server* dengan `npm run dev`.

## Demo
https://kasbon-test.vercel.app/

## Approach (Keputusan Teknis)
Saya mengadopsi arsitektur pemisahan *Client Components* dan *Server-side API Routes* pada Next.js. Halaman *dashboard* menggunakan *Client Components* agar interaksi UI seperti *toggle* status lunas, *filter*, dan kalkulasi *summary* dapat berjalan instan dan reaktif. Untuk keamanan, proteksi berlapis diterapkan: *Middleware/Proxy* untuk memblokir akses rute *frontend*, API Routes divalidasi dengan pengecekan sesi *backend*, dan kebijakan *Row Level Security* (RLS) ketat di level *database* Postgres untuk memastikan data terisolasi sempurna secara kriptografis berdasarkan `auth.uid()`.

## Trade-off (Jika Ada Waktu Ekstra)
Jika ada waktu lebih 1 hari, saya akan menambahkan implementasi *pagination* atau *infinite scroll* pada *list* utang agar performa tetap optimal saat data mencapai ribuan baris. Saya juga akan memoles *Error Boundary* global serta menambahkan grafik (*bar chart*) sederhana untuk visualisasi komparasi utang dan piutang bulanan.

## Time Spent
- Setup & Database (RLS): [Isi estimasi jam, misal: 1 jam]
- Auth & Middleware: [Isi estimasi jam, misal: 1 jam]
- API CRUD & UI Dashboard: [Isi estimasi jam, misal: 2 jam]
- Total: [Isi total jam]

---
*Dibuat oleh Budi Cahyono*