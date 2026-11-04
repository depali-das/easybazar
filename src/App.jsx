import { lazy, Suspense, useEffect, useState } from 'react'
import {
  ShoppingBasket,
  Search,
  ShoppingCart,
  Heart,
  UserRound,
  Package,
  PackageSearch,
  Home,
  LayoutGrid,
  Tag,
  Leaf,
  Menu,
  Plus,
  Minus,
  Truck,
  ShieldCheck,
  Clock,
  BadgeCheck,
  MapPin,
  ChevronRight,
  X,
  Trash2,
} from 'lucide-react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useCart } from './context/CartContext.jsx'
import { useOrders } from './context/OrderContext.jsx'
import Checkout from './components/Checkout.jsx'
import OrderHistory from './components/OrderHistory.jsx'
import Wishlist from './components/Wishlist.jsx'
import AuthDialog from './components/AuthDialog.jsx'
import ProductImage from './components/ProductImage.jsx'
import ProductDetails from './components/ProductDetails.jsx'
import CustomerReviews from './components/CustomerReviews.jsx'
import SmartSearch from './components/SmartSearch.jsx'
import NotificationBell from './components/NotificationBell.jsx'
import FloatingSupport from './components/FloatingSupport.jsx'
import DeliveryAreaChecker from './components/DeliveryAreaChecker.jsx'
import CouponInput from './components/CouponInput.jsx'
import TrackOrder from './pages/TrackOrder.jsx'
import Offers from './pages/Offers.jsx'
import { useDelivery } from './context/DeliveryContext.jsx'
import { useCatalog } from './context/CatalogContext.jsx'
import { CustomerProvider } from './context/CustomerContext.jsx'
import {
  getOrderingStatus,
} from './data/deliveryAreas.js'
import { calculateDiscountTotal, DELIVERY_FEE } from './utils/pricing.js'
import {
  getDemoSession,
  loginDemoAccount,
  logoutDemoAccount,
  registerDemoAccount,
} from './utils/demoAuth.js'
import { searchProducts } from './utils/smartSearch.js'
import { CONTACT_INFO } from './config/contact.js'
import { getCategoryBySlug, getCategoryPath } from './config/seo.js'
import About from './pages/About.jsx'
import FAQ from './pages/FAQ.jsx'

const Contact = lazy(() => import('./pages/Contact.jsx'))
const Support = lazy(() => import('./pages/Support.jsx'))
const MySupportTickets = lazy(() => import('./pages/MySupportTickets.jsx'))
const Notifications = lazy(() => import('./pages/Notifications.jsx'))
const AdminDashboard = lazy(() => import('./pages/AdminDashboard.jsx'))
const AdminLogin = lazy(() => import('./pages/AdminLogin.jsx'))
const AccountDashboard = lazy(() => import('./pages/AccountDashboard.jsx'))

export const CATEGORY_IMAGE_BY_NAME = {
  Vegetables: '/images/vegetables.jpg',
  Fruits: '/images/fruits.jpg',
  Oil: '/images/Cooking%20oil%20and%20spices.jpg',
  Beverages: '/images/Beverages.jpg',
  'Personal care': '/images/Personal%20care.jpg',
  'Household essentials': '/images/Household%20essentials.jpg',
  'Baby care': '/images/Baby%20care.jpg',
  'Rice & Grains': '/images/Rice%20and%20grains.jpg',
  'Bakery and snacks': '/images/Bakery%20and%20snacks.jpg',
  Lentils: '/images/Lentils%20and%20pulses.jpg',
  'Dairy & Eggs': '/images/Milk,%20dairy,%20and%20eggs.jpg',
  'Fish & Meat': '/images/fish%20and%20chicken.jpg',
}

export const categories = [
  { name: 'Vegetables', emoji: '🥦' },
  { name: 'Fruits', emoji: '🍎' },
  { name: 'Rice & Grains', emoji: '🌾' },
  { name: 'Lentils', emoji: '🫘' },
  { name: 'Dairy & Eggs', emoji: '🥚' },
  { name: 'Fish & Meat', emoji: '🐟' },
  { name: 'Oil', emoji: '🫗' },
  { name: 'Groceries', emoji: '🛒' },
  { name: 'Beverages', emoji: '🥤' },
  { name: 'Personal care', emoji: '🧴' },
  { name: 'Household essentials', emoji: '🧹' },
  { name: 'Baby care', emoji: '🍼' },
  { name: 'Bakery and snacks', emoji: '🍞' },
]

const featuredBrands = [
  { name: 'Rupchanda', productName: 'Soybean Tel - Rupchanda Soybean Oil' },
  { name: 'ACI', productName: 'Lobon - ACI Salt' },
]

function App() {
  const { products, categories, settings } = useCatalog()
  const shopCategories = categories
    .filter((category) => category.active)
    .map((category) => ({
      ...category,
      filterCategory: category.name,
    }))
  const activeCategories = categories.filter((category) => category.active)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(() => {
    const categorySlug = window.location.pathname.match(
      /^\/category\/([^/]+)\/?$/,
    )?.[1]
    return getCategoryBySlug(categorySlug)?.name || 'All'
  })
  const [priceSort, setPriceSort] = useState('default')
  const [minimumPrice, setMinimumPrice] = useState('')
  const [maximumPrice, setMaximumPrice] = useState('')
  const [availabilityFilter, setAvailabilityFilter] = useState('all')
  const [cartOpen, setCartOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [account, setAccount] = useState(() => getDemoSession())
  const [adminAuthenticated, setAdminAuthenticated] = useState(false)
  const {
    selectedDistrict,
    selectedLocation,
    isSelectedLocationAvailable,
  } = useDelivery()
  const [currentTime, setCurrentTime] = useState(() => new Date())
  const [offersOnly, setOffersOnly] = useState(false)
  const [wishlistIds, setWishlistIds] = useState(() => {
    try {
      const savedWishlist = JSON.parse(
        localStorage.getItem('easybazar-wishlist') || '[]',
      )
      return Array.isArray(savedWishlist) ? savedWishlist : []
    } catch {
      return []
    }
  })
  const location = useLocation()
  const navigate = useNavigate()
  const {
    cartItems,
    cartCount,
    subtotal,
    deliveryCharge,
    total,
    addToCart,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
    appliedCoupon,
    appliedCouponCode,
    couponDiscount,
    couponError,
    couponMessage,
    applyCoupon,
    removeCoupon,
  } = useCart()
  const orderingStatus = getOrderingStatus(currentTime)
  const { orders } = useOrders()
  const discountTotal = calculateDiscountTotal(cartItems)

  useEffect(() => {
    localStorage.setItem('easybazar-wishlist', JSON.stringify(wishlistIds))
  }, [wishlistIds])

  useEffect(() => {
    const timer = window.setInterval(() => setCurrentTime(new Date()), 15_000)
    return () => window.clearInterval(timer)
  }, [])

  const activeProducts = products.filter((product) => product.active !== false)
  const productSales = new Map()
  orders.forEach((order) => {
    if (order.orderStatus === 'Cancelled') return
    order.items.forEach((item) => {
      const key = String(item.id ?? item.name)
      productSales.set(key, (productSales.get(key) || 0) + Number(item.quantity || 1))
    })
  })
  const wishlistProducts = activeProducts.filter((product) =>
    wishlistIds.includes(product.id),
  )
  const recommendationSignals = [...cartItems, ...wishlistProducts]
  const preferredCategories = [
    ...new Set(recommendationSignals.map((product) => product.category)),
  ]
  const excludedRecommendationIds = new Set(
    recommendationSignals.map((product) => product.id),
  )
  const recommendedProducts = activeProducts
    .filter((product) => !excludedRecommendationIds.has(product.id))
    .sort((first, second) => {
      const firstCategoryRank = preferredCategories.indexOf(first.category)
      const secondCategoryRank = preferredCategories.indexOf(second.category)
      const firstRank =
        firstCategoryRank === -1 ? preferredCategories.length : firstCategoryRank
      const secondRank =
        secondCategoryRank === -1 ? preferredCategories.length : secondCategoryRank
      return firstRank - secondRank
    })
    .slice(0, 4)

  function toggleWishlist(productId) {
    setWishlistIds((currentIds) =>
      currentIds.includes(productId)
        ? currentIds.filter((id) => id !== productId)
        : [...currentIds, productId],
    )
  }

  const filteredProducts = searchProducts(activeProducts, search)
    .filter((product) => {
      const matchesCategory =
        selectedCategory === 'All' || product.category === selectedCategory
      const matchesOffer =
        !(offersOnly || availabilityFilter === 'discounted') ||
        product.originalPrice > product.price
      const matchesAvailability =
        availabilityFilter !== 'available' ||
        !Number.isFinite(product.stock) ||
        product.stock > 0
      const matchesMinimumPrice =
        minimumPrice === '' || Number(product.price) >= Number(minimumPrice)
      const matchesMaximumPrice =
        maximumPrice === '' || Number(product.price) <= Number(maximumPrice)
      return matchesCategory && matchesOffer && matchesAvailability &&
        matchesMinimumPrice && matchesMaximumPrice
    })
    .sort((first, second) => {
      if (priceSort === 'low-to-high') return first.price - second.price
      if (priceSort === 'high-to-low') return second.price - first.price
      if (priceSort === 'popular') {
        return (productSales.get(String(second.id)) || 0) - (productSales.get(String(first.id)) || 0)
      }
      if (priceSort === 'recent') {
        const getAddedTime = (product) => {
          const date = new Date(product.createdAtISO || product.createdAt || 0).getTime()
          return Number.isNaN(date) || date === 0 ? Number(product.id) || 0 : date
        }
        return getAddedTime(second) - getAddedTime(first)
      }
      return 0
    })
  const flashSaleProducts = activeProducts.filter(
    (product) =>
      Number.isFinite(product.price) &&
      Number.isFinite(product.originalPrice) &&
      product.originalPrice > product.price,
  )

  function showFlashSale() {
    setOffersOnly(false)
    document.getElementById('flash-sale')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function openCategory(category) {
    setSelectedCategory(category)
    setOffersOnly(false)
    setMenuOpen(false)
    setAccountOpen(false)
    navigate(getCategoryPath(category))
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })
  }

  function showOffers() {
    const nextOffersOnly = !offersOnly
    setSelectedCategory('All')
    setAvailabilityFilter('all')
    setOffersOnly(nextOffersOnly)
    setMenuOpen(false)
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })
  }

  function showCategories() {
    setSelectedCategory('All')
    setOffersOnly(false)
    setAvailabilityFilter('all')
    setMenuOpen(false)
    document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' })
  }

  function goHome() {
    setSearch('')
    setSelectedCategory('All')
    setAvailabilityFilter('all')
    setOffersOnly(false)
    setMenuOpen(false)
    setAccountOpen(false)
    navigate('/')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  useEffect(() => {
    if (!cartOpen && !accountOpen && !authOpen) return undefined
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') {
        setCartOpen(false)
        setAccountOpen(false)
        setAuthOpen(false)
      }
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [cartOpen, accountOpen, authOpen])

  async function handleAuthenticate(mode, form) {
    const authenticatedAccount =
      mode === 'signup'
        ? await registerDemoAccount(form)
        : await loginDemoAccount(form)
    setAccount(authenticatedAccount)
    setAccountOpen(false)
  }

  function handleLogout() {
    logoutDemoAccount()
    setAccount(null)
    setAccountOpen(false)
  }

  if (location.pathname === '/checkout') {
    return (
      <>
        <Checkout
          onBack={() => navigate('/')}
          onTrack={(orderId) => navigate(`/track-order?orderId=${encodeURIComponent(orderId)}`)}
        />
        <FloatingSupport />
      </>
    )
  }

  if (location.pathname === '/track-order') {
    return <><TrackOrder /><FloatingSupport /></>
  }

  if (location.pathname === '/offers') {
    return <><Offers /><FloatingSupport /></>
  }

  if (location.pathname === '/contact') {
    return <Suspense fallback={<SupportPageLoading />}><Contact /><FloatingSupport /></Suspense>
  }

  if (location.pathname === '/about') {
    return <About />
  }

  if (location.pathname === '/faq') {
    return <FAQ />
  }

  if (location.pathname === '/support') {
    return (
      <Suspense fallback={<SupportPageLoading />}>
        <Support account={account} onSignIn={() => setAuthOpen(true)} />
        {authOpen && <AuthDialog onClose={() => setAuthOpen(false)} onAuthenticate={handleAuthenticate} />}
        <FloatingSupport />
      </Suspense>
    )
  }

  if (location.pathname === '/support/tickets') {
    return (
      <Suspense fallback={<SupportPageLoading />}>
        <MySupportTickets account={account} onSignIn={() => setAuthOpen(true)} />
        {authOpen && <AuthDialog onClose={() => setAuthOpen(false)} onAuthenticate={handleAuthenticate} />}
        <FloatingSupport />
      </Suspense>
    )
  }

  if (location.pathname === '/notifications') {
    return <Suspense fallback={<SupportPageLoading />}><Notifications /><FloatingSupport /></Suspense>
  }

  if (location.pathname === '/admin-orders') {
    return <Navigate to="/admin/orders" replace />
  }

  if (location.pathname === '/admin/login') {
    if (adminAuthenticated) return <Navigate to="/admin" replace />
    return (
      <Suspense fallback={<SupportPageLoading />}>
        <AdminLogin onAuthenticated={() => { setAdminAuthenticated(true); navigate('/admin') }} />
      </Suspense>
    )
  }

  if (location.pathname === '/admin' || location.pathname.startsWith('/admin/')) {
    if (!adminAuthenticated) return <Navigate to="/admin/login" replace />
    return (
      <Suspense fallback={<SupportPageLoading />}>
        <AdminDashboard onLogout={() => { setAdminAuthenticated(false); navigate('/') }} />
      </Suspense>
    )
  }

  if (location.pathname === '/account') {
    return (
      <CustomerProvider key={account?.customerId || 'guest'} account={account}>
        <Suspense fallback={<SupportPageLoading />}>
          <AccountDashboard
            account={account}
            onSignIn={() => setAuthOpen(true)}
            onLogout={handleLogout}
          />
        </Suspense>
        {authOpen && <AuthDialog onClose={() => setAuthOpen(false)} onAuthenticate={handleAuthenticate} />}
        <FloatingSupport />
      </CustomerProvider>
    )
  }

  if (location.pathname === '/orders') {
    return (
      <>
        <OrderHistory
          account={account}
          onBack={() => navigate('/')}
          onTrack={(orderId) => navigate(`/track-order?orderId=${encodeURIComponent(orderId)}`)}
          onNeedHelp={(orderId) => navigate(`/support?orderId=${encodeURIComponent(orderId)}&category=${encodeURIComponent('Order Problem')}`)}
        />
        <FloatingSupport />
      </>
    )
  }

  if (location.pathname === '/wishlist') {
    return (
      <>
        <Wishlist
          items={wishlistProducts}
          onBack={() => navigate('/')}
          onRemove={toggleWishlist}
          onAddToCart={addToCart}
          onViewProduct={(product) => navigate(`/products/${product.id}`)}
        />
        <FloatingSupport />
      </>
    )
  }

  const productDetailsMatch = location.pathname.match(/^\/products\/([^/]+)\/?$/)
  if (productDetailsMatch) {
    const product = activeProducts.find((item) => item.id === Number(productDetailsMatch[1]))
    if (!product) {
      return (
        <main className="min-h-screen bg-[#f8faf7] px-4 py-12">
          <section className="mx-auto max-w-xl rounded-3xl bg-white p-8 text-center shadow-sm">
            <h1 className="text-2xl font-bold text-slate-900">Product not found</h1>
            <p className="mt-2 text-slate-600">This product may have been removed from the catalog.</p>
            <button type="button" onClick={() => navigate('/')} className="mt-5 rounded-xl bg-green-700 px-5 py-3 font-semibold text-white hover:bg-green-800">Back to EasyBazar</button>
          </section>
        </main>
      )
    }
    return (
      <>
        <ProductDetails
          key={product.id}
          product={product}
          products={products}
          wishlistIds={wishlistIds}
          onBack={() => { navigate('/'); window.setTimeout(() => document.getElementById('products')?.scrollIntoView(), 0) }}
          onViewCategory={(category) => {
            setSearch(''); setSelectedCategory(category); setOffersOnly(false); navigate('/'); window.setTimeout(() => document.getElementById('products')?.scrollIntoView(), 0)
          }}
          onAddToCart={addToCart}
          onBuyNow={(selectedProduct, quantity) => { addToCart(selectedProduct, quantity); navigate('/checkout') }}
          onToggleWishlist={toggleWishlist}
          onViewProduct={(selectedProduct) => navigate(`/products/${selectedProduct.id}`)}
          account={account}
          onSignIn={() => setAuthOpen(true)}
        />
        {authOpen && <AuthDialog onClose={() => setAuthOpen(false)} onAuthenticate={handleAuthenticate} />}
        <FloatingSupport />
      </>
    )
  }

  const categoryPathMatch = location.pathname.match(
    /^\/category\/([^/]+)\/?$/,
  )
  const isPublicCatalogRoute =
    ['/', '/shop', '/products', '/categories'].includes(location.pathname) ||
    (categoryPathMatch &&
      activeCategories.some(
        (category) =>
          category.name === getCategoryBySlug(categoryPathMatch[1])?.name,
      ))
  if (!isPublicCatalogRoute) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f8faf7] p-6">
        <section className="max-w-lg rounded-3xl bg-white p-8 text-center shadow-sm">
          <h1 className="text-3xl font-extrabold text-slate-900">Page not found</h1>
          <p className="mt-3 text-slate-600">
            This page is not available. Return to EasyBazar to continue shopping.
          </p>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="mt-6 rounded-xl bg-green-700 px-5 py-3 font-semibold text-white hover:bg-green-800"
          >
            Back to EasyBazar
          </button>
        </section>
      </main>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8faf7] text-gray-800">
      <div className="store-announcement flex flex-wrap items-center justify-center gap-x-3 gap-y-1 px-4 py-2 text-center text-xs font-medium text-white sm:text-sm">
        <span>Fresh Groceries Delivered to Your Doorstep</span>
        <span className="hidden text-white/80 sm:inline" aria-hidden="true">•</span>
        <span>Delivery ৳{DELIVERY_FEE} · Free on ৳{CONTACT_INFO.freeDeliveryMinimum}+ orders</span>
      </div>

      <header className="store-header sticky top-0 z-30 border-b border-slate-100 bg-white">
        <div className="mx-auto flex max-w-7xl items-center gap-1 px-3 py-3 sm:gap-3 sm:px-5 lg:gap-5 lg:py-4">
          <button
            type="button"
            className="header-icon-button rounded-xl p-2 hover:bg-slate-100 lg:hidden"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-category-menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
          </button>

          <button type="button" onClick={goHome} className="flex min-w-0 shrink-0 items-center gap-2 text-left" aria-label="EasyBazar home">
            <span className="brand-mark overflow-hidden rounded-xl bg-green-700 p-1.5 sm:p-2"><img src="/images/easybazar-logo-mark.png" alt="" className="h-8 w-8 object-contain sm:h-9 sm:w-9" /></span>
            <span className="leading-tight">
              <span className="block text-sm font-extrabold tracking-tight text-slate-900 sm:text-xl">{settings.storeName || 'EasyBazar'}</span>
              <span className="hidden whitespace-nowrap text-[9px] font-medium leading-tight text-slate-500 sm:block sm:text-[11px]">সহজ বাজার, ঘরে ঘরে।</span>
            </span>
          </button>

          <div className="hidden lg:block">
            <DeliveryAreaChecker compact />
          </div>

          <SmartSearch
            products={activeProducts}
            value={search}
            onChange={setSearch}
            onSearch={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
            onSelectProduct={(product) => navigate(`/products/${product.id}`)}
            onAddToCart={addToCart}
            className="hidden md:flex"
          />

          <div className="header-actions ml-auto flex shrink-0 items-center gap-0.5 sm:gap-2">
            <div className="account-menu-wrap relative">
              <button
                type="button"
                aria-label={account?.name ? `${account.name} - open account menu` : 'Open account menu'}
                className="header-action-button flex items-center gap-2 rounded-xl px-1 py-2 text-slate-700 hover:bg-slate-50 sm:px-2"
                onClick={() => setAccountOpen((open) => !open)}
                aria-expanded={accountOpen}
                aria-haspopup="menu"
              >
                <UserRound size={20} aria-hidden="true" />
                <span className="hidden max-w-28 truncate text-sm font-semibold lg:inline">{account?.name || 'Account'}</span>
              </button>
              {accountOpen && (
                <div role="menu" className="account-popover absolute right-0 top-full z-50 mt-3 w-64 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
                  {account ? (
                    <>
                      <p className="font-semibold text-slate-900">{account.name}</p>
                      <p className="mt-1 break-all text-sm leading-5 text-slate-600">{account.email}</p>
                      <button type="button" role="menuitem" onClick={() => { setAccountOpen(false); navigate('/account') }} className="mt-3 flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm font-semibold text-green-800 hover:bg-green-50"><UserRound size={17} aria-hidden="true" /> My account</button>
                      <button type="button" role="menuitem" onClick={() => { setAccountOpen(false); navigate('/orders') }} className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm font-semibold text-green-800 hover:bg-green-50"><Package size={17} aria-hidden="true" /> View my orders</button>
                      <button type="button" role="menuitem" onClick={handleLogout} className="mt-1 w-full rounded-lg px-2 py-2 text-left text-sm font-semibold text-red-600 hover:bg-red-50">Log out</button>
                    </>
                  ) : (
                    <>
                      <p className="font-semibold text-slate-900">Welcome to EasyBazar</p>
                      <p className="mt-1 text-sm leading-5 text-slate-600">Sign in or create a demo account.</p>
                      <button type="button" role="menuitem" onClick={() => { setAccountOpen(false); setAuthOpen(true) }} className="mt-3 w-full rounded-lg bg-green-700 px-3 py-2 text-sm font-semibold text-white hover:bg-green-800">Log in / Sign up</button>
                    </>
                  )}
                </div>
              )}
            </div>

            <button type="button" className="header-action-button hidden items-center gap-2 rounded-xl px-2 py-2 text-slate-700 hover:bg-slate-50 sm:flex" onClick={() => navigate('/orders')} aria-label="Open My Orders"><Package size={20} aria-hidden="true" /><span className="hidden text-sm font-semibold lg:inline">My Orders</span></button>

            <button type="button" className="header-action-button hidden items-center gap-2 rounded-xl px-2 py-2 text-slate-700 hover:bg-slate-50 sm:flex" onClick={() => navigate('/wishlist')} aria-label={`Open wishlist, ${wishlistIds.length} items`}><Heart size={20} aria-hidden="true" /><span className="hidden text-sm font-semibold xl:inline">Wishlist ({wishlistIds.length})</span></button>

            <NotificationBell />

            <button type="button" className="header-cart-button relative flex shrink-0 items-center gap-2 rounded-xl bg-green-700 px-1.5 py-2.5 font-semibold text-white hover:bg-green-800 sm:px-3.5" onClick={() => setCartOpen(true)} aria-label={`Open cart, ${cartCount} items`}><ShoppingCart size={20} aria-hidden="true" /><span className="hidden text-sm sm:inline">Cart</span><span className="cart-count-badge min-w-5 rounded-full bg-white px-1.5 py-0.5 text-center text-xs font-bold text-green-800">{cartCount}</span></button>
          </div>
        </div>

        <div className="border-t border-slate-100 px-3 py-2 lg:hidden">
          <div className="mx-auto max-w-7xl"><DeliveryAreaChecker compact /></div>
        </div>

        <div className="mobile-search border-t border-slate-100 px-3 py-2.5 md:hidden">
          <SmartSearch
            products={activeProducts}
            value={search}
            onChange={setSearch}
            onSearch={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
            onSelectProduct={(product) => navigate(`/products/${product.id}`)}
            onAddToCart={addToCart}
            mobile
          />
        </div>

        <nav aria-label="Main navigation" className="desktop-category-nav hidden border-t border-slate-100 md:block">
          <div className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-5 py-2">
            <button type="button" onClick={goHome} className="category-nav-link"><Home size={16} aria-hidden="true" /> Home</button>
            <button type="button" onClick={showCategories} className="category-nav-link"><LayoutGrid size={16} aria-hidden="true" /> All Categories</button>
            <button type="button" onClick={() => navigate('/track-order')} className="category-nav-link"><PackageSearch size={16} aria-hidden="true" /> Track Order</button>
            {activeCategories.map((category) => (<button type="button" key={category.name} onClick={() => openCategory(category.name)} className={`category-nav-link ${selectedCategory === category.name && !offersOnly ? 'category-nav-link-active' : ''}`} aria-pressed={selectedCategory === category.name && !offersOnly}>{category.name}</button>))}
            <button type="button" onClick={showOffers} className={`category-nav-link ${offersOnly ? 'category-nav-link-active' : ''}`} aria-pressed={offersOnly}><Tag size={16} aria-hidden="true" /> Offers</button>
            <button type="button" onClick={() => navigate('/offers')} className="category-nav-link"><Tag size={16} aria-hidden="true" /> Promo Codes</button>
            <button type="button" onClick={showFlashSale} className="category-nav-link"><Tag size={16} aria-hidden="true" /> Flash Sale</button>
          </div>
        </nav>
      </header>

      {menuOpen && (
        <nav id="mobile-category-menu" aria-label="Mobile category menu" className="mobile-category-menu border-b border-green-100 bg-white px-4 py-4 shadow-sm lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-2">
            <button type="button" onClick={goHome} className="rounded-xl px-3 py-3 text-left font-semibold text-slate-800 hover:bg-green-50">Home</button>
            <button type="button" onClick={showCategories} className="rounded-xl px-3 py-3 text-left font-semibold text-slate-800 hover:bg-green-50">All Categories</button>
            <button type="button" onClick={showOffers} className="rounded-xl px-3 py-3 text-left font-semibold text-slate-800 hover:bg-green-50">Offers</button>
            <button type="button" onClick={() => { setMenuOpen(false); navigate('/offers') }} className="rounded-xl px-3 py-3 text-left font-semibold text-green-800 hover:bg-green-50">Promo Codes & Coupons</button>
            <button type="button" onClick={() => { setMenuOpen(false); showFlashSale() }} className="rounded-xl px-3 py-3 text-left font-semibold text-slate-800 hover:bg-green-50">Flash Sale</button>
            <button type="button" onClick={() => { setMenuOpen(false); navigate('/track-order') }} className="rounded-xl px-3 py-3 text-left font-semibold text-slate-800 hover:bg-green-50">Track Order</button>
            <div className="grid grid-cols-2 gap-2 border-t border-gray-100 pt-3">
              {activeCategories.map((category) => (<button key={category.name} onClick={() => openCategory(category.name)} className="rounded-xl px-3 py-2 text-left text-sm text-slate-700 hover:bg-green-50 hover:text-green-800">{category.emoji} {category.name}</button>))}
            </div>
          </div>
        </nav>
      )}

      <nav aria-label="Mobile navigation" className="mobile-bottom-nav fixed inset-x-0 bottom-0 z-30 grid grid-cols-6 border-t border-slate-200 bg-white/95 px-1 pb-[env(safe-area-inset-bottom)] shadow-[0_-6px_24px_rgba(15,23,42,0.08)] backdrop-blur md:hidden">
        <button type="button" onClick={goHome} className="mobile-nav-link" aria-label="Home"><Home size={20} aria-hidden="true" /><span>Home</span></button>
        <button type="button" onClick={showCategories} className="mobile-nav-link" aria-label="Categories"><LayoutGrid size={20} aria-hidden="true" /><span>Categories</span></button>
        <button type="button" onClick={() => navigate('/wishlist')} className="mobile-nav-link" aria-label={`Wishlist, ${wishlistIds.length} items`}><Heart size={20} aria-hidden="true" /><span>Wishlist {wishlistIds.length > 0 && `(${wishlistIds.length})`}</span></button>
        <button type="button" onClick={() => navigate('/orders')} className="mobile-nav-link" aria-label="My Orders"><Package size={20} aria-hidden="true" /><span>My Orders</span></button>
        <button type="button" onClick={() => navigate('/track-order')} className="mobile-nav-link" aria-label="Track Order"><PackageSearch size={20} aria-hidden="true" /><span>Track</span></button>
        <button type="button" onClick={() => setCartOpen(true)} className="mobile-nav-link relative" aria-label={`Cart, ${cartCount} items`}><span className="mobile-cart-icon"><ShoppingCart size={20} aria-hidden="true" /><span>{cartCount}</span></span><span>Cart</span></button>
      </nav>

      {cartOpen && (
        <div className="fixed inset-0 z-50">
          <button className="absolute inset-0 h-full w-full bg-black/40" onClick={() => setCartOpen(false)} aria-label="Close cart overlay" />
          <aside role="dialog" aria-modal="true" aria-labelledby="cart-title" className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b p-5">
              <div><h2 id="cart-title" className="text-xl font-extrabold">Your Shopping Cart</h2><p className="mt-1 text-sm text-slate-600">{cartCount} item(s) in your cart</p></div>
              <button onClick={() => setCartOpen(false)} className="rounded-lg p-2 hover:bg-gray-100" aria-label="Close cart"><X size={22} aria-hidden="true" /></button>
            </div>
            {cartItems.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
                <ShoppingBasket size={56} className="text-green-700" aria-hidden="true" />
                <h3 className="mt-4 text-lg font-bold">Your cart is empty</h3>
                <p className="mt-2 text-sm text-slate-600">Add some fresh groceries to get started.</p>
                <p className="mt-4 rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-800">Delivery Fee: ৳{deliveryCharge}</p>
                <button onClick={() => setCartOpen(false)} className="mt-5 rounded-xl bg-green-700 px-5 py-3 font-semibold text-white hover:bg-green-800">Continue Shopping</button>
              </div>
            ) : (
              <>
                <div className="flex-1 space-y-4 overflow-y-auto p-5">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-3 border-b border-gray-100 pb-4">
                      <ProductImage src={item.image} alt={item.name} className="h-20 w-20 rounded-xl bg-gray-50 object-cover" />
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold">{item.name}</h3>
                        <p className="mt-1 text-sm text-slate-600">৳{item.price} / {item.unit}</p>
                        <div className="mt-3 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-3 rounded-lg border px-2 py-1">
                            <button onClick={() => decreaseQuantity(item.id)} className="p-1 hover:text-green-700" aria-label={`Decrease ${item.name} quantity`}><Minus size={16} aria-hidden="true" /></button>
                            <span className="min-w-4 text-center text-sm font-bold">{item.quantity}</span>
                            <button onClick={() => increaseQuantity(item.id)} className="p-1 hover:text-green-700 disabled:cursor-not-allowed disabled:opacity-40" aria-label={`Increase ${item.name} quantity`} disabled={item.quantity >= (item.stock ?? 99)}><Plus size={16} aria-hidden="true" /></button>
                          </div>
                          <span className="font-bold">৳{item.price * item.quantity}</span>
                        </div>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="self-start rounded-lg p-2 text-red-600 hover:bg-red-50" aria-label={`Remove ${item.name} from cart`}><Trash2 size={18} aria-hidden="true" /></button>
                    </div>
                  ))}
                </div>
                <div className="border-t bg-white p-5">
                  <DeliveryAreaChecker compact />
                  <div className={`mb-4 rounded-xl px-4 py-3 text-sm ${isSelectedLocationAvailable ? 'bg-green-50 text-green-900' : 'bg-amber-50 text-amber-900'}`}>
                    {isSelectedLocationAvailable
                      ? <>Delivering to {selectedLocation}, {selectedDistrict}.</>
                      : <>Delivery is unavailable for {selectedLocation || 'your selected location'}, {selectedDistrict}. Check an available area in the homepage or header.</>}
                  </div>
                  <CouponInput
                    appliedCoupon={appliedCoupon}
                    appliedCouponCode={appliedCouponCode}
                    couponError={couponError}
                    couponMessage={couponMessage}
                    couponDiscount={couponDiscount}
                    onApply={applyCoupon}
                    onRemove={removeCoupon}
                    onShowOffers={() => navigate('/offers')}
                  />
                  <div className="flex items-center justify-between text-lg font-extrabold"><span>{discountTotal > 0 ? 'Items subtotal' : 'Subtotal'}</span><span>৳{subtotal + discountTotal}</span></div>
                  {discountTotal > 0 && (<><div className="mt-2 flex items-center justify-between text-sm text-green-700"><span>Product discounts</span><span>−৳{discountTotal}</span></div><div className="mt-2 flex items-center justify-between text-sm text-slate-600"><span>Subtotal after discounts</span><span>৳{subtotal}</span></div></>)}
                  {appliedCouponCode && appliedCoupon && <div className="mt-2 flex items-center justify-between text-sm font-semibold text-green-800"><span>Coupon ({appliedCoupon.code})</span><span>−৳{couponDiscount}</span></div>}
                  <div className="mt-2 flex items-center justify-between text-sm text-slate-600"><span>Delivery Fee</span><span>৳{deliveryCharge}</span></div>
                  <div className="mt-3 flex items-center justify-between border-t pt-3 font-extrabold"><span>Total</span><span className="text-green-800">৳{total}</span></div>
                  {!orderingStatus.isOpen && (<p className="mt-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">{orderingStatus.message}</p>)}
                  <button onClick={() => { setCartOpen(false); navigate('/checkout') }} disabled={cartItems.length === 0 || !orderingStatus.isOpen || !isSelectedLocationAvailable} className="mt-4 w-full rounded-xl bg-green-700 px-5 py-3 font-bold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50">Proceed to Checkout</button>
                  <button onClick={clearCart} className="mt-3 w-full rounded-xl border border-red-200 px-5 py-3 font-semibold text-red-600 hover:bg-red-50">Clear Cart</button>
                </div>
              </>
            )}
          </aside>
        </div>
      )}

      {authOpen && (<AuthDialog onClose={() => setAuthOpen(false)} onAuthenticate={handleAuthenticate} />)}

      <main className="mx-auto max-w-7xl px-4 pb-24 pt-6 md:px-5 md:py-8">
        <section className="hero-banner">
          <div className="hero-copy">
            <span className="hero-eyebrow"><Leaf size={16} aria-hidden="true" />Freshness you can trust</span>
            <h1 className="hero-title">Fresh Vegetables<span>Delivered Daily</span></h1>
            <p className="hero-description">Farm-fresh produce sourced from local Bangladeshi farms.<br className="hidden sm:block" /> Choose your Rajshahi area and check delivery availability below.</p>
            <a href="#products" className="hero-button" aria-label="Shop now, go to products">Shop Now<ChevronRight size={24} strokeWidth={3} aria-hidden="true" /></a>
            <div className="hero-benefits">
              <div className="hero-benefit"><BadgeCheck size={22} aria-hidden="true" /><span>Delivery ৳{DELIVERY_FEE}<br />Free on ৳{CONTACT_INFO.freeDeliveryMinimum}+ orders</span></div>
              <div className="hero-benefit"><Leaf size={22} aria-hidden="true" /><span>Fresh Daily ·<br />Quality Guaranteed</span></div>
              <div className="hero-benefit"><MapPin size={22} aria-hidden="true" /><span>Delivery area<br />Rajshahi only</span></div>
            </div>
          </div>
          <div className="hero-art"><ProductImage src="/images/fallback.jpg" alt="A reusable EasyBazar bag filled with fresh vegetables" className="hero-image" loading="eager" width={960} height={640} /></div>
        </section>

        <section id="flash-sale" aria-labelledby="flash-sale-title" className="mt-8 scroll-mt-32 overflow-hidden rounded-3xl border border-orange-200 bg-linear-to-br from-orange-50 via-white to-rose-50 p-5 shadow-sm sm:p-7">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div><p className="text-sm font-bold uppercase tracking-widest text-orange-700">Special prices</p><h2 id="flash-sale-title" className="mt-1 text-2xl font-extrabold text-slate-900 sm:text-3xl">Flash Sale</h2><p className="mt-1 text-slate-600">Save on selected groceries with reduced prices.</p></div>
            {flashSaleProducts.length > 0 && (<button type="button" onClick={() => { setSearch(''); setSelectedCategory('All'); setOffersOnly(true); document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' }) }} className="rounded-xl border border-orange-300 bg-white px-4 py-2.5 text-sm font-semibold text-orange-800 transition hover:bg-orange-100 focus:outline-none focus:ring-4 focus:ring-orange-100">See all offers</button>)}
          </div>
          {flashSaleProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {flashSaleProducts.map((product) => {
                const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
                return (
                  <article key={product.id} className="store-product-card group flex h-full flex-col overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg">
                    <div className="store-product-visual relative aspect-4/3 overflow-hidden bg-linear-to-br from-orange-50 to-gray-100">
                      <button type="button" onClick={() => navigate(`/products/${product.id}`)} aria-label={`View ${product.name} details`} className="h-full w-full focus:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-orange-300"><ProductImage src={product.image} alt={product.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" /></button>
                      <span className="absolute left-3 top-3 rounded-full bg-red-600 px-2.5 py-1 text-xs font-bold text-white shadow-sm">{discount}% OFF</span>
                      <button type="button" onClick={() => toggleWishlist(product.id)} aria-label={`${wishlistIds.includes(product.id) ? 'Remove' : 'Add'} ${product.name} ${wishlistIds.includes(product.id) ? 'from' : 'to'} wishlist`} aria-pressed={wishlistIds.includes(product.id)} className={`absolute right-3 top-3 rounded-full bg-white/95 p-2 shadow-md transition hover:text-red-600 focus:outline-none focus:ring-4 focus:ring-red-100 ${wishlistIds.includes(product.id) ? 'text-red-600' : 'text-slate-600'}`}><Heart size={19} aria-hidden="true" fill={wishlistIds.includes(product.id) ? 'currentColor' : 'none'} /></button>
                    </div>
                    <div className="flex flex-1 flex-col p-4">
                      <p className="text-xs font-medium text-green-700">{product.category}</p>
                      <button type="button" onClick={() => navigate(`/products/${product.id}`)} className="product-title mt-1 min-h-10 self-start text-left font-bold text-slate-900 hover:text-green-800 focus:outline-none focus-visible:underline">{product.name}</button>
                      <p className="mt-1 text-sm text-slate-600">{product.unit}</p>
                      <div className="mt-auto flex items-end justify-between gap-2 pt-3">
                        <div><span className="block font-extrabold text-slate-900">৳{product.price}</span><span className="text-xs text-slate-600 line-through">৳{product.originalPrice}</span></div>
                        <button type="button" onClick={() => addToCart(product)} disabled={product.stock === 0} aria-label={`Add ${product.name} to cart`} className="inline-flex items-center gap-1.5 rounded-lg bg-green-700 px-3 py-2 text-sm font-semibold text-white transition hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-200 disabled:cursor-not-allowed disabled:opacity-50"><Plus size={18} aria-hidden="true" /><span className="hidden sm:inline">{product.stock === 0 ? 'Out of stock' : 'Add'}</span></button>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          ) : (<p className="rounded-2xl border border-dashed border-orange-200 bg-white/70 p-6 text-center text-slate-600">No discounted products are available right now. Check back soon.</p>)}
        </section>

        <DeliveryAreaChecker />

        <section id="categories" className="category-section py-12">
          <div className="mb-6"><p className="text-sm font-bold uppercase tracking-widest text-green-700">Explore</p><h2 className="mt-1 text-2xl font-extrabold">Shop by category</h2></div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7">
            {shopCategories.map((category) => {
              return (
                <Link
                  key={category.name}
                  to={getCategoryPath(category.name)}
                  onClick={() => {
                    setSelectedCategory(category.name)
                    setOffersOnly(false)
                    setMenuOpen(false)
                  }}
                  aria-current={selectedCategory === category.name ? 'page' : undefined}
                  className={`category-tile group rounded-2xl border p-3 text-center transition ${
                    selectedCategory === category.name
                      ? 'border-green-500 bg-green-50 shadow-sm'
                      : 'border-gray-100 bg-white hover:-translate-y-1 hover:border-green-300 hover:shadow-md'
                  }`}
                >
                  <ProductImage
                    src={category.image}
                    alt={`${category.name} groceries`}
                    className="category-tile-image aspect-4/3 w-full rounded-xl object-cover"
                  />
                  <span className="mt-2 block min-h-10 text-sm font-semibold leading-5 text-slate-800">
                    {category.name}
                  </span>
                </Link>
              )
            })}
          </div>
        </section>

        <section aria-labelledby="our-brands-title" className="py-10">
          <div className="mb-6"><p className="text-sm font-bold uppercase tracking-widest text-green-700">Explore trusted names</p><h2 id="our-brands-title" className="mt-1 text-2xl font-extrabold text-slate-900">Our Brands</h2><p className="mt-1 text-slate-600">Shop brands currently featured in our grocery catalog.</p></div>
          <div className="grid gap-4 sm:grid-cols-2">
            {featuredBrands.map((brand) => {
              const product = products.find((item) => item.name === brand.productName)
              if (!product) return null
              return (<button key={brand.name} type="button" onClick={() => navigate(`/products/${product.id}`)} aria-label={`Shop ${brand.name}: ${product.name}`} className="group relative flex min-h-44 items-center justify-between gap-5 overflow-hidden rounded-3xl border border-green-100 bg-linear-to-br from-white to-green-50 p-5 text-left shadow-sm transition hover:-translate-y-1 hover:border-green-300 hover:shadow-lg focus:outline-none focus-visible:ring-4 focus-visible:ring-green-200 sm:p-7"><span className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full bg-green-100/70 transition-transform duration-300 group-hover:scale-125" aria-hidden="true" /><span className="relative z-10 min-w-0"><span className="inline-flex rounded-full bg-green-700 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">Our Brands</span><span className="mt-3 block text-2xl font-extrabold text-slate-900 sm:text-3xl">{brand.name}</span><span className="mt-1 block text-sm text-slate-600">{product.name}</span><span className="mt-4 inline-flex items-center gap-1 font-semibold text-green-800">Shop {brand.name}<ChevronRight size={18} aria-hidden="true" className="transition-transform group-hover:translate-x-1" /></span></span><ProductImage src={product.image} alt={product.name} className="relative z-10 h-24 w-24 shrink-0 rounded-2xl bg-white object-cover shadow-sm transition-transform duration-300 group-hover:scale-105 sm:h-32 sm:w-32" /></button>)
            })}
          </div>
        </section>

        <section aria-labelledby="just-for-you-title" className="py-10">
          <div className="mb-6"><p className="text-sm font-bold uppercase tracking-widest text-green-700">Recommended for you</p><h2 id="just-for-you-title" className="mt-1 text-2xl font-extrabold text-slate-900">Just For You</h2><p className="mt-1 text-slate-600">{preferredCategories.length > 0 ? `More to explore from ${preferredCategories.slice(0, 2).join(' and ')}.` : 'A few popular picks from our grocery catalog.'}</p></div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {recommendedProducts.map((product) => (
              <article key={product.id} className="store-product-card group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg">
                <div className="store-product-visual relative aspect-4/3 overflow-hidden bg-linear-to-br from-green-50 to-gray-100">
                  <button type="button" onClick={() => navigate(`/products/${product.id}`)} aria-label={`View ${product.name} details`} className="h-full w-full focus:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-green-300"><ProductImage src={product.image} alt={product.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" /></button>
                  <button type="button" onClick={() => toggleWishlist(product.id)} aria-label={`${wishlistIds.includes(product.id) ? 'Remove' : 'Add'} ${product.name} ${wishlistIds.includes(product.id) ? 'from' : 'to'} wishlist`} aria-pressed={wishlistIds.includes(product.id)} className={`absolute right-3 top-3 rounded-full bg-white/95 p-2 shadow-md transition hover:text-red-600 focus:outline-none focus:ring-4 focus:ring-red-100 ${wishlistIds.includes(product.id) ? 'text-red-600' : 'text-slate-600'}`}><Heart size={19} aria-hidden="true" fill={wishlistIds.includes(product.id) ? 'currentColor' : 'none'} /></button>
                  {product.originalPrice > product.price && (<span className="absolute left-3 top-3 rounded-full bg-red-600 px-2.5 py-1 text-xs font-bold text-white shadow-sm">{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF</span>)}
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <p className="text-xs font-medium text-green-700">{product.category}</p>
                  <button type="button" onClick={() => navigate(`/products/${product.id}`)} className="product-title mt-1 min-h-10 self-start text-left font-bold text-slate-900 hover:text-green-800 focus:outline-none focus-visible:underline">{product.name}</button>
                  <p className="mt-1 text-sm text-slate-600">{product.unit}</p>
                  <div className="mt-auto flex items-end justify-between gap-2 pt-3">
                    <div><span className="block font-extrabold text-slate-900">৳{product.price}</span>{product.originalPrice > product.price && (<span className="text-xs text-slate-600 line-through">৳{product.originalPrice}</span>)}</div>
                    <button type="button" onClick={() => addToCart(product)} disabled={product.stock === 0} aria-label={`Add ${product.name} to cart`} className="inline-flex items-center gap-1.5 rounded-lg bg-green-700 px-3 py-2 text-sm font-semibold text-white transition hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-200 disabled:cursor-not-allowed disabled:opacity-50"><Plus size={18} aria-hidden="true" /><span className="hidden sm:inline">{product.stock === 0 ? 'Out of stock' : 'Add'}</span></button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <CustomerReviews products={products} />

        <section className="grid gap-4 sm:grid-cols-3">
          {[{ icon: <Truck size={24} aria-hidden="true" />, title: 'Convenient shopping', text: 'Browse everyday essentials' }, { icon: <ShieldCheck size={24} aria-hidden="true" />, title: 'Shop with confidence', text: 'Clear product prices' }, { icon: <Clock size={24} aria-hidden="true" />, title: 'Easy ordering', text: 'Shop at your convenience' }].map((feature) => (<div key={feature.title} className="feature-tile flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5"><span className="rounded-xl bg-green-50 p-3 text-green-700">{feature.icon}</span><div><h3 className="font-bold text-slate-900">{feature.title}</h3><p className="mt-1 text-sm text-slate-600">{feature.text}</p></div></div>))}
        </section>

        <section id="products" className="py-12">
          <div className="catalog-toolbar mb-6 flex flex-col gap-4">
            <div><p className="text-sm font-bold uppercase tracking-widest text-green-700">Fresh picks</p><h2 className="mt-1 text-2xl font-extrabold">Popular groceries</h2></div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 lg:items-end">
              <label className="relative block xl:col-span-2"><span className="mb-1.5 block text-sm font-semibold text-slate-700">Search products</span><Search size={18} aria-hidden="true" className="pointer-events-none absolute bottom-3.5 left-3 text-slate-500" /><input name="catalogSearch" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="e.g. tomatoes" aria-label="Search products by name" className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-3 text-sm outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100" /></label>
              <label className="block"><span className="mb-1.5 block text-sm font-semibold text-slate-700">Category</span><select name="catalogCategory" value={selectedCategory} onChange={(event) => setSelectedCategory(event.target.value)} aria-label="Filter by category" className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"><option value="All">All categories</option>{activeCategories.map((category) => (<option key={category.name} value={category.name}>{category.name}</option>))}</select></label>
              <label className="block"><span className="mb-1.5 block text-sm font-semibold text-slate-700">Sort products</span><select name="catalogSort" value={priceSort} onChange={(event) => setPriceSort(event.target.value)} aria-label="Sort products" className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"><option value="default">Featured</option><option value="popular">Popular (order sales)</option><option value="recent">Recently added</option><option value="low-to-high">Price: low to high</option><option value="high-to-low">Price: high to low</option></select></label>
              <label className="block"><span className="mb-1.5 block text-sm font-semibold text-slate-700">Product filter</span><select name="catalogAvailability" value={availabilityFilter} onChange={(event) => setAvailabilityFilter(event.target.value)} aria-label="Filter all, discounted, or available products" className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"><option value="all">All products</option><option value="discounted">Discounted products</option><option value="available">Available products</option></select></label>
              <label className="block"><span className="mb-1.5 block text-sm font-semibold text-slate-700">Min price ৳</span><input name="minimumPrice" type="number" min="0" value={minimumPrice} onChange={(event) => setMinimumPrice(event.target.value)} aria-label="Minimum product price" placeholder="Any" className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100" /></label>
              <label className="block"><span className="mb-1.5 block text-sm font-semibold text-slate-700">Max price ৳</span><input name="maximumPrice" type="number" min="0" value={maximumPrice} onChange={(event) => setMaximumPrice(event.target.value)} aria-label="Maximum product price" placeholder="Any" className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100" /></label>
              <div className="flex items-center justify-between gap-3 lg:col-span-4 xl:col-span-1 xl:justify-end"><p className="text-sm text-slate-600">{filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}</p>{(search || selectedCategory !== 'All' || priceSort !== 'default' || offersOnly || availabilityFilter !== 'all' || minimumPrice || maximumPrice) && (<button type="button" onClick={() => { setSearch(''); setSelectedCategory('All'); setPriceSort('default'); setOffersOnly(false); setAvailabilityFilter('all'); setMinimumPrice(''); setMaximumPrice('') }} className="text-sm font-semibold text-green-700 hover:text-green-900">Clear filters</button>)}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {filteredProducts.map((product) => (
              <article key={product.id} className="store-product-card group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg">
                <div className="store-product-visual relative aspect-4/3 overflow-hidden bg-linear-to-br from-green-50 to-gray-100">
                  <Link to={`/products/${product.id}`} aria-label={`View ${product.name} details`} className="block h-full w-full">
                    <ProductImage src={product.image} alt={product.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  </Link>
                  <button type="button" onClick={() => toggleWishlist(product.id)} aria-label={`${wishlistIds.includes(product.id) ? 'Remove' : 'Add'} ${product.name} ${wishlistIds.includes(product.id) ? 'from' : 'to'} wishlist`} aria-pressed={wishlistIds.includes(product.id)} className="absolute right-3 top-3 rounded-full bg-white/95 p-2 text-slate-600 shadow-md transition hover:text-red-600 focus:outline-none focus:ring-4 focus:ring-red-100"><Heart size={19} aria-hidden="true" fill={wishlistIds.includes(product.id) ? 'currentColor' : 'none'} className={wishlistIds.includes(product.id) ? 'text-red-600' : ''} /></button>
                  {product.originalPrice > product.price && (<span className="absolute left-3 top-3 rounded-full bg-red-600 px-2.5 py-1 text-xs font-bold text-white shadow-sm">{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF</span>)}
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <p className="text-xs font-medium text-green-700">{product.category}</p>
                  <h3 className="product-title mt-1 min-h-10 font-bold text-slate-900"><Link to={`/products/${product.id}`} className="hover:text-green-800 hover:underline">{product.name}</Link></h3>
                  <p className="mt-1 text-sm text-slate-600">{product.unit}</p>
                  <p className={`mt-2 text-xs font-semibold ${product.stock === 0 ? 'text-red-700' : 'text-green-800'}`}>{product.stock === 0 ? 'Out of stock' : 'Available'}</p>
                  <Link to={`/products/${product.id}`} className="mt-2 self-start text-sm font-semibold text-green-700 hover:text-green-900 hover:underline">View {product.name} details</Link>
                  <div className="mt-auto flex items-end justify-between gap-2 pt-3">
                    <div><span className="block font-extrabold text-slate-900">৳{product.price}</span>{product.originalPrice > product.price && (<span className="text-xs text-slate-600 line-through">৳{product.originalPrice}</span>)}</div>
                    <button type="button" onClick={() => addToCart(product)} disabled={product.stock === 0} aria-label={`Add ${product.name} to cart`} className="inline-flex items-center gap-1.5 rounded-lg bg-green-700 px-3 py-2 text-sm font-semibold text-white transition hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-200 disabled:cursor-not-allowed disabled:opacity-50"><Plus size={18} aria-hidden="true" /><span className="hidden sm:inline">{product.stock === 0 ? 'Out of stock' : 'Add'}</span></button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center">
              <Search className="mx-auto text-slate-500" size={30} aria-hidden="true" />
              <p className="mt-3 font-semibold text-slate-800">{search.trim() ? `No products found for “${search.trim()}”` : 'No products match the selected filters.'}</p>
              <p className="mt-1 text-sm text-slate-600">Try changing your search or clearing the filters.</p>
              <button type="button" onClick={() => { setSearch(''); setSelectedCategory('All'); setPriceSort('default'); setOffersOnly(false); setAvailabilityFilter('all'); setMinimumPrice(''); setMaximumPrice('') }} className="mt-4 rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-800">Show all products</button>
              <div className="mx-auto mt-6 grid max-w-3xl grid-cols-2 gap-3 text-left sm:grid-cols-4">
                {(recommendedProducts.length ? recommendedProducts : activeProducts).slice(0, 4).map((product) => (
                  <article key={product.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                    <ProductImage src={product.image} alt={product.name} className="aspect-square w-full object-cover" />
                    <div className="p-3">
                      <p className="truncate text-sm font-semibold text-slate-900">{product.name}</p>
                      <p className="mt-1 text-sm font-bold text-green-800">৳{product.price}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <button type="button" onClick={() => navigate(`/products/${product.id}`)} className="text-xs font-semibold text-green-800 hover:underline">View product</button>
                        <button type="button" onClick={() => addToCart(product)} disabled={product.stock === 0} className="text-xs font-semibold text-slate-700 hover:underline disabled:opacity-50">Add to cart</button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}
        </section>
      </main>

      <footer className="site-footer bg-green-950 px-4 py-9 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 text-left sm:grid-cols-2 sm:items-start">
          <div><div className="flex items-center gap-2 text-xl font-extrabold"><ShoppingBasket size={24} aria-hidden="true" />EasyBazar</div><p className="mt-2 text-sm text-green-100">সহজ বাজার, ঘরে ঘরে।</p></div>
          <nav aria-label="Footer links"><h2 className="font-bold text-white">Customer care</h2><ul className="mt-3 grid grid-cols-2 gap-x-5 gap-y-2 text-sm text-green-100 sm:grid-cols-3">{[['About', '/about'], ['Contact', '/contact'], ['FAQ', '/faq'], ['Shipping', '#shipping'], ['Returns', '#returns']].map(([label, target]) => (<li key={target}>{target.startsWith('/') ? <button type="button" onClick={() => navigate(target)} className="inline-flex rounded underline-offset-4 hover:text-white hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-green-300">{label}</button> : <a href={target} className="inline-flex rounded underline-offset-4 hover:text-white hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-green-300">{label}</a>}</li>))}</ul></nav>
        </div>
        <div className="mx-auto mt-8 grid max-w-7xl gap-4 border-t border-green-800 pt-6 sm:grid-cols-2 lg:grid-cols-3">
          <section id="about" className="scroll-mt-24 rounded-2xl bg-green-900/60 p-4"><h2 className="font-bold">About EasyBazar</h2><p className="mt-2 text-sm leading-6 text-green-100">EasyBazar is a demo grocery storefront featuring everyday products and sample Bangladesh retail prices.</p></section>
          <section id="contact" className="scroll-mt-24 rounded-2xl bg-green-900/60 p-4"><h2 className="font-bold">Contact EasyBazar</h2><p className="mt-2 text-sm leading-6 text-green-100">Phone: <a className="underline" href={`tel:${CONTACT_INFO.phoneLink}`}>{CONTACT_INFO.phone}</a><br />Email: <a className="underline" href={`mailto:${CONTACT_INFO.email}`}>{CONTACT_INFO.email}</a><br />WhatsApp: {CONTACT_INFO.phone}<br />Service area: {CONTACT_INFO.address}<br />Support hours: {CONTACT_INFO.supportHours.display}</p><button type="button" onClick={() => navigate('/contact')} className="mt-3 text-sm font-bold text-white underline underline-offset-2">Contact Us page</button></section>
          <section id="faq" className="scroll-mt-24 rounded-2xl bg-green-900/60 p-4"><h2 className="font-bold">Frequently asked questions</h2><p className="mt-2 text-sm leading-6 text-green-100">Find answers about orders, delivery, payments and support.</p><button type="button" onClick={() => navigate('/contact#faq')} className="mt-2 text-sm font-bold text-white underline underline-offset-2">View all FAQs</button></section>
          <section id="shipping" className="scroll-mt-24 rounded-2xl bg-green-900/60 p-4"><h2 className="font-bold">Shipping</h2><p className="mt-2 text-sm leading-6 text-green-100">Delivery is available within Rajshahi District. Delivery costs ৳{DELIVERY_FEE}; orders of ৳{CONTACT_INFO.freeDeliveryMinimum} or more receive free delivery.</p></section>
          <section id="returns" className="scroll-mt-24 rounded-2xl bg-green-900/60 p-4"><h2 className="font-bold">Returns</h2><p className="mt-2 text-sm leading-6 text-green-100">Return eligibility and instructions are not configured in this demo yet.</p></section>
        </div>
        <div className="mx-auto mt-5 flex max-w-7xl flex-wrap gap-3 text-sm">
          <button type="button" onClick={() => navigate('/track-order')} className="rounded-lg border border-green-700 px-4 py-2 font-semibold text-green-100 hover:bg-green-900">Track Order</button>
          <button type="button" onClick={() => navigate('/offers')} className="rounded-lg border border-green-700 px-4 py-2 font-semibold text-green-100 hover:bg-green-900">Promo Codes</button>
        </div>
        <p className="mx-auto mt-7 max-w-7xl text-center text-xs text-green-200">Sample Bangladesh retail prices (BDT) · Demo only, not live market quotes</p>
      </footer>
      <FloatingSupport />
    </div>
  )
}

function SupportPageLoading() {
  return <main className="grid min-h-screen place-items-center bg-[#f8faf7] p-6"><p role="status" className="rounded-xl bg-white px-5 py-4 font-semibold text-green-900 shadow-sm">Loading EasyBazar support…</p></main>
}

export default App
