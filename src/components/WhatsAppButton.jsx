import { MessageCircle } from 'lucide-react'
import { getSupportWhatsAppHref, getSupportWhatsAppLabel } from '../utils/whatsapp.js'

export default function WhatsAppButton({
  orderId = '',
  className = '',
  label = 'WhatsApp Support',
}) {
  return (
    <a
      href={getSupportWhatsAppHref(orderId)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={getSupportWhatsAppLabel(label)}
      style={{ color: '#fff' }}
      className={`inline-flex items-center justify-center gap-2 rounded-xl bg-[#15803d] px-4 py-3 font-semibold text-white shadow-sm transition hover:bg-green-800 focus:outline-none focus-visible:ring-4 focus-visible:ring-green-200 ${className}`}
    >
      <MessageCircle size={19} aria-hidden="true" />
      <span>{label}</span>
    </a>
  )
}
