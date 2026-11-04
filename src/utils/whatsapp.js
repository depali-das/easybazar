import { CONTACT_INFO, createWhatsAppLink } from '../config/contact.js'

export const DEFAULT_SUPPORT_WHATSAPP_MESSAGE = [
  'Hello EasyBazar Support,',
  '',
  'I need help with my grocery order.',
  '',
  'Order ID:',
  'My Question:',
].join('\n')

export function createOrderWhatsAppMessage(orderId = '') {
  return [
    'Hello EasyBazar Support,',
    '',
    'I need help with my grocery order.',
    '',
    `Order ID: ${orderId || ''}`,
    'My Question:',
  ].join('\n')
}

export function getSupportWhatsAppHref(orderId = '') {
  const message = orderId
    ? createOrderWhatsAppMessage(orderId)
    : DEFAULT_SUPPORT_WHATSAPP_MESSAGE
  return createWhatsAppLink(message)
}

export function getSupportWhatsAppLabel(label = 'WhatsApp Support') {
  return `${label} on ${CONTACT_INFO.phone}`
}
