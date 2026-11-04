import { useState } from 'react'
import { BellRing, ShieldCheck } from 'lucide-react'
import { useNotifications } from '../context/NotificationContext.jsx'
import { getBrowserNotificationSupport, requestBrowserNotificationPermission } from '../utils/browserNotifications.js'

const PREFERENCE_ITEMS = [
  { key: 'orderUpdates', label: 'Order Updates', description: 'Order placed, confirmation, processing and cancellation.' },
  { key: 'deliveryUpdates', label: 'Delivery Updates', description: 'Ready for delivery, on the way and delivered.' },
  { key: 'offersDiscounts', label: 'Offers & Discounts', description: 'Notifications based only on existing offer data.' },
  { key: 'generalAnnouncements', label: 'General Announcements', description: 'Store announcements created in the demo admin.' },
]

export default function NotificationSettings() {
  const { preferences, settings, updatePreferences, updateSettings, error } = useNotifications()
  const [browserStatus, setBrowserStatus] = useState(getBrowserNotificationSupport)
  const [browserMessage, setBrowserMessage] = useState('')

  async function enableBrowserNotifications() {
    const permission = await requestBrowserNotificationPermission()
    setBrowserStatus(permission)
    if (permission === 'granted') {
      updateSettings({ browserNotificationsEnabled: true })
      setBrowserMessage('Browser notifications are enabled on this device.')
    } else if (permission === 'denied') {
      updateSettings({ browserNotificationsEnabled: false })
      setBrowserMessage('Permission was denied. Allow notifications in your browser’s site settings to enable them.')
    } else if (permission === 'unsupported') {
      setBrowserMessage('This browser does not support desktop notifications. In-app notifications still work.')
    } else if (permission === 'insecure') {
      setBrowserMessage('Browser notifications require HTTPS or localhost. In-app notifications still work.')
    } else {
      setBrowserMessage('Browser notification permission was not granted.')
    }
  }

  function disableBrowserNotifications() {
    updateSettings({ browserNotificationsEnabled: false })
    setBrowserMessage('Browser notifications are turned off. In-app notifications still work.')
  }

  return (
    <section aria-labelledby="notification-settings-title" className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-7">
      <div className="flex items-center gap-3">
        <span className="rounded-xl bg-green-50 p-2.5 text-green-800"><ShieldCheck size={22} aria-hidden="true" /></span>
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-green-800">Your preferences</p>
          <h2 id="notification-settings-title" className="text-xl font-extrabold text-slate-900">Notification Settings</h2>
        </div>
      </div>
      <div className="mt-5 divide-y divide-slate-100">
        {PREFERENCE_ITEMS.map((item) => (
          <label key={item.key} className="flex cursor-pointer items-start justify-between gap-4 py-4">
            <span>
              <span className="block font-semibold text-slate-900">{item.label}</span>
              <span className="mt-1 block text-sm text-slate-600">{item.description}</span>
            </span>
            <input
              type="checkbox"
              checked={Boolean(preferences[item.key])}
              onChange={(event) => updatePreferences({ [item.key]: event.target.checked })}
              className="mt-1 h-5 w-5 shrink-0 accent-green-700"
            />
          </label>
        ))}
      </div>
      <div className="mt-4 rounded-2xl bg-slate-50 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-semibold text-slate-900">
            <BellRing size={18} className="text-green-800" aria-hidden="true" /> Browser Notifications
          </div>
          {settings.browserNotificationsEnabled ? (
            <button type="button" onClick={disableBrowserNotifications} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-white">Disable</button>
          ) : (
            <button type="button" onClick={enableBrowserNotifications} className="rounded-lg bg-green-700 px-3 py-2 text-sm font-bold text-white hover:bg-green-800">Enable Browser Notifications</button>
          )}
        </div>
        <p className="mt-2 text-xs leading-5 text-slate-600">Permission is requested only after you click Enable. Browser alerts are best-effort while this site is open; real push delivery requires a server.</p>
        {browserMessage && <p role="status" className="mt-2 text-sm text-slate-700">{browserMessage}</p>}
        {browserStatus === 'unsupported' && <p className="mt-2 text-sm text-amber-800">This browser does not support browser notifications.</p>}
        {browserStatus === 'insecure' && <p className="mt-2 text-sm text-amber-800">Use HTTPS or localhost for browser notifications.</p>}
      </div>
      {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}
    </section>
  )
}
