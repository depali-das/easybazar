export const DELIVERY_CITY = 'Rajshahi'
export const DELIVERY_DISTRICT = 'Rajshahi'
export const DELIVERY_TIME_ZONE = 'Asia/Dhaka'
export const ORDER_START_TIME = '07:00'
export const ORDER_END_TIME = '21:00'

export const AVAILABLE_DELIVERY_DISTRICTS = [
  DELIVERY_DISTRICT,
]

export const RAJSHAHI_DELIVERY_LOCATIONS = [
  'Rajshahi City Corporation',
  'Boalia',
  'Rajpara',
  'Motihar',
  'Shah Makhdum',
  'Chandrima',
  'Paba',
  'Puthia',
  'Charghat',
  'Bagha',
  'Durgapur',
  'Mohanpur',
  'Tanore',
  'Godagari',
  'Bagmara',
]

export const RAJSHAHI_LOCATION_SUGGESTIONS = RAJSHAHI_DELIVERY_LOCATIONS

function normalizeLocation(location) {
  return typeof location === 'string'
    ? location.trim().replace(/\s+/g, ' ').toLocaleLowerCase()
    : ''
}

export function isRajshahiDistrict(district) {
  return normalizeLocation(district) === normalizeLocation(DELIVERY_DISTRICT)
}

export function isDeliveryLocationAvailable(
  district,
  location,
) {
  const normalizedLocation = normalizeLocation(location)

  return (
    isRajshahiDistrict(district) &&
    normalizedLocation.length > 0
  )
}

export function getDhakaMinuteOfDay(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: DELIVERY_TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date)
  const hour = Number(parts.find((part) => part.type === 'hour')?.value)
  const minute = Number(parts.find((part) => part.type === 'minute')?.value)

  return hour * 60 + minute
}

export function isOrderingOpen(date = new Date()) {
  const currentMinute = getDhakaMinuteOfDay(date)
  return currentMinute >= 7 * 60 && currentMinute < 21 * 60
}

export function getOrderingStatus(date = new Date()) {
  return {
    isOpen: isOrderingOpen(date),
    message: isOrderingOpen(date)
      ? 'Ordering is open now. We accept orders daily from 7:00 AM to 9:00 PM.'
      : 'We accept orders daily from 7:00 AM to 9:00 PM.',
    nextPeriodMessage: 'We accept orders daily from 7:00 AM to 9:00 PM.',
  }
}
