import { useMemo, useState } from 'react'
import { ArrowLeft, Search, ShieldAlert } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import OrderStatusBadge from '../components/OrderStatusBadge.jsx'
import { useOrders } from '../context/OrderContext.jsx'
import {
  CANCELLED_STATUS,
  canCancelOrder,
  getOrderStatus,
  ORDER_STATUSES,
} from '../utils/orderTracking.js'

export default function AdminOrders() {
  const { orders, loadError, updateOrderStatus } = useOrders()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [actionError, setActionError] = useState('')
  const [savingOrderId, setSavingOrderId] = useState('')
  const filteredOrders = useMemo(
    () =>
      orders.filter((order) =>
        String(order.orderId || '').toLowerCase().includes(query.trim().toLowerCase()),
      ),
    [orders, query],
  )

  function changeStatus(orderId, status) {
    setActionError('')
    setSavingOrderId(orderId)
    try {
      updateOrderStatus(orderId, status)
    } catch (error) {
      setActionError(error.message)
    } finally {
      setSavingOrderId('')
    }
  }

  return (
    <main className="min-h-screen bg-[#f8faf7] px-4 py-8 pb-12 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-6xl">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="mb-6 inline-flex items-center gap-2 font-semibold text-slate-700 hover:text-green-700 focus:outline-none focus:ring-4 focus:ring-green-100"
        >
          <ArrowLeft size={18} aria-hidden="true" /> Back to EasyBazar
        </button>

        <section className="rounded-3xl border border-amber-200 bg-amber-50 p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <ShieldAlert className="mt-0.5 shrink-0 text-amber-800" size={22} aria-hidden="true" />
            <div>
              <h1 className="text-2xl font-extrabold text-amber-950">Demo Admin · Order Management</h1>
              <p className="mt-1 text-sm leading-6 text-amber-900">
                Frontend demo only. This page is not protected by production admin authentication.
                Status edits are saved in this browser and appear on customer tracking.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3">
            <Search size={18} className="text-slate-500" aria-hidden="true" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by Order ID"
              aria-label="Search orders by Order ID"
              className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none"
            />
          </label>
        </section>

        {(loadError || actionError) && (
          <p role="alert" className="mt-4 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-800">
            {actionError || loadError}
          </p>
        )}

        {filteredOrders.length === 0 ? (
          <section className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <h2 className="font-bold text-slate-900">
              {orders.length ? 'No orders match your search' : 'No demo orders yet'}
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Orders placed through checkout will appear here.
            </p>
          </section>
        ) : (
          <div className="mt-5 space-y-4">
            {filteredOrders.map((order) => {
              const status = getOrderStatus(order)
              const disabled = savingOrderId === order.orderId

              return (
                <article key={order.orderId} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Order ID</p>
                      <h2 className="mt-1 text-lg font-extrabold text-green-800">{order.orderId}</h2>
                      <p className="mt-1 text-sm text-slate-600">{order.customer?.name} · {order.customer?.phone}</p>
                    </div>
                    <OrderStatusBadge order={order} />
                  </div>

                  <div className="mt-4 grid gap-4 border-t border-slate-100 pt-4 sm:grid-cols-[1fr_auto] sm:items-end">
                    <label className="text-sm font-semibold text-slate-800">
                      Update order status
                      <select
                        value={status}
                        disabled={disabled}
                        onChange={(event) => changeStatus(order.orderId, event.target.value)}
                        className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100 disabled:opacity-60"
                      >
                        {ORDER_STATUSES.map((orderStatus) => (
                          <option key={orderStatus} value={orderStatus}>{orderStatus}</option>
                        ))}
                        {status === CANCELLED_STATUS && (
                          <option value={CANCELLED_STATUS}>{CANCELLED_STATUS}</option>
                        )}
                      </select>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {canCancelOrder(order) && (
                        <button
                          type="button"
                          disabled={disabled}
                          onClick={() => changeStatus(order.orderId, CANCELLED_STATUS)}
                          className="rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                        >
                          Cancel eligible order
                        </button>
                      )}
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
