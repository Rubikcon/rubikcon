import React, { useState } from 'react'
import { X, Loader2, CreditCard, Bitcoin } from 'lucide-react'
import { apiRequest } from '../lib/api'

interface CheckoutModalProps {
  courseId: string
  courseTitle: string
  priceNgn: number | null
  priceUsd: number | null
  discountedPriceNgn: number | null
  discountedPriceUsd: number | null
  onClose: () => void
  onSuccess: () => void
}

export default function CheckoutModal({
  courseId,
  courseTitle,
  priceNgn,
  priceUsd,
  discountedPriceNgn,
  discountedPriceUsd,
  onClose,
}: CheckoutModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCheckout = async (currency: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiRequest<{ checkoutUrl: string; internalReference: string }>(
        '/academy/payments/initialize',
        {
          method: 'POST',
          body: JSON.stringify({ courseId, currency }),
        }
      )
      
      // Redirect to the provider checkout URL
      window.location.href = res.checkoutUrl
    } catch (err: any) {
      setError(err.message || 'Failed to initialize checkout')
      setLoading(false)
    }
  }

  const ngnPrice = discountedPriceNgn || priceNgn
  const usdPrice = discountedPriceUsd || priceUsd

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">Select Payment Method</h2>
          <button
            onClick={onClose}
            className="text-white/50 hover:text-white transition-colors"
            disabled={loading}
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <p className="text-white/60 text-sm mb-6">
            You are enrolling in <strong className="text-white">{courseTitle}</strong>. Please select your preferred currency and payment method below.
          </p>

          {error && (
            <div className="mb-4 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-100">
              {error}
            </div>
          )}

          <div className="space-y-3">
            {ngnPrice && (
              <button
                onClick={() => handleCheckout('NGN')}
                disabled={loading}
                className="w-full flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors group disabled:opacity-50"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                    <CreditCard size={20} />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-white">Pay in NGN (Fiat)</div>
                    <div className="text-sm text-white/50">via Paystack (Card, Transfer)</div>
                  </div>
                </div>
                <div className="font-bold text-white">₦{ngnPrice.toLocaleString()}</div>
              </button>
            )}

            {usdPrice && (
              <>
                <button
                  onClick={() => handleCheckout('USD')}
                  disabled={loading}
                  className="w-full flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors group disabled:opacity-50"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                      <CreditCard size={20} />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-white">Pay in USD (Fiat)</div>
                      <div className="text-sm text-white/50">via Paystack (Card, Apple Pay)</div>
                    </div>
                  </div>
                  <div className="font-bold text-white">${usdPrice.toLocaleString()}</div>
                </button>

                <button
                  onClick={() => handleCheckout('USDT')}
                  disabled={loading}
                  className="w-full flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors group disabled:opacity-50"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400">
                      <Bitcoin size={20} />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-white">Pay with Crypto</div>
                      <div className="text-sm text-white/50">via NOWPayments (BTC, ETH, etc)</div>
                    </div>
                  </div>
                  <div className="font-bold text-white">${usdPrice.toLocaleString()}</div>
                </button>
              </>
            )}
          </div>

          {loading && (
            <div className="mt-6 flex justify-center items-center gap-2 text-white/50 text-sm">
              <Loader2 size={16} className="animate-spin" />
              Initializing secure checkout...
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
