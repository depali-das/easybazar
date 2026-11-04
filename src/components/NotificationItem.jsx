import { Bell, Gift, Megaphone, PackageCheck, Trash2 } from 'lucide-react'
import { formatNotificationDate } from '../utils/notificationStorage.js'

const ICONS = {
  offer: Gift,
  general: Megaphone,
  order: PackageCheck,
  default: Bell,
}

function getOfferStatus(notification) {
  if (notification.type !== 'offer') return ''
  const today = new Date().toLocaleDateString('en-CA')
  return notification.active === false ||
    (notification.startDate && today < notification.startDate) ||
    (notification.endDate && today > notification.endDate)
    ? 'Expired'
    : 'Active'
}

export default function NotificationItem({
  notification,
  onOpen,
  onMarkRead,
  onDelete,
  compact = false,
}) {
  const Icon = ICONS[notification.type] ||
    (notification.category === 'general-announcement' ? ICONS.general : ICONS.default)
  const offerStatus = getOfferStatus(notification)

  return (
    <article className={`relative rounded-2xl border p-4 transition ${notification.isRead ? 'border-slate-200 bg-white' : 'border-green-200 bg-green-50/70'}`}>
      {!notification.isRead && <span aria-label="Unread" className="absolute right-4 top-4 h-2.5 w-2.5 rounded-full bg-red-600" />}
      <div className="flex items-start gap-3 pr-4">
        <span className="shrink-0 rounded-xl bg-white p-2 text-green-800 shadow-sm">
          <Icon size={20} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-bold text-slate-900">{notification.title}</h2>
            {offerStatus && <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${offerStatus === 'Active' ? 'bg-green-100 text-green-900' : 'bg-slate-200 text-slate-700'}`}>{offerStatus}</span>}
          </div>
          <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-700">{notification.message}</p>
          {notification.orderId && <p className="mt-2 text-xs font-semibold text-slate-700">Order ID: {notification.orderId}</p>}
          {(notification.startDate || notification.endDate) && (
            <p className="mt-2 text-xs text-slate-600">Offer dates: {notification.startDate || '—'} to {notification.endDate || '—'}</p>
          )}
          <time className="mt-2 block text-xs text-slate-500" dateTime={notification.createdAt}>{formatNotificationDate(notification.createdAt)}</time>
        </div>
      </div>
      <div className={`mt-3 flex flex-wrap gap-2 ${compact ? 'pl-11' : ''}`}>
        <button type="button" onClick={() => onOpen(notification)} className="rounded-lg bg-green-700 px-3 py-2 text-xs font-bold text-white hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-300">
          {notification.orderId ? 'View Order' : notification.type === 'offer' ? 'View Offer' : 'View Details'}
        </button>
        {!notification.isRead && (
          <button type="button" onClick={() => onMarkRead(notification.id)} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-white focus:outline-none focus:ring-2 focus:ring-green-200">
            Mark as Read
          </button>
        )}
        <button type="button" onClick={() => onDelete(notification.id)} aria-label={`Delete ${notification.title} notification`} className="ml-auto rounded-lg p-2 text-slate-600 hover:bg-red-50 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-200">
          <Trash2 size={17} aria-hidden="true" />
        </button>
      </div>
    </article>
  )
}
