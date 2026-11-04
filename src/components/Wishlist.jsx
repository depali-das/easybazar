import { ArrowLeft, Heart, Plus, ShoppingBasket, Trash2 } from 'lucide-react'
import ProductImage from './ProductImage.jsx'

export default function Wishlist({
  items,
  onBack,
  onRemove,
  onAddToCart,
  onViewProduct,
}) {
  return (
    <main className="min-h-screen bg-[#f8faf7] px-4 py-8 pb-24 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <button
          type="button"
          onClick={onBack}
          className="mb-6 inline-flex items-center gap-2 font-semibold text-slate-700 hover:text-green-700 focus:outline-none focus:ring-4 focus:ring-green-100 rounded-lg"
        >
          <ArrowLeft size={18} aria-hidden="true" /> Back to EasyBazar
        </button>

        <div className="mb-8 flex items-center gap-3">
          <Heart className="text-red-500" size={30} aria-hidden="true" />
          <div>
            <p className="font-semibold text-green-800">EasyBazar</p>
            <h1 className="text-3xl font-bold text-slate-900">My Wishlist</h1>
          </div>
        </div>

        {items.length === 0 ? (
          <section className="checkout-panel rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-sm">
            <ShoppingBasket className="mx-auto h-12 w-12 text-slate-500" aria-hidden="true" />
            <h2 className="mt-4 text-xl font-bold">Your wishlist is empty</h2>
            <p className="mt-2 text-slate-700">
              Save products you like and find them here later.
            </p>
            <button
              type="button"
              onClick={onBack}
              className="mt-5 rounded-xl bg-green-700 px-5 py-3 font-semibold text-white hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-200"
            >
              Browse Products
            </button>
          </section>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {items.map((product) => (
              <article
                key={product.id}
                role="link"
                tabIndex={0}
                onClick={(event) => {
                  if (event.target.closest('button')) return
                  onViewProduct(product)
                }}
                onKeyDown={(event) => {
                  if (
                    (event.key === 'Enter' || event.key === ' ') &&
                    !event.target.closest('button')
                  ) {
                    event.preventDefault()
                    onViewProduct(product)
                  }
                }}
                className="store-product-card group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="store-product-visual relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-green-50 to-gray-100">
                  <ProductImage
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <button
                    type="button"
                    onClick={() => onRemove(product.id)}
                    aria-label={`Remove ${product.name} from wishlist`}
                    className="absolute right-3 top-3 rounded-full bg-white/95 p-2 text-red-600 shadow-md transition hover:bg-red-50 focus:outline-none focus:ring-4 focus:ring-red-100"
                  >
                    <Trash2 size={18} aria-hidden="true" />
                  </button>
                </div>

                <div className="flex flex-1 flex-col p-4">
                  <p className="text-xs font-semibold text-green-800">
                    {product.category}
                  </p>
                  <h2 className="product-title mt-1 min-h-10 font-bold text-gray-900">
                    {product.name}
                  </h2>
                  <p className="mt-1 text-sm text-gray-600">{product.unit}</p>

                  <button
                    type="button"
                    onClick={() => onViewProduct(product)}
                    className="mt-2 self-start text-sm font-semibold text-green-800 hover:text-green-900 hover:underline focus:outline-none focus:underline"
                    aria-label={`View details for ${product.name}`}
                  >
                    View details
                  </button>

                  <div className="mt-auto flex items-end justify-between gap-2 pt-3">
                    <div>
                      <span className="block font-extrabold text-gray-900">
                        ৳{product.price}
                      </span>
                      {product.originalPrice > product.price && (
                        <span className="text-xs text-gray-600 line-through">
                          ৳{product.originalPrice}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => onAddToCart(product)}
                      aria-label={`Add ${product.name} to cart`}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-green-700 px-3 py-2 text-sm font-semibold text-white transition hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-200"
                    >
                      <Plus size={18} aria-hidden="true" />
                      <span className="hidden sm:inline">Add</span>
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}