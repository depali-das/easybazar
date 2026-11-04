import { useState } from 'react'
import { ArrowLeft, BadgePercent, Check, Copy, ShoppingBag, Tag } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useCatalog } from '../context/CatalogContext.jsx'
import { formatCouponDiscount, getActiveCoupons } from '../utils/couponUtils.js'

function formatCurrency(value) {
  return `৳${Number(value || 0).toLocaleString('en-BD')}`
}

export default function Offers() {
  const { offers } = useCatalog()
  const navigate = useNavigate()
  const [copiedCode, setCopiedCode] = useState('')
  const [copyError, setCopyError] = useState('')
  const activeCoupons = getActiveCoupons(offers)

  async function copyCode(code) {
    try {
      await navigator.clipboard.writeText(code)
    } catch {
      try {
        const temporaryInput = document.createElement('textarea')
        temporaryInput.value = code
        temporaryInput.setAttribute('readonly', '')
        temporaryInput.style.position = 'fixed'
        temporaryInput.style.opacity = '0'
        document.body.appendChild(temporaryInput)
        let copied
        try {
          temporaryInput.select()
          copied = document.execCommand('copy')
        } finally {
          temporaryInput.remove()
        }
        if (!copied) throw new Error('The browser denied clipboard access.')
      } catch (fallbackError) {
        console.error('Unable to copy coupon code:', fallbackError)
        setCopyError('Could not copy the code. Please select and copy it manually.')
        return
      }
    }
    setCopiedCode(code)
    setCopyError('')
    window.setTimeout(() => setCopiedCode(''), 1800)
  }

  return (
    <main className="min-h-screen bg-[#f8faf7] px-4 py-8 pb-16 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-6xl">
        <button type="button" onClick={() => navigate('/')} className="mb-6 inline-flex items-center gap-2 rounded-lg font-semibold text-slate-700 hover:text-green-800">
          <ArrowLeft size={18} /> Back to EasyBazar
        </button>

        <header className="overflow-hidden rounded-3xl bg-linear-to-br from-green-900 to-green-700 p-6 text-white shadow-lg sm:p-10">
          <div className="flex items-center gap-3"><span className="rounded-2xl bg-white/15 p-3"><BadgePercent size={28} /></span><span className="rounded-full bg-amber-300 px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-amber-950">Frontend demo offers</span></div>
          <h1 className="mt-5 text-3xl font-extrabold sm:text-4xl">Available Offers</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-green-50 sm:text-base">Copy a promo code and apply it in your cart or checkout. Discounts apply only to eligible product subtotal, never the ৳60 delivery fee.</p>
        </header>

        {copyError && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-800">{copyError}</p>}

        {activeCoupons.length ? (
          <section aria-label="Active coupons" className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {activeCoupons.map((coupon) => (
              <article key={coupon.id} className="relative overflow-hidden rounded-2xl border border-green-100 bg-white shadow-sm">
                <div className="absolute -left-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-[#f8faf7]" />
                <div className="absolute -right-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-[#f8faf7]" />
                <div className="border-b border-dashed border-green-200 bg-green-50 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div><p className="text-sm font-bold text-green-800">{formatCouponDiscount(coupon)}</p><p className="mt-1 text-xs text-slate-600">{coupon.targetMode === 'all' ? 'Eligible grocery items' : coupon.targetMode === 'categories' ? `Categories: ${coupon.eligibleCategories.join(', ')}` : 'Selected products only'}</p></div>
                    <Tag className="shrink-0 text-green-700" size={22} />
                  </div>
                  <p className="mt-4 inline-flex rounded-lg border border-dashed border-green-500 bg-white px-3 py-2 font-mono text-lg font-extrabold tracking-widest text-slate-900">{coupon.code}</p>
                </div>
                <div className="p-5">
                  <p className="text-sm text-slate-700">Minimum purchase: <strong>{formatCurrency(coupon.minimumOrder)}</strong></p>
                  <p className="mt-1 text-sm text-slate-700">Expires: <strong>{coupon.expiryDate || 'No expiry date'}</strong></p>
                  {coupon.maxDiscount > 0 && <p className="mt-1 text-sm text-slate-700">Maximum discount: <strong>{formatCurrency(coupon.maxDiscount)}</strong></p>}
                  <div className="mt-5 grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => copyCode(coupon.code)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-green-700 px-3 py-2.5 text-sm font-bold text-green-800 hover:bg-green-50">{copiedCode === coupon.code ? <Check size={16} /> : <Copy size={16} />}{copiedCode === coupon.code ? 'Copied' : 'Copy Code'}</button>
                    <button type="button" onClick={() => navigate('/')} className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-700 px-3 py-2.5 text-sm font-bold text-white hover:bg-green-800"><ShoppingBag size={16} /> Shop Now</button>
                  </div>
                </div>
              </article>
            ))}
          </section>
        ) : (
          <section className="mt-7 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <Tag className="mx-auto text-slate-400" size={36} />
            <h2 className="mt-3 text-xl font-bold text-slate-900">No active offers right now</h2>
            <p className="mt-2 text-sm text-slate-600">Please check back later for EasyBazar demo coupons.</p>
          </section>
        )}
      </div>
    </main>
  )
}
