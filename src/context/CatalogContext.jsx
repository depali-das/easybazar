import { createContext, useContext, useEffect, useState } from 'react'
import { DEMO_COUPONS } from '../data/coupons.js'
import { normalizeCoupon } from '../utils/couponUtils.js'

const PRODUCTS_KEY = 'easybazar-products'
const CATEGORIES_KEY = 'easybazar-categories'
const STOCK_HISTORY_KEY = 'easybazar-stock-history'
const OFFERS_KEY = 'easybazar-offers'
const COUPONS_INITIALIZED_KEY = 'easybazar-coupons-initialized'
const SETTINGS_KEY = 'easybazar-store-settings'
const CatalogContext = createContext(null)

const defaultStoreSettings = {
  storeName: 'EasyBazar',
  logo: '/images/easybazar-logo-mark.png',
  contact: '',
  address: 'Rajshahi, Bangladesh',
  currency: 'BDT (৳)',
  deliveryFee: 60,
  estimatedDelivery: '2–3 Hours',
  operatingHours: '7:00 AM – 9:00 PM',
  payments: ['Cash on Delivery', 'bKash', 'Nagad'],
}

function readStorage(key, fallback, isValid) {
  try {
    const saved = localStorage.getItem(key)
    if (!saved) return fallback
    const parsed = JSON.parse(saved)
    return isValid(parsed) ? parsed : fallback
  } catch (error) {
    console.error(`Unable to load ${key}:`, error)
    return fallback
  }
}

function persist(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error(`Unable to save ${key}:`, error)
    throw new Error('The change could not be saved in this browser.')
  }
}

function normalizeCategory(category) {
  if (typeof category === 'string') {
    return { name: category, emoji: '🛒', image: '/images/fallback.jpg', active: true }
  }
  return {
    ...category,
    image: category.image || '/images/fallback.jpg',
    active: category.active !== false,
  }
}

function loadInitialOffers() {
  try {
    const stored = localStorage.getItem(OFFERS_KEY)
    const initialized = localStorage.getItem(COUPONS_INITIALIZED_KEY) === 'true'
    const parsed = stored ? JSON.parse(stored) : []
    if (!Array.isArray(parsed)) throw new Error('Saved coupon data has an invalid format.')
    if (!initialized) {
      const offers = parsed.length ? parsed.map(normalizeCoupon) : DEMO_COUPONS
      localStorage.setItem(COUPONS_INITIALIZED_KEY, 'true')
      localStorage.setItem(OFFERS_KEY, JSON.stringify(offers))
      return offers
    }
    return parsed.map(normalizeCoupon)
  } catch (error) {
    console.error('Unable to load saved coupons:', error)
    return DEMO_COUPONS
  }
}

export function CatalogProvider({
  children,
  initialProducts = [],
  initialCategories = [],
}) {
  const [products, setProducts] = useState(() =>
    readStorage(
      PRODUCTS_KEY,
      initialProducts.map((product) => ({ ...product, active: true })),
      (value) => Array.isArray(value),
    ),
  )
  const [categories, setCategories] = useState(() =>
    readStorage(
      CATEGORIES_KEY,
      initialCategories.map(normalizeCategory),
      (value) => Array.isArray(value),
    ),
  )
  const [stockHistory, setStockHistory] = useState(() =>
    readStorage(STOCK_HISTORY_KEY, [], Array.isArray),
  )
  const [offers, setOffers] = useState(loadInitialOffers)
  const [settings, setSettings] = useState(() =>
    readStorage(SETTINGS_KEY, defaultStoreSettings, (value) => (
      Boolean(value) && typeof value === 'object' && !Array.isArray(value)
    )),
  )

  useEffect(() => persist(PRODUCTS_KEY, products), [products])
  useEffect(() => persist(CATEGORIES_KEY, categories), [categories])
  useEffect(() => persist(STOCK_HISTORY_KEY, stockHistory), [stockHistory])
  useEffect(() => persist(OFFERS_KEY, offers), [offers])
  useEffect(() => persist(SETTINGS_KEY, settings), [settings])

  function addProduct(product) {
    const usedIds = new Set(products.map((item) => item.id))
    let id = Date.now()
    while (usedIds.has(id)) id += 1
    setProducts((current) => [...current, {
      ...product,
      id,
      active: true,
      createdAtISO: new Date().toISOString(),
    }])
    return id
  }

  function updateProduct(productId, updates) {
    setProducts((current) =>
      current.map((product) =>
        product.id === productId ? { ...product, ...updates } : product,
      ),
    )
  }

  function deleteProduct(productId) {
    setProducts((current) => current.filter((product) => product.id !== productId))
  }

  function updateStock(productId, nextStock, reason = 'Admin adjustment') {
    if (!Number.isInteger(nextStock) || nextStock < 0) {
      throw new Error('Stock must be a whole number greater than or equal to zero.')
    }

    const product = products.find((item) => item.id === productId)
    if (!product) throw new Error('The product could not be found.')
    const previousStock = Number.isFinite(product.stock) ? product.stock : null
    setProducts((current) =>
      current.map((item) =>
        item.id === productId ? { ...item, stock: nextStock } : item,
      ),
    )
    setStockHistory((current) => [
      {
        id: `${Date.now()}-${productId}`,
        productId,
        productName: product.name,
        previousStock,
        nextStock,
        change: previousStock === null ? null : nextStock - previousStock,
        reason,
        timestamp: new Date().toISOString(),
      },
      ...current,
    ])
  }

  function addCategory(category) {
    if (categories.some((item) => item.name.toLowerCase() === category.name.toLowerCase())) {
      throw new Error('A category with this name already exists.')
    }
    setCategories((current) => [...current, normalizeCategory(category)])
  }

  function updateCategory(originalName, updates) {
    const nextName = updates.name?.trim()
    if (
      nextName &&
      categories.some(
        (category) =>
          category.name.toLowerCase() === nextName.toLowerCase() &&
          category.name !== originalName,
      )
    ) {
      throw new Error('A category with this name already exists.')
    }

    setCategories((current) =>
      current.map((category) =>
        category.name === originalName
          ? { ...category, ...updates }
          : category,
      ),
    )
    if (nextName && nextName !== originalName) {
      setProducts((current) =>
        current.map((product) =>
          product.category === originalName
            ? { ...product, category: nextName }
            : product,
        ),
      )
    }
  }

  function deleteCategory(categoryName) {
    if (products.some((product) => product.category === categoryName)) {
      throw new Error('Move or remove products in this category before deleting it.')
    }
    setCategories((current) =>
      current.filter((category) => category.name !== categoryName),
    )
  }

  function addOffer(offer) {
    const normalizedOffer = normalizeCoupon(offer)
    if (offers.some((item) => item.code.toLowerCase() === normalizedOffer.code.toLowerCase())) {
      throw new Error('A coupon with this code already exists.')
    }
    setOffers((current) => [
      { ...normalizedOffer, id: `${Date.now()}`, usageCount: 0, usedBy: [] },
      ...current,
    ])
  }

  function updateOffer(offerId, updates) {
    const nextCode = updates.code?.trim().toUpperCase()
    if (nextCode && offers.some((offer) => offer.id !== offerId && offer.code.toUpperCase() === nextCode)) {
      throw new Error('A coupon with this code already exists.')
    }
    setOffers((current) => current.map((offer) =>
      offer.id === offerId ? normalizeCoupon({ ...offer, ...updates }) : offer,
    ))
  }

  function deleteOffer(offerId) {
    setOffers((current) => current.filter((offer) => offer.id !== offerId))
  }

  function recordOfferUsage(offerId, customerToken) {
    const offer = offers.find((item) => item.id === offerId)
    if (!offer) throw new Error('The applied coupon could not be found.')
    if (offer.usageLimit > 0 && offer.usageCount >= offer.usageLimit) {
      throw new Error('This coupon is no longer available.')
    }
    if (offer.singleUse && customerToken && offer.usedBy.includes(customerToken)) {
      throw new Error('This single-use coupon has already been used.')
    }
    setOffers((current) => current.map((item) => item.id === offerId
      ? {
          ...item,
          usageCount: (Number(item.usageCount) || 0) + 1,
          usedBy: customerToken ? [...new Set([...(item.usedBy || []), customerToken])] : item.usedBy || [],
        }
      : item,
    ))
  }

  const value = {
    products,
    categories,
    stockHistory,
    offers,
    settings,
    setSettings,
    addProduct,
    updateProduct,
    deleteProduct,
    updateStock,
    addCategory,
    updateCategory,
    deleteCategory,
    addOffer,
    updateOffer,
    deleteOffer,
    recordOfferUsage,
  }

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
}

export function useCatalog() {
  const context = useContext(CatalogContext)
  if (!context) throw new Error('useCatalog must be used inside CatalogProvider')
  return context
}
