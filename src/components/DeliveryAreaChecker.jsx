import { useId, useState } from 'react'
import { CheckCircle2, ChevronDown, MapPin, X, XCircle } from 'lucide-react'
import { useDelivery } from '../context/DeliveryContext.jsx'
import {
  AVAILABLE_DELIVERY_DISTRICTS,
  DELIVERY_DISTRICT,
  isDeliveryLocationAvailable,
} from '../data/deliveryAreas.js'
import { CONTACT_INFO } from '../config/contact.js'
import { DELIVERY_FEE } from '../utils/pricing.js'

export default function DeliveryAreaChecker({ compact = false }) {
  const {
    selectedDistrict,
    selectedLocation,
    deliveryLocations,
    setSelectedDistrict,
    setSelectedLocation,
  } = useDelivery()
  const [isOpen, setIsOpen] = useState(false)
  const [hasChecked, setHasChecked] = useState(false)
  const districtId = useId()
  const locationId = useId()
  const panelId = useId()
  const available = isDeliveryLocationAvailable(
    selectedDistrict,
    selectedLocation,
  )

  function checkAvailability(event) {
    event.preventDefault()
    setHasChecked(true)
  }

  function updateDistrict(event) {
    setSelectedDistrict(event.target.value)
    setHasChecked(false)
  }

  function updateLocation(event) {
    setSelectedLocation(event.target.value)
    setHasChecked(false)
  }

  const result = hasChecked ? (
    available ? (
      <div
        role="status"
        className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-900"
      >
        <p className="flex items-center gap-2 font-bold">
          <CheckCircle2 size={19} aria-hidden="true" />
          Great! We deliver to your area.
        </p>
        <div className="mt-2 space-y-1 pl-7">
          <p>Orders below ৳{CONTACT_INFO.freeDeliveryMinimum}: ৳{DELIVERY_FEE}; free delivery on orders ৳{CONTACT_INFO.freeDeliveryMinimum}+.</p>
          <p>Estimated Delivery: 2–3 Hours.</p>
          <p>Order Time: 7:00 AM – 9:00 PM.</p>
        </div>
      </div>
    ) : (
      <div
        role="status"
        className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
      >
        <p className="flex items-center gap-2 font-bold">
          <X size={19} aria-hidden="true" />
          Sorry! Delivery is not available in your area yet.
        </p>
        <p className="mt-1 pl-7">We are expanding our delivery network.</p>
      </div>
    )
  ) : null

  const checkerForm = (
    <form onSubmit={checkAvailability} className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <label
          htmlFor={districtId}
          className="block text-sm font-semibold text-slate-800"
        >
          District
          <select
            id={districtId}
            value={selectedDistrict}
            onChange={updateDistrict}
            className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
          >
            {AVAILABLE_DELIVERY_DISTRICTS.map((district) => (
              <option key={district} value={district}>
                {district}
              </option>
            ))}
          </select>
        </label>

        <label
          htmlFor={locationId}
          className="block text-sm font-semibold text-slate-800"
        >
          Area / Upazila
          <input
            id={locationId}
            type="text"
            list={`${locationId}-suggestions`}
            value={selectedLocation}
            onChange={updateLocation}
            placeholder="Choose or enter your area"
            autoComplete="address-level2"
            className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
          />
          <datalist id={`${locationId}-suggestions`}>
            {deliveryLocations.map((location) => (
              <option key={location} value={location} />
            ))}
          </datalist>
        </label>
      </div>

      <button
        type="submit"
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-green-700 px-5 py-3 font-semibold text-white transition hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-200"
      >
        <MapPin size={18} aria-hidden="true" />
        Check Availability
      </button>
      {result}
    </form>
  )

  if (compact) {
    return (
      <div className="delivery-location-picker relative">
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={() => setIsOpen((open) => !open)}
          className="flex w-full items-center gap-2 rounded-xl border border-green-100 bg-green-50 px-3 py-2.5 text-left hover:bg-green-100 focus:outline-none focus:ring-4 focus:ring-green-100"
        >
          <MapPin size={18} className="shrink-0 text-green-800" aria-hidden="true" />
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="text-xs font-semibold text-slate-600">
              Deliver to: {selectedDistrict || DELIVERY_DISTRICT}
            </span>
            <span className="truncate text-sm font-semibold text-slate-900">
              {selectedLocation || 'Check your delivery area'}
            </span>
          </span>
          <ChevronDown size={16} className="shrink-0 text-slate-600" aria-hidden="true" />
        </button>

        {isOpen && (
          <section
            id={panelId}
            aria-label="Check delivery availability"
            className="absolute right-0 top-full z-50 mt-2 w-[min(28rem,calc(100vw-1.5rem))] rounded-2xl border border-slate-200 bg-white p-4 shadow-xl"
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 className="font-bold text-slate-900">
                  Check Delivery Availability
                </h2>
                <p className="mt-1 text-xs text-slate-600">
                  Delivery is currently available within Rajshahi District.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close delivery area checker"
                className="rounded-lg p-1 text-slate-500 hover:bg-slate-100"
              >
                <XCircle size={19} aria-hidden="true" />
              </button>
            </div>
            {checkerForm}
          </section>
        )}
      </div>
    )
  }

  return (
    <section
      aria-labelledby="delivery-check-title"
      className="mx-auto mt-6 max-w-3xl rounded-2xl border border-green-100 bg-white p-5 shadow-sm sm:p-7"
    >
      <div className="mb-5 flex items-start gap-3">
        <span className="rounded-xl bg-green-50 p-2 text-green-800">
          <MapPin size={22} aria-hidden="true" />
        </span>
        <div>
          <h2
            id="delivery-check-title"
            className="text-xl font-bold text-slate-900"
          >
            Check Delivery Availability
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Check service for your Rajshahi upazila, area, union, or village.
          </p>
        </div>
      </div>
      {checkerForm}
    </section>
  )
}
