import { useNavigate } from 'react-router-dom'
import { ArrowRight, Bell, CheckCheck } from 'lucide-react'
import { useNotifications } from '../context/NotificationContext.jsx'
import NotificationItem from './NotificationItem.jsx'

export default function NotificationDropdown({ onClose, mobilePosition }) {
  const navigate = useNavigate()
  const {
    notifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications()

  function openNotification(notification) {
    if (!notification.isRead) markAsRead(notification.id)
    onClose()
    navigate(notification.link || '/notifications')
  }

  return (
    <section role="dialog" aria-modal="false" aria-label="Notifications" style={mobilePosition ? { position: 'fixed', top: mobilePosition.top, left: 12, right: 12 } : undefined} className="notification-dropdown absolute right-0 top-full z-70 mt-2 w-[min(24rem,calc(100vw-1.5rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
      <header className="flex items-center justify-between gap-2 border-b border-slate-100 px-4 py-3">
        <div className="flex items-center gap-2">
          <Bell size={18} className="text-green-800" aria-hidden="true" />
          <h2 className="font-bold text-slate-900">Notifications</h2>
        </div>
        <button type="button" onClick={markAllAsRead} className="inline-flex items-center gap-1 text-xs font-semibold text-green-800 hover:underline">
          <CheckCheck size={15} aria-hidden="true" /> Mark all read
        </button>
      </header>
      <div className="max-h-[min(60vh,28rem)] space-y-2 overflow-y-auto p-3">
        {notifications.slice(0, 5).map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onOpen={openNotification}
            onMarkRead={markAsRead}
            onDelete={deleteNotification}
            compact
          />
        ))}
        {notifications.length === 0 && (
          <div className="px-3 py-8 text-center">
            <Bell size={28} className="mx-auto text-slate-400" aria-hidden="true" />
            <p className="mt-2 text-sm font-semibold text-slate-800">You’re all caught up</p>
            <p className="mt-1 text-xs text-slate-500">New order updates and offers will appear here.</p>
          </div>
        )}
      </div>
      <button type="button" onClick={() => { onClose(); navigate('/notifications') }} className="flex w-full items-center justify-center gap-2 border-t border-slate-100 px-4 py-3 text-sm font-bold text-green-800 hover:bg-green-50">
        View All Notifications <ArrowRight size={16} aria-hidden="true" />
      </button>
    </section>
  )
}
