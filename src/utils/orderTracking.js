export const ORDER_STATUSES = [
  'Order Placed',
  'Order Confirmed',
  'Processing',
  'Packed',
  'Out for Delivery',
  'Delivered',
]

export const CANCELLED_STATUS = 'Cancelled'

const ORDER_ID_PATTERN = /^EB[A-Z0-9-]{4,}$/i
const BANGLADESH_PHONE_PATTERN = /^01[3-9]\d{8}$/

export function createOrderId(existingIds = []) {
  const existing = new Set(existingIds.map((id) => String(id).toUpperCase()))
  let orderId

  do {
    const timePart = Date.now().toString(36).toUpperCase()
    const randomPart = Math.random().toString(36).slice(2, 6).toUpperCase()
    orderId = `EB${timePart}${randomPart}`
  } while (existing.has(orderId))

  return orderId
}

export function isValidOrderId(orderId) {
  return ORDER_ID_PATTERN.test(String(orderId || '').trim())
}

export function normalizePhoneNumber(phone) {
  const digits = String(phone || '').replace(/\D/g, '')
  return digits.startsWith('880') ? `0${digits.slice(3)}` : digits
}

export function isValidBangladeshPhone(phone) {
  return BANGLADESH_PHONE_PATTERN.test(normalizePhoneNumber(phone))
}

export function maskPhoneNumber(phone) {
  const normalizedPhone = normalizePhoneNumber(phone)
  if (normalizedPhone.length < 6) return 'Not provided'

  return `${normalizedPhone.slice(0, 3)}${'*'.repeat(normalizedPhone.length - 5)}${normalizedPhone.slice(-2)}`
}

export function getOrderStatus(order) {
  if (order?.orderStatus === CANCELLED_STATUS) return CANCELLED_STATUS
  if (ORDER_STATUSES.includes(order?.orderStatus)) return order.orderStatus
  return ORDER_STATUSES[0]
}

export function getStatusHistory(order) {
  if (Array.isArray(order?.statusHistory) && order.statusHistory.length) {
    return order.statusHistory
  }

  const placedAt = order?.createdAtISO || null
  return [{ status: ORDER_STATUSES[0], timestamp: placedAt }]
}

export function createInitialStatusHistory(timestamp = new Date().toISOString()) {
  return [{ status: ORDER_STATUSES[0], timestamp }]
}

export function findOrderForTracking(orders, orderId, phone) {
  const normalizedOrderId = String(orderId || '').trim().toUpperCase()
  const normalizedPhone = normalizePhoneNumber(phone)

  return orders.find(
    (order) =>
      String(order.orderId || '').trim().toUpperCase() === normalizedOrderId &&
      normalizePhoneNumber(order.customer?.phone) === normalizedPhone,
  )
}

export function canCancelOrder(order) {
  return ![
    CANCELLED_STATUS,
    'Out for Delivery',
    'Delivered',
  ].includes(getOrderStatus(order))
}

export function getPaymentStatus(order) {
  if (order?.payment === 'cod') return 'Due on delivery (Cash on Delivery)'
  return order?.paymentStatus || 'Demo payment not processed'
}

export function getStatusTimestamp(order, status) {
  return getStatusHistory(order).find((entry) => entry.status === status)?.timestamp || null
}

export function formatStatusTimestamp(timestamp) {
  if (!timestamp) return ''

  const date = new Date(timestamp)
  if (Number.isNaN(date.getTime())) return ''

  return new Intl.DateTimeFormat('en-BD', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Dhaka',
  }).format(date)
}

export function getTimelineState(order, status) {
  const orderStatus = getOrderStatus(order)
  const currentIndex = ORDER_STATUSES.indexOf(orderStatus)
  const stepIndex = ORDER_STATUSES.indexOf(status)

  if (orderStatus === CANCELLED_STATUS) return 'pending'
  if (stepIndex < currentIndex) return 'completed'
  if (stepIndex === currentIndex) return 'current'
  return 'pending'
}
