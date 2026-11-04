import { Link } from 'react-router-dom'
import { SEO_PAGES } from '../config/seo.js'
import SEO from '../components/SEO.jsx'

export default function About() {
  return (
    <>
      <SEO page={SEO_PAGES.about} pathname="/about" />
      <main className="min-h-screen bg-[#f8faf7] px-4 py-10 sm:px-6">
        <article className="mx-auto max-w-3xl rounded-3xl bg-white p-6 shadow-sm sm:p-10">
          <p className="font-semibold text-green-800">ইজিবাজার · Local Shop, Better Life.</p>
          <h1 className="mt-3 text-3xl font-extrabold text-slate-900">About EasyBazar</h1>
          <p className="mt-4 leading-7 text-slate-700">
            EasyBazar is an online grocery storefront serving Rajshahi, Bangladesh.
            Browse everyday grocery products and check delivery availability for your area.
          </p>
          <p className="mt-3 leading-7 text-slate-700">
            This website currently presents a demo catalog with sample Bangladesh retail
            prices; prices and availability should be confirmed before a real launch.
          </p>
          <nav aria-label="About EasyBazar links" className="mt-6 flex flex-wrap gap-4 font-semibold text-green-800">
            <Link to="/shop" className="underline underline-offset-4">Browse groceries</Link>
            <Link to="/contact" className="underline underline-offset-4">Contact EasyBazar</Link>
          </nav>
        </article>
      </main>
    </>
  )
}
