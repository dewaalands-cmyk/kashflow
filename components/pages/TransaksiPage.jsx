/**
 * components/pages/TransaksiPage.jsx
 * Daftar transaksi lengkap dengan filter, search, dan tabel/kartu.
 */

import { Search, Plus, Pencil, Trash2, Lock } from 'lucide-react'
import { formatRupiah, formatDate, getCatColor, getUserColor, getUserName, initialsOf } from '@/lib/helpers'

const SELECT_CLS = 'rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100'

export default function TransaksiPage({
  filtered, categories, users, allCats,
  search, setSearch, fType, setFType, fCat, setFCat, fPeriod, setFPeriod,
  openAdd, openEdit, setConfirm, canModify,
}) {
  return (
    <div className="space-y-4">

      {/* ── Filter bar ── */}
      <div className="kf-card p-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative min-w-0 flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari keterangan / kategori..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
          </div>
          {/* Filters */}
          <select value={fType}   onChange={(e) => setFType(e.target.value)}   className={SELECT_CLS}>
            <option value="all">Semua Tipe</option>
            <option value="income">Pemasukan</option>
            <option value="expense">Pengeluaran</option>
          </select>
          <select value={fCat}    onChange={(e) => setFCat(e.target.value)}    className={SELECT_CLS}>
            <option value="all">Semua Kategori</option>
            {allCats.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={fPeriod} onChange={(e) => setFPeriod(e.target.value)} className={SELECT_CLS}>
            <option value="semua">Semua Waktu</option>
            <option value="bulan-ini">Bulan Ini</option>
            <option value="bulan-lalu">Bulan Lalu</option>
            <option value="3-bulan">3 Bulan Terakhir</option>
            <option value="tahun-ini">Tahun Ini</option>
          </select>
          <button
            onClick={openAdd}
            className="ml-auto hidden items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 sm:flex"
          >
            <Plus size={16} /> Tambah
          </button>
        </div>
      </div>

      {/* ── Desktop: tabel ── */}
      <div className="kf-card hidden overflow-hidden md:block">
        <div className="overflow-x-auto kf-scroll">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="px-5 py-3 font-semibold">Tanggal</th>
                <th className="px-5 py-3 font-semibold">Kategori</th>
                <th className="px-5 py-3 font-semibold">Keterangan</th>
                <th className="px-5 py-3 font-semibold">Dicatat oleh</th>
                <th className="px-5 py-3 text-right font-semibold">Jumlah</th>
                <th className="px-5 py-3 text-right font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((t) => (
                <tr key={t.id} className="transition hover:bg-slate-50/70">
                  <td className="whitespace-nowrap px-5 py-3 text-slate-500">{formatDate(t.date)}</td>
                  <td className="px-5 py-3">
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
                      style={{ background: getCatColor(t.category, categories) + '1a', color: getCatColor(t.category, categories) }}
                    >
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: getCatColor(t.category, categories) }} />
                      {t.category}
                    </span>
                  </td>
                  <td className="max-w-xs px-5 py-3 text-slate-700">
                    <div className="flex items-center gap-2">
                      {t.photo && <img src={t.photo} alt="bukti" className="h-7 w-7 rounded-md object-cover" />}
                      <span className="truncate">{t.description || '—'}</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-5 py-3">
                    <span className="inline-flex items-center gap-1.5 text-slate-500">
                      <span
                        className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white"
                        style={{ background: getUserColor(t.createdBy, users) }}
                      >
                        {initialsOf(getUserName(t.createdBy, users))}
                      </span>
                      {getUserName(t.createdBy, users)}
                    </span>
                  </td>
                  <td className={'whitespace-nowrap px-5 py-3 text-right font-semibold tabular-nums ' + (t.type === 'income' ? 'text-emerald-600' : 'text-rose-600')}>
                    {t.type === 'income' ? '+' : '−'}{formatRupiah(t.amount)}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 text-right">
                    {canModify(t) ? (
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(t)} className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"><Pencil size={15} /></button>
                        <button onClick={() => setConfirm(t)} className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"><Trash2 size={15} /></button>
                      </div>
                    ) : (
                      <span title="Hanya pemilik atau pembuat (hari ini) yang bisa edit" className="inline-flex justify-end text-slate-300">
                        <Lock size={14} />
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-12 text-center text-sm text-slate-400">Tidak ada transaksi yang cocok.</div>
          )}
        </div>
      </div>

      {/* ── Mobile: kartu ── */}
      <div className="space-y-3 md:hidden">
        {filtered.map((t) => (
          <div key={t.id} className="kf-card p-4">
            <div className="flex items-center justify-between">
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
                style={{ background: getCatColor(t.category, categories) + '1a', color: getCatColor(t.category, categories) }}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: getCatColor(t.category, categories) }} />
                {t.category}
              </span>
              <span className={'text-sm font-bold tabular-nums ' + (t.type === 'income' ? 'text-emerald-600' : 'text-rose-600')}>
                {t.type === 'income' ? '+' : '−'}{formatRupiah(t.amount)}
              </span>
            </div>
            <div className="mt-2 text-sm text-slate-700">{t.description || '—'}</div>
            <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
              <span>{formatDate(t.date)} • {getUserName(t.createdBy, users)}</span>
              {canModify(t) ? (
                <div className="flex gap-1">
                  <button onClick={() => openEdit(t)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"><Pencil size={15} /></button>
                  <button onClick={() => setConfirm(t)} className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 size={15} /></button>
                </div>
              ) : (
                <Lock size={14} className="text-slate-300" />
              )}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="kf-card py-10 text-center text-sm text-slate-400">Tidak ada transaksi yang cocok.</div>
        )}
      </div>

    </div>
  )
}
