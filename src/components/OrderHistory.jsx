import { ArrowLeft, ClipboardList, PackageCheck } from 'lucide-react'
import { useOrders } from '../context/OrderContext.jsx'
import {
  calculateDiscountTotal,
  calculateOrderTotals,
  calculateSubtotal,
} from '../utils/pricing.js'
import OrderStatusBadge from './OrderStatusBadge.jsx'
import ProductImage from './ProductImage.jsx'
import { getOrderStatus } from '../utils/orderTracking.js'
import WhatsAppButton from './WhatsAppButton.jsx'

export default function OrderHistory({ onBack, onTrack, onNeedHelp, account }) {
  const { orders: allOrders, loadError } = useOrders()
  const orders = account?.customerId
    ? allOrders.filter((order) => order.customerId === account.customerId)
    : []

  return (
    <main className="min-h-screen bg-[#f8faf7] px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <button
          type="button"
          onClick={onBack}
          className="mb-6 inline-flex items-center gap-2 font-semibold text-slate-700 hover:text-green-700 focus:outline-none focus:ring-4 focus:ring-green-100 rounded-lg"
        >
          <ArrowLeft size={18} aria-hidden="true" /> Back to EasyBazar
        </button>

        <div className="mb-8 flex items-center gap-3">
          <ClipboardList className="text-green-800" size={30} aria-hidden="true" />
          <div>
            <p className="font-semibold text-green-800">EasyBazar</p>
            <h1 className="text-3xl font-bold text-slate-900">My Orders</h1>
          </div>
        </div>

        {loadError && (
          <p role="alert" className="mb-5 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
            {loadError}
          </p>
        )}

        {orders.length === 0 ? (
          <section className="checkout-panel rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-sm">
            <PackageCheck className="mx-auto h-12 w-12 text-slate-500" aria-hidden="true" />
            <h2 className="mt-4 text-xl font-bold">No orders yet</h2>
            <p className="mt-2 text-slate-700">
              Your confirmed demo orders will appear here.
            </p>
            <button
              type="button"
              onClick={onBack}
              className="mt-5 rounded-xl bg-green-700 px-5 py-3 font-semibold text-white hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-200"
            >
              Browse Products
            </button>
          </section>
        ) : (
          <div className="space-y-5">
            {orders.map((order, index) => {
              const subtotal = calculateSubtotal(order.items)
              const discountTotal = calculateDiscountTotal(order.items)
              const calculatedTotals = calculateOrderTotals(subtotal)
              const deliveryCharge = Number.isFinite(order.delivery)
                ? order.delivery
                : calculatedTotals.deliveryCharge
              const total = Number.isFinite(order.total)
                ? order.total
                : Math.max(0, subtotal - Number(order.couponDiscount || 0)) + deliveryCharge

              return (
                <article
                  key={order.orderId ?? `${order.createdAt}-${index}`}
                  className="checkout-panel rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 pb-4">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Order ID</p>
                      <h2 className="mt-1 text-lg font-bold text-green-800">
                        {order.orderId || 'Demo order'}
                      </h2>
                      <div className="mt-2">
                        <OrderStatusBadge order={order} />
                      </div>
                    </div>
                    <p className="text-sm text-slate-600">{order.createdAt}</p>
                  </div>

                  <div className="space-y-3 py-4">
                    {order.items.map((item, itemIndex) => (
                      <div
                        key={item.id ?? `${item.name}-${itemIndex}`}
                        className="flex items-center gap-3 text-sm"
                      >
                        <ProductImage
                          src={item.image}
                          alt={item.name || 'Grocery product'}
                          className="h-12 w-12 shrink-0 rounded-lg object-cover"
                        />
                        <span className="min-w-0 flex-1 font-medium text-slate-800">
                          {item.name} × {item.quantity || 1}
                        </span>
                        <span className="shrink-0 font-semibold text-slate-900">
                          ৳{Number(item.price || 0) * Number(item.quantity || 1)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2 border-t border-slate-200 pt-4">
                    {order.customer && (
                      <div className="mb-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
                        <p className="font-semibold text-slate-900">
                          Delivery to: {order.customer.name}
                        </p>
                        <p>
                          {[
                            order.customer.upazila,
                            order.customer.locality,
                            order.customer.area,
                            order.customer.district,
                          ].filter(Boolean).join(', ')}
                        </p>
                        <p>{order.customer.address}</p>
                        {order.customer.instructions && (
                          <p className="mt-1">
                            Instructions: {order.customer.instructions}
                          </p>
                        )}
                      </div>
                    )}
                    <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-900">
                      Delivery status: {getOrderStatus(order)}
                    </p>
                    <p className="text-sm text-slate-700">
                      Delivery area:{' '}
                      <span className="font-semibold text-slate-900">
                        {[order.customer?.upazila, order.customer?.district]
                          .filter(Boolean)
                          .join(', ') || 'Not specified'}
                      </span>
                      {' · '}Estimated Delivery: {order.estimatedDelivery || '2–3 Hours'}
                      {' · '}Order Time: {order.orderTime || '7:00 AM – 9:00 PM'}
                    </p>
                    <p className="text-sm text-slate-700">
                      Payment:{' '}
                      <span className="font-semibold text-slate-900">
                        {order.payment === 'cod'
                          ? 'Cash on Delivery'
                          : `${order.wallet || 'Wallet'} Demo`}
                      </span>
                    </p>
                    <div className="flex justify-between text-sm text-slate-700">
                      <span>{discountTotal > 0 ? 'Items subtotal' : 'Subtotal'}</span>
                      <span>৳{subtotal + discountTotal}</span>
                    </div>
                    {discountTotal > 0 && (
                      <>
                        <div className="flex justify-between text-sm font-semibold text-green-800">
                          <span>Product discounts</span>
                          <span>−৳{discountTotal}</span>
                        </div>
                        <div className="flex justify-between text-sm text-slate-700">
                          <span>Subtotal after discounts</span>
                          <span>৳{subtotal}</span>
                        </div>
                      </>
                    )}
                    {order.couponDiscount > 0 && (
                      <div className="flex justify-between text-sm font-semibold text-green-800">
                        <span>Coupon ({order.couponCode})</span>
                        <span>−৳{order.couponDiscount}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm text-slate-700">
                      <span>Delivery Fee</span>
                      <span>৳{deliveryCharge}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-100 pt-2">
                      <p className="text-lg font-bold text-green-800">Total</p>
                      <p className="text-lg font-bold text-green-800">৳{total}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onTrack?.(order.orderId)}
                      className="mt-3 w-full rounded-xl border border-green-700 px-4 py-2.5 text-sm font-bold text-green-800 hover:bg-green-50 focus:outline-none focus:ring-4 focus:ring-green-100"
                    >
                      Track Order
                    </button>
                    <div className="mt-2 grid gap-2 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={() => onNeedHelp?.(order.orderId)}
                        className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-800 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-green-100"
                      >
                        Need Help?
                      </button>
                      <WhatsAppButton
                        orderId={order.orderId}
                        label="WhatsApp about order"
                        className="w-full px-3 py-2.5 text-sm"
                      />
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}