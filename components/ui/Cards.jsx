/**
 * components/ui/Cards.jsx
 * Dua reusable components: SummaryCard dan SectionCard.
 * Dipakai di Dashboard, Laporan, dll.
 */

import { ArrowUpRight, ArrowDownRight } from 'lucide-react'

/**
 * Kartu ringkasan dengan angka besar, icon, dan perubahan % vs bulan lalu.
 */
export function SummaryCard({ label, value, icon: Icon, accent, delta, deltaLabel, delay = 0 }) {
  const positive = delta == null ? null : delta >= 0
  return (
    <div className="kf-card kf-card-hover kf-rise p-5" style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-start justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</span>
        <span
          className="flex h-9 w-9 items-center justify-center rounded-xl"
          style={{ background: accent + '1a', color: accent }}
        >
          <Icon size={18} />
        </span>
      </div>
      <div className="mt-3 font-display text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
        {value}
      </div>
      {delta != null && (
        <div className="mt-2 flex items-center gap-1 text-xs">
          <span className={
            'inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-semibold ' +
            (positive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600')
          }>
            {positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {Math.abs(delta).toFixed(0)}%
          </span>
          <span className="text-slate-400">{deltaLabel}</span>
        </div>
      )}
    </div>
  )
}

/**
 * Kartu section dengan judul, subjudul, konten, dan slot kanan (button/badge).
 */
export function SectionCard({ title, subtitle, children, right, className = '' }) {
  return (
    <div className={'kf-card p-5 ' + className}>
      {(title || right) && (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            {title    && <h3 className="font-display text-base font-bold text-slate-900">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
          </div>
          {right}
        </div>
      )}
      {children}
    </div>
  )
}
