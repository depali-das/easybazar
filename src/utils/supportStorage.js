export const SUPPORT_REQUESTS_KEY = 'easybazar_support_requests'
export const SUPPORT_STATUSES = ['Pending', 'In Progress', 'Resolved']

export function getSupportRequests() {
  try {
    const saved = localStorage.getItem(SUPPORT_REQUESTS_KEY)
    if (!saved) return []

    const requests = JSON.parse(saved)
    if (!Array.isArray(requests)) {
      throw new Error('Saved support tickets have an invalid format.')
    }
    return requests
  } catch (error) {
    console.error('Unable to load support requests:', error)
    throw new Error('Support tickets could not be loaded from this browser.')
  }
}

function createRequestId(existingIds) {
  let requestId
  do {
    const randomPart = globalThis.crypto?.randomUUID
      ? globalThis.crypto.randomUUID().replaceAll('-', '').slice(0, 8)
      : Math.random().toString(36).slice(2, 10)
    requestId = `EB-SUP-${Date.now().toString(36).toUpperCase()}-${randomPart.toUpperCase()}`
  } while (existingIds.has(requestId))
  return requestId
}

export function saveSupportRequest(fields) {
  const requests = getSupportRequests()
  const existingIds = new Set(requests.map((request) => request.id))
  const createdAt = new Date().toISOString()
  const request = {
    id: createRequestId(existingIds),
    name: fields.name.trim(),
    phone: fields.phone.trim(),
    email: fields.email.trim(),
    orderId: fields.orderId.trim(),
    category: fields.category,
    subject: fields.subject.trim(),
    message: fields.message.trim(),
    customerId: fields.customerId || '',
    createdAt,
    status: 'Pending',
  }

  try {
    localStorage.setItem(
      SUPPORT_REQUESTS_KEY,
      JSON.stringify([request, ...requests]),
    )
    window.dispatchEvent(new Event('easybazar-support-requests-updated'))
    return request
  } catch (error) {
    console.error('Unable to save support request:', error)
    throw new Error('Your support request could not be saved in this browser.')
  }
}

export function updateSupportRequestStatus(requestId, status) {
  if (!SUPPORT_STATUSES.includes(status)) {
    throw new Error('Choose a valid support ticket status.')
  }
  const requests = getSupportRequests()
  if (!requests.some((request) => request.id === requestId)) {
    throw new Error('The support ticket could not be found.')
  }
  const updatedRequests = requests.map((request) =>
    request.id === requestId
      ? { ...request, status, updatedAt: new Date().toISOString() }
      : request,
  )
  try {
    localStorage.setItem(SUPPORT_REQUESTS_KEY, JSON.stringify(updatedRequests))
    window.dispatchEvent(new Event('easybazar-support-requests-updated'))
  } catch (error) {
    console.error('Unable to update support request:', error)
    throw new Error('The support ticket could not be updated in this browser.')
  }
}
