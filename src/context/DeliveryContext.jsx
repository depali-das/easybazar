import { createContext, useContext, useEffect, useState } from 'react'
import {
  DELIVERY_DISTRICT,
  isDeliveryLocationAvailable,
  RAJSHAHI_DELIVERY_LOCATIONS,
} from '../data/deliveryAreas.js'

const LOCATION_STORAGE_KEY = 'easybazar-delivery-area'
const DISTRICT_STORAGE_KEY = 'easybazar-delivery-district'
const AREAS_STORAGE_KEY = 'easybazar-configured-delivery-areas'
const DeliveryContext = createContext(null)
const DEFAULT_DELIVERY_LOCATIONS = RAJSHAHI_DELIVERY_LOCATIONS

function loadSavedLocation(key) {
  try {
    return localStorage.getItem(key) || ''
  } catch (error) {
    console.error('Unable to load saved delivery location:', error)
    return ''
  }
}

export function DeliveryProvider({ children }) {
  const [selectedLocation, setSelectedLocation] = useState(() =>
    loadSavedLocation(LOCATION_STORAGE_KEY),
  )
  const [selectedDistrict, setSelectedDistrict] = useState(
    () => loadSavedLocation(DISTRICT_STORAGE_KEY) || DELIVERY_DISTRICT,
  )
  const [deliveryLocations, setDeliveryLocations] = useState(() => {
    try {
      const saved = localStorage.getItem(AREAS_STORAGE_KEY)
      const parsed = saved ? JSON.parse(saved) : DEFAULT_DELIVERY_LOCATIONS
      return Array.isArray(parsed) ? parsed.filter((area) => typeof area === 'string') : DEFAULT_DELIVERY_LOCATIONS
    } catch (error) {
      console.error('Unable to load configured delivery areas:', error)
      return DEFAULT_DELIVERY_LOCATIONS
    }
  })

  useEffect(() => {
    try {
      if (selectedLocation) {
        localStorage.setItem(LOCATION_STORAGE_KEY, selectedLocation)
      } else {
        localStorage.removeItem(LOCATION_STORAGE_KEY)
      }
      localStorage.setItem(DISTRICT_STORAGE_KEY, selectedDistrict)
      localStorage.setItem(AREAS_STORAGE_KEY, JSON.stringify(deliveryLocations))
    } catch (error) {
      console.error('Unable to save delivery location:', error)
    }
  }, [deliveryLocations, selectedDistrict, selectedLocation])

  function addDeliveryLocation(name) {
    const nextName = name.trim().replace(/\s+/g, ' ')
    if (!nextName) throw new Error('Enter a delivery area name.')
    if (deliveryLocations.some((area) => area.toLocaleLowerCase() === nextName.toLocaleLowerCase())) {
      throw new Error('This delivery area is already configured.')
    }
    setDeliveryLocations((current) => [...current, nextName])
  }

  function removeDeliveryLocation(name) {
    setDeliveryLocations((current) => current.filter((area) => area !== name))
  }

  const value = {
    selectedLocation,
    selectedDistrict,
    deliveryLocations,
    setSelectedLocation,
    setSelectedDistrict,
    addDeliveryLocation,
    removeDeliveryLocation,
    isSelectedLocationAvailable: isDeliveryLocationAvailable(
      selectedDistrict,
      selectedLocation,
    ),
  }

  return (
    <DeliveryContext.Provider value={value}>
      {children}
    </DeliveryContext.Provider>
  )
}

export function useDelivery() {
  const context = useContext(DeliveryContext)

  if (!context) {
    throw new Error('useDelivery must be used inside DeliveryProvider')
  }

  return context
}
