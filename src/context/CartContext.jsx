
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { calculateOrderTotals, calculateSubtotal } from "../utils/pricing.js";
import {
  calculateCouponDiscount,
  findCoupon,
  getCouponValidation,
} from "../utils/couponUtils.js";
import { useCatalog } from "./CatalogContext.jsx";

const CartContext = createContext();

export function CartProvider({ children }) {
  const { products, offers } = useCatalog()
  const productById = useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [products],
  )
  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCart = localStorage.getItem("easybazar-cart");
      const parsedCart = savedCart ? JSON.parse(savedCart) : [];
      return Array.isArray(parsedCart)
        ? parsedCart.map((item) => ({
            ...item,
            ...productById.get(item.id),
          }))
        : [];
    } catch {
      return [];
    }
  });
  const [appliedCouponCode, setAppliedCouponCode] = useState(() => {
    try {
      return localStorage.getItem('easybazar-cart-coupon') || ''
    } catch (error) {
      console.error('Unable to load applied coupon:', error)
      return ''
    }
  })
  const [couponMessage, setCouponMessage] = useState('')

  useEffect(() => {
    try {
      if (appliedCouponCode) localStorage.setItem('easybazar-cart-coupon', appliedCouponCode)
      else localStorage.removeItem('easybazar-cart-coupon')
    } catch (error) {
      console.error('Unable to save applied coupon:', error)
    }
  }, [appliedCouponCode])

  useEffect(() => {
    localStorage.setItem("easybazar-cart", JSON.stringify(cartItems));
  }, [cartItems]);

  const currentCartItems = cartItems
    .filter((item) => productById.has(item.id))
    .map((item) => ({
      ...item,
      ...productById.get(item.id),
    }))

  function addToCart(product, quantity = 1) {
    const requestedQuantity = Number.isFinite(quantity)
      ? Math.max(1, Math.floor(quantity))
      : 1;
    const stockLimit = Number.isFinite(product.stock)
      ? Math.max(0, Math.floor(product.stock))
      : 99;

    if (stockLimit <= 0 || product.active === false) return;

    setCartItems((currentItems) => {
      const existingItem = currentItems.find(
        (item) => item.id === product.id
      );

      if (existingItem) {
        return currentItems.map((item) =>
          item.id === product.id
            ? {
                ...item,
                ...product,
                quantity: Math.min(
                  item.quantity + requestedQuantity,
                  stockLimit
                ),
              }
            : item
        );
      }

      return [
        ...currentItems,
        {
          ...product,
          quantity: Math.min(requestedQuantity, stockLimit),
        },
      ];
    });
  }

  function increaseQuantity(productId) {
    setCartItems((items) =>
      items.map((item) => {
        if (item.id !== productId) return item
        const product = productById.get(item.id) || item
        const stockLimit = Number.isFinite(product.stock)
          ? Math.max(0, Math.floor(product.stock))
          : 99
        return {
          ...item,
          ...product,
          quantity: Math.min(item.quantity + 1, stockLimit),
        }
      }),
    )
  }

  function decreaseQuantity(productId) {
    setCartItems((items) =>
      items
        .map((item) =>
          item.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  function removeFromCart(productId) {
    setCartItems((items) =>
      items.filter((item) => item.id !== productId)
    );
  }

  function clearCart() {
    setCartItems([]);
    setAppliedCouponCode('')
    setCouponMessage('')
  }

  const cartCount = currentCartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const subtotal = calculateSubtotal(currentCartItems)
  const { deliveryCharge } = calculateOrderTotals(subtotal)
  const appliedCoupon = findCoupon(offers, appliedCouponCode)
  const couponValidation = appliedCouponCode
    ? getCouponValidation(offers, appliedCouponCode, currentCartItems)
    : null
  const couponDiscount = couponValidation?.valid
    ? calculateCouponDiscount(appliedCoupon, currentCartItems)
    : 0
  const couponError = couponValidation && !couponValidation.valid
    ? couponValidation.reason
    : ''
  const total = Math.max(0, subtotal - couponDiscount) + deliveryCharge

  function applyCoupon(code, options = {}) {
    const result = getCouponValidation(offers, code, currentCartItems, options)
    if (!result.valid) {
      setCouponMessage('')
      return { ok: false, error: result.reason }
    }
    if (appliedCouponCode && appliedCouponCode.toUpperCase() === result.coupon.code.toUpperCase()) {
      return { ok: false, error: 'This coupon is already applied.' }
    }
    setAppliedCouponCode(result.coupon.code)
    setCouponMessage('Congratulations! Coupon applied successfully.')
    return { ok: true, message: 'Congratulations! Coupon applied successfully.' }
  }

  function removeCoupon() {
    setAppliedCouponCode('')
    setCouponMessage('')
  }

  function validateAppliedCoupon(options = {}) {
    if (!appliedCouponCode) return { valid: true, coupon: null, reason: '' }
    return getCouponValidation(offers, appliedCouponCode, currentCartItems, options)
  }

  return (
    <CartContext.Provider
      value={{
        cartItems: currentCartItems,
        cartCount,
        subtotal,
        deliveryCharge,
        total,
        appliedCoupon,
        appliedCouponCode,
        couponDiscount,
        couponError,
        couponMessage,
        applyCoupon,
        removeCoupon,
        validateAppliedCoupon,
        addToCart,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}
