import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'
import CouponInput from './CouponInput.jsx'
import { useCatalog } from '../context/CatalogContext.jsx'
import { useDelivery } from '../context/DeliveryContext.jsx'
import { useOrders } from '../context/OrderContext.jsx'
import ProductImage from './ProductImage.jsx'
import {
  AVAILABLE_DELIVERY_DISTRICTS,
  DELIVERY_DISTRICT,
  getOrderingStatus,
  isOrderingOpen,
  isDeliveryLocationAvailable,
  RAJSHAHI_DELIVERY_LOCATIONS,
} from '../data/deliveryAreas.js'
import {
  calculateDiscountTotal,
  calculateOrderTotals,
  calculateSubtotal,
} from '../utils/pricing.js'
import {
  calculateCouponDiscount,
  getCouponCustomerToken,
} from '../utils/couponUtils.js'
import {
  createInitialStatusHistory,
  createOrderId,
} from '../utils/orderTracking.js'
import { getDemoSession } from '../utils/demoAuth.js'
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  MapPin,
  PackageCheck,
  ShoppingBag,
  Wallet,
} from 'lucide-react'

function getCurrentDate() {
  return new Date()
}

export default function Checkout({ onBack, onTrack }) {
  const navigate = useNavigate()
  const {
    cartItems,
    clearCart,
    appliedCoupon,
    appliedCouponCode,
    couponDiscount,
    couponError,
    couponMessage,
    applyCoupon,
    removeCoupon,
    validateAppliedCoupon,
  } = useCart()
  const { recordOfferUsage } = useCatalog()
  const {
    selectedDistrict,
    selectedLocation,
    setSelectedDistrict,
    setSelectedLocation,
  } = useDelivery()
  const { addOrder, orders } = useOrders()
  const subtotal = calculateSubtotal(cartItems)
  const discountTotal = calculateDiscountTotal(cartItems)
  const { deliveryCharge } = calculateOrderTotals(subtotal)
  const total = Math.max(0, subtotal - couponDiscount) + deliveryCharge

  const [form, setForm] = useState({
    name: '',
    phone: '',
    district: selectedDistrict || DELIVERY_DISTRICT,
    upazila: selectedLocation,
    locality: '',
    address: '',
    instructions: '',
  })

  const [payment, setPayment] = useState('cod')
  const [wallet, setWallet] = useState('bKash')
  const [placedOrder, setPlacedOrder] = useState(null)
  const [error, setError] = useState('')
  const [currentTime, setCurrentTime] = useState(() => new Date())
  const orderingStatus = getOrderingStatus(currentTime)
  const locationAvailable = isDeliveryLocationAvailable(
    form.district,
    form.upazila,
  )

  useEffect(() => {
    const timer = window.setInterval(() => setCurrentTime(getCurrentDate()), 15_000)
    return () => window.clearInterval(timer)
  }, [])

  function handleChange(event) {
    const { name, value } = event.target
    setForm((previous) => ({ ...previous, [name]: value }))
    if (name === 'district') setSelectedDistrict(value)
    if (name === 'upazila') setSelectedLocation(value)
    setError('')
  }

  function handleSubmit(event) {
    event.preventDefault()

    if (!cartItems.length) {
      setError('Your cart is empty. Please add products first.')
      return
    }

    if (
      form.name.trim().length < 2 ||
      form.upazila.trim().length < 2 ||
      form.locality.trim().length < 2 ||
      form.address.trim().length < 8
    ) {
      setError('Enter your name, Rajshahi area, locality, and a complete address of at least 8 characters.')
      return
    }

    const phoneDigits = form.phone.replace(/\D/g, '')
    const localPhone = phoneDigits.startsWith('880')
      ? `0${phoneDigits.slice(3)}`
      : phoneDigits
    if (!/^01[3-9]\d{8}$/.test(localPhone)) {
      setError('Enter a valid Bangladesh mobile number, such as 01XXXXXXXXX.')
      return
    }

    const couponCheck = validateAppliedCoupon({ phone: form.phone })
    if (!couponCheck.valid) {
      setError(couponCheck.reason)
      return
    }

    if (!form.upazila.trim() || !form.locality.trim() || !form.address.trim()) {
      setError('Enter your upazila or city area, locality, and complete house address.')
      return
    }

    if (!isDeliveryLocationAvailable(form.district, form.upazila)) {
      setError('Enter your delivery area in Rajshahi District.')
      return
    }

    const submittedAt = getCurrentDate()
    if (!isOrderingOpen(submittedAt)) {
      setError('We accept orders daily from 7:00 AM to 9:00 PM.')
      return
    }

    const freshSubtotal = calculateSubtotal(cartItems)
    const freshTotals = calculateOrderTotals(freshSubtotal)
    const freshCouponDiscount = couponCheck.coupon
      ? calculateCouponDiscount(couponCheck.coupon, cartItems)
      : 0
    const demoAccount = getDemoSession()
    const order = {
      orderId: createOrderId(orders.map((savedOrder) => savedOrder.orderId)),
      customerId: demoAccount?.customerId || `guest-${getCouponCustomerToken(form.phone)}`,
      orderStatus: 'Order Placed',
      statusHistory: createInitialStatusHistory(submittedAt.toISOString()),
      customer: {
        name: form.name.trim(),
        email: demoAccount?.email || '',
        phone: form.phone.trim(),
        district: form.district,
        upazila: form.upazila.trim(),
        locality: form.locality.trim(),
        address: form.address.trim(),
        instructions: form.instructions.trim(),
      },
      payment,
      wallet: payment === 'wallet' ? wallet : null,
      items: cartItems.map((item) => ({ ...item })),
      subtotal: freshSubtotal,
      discount: calculateDiscountTotal(cartItems),
      couponCode: couponCheck.coupon?.code || '',
      couponDiscount: freshCouponDiscount,
      delivery: freshTotals.deliveryCharge,
      total: Math.max(0, freshSubtotal - freshCouponDiscount) + freshTotals.deliveryCharge,
      estimatedDelivery: '2–3 Hours',
      orderTime: '7:00 AM – 9:00 PM',
      deliveryStatus: 'Order Placed',
      createdAtISO: submittedAt.toISOString(),
      createdAt: new Intl.DateTimeFormat('en-BD', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'Asia/Dhaka',
      }).format(submittedAt),
    }

    try {
      addOrder(order)
      if (couponCheck.coupon) {
        recordOfferUsage(
          couponCheck.coupon.id,
          getCouponCustomerToken(form.phone),
        )
      }
      setPlacedOrder(order)
      setError('')
      clearCart()
    } catch (saveError) {
      setError(saveError.message)
    }
  }

  if (placedOrder) {
    return (
      <main className="min-h-screen bg-[#f8faf7] px-4 py-10">
        <div className="checkout-panel mx-auto max-w-2xl rounded-3xl border border-gray-100 bg-white p-6 text-center shadow-sm sm:p-10">
          <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-green-600" aria-hidden="true" />
          <p className="font-semibold text-green-800">EasyBazar Demo Checkout</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Order Confirmed!</h1>
          <p className="mt-3 text-slate-700">
            Your demo order has been saved in this browser. No real payment has been collected.
          </p>
          <p className="mt-4 rounded-xl bg-amber-50 p-4 text-sm font-semibold text-amber-900">
            Order status: {placedOrder.orderStatus}
          </p>
          <p className="mt-3 text-sm text-slate-700">
            Delivering to: <strong>{placedOrder.customer.upazila}, {placedOrder.customer.district}</strong>
            {' · '}Estimated Delivery: <strong>{placedOrder.estimatedDelivery}</strong>
            {' · '}Order Time: <strong>{placedOrder.orderTime}</strong>
          </p>

          <div className="my-6 rounded-2xl bg-green-50 p-4">
            <p className="text-sm font-medium text-slate-700">Demo Order ID</p>
            <p className="mt-1 text-2xl font-bold text-green-800">{placedOrder.orderId}</p>
          </div>

          <div className="space-y-3 rounded-2xl border border-gray-200 p-4 text-left">
            <h2 className="font-bold text-slate-900">Order Summary</h2>
            {placedOrder.items.map((item, index) => (
              <div key={item.id ?? `${item.name}-${index}`} className="flex justify-between gap-4 text-sm">
                <span className="text-slate-800">{item.name} × {item.quantity || 1}</span>
                <span className="font-semibold text-slate-900">৳{Number(item.price || 0) * Number(item.quantity || 1)}</span>
              </div>
            ))}

            <div className="border-t border-gray-200 pt-3 text-sm">
              <div className="flex justify-between py-1 text-slate-800">
                <span>{placedOrder.discount > 0 ? 'Items subtotal' : 'Subtotal'}</span>
                <span>৳{placedOrder.subtotal + placedOrder.discount}</span>
              </div>
              {placedOrder.discount > 0 && (
                <>
                  <div className="flex justify-between py-1 font-semibold text-green-800">
                    <span>Product discounts</span>
                    <span>−৳{placedOrder.discount}</span>
                  </div>
                  <div className="flex justify-between py-1 text-slate-800">
                    <span>Subtotal after discounts</span>
                    <span>৳{placedOrder.subtotal}</span>
                  </div>
                </>
              )}
              {placedOrder.couponDiscount > 0 && (
                <div className="flex justify-between py-1 font-semibold text-green-800">
                  <span>Coupon ({placedOrder.couponCode})</span>
                  <span>−৳{placedOrder.couponDiscount}</span>
                </div>
              )}
              <div className="flex justify-between py-1 text-slate-800">
                <span>Delivery Fee</span>
                <span>৳{placedOrder.delivery}</span>
              </div>
              <div className="flex justify-between pt-2 text-base font-bold text-slate-900">
                <span>Total</span>
                <span>৳{placedOrder.total}</span>
              </div>
            </div>
          </div>

          <p className="mt-5 text-sm text-slate-700">
            Payment method: <strong className="text-slate-900">{placedOrder.payment === 'cod' ? 'Cash on Delivery' : `${placedOrder.wallet} Demo`}</strong>
          </p>

          {placedOrder.payment === 'wallet' && (
            <p className="mt-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">Demo only — no wallet payment was processed.</p>
          )}

          <div className="mt-7 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => onTrack?.(placedOrder.orderId)}
            className="rounded-xl border border-green-700 px-6 py-3 font-semibold text-green-800 hover:bg-green-50 focus:outline-none focus:ring-4 focus:ring-green-200"
          >
            Track Order
          </button>
          <button
            type="button"
            onClick={onBack}
            aria-label="Back to EasyBazar home"
            className="rounded-xl bg-green-700 px-6 py-3 font-semibold text-white transition hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-200"
          >
            Back to EasyBazar
          </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#f8faf7] px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <button
          type="button"
          onClick={onBack}
          aria-label="Continue shopping"
          className="mb-6 inline-flex items-center gap-2 font-semibold text-slate-700 hover:text-green-700 focus:outline-none focus:ring-4 focus:ring-green-100 rounded-lg"
        >
          <ArrowLeft size={18} aria-hidden="true" /> Continue Shopping
        </button>

        <div className="mb-8">
          <p className="font-semibold text-green-800">EasyBazar</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">Checkout</h1>
          <p className="mt-2 text-slate-700">
            Delivery is available within Rajshahi District. Enter your area and locality; service hours are 7:00 AM–9:00 PM (Bangladesh time).
          </p>
        </div>

        {!cartItems.length ? (
          <section className="checkout-panel rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-sm">
            <ShoppingBag className="mx-auto h-12 w-12 text-slate-500" aria-hidden="true" />
            <h2 className="mt-4 text-xl font-bold text-slate-900">Your cart is empty</h2>
            <p className="mt-2 text-slate-700">Add some products before checking out.</p>
            <button
              type="button"
              onClick={onBack}
              aria-label="Browse products"
              className="mt-5 rounded-xl bg-green-700 px-5 py-3 font-semibold text-white focus:outline-none focus:ring-4 focus:ring-green-200"
            >
              Browse Products
            </button>
          </section>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
              <div className="space-y-6">
                <section className="checkout-panel rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7">
                  <div className="mb-5 flex items-center gap-3">
                    <MapPin className="text-green-800" size={20} aria-hidden="true" />
                    <h2 className="text-xl font-bold text-slate-900">Delivery Information</h2>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="text-sm font-semibold text-slate-800">
                      Full Name *
                      <input name="name" value={form.name} onChange={handleChange} required autoComplete="name" placeholder="Enter your full name" className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100" />
                    </label>

                    <label className="text-sm font-semibold text-slate-800">
                      Phone Number *
                      <input name="phone" type="tel" value={form.phone} onChange={handleChange} required autoComplete="tel" placeholder="01XXXXXXXXX" className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100" />
                    </label>

                    <label className="text-sm font-semibold text-slate-800">
                      District *
                      <select name="district" value={form.district} onChange={handleChange} required className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100">
                        {AVAILABLE_DELIVERY_DISTRICTS.map((district) => (
                          <option key={district} value={district}>{district}</option>
                        ))}
                      </select>
                    </label>

                    <label className="text-sm font-semibold text-slate-800">
                      Area / Upazila *
                      <input name="upazila" value={form.upazila} onChange={handleChange} required list="rajshahi-delivery-locations" autoComplete="address-level2" placeholder="Choose or enter your area" className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100" />
                      <datalist id="rajshahi-delivery-locations">
                        {RAJSHAHI_DELIVERY_LOCATIONS.map((location) => (
                          <option key={location} value={location} />
                        ))}
                      </datalist>
                      <span className="mt-1 block text-xs font-medium text-slate-600">Rajshahi is supported; suggested locations come from the shared area list.</span>
                    </label>

                    <label className="text-sm font-semibold text-slate-800 sm:col-span-2">
                      Union, village, neighbourhood, or road *
                      <input name="locality" value={form.locality} onChange={handleChange} required autoComplete="address-level3" placeholder="Enter your union, village, neighbourhood or road" className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100" />
                    </label>

                    <div role="status" aria-live="polite" className={`rounded-xl p-4 text-sm sm:col-span-2 ${orderingStatus.isOpen ? 'bg-green-50 text-green-900' : 'bg-amber-50 text-amber-900'}`}>
                      <p className="font-semibold">{orderingStatus.message}</p>
                    </div>
                    <div
                      role="status"
                      aria-live="polite"
                      className={`rounded-xl p-4 text-sm sm:col-span-2 ${locationAvailable ? 'bg-green-50 text-green-900' : 'bg-amber-50 text-amber-900'}`}
                    >
                      {locationAvailable
                        ? <>Great! We deliver to your area. Delivery Fee: ৳{deliveryCharge}. Estimated Delivery: 2–3 Hours.</>
                        : <>Sorry! Delivery is not available in your area yet. We are expanding our delivery network.</>}
                    </div>

                    <label className="text-sm font-semibold text-slate-800 sm:col-span-2">
                      Full Delivery Address *
                      <textarea name="address" value={form.address} onChange={handleChange} required rows={3} minLength={8} autoComplete="street-address" placeholder="House number, street, village or neighbourhood, and nearby landmark" className="mt-2 w-full resize-y rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100" />
                    </label>

                    <label className="text-sm font-semibold text-slate-800 sm:col-span-2">
                      Delivery instructions (optional)
                      <textarea name="instructions" value={form.instructions} onChange={handleChange} rows={2} placeholder="Landmark, preferred contact time, or other helpful details" className="mt-2 w-full resize-y rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100" />
                    </label>
                  </div>
                </section>

                <section className="checkout-panel rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7">
                  <div className="mb-5 flex items-center gap-3">
                    <CreditCard className="text-green-800" size={20} aria-hidden="true" />
                    <h2 className="text-xl font-bold text-slate-900">Payment Method</h2>
                  </div>

                  <div className="space-y-3">
                    <label className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 ${payment === 'cod' ? 'border-green-600 bg-green-50' : 'border-slate-200'}`}>
                      <input type="radio" name="payment" value="cod" checked={payment === 'cod'} onChange={() => setPayment('cod')} className="mt-1 accent-green-700" />
                      <span>
                        <span className="block font-semibold text-slate-900">Cash on Delivery (COD)</span>
                        <span className="mt-1 block text-sm font-medium text-slate-700">Pay when your order arrives.</span>
                      </span>
                    </label>

                    <label className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 ${payment === 'wallet' ? 'border-green-600 bg-green-50' : 'border-slate-200'}`}>
                      <input type="radio" name="payment" value="wallet" checked={payment === 'wallet'} onChange={() => setPayment('wallet')} className="mt-1 accent-green-700" />
                      <span>
                        <span className="block font-semibold text-slate-900">bKash / Nagad</span>
                        <span className="mt-1 block text-sm font-medium text-slate-700">Demo UI only — no real payment.</span>
                      </span>
                    </label>
                  </div>

                  {payment === 'wallet' && (
                    <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                      <div className="flex items-center gap-2 font-semibold text-amber-900">
                        <Wallet size={19} aria-hidden="true" /> Choose a wallet
                      </div>
                      <div className="mt-3 flex flex-wrap gap-3">
                        {['bKash', 'Nagad'].map((option) => (
                          <button key={option} type="button" onClick={() => setWallet(option)} aria-pressed={wallet === option} aria-label={`Select ${option} wallet`} className={`rounded-xl border px-5 py-2 font-semibold focus:outline-none focus:ring-4 focus:ring-green-200 ${wallet === option ? 'border-green-700 bg-green-700 text-white' : 'border-slate-300 bg-white text-slate-800'}`}>
                            {option}
                          </button>
                        ))}
                      </div>
                      <p className="mt-3 text-sm font-medium text-amber-900">This is a visual demo. Do not enter a PIN, OTP, or wallet credentials.</p>
                    </div>
                  )}
                </section>
              </div>

              <aside className="checkout-panel h-fit rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7 lg:sticky lg:top-5">
                <div className="mb-5 flex items-center gap-3">
                  <PackageCheck className="text-green-800" size={20} aria-hidden="true" />
                  <h2 className="text-xl font-bold text-slate-900">Your Order</h2>
                </div>

                <div className="space-y-4">
                  {cartItems.map((item, index) => (
                    <div key={item.id ?? `${item.name}-${index}`} className="flex items-center gap-3">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100">
                        <ProductImage src={item.image} alt={item.name || 'Grocery product'} className="h-full w-full object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-slate-900">{item.name}</p>
                        <p className="text-sm font-medium text-slate-700">Qty: {item.quantity || 1}</p>
                      </div>
                      <p className="text-sm font-semibold text-slate-900">৳{Number(item.price || 0) * Number(item.quantity || 1)}</p>
                    </div>
                  ))}
                </div>

                <div className="my-5 border-t border-slate-200" />

                <CouponInput
                  appliedCoupon={appliedCoupon}
                  appliedCouponCode={appliedCouponCode}
                  couponError={couponError}
                  couponMessage={couponMessage}
                  couponDiscount={couponDiscount}
                  onApply={applyCoupon}
                  onRemove={removeCoupon}
                  onShowOffers={() => navigate('/offers')}
                  customerPhone={form.phone}
                />

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between gap-3">
                    <span className="font-medium text-slate-700">{discountTotal > 0 ? 'Items subtotal' : 'Subtotal'}</span>
                    <span className="font-semibold text-slate-900">৳{subtotal + discountTotal}</span>
                  </div>
                  {discountTotal > 0 && (
                    <>
                      <div className="flex justify-between gap-3 font-semibold text-green-800">
                        <span>Product discounts</span>
                        <span>−৳{discountTotal}</span>
                      </div>
                      <div className="flex justify-between gap-3">
                        <span className="font-medium text-slate-700">Subtotal after discounts</span>
                        <span className="font-semibold text-slate-900">৳{subtotal}</span>
                      </div>
                    </>
                  )}
                  {appliedCouponCode && appliedCoupon && (
                    <div className="flex justify-between gap-3 font-semibold text-green-800">
                      <span>Coupon ({appliedCoupon.code})</span>
                      <span>−৳{couponDiscount}</span>
                    </div>
                  )}
                  <div className="flex justify-between gap-3">
                    <span className="font-medium text-slate-700">Delivery Fee</span>
                    <span className="font-semibold text-slate-900">৳{deliveryCharge}</span>
                  </div>
                  <div className="flex justify-between gap-3 border-t border-slate-200 pt-4 text-lg font-bold">
                    <span className="text-slate-900">Total</span>
                    <span className="text-green-800">৳{total}</span>
                  </div>
                </div>

                {error && (
                  <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-800">{error}</p>
                )}

                <button type="submit" disabled={!orderingStatus.isOpen || !locationAvailable} aria-label="Place demo order" className="mt-6 w-full rounded-xl bg-green-700 px-5 py-3.5 font-bold text-white transition hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-200 disabled:cursor-not-allowed disabled:opacity-50">
                  Place Demo Order
                </button>

                <p className="mt-3 text-center text-xs font-medium text-slate-600">Demo only · No real payment or server submission</p>
              </aside>
            </div>
          </form>
        )}
      </div>
    </main>
  )
}