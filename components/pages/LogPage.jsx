/**
 * components/pages/LogPage.jsx
 * Log aktivitas — jejak setiap tambah/edit/hapus transaksi.
 * Fungsi utama: anti-manipulasi. Semua aksi tercatat dengan user, waktu, dan detail.
 */

import { Plus, Pencil, Trash2, Receipt } from 'lucide-react'
import { SectionCard } from '@/components/ui/Cards'
import { formatDateTime } from '@/lib/helpers'

// Konfigurasi tampilan tiap jenis aksi
const ACTION_META = {
  tambah: { label: 'menambahkan', color: '#10b981', Icon: Plus    },
  edit:   { label: 'mengubah',    color: '#f59e0b', Icon: Pencil  },
  hapus:  { label: 'menghapus',   color: '#f43f5e', Icon: Trash2  },
}

export default function LogPage({ auditLog }) {
  return (
    <SectionCard
      title="Log Aktivitas"
      subtitle="Jejak setiap perubahan data — mencegah manipulasi"
    >
      {auditLog.length === 0 ? (
        <div className="flex flex-col items-center py-12 text-center text-sm text-slate-400">
          <Receipt size={32} className="mb-3 opacity-40" />
          <p>Belum ada aktivitas tercatat.</p>
          <p className="mt-1 text-xs">Coba tambah atau ubah transaksi.</p>
        </div>
      ) : (
        <div className="space-y-1">
          {auditLog.map((a) => {
            const m = ACTION_META[a.action] || ACTION_META.edit
            return (
              <div
                key={a.id}
                className="flex items-start gap-3 rounded-xl px-2 py-3 transition hover:bg-slate-50"
              >
                {/* Icon aksi */}
                <span
                  className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: m.color + '1a', color: m.color }}
                >
                  <m.Icon size={15} />
                </span>

                {/* Deskripsi */}
                <div className="min-w-0 flex-1">
                  <div className="text-sm text-slate-700">
                    <span className="font-semibold text-slate-900">{a.user}</span>
                    <span
                      className="ml-1 rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-slate-500"
                    >
                      {a.role}
                    </span>
                    <span className="mx-1">{m.label}</span>
                    <span className="font-medium text-slate-800">{a.target}</span>
                  </div>
                  {a.detail && (
                    <div className="text-xs text-slate-400">{a.detail}</div>
                  )}
                </div>

                {/* Waktu */}
                <span className="whitespace-nowrap text-xs text-slate-400">
                  {formatDateTime(a.at)}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </SectionCard>
  )
}
