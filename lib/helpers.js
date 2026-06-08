/**
 * lib/helpers.js
 * Pure functions & constants — tidak ada state, aman diimport dari mana saja.
 */

// Warna untuk kategori dan avatar
export const COLORS     = ['#10b981','#0ea5e9','#f59e0b','#8b5cf6','#f43f5e','#14b8a6','#6366f1','#fb923c']
export const AVATAR_BG  = ['#0f766e','#7c3aed','#0369a1','#b45309','#be123c','#15803d']

/** Generate unique ID */
export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7)

/** Tanggal hari ini dalam format YYYY-MM-DD */
export const todayISO = () => new Date().toISOString().slice(0, 10)

/** Cek apakah ISO string adalah hari ini */
export const isToday = (iso) => new Date(iso).toDateString() === new Date().toDateString()

/** Format angka ke Rupiah: "Rp 1.250.000" */
export const formatRupiah = (n) => 'Rp ' + Math.round(n || 0).toLocaleString('id-ID')

/** Format angka singkat untuk chart axis: "1.2jt", "500rb" */
export const rpShort = (n) => {
  if (n >= 1e9) return (n / 1e9).toFixed(1).replace('.0', '') + 'M'
  if (n >= 1e6) return (n / 1e6).toFixed(1).replace('.0', '') + 'jt'
  if (n >= 1e3) return Math.round(n / 1e3) + 'rb'
  return '' + n
}

/** Format tanggal: "5 Jan 2025" */
export const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })

/** Format datetime: "5 Jan 2025, 10:30" */
export const formatDateTime = (iso) =>
  new Date(iso).toLocaleString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })

/** Ambil 1-2 huruf awal dari nama: "Pak Budi" → "PB" */
export const initialsOf = (name) =>
  name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()

/** Warna kategori berdasarkan posisi dalam daftar kategori */
export function getCatColor(name, categories) {
  const allCats = [...(categories.income || []), ...(categories.expense || [])]
  return COLORS[Math.max(0, allCats.indexOf(name)) % COLORS.length]
}

/** Warna avatar berdasarkan index user */
export function getUserColor(id, users) {
  return AVATAR_BG[Math.max(0, users.findIndex((u) => u.id === id)) % AVATAR_BG.length]
}

/** Nama user berdasarkan ID */
export function getUserName(id, users) {
  return (users.find((u) => u.id === id) || { name: '—' }).name
}

/**
 * Cek apakah tanggal ISO masuk dalam periode filter.
 * @param {string} iso - tanggal dalam format YYYY-MM-DD
 * @param {string} key - 'bulan-ini'|'bulan-lalu'|'3-bulan'|'tahun-ini'|'semua'
 */
export function inPeriod(iso, key) {
  const d   = new Date(iso)
  const now = new Date()
  if (key === 'semua')     return true
  if (key === 'bulan-ini') return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
  if (key === 'bulan-lalu') {
    const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    return d.getFullYear() === lm.getFullYear() && d.getMonth() === lm.getMonth()
  }
  if (key === '3-bulan') {
    const s = new Date(now.getFullYear(), now.getMonth() - 2, 1)
    return d >= s
  }
  if (key === 'tahun-ini') return d.getFullYear() === now.getFullYear()
  return true
}

export const PERIOD_LABELS = {
  'bulan-ini':  'Bulan Ini',
  'bulan-lalu': 'Bulan Lalu',
  '3-bulan':    '3 Bulan Terakhir',
  'tahun-ini':  'Tahun Ini',
  'semua':      'Semua',
}
