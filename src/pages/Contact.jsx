import { ArrowLeft, Clock3, Mail, MapPin, Phone } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { CONTACT_INFO } from '../config/contact.js'
import ContactForm from '../components/ContactForm.jsx'
import FAQSection from '../components/FAQSection.jsx'
import WhatsAppButton from '../components/WhatsAppButton.jsx'

function ContactCard({ icon: Icon, title, children }) {
  return (
    <article className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <span className="inline-flex rounded-xl bg-green-50 p-2.5 text-green-800"><Icon size={21} aria-hidden="true" /></span>
      <h2 className="mt-3 font-bold text-slate-900">{title}</h2>
      <div className="mt-1 text-sm leading-6 text-slate-700">{children}</div>
    </article>
  )
}

export default function Contact() {
  const navigate = useNavigate()

  return (
    <main className="min-h-screen bg-[#f8faf7] px-4 py-8 pb-20 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-6xl">
        <button type="button" onClick={() => navigate('/')} className="mb-6 inline-flex items-center gap-2 rounded-lg font-semibold text-slate-700 hover:text-green-800 focus:outline-none focus:ring-4 focus:ring-green-100">
          <ArrowLeft size={18} aria-hidden="true" /> Back to EasyBazar
        </button>

        <header className="overflow-hidden rounded-3xl bg-linear-to-br from-green-900 to-green-700 p-6 text-white shadow-lg sm:p-10">
          <div className="flex items-center gap-3">
            <img src="/favicon.svg" alt="" className="h-12 w-12 rounded-xl bg-white p-2" />
            <span className="text-2xl font-extrabold">{CONTACT_INFO.brandName}</span>
          </div>
          <h1 className="mt-6 text-3xl font-extrabold sm:text-4xl">We’re Here to Help!</h1>
          <p lang="bn" className="mt-2 text-green-50 sm:text-lg">আপনার যেকোনো প্রশ্ন বা সমস্যায় আমরা পাশে আছি।</p>
          <p className="mt-3 text-sm text-green-100">Contact our Rajshahi support team during {CONTACT_INFO.supportHours.display}.</p>
        </header>

        <section aria-label="EasyBazar contact information" className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ContactCard icon={Phone} title="Call Support">
            <a href={`tel:${CONTACT_INFO.phoneLink}`} className="font-semibold text-green-800 hover:underline">{CONTACT_INFO.phone}</a>
          </ContactCard>
          <ContactCard icon={Mail} title="Email Support">
            <a href={`mailto:${CONTACT_INFO.email}`} className="break-all font-semibold text-green-800 hover:underline">{CONTACT_INFO.email}</a>
          </ContactCard>
          <ContactCard icon={MapPin} title="Service Area">
            <p>{CONTACT_INFO.address}</p>
          </ContactCard>
          <ContactCard icon={Clock3} title="Support Hours">
            <p>{CONTACT_INFO.supportHours.display}</p>
          </ContactCard>
        </section>

        <div className="my-4 flex flex-wrap gap-3">
          <WhatsAppButton />
          <a href={`tel:${CONTACT_INFO.phoneLink}`} className="inline-flex items-center justify-center gap-2 rounded-xl border border-green-700 px-4 py-3 font-semibold text-green-900 hover:bg-green-50">
            <Phone size={18} aria-hidden="true" /> Call {CONTACT_INFO.phone}
          </a>
        </div>

        <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
          <ContactForm />
          <FAQSection />
        </div>
        <p className="mt-8 rounded-xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-600">
          No verified public business map location is configured, so a Google Maps embed is intentionally not shown.
        </p>
      </div>
    </main>
  )
}
