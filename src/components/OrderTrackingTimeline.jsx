import { Check, Circle, PackageCheck } from 'lucide-react'
import {
  CANCELLED_STATUS,
  formatStatusTimestamp,
  getOrderStatus,
  getStatusTimestamp,
  getTimelineState,
  ORDER_STATUSES,
} from '../utils/orderTracking.js'
import OrderStatusBadge from './OrderStatusBadge.jsx'

export default function OrderTrackingTimeline({ order }) {
  const orderStatus = getOrderStatus(order)

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Order status</h2>
          <p className="mt-1 text-sm text-slate-600">
            Status updates are provided by this demo order record.
          </p>
        </div>
        <OrderStatusBadge order={order} />
      </div>

      {orderStatus === CANCELLED_STATUS ? (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          This order was cancelled. No delivery tracking is active.
        </div>
      ) : (
        <ol className="mt-7 space-y-0 sm:grid sm:grid-cols-6 sm:gap-2">
          {ORDER_STATUSES.map((status, index) => {
            const state = getTimelineState(order, status)
            const timestamp = getStatusTimestamp(order, status)
            const isLast = index === ORDER_STATUSES.length - 1

            return (
              <li
                key={status}
                className="relative flex min-h-20 gap-3 sm:min-h-0 sm:flex-col sm:gap-3"
              >
                {!isLast && (
                  <span
                    aria-hidden="true"
                    className={`absolute left-3.25 top-7 h-[calc(100%-1rem)] w-0.5 sm:left-3.5 sm:top-4 sm:h-0.5 sm:w-[calc(100%+0.5rem)] ${
                      state === 'completed' ? 'bg-green-600' : 'bg-slate-200'
                    }`}
                  />
                )}
                <span
                  className={`relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 ${
                    state === 'completed'
                      ? 'border-green-600 bg-green-600 text-white'
                      : state === 'current'
                        ? 'border-green-700 bg-white text-green-700 ring-4 ring-green-100'
                        : 'border-slate-300 bg-white text-slate-400'
                  }`}
                  aria-label={state}
                >
                  {state === 'completed' ? (
                    <Check size={15} strokeWidth={3} aria-hidden="true" />
                  ) : state === 'current' ? (
                    <PackageCheck size={15} aria-hidden="true" />
                  ) : (
                    <Circle size={12} aria-hidden="true" />
                  )}
                </span>
                <div className="pb-5 sm:pb-0">
                  <p
                    className={`text-sm font-bold ${
                      state === 'pending' ? 'text-slate-500' : 'text-slate-900'
                    }`}
                  >
                    {status}
                  </p>
                  {state === 'completed' &&
                    (timestamp ? (
                      <time
                        dateTime={timestamp}
                        className="mt-1 block text-xs leading-5 text-slate-600"
                      >
                        {formatStatusTimestamp(timestamp)}
                      </time>
                    ) : (
                      <span className="mt-1 block text-xs leading-5 text-slate-500">
                        No separate status update recorded
                      </span>
                    ))}
                  {state === 'current' && (
                    <p className="mt-1 text-xs font-semibold text-green-800">
                      Current status
                    </p>
                  )}
                </div>
              </li>
            )
          })}
        </ol>
      )}

      <div className="mt-5 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-900">
        <p className="font-bold">Estimated delivery: {order.estimatedDelivery || '2–3 Hours'}</p>
        <p className="mt-1">No rider GPS tracking is available in this demo.</p>
      </div>
    </section>
  )
}
