import { getOrderStatus } from '../utils/orderTracking.js'

const STATUS_STYLES = {
  'Order Placed': 'bg-blue-50 text-blue-800 ring-blue-200',
  'Order Confirmed': 'bg-indigo-50 text-indigo-800 ring-indigo-200',
  Processing: 'bg-amber-50 text-amber-800 ring-amber-200',
  Packed: 'bg-purple-50 text-purple-800 ring-purple-200',
  'Out for Delivery': 'bg-orange-50 text-orange-800 ring-orange-200',
  Delivered: 'bg-green-50 text-green-800 ring-green-200',
  Cancelled: 'bg-red-50 text-red-800 ring-red-200',
}

export default function OrderStatusBadge({ order, status, className = '' }) {
  const label = status || getOrderStatus(order)

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ring-1 ring-inset ${STATUS_STYLES[label] || 'bg-slate-50 text-slate-700 ring-slate-200'} ${className}`}
    >
      {label}
    </span>
  )
}
