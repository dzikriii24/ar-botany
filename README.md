# Botani WebAR Project

Sebuah Single Page Application (SPA) berbasis WebAR untuk edukasi dan pengumpulan data tanaman endemik Indonesia. Proyek ini memadukan HTML5 Canvas, Vanilla JS, A-Frame (AR.js), serta Supabase sebagai Backend-as-a-Service (BaaS) lengkap dengan desain ala retro trading card game.

## 🚀 Fitur Utama
1. **Scanner View (AR)**: Menggunakan kamera perangkat untuk melacak marker QR Code dan menampilkan model 3D (`.glb`) di atas marker.
2. **Collection View**:
   - **Tanaman Endemik**: Menampilkan daftar 12 tanaman yang sudah dikonfigurasi, lengkap dengan rating bintang dan warna cerah retro.
   - **Karya Pengguna**: Menarik data koleksi komunitas dari basis data Supabase.
3. **Draw View**:
   - Papan gambar responsif menggunakan HTML5 Canvas.
   - Pemilihan ukuran brush & warna.
   - Fitur simpan & bagikan yang otomatis mengunggah gambar ke Storage Bucket Supabase.

---

## 🛠 Instalasi dan Menjalankan Proyek Secara Lokal

Proyek ini menggunakan dependensi CDN untuk Three.js, A-Frame, AR.js, TailwindCSS, dan Supabase. Kamu tidak perlu melakukan proses `npm install` atau `build`.

1. Klon repositori atau salin folder proyek.
2. Tempatkan model 3D (berformat `.glb`) yang relevan ke dalam folder `assets/models/`.
3. Buka folder menggunakan **Live Server** (ekstensi VS Code) atau server lokal statis apa pun:
   ```bash
   npx serve .
   ```
   *(Harus menggunakan localhost / protokol HTTPS supaya browser mengizinkan akses ke kamera dan komponen AR berjalan).*
4. Akses melalui URL `http://localhost:3000?id=ulin` untuk mengetes query ID tanaman yang bersangkutan.

---

## ⚙️ Setup Supabase (Wajib)

Agar fitur otentikasi (Login/Register) dan fitur Draw & Save (unggah ke koleksi komunitas) berfungsi, kamu harus mengkonfigurasi proyek Supabase terlebih dahulu.

### 1. Inisialisasi Kredensial Supabase
Buka file `js/supabase-db.js` dan ganti nilai variabel berikut dengan kredensial dari Dashboard Supabase milikmu:
```javascript
const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';
```

### 2. Inisialisasi Skema Tabel (SQL Editor)
Jalankan query berikut pada tab **SQL Editor** di Dashboard Supabase untuk membuat tabel penyimpanan beserta konfigurasi Row Level Security (RLS)-nya.

```sql
create table public.user_collections (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  plant_name text not null,
  image_url text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Mengaktifkan pengamanan (RLS)
alter table public.user_collections enable row level security;

-- Memberikan izin kepada siapa pun (termasuk anonim) untuk BISA MEMBACA data koleksi pengguna
create policy "Allow public read" on public.user_collections for select using (true);

-- Memberikan izin kepada PENGGUNA TEROTENTIKASI untuk BISA MENULIS (Insert) data baru
create policy "Allow authenticated insert" on public.user_collections for insert with check (auth.role() = 'authenticated');
```

### 3. Setup Storage Bucket (Penting!)
1. Pergi ke bagian **Storage** di Supabase.
2. Buat sebuah Bucket baru dengan nama persis: `drawings`
3. **Pastikan Bucket di set menjadi "Public"** agar gambar bisa diakses dari web (tabel hanya menyimpan URL public saja).
4. *(Opsional)* Jika kamu menghadapi masalah akses penyimpanan, tambahkan Storage Policy untuk mengizinkan `INSERT` dari pengguna dengan *authenticated role* ke bucket `drawings`.
