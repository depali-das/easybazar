import { CONTACT_INFO } from '../config/contact.js'

export const DELIVERY_FEE = CONTACT_INFO.deliveryCharge

export function calculateSubtotal(items) {
  return items.reduce(
    (sum, item) =>
      sum + Number(item.price || 0) * Number(item.quantity || 1),
    0,
  )
}

export function calculateDiscountTotal(items) {
  return items.reduce((sum, item) => {
    const originalPrice = Number(item.originalPrice || item.price || 0)
    const price = Number(item.price || 0)
    const quantity = Number(item.quantity || 1)

    return sum + Math.max(0, originalPrice - price) * quantity
  }, 0)
}

export function calculateOrderTotals(subtotal) {
  const deliveryCharge = subtotal >= CONTACT_INFO.freeDeliveryMinimum
    ? 0
    : DELIVERY_FEE
  return {
    subtotal,
    deliveryCharge,
    total: subtotal + deliveryCharge,
  }
}
