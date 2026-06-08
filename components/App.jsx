'use client'

/**
 * components/App.jsx
 * Komponen utama — semua state, derived data, action functions, dan layout.
 * Data tersimpan di localStorage (ganti ke Supabase untuk multi-device sync).
 */

import { useState, useEffect, useMemo } from 'react'
import * as XLSX from 'xlsx'
import {
  LayoutDashboard, ArrowLeftRight, FileText, History, Settings as SettingsIcon,
  Plus, Wallet, ChevronDown, Check, Wifi, WifiOff, Users,
} from 'lucide-react'

import { KEYS, loadData, saveData }                 from '@/lib/storage'
import { SEED_BIZ, SEED_USERS, SEED_CAT, buildSeed } from '@/lib/seed'
import {
  uid, isToday, formatRupiah, formatDate,
  initialsOf, getUserName, inPeriod, PERIOD_LABELS,
} from '@/lib/helpers'

import DashboardPage  from '@/components/pages/DashboardPage'
import TransaksiPage  from '@/components/pages/TransaksiPage'
import LaporanPage    from '@/components/pages/LaporanPage'
import LogPage        from '@/components/pages/LogPage'
import SettingsPage   from '@/components/pages/SettingsPage'
import TxModal        from '@/components/modals/TxModal'
import { ConfirmDialog, UserModal } from '@/components/modals/Dialogs'

/* ── Nav items ── */
const NAV = [
  { id: 'dashboard',  label: 'Dashboard',     icon: LayoutDashboard },
  { id: 'transaksi',  label: 'Transaksi',     icon: ArrowLeftRight  },
  { id: 'laporan',    label: 'Laporan',       icon: FileText        },
  { id: 'log',        label: 'Log Aktivitas', icon: History         },
  { id: 'pengaturan', label: 'Pengaturan',    icon: SettingsIcon    },
]

const PAGE_META = {
  dashboard:  { title: 'Dashboard',     sub: 'Ringkasan keuangan bisnismu'              },
  transaksi:  { title: 'Transaksi',     sub: 'Catat & kelola pemasukan dan pengeluaran' },
  laporan:    { title: 'Laporan',       sub: 'Rekap dan cetak laporan keuangan'         },
  log:        { title: 'Log Aktivitas', sub: 'Jejak aktivitas pengguna'                 },
  pengaturan: { title: 'Pengaturan',    sub: 'Profil bisnis, pengguna, & data'          },
}

const AVATAR_COLORS = ['#0f766e','#7c3aed','#0369a1','#b45309','#be123c','#15803d']

/* ================================================================ */
export default function App() {

  /* ── State ── */
  const [loading,       setLoading]       = useState(true)
  const [transactions,  setTransactions]  = useState([])
  const [categories,    setCategories]    = useState(SEED_CAT)
  const [users,         setUsers]         = useState(SEED_USERS)
  const [auditLog,      setAuditLog]      = useState([])
  const [biz,           setBiz]           = useState(SEED_BIZ)
  const [currentUserId, setCurrentUserId] = useState('u_owner')

  const [activePage,    setActivePage]    = useState('dashboard')
  const [online,        setOnline]        = useState(true)
  const [toast,         setToast]         = useState(null)
  const [printing,      setPrinting]      = useState(false)

  // Transaction list filters
  const [search,  setSearch]  = useState('')
  const [fType,   setFType]   = useState('all')
  const [fCat,    setFCat]    = useState('all')
  const [fPeriod, setFPeriod] = useState('semua')

  // Report
  const [reportPeriod, setReportPeriod] = useState('bulan-ini')

  // Modals
  const [txModal,    setTxModal]    = useState(false)
  const [editTx,     setEditTx]     = useState(null)
  const [confirm,    setConfirm]    = useState(null)
  const [userModal,  setUserModal]  = useState(false)
  const [userMenu,   setUserMenu]   = useState(false)

  /* ── Derived ── */
  const currentUser = users.find((u) => u.id === currentUserId) || users[0]
  const isOwner     = currentUser?.role === 'owner'
  const allCats     = [...categories.income, ...categories.expense]

  /* ── Load data from localStorage (runs once on client) ── */
  useEffect(() => {
    let tx    = loadData(KEYS.tx)
    let cat   = loadData(KEYS.cat)
    let usrs  = loadData(KEYS.users)
    let audit = loadData(KEYS.audit)
    let bz    = loadData(KEYS.biz)

    // First run: seed with sample data
    if (tx    === null) { tx    = buildSeed();  saveData(KEYS.tx,    tx)    }
    if (cat   === null) { cat   = SEED_CAT;     saveData(KEYS.cat,   cat)   }
    if (usrs  === null) { usrs  = SEED_USERS;   saveData(KEYS.users, usrs)  }
    if (audit === null) { audit = [];            saveData(KEYS.audit, audit) }
    if (bz    === null) { bz    = SEED_BIZ;     saveData(KEYS.biz,   bz)    }

    setTransactions(tx)
    setCategories(cat)
    setUsers(usrs)
    setAuditLog(audit)
    setBiz(bz)
    setCurrentUserId(usrs[0].id)
    setLoading(false)
  }, [])

  /* ── Register service worker (production only) ── */
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }
  }, [])

  /* ── Online / offline indicator ── */
  useEffect(() => {
    setOnline(navigator.onLine)
    const on  = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online',  on)
    window.addEventListener('offline', off)
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off) }
  }, [])

  /* ── Trigger window.print() when printing=true ── */
  useEffect(() => {
    if (!printing) return
    const t = setTimeout(() => { window.print(); setPrinting(false) }, 150)
    return () => clearTimeout(t)
  }, [printing])

  /* ── Toast helper ── */
  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2400)
  }

  /* ── Audit log helper ── */
  const logAction = (action, target, detail = '') => {
    const entry = {
      id: uid(), action, target, detail,
      user: currentUser.name, role: currentUser.role,
      at: new Date().toISOString(),
    }
    const next = [entry, ...auditLog]
    setAuditLog(next)
    saveData(KEYS.audit, next)
  }

  /* ── Permission: who can edit/delete a transaction ── */
  const canModify = (t) => isOwner || (t.createdBy === currentUser.id && isToday(t.createdAt))

  /* ── Modal openers ── */
  const openAdd  = ()    => { setEditTx(null); setTxModal(true)  }
  const openEdit = (tx)  => { setEditTx(tx);   setTxModal(true)  }

  /* ── Save transaction (add or edit) ── */
  const handleSave = ({ id, type, amount, category, date, description, photo }) => {
    let next
    if (id) {
      next = transactions.map((t) =>
        t.id === id
          ? { ...t, type, amount, category, date, description, photo, updatedAt: new Date().toISOString() }
          : t
      )
      const before = transactions.find((t) => t.id === id)
      logAction('edit', `${category} • ${formatRupiah(amount)}`,
        before ? `Diubah dari ${formatRupiah(before.amount)} (${before.category})` : ''
      )
      showToast('Transaksi diperbarui')
    } else {
      const t = {
        id: uid(), type, amount, category, date, description, photo,
        createdBy:  currentUser.id,
        createdAt:  new Date().toISOString(),
        updatedAt:  new Date().toISOString(),
      }
      next = [t, ...transactions]
      logAction('tambah', `${category} • ${formatRupiah(amount)}`, type === 'income' ? 'Pemasukan' : 'Pengeluaran')
      showToast('Transaksi tersimpan')
    }
    setTransactions(next)
    saveData(KEYS.tx, next)
    setTxModal(false)
    setEditTx(null)
  }

  /* ── Delete transaction ── */
  const doDelete = (t) => {
    const next = transactions.filter((x) => x.id !== t.id)
    setTransactions(next)
    saveData(KEYS.tx, next)
    logAction('hapus', `${t.category} • ${formatRupiah(t.amount)}`, t.type === 'income' ? 'Pemasukan' : 'Pengeluaran')
    setConfirm(null)
    showToast('Transaksi dihapus')
  }

  /* ── Add category inline in TxModal ── */
  const handleAddCategory = (type, name) => {
    const next = { ...categories, [type]: [...categories[type], name] }
    setCategories(next)
    saveData(KEYS.cat, next)
  }

  /* ── User management ── */
  const handleAddUser = (name, role) => {
    const u = { id: uid(), name, role }
    const next = [...users, u]
    setUsers(next)
    saveData(KEYS.users, next)
    setUserModal(false)
    showToast('Pengguna ditambahkan')
  }

  const handleEditUser = (id, patch) => {
    const next = users.map((u) => (u.id === id ? { ...u, ...patch } : u))
    setUsers(next)
    saveData(KEYS.users, next)
    showToast('Pengguna diperbarui')
  }

  const handleDeleteUser = (id) => {
    const next = users.filter((u) => u.id !== id)
    setUsers(next)
    saveData(KEYS.users, next)
    showToast('Pengguna dihapus')
  }

  /* ── Business profile ── */
  const handleSaveBusiness = (name, owner) => {
    const next = { ...biz, name, owner }
    setBiz(next)
    saveData(KEYS.biz, next)
    showToast('Profil bisnis disimpan')
  }

  /* ── Backup: download all data as JSON ── */
  const downloadBackup = () => {
    const backup = {
      app:        'Kasflow',
      version:    1,
      exportedAt: new Date().toISOString(),
      business:   biz,
      data:       { transactions, categories, users, auditLog },
    }
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `Kasflow-Backup-${(biz.name || 'Bisnis').replace(/\s/g, '-')}-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    showToast('Backup berhasil diunduh')
  }

  /* ── Restore: overwrite all data from a backup ── */
  const applyRestore = (data) => {
    const tx    = data.transactions || []
    const cat   = data.categories   || SEED_CAT
    const usrs  = data.users        || SEED_USERS
    const audit = data.auditLog     || []
    setTransactions(tx);  saveData(KEYS.tx,    tx)
    setCategories(cat);   saveData(KEYS.cat,   cat)
    setUsers(usrs);       saveData(KEYS.users, usrs)
    setAuditLog(audit);   saveData(KEYS.audit, audit)
    setCurrentUserId(usrs[0]?.id || 'u_owner')
    showToast('Data berhasil dipulihkan')
    setActivePage('dashboard')
  }

  /* ── Clear all transactions (keep setup) ── */
  const clearTransactions = () => {
    setTransactions([]); saveData(KEYS.tx, [])
    setAuditLog([]);     saveData(KEYS.audit, [])
    showToast('Semua transaksi dihapus')
    setActivePage('dashboard')
  }

  /* ── Excel export ── */
  const exportExcel = () => {
    const rows = report.list.map((t) => ({
      Tanggal:        formatDate(t.date),
      Tipe:           t.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
      Kategori:       t.category,
      Keterangan:     t.description,
      Pemasukan:      t.type === 'income'  ? t.amount : '',
      Pengeluaran:    t.type === 'expense' ? t.amount : '',
      'Dicatat oleh': getUserName(t.createdBy, users),
    }))
    rows.push({}, { Tanggal: 'TOTAL', Pemasukan: report.inc, Pengeluaran: report.exp })
    rows.push({ Tanggal: 'LABA BERSIH', Keterangan: formatRupiah(report.net) })
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Laporan')
    const bizName = (biz.name || 'Bisnis').replace(/\s/g, '-')
    XLSX.writeFile(wb, `${bizName}-Laporan-${PERIOD_LABELS[reportPeriod].replace(/\s/g, '-')}.xlsx`)
    showToast('File Excel diunduh')
  }

  /* ─────────── COMPUTED DATA (useMemo) ─────────── */

  const metrics = useMemo(() => {
    const now = new Date()
    const lm  = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    let inThis = 0, exThis = 0, inLast = 0, exLast = 0, balance = 0
    for (const t of transactions) {
      const d     = new Date(t.date)
      const thisM = d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
      const lastM = d.getFullYear() === lm.getFullYear()  && d.getMonth() === lm.getMonth()
      if (t.type === 'income') balance += t.amount; else balance -= t.amount
      if (thisM) { if (t.type === 'income') inThis += t.amount; else exThis += t.amount }
      if (lastM) { if (t.type === 'income') inLast += t.amount; else exLast += t.amount }
    }
    const pct = (a, b) => (b === 0 ? (a > 0 ? 100 : 0) : ((a - b) / b) * 100)
    return {
      inThis, exThis, netThis: inThis - exThis, balance,
      dIn: pct(inThis, inLast), dEx: pct(exThis, exLast), dNet: pct(inThis - exThis, inLast - exLast),
    }
  }, [transactions])

  const trend = useMemo(() => {
    const now = new Date()
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
      const label = d.toLocaleDateString('id-ID', { month: 'short' })
      let inc = 0, exp = 0
      for (const t of transactions) {
        const td = new Date(t.date)
        if (td.getFullYear() === d.getFullYear() && td.getMonth() === d.getMonth()) {
          if (t.type === 'income') inc += t.amount; else exp += t.amount
        }
      }
      return { label, Pemasukan: inc, Pengeluaran: exp }
    })
  }, [transactions])

  const donut = useMemo(() => {
    const now = new Date()
    const map = {}
    for (const t of transactions) {
      const d = new Date(t.date)
      if (t.type === 'expense' && d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth())
        map[t.category] = (map[t.category] || 0) + t.amount
    }
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)
  }, [transactions])

  const filtered = useMemo(() => {
    return transactions
      .filter((t) => fType   === 'all' ? true : t.type     === fType)
      .filter((t) => fCat    === 'all' ? true : t.category === fCat)
      .filter((t) => inPeriod(t.date, fPeriod))
      .filter((t) => {
        if (!search.trim()) return true
        const q = search.toLowerCase()
        return t.description.toLowerCase().includes(q) || t.category.toLowerCase().includes(q)
      })
      .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
  }, [transactions, fType, fCat, fPeriod, search])

  const report = useMemo(() => {
    const list = transactions.filter((t) => inPeriod(t.date, reportPeriod))
    let inc = 0, exp = 0
    const byCat = {}
    for (const t of list) {
      if (t.type === 'income') inc += t.amount; else exp += t.amount
      if (t.type === 'expense') byCat[t.category] = (byCat[t.category] || 0) + t.amount
    }
    const cats = Object.entries(byCat).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)
    return { list: list.sort((a, b) => (a.date < b.date ? 1 : -1)), inc, exp, net: inc - exp, cats }
  }, [transactions, reportPeriod])

  /* ─────────── PRINT REPORT (hidden, shown on window.print) ─────────── */
  const PrintReport = () => (
    <div className="print-area">
      <div style={{ borderBottom: '2px solid #0f172a', paddingBottom: 12, marginBottom: 16 }}>
        <div style={{ fontSize: 22, fontWeight: 800 }}>{biz.name || 'Kasflow'} — Laporan Keuangan</div>
        <div style={{ fontSize: 13, color: '#475569' }}>
          Periode: {PERIOD_LABELS[reportPeriod]} • Dicetak {formatDate(new Date().toISOString())} oleh {currentUser.name}
        </div>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 18, fontSize: 13 }}>
        <tbody>
          <tr><td style={{ padding: 6 }}>Total Pemasukan</td><td style={{ padding: 6, textAlign: 'right', fontWeight: 700, color: '#059669' }}>{formatRupiah(report.inc)}</td></tr>
          <tr><td style={{ padding: 6 }}>Total Pengeluaran</td><td style={{ padding: 6, textAlign: 'right', fontWeight: 700, color: '#e11d48' }}>{formatRupiah(report.exp)}</td></tr>
          <tr style={{ borderTop: '1px solid #cbd5e1' }}>
            <td style={{ padding: 6, fontWeight: 700 }}>Laba Bersih</td>
            <td style={{ padding: 6, textAlign: 'right', fontWeight: 800 }}>{formatRupiah(report.net)}</td>
          </tr>
        </tbody>
      </table>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <thead>
          <tr style={{ background: '#f1f5f9' }}>
            {['Tanggal','Kategori','Keterangan','Jumlah'].map((h) => (
              <th key={h} style={{ padding: 8, textAlign: 'left', borderBottom: '1px solid #cbd5e1' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {report.list.map((t) => (
            <tr key={t.id}>
              <td style={{ padding: 8, borderBottom: '1px solid #e2e8f0' }}>{formatDate(t.date)}</td>
              <td style={{ padding: 8, borderBottom: '1px solid #e2e8f0' }}>{t.category}</td>
              <td style={{ padding: 8, borderBottom: '1px solid #e2e8f0' }}>{t.description || '—'}</td>
              <td style={{ padding: 8, borderBottom: '1px solid #e2e8f0', textAlign: 'right', color: t.type === 'income' ? '#059669' : '#e11d48' }}>
                {t.type === 'income' ? '+' : '−'}{formatRupiah(t.amount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: 24, fontSize: 11, color: '#94a3b8', textAlign: 'center' }}>
        Dikelola dengan Kasflow · Pagiverse Studio
      </div>
    </div>
  )

  /* ─────────── RENDER ─────────── */
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-sm text-slate-400">
        Memuat data…
      </div>
    )
  }

  return (
    <div className="kf-app min-h-screen w-full text-slate-800">

      {/* ══════════ SIDEBAR (desktop) ══════════ */}
      <aside className="kf-sidebar fixed left-0 top-0 z-30 hidden h-screen w-64 flex-col px-4 py-6 md:flex">
        {/* Logo + business name */}
        <div className="mb-8 flex items-center gap-3 px-2">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-lg">
            <Wallet size={20} />
          </span>
          <div className="min-w-0">
            <div className="truncate font-display text-base font-bold leading-tight text-white">{biz.name || 'Kasflow'}</div>
            <div className="text-[11px] text-slate-400">Buku Kas Digital</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="space-y-1">
          {NAV.map((n) => {
            const active = activePage === n.id
            return (
              <button
                key={n.id}
                onClick={() => setActivePage(n.id)}
                className={'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ' +
                  (active ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white')}
              >
                <n.icon size={18} className={active ? 'text-emerald-400' : ''} />
                {n.label}
                {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-400" />}
              </button>
            )
          })}
        </nav>

        {/* Add button */}
        <button
          onClick={openAdd}
          className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-emerald-500 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-400"
        >
          <Plus size={16} /> Tambah Transaksi
        </button>

        {/* Footer */}
        <div className="mt-auto rounded-xl bg-white/5 p-3 text-[11px] leading-relaxed text-slate-400">
          Powered by <span className="font-semibold text-slate-200">Kasflow</span><br />
          Pagiverse Studio
        </div>
      </aside>

      {/* ══════════ MAIN CONTENT ══════════ */}
      <div className="flex min-h-screen flex-col md:pl-64">

        {/* Top bar */}
        <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3.5 sm:px-6">
            {/* Mobile: business name */}
            <div className="flex items-center gap-2 md:hidden">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 text-white">
                <Wallet size={16} />
              </span>
              <span className="truncate font-display text-base font-bold text-slate-900">{biz.name || 'Kasflow'}</span>
            </div>
            {/* Desktop: page title */}
            <div className="hidden md:block">
              <h1 className="font-display text-lg font-bold text-slate-900">{PAGE_META[activePage]?.title}</h1>
              <p className="text-xs text-slate-400">{PAGE_META[activePage]?.sub}</p>
            </div>

            <div className="ml-auto flex items-center gap-2 sm:gap-3">
              {/* Online / offline */}
              <span className={'hidden items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold sm:flex ' +
                (online ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600')}>
                {online ? <Wifi size={13} /> : <WifiOff size={13} />}
                {online ? 'Online' : 'Offline — tersimpan lokal'}
              </span>

              {/* User switcher */}
              <div className="relative">
                <button
                  onClick={() => setUserMenu(!userMenu)}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white py-1.5 pl-1.5 pr-2.5 transition hover:bg-slate-50"
                >
                  <span
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold text-white"
                    style={{ background: AVATAR_COLORS[users.findIndex((u) => u.id === currentUserId) % AVATAR_COLORS.length] }}
                  >
                    {initialsOf(currentUser.name)}
                  </span>
                  <span className="hidden text-left sm:block">
                    <span className="block text-xs font-semibold leading-none text-slate-800">{currentUser.name}</span>
                    <span className="block text-[10px] capitalize text-slate-400">{currentUser.role}</span>
                  </span>
                  <ChevronDown size={15} className="text-slate-400" />
                </button>

                {userMenu && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setUserMenu(false)} />
                    <div className="kf-pop absolute right-0 z-40 mt-2 w-60 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                      <div className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                        Ganti pengguna aktif
                      </div>
                      {users.map((u, i) => (
                        <button
                          key={u.id}
                          onClick={() => { setCurrentUserId(u.id); setUserMenu(false) }}
                          className={'flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left text-sm transition hover:bg-slate-50 ' +
                            (u.id === currentUserId ? 'bg-slate-50' : '')}
                        >
                          <span
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold text-white"
                            style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}
                          >
                            {initialsOf(u.name)}
                          </span>
                          <span className="flex-1">
                            <span className="block font-medium text-slate-800">{u.name}</span>
                            <span className="block text-[11px] capitalize text-slate-400">{u.role}</span>
                          </span>
                          {u.id === currentUserId && <Check size={16} className="text-emerald-600" />}
                        </button>
                      ))}
                      <div className="my-1 border-t border-slate-100" />
                      <button
                        onClick={() => { setUserMenu(false); setUserModal(true) }}
                        className="flex w-full items-center gap-2 rounded-xl px-2 py-2 text-sm font-medium text-emerald-600 transition hover:bg-emerald-50"
                      >
                        <Users size={16} /> Tambah pengguna
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-28 pt-5 sm:px-6 md:pb-10">
          {activePage === 'dashboard' && (
            <DashboardPage
              metrics={metrics} trend={trend} donut={donut}
              transactions={transactions} categories={categories}
              setActivePage={setActivePage}
            />
          )}
          {activePage === 'transaksi' && (
            <TransaksiPage
              filtered={filtered} categories={categories} users={users} allCats={allCats}
              search={search} setSearch={setSearch}
              fType={fType}   setFType={setFType}
              fCat={fCat}     setFCat={setFCat}
              fPeriod={fPeriod} setFPeriod={setFPeriod}
              openAdd={openAdd} openEdit={openEdit}
              setConfirm={setConfirm} canModify={canModify}
            />
          )}
          {activePage === 'laporan' && (
            <LaporanPage
              report={report} reportPeriod={reportPeriod} setReportPeriod={setReportPeriod}
              setPrinting={setPrinting} exportExcel={exportExcel} categories={categories}
            />
          )}
          {activePage === 'log' && (
            <LogPage auditLog={auditLog} />
          )}
          {activePage === 'pengaturan' && (
            <SettingsPage
              biz={biz} onSaveBusiness={handleSaveBusiness}
              users={users} currentUserId={currentUserId}
              onEditUser={handleEditUser} onDeleteUser={handleDeleteUser}
              onAddUser={() => setUserModal(true)}
              onBackup={downloadBackup} onRestore={applyRestore}
              onClearTransactions={clearTransactions}
              txCount={transactions.length} logCount={auditLog.length}
            />
          )}
        </main>
      </div>

      {/* ══════════ BOTTOM NAV (mobile) ══════════ */}
      <nav className="fixed bottom-0 left-0 z-30 flex w-full items-center justify-around border-t border-slate-200 bg-white/90 px-1 py-1.5 backdrop-blur-md md:hidden">
        {NAV.map((n) => {
          const active = activePage === n.id
          return (
            <button
              key={n.id}
              onClick={() => setActivePage(n.id)}
              className={'flex flex-1 flex-col items-center gap-0.5 rounded-lg py-1.5 text-[9px] font-medium transition ' +
                (active ? 'text-emerald-600' : 'text-slate-400')}
            >
              <n.icon size={19} />
              {n.label.split(' ')[0]}
            </button>
          )
        })}
      </nav>

      {/* FAB (mobile) */}
      <button
        onClick={openAdd}
        className="fixed bottom-16 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-xl transition hover:bg-emerald-700 md:hidden"
      >
        <Plus size={24} />
      </button>

      {/* ══════════ MODALS & OVERLAYS ══════════ */}
      <TxModal
        isOpen={txModal}
        onClose={() => { setTxModal(false); setEditTx(null) }}
        onSave={handleSave}
        editTx={editTx}
        categories={categories}
        currentUser={currentUser}
        onAddCategory={handleAddCategory}
      />
      <ConfirmDialog tx={confirm} onConfirm={() => doDelete(confirm)} onCancel={() => setConfirm(null)} />
      <UserModal isOpen={userModal} onClose={() => setUserModal(false)} onAdd={handleAddUser} />

      <PrintReport />

      {/* Toast */}
      {toast && (
        <div className="kf-pop fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-lg md:bottom-8">
          <span className="flex items-center gap-2">
            <Check size={15} className="text-emerald-400" /> {toast}
          </span>
        </div>
      )}
    </div>
  )
}
