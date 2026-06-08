/**
 * lib/seed.js
 * Data awal bawaan — profil bisnis, user, kategori, dan contoh transaksi.
 * Disesuaikan untuk kedai kopi. Hanya dipakai sekali saat pertama buka app.
 */

import { uid } from './helpers'

// Profil bisnis default (bisa diganti di halaman Pengaturan)
export const SEED_BIZ = {
  name:  'Kedai Kopi',
  owner: '',
  since: new Date().toISOString(),
}

export const SEED_USERS = [
  { id: 'u_owner', name: 'Pemilik', role: 'owner' },
  { id: 'u_kasir', name: 'Barista', role: 'kasir' },
]

// Kategori khas kedai kopi
export const SEED_CAT = {
  income:  ['Kopi', 'Non-Kopi', 'Makanan / Snack', 'Pendapatan Lain'],
  expense: ['Biji Kopi', 'Susu & Bahan', 'Gaji Barista', 'Sewa Tempat', 'Listrik & Air', 'Gelas & Kemasan', 'Marketing', 'Lain-lain'],
}

/**
 * Buat contoh transaksi 6 bulan untuk kedai kopi.
 * Supaya dashboard langsung "hidup" saat demo ke calon klien.
 * (Bisa dihapus lewat Pengaturan → Hapus Semua Transaksi saat mulai pakai beneran.)
 */
export function buildSeed() {
  const now = new Date()
  const tx  = []

  const add = (mAgo, day, type, category, amount, desc, user) => {
    const d = new Date(now.getFullYear(), now.getMonth() - mAgo, day, 10, 0, 0)
    tx.push({
      id:          uid(),
      type,
      category,
      amount,
      description: desc,
      date:        d.toISOString().slice(0, 10),
      photo:       null,
      createdBy:   user,
      createdAt:   d.toISOString(),
      updatedAt:   d.toISOString(),
    })
  }

  // Pola realistis kedai kopi: penjualan harian kopi tinggi, biaya bahan & gaji rutin
  for (let m = 5; m >= 0; m--) {
    const base = 6800000 - m * 200000
    add(m,  6,  'income',  'Kopi',            base + (m % 2 ? 500000 : 0),  'Penjualan kopi 2 minggu',   'u_kasir')
    add(m,  18, 'income',  'Kopi',            5200000 + m * 150000,          'Penjualan kopi akhir bulan','u_kasir')
    add(m,  12, 'income',  'Non-Kopi',        1900000 - (m % 3) * 150000,    'Teh, coklat, jus',          'u_kasir')
    add(m,  22, 'income',  'Makanan / Snack', 2300000 + m * 80000,           'Roti, kue, snack',          'u_kasir')
    add(m,  5,  'expense', 'Biji Kopi',       2200000 + (m % 2 ? 200000 : 0),'Restok biji kopi',          'u_owner')
    add(m,  7,  'expense', 'Susu & Bahan',    1450000,                        'Susu, gula, sirup',         'u_owner')
    add(m,  1,  'expense', 'Sewa Tempat',     2800000,                        'Sewa kedai bulanan',        'u_owner')
    add(m,  2,  'expense', 'Gaji Barista',    3000000,                        'Gaji 2 barista',            'u_owner')
    add(m,  8,  'expense', 'Listrik & Air',   620000 + (m % 2) * 50000,      'Tagihan PLN & PDAM',        'u_kasir')
    add(m,  10, 'expense', 'Gelas & Kemasan', 540000,                         'Cup, sedotan, tutup',       'u_owner')
    if (m % 2 === 0) add(m, 15, 'expense', 'Marketing',       450000, 'Promo & konten sosmed',   'u_owner')
    if (m % 3 === 0) add(m, 20, 'income',  'Pendapatan Lain', 700000, 'Penjualan merchandise',   'u_owner')
  }

  return tx
}
