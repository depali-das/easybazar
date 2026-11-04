import { ArrowLeft, Headphones } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import ContactForm from '../components/ContactForm.jsx'

export default function Support({ account, onSignIn }) {
  const navigate = useNavigate()
  const location = useLocation()
  const params = new URLSearchParams(location.search)

  return (
    <main className="min-h-screen bg-[#f8faf7] px-4 py-8 pb-20 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-3xl">
        <button type="button" onClick={() => navigate(-1)} className="mb-6 inline-flex items-center gap-2 rounded-lg font-semibold text-slate-700 hover:text-green-800 focus:outline-none focus:ring-4 focus:ring-green-100">
          <ArrowLeft size={18} aria-hidden="true" /> Back
        </button>
        <header className="mb-6 flex items-center gap-3">
          <span className="rounded-2xl bg-green-100 p-3 text-green-800"><Headphones size={27} aria-hidden="true" /></span>
          <div>
            <p className="font-semibold text-green-800">EasyBazar Customer Support</p>
            <h1 className="text-3xl font-extrabold text-slate-900">How can we help?</h1>
          </div>
        </header>
        <ContactForm
          key={`${params.get('orderId') || ''}-${params.get('category') || ''}`}
          initialOrderId={params.get('orderId') || ''}
          initialCategory={params.get('category') || ''}
          account={account}
          onSignIn={onSignIn}
        />
      </div>
    </main>
  )
}
