import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  BadgeCheck,
  ChevronRight,
  Heart,
  Minus,
  Plus,
  ShoppingCart,
  Star,
} from 'lucide-react'
import ProductImage from './ProductImage.jsx'
import { addProductReview, getProductRating, loadProductReviews } from '../utils/productReviews.js'

const relatedCategories = {
  Vegetables: ['Fruits', 'Groceries', 'Rice & Grains', 'Oil', 'Lentils'],
  Fruits: ['Vegetables', 'Beverages', 'Bakery and snacks'],
  'Rice & Grains': ['Lentils', 'Groceries', 'Oil', 'Vegetables'],
  Lentils: ['Rice & Grains', 'Groceries', 'Vegetables', 'Oil'],
  'Dairy & Eggs': ['Bakery and snacks', 'Beverages', 'Fruits'],
  'Fish & Meat': ['Vegetables', 'Groceries', 'Rice & Grains'],
  Oil: ['Groceries', 'Rice & Grains', 'Lentils', 'Vegetables'],
  Groceries: ['Rice & Grains', 'Oil', 'Lentils', 'Vegetables'],
  Beverages: ['Fruits', 'Bakery and snacks', 'Dairy & Eggs'],
  'Personal care': ['Household essentials', 'Baby care'],
  'Household essentials': ['Personal care', 'Baby care'],
  'Baby care': ['Personal care', 'Household essentials'],
  'Bakery and snacks': ['Dairy & Eggs', 'Beverages', 'Fruits'],
}

function getRelatedProducts(product, allProducts) {
  const otherProducts = allProducts.filter((item) => item.id !== product.id)
  const sameCategory = otherProducts.filter(
    (item) => item.category === product.category,
  )
  const relatedCategoryNames = relatedCategories[product.category] || []
  const similarProducts = relatedCategoryNames.flatMap((category) =>
    otherProducts.filter((item) => item.category === category),
  )
  return [...sameCategory, ...similarProducts].filter(
    (item, index, candidates) =>
      candidates.findIndex((candidate) => candidate.id === item.id) === index,
  )
}

function getDiscount(product) {
  if (
    !Number.isFinite(product.price) ||
    !Number.isFinite(product.originalPrice) ||
    product.originalPrice <= product.price
  ) {
    return 0
  }
  return Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100,
  )
}

function readReviewState() {
  try {
    return { reviews: loadProductReviews(), error: '' }
  } catch (error) {
    return { reviews: [], error: error.message }
  }
}

function ProductCard({
  product,
  isWishlisted,
  onAddToCart,
  onToggleWishlist,
  onViewProduct,
}) {
  const discount = getDiscount(product)
  const outOfStock = Number.isFinite(product.stock) && product.stock <= 0

  return (
    <article className="store-product-card group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg">
      <div className="store-product-visual relative aspect-4/3 overflow-hidden bg-linear-to-br from-green-50 to-gray-100">
        <button
          type="button"
          onClick={() => onViewProduct(product)}
          aria-label={`View ${product.name} details`}
          className="h-full w-full focus:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-green-300"
        >
          <ProductImage
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </button>
        <button
          type="button"
          onClick={() => onToggleWishlist(product.id)}
          aria-label={`${isWishlisted ? 'Remove' : 'Add'} ${product.name} ${isWishlisted ? 'from' : 'to'} wishlist`}
          aria-pressed={isWishlisted}
          className={`absolute right-3 top-3 rounded-full bg-white/95 p-2 shadow-md transition hover:text-red-600 focus:outline-none focus:ring-4 focus:ring-red-100 ${
            isWishlisted ? 'text-red-600' : 'text-slate-700'
          }`}
        >
          <Heart size={19} fill={isWishlisted ? 'currentColor' : 'none'} aria-hidden="true" />
        </button>
        {discount > 0 && (
          <span className="absolute left-3 top-3 rounded-full bg-red-600 px-2.5 py-1 text-xs font-bold text-white shadow-sm">
            {discount}% OFF
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-semibold text-green-800">{product.category}</p>
        <button
          type="button"
          onClick={() => onViewProduct(product)}
          className="product-title mt-1 min-h-10 self-start text-left font-bold text-gray-900 hover:text-green-800 focus:outline-none focus-visible:underline"
        >
          {product.name}
        </button>
        <p className="mt-1 text-sm text-gray-600">{product.unit}</p>
        {Number.isFinite(product.stock) && (
          <p
            className={`mt-2 text-xs font-semibold ${
              outOfStock ? 'text-red-700' : 'text-green-800'
            }`}
          >
            {outOfStock ? 'Out of Stock' : 'In Stock'}
          </p>
        )}

        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <div>
            {Number.isFinite(product.price) ? (
              <>
                <span className="block font-extrabold text-gray-900">
                  ৳{product.price}
                </span>
                {discount > 0 && (
                  <span className="text-xs text-gray-600 line-through">
                    ৳{product.originalPrice}
                  </span>
                )}
              </>
            ) : (
              <span className="text-sm font-semibold text-slate-700">
                Price unavailable
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => onAddToCart(product, 1)}
            aria-label={`Add ${product.name} to cart`}
            disabled={outOfStock || !Number.isFinite(product.price)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-green-700 px-3 py-2 text-sm font-semibold text-white transition hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus size={18} aria-hidden="true" />
            <span className="hidden sm:inline">Add</span>
          </button>
        </div>
      </div>
    </article>
  )
}

export default function ProductDetails({
  product,
  products,
  wishlistIds,
  account,
  onSignIn,
  onBack,
  onViewCategory,
  onAddToCart,
  onBuyNow,
  onToggleWishlist,
  onViewProduct,
}) {
  const [quantity, setQuantity] = useState(1)
  const [showAllRelated, setShowAllRelated] = useState(false)
  const [reviewState, setReviewState] = useState(readReviewState)
  const reviews = reviewState.reviews
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [reviewError, setReviewError] = useState('')
  const [reviewSaved, setReviewSaved] = useState('')
  const relatedProducts = getRelatedProducts(product, products)
  const displayedRelatedProducts = showAllRelated
    ? relatedProducts
    : relatedProducts.slice(0, 8)
  const discount = getDiscount(product)
  const hasPrice = Number.isFinite(product.price)
  const stockKnown = Number.isFinite(product.stock)
  const stockAvailable = !stockKnown || product.stock > 0
  const maxQuantity = stockKnown ? Math.max(0, Math.floor(product.stock)) : 99
  const isWishlisted = wishlistIds.includes(product.id)
  const productReviews = useMemo(
    () => reviews.filter((review) => review.productId === Number(product.id)),
    [product.id, reviews],
  )
  const ratingSummary = getProductRating(reviews, product.id)
  const hasReviewed = Boolean(account?.customerId && productReviews.some(
    (review) => review.customerId === account.customerId,
  ))

  useEffect(() => {
    const refreshReviews = () => {
      setReviewState(readReviewState())
    }
    window.addEventListener('easybazar-product-reviews-updated', refreshReviews)
    return () => window.removeEventListener('easybazar-product-reviews-updated', refreshReviews)
  }, [])

  function submitReview(event) {
    event.preventDefault()
    try {
      const review = addProductReview({
        productId: product.id,
        customerId: account?.customerId,
        customerName: account?.name || '',
        rating: reviewRating,
        comment: reviewComment,
      })
      setReviewComment('')
      setReviewRating(5)
      setReviewError('')
      setReviewSaved('Your review has been saved in this browser.')
      setReviewState((current) => ({
        reviews: [review, ...current.reviews.filter((item) => item.id !== review.id)],
        error: '',
      }))
    } catch (error) {
      setReviewSaved('')
      setReviewError(error.message)
    }
  }

  return (
    <main className="min-h-screen bg-[#f8faf7] px-4 py-8 pb-24 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 font-semibold text-slate-700 hover:text-green-700 focus:outline-none focus:ring-4 focus:ring-green-100 rounded-lg"
          >
            <ArrowLeft size={18} aria-hidden="true" /> Back to products
          </button>
          <p className="font-bold text-green-800">EasyBazar</p>
        </div>

        <nav
          aria-label="Breadcrumb"
          className="mb-6 flex flex-wrap items-center gap-2 text-sm text-slate-600"
        >
          <button type="button" onClick={onBack} className="hover:text-green-700 focus:underline">
            Home
          </button>
          <ChevronRight size={15} aria-hidden="true" />
          <button type="button" onClick={() => onViewCategory(product.category)} className="hover:text-green-700 focus:underline">
            {product.category}
          </button>
          <ChevronRight size={15} aria-hidden="true" />
          <span aria-current="page" className="font-medium text-slate-900">
            {product.name}
          </span>
        </nav>

        <article className="grid overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm md:grid-cols-2">
          <div className="relative flex min-h-72 items-center justify-center bg-slate-50 sm:min-h-96">
            <ProductImage
              src={product.image}
              alt={product.name}
              className="h-full max-h-120 min-h-72 w-full object-contain p-4 sm:p-8"
              loading="eager"
            />
            {discount > 0 && (
              <span className="absolute left-5 top-5 rounded-full bg-red-600 px-3 py-1.5 text-sm font-bold text-white">
                {discount}% OFF
              </span>
            )}
          </div>

          <div className="flex flex-col p-6 sm:p-9">
            <p className="text-sm font-semibold text-green-800">{product.category}</p>
            <h1 className="mt-2 text-3xl font-extrabold leading-tight text-slate-900 sm:text-4xl">
              {product.name}
            </h1>
            {product.nameBn && (
              <p lang="bn" className="mt-1 text-lg text-slate-700">
                {product.nameBn}
              </p>
            )}
            <p className="mt-3 text-slate-700">
              Package size: <span className="font-semibold">{product.unit}</span>
            </p>
            <div className="mt-3 flex items-center gap-2 text-sm" aria-label={`${ratingSummary.average.toFixed(1)} out of 5 stars, ${ratingSummary.count} reviews`}>
              <span className="inline-flex items-center gap-1 font-bold text-amber-600"><Star size={17} fill="currentColor" /> {ratingSummary.average ? ratingSummary.average.toFixed(1) : 'New'}</span>
              <span className="text-slate-600">({ratingSummary.count} {ratingSummary.count === 1 ? 'review' : 'reviews'})</span>
            </div>

            <div className="mt-6 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              {hasPrice ? (
                <>
                  <span className="text-3xl font-extrabold text-green-800">৳{product.price}</span>
                  {discount > 0 && (
                    <span className="text-lg text-slate-600 line-through">৳{product.originalPrice}</span>
                  )}
                  <span className="text-sm text-slate-600">per {product.unit}</span>
                </>
              ) : (
                <span className="text-lg font-semibold text-slate-700">Price unavailable</span>
              )}
            </div>

            <p className={`mt-4 inline-flex items-center gap-2 text-sm font-semibold ${stockKnown && !stockAvailable ? 'text-red-700' : 'text-green-800'}`} role="status">
              <BadgeCheck size={18} aria-hidden="true" />
              {stockKnown ? (stockAvailable ? 'In Stock' : 'Out of Stock') : 'Availability not provided'}
            </p>

            <section className="mt-6 rounded-2xl bg-green-50 p-4">
              <h2 className="font-bold text-slate-900">Product information</h2>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                {product.description || `${product.name} is listed in ${product.category} and sold in the ${product.unit} package shown above.`}
              </p>
              <dl className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-700">Category</dt>
                  <dd className="text-right font-medium text-slate-900">{product.category}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-700">Package size</dt>
                  <dd className="text-right font-medium text-slate-900">{product.unit}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-700">Product ID</dt>
                  <dd className="text-right font-medium text-slate-900">{product.id}</dd>
                </div>
              </dl>
            </section>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <span className="text-sm font-semibold text-slate-800">Quantity</span>
              <div className="inline-flex items-center rounded-xl border border-slate-200" aria-label="Product quantity">
                <button
                  type="button"
                  onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                  className="rounded-l-xl p-2.5 text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-green-200"
                >
                  <Minus size={18} aria-hidden="true" />
                </button>
                <output aria-live="polite" className="min-w-10 text-center font-bold text-slate-900">
                  {quantity}
                </output>
                <button
                  type="button"
                  onClick={() => setQuantity((current) => Math.min(maxQuantity, current + 1))}
                  disabled={quantity >= maxQuantity}
                  aria-label="Increase quantity"
                  className="rounded-r-xl p-2.5 text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-green-200"
                >
                  <Plus size={18} aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className="mt-auto flex flex-col gap-3 pt-7 sm:flex-row sm:flex-wrap">
              <button
                type="button"
                onClick={() => onAddToCart(product, quantity)}
                disabled={!stockAvailable || !hasPrice}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-700 px-5 py-3.5 font-bold text-white transition hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ShoppingCart size={19} aria-hidden="true" /> Add to Cart
              </button>
              <button
                type="button"
                onClick={() => onBuyNow(product, quantity)}
                disabled={!stockAvailable || !hasPrice}
                className="inline-flex flex-1 items-center justify-center rounded-xl border border-green-700 px-5 py-3.5 font-bold text-green-800 transition hover:bg-green-50 focus:outline-none focus:ring-4 focus:ring-green-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Buy Now
              </button>
              <button
                type="button"
                onClick={() => onToggleWishlist(product.id)}
                aria-pressed={isWishlisted}
                className={`inline-flex items-center justify-center gap-2 rounded-xl border px-5 py-3.5 font-semibold transition focus:outline-none focus:ring-4 focus:ring-red-100 ${
                  isWishlisted ? 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Heart size={19} fill={isWishlisted ? 'currentColor' : 'none'} aria-hidden="true" />
                {isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
              </button>
            </div>
          </div>
        </article>

        <section className="mt-8 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-7" aria-labelledby="product-reviews-heading">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-green-800">Customer feedback</p>
              <h2 id="product-reviews-heading" className="mt-1 text-2xl font-extrabold text-slate-900">Reviews & ratings</h2>
            </div>
            <p className="text-sm font-semibold text-slate-700">{ratingSummary.average ? `${ratingSummary.average.toFixed(1)} / 5` : 'No ratings yet'} · {ratingSummary.count} reviews</p>
          </div>
          {reviewState.error && <p role="alert" className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">{reviewState.error}</p>}
          {account?.customerId && !hasReviewed && (
            <form onSubmit={submitReview} className="mt-5 grid gap-3 rounded-2xl bg-slate-50 p-4 sm:grid-cols-[12rem_1fr_auto] sm:items-end">
              <label className="text-sm font-semibold text-slate-800">Your rating
                <select value={reviewRating} onChange={(event) => setReviewRating(Number(event.target.value))} className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5">
                  {[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} star{rating === 1 ? '' : 's'}</option>)}
                </select>
              </label>
              <label className="text-sm font-semibold text-slate-800">Written review
                <textarea value={reviewComment} onChange={(event) => setReviewComment(event.target.value)} minLength={8} maxLength={1000} required rows={2} placeholder="Share your experience with this product" className="mt-1.5 w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2.5" />
              </label>
              <button type="submit" className="rounded-lg bg-green-700 px-4 py-2.5 font-bold text-white hover:bg-green-800">Submit review</button>
            </form>
          )}
          {!account?.customerId && <p className="mt-4 rounded-xl bg-green-50 p-3 text-sm text-green-900">Sign in to add a review. Reviews are a local demo feature and can be altered in browser storage.{onSignIn && <> <button type="button" onClick={onSignIn} className="font-bold underline">Log in / Sign up</button></>}</p>}
          {hasReviewed && <p className="mt-4 rounded-xl bg-green-50 p-3 text-sm font-semibold text-green-900">You have already reviewed this product with this demo account.</p>}
          {reviewError && <p role="alert" className="mt-3 text-sm text-red-700">{reviewError}</p>}
          {reviewSaved && <p role="status" className="mt-3 text-sm font-semibold text-green-800">{reviewSaved}</p>}
          <div className="mt-5 divide-y divide-slate-100">
            {productReviews.map((review) => (
              <article key={review.id} className="py-4 first:pt-0">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-bold text-slate-900">{review.customerName}</p>
                  <time className="text-xs text-slate-500" dateTime={review.createdAt}>{new Intl.DateTimeFormat('en-BD', { dateStyle: 'medium' }).format(new Date(review.createdAt))}</time>
                </div>
                <p className="mt-1 flex items-center gap-1 text-amber-600" aria-label={`${review.rating} out of 5 stars`}>{Array.from({ length: 5 }, (_, index) => <Star key={index} size={15} fill={index < review.rating ? 'currentColor' : 'none'} />)}</p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{review.comment}</p>
              </article>
            ))}
            {!productReviews.length && !reviewState.error && <p className="py-5 text-sm text-slate-600">No reviews yet. Be the first to share feedback.</p>}
          </div>
        </section>

        {relatedProducts.length > 0 && (
          <section className="mt-12" aria-labelledby="related-products-title">
            <div className="mb-5">
              <h2 id="related-products-title" className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
                Related Products
              </h2>
              <p className="mt-1 text-slate-700">You may also like these products.</p>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {displayedRelatedProducts.map((relatedProduct) => (
                <ProductCard
                  key={relatedProduct.id}
                  product={relatedProduct}
                  isWishlisted={wishlistIds.includes(relatedProduct.id)}
                  onAddToCart={onAddToCart}
                  onToggleWishlist={onToggleWishlist}
                  onViewProduct={onViewProduct}
                />
              ))}
            </div>
            {relatedProducts.length > 8 && (
              <div className="mt-7 text-center">
                <button
                  type="button"
                  onClick={() => setShowAllRelated((shown) => !shown)}
                  aria-expanded={showAllRelated}
                  className="rounded-xl border border-green-700 px-5 py-3 font-semibold text-green-800 transition hover:bg-green-50 focus:outline-none focus:ring-4 focus:ring-green-100"
                >
                  {showAllRelated ? 'Show Fewer Related Products' : 'View All Related Products'}
                </button>
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  )
}