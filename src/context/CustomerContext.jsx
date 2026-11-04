import { createContext, useCallback, useContext, useState } from 'react'

const CustomerContext = createContext(null)

function getStorageKey(customerId) {
  return `easybazar-customer-${customerId}`
}

function readCustomerData(customerId) {
  if (!customerId) return { profile: null, addresses: [] }

  try {
    const saved = localStorage.getItem(getStorageKey(customerId))
    if (!saved) return { profile: null, addresses: [] }
    const data = JSON.parse(saved)
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw new Error('Saved customer information has an invalid format.')
    }
    return {
      profile: data.profile && typeof data.profile === 'object' ? data.profile : null,
      addresses: Array.isArray(data.addresses) ? data.addresses : [],
    }
  } catch (error) {
    console.error('Unable to load customer information:', error)
    return { profile: null, addresses: [] }
  }
}

export function CustomerProvider({ children, account }) {
  const [data, setData] = useState(() => readCustomerData(account?.customerId))
  const customerId = account?.customerId

  const save = useCallback((nextData) => {
    if (!customerId) {
      throw new Error('Sign in to save customer information.')
    }
    try {
      localStorage.setItem(getStorageKey(customerId), JSON.stringify(nextData))
      setData(nextData)
    } catch (error) {
      console.error('Unable to save customer information:', error)
      throw new Error('Customer information could not be saved in this browser.')
    }
  }, [customerId])

  const updateProfile = useCallback((profile) => {
    save({ ...data, profile })
  }, [data, save])

  const addAddress = useCallback((address) => {
    const nextAddresses = [...data.addresses, { ...address, id: `${Date.now()}-${Math.random()}` }]
    save({ ...data, addresses: nextAddresses })
  }, [data, save])

  const removeAddress = useCallback((addressId) => {
    save({ ...data, addresses: data.addresses.filter((address) => address.id !== addressId) })
  }, [data, save])

  return (
    <CustomerContext.Provider value={{
      profile: data.profile,
      addresses: data.addresses,
      updateProfile,
      addAddress,
      removeAddress,
    }}>
      {children}
    </CustomerContext.Provider>
  )
}

export function useCustomer() {
  const context = useContext(CustomerContext)
  if (!context) throw new Error('useCustomer must be used inside CustomerProvider')
  return context
}
