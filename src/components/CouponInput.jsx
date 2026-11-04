import { useState } from 'react'
import { BadgePercent, CheckCircle2, Tag, X } from 'lucide-react'

export default function CouponInput({
  appliedCoupon,
  appliedCouponCode,
  couponError,
  couponMessage,
  couponDiscount,
  onApply,
  onRemove,
  onShowOffers,
  customerPhone = '',
}) {
  const [code, setCode] = useState('')
  const [feedback, setFeedback] = useState('')

  function apply() {
    const result = onApply(code, { phone: customerPhone })
    if (result?.ok) {
      setCode('')
      setFeedback('')
    } else {
      setFeedback(result?.error || 'Invalid coupon code.')
    }
  }

  const isApplied = Boolean(appliedCouponCode)

  return (
    <section className="rounded-2xl border border-green-100 bg-green-50/70 p-4">
      <div className="flex items-start gap-3">
        <span className="rounded-xl bg-white p-2 text-green-800"><BadgePercent size={20} /></span>
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-slate-900">Have a Coupon Code?</h3>
          <p className="mt-1 text-xs text-slate-600">Demo offers only. Coupon discounts apply to eligible product subtotal, not delivery.</p>
        </div>
      </div>

      {isApplied ? (
        <div className="mt-3 rounded-xl border border-green-200 bg-white p-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              {appliedCoupon ? <CheckCircle2 className="shrink-0 text-green-700" size={18} /> : <Tag className="shrink-0 text-amber-700" size={18} />}
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-green-900">{appliedCouponCode} {appliedCoupon ? 'applied' : 'needs attention'}</p>
                <p className="text-xs text-slate-600">{couponError || couponMessage || 'Coupon discount'}{appliedCoupon ? ` · −৳${couponDiscount}` : ''}</p>
              </div>
            </div>
            <button type="button" onClick={onRemove} className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-bold text-red-700 hover:bg-red-50"><X size={15} /> Remove</button>
          </div>
        </div>
      ) : (
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <label className="sr-only" htmlFor="easybazar-coupon-code">Coupon code</label>
          <input
            id="easybazar-coupon-code"
            value={code}
            onChange={(event) => setCode(event.target.value.toUpperCase())}
            onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); apply() } }}
            placeholder="Enter coupon code"
            autoComplete="off"
            className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold uppercase outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
          />
          <button type="button" onClick={apply} className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-green-800"><Tag size={16} /> Apply Coupon</button>
        </div>
      )}

      {(feedback || couponError || couponMessage) && !isApplied && (
        <p role={feedback || couponError ? 'alert' : 'status'} className={`mt-2 text-sm font-semibold ${feedback || couponError ? 'text-red-700' : 'text-green-800'}`}>
          {feedback || couponError || couponMessage}
        </p>
      )}
      {isApplied && couponError && (
        <p role="alert" className="mt-2 text-sm font-semibold text-amber-800">{couponError} Remove or choose another coupon.</p>
      )}

      <button type="button" onClick={onShowOffers} className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-green-800 hover:underline"><Tag size={15} /> Available Offers</button>
    </section>
  )
}
