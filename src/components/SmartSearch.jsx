import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { Clock3, Search, ShoppingCart, TrendingUp, X } from 'lucide-react'
import {
  clearSearchHistory,
  loadSearchHistory,
  loadTrendingSearches,
  recordSearch,
  searchProducts,
} from '../utils/smartSearch.js'

export default function SmartSearch({
  products,
  value,
  onChange,
  onSearch,
  onSelectProduct,
  onAddToCart,
  className = '',
  mobile = false,
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [history, setHistory] = useState(loadSearchHistory)
  const [trending, setTrending] = useState(loadTrendingSearches)
  const wrapperRef = useRef(null)
  const inputRef = useRef(null)
  const suggestionsId = useId()
  const matchingProducts = useMemo(
    () => searchProducts(products, value).slice(0, 6),
    [products, value],
  )
  const hasQuery = Boolean(value.trim())

  useEffect(() => {
    const refreshSavedSearches = () => {
      setHistory(loadSearchHistory())
      setTrending(loadTrendingSearches())
    }
    const closeOnOutsideClick = (event) => {
      if (!wrapperRef.current?.contains(event.target)) setIsOpen(false)
    }
    window.addEventListener('easybazar-search-history-updated', refreshSavedSearches)
    document.addEventListener('pointerdown', closeOnOutsideClick)
    return () => {
      window.removeEventListener('easybazar-search-history-updated', refreshSavedSearches)
      document.removeEventListener('pointerdown', closeOnOutsideClick)
    }
  }, [])

  function commitSearch(query) {
    const trimmedQuery = query.trim()
    if (!trimmedQuery) return
    onChange(trimmedQuery)
    recordSearch(trimmedQuery)
    onSearch(trimmedQuery)
    setIsOpen(false)
    setActiveIndex(-1)
  }

  function chooseProduct(product) {
    recordSearch(value.trim() || product.name)
    setIsOpen(false)
    setActiveIndex(-1)
    onSelectProduct(product)
  }

  function handleKeyDown(event) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setIsOpen(true)
      setActiveIndex((index) => Math.min(index + 1, matchingProducts.length - 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((index) => Math.max(index - 1, -1))
    } else if (event.key === 'Enter') {
      event.preventDefault()
      if (activeIndex >= 0 && matchingProducts[activeIndex]) {
        chooseProduct(matchingProducts[activeIndex])
      } else if (value.trim()) {
        commitSearch(value)
      }
    } else if (event.key === 'Escape') {
      setIsOpen(false)
      setActiveIndex(-1)
      inputRef.current?.blur()
    }
  }

  return (
    <div
      ref={wrapperRef}
      className={`smart-search relative min-w-0 ${mobile ? 'w-full' : 'max-w-2xl flex-1'} ${className}`}
    >
      <div className={`header-search flex min-w-0 items-center rounded-xl border border-slate-200 bg-slate-50 px-3 ${mobile ? 'w-full' : ''}`}>
        <Search size={19} className="shrink-0 text-slate-500" aria-hidden="true" />
        <input
          ref={inputRef}
          name="productSearch"
          value={value}
          onChange={(event) => {
            onChange(event.target.value)
            setActiveIndex(-1)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search rice, eggs, vegetables..."
          aria-label="Search products in Bangla or English"
          aria-expanded={isOpen}
          aria-controls={suggestionsId}
          aria-autocomplete="list"
          role="combobox"
          className="w-full bg-transparent px-3 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-500"
        />
        {value && (
          <button
            type="button"
            onClick={() => {
              onChange('')
              setActiveIndex(-1)
              setIsOpen(true)
              inputRef.current?.focus()
            }}
            className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
            aria-label="Clear product search"
          >
            <X size={17} aria-hidden="true" />
          </button>
        )}
      </div>

      {isOpen && (
        <div
          id={suggestionsId}
          role="dialog"
          aria-label="Search suggestions"
          className="smart-search-dropdown absolute left-0 right-0 top-full z-[60] mt-2 max-h-[min(70vh,32rem)] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl"
        >
          {hasQuery ? (
            <section aria-label="Matching products">
              <p className="px-2 pb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                {matchingProducts.length ? 'Matching products' : 'No matching products'}
              </p>
              {matchingProducts.map((product, index) => (
                <div
                  key={product.id}
                  className={`flex items-center gap-3 rounded-xl p-2 ${activeIndex === index ? 'bg-green-50' : 'hover:bg-slate-50'}`}
                >
                  <button
                    type="button"
                    onClick={() => chooseProduct(product)}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  >
                    <img
                      src={product.image || '/images/fallback.jpg'}
                      alt=""
                      loading="lazy"
                      className="h-11 w-11 shrink-0 rounded-lg bg-slate-100 object-cover"
                    />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-slate-900">{product.name}</span>
                      <span className="block truncate text-xs text-slate-500">{product.category} · ৳{product.price}</span>
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onAddToCart(product)}
                    disabled={product.stock === 0 || !Number.isFinite(product.price)}
                    className="shrink-0 rounded-lg p-2 text-green-800 hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label={`Add ${product.name} to cart`}
                  >
                    <ShoppingCart size={18} aria-hidden="true" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => commitSearch(value)}
                className="mt-2 w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-green-800 hover:bg-green-50"
              >
                See all results for “{value.trim()}”
              </button>
            </section>
          ) : (
            <>
              {history.length > 0 && (
                <section aria-label="Recent searches">
                  <div className="flex items-center justify-between px-2 pb-2">
                    <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-500">
                      <Clock3 size={14} aria-hidden="true" /> Recent searches
                    </p>
                    <button
                      type="button"
                      onClick={clearSearchHistory}
                      className="text-xs font-semibold text-green-800 hover:underline"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 pb-3">
                    {history.slice(0, 5).map((query) => (
                      <button
                        key={query}
                        type="button"
                        onClick={() => commitSearch(query)}
                        className="rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-700 hover:bg-green-50 hover:text-green-800"
                      >
                        {query}
                      </button>
                    ))}
                  </div>
                </section>
              )}
              <section aria-label="Trending searches">
                <p className="flex items-center gap-1.5 px-2 pb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                  <TrendingUp size={14} aria-hidden="true" /> Trending searches
                </p>
                <div className="flex flex-wrap gap-2">
                  {trending.map((query) => (
                    <button
                      key={query}
                      type="button"
                      onClick={() => commitSearch(query)}
                      className="rounded-full bg-green-50 px-3 py-1.5 text-sm font-medium text-green-800 hover:bg-green-100"
                    >
                      {query}
                    </button>
                  ))}
                </div>
              </section>
            </>
          )}
        </div>
      )}
    </div>
  )
}
