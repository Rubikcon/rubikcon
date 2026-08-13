import React, { useState, useEffect } from 'react'
import { Loader2, Receipt, ExternalLink, CheckCircle2, Clock } from 'lucide-react'
import { apiRequest } from '../lib/api'

interface PaymentItem {
  id: string
  internalReference: string
  amount: string
  currency: string
  status: string
  provider: string
  providerReference: string | null
  createdAt: string
  userId: string
  courseId: string
}

export default function AdminPaymentsTab() {
  const [payments, setPayments] = useState<PaymentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const limit = 20

  useEffect(() => {
    loadPayments()
  }, [page])

  async function loadPayments() {
    setLoading(true)
    setError(null)
    try {
      const res = await apiRequest<{ payments: PaymentItem[], total: number, page: number, totalPages: number }>(
        `/academy/payments/admin/all?page=${page}&limit=${limit}`
      )
      setPayments(res.payments)
      setTotalPages(res.totalPages)
    } catch (err: any) {
      setError(err.message || 'Failed to load payments')
    } finally {
      setLoading(false)
    }
  }

  if (loading && payments.length === 0) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="animate-spin text-[#F5C518]" size={28} />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-display text-xl font-bold text-white mb-2">Payments</h2>
        <p className="text-sm text-white/50">
          View all payment attempts across fiat and crypto providers.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          {error}
        </div>
      )}

      <div className="rounded-3xl border border-white/5 bg-[#0A0A0A]/50 backdrop-blur-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-white/70">
            <thead className="bg-white/5 text-white/40 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-4">Reference</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Provider</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-white/40">
                    No payments found.
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id} className="hover:bg-white-[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-mono text-xs text-white/80">{p.internalReference}</div>
                      {p.providerReference && (
                        <div className="font-mono text-[10px] text-white/40 mt-1" title="Provider Reference">
                          {p.providerReference}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white">
                        {p.currency} {parseFloat(p.amount).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="capitalize">{p.provider}</span>
                    </td>
                    <td className="px-6 py-4">
                      {p.status === 'SUCCESS' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium">
                          <CheckCircle2 size={12} />
                          Success
                        </span>
                      ) : p.status === 'PENDING' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-medium">
                          <Clock size={12} />
                          Pending
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-medium">
                          Failed
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(p.createdAt).toLocaleDateString()} {new Date(p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="border-t border-white/5 p-4 flex items-center justify-between">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-medium transition-colors disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-white/40">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-medium transition-colors disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
