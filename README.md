# Kasflow — Buku Kas Digital

Aplikasi pencatatan keuangan untuk bisnis (UMKM, kedai kopi, warung, dll).
Dibuat oleh **Pagiverse Studio**.

---

## Fitur

- **Dashboard** — ringkasan pemasukan/pengeluaran/laba, grafik arus kas 6 bulan, donut per kategori
- **Transaksi** — tambah/edit/hapus, filter by tipe/kategori/periode/search, foto bukti nota
- **Laporan** — rincian per kategori, cetak PDF, export Excel
- **Log Aktivitas** — jejak setiap perubahan (anti-manipulasi)
- **Pengaturan** — profil bisnis, kelola pengguna, backup/restore, reset data
- **Multi-user** — Owner (akses penuh) vs Kasir (hanya input + koreksi transaksi sendiri)
- **PWA** — bisa di-install di HP/laptop, jalan offline
- **Offline-first** — data tersimpan lokal, aman tanpa internet

---

## Stack

| Layer       | Library                 |
|-------------|-------------------------|
| Framework   | Next.js 14 (App Router) |
| Styling     | Tailwind CSS            |
| Charts      | Recharts                |
| Icons       | Lucide React            |
| Export      | SheetJS (xlsx)          |
| PWA         | Service Worker + Manifest |
| Storage     | localStorage            |

---

## Instalasi & Menjalankan

```bash
# 1. Install dependencies
npm install

# 2a. Mode development (untuk ngoding & debug)
npm run dev

# 2b. Mode production (untuk dipakai beneran / launching)
npm run build
npm start
```

Buka `http://localhost:3000`

> **Penting:** Fitur PWA & offline (service worker) hanya aktif di mode **production**
> (`npm run build && npm start`) atau saat sudah di-deploy ke Vercel — bukan di `npm run dev`.

---

## Cara Install sebagai App (PWA)

Setelah di-deploy ke Vercel atau jalan di `npm start`:

**Di Laptop (Chrome/Edge):**
1. Buka websitenya
2. Klik ikon **install** (⊕) di address bar, atau menu ⋮ → "Install Kasflow"
3. Kasflow muncul sebagai app terpisah di desktop

**Di HP (Android/iOS):**
1. Buka di Chrome (Android) / Safari (iOS)
2. Menu → "Add to Home Screen" / "Tambahkan ke Layar Utama"
3. Icon Kasflow muncul di home screen

---

## Setup untuk Klien Baru (Launching)

Saat pertama pakai untuk bisnis sungguhan:

1. Buka **Pengaturan → Profil Bisnis** → isi nama kedai/bisnis & pemilik
2. **Pengaturan → Kelola Pengguna** → ganti nama "Pemilik"/"Barista" jadi nama staff asli, atur peran
3. **Pengaturan → Zona Berbahaya → Hapus Semua Transaksi** → hapus data contoh, mulai dari nol
4. Mulai catat transaksi harian!

> **Backup rutin:** Pengaturan → Backup & Pulihkan → "Unduh Backup (.json)".
> Simpan file-nya. Kalau ganti laptop / browser ke-reset, tinggal "Pulihkan dari Backup".

---

## Deploy ke Vercel

```bash
# 1. Push ke GitHub
git init
git add .
git commit -m "Kasflow v1"
git remote add origin https://github.com/USERNAME/kasflow.git
git push -u origin main

# 2. Di vercel.com → New Project → import repo GitHub → Deploy
```

Atau pakai Vercel CLI:
```bash
npm i -g vercel
vercel
```

---

## Debug dengan VS Code + Chrome

Sudah ada `.vscode/launch.json` dengan 2 konfigurasi:

1. Jalankan `npm run dev`
2. Tekan **F5** → pilih **"🐛 Chrome: Debug Kasflow"**
3. Set breakpoint di file `.jsx` → interaksi di Chrome → execution pause

---

## Struktur File

```
kasflow/
├── public/
│   ├── manifest.json     # PWA manifest
│   ├── sw.js             # Service worker (offline caching)
│   ├── icon-192.png      # Icon PWA
│   ├── icon-512.png
│   ├── apple-touch-icon.png
│   └── favicon.ico
├── app/
│   ├── globals.css       # Tailwind + custom CSS
│   ├── layout.jsx        # Root layout + fonts + PWA metadata
│   └── page.jsx          # Entry point
├── components/
│   ├── App.jsx           # State, logic, layout utama
│   ├── pages/
│   │   ├── DashboardPage.jsx
│   │   ├── TransaksiPage.jsx
│   │   ├── LaporanPage.jsx
│   │   ├── LogPage.jsx
│   │   └── SettingsPage.jsx   # Profil bisnis, user, backup/restore
│   ├── modals/
│   │   ├── TxModal.jsx
│   │   └── Dialogs.jsx
│   └── ui/
│       └── Cards.jsx
└── lib/
    ├── storage.js        # localStorage helpers
    ├── helpers.js        # Pure functions & constants
    └── seed.js           # Data contoh (kedai kopi)
```

---

## Next Steps — Upgrade ke Cloud (versi berbayar)

1. **Supabase** — cloud database untuk sync multi-device
2. **Auth** — login/register sesungguhnya
3. **Multi-tenant** — satu server untuk banyak klien bisnis

---

*Kasflow v1.0 — by Pagiverse Studio*
