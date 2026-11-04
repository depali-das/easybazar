import { createContext, useContext, useState } from 'react'
import {
  CANCELLED_STATUS,
  getOrderStatus,
  ORDER_STATUSES,
} from '../utils/orderTracking.js'
import { useNotifications } from './NotificationContext.jsx'

const STORAGE_KEY = 'easybazar-orders'
const OrderContext = createContext(null)

function loadSavedOrders() {
  try {
    const savedOrders = localStorage.getItem(STORAGE_KEY)
    if (!savedOrders) return { orders: [], error: '' }

    const orders = JSON.parse(savedOrders)
    if (
      !Array.isArray(orders) ||
      orders.some((order) => !order || !Array.isArray(order.items))
    ) {
      throw new Error('Saved order data has an invalid format.')
    }

    return { orders, error: '' }
  } catch (error) {
    console.error('Unable to load saved orders:', error)
    return {
      orders: [],
      error: 'Saved orders could not be loaded from this browser.',
    }
  }
}

export function OrderProvider({ children }) {
  const [state, setState] = useState(loadSavedOrders)
  const { createOrderNotification } = useNotifications()

  function persistOrders(orders) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(orders))
    } catch (error) {
      console.error('Unable to save orders:', error)
      throw new Error('Order information could not be saved in this browser.')
    }

    setState({ orders, error: '' })
  }

  function addOrder(order) {
    const orders = [order, ...state.orders]

    persistOrders(orders)
    createOrderNotification(order, 'Order Placed')
  }

  function updateOrderStatus(orderId, status) {
    if (status !== CANCELLED_STATUS && !ORDER_STATUSES.includes(status)) {
      throw new Error('Choose a valid order status.')
    }

    const orderToUpdate = state.orders.find((order) => order.orderId === orderId)
    if (!orderToUpdate) throw new Error('The order could not be found.')
    if (getOrderStatus(orderToUpdate) === CANCELLED_STATUS) {
      throw new Error('A cancelled order cannot be updated.')
    }
    if (
      status === CANCELLED_STATUS &&
      ['Out for Delivery', 'Delivered'].includes(
        getOrderStatus(orderToUpdate),
      )
    ) {
      throw new Error('This order can no longer be cancelled.')
    }
    if (status === getOrderStatus(orderToUpdate)) return

    const statusHistory = Array.isArray(orderToUpdate.statusHistory)
      ? orderToUpdate.statusHistory
      : [{ status: getOrderStatus(orderToUpdate), timestamp: orderToUpdate.createdAtISO || null }]
    const timestamp = new Date().toISOString()
    const nextHistory = statusHistory.some((entry) => entry.status === status)
      ? statusHistory.map((entry) =>
          entry.status === status ? { ...entry, timestamp } : entry,
        )
      : [...statusHistory, { status, timestamp }]
    const orders = state.orders.map((order) =>
      order.orderId === orderId
        ? {
            ...order,
            orderStatus: status,
            deliveryStatus: status,
            statusHistory: nextHistory,
          }
        : order,
    )

    persistOrders(orders)
    createOrderNotification(orderToUpdate, status)
  }

  return (
    <OrderContext.Provider
      value={{
        orders: state.orders,
        loadError: state.error,
        addOrder,
        updateOrderStatus,
      }}
    >
      {children}
    </OrderContext.Provider>
  )
}

export function useOrders() {
  const context = useContext(OrderContext)

  if (!context) {
    throw new Error('useOrders must be used inside OrderProvider')
  }

  return context
}
