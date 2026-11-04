function normalizeCode(code) {
  return String(code || '').trim().toUpperCase()
}

function getLocalDate(now = new Date()) {
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getCouponUsageCount(coupon) {
  return Number(coupon.usageCount) || coupon.usageRecords?.length || 0
}

export function getCouponCustomerToken(phone) {
  const digits = String(phone || '').replace(/\D/g, '')
  const normalized = digits.startsWith('880') ? `0${digits.slice(3)}` : digits
  if (!normalized) return ''

  let hash = 2166136261
  for (const character of normalized) {
    hash ^= character.charCodeAt(0)
    hash = Math.imul(hash, 16777619)
  }
  return (hash >>> 0).toString(36)
}

export function getEligibleCouponItems(coupon, items) {
  if (coupon.targetMode === 'categories') {
    const categories = new Set(coupon.eligibleCategories || [])
    return items.filter((item) => categories.has(item.category))
  }
  if (coupon.targetMode === 'products') {
    const productIds = new Set((coupon.eligibleProductIds || []).map(String))
    return items.filter((item) => productIds.has(String(item.id)))
  }
  return items
}

export function getEligibleSubtotal(coupon, items) {
  return getEligibleCouponItems(coupon, items).reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1),
    0,
  )
}

export function validateCoupon(coupon, items, { now = new Date(), phone = '' } = {}) {
  if (!coupon) return { valid: false, reason: 'Invalid coupon code.' }
  if (coupon.active === false) return { valid: false, reason: 'This coupon is no longer available.' }

  const today = getLocalDate(now)
  if (coupon.startDate && today < coupon.startDate) {
    return { valid: false, reason: 'This coupon is not active yet.' }
  }
  if (coupon.expiryDate && today > coupon.expiryDate) {
    return { valid: false, reason: 'Coupon has expired.' }
  }
  if (coupon.usageLimit > 0 && getCouponUsageCount(coupon) >= coupon.usageLimit) {
    return { valid: false, reason: 'This coupon is no longer available.' }
  }

  const eligibleSubtotal = getEligibleSubtotal(coupon, items)
  if (!eligibleSubtotal) {
    return { valid: false, reason: 'This coupon does not apply to the items in your cart.' }
  }
  const orderSubtotal = items.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1),
    0,
  )
  if (orderSubtotal < Number(coupon.minimumOrder || 0)) {
    return { valid: false, reason: 'Minimum order amount not reached.' }
  }

  const customerToken = getCouponCustomerToken(phone)
  if (
    coupon.singleUse &&
    customerToken &&
    (coupon.usedBy || []).includes(customerToken)
  ) {
    return { valid: false, reason: 'This single-use coupon has already been used.' }
  }

  return { valid: true, reason: '', eligibleSubtotal }
}

export function findCoupon(offers, code) {
  const normalizedCode = normalizeCode(code)
  return offers.find((coupon) => normalizeCode(coupon.code) === normalizedCode) || null
}

export function calculateCouponDiscount(coupon, items) {
  if (!coupon) return 0
  const eligibleSubtotal = getEligibleSubtotal(coupon, items)
  if (eligibleSubtotal <= 0) return 0

  const rawDiscount = coupon.discountType === 'percentage'
    ? eligibleSubtotal * Number(coupon.discountValue || 0) / 100
    : Number(coupon.discountValue || 0)
  const cappedDiscount = Number(coupon.maxDiscount) > 0
    ? Math.min(rawDiscount, Number(coupon.maxDiscount))
    : rawDiscount

  return Math.min(eligibleSubtotal, Math.max(0, Math.floor(cappedDiscount)))
}

export function formatCouponDiscount(coupon) {
  if (!coupon) return ''
  return coupon.discountType === 'percentage'
    ? `${coupon.discountValue}% off`
    : `৳${Number(coupon.discountValue).toLocaleString('en-BD')} off`
}

export function getActiveCoupons(offers, now = new Date()) {
  const today = getLocalDate(now)
  return offers.filter((coupon) =>
    coupon.active !== false &&
    (!coupon.startDate || today >= coupon.startDate) &&
    (!coupon.expiryDate || today <= coupon.expiryDate) &&
    !(coupon.usageLimit > 0 && getCouponUsageCount(coupon) >= coupon.usageLimit),
  )
}

export function getCouponValidation(offers, code, items, options) {
  const coupon = findCoupon(offers, code)
  return { coupon, ...validateCoupon(coupon, items, options) }
}

export function normalizeCoupon(coupon) {
  return {
    ...coupon,
    code: normalizeCode(coupon.code),
    discountType: coupon.discountType || 'percentage',
    discountValue: Number(coupon.discountValue ?? coupon.percentage ?? 0),
    minimumOrder: Number(coupon.minimumOrder ?? coupon.minimum ?? 0),
    maxDiscount: Number(coupon.maxDiscount || 0),
    usageLimit: Number(coupon.usageLimit || 0),
    usageCount: Number(coupon.usageCount || 0),
    targetMode: coupon.targetMode || 'all',
    eligibleCategories: coupon.eligibleCategories || [],
    eligibleProductIds: coupon.eligibleProductIds || [],
    singleUse: Boolean(coupon.singleUse),
    usedBy: coupon.usedBy || [],
    active: coupon.active !== false,
  }
}
