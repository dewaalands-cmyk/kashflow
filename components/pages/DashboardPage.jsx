/**
 * components/pages/DashboardPage.jsx
 * Halaman utama — ringkasan keuangan, grafik arus kas, donut pengeluaran.
 */

import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { TrendingUp, TrendingDown, Wallet, Receipt, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { SummaryCard, SectionCard } from '@/components/ui/Cards'
import { formatRupiah, formatDate, rpShort, getCatColor } from '@/lib/helpers'

export default function DashboardPage({ metrics, trend, donut, transactions, categories, setActivePage }) {
  const donutTotal = donut.reduce((s, d) => s + d.value, 0)

  return (
    <div className="space-y-5">

      {/* ── Summary cards ── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <SummaryCard label="Pemasukan Bln Ini"  value={formatRupiah(metrics.inThis)}  icon={TrendingUp}    accent="#10b981" delta={metrics.dIn}  deltaLabel="vs bln lalu" delay={0}   />
        <SummaryCard label="Pengeluaran Bln Ini" value={formatRupiah(metrics.exThis)}  icon={TrendingDown}  accent="#f43f5e" delta={metrics.dEx}  deltaLabel="vs bln lalu" delay={60}  />
        <SummaryCard label="Laba Bersih Bln Ini" value={formatRupiah(metrics.netThis)} icon={Wallet}        accent="#6366f1" delta={metrics.dNet} deltaLabel="vs bln lalu" delay={120} />
        <SummaryCard label="Saldo Total"          value={formatRupiah(metrics.balance)} icon={Receipt}       accent="#0ea5e9" delay={180} />
      </div>

      {/* ── Charts row ── */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">

        {/* Area chart — arus kas 6 bulan */}
        <SectionCard title="Arus Kas" subtitle="6 bulan terakhir" className="lg:col-span-2 kf-rise">
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                <defs>
                  <linearGradient id="gIn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#10b981" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0}    />
                  </linearGradient>
                  <linearGradient id="gEx" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#f43f5e" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#f43f5e" stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={rpShort} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={48} />
                <Tooltip formatter={(v) => formatRupiah(v)} contentStyle={{ borderRadius: 12, border: '1px solid #e9eef5', fontSize: 13 }} />
                <Area type="monotone" dataKey="Pemasukan"   stroke="#10b981" strokeWidth={2.5} fill="url(#gIn)" />
                <Area type="monotone" dataKey="Pengeluaran" stroke="#f43f5e" strokeWidth={2.5} fill="url(#gEx)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex items-center gap-5 text-xs">
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Pemasukan</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-rose-500" />    Pengeluaran</span>
          </div>
        </SectionCard>

        {/* Donut chart — pengeluaran per kategori */}
        <SectionCard title="Pengeluaran" subtitle="Per kategori, bulan ini" className="kf-rise">
          {donut.length === 0 ? (
            <div className="flex h-56 flex-col items-center justify-center text-sm text-slate-400">
              <Receipt size={28} className="mb-2 opacity-50" />
              Belum ada pengeluaran bulan ini
            </div>
          ) : (
            <>
              <div className="relative h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={donut} dataKey="value" nameKey="name" innerRadius={56} outerRadius={84} paddingAngle={2} stroke="none">
                      {donut.map((d, i) => (
                        <Cell key={i} fill={getCatColor(d.name, categories)} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => formatRupiah(v)} contentStyle={{ borderRadius: 12, border: '1px solid #e9eef5', fontSize: 13 }} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Label tengah donut */}
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[11px] text-slate-400">Total</span>
                  <span className="font-display text-sm font-bold text-slate-900">{rpShort(donutTotal)}</span>
                </div>
              </div>
              {/* Legend */}
              <div className="mt-3 space-y-2">
                {donut.slice(0, 5).map((d, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-slate-600">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: getCatColor(d.name, categories) }} />
                      {d.name}
                    </span>
                    <span className="font-medium text-slate-700 tabular-nums">
                      {Math.round((d.value / donutTotal) * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </SectionCard>
      </div>

      {/* ── Recent transactions ── */}
      <SectionCard
        title="Transaksi Terbaru"
        right={
          <button onClick={() => setActivePage('transaksi')} className="text-sm font-semibold text-emerald-600 hover:text-emerald-700">
            Lihat semua
          </button>
        }
        className="kf-rise"
      >
        <div className="divide-y divide-slate-100">
          {transactions.slice(0, 5).map((t) => (
            <div key={t.id} className="flex items-center gap-3 py-3">
              <span className={'flex h-9 w-9 items-center justify-center rounded-xl ' + (t.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600')}>
                {t.type === 'income' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-slate-800">{t.description || t.category}</div>
                <div className="text-xs text-slate-400">{t.category} • {formatDate(t.date)}</div>
              </div>
              <div className={'text-sm font-semibold tabular-nums ' + (t.type === 'income' ? 'text-emerald-600' : 'text-rose-600')}>
                {t.type === 'income' ? '+' : '−'}{formatRupiah(t.amount)}
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

    </div>
  )
}
