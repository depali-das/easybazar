import WhatsAppButton from './WhatsAppButton.jsx'

export default function FloatingSupport() {
  return (
    <WhatsAppButton
      className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] right-5 z-40 max-w-[calc(100vw-2.5rem)] rounded-full px-4 py-3 shadow-lg md:bottom-5"
      label="WhatsApp"
    />
  )
}
