/**
 * components/modals/TxModal.jsx
 * Modal tambah / edit transaksi.
 * Manages its own form state. Calls onSave(data) when done.
 */

'use client'

import { useState, useEffect } from 'react'
import { X, Check, Camera } from 'lucide-react'
import { todayISO } from '@/lib/helpers'

const INPUT_CLS = 'w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100'

// Resize gambar agar tidak terlalu besar disimpan
function resizeImage(file) {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        let { width, height } = img
        const max = 360
        if (width > height && width > max) { height = (height * max) / width; width = max }
        else if (height > max) { width = (width * max) / height; height = max }
        const c = document.createElement('canvas')
        c.width = width; c.height = height
        c.getContext('2d').drawImage(img, 0, 0, width, height)
        resolve(c.toDataURL('image/jpeg', 0.6))
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  })
}

export default function TxModal({ isOpen, onClose, onSave, editTx, categories, currentUser, onAddCategory }) {
  const [type,         setType]         = useState('income')
  const [amount,       setAmount]       = useState('')
  const [category,     setCategory]     = useState('')
  const [date,         setDate]         = useState(todayISO())
  const [description,  setDescription]  = useState('')
  const [photo,        setPhoto]        = useState(null)
  const [newCatMode,   setNewCatMode]   = useState(false)
  const [newCatValue,  setNewCatValue]  = useState('')

  // Isi form dari editTx saat modal dibuka
  useEffect(() => {
    if (!isOpen) return
    if (editTx) {
      setType(editTx.type)
      setAmount(String(editTx.amount))
      setCategory(editTx.category)
      setDate(editTx.date)
      setDescription(editTx.description || '')
      setPhoto(editTx.photo || null)
    } else {
      // Default untuk tambah baru
      setType('income')
      setAmount('')
      setCategory(categories.income[0] || '')
      setDate(todayISO())
      setDescription('')
      setPhoto(null)
    }
    setNewCatMode(false)
    setNewCatValue('')
  }, [isOpen, editTx])

  // Update default category saat tipe berubah
  const changeType = (t) => {
    setType(t)
    setCategory(categories[t][0] || '')
  }

  const handleSave = () => {
    const amt = Number(amount)
    if (!amt || amt <= 0) { alert('Jumlah harus lebih dari 0'); return }
    if (!category)        { alert('Pilih kategori dulu'); return }
    onSave({
      id:          editTx?.id || null,
      type, amount: amt, category, date, description, photo,
    })
  }

  const handleAddCategory = () => {
    const v = newCatValue.trim()
    if (!v) return
    onAddCategory(type, v)
    setCategory(v)
    setNewCatMode(false)
    setNewCatValue('')
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="kf-pop max-h-[92vh] w-full overflow-y-auto kf-scroll rounded-t-3xl bg-white p-6 shadow-2xl sm:max-w-md sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-slate-900">
            {editTx ? 'Edit Transaksi' : 'Tambah Transaksi'}
          </h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>

        {/* Tipe toggle */}
        <div className="mb-4 grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
          <button
            onClick={() => changeType('income')}
            className={'rounded-lg py-2 text-sm font-semibold transition ' + (type === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500')}
          >
            Pemasukan
          </button>
          <button
            onClick={() => changeType('expense')}
            className={'rounded-lg py-2 text-sm font-semibold transition ' + (type === 'expense' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500')}
          >
            Pengeluaran
          </button>
        </div>

        {/* Jumlah */}
        <label className="mb-1 block text-xs font-semibold text-slate-500">Jumlah</label>
        <div className="mb-4 flex items-center rounded-xl border border-slate-200 px-3 focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-100">
          <span className="text-sm font-semibold text-slate-400">Rp</span>
          <input
            inputMode="numeric"
            value={amount ? Number(amount).toLocaleString('id-ID') : ''}
            onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))}
            placeholder="0"
            className="w-full bg-transparent py-2.5 pl-2 text-right font-display text-lg font-bold text-slate-900 focus:outline-none tabular-nums"
          />
        </div>

        {/* Kategori */}
        <label className="mb-1 block text-xs font-semibold text-slate-500">Kategori</label>
        {newCatMode ? (
          <div className="mb-4 flex gap-2">
            <input
              value={newCatValue}
              onChange={(e) => setNewCatValue(e.target.value)}
              placeholder="Nama kategori baru"
              autoFocus
              className={INPUT_CLS}
            />
            <button onClick={handleAddCategory} className="rounded-xl bg-emerald-600 px-3 text-white hover:bg-emerald-700"><Check size={18} /></button>
            <button onClick={() => setNewCatMode(false)} className="rounded-xl bg-slate-100 px-3 text-slate-500 hover:bg-slate-200"><X size={18} /></button>
          </div>
        ) : (
          <select
            value={category}
            onChange={(e) => {
              if (e.target.value === '__new__') setNewCatMode(true)
              else setCategory(e.target.value)
            }}
            className={'mb-4 ' + INPUT_CLS}
          >
            {categories[type].map((c) => <option key={c} value={c}>{c}</option>)}
            <option value="__new__">+ Tambah kategori baru…</option>
          </select>
        )}

        {/* Tanggal */}
        <label className="mb-1 block text-xs font-semibold text-slate-500">Tanggal</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={'mb-4 ' + INPUT_CLS}
        />

        {/* Keterangan */}
        <label className="mb-1 block text-xs font-semibold text-slate-500">Keterangan</label>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Contoh: Penjualan minggu pertama"
          className={'mb-4 ' + INPUT_CLS}
        />

        {/* Foto bukti */}
        <label className="mb-1 block text-xs font-semibold text-slate-500">Foto Bukti (opsional)</label>
        <div className="mb-6 flex items-center gap-3">
          <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-slate-300 px-3 py-2.5 text-sm text-slate-500 transition hover:border-emerald-400 hover:text-emerald-600">
            <Camera size={16} />
            {photo ? 'Ganti foto' : 'Unggah foto nota'}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const f = e.target.files?.[0]
                if (f) setPhoto(await resizeImage(f))
              }}
            />
          </label>
          {photo && (
            <div className="relative">
              <img src={photo} alt="bukti" className="h-12 w-12 rounded-lg object-cover" />
              <button onClick={() => setPhoto(null)} className="absolute -right-1.5 -top-1.5 rounded-full bg-rose-500 p-0.5 text-white">
                <X size={11} />
              </button>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">
            Batal
          </button>
          <button onClick={handleSave} className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700">
            {editTx ? 'Simpan Perubahan' : 'Simpan'}
          </button>
        </div>
      </div>
    </div>
  )
}
