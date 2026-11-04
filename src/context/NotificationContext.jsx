import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCatalog } from './CatalogContext.jsx'
import {
  createNotificationId,
  DEFAULT_NOTIFICATION_PREFERENCES,
  getUnreadNotificationCount,
  isNotificationEnabled,
  loadNotificationPreferences,
  loadNotifications,
  loadNotificationSettings,
  MAX_NOTIFICATIONS,
  persistNotificationPreferences,
  persistNotifications,
  persistNotificationSettings,
} from '../utils/notificationStorage.js'
import { showBrowserNotification } from '../utils/browserNotifications.js'
import { CONTACT_INFO } from '../config/contact.js'

const NotificationContext = createContext(null)

const ORDER_NOTIFICATION_COPY = {
  'Order Placed': {
    title: 'Order Placed',
    message: 'Your order has been placed successfully!',
    category: 'order-update',
  },
  'Order Confirmed': {
    title: 'Order Confirmed',
    message: 'Your order has been confirmed.',
    category: 'order-update',
  },
  Processing: {
    title: 'Order Processing',
    message: 'Your groceries are being prepared.',
    category: 'order-update',
  },
  Packed: {
    title: 'Ready for Delivery',
    message: 'Your order is ready for delivery.',
    category: 'delivery-update',
  },
  'Out for Delivery': {
    title: 'Out for Delivery',
    message: 'Your order is on the way!',
    category: 'delivery-update',
  },
  Delivered: {
    title: 'Delivered',
    message: 'Your order has been delivered successfully.',
    category: 'delivery-update',
  },
  Cancelled: {
    title: 'Order Cancelled',
    message: 'Your order has been cancelled.',
    category: 'order-update',
  },
}

export function NotificationProvider({ children }) {
  const navigate = useNavigate()
  const { offers } = useCatalog()
  const [notifications, setNotifications] = useState(loadNotifications)
  const notificationsRef = useRef(notifications)
  const [preferences, setPreferences] = useState(loadNotificationPreferences)
  const [settings, setSettings] = useState(loadNotificationSettings)
  const [error, setError] = useState('')
  const unreadCount = useMemo(
    () => getUnreadNotificationCount(notifications),
    [notifications],
  )

  const updateNotifications = useCallback((nextNotifications) => {
    try {
      persistNotifications(nextNotifications)
      notificationsRef.current = nextNotifications.slice(0, MAX_NOTIFICATIONS)
      setNotifications(nextNotifications.slice(0, MAX_NOTIFICATIONS))
      setError('')
      return true
    } catch (saveError) {
      setError(saveError.message)
      return false
    }
  }, [])

  const createNotification = useCallback((input) => {
    if (!isNotificationEnabled(preferences, input.category)) return null

    const currentNotifications = notificationsRef.current
    if (input.dedupeKey) {
      const existing = currentNotifications.find(
        (notification) => notification.dedupeKey === input.dedupeKey,
      )
      if (existing) return existing
    }

    const notification = {
      id: createNotificationId(currentNotifications.map((item) => item.id)),
      type: input.type || 'general',
      category: input.category,
      title: input.title,
      message: input.message,
      orderId: input.orderId || '',
      link: input.link || '/',
      createdAt: input.createdAt || new Date().toISOString(),
      isRead: false,
      ...input,
    }
    if (!updateNotifications([notification, ...currentNotifications])) return null

    if (settings.browserNotificationsEnabled) {
      showBrowserNotification(notification, () => navigate(notification.link))
    }
    return notification
  }, [navigate, preferences, settings.browserNotificationsEnabled, updateNotifications])

  const createOrderNotification = useCallback((order, status) => {
    const copy = ORDER_NOTIFICATION_COPY[status]
    if (!copy || !order?.orderId) return null
    return createNotification({
      type: 'order',
      category: copy.category,
      title: copy.title,
      message: status === 'Order Placed'
        ? `${copy.message} Order ID: ${order.orderId}`
        : copy.message,
      orderId: order.orderId,
      link: `/orders`,
      dedupeKey: `order:${order.orderId}:${status}`,
      status,
    })
  }, [createNotification])

  useEffect(() => {
    const today = new Date().toLocaleDateString('en-CA')
    const existingFreeDelivery = notificationsRef.current.some(
      (notification) => notification.dedupeKey === `policy:free-delivery:${CONTACT_INFO.freeDeliveryMinimum}`,
    )
    if (!existingFreeDelivery) {
      createNotification({
        type: 'offer',
        category: 'offers-discounts',
        title: 'Free Delivery Offer',
        message: `Good News! Enjoy Free Delivery on orders of ৳${CONTACT_INFO.freeDeliveryMinimum} or more.`,
        startDate: '',
        endDate: '',
        active: true,
        link: '/notifications',
        dedupeKey: `policy:free-delivery:${CONTACT_INFO.freeDeliveryMinimum}`,
      })
    }

    offers.forEach((offer) => {
      if (!offer.code || offer.active === false) return
      if ((offer.startDate && today < offer.startDate) || (offer.expiryDate && today > offer.expiryDate)) return
      const dedupeKey = `catalog-offer:${offer.id}:${offer.startDate || ''}:${offer.expiryDate || ''}:${offer.discountType}:${offer.discountValue}`
      const discount = offer.discountType === 'percentage'
        ? `${offer.discountValue}%`
        : `৳${Number(offer.discountValue || 0).toLocaleString('en-BD')}`
      const minimum = Number(offer.minimumOrder) > 0 ? ` Minimum order ৳${offer.minimumOrder}.` : ''
      createNotification({
        type: 'offer',
        category: 'offers-discounts',
        title: `Offer available: ${offer.code}`,
        message: `Save ${discount} on eligible products with code ${offer.code}.${minimum}`,
        discountInfo: discount,
        offerId: String(offer.id),
        startDate: offer.startDate || '',
        endDate: offer.expiryDate || '',
        active: true,
        link: '/offers',
        dedupeKey,
      })
    })
  }, [createNotification, offers])

  const updatePreferences = useCallback((updates) => {
    const next = { ...preferences, ...updates }
    try {
      persistNotificationPreferences(next)
      setPreferences(next)
      setError('')
    } catch (saveError) {
      setError(saveError.message)
    }
  }, [preferences])

  const updateSettings = useCallback((updates) => {
    const next = { ...settings, ...updates }
    try {
      persistNotificationSettings(next)
      setSettings(next)
      setError('')
    } catch (saveError) {
      setError(saveError.message)
    }
  }, [settings])

  const markAsRead = useCallback((id) => {
    updateNotifications(notifications.map((item) =>
      item.id === id ? { ...item, isRead: true } : item,
    ))
  }, [notifications, updateNotifications])

  const markAllAsRead = useCallback(() => {
    updateNotifications(notifications.map((item) => ({ ...item, isRead: true })))
  }, [notifications, updateNotifications])

  const deleteNotification = useCallback((id) => {
    updateNotifications(notifications.filter((item) => item.id !== id))
  }, [notifications, updateNotifications])

  const clearNotifications = useCallback(() => {
    updateNotifications([])
  }, [updateNotifications])

  const updateNotification = useCallback((id, updates) => {
    updateNotifications(notifications.map((item) =>
      item.id === id ? { ...item, ...updates } : item,
    ))
  }, [notifications, updateNotifications])

  const value = {
    notifications,
    preferences,
    settings,
    unreadCount,
    error,
    createNotification,
    createOrderNotification,
    updatePreferences,
    updateSettings,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearNotifications,
    updateNotification,
    resetPreferences: () => updatePreferences(DEFAULT_NOTIFICATION_PREFERENCES),
  }

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) throw new Error('useNotifications must be used inside NotificationProvider')
  return context
}
