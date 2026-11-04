import { useMemo, useState } from 'react'
import { ArrowLeft, Bell, CheckCheck, Settings2, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useNotifications } from '../context/NotificationContext.jsx'
import NotificationItem from '../components/NotificationItem.jsx'
import NotificationSettings from '../components/NotificationSettings.jsx'

const FILTERS = [
  { id: 'all', label: 'All Notifications' },
  { id: 'unread', label: 'Unread' },
  { id: 'orders', label: 'Orders' },
  { id: 'offers', label: 'Offers' },
  { id: 'general', label: 'General' },
]

export default function Notifications() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState('all')
  const [showSettings, setShowSettings] = useState(false)
  const {
    notifications,
    unreadCount,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearNotifications,
  } = useNotifications()

  const visibleNotifications = useMemo(() => notifications.filter((notification) => {
    if (filter === 'unread') return !notification.isRead
    if (filter === 'orders') return notification.type === 'order'
    if (filter === 'offers') return notification.type === 'offer'
    if (filter === 'general') return notification.category === 'general-announcement'
    return true
  }), [filter, notifications])

  function openNotification(notification) {
    if (!notification.isRead) markAsRead(notification.id)
    navigate(notification.link || '/notifications')
  }

  return (
    <main className="min-h-screen bg-[#f8faf7] px-4 py-8 pb-20 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-4xl">
        <button type="button" onClick={() => navigate('/')} className="mb-6 inline-flex items-center gap-2 rounded-lg font-semibold text-slate-700 hover:text-green-800 focus:outline-none focus:ring-4 focus:ring-green-100">
          <ArrowLeft size={18} aria-hidden="true" /> Back to EasyBazar
        </button>
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-linear-to-br from-green-900 to-green-700 p-6 text-white shadow-lg sm:p-8">
          <div className="flex items-center gap-3">
            <span className="rounded-2xl bg-white/15 p-3"><Bell size={27} aria-hidden="true" /></span>
            <div>
              <p className="text-sm font-semibold text-green-100">EasyBazar</p>
              <h1 className="text-2xl font-extrabold sm:text-3xl">All Notifications</h1>
              <p className="mt-1 text-sm text-green-100">{unreadCount} unread</p>
            </div>
          </div>
          <button type="button" onClick={() => setShowSettings((show) => !show)} aria-expanded={showSettings} className="inline-flex items-center gap-2 rounded-xl border border-white/40 px-4 py-2.5 text-sm font-bold text-white hover:bg-white/10">
            <Settings2 size={17} aria-hidden="true" /> Notification Settings
          </button>
        </header>

        {showSettings && <div className="mt-5"><NotificationSettings /></div>}
        {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-800">{error}</p>}

        <section aria-label="Notification list" className="mt-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex max-w-full gap-2 overflow-x-auto pb-1">
              {FILTERS.map((item) => (
                <button key={item.id} type="button" onClick={() => setFilter(item.id)} aria-pressed={filter === item.id} className={`shrink-0 rounded-full px-3 py-2 text-sm font-semibold ${filter === item.id ? 'bg-green-800 text-white' : 'bg-white text-slate-700 hover:bg-green-50'}`}>
                  {item.label}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={markAllAsRead} disabled={!unreadCount} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-white disabled:opacity-50">
                <CheckCheck size={15} aria-hidden="true" /> Mark All as Read
              </button>
              <button type="button" onClick={clearNotifications} disabled={!notifications.length} className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50">
                <Trash2 size={15} aria-hidden="true" /> Clear All
              </button>
            </div>
          </div>

          {visibleNotifications.length ? (
            <div className="space-y-3">
              {visibleNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onOpen={openNotification}
                  onMarkRead={markAsRead}
                  onDelete={deleteNotification}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <Bell size={36} className="mx-auto text-slate-400" aria-hidden="true" />
              <h2 className="mt-3 text-lg font-bold text-slate-900">No notifications here</h2>
              <p className="mt-1 text-sm text-slate-600">{notifications.length ? 'Try another filter.' : 'Order updates and existing offer notices will appear here.'}</p>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
