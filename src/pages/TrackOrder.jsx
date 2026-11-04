import { useMemo, useState } from 'react'
import { ArrowLeft, PackageSearch, Search, TriangleAlert } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import OrderTrackingTimeline from '../components/OrderTrackingTimeline.jsx'
import OrderStatusBadge from '../components/OrderStatusBadge.jsx'
import { useOrders } from '../context/OrderContext.jsx'
import { calculateOrderTotals, calculateSubtotal } from '../utils/pricing.js'
import { CONTACT_INFO } from '../config/contact.js'
import {
  findOrderForTracking,
  getOrderStatus,
  getPaymentStatus,
  isValidBangladeshPhone,
  isValidOrderId,
  maskPhoneNumber,
} from '../utils/orderTracking.js'

function getDeliveryAddress(order) {
  const customer = order.customer || {}
  return [
    customer.address,
    customer.locality,
    customer.upazila,
    customer.district,
  ]
    .filter(Boolean)
    .join(', ')
}

export default function TrackOrder() {
  const { orders, loadError } = useOrders()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [orderId, setOrderId] = useState(searchParams.get('orderId') || '')
  const [phone, setPhone] = useState('')
  const [trackedOrderId, setTrackedOrderId] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const trackedOrder = useMemo(
    () => orders.find((order) => order.orderId === trackedOrderId) || null,
    [orders, trackedOrderId],
  )

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setTrackedOrderId('')

    if (!isValidOrderId(orderId)) {
      setError('Enter a valid Order ID, for example EBABC12345.')
      return
    }

    if (!isValidBangladeshPhone(phone)) {
      setError('Enter a valid Bangladesh mobile number.')
      return
    }

    setIsLoading(true)
    await new Promise((resolve) => window.setTimeout(resolve, 250))
    const order = findOrderForTracking(orders, orderId, phone)
    setIsLoading(false)

    if (!order) {
      setError('Order not found. Check your Order ID and phone number and try again.')
      return
    }

    setTrackedOrderId(order.orderId)
  }

  const subtotal = trackedOrder ? calculateSubtotal(trackedOrder.items) : 0
  const calculatedTotals = calculateOrderTotals(subtotal)
  const deliveryCharge = Number.isFinite(trackedOrder?.delivery)
    ? trackedOrder.delivery
    : calculatedTotals.deliveryCharge
  const total = trackedOrder && Number.isFinite(trackedOrder.total)
    ? trackedOrder.total
    : Math.max(0, subtotal - Number(trackedOrder?.couponDiscount || 0)) + deliveryCharge
  const discount = trackedOrder?.discount || 0

  return (
    <main className="min-h-screen bg-[#f8faf7] px-4 py-8 pb-12 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-5xl">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="mb-6 inline-flex items-center gap-2 rounded-lg font-semibold text-slate-700 hover:text-green-700 focus:outline-none focus:ring-4 focus:ring-green-100"
        >
          <ArrowLeft size={18} aria-hidden="true" /> Back to EasyBazar
        </button>

        <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-8">
          <div className="flex items-start gap-4">
            <span className="rounded-2xl bg-green-50 p-3 text-green-800">
              <PackageSearch size={28} aria-hidden="true" />
            </span>
            <div>
              <p className="font-semibold text-green-800">EasyBazar order updates</p>
              <h1 className="mt-1 text-3xl font-extrabold text-slate-900">
                Track Your Order
              </h1>
              <p className="mt-2 text-slate-600">
                Track your grocery delivery in real time.
              </p>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-7 grid gap-4 rounded-2xl bg-slate-50 p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end sm:p-5"
          >
            <label className="text-sm font-semibold text-slate-800">
              Order ID
              <input
                value={orderId}
                onChange={(event) => setOrderId(event.target.value)}
                autoComplete="off"
                placeholder="e.g. EBABC12345"
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />
            </label>
            <label className="text-sm font-semibold text-slate-800">
              Phone Number
              <input
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                autoComplete="tel"
                placeholder="01XXXXXXXXX"
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />
            </label>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-green-700 px-5 py-3 font-bold text-white hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-200 disabled:cursor-wait disabled:opacity-70"
            >
              <Search size={18} aria-hidden="true" />
              {isLoading ? 'Searching...' : 'Track Order'}
            </button>
          </form>

          {error && (
            <p
              role="alert"
              className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800"
            >
              <TriangleAlert size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
              {error}
            </p>
          )}
          {loadError && (
            <p role="alert" className="mt-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
              {loadError}
            </p>
          )}
        </section>

        {!trackedOrder && !error && (
          <section className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <PackageSearch className="mx-auto text-slate-400" size={38} aria-hidden="true" />
            <h2 className="mt-3 font-bold text-slate-900">Ready to find your order?</h2>
            <p className="mt-1 text-sm text-slate-600">
              {orders.length
                ? 'Enter the Order ID and phone number used at checkout.'
                : 'No demo orders are available to track yet. Place an order to see it here.'}
            </p>
          </section>
        )}

        {trackedOrder && (
          <div className="mt-6 space-y-6">
            <OrderTrackingTimeline order={trackedOrder} />

            <section className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
              <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Order ID</p>
                    <h2 className="mt-1 text-xl font-extrabold text-green-800">
                      {trackedOrder.orderId}
                    </h2>
                  </div>
                  <OrderStatusBadge order={trackedOrder} />
                </div>

                <dl className="grid gap-4 py-5 text-sm sm:grid-cols-2">
                  <div><dt className="text-slate-500">Order Date</dt><dd className="mt-1 font-semibold text-slate-900">{trackedOrder.createdAt}</dd></div>
                  <div><dt className="text-slate-500">Customer Name</dt><dd className="mt-1 font-semibold text-slate-900">{trackedOrder.customer?.name}</dd></div>
                  <div><dt className="text-slate-500">Phone Number</dt><dd className="mt-1 font-semibold text-slate-900">{maskPhoneNumber(trackedOrder.customer?.phone)}</dd></div>
                  <div><dt className="text-slate-500">Payment Method</dt><dd className="mt-1 font-semibold text-slate-900">{trackedOrder.payment === 'cod' ? 'Cash on Delivery' : `${trackedOrder.wallet || 'Wallet'} Demo`}</dd></div>
                  <div><dt className="text-slate-500">Payment Status</dt><dd className="mt-1 font-semibold text-slate-900">{getPaymentStatus(trackedOrder)}</dd></div>
                  <div><dt className="text-slate-500">Current Order Status</dt><dd className="mt-1 font-semibold text-slate-900">{getOrderStatus(trackedOrder)}</dd></div>
                  <div className="sm:col-span-2"><dt className="text-slate-500">Delivery Address</dt><dd className="mt-1 font-semibold leading-6 text-slate-900">{getDeliveryAddress(trackedOrder)}</dd></div>
                </dl>

                <h3 className="border-t border-slate-100 pt-5 font-bold text-slate-900">
                  Ordered Products
                </h3>
                <ul className="mt-3 divide-y divide-slate-100">
                  {trackedOrder.items.map((item, index) => (
                    <li key={item.id ?? `${item.name}-${index}`} className="flex justify-between gap-4 py-3 text-sm">
                      <span className="font-medium text-slate-800">{item.name} <span className="text-slate-500">× {item.quantity || 1}</span></span>
                      <span className="shrink-0 font-semibold text-slate-900">৳{Number(item.price || 0) * Number(item.quantity || 1)}</span>
                    </li>
                  ))}
                </ul>
              </article>

              <aside className="space-y-5">
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <h2 className="text-lg font-bold text-slate-900">Order Summary</h2>
                  <div className="mt-4 space-y-3 text-sm">
                    <div className="flex justify-between gap-3 text-slate-700"><span>Subtotal</span><span>৳{subtotal + discount}</span></div>
                    {discount > 0 && <div className="flex justify-between gap-3 text-green-800"><span>Product discounts</span><span>−৳{discount}</span></div>}
                    {trackedOrder.couponDiscount > 0 && <div className="flex justify-between gap-3 text-green-800"><span>Coupon ({trackedOrder.couponCode})</span><span>−৳{trackedOrder.couponDiscount}</span></div>}
                    <div className="flex justify-between gap-3 text-slate-700"><span>Delivery Fee</span><span>৳{deliveryCharge}</span></div>
                    <div className="flex justify-between gap-3 border-t border-slate-100 pt-3 text-base font-extrabold text-slate-900"><span>Total Amount</span><span>৳{total}</span></div>
                  </div>
                </section>

                <section className="rounded-2xl border border-green-100 bg-green-50 p-5 text-sm text-green-950 sm:p-6">
                  <h2 className="font-bold">Delivery Information</h2>
                  <ul className="mt-3 space-y-2">
                    <li>Delivery Fee: ৳{deliveryCharge}{deliveryCharge === 0 ? ' (free delivery)' : ` (free on orders ৳${CONTACT_INFO.freeDeliveryMinimum}+)`}</li>
                    <li>Estimated Delivery: {trackedOrder.estimatedDelivery || '2–3 Hours'}</li>
                    <li>Operating Hours: {trackedOrder.orderTime || '7:00 AM – 9:00 PM'}</li>
                    <li>Area: Configured Rajshahi District locations only</li>
                  </ul>
                </section>
              </aside>
            </section>
          </div>
        )}
      </div>
    </main>
  )
}
