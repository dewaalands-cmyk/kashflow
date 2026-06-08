/**
 * components/pages/SettingsPage.jsx
 * Pengaturan — profil bisnis, kelola pengguna, backup/restore, reset data.
 */

'use client'

import { useState, useRef } from 'react'
import {
  Store, Users, Download, Upload, Trash2, Info,
  Check, Pencil, X, ShieldAlert, UserPlus,
} from 'lucide-react'
import { SectionCard } from '@/components/ui/Cards'
import { formatDate, getUserColor, initialsOf } from '@/lib/helpers'

const INPUT_CLS = 'w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100'

export default function SettingsPage({
  biz, onSaveBusiness,
  users, currentUserId, onEditUser, onDeleteUser, onAddUser,
  onBackup, onRestore, onClearTransactions,
  txCount, logCount,
}) {
  // ── Profil bisnis ──
  const [name,  setName]  = useState(biz.name || '')
  const [owner, setOwner] = useState(biz.owner || '')
  const [savedBiz, setSavedBiz] = useState(false)

  const saveBiz = () => {
    if (!name.trim()) return
    onSaveBusiness(name.trim(), owner.trim())
    setSavedBiz(true)
    setTimeout(() => setSavedBiz(false), 2000)
  }

  // ── Edit user inline ──
  const [editingId, setEditingId] = useState(null)
  const [editName,  setEditName]  = useState('')
  const [editRole,  setEditRole]  = useState('kasir')

  const startEdit = (u) => { setEditingId(u.id); setEditName(u.name); setEditRole(u.role) }
  const saveEdit  = () => {
    if (!editName.trim()) return
    onEditUser(editingId, { name: editName.trim(), role: editRole })
    setEditingId(null)
  }

  const ownerCount = users.filter((u) => u.role === 'owner').length

  // ── Restore: parse file → tampilkan ringkasan → konfirmasi ──
  const fileRef = useRef(null)
  const [pending, setPending] = useState(null) // data backup yang siap dipulihkan

  const handleFile = (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result)
        if (parsed.app !== 'Kasflow' || !parsed.data) {
          alert('File ini bukan backup Kasflow yang valid.')
          return
        }
        setPending(parsed)
      } catch {
        alert('Gagal membaca file. Pastikan file backup .json valid.')
      }
    }
    reader.readAsText(f)
    e.target.value = '' // reset supaya bisa pilih file sama lagi
  }

  const confirmRestore = () => {
    onRestore(pending.data)
    setPending(null)
  }

  // ── Clear transactions: tombol 2 langkah ──
  const [armed, setArmed] = useState(false)
  const handleClear = () => {
    if (!armed) {
      setArmed(true)
      setTimeout(() => setArmed(false), 4000)
      return
    }
    onClearTransactions()
    setArmed(false)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">

      {/* ── Profil Bisnis ── */}
      <SectionCard title="Profil Bisnis" subtitle="Nama ini tampil di sidebar, laporan, dan file export">
        <div className="flex items-center gap-3 rounded-xl bg-emerald-50 p-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white">
            <Store size={20} />
          </span>
          <div className="text-sm">
            <div className="font-semibold text-slate-800">{biz.name || 'Belum diatur'}</div>
            <div className="text-xs text-slate-500">Aktif sejak {formatDate(biz.since)}</div>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-500">Nama Bisnis</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Contoh: Kopi Senja" className={INPUT_CLS} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-500">Nama Pemilik (opsional)</label>
            <input value={owner} onChange={(e) => setOwner(e.target.value)} placeholder="Contoh: Budi Santoso" className={INPUT_CLS} />
          </div>
          <button
            onClick={saveBiz}
            className={'flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition ' +
              (savedBiz ? 'bg-emerald-500' : 'bg-emerald-600 hover:bg-emerald-700')}
          >
            {savedBiz ? <><Check size={16} /> Tersimpan</> : 'Simpan Profil'}
          </button>
        </div>
      </SectionCard>

      {/* ── Kelola Pengguna ── */}
      <SectionCard
        title="Kelola Pengguna"
        subtitle="Atur siapa yang bisa mengakses & input transaksi"
        right={
          <button onClick={onAddUser} className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            <UserPlus size={15} /> Tambah
          </button>
        }
      >
        <div className="space-y-2">
          {users.map((u) => (
            <div key={u.id} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3">
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white"
                style={{ background: getUserColor(u.id, users) }}
              >
                {initialsOf(u.name)}
              </span>

              {editingId === u.id ? (
                <>
                  <input value={editName} onChange={(e) => setEditName(e.target.value)} className="flex-1 rounded-lg border border-slate-200 px-2 py-1.5 text-sm focus:border-emerald-400 focus:outline-none" autoFocus />
                  <select value={editRole} onChange={(e) => setEditRole(e.target.value)} className="rounded-lg border border-slate-200 px-2 py-1.5 text-sm">
                    <option value="kasir">Kasir</option>
                    <option value="owner">Owner</option>
                  </select>
                  <button onClick={saveEdit} className="rounded-lg bg-emerald-600 p-1.5 text-white hover:bg-emerald-700"><Check size={15} /></button>
                  <button onClick={() => setEditingId(null)} className="rounded-lg bg-slate-100 p-1.5 text-slate-500 hover:bg-slate-200"><X size={15} /></button>
                </>
              ) : (
                <>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-slate-800">
                      {u.name}
                      {u.id === currentUserId && <span className="ml-2 rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-600">Anda</span>}
                    </div>
                    <div className="text-xs capitalize text-slate-400">{u.role === 'owner' ? 'Owner — akses penuh' : 'Kasir — input & koreksi sendiri'}</div>
                  </div>
                  <button onClick={() => startEdit(u)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><Pencil size={15} /></button>
                  <button
                    onClick={() => {
                      if (u.role === 'owner' && ownerCount <= 1) { alert('Minimal harus ada 1 Owner.'); return }
                      if (u.id === currentUserId) { alert('Tidak bisa menghapus pengguna yang sedang aktif.'); return }
                      onDeleteUser(u.id)
                    }}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                  >
                    <Trash2 size={15} />
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-slate-400">
          Kasir hanya bisa mengubah/menghapus transaksi yang ia buat sendiri di hari yang sama — mencegah manipulasi data.
        </p>
      </SectionCard>

      {/* ── Backup & Pulihkan ── */}
      <SectionCard title="Backup & Pulihkan Data" subtitle="Data tersimpan di perangkat ini. Backup rutin untuk jaga-jaga.">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button onClick={onBackup} className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
            <Download size={16} /> Unduh Backup (.json)
          </button>
          <button onClick={() => fileRef.current?.click()} className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
            <Upload size={16} /> Pulihkan dari Backup
          </button>
          <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={handleFile} />
        </div>

        {/* Ringkasan sebelum restore */}
        {pending && (
          <div className="kf-pop mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-start gap-2">
              <ShieldAlert size={18} className="mt-0.5 shrink-0 text-amber-600" />
              <div className="text-sm text-amber-900">
                <p className="font-semibold">Pulihkan data ini?</p>
                <p className="mt-1 text-amber-800">
                  Backup dari <b>{pending.business?.name || 'Kasflow'}</b> • {pending.data.transactions?.length || 0} transaksi •
                  dibuat {pending.exportedAt ? formatDate(pending.exportedAt) : '—'}.
                </p>
                <p className="mt-1 text-xs text-amber-700">Data saat ini akan ditimpa sepenuhnya.</p>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <button onClick={() => setPending(null)} className="flex-1 rounded-lg border border-amber-300 bg-white py-2 text-sm font-semibold text-amber-700 hover:bg-amber-100">Batal</button>
              <button onClick={confirmRestore} className="flex-1 rounded-lg bg-amber-600 py-2 text-sm font-semibold text-white hover:bg-amber-700">Ya, Pulihkan</button>
            </div>
          </div>
        )}

        <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
          <Info size={13} /> File backup berisi semua transaksi, kategori, pengguna, dan log aktivitas.
        </p>
      </SectionCard>

      {/* ── Zona Berbahaya ── */}
      <SectionCard title="Zona Berbahaya" subtitle="Tindakan permanen — pikirkan baik-baik" className="border-rose-100">
        <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm">
              <div className="font-semibold text-slate-800">Hapus Semua Transaksi</div>
              <div className="text-xs text-slate-500">
                Mengosongkan {txCount} transaksi & {logCount} log. Kategori, pengguna, & profil bisnis tetap aman.
                Cocok dipakai saat mulai menggunakan beneran (hapus data contoh).
              </div>
            </div>
            <button
              onClick={handleClear}
              className={'shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold transition ' +
                (armed ? 'bg-rose-600 text-white hover:bg-rose-700' : 'border border-rose-300 text-rose-600 hover:bg-rose-50')}
            >
              {armed ? 'Klik lagi untuk hapus' : 'Hapus'}
            </button>
          </div>
        </div>
      </SectionCard>

      {/* ── Tentang ── */}
      <SectionCard title="Tentang Kasflow">
        <div className="space-y-2 text-sm text-slate-600">
          <div className="flex justify-between"><span className="text-slate-400">Versi</span><span className="font-medium">1.0.0</span></div>
          <div className="flex justify-between"><span className="text-slate-400">Total transaksi</span><span className="font-medium tabular-nums">{txCount}</span></div>
          <div className="flex justify-between"><span className="text-slate-400">Total log aktivitas</span><span className="font-medium tabular-nums">{logCount}</span></div>
          <div className="flex justify-between"><span className="text-slate-400">Penyimpanan</span><span className="font-medium">Lokal (perangkat ini)</span></div>
        </div>
        <div className="mt-4 rounded-xl bg-slate-50 p-3 text-center text-xs text-slate-500">
          Dibuat dengan ❤️ oleh <span className="font-semibold text-slate-700">Pagiverse Studio</span>
        </div>
      </SectionCard>

    </div>
  )
}
