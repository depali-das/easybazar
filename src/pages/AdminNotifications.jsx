import { useMemo, useState } from 'react'
import { Bell, Megaphone, Pencil, Plus, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useCatalog } from '../context/CatalogContext.jsx'
import { useNotifications } from '../context/NotificationContext.jsx'
import NotificationItem from '../components/NotificationItem.jsx'
import { CONTACT_INFO } from '../config/contact.js'
import { formatNotificationDate } from '../utils/notificationStorage.js'

function formatDiscount(offer) {
  if (offer.discountType === 'percentage') return `${offer.discountValue}% off`
  return `৳${Number(offer.discountValue || 0).toLocaleString('en-BD')} off`
}

function getOfferStatus(offer) {
  const today = new Date().toLocaleDateString('en-CA')
  return offer.active !== false &&
    (!offer.startDate || today >= offer.startDate) &&
    (!offer.expiryDate || today <= offer.expiryDate)
}

function couponDescription(offer) {
  const eligibility = offer.targetMode === 'all'
    ? 'eligible grocery products'
    : offer.targetMode === 'categories'
      ? `eligible categories: ${(offer.eligibleCategories || []).join(', ')}`
      : 'selected eligible products'
  const minimum = Number(offer.minimumOrder) > 0
    ? ` Minimum order ৳${offer.minimumOrder}.`
    : ''
  const expiry = offer.expiryDate ? ` Valid through ${offer.expiryDate}.` : ''
  return `${formatDiscount(offer)} with code ${offer.code} on ${eligibility}.${minimum}${expiry}`
}

export default function AdminNotifications() {
  const navigate = useNavigate()
  const { offers } = useCatalog()
  const {
    notifications,
    error: notificationError,
    createNotification,
    updateNotification,
    deleteNotification,
  } = useNotifications()
  const [offerId, setOfferId] = useState('')
  const [offerTitle, setOfferTitle] = useState('')
  const [announcementTitle, setAnnouncementTitle] = useState('')
  const [announcementMessage, setAnnouncementMessage] = useState('')
  const [editing, setEditing] = useState(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const offerNotifications = useMemo(
    () => notifications.filter((notification) => notification.type === 'offer'),
    [notifications],
  )
  const generalNotifications = useMemo(
    () => notifications.filter((notification) => notification.category === 'general-announcement'),
    [notifications],
  )

  function createOfferNotice(event) {
    event.preventDefault()
    const offer = offers.find((item) => String(item.id) === offerId)
    if (!offer) {
      setError('Choose an existing offer or coupon.')
      return
    }

    const isActive = getOfferStatus(offer)
    const title = offerTitle.trim() || `Offer available: ${offer.code}`
    const notification = createNotification({
      type: 'offer',
      category: 'offers-discounts',
      title,
      message: couponDescription(offer),
      offerId: String(offer.id),
      discountInfo: formatDiscount(offer),
      startDate: offer.startDate || '',
      endDate: offer.expiryDate || '',
      active: isActive,
      link: '/offers',
      source: 'admin',
      dedupeKey: `admin-offer:${offer.id}`,
    })
    if (!notification) {
      setError('Notification was not created. Check notification preferences or browser storage.')
      return
    }
    setOfferId('')
    setOfferTitle('')
    setError('')
    setMessage(isActive
      ? 'Offer notification added to this browser’s notification list.'
      : 'This existing offer is inactive or outside its dates; the notification is marked expired.')
  }

  function sendAnnouncement(event) {
    event.preventDefault()
    if (!announcementTitle.trim() || !announcementMessage.trim()) {
      setError('Enter both an announcement title and message.')
      return
    }
    const notification = createNotification({
      type: 'general',
      category: 'general-announcement',
      title: announcementTitle.trim(),
      message: announcementMessage.trim(),
      link: '/notifications',
    })
    if (!notification) {
      setError('Announcement was not added. Check notification preferences or browser storage.')
      return
    }
    setAnnouncementTitle('')
    setAnnouncementMessage('')
    setError('')
    setMessage('Announcement added to this browser’s notification list.')
  }

  function saveEdit(event) {
    event.preventDefault()
    if (!editing.title.trim() || !editing.message.trim()) {
      setError('Title and message are required.')
      return
    }
    updateNotification(editing.id, {
      title: editing.title.trim(),
      message: editing.message.trim(),
    })
    setEditing(null)
    setError('')
    setMessage('Notification updated.')
  }

  function openNotification(notification) {
    if (notification.link) navigate(notification.link)
  }

  function removeNotification(notification) {
    deleteNotification(notification.id)
    setMessage('Notification deleted from this browser.')
  }

  const availableOffers = offers.filter((offer) => offer.code)

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-bold uppercase tracking-wide text-green-800">Frontend demo</p>
        <h1 className="mt-1 text-2xl font-extrabold text-slate-900">Notification Management</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">These actions manage only this browser’s customer notification list. They do not send messages to other devices.</p>
      </header>

      {notificationError && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{notificationError}</p>}
      {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      {message && <p role="status" className="rounded-xl bg-green-50 p-3 text-sm text-green-900">{message}</p>}

      <form onSubmit={createOfferNotice} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="flex items-center gap-2 font-bold text-slate-900"><Plus size={19} className="text-green-800" /> Create Offer Notification</h2>
        <p className="mt-1 text-sm text-slate-600">Select an existing catalog offer. Discount amount and dates are taken from its saved data.</p>
        {availableOffers.length ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="text-sm font-semibold text-slate-800">Existing offer / coupon
              <select value={offerId} onChange={(event) => setOfferId(event.target.value)} required className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5">
                <option value="">Choose an existing offer</option>
                {availableOffers.map((offer) => <option key={offer.id} value={offer.id}>{offer.code} · {formatDiscount(offer)} · {getOfferStatus(offer) ? 'Active' : 'Expired'}</option>)}
              </select>
            </label>
            <label className="text-sm font-semibold text-slate-800">Notification title (optional)
              <input value={offerTitle} onChange={(event) => setOfferTitle(event.target.value)} placeholder="Defaults to offer code" className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5" />
            </label>
          </div>
        ) : <p className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">No existing offer/coupon is available to announce.</p>}
        <button type="submit" disabled={!availableOffers.length} className="mt-4 rounded-xl bg-green-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-green-800 disabled:opacity-50">Add Offer Notification</button>
      </form>

      <form onSubmit={sendAnnouncement} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="flex items-center gap-2 font-bold text-slate-900"><Megaphone size={19} className="text-green-800" /> Send General Announcement</h2>
        <div className="mt-4 grid gap-3">
          <label className="text-sm font-semibold text-slate-800">Title<input value={announcementTitle} onChange={(event) => setAnnouncementTitle(event.target.value)} required className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5" /></label>
          <label className="text-sm font-semibold text-slate-800">Message<textarea value={announcementMessage} onChange={(event) => setAnnouncementMessage(event.target.value)} required rows={3} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5" /></label>
        </div>
        <p className="mt-3 text-xs text-slate-500">Free-delivery offers are already displayed from the store policy: ৳{CONTACT_INFO.freeDeliveryMinimum}+ eligible subtotal.</p>
        <button type="submit" className="mt-3 rounded-xl bg-green-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-green-800">Add Announcement</button>
      </form>

      {editing && (
        <form onSubmit={saveEdit} className="rounded-2xl border border-green-200 bg-green-50 p-5">
          <h2 className="font-bold text-slate-900">Edit offer notification</h2>
          <label className="mt-3 block text-sm font-semibold">Title<input value={editing.title} onChange={(event) => setEditing({ ...editing, title: event.target.value })} className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5" /></label>
          <label className="mt-3 block text-sm font-semibold">Message<textarea value={editing.message} onChange={(event) => setEditing({ ...editing, message: event.target.value })} rows={3} className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5" /></label>
          <div className="mt-3 flex gap-2"><button type="submit" className="rounded-lg bg-green-700 px-4 py-2 text-sm font-bold text-white">Save</button><button type="button" onClick={() => setEditing(null)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold">Cancel</button></div>
        </form>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 font-bold text-slate-900"><Bell size={19} className="text-green-800" /> Offer Notification History ({offerNotifications.length})</h2>
        {offerNotifications.length ? <div className="space-y-3">{offerNotifications.map((notification) => (
          <div key={notification.id} className="space-y-2">
            <p className="text-xs text-slate-500">Created {formatNotificationDate(notification.createdAt)}</p>
            <NotificationItem notification={notification} onOpen={openNotification} onMarkRead={() => {}} onDelete={() => removeNotification(notification)} />
            <button type="button" onClick={() => { setEditing({ id: notification.id, title: notification.title, message: notification.message }); setError(''); setMessage('') }} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-green-800 hover:bg-green-50"><Pencil size={14} /> Edit notification</button>
          </div>
        ))}</div> : <p className="text-sm text-slate-600">No offer notifications have been created.</p>}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 font-bold text-slate-900">General Announcement History ({generalNotifications.length})</h2>
        {generalNotifications.length ? <div className="space-y-3">{generalNotifications.map((notification) => (
          <article key={notification.id} className="rounded-xl border border-slate-200 p-4">
            <div className="flex items-start justify-between gap-3">
              <div><h3 className="font-bold text-slate-900">{notification.title}</h3><p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{notification.message}</p><time className="mt-2 block text-xs text-slate-500">{formatNotificationDate(notification.createdAt)}</time></div>
              <button type="button" onClick={() => removeNotification(notification)} aria-label={`Delete ${notification.title} announcement`} className="rounded-lg p-2 text-red-700 hover:bg-red-50"><Trash2 size={17} /></button>
            </div>
          </article>
        ))}</div> : <p className="text-sm text-slate-600">No announcements have been created.</p>}
      </section>
    </div>
  )
}
