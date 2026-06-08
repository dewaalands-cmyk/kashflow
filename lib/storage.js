/**
 * lib/storage.js
 * Helper untuk baca/tulis data dari localStorage.
 * Semua fungsi aman untuk SSR — dicek dengan typeof window.
 */

export const KEYS = {
  tx:    'kasflow_tx_v2',
  cat:   'kasflow_cat_v2',
  users: 'kasflow_users_v2',
  audit: 'kasflow_audit_v2',
  biz:   'kasflow_biz_v1',
}

/**
 * Baca data dari localStorage.
 * @returns {any|null} - data yang sudah di-parse, atau null kalau tidak ada / error
 */
export function loadData(key) {
  if (typeof window === 'undefined') return null
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : null
  } catch (e) {
    console.error('[Kasflow] Gagal membaca storage:', e)
    return null
  }
}

/**
 * Simpan data ke localStorage.
 */
export function saveData(key, value) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.error('[Kasflow] Gagal menyimpan storage:', e)
  }
}

/**
 * Hapus satu key dari localStorage.
 */
export function removeData(key) {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(key)
  } catch (e) {
    console.error('[Kasflow] Gagal menghapus storage:', e)
  }
}
