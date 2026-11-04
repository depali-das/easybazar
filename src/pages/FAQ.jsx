import { Link } from 'react-router-dom'
import FAQSection from '../components/FAQSection.jsx'
import SEO from '../components/SEO.jsx'
import { SEO_PAGES } from '../config/seo.js'

export default function FAQ() {
  return (
    <>
      <SEO page={SEO_PAGES.faq} pathname="/faq" />
      <main className="min-h-screen bg-[#f8faf7] px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-3xl rounded-3xl bg-white p-6 shadow-sm sm:p-10">
          <h1 className="mb-6 text-3xl font-extrabold text-slate-900">
            EasyBazar Frequently Asked Questions
          </h1>
          <FAQSection />
          <p className="mt-6 text-sm text-slate-700">
            Need more help? <Link to="/contact" className="font-semibold text-green-800 underline">Contact EasyBazar support</Link>.
          </p>
        </div>
      </main>
    </>
  )
}
