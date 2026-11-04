export const NOTIFICATIONS_KEY = 'easybazar_notifications'
export const NOTIFICATION_PREFERENCES_KEY = 'easybazar_notification_preferences'
export const NOTIFICATION_SETTINGS_KEY = 'easybazar_notification_settings'
export const MAX_NOTIFICATIONS = 100

export const DEFAULT_NOTIFICATION_PREFERENCES = {
  orderUpdates: true,
  deliveryUpdates: true,
  offersDiscounts: true,
  generalAnnouncements: true,
}

export const DEFAULT_NOTIFICATION_SETTINGS = {
  browserNotificationsEnabled: false,
}

function readJson(key, fallback, isValid) {
  try {
    const saved = localStorage.getItem(key)
    if (!saved) return fallback
    const parsed = JSON.parse(saved)
    if (!isValid(parsed)) throw new Error('Saved notification data has an invalid format.')
    return parsed
  } catch (error) {
    console.error(`Unable to load ${key}:`, error)
    return fallback
  }
}

function writeJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error(`Unable to save ${key}:`, error)
    throw new Error('Notification data could not be saved in this browser.')
  }
}

export function loadNotifications() {
  return readJson(NOTIFICATIONS_KEY, [], Array.isArray).slice(0, MAX_NOTIFICATIONS)
}

export function loadNotificationPreferences() {
  const saved = readJson(
    NOTIFICATION_PREFERENCES_KEY,
    {},
    (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value),
  )
  return { ...DEFAULT_NOTIFICATION_PREFERENCES, ...saved }
}

export function loadNotificationSettings() {
  const saved = readJson(
    NOTIFICATION_SETTINGS_KEY,
    {},
    (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value),
  )
  return { ...DEFAULT_NOTIFICATION_SETTINGS, ...saved }
}

export function persistNotifications(notifications) {
  writeJson(NOTIFICATIONS_KEY, notifications.slice(0, MAX_NOTIFICATIONS))
}

export function persistNotificationPreferences(preferences) {
  writeJson(NOTIFICATION_PREFERENCES_KEY, preferences)
}

export function persistNotificationSettings(settings) {
  writeJson(NOTIFICATION_SETTINGS_KEY, settings)
}

export function createNotificationId(existingIds = []) {
  const existing = new Set(existingIds)
  let id
  do {
    const unique = globalThis.crypto?.randomUUID
      ? globalThis.crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`
    id = `ebn-${unique}`
  } while (existing.has(id))
  return id
}

export function isNotificationEnabled(preferences, category) {
  if (category === 'order-update') return preferences.orderUpdates
  if (category === 'delivery-update') return preferences.deliveryUpdates
  if (category === 'offers-discounts') return preferences.offersDiscounts
  if (category === 'general-announcement') return preferences.generalAnnouncements
  return false
}

export function getUnreadNotificationCount(notifications) {
  return notifications.filter((notification) => !notification.isRead).length
}

export function formatNotificationDate(value) {
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? 'Date unavailable'
    : new Intl.DateTimeFormat('en-BD', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}
