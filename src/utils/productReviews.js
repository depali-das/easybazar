export const PRODUCT_REVIEWS_KEY = 'easybazar-product-reviews'

export function loadProductReviews() {
  try {
    const saved = localStorage.getItem(PRODUCT_REVIEWS_KEY)
    if (!saved) return []
    const reviews = JSON.parse(saved)
    if (!Array.isArray(reviews)) throw new Error('Saved product reviews have an invalid format.')
    return reviews.filter((review) =>
      review &&
      Number.isFinite(Number(review.productId)) &&
      typeof review.customerId === 'string' &&
      typeof review.customerName === 'string' &&
      Number.isInteger(review.rating) &&
      review.rating >= 1 &&
      review.rating <= 5 &&
      typeof review.comment === 'string' &&
      typeof review.createdAt === 'string' &&
      !Number.isNaN(new Date(review.createdAt).getTime()),
    )
  } catch (error) {
    console.error('Unable to load product reviews:', error)
    throw new Error('Product reviews could not be loaded from this browser.')
  }
}

export function addProductReview({ productId, customerId, customerName, rating, comment }) {
  if (!customerId) throw new Error('Sign in to submit a demo review.')
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error('Choose a rating from 1 to 5 stars.')
  }
  const text = comment.trim()
  if (text.length < 8) throw new Error('Write at least 8 characters in your review.')

  const reviews = loadProductReviews()
  if (reviews.some((review) => review.productId === Number(productId) && review.customerId === customerId)) {
    throw new Error('You have already reviewed this product with this demo account.')
  }

  const review = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    productId: Number(productId),
    customerId,
    customerName: customerName.trim() || 'EasyBazar customer',
    rating,
    comment: text,
    createdAt: new Date().toISOString(),
  }

  try {
    localStorage.setItem(PRODUCT_REVIEWS_KEY, JSON.stringify([review, ...reviews]))
    window.dispatchEvent(new Event('easybazar-product-reviews-updated'))
    return review
  } catch (error) {
    console.error('Unable to save product review:', error)
    throw new Error('Your review could not be saved in this browser.')
  }
}

export function getProductRating(reviews, productId) {
  const productReviews = reviews.filter((review) => review.productId === Number(productId))
  const count = productReviews.length
  return {
    count,
    average: count
      ? productReviews.reduce((sum, review) => sum + review.rating, 0) / count
      : 0,
  }
}
