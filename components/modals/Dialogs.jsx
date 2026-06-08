/**
 * components/modals/Dialogs.jsx
 * Dua modal kecil: ConfirmDialog (hapus transaksi) dan UserModal (tambah pengguna).
 */

'use client'

import { useState } from 'react'
import { Trash2, Users } from 'lucide-react'
import { formatRupiah, formatDate } from '@/lib/helpers'

/* ─────────────────────────────────────────────────────────── */
/* ConfirmDialog — konfirmasi sebelum hapus transaksi         */
/* ─────────────────────────────────────────────────────────── */
export function ConfirmDialog({ tx, onConfirm, onCancel }) {
  if (!tx) return null
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="kf-pop w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-rose-50 text-rose-600">
          <Trash2 size={20} />
        </div>
        <h3 className="font-display text-lg font-bold text-slate-900">Hapus transaksi?</h3>
        <p className="mt-1 text-sm text-slate-500">
          {tx.category} • {formatRupiah(tx.amount)} ({formatDate(tx.date)}).{' '}
          Tindakan ini akan tercatat di log aktivitas.
        </p>
        <div className="mt-5 flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-rose-600 py-2.5 text-sm font-semibold text-white hover:bg-rose-700"
          >
            Hapus
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────── */
/* UserModal — tambah pengguna baru                           */
/* ─────────────────────────────────────────────────────────── */
export function UserModal({ isOpen, onClose, onAdd }) {
  const [name, setName] = useState('')
  const [role, setRole] = useState('kasir')

  const handleAdd = () => {
    if (!name.trim()) return
    onAdd(name.trim(), role)
    setName('')
    setRole('kasir')
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="kf-pop w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <Users size={20} />
        </div>
        <h3 className="mb-4 font-display text-lg font-bold text-slate-900">Tambah Pengguna</h3>

        <label className="mb-1 block text-xs font-semibold text-slate-500">Nama</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nama pengguna"
          className="mb-4 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
        />

        <label className="mb-1 block text-xs font-semibold text-slate-500">Peran</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="mb-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
        >
          <option value="kasir">Kasir — hanya input & koreksi transaksi sendiri</option>
          <option value="owner">Owner — akses penuh</option>
        </select>
        <p className="mb-5 text-xs text-slate-400">
          Kasir tidak bisa menghapus atau mengubah transaksi orang lain — mencegah manipulasi.
        </p>

        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">
            Batal
          </button>
          <button onClick={handleAdd} className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700">
            Tambah
          </button>
        </div>
      </div>
    </div>
  )
}
