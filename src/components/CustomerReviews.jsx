import { useEffect, useState } from 'react'
import { MessageCircle, Star } from 'lucide-react'
import { loadProductReviews } from '../utils/productReviews.js'

function readReviews() {
  try {
    return { reviews: loadProductReviews(), error: '' }
  } catch (error) {
    return { reviews: [], error: error.message }
  }
}

export default function CustomerReviews({ products }) {
  const [state, setState] = useState(readReviews)
  const reviews = state.reviews
  const recentReviews = reviews.slice(0, 3)

  useEffect(() => {
    function refreshReviews() {
      setState(readReviews())
    }
    window.addEventListener('easybazar-product-reviews-updated', refreshReviews)
    return () => window.removeEventListener('easybazar-product-reviews-updated', refreshReviews)
  }, [])

  return (
    <section aria-labelledby="customer-reviews-title" className="py-10">
      <div className="mb-6">
        <p className="text-sm font-bold uppercase tracking-widest text-green-700">From our community</p>
        <h2 id="customer-reviews-title" className="mt-1 text-2xl font-extrabold text-slate-900">Customer Reviews</h2>
        <p className="mt-1 text-slate-600">Feedback submitted by EasyBazar demo shoppers.</p>
      </div>
      {state.error && <p role="alert" className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900">{state.error}</p>}
      {!state.error && recentReviews.length ? (
        <div className="grid gap-4 md:grid-cols-3">
          {recentReviews.map((review) => {
            const product = products.find((item) => item.id === review.productId)
            return (
              <article key={review.id} className="rounded-2xl border border-green-100 bg-white p-5 shadow-sm">
                <p className="flex items-center gap-1 text-amber-600" aria-label={`${review.rating} out of 5 stars`}>
                  {Array.from({ length: 5 }, (_, index) => <Star key={index} size={16} fill={index < review.rating ? 'currentColor' : 'none'} />)}
                  <span className="ml-1 text-sm font-bold">{review.rating}/5</span>
                </p>
                <p className="mt-3 line-clamp-4 text-sm leading-6 text-slate-700">{review.comment}</p>
                <p className="mt-4 text-sm font-bold text-slate-900">{review.customerName}</p>
                <p className="mt-1 text-xs text-slate-500">{product?.name || 'EasyBazar product'} · {new Intl.DateTimeFormat('en-BD', { dateStyle: 'medium' }).format(new Date(review.createdAt))}</p>
              </article>
            )
          })}
        </div>
      ) : !state.error ? (
        <div className="rounded-3xl border border-dashed border-green-200 bg-linear-to-br from-white to-green-50 px-6 py-10 text-center sm:px-10">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white text-green-700 shadow-sm"><MessageCircle size={27} aria-hidden="true" /></span>
          <h3 className="mt-4 text-lg font-bold text-slate-900">Customer stories are on the way</h3>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-600">No product reviews have been submitted yet. Once genuine demo feedback is available, you’ll find it here.</p>
        </div>
      ) : null}
    </section>
  )
}
