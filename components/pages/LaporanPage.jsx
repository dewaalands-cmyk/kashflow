/**
 * components/pages/LaporanPage.jsx
 * Laporan keuangan — pilih periode, ringkasan, rincian kategori, dan export.
 */

import { Printer, Download } from 'lucide-react'
import { SectionCard } from '@/components/ui/Cards'
import { formatRupiah, formatDate, getCatColor, PERIOD_LABELS } from '@/lib/helpers'

const SELECT_CLS = 'rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100'

export default function LaporanPage({ report, reportPeriod, setReportPeriod, setPrinting, exportExcel, categories }) {
  return (
    <div className="space-y-5">

      {/* ── Toolbar ── */}
      <div className="kf-card flex flex-wrap items-center gap-3 p-4">
        <span className="text-sm font-semibold text-slate-700">Periode:</span>
        <select value={reportPeriod} onChange={(e) => setReportPeriod(e.target.value)} className={SELECT_CLS}>
          {Object.entries(PERIOD_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <div className="ml-auto flex gap-2">
          <button
            onClick={() => setPrinting(true)}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <Printer size={16} /> Cetak / PDF
          </button>
          <button
            onClick={exportExcel}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            <Download size={16} /> Excel
          </button>
        </div>
      </div>

      {/* ── Ringkasan 3 kartu ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="kf-card p-5">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Pemasukan</div>
          <div className="mt-2 font-display text-2xl font-bold text-emerald-600 tabular-nums">{formatRupiah(report.inc)}</div>
        </div>
        <div className="kf-card p-5">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Pengeluaran</div>
          <div className="mt-2 font-display text-2xl font-bold text-rose-600 tabular-nums">{formatRupiah(report.exp)}</div>
        </div>
        <div className="kf-card p-5">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Laba Bersih</div>
          <div className={'mt-2 font-display text-2xl font-bold tabular-nums ' + (report.net >= 0 ? 'text-slate-900' : 'text-rose-600')}>
            {formatRupiah(report.net)}
          </div>
        </div>
      </div>

      {/* ── Rincian pengeluaran per kategori ── */}
      <SectionCard title="Rincian Pengeluaran" subtitle={PERIOD_LABELS[reportPeriod]}>
        {report.cats.length === 0 ? (
          <div className="py-8 text-center text-sm text-slate-400">Belum ada pengeluaran pada periode ini.</div>
        ) : (
          <div className="space-y-3">
            {report.cats.map((c, i) => {
              const pct = report.exp ? (c.value / report.exp) * 100 : 0
              return (
                <div key={i}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-slate-600">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: getCatColor(c.name, categories) }} />
                      {c.name}
                    </span>
                    <span className="font-medium text-slate-700 tabular-nums">
                      {formatRupiah(c.value)}{' '}
                      <span className="text-slate-400">({pct.toFixed(0)}%)</span>
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, background: getCatColor(c.name, categories) }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </SectionCard>

      {/* ── Daftar transaksi periode ini ── */}
      <SectionCard title="Daftar Transaksi" subtitle={`${report.list.length} transaksi • ${PERIOD_LABELS[reportPeriod]}`}>
        <div className="overflow-x-auto kf-scroll">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="py-2 pr-4 font-semibold">Tanggal</th>
                <th className="py-2 pr-4 font-semibold">Kategori</th>
                <th className="py-2 pr-4 font-semibold">Keterangan</th>
                <th className="py-2 pr-4 text-right font-semibold">Jumlah</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {report.list.map((t) => (
                <tr key={t.id}>
                  <td className="whitespace-nowrap py-2.5 pr-4 text-slate-500">{formatDate(t.date)}</td>
                  <td className="py-2.5 pr-4 text-slate-700">{t.category}</td>
                  <td className="py-2.5 pr-4 text-slate-500">{t.description || '—'}</td>
                  <td className={'whitespace-nowrap py-2.5 pr-4 text-right font-semibold tabular-nums ' + (t.type === 'income' ? 'text-emerald-600' : 'text-rose-600')}>
                    {t.type === 'income' ? '+' : '−'}{formatRupiah(t.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {report.list.length === 0 && (
            <div className="py-8 text-center text-sm text-slate-400">Tidak ada transaksi pada periode ini.</div>
          )}
        </div>
      </SectionCard>

    </div>
  )
}
