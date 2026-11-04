import { useState } from 'react'
import { ArrowLeft, Bell, Heart, MapPin, Package, Plus, Tag, UserRound } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useCustomer } from '../context/CustomerContext.jsx'
import { useOrders } from '../context/OrderContext.jsx'
import { useCatalog } from '../context/CatalogContext.jsx'
import {
  canCancelOrder,
  formatStatusTimestamp,
  getOrderStatus,
} from '../utils/orderTracking.js'
import { formatCouponDiscount, getActiveCoupons } from '../utils/couponUtils.js'

function formatCurrency(value) {
  return `৳${Number(value || 0).toLocaleString('en-BD')}`
}

export default function AccountDashboard({ account, onSignIn, onLogout }) {
  const navigate = useNavigate()
  const customer = useCustomer()
  const { orders, updateOrderStatus } = useOrders()
  const { offers } = useCatalog()
  const [profileError, setProfileError] = useState('')
  const [addressError, setAddressError] = useState('')
  const [actionError, setActionError] = useState('')
  const [addressFormOpen, setAddressFormOpen] = useState(false)
  const [profile, setProfile] = useState(() => ({
    name: account?.name || '',
    phone: '',
    ...customer.profile,
  }))

  const ownOrders = account
    ? orders.filter((order) => order.customerId === account.customerId)
    : []
  const coupons = getActiveCoupons(offers)

  function saveProfile(event) {
    event.preventDefault()
    try {
      customer.updateProfile({ ...profile, name: profile.name.trim(), phone: profile.phone.trim() })
      setProfileError('')
    } catch (error) {
      setProfileError(error.message)
    }
  }

  function saveAddress(event) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    try {
      customer.addAddress({
        label: String(formData.get('label') || '').trim(),
        district: String(formData.get('district') || '').trim(),
        area: String(formData.get('area') || '').trim(),
        address: String(formData.get('address') || '').trim(),
      })
      event.currentTarget.reset()
      setAddressFormOpen(false)
      setAddressError('')
    } catch (error) {
      setAddressError(error.message)
    }
  }

  function cancelOrder(orderId) {
    setActionError('')
    try {
      updateOrderStatus(orderId, 'Cancelled')
    } catch (error) {
      setActionError(error.message)
    }
  }

  return (
    <main className="min-h-screen bg-[#f8faf7] px-4 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-6xl">
        <button type="button" onClick={() => navigate('/')} className="mb-6 inline-flex items-center gap-2 rounded-lg font-semibold text-slate-700 hover:text-green-800">
          <ArrowLeft size={18} /> Back to EasyBazar
        </button>
        <header className="mb-7 rounded-3xl bg-green-900 p-6 text-white sm:p-8">
          <p className="text-sm font-semibold text-green-200">EasyBazar customer account · Demo</p>
          <h1 className="mt-1 text-3xl font-extrabold">Welcome{account ? `, ${customer.profile?.name || account.name}` : ' to your account'}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-green-100">
            Your account data and orders are stored only in this browser. This demo is not a secure multi-user service.
          </p>
        </header>

        {!account ? (
          <section className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <UserRound className="mx-auto text-green-800" size={34} />
            <h2 className="mt-3 text-xl font-bold text-slate-900">Sign in to view your account</h2>
            <p className="mt-2 text-sm text-slate-600">Orders are shown only for the currently signed-in demo customer.</p>
            <button type="button" onClick={onSignIn} className="mt-5 rounded-xl bg-green-700 px-5 py-3 font-semibold text-white hover:bg-green-800">Log in / Sign up</button>
          </section>
        ) : (
          <>
            <div className="grid gap-5 lg:grid-cols-[0.85fr_1.5fr]">
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900"><UserRound size={20} className="text-green-800" /> Profile</h2>
                <form onSubmit={saveProfile} className="mt-4 space-y-3">
                  <label className="block text-sm font-semibold">Name<input required minLength="2" value={profile.name} onChange={(event) => setProfile({ ...profile, name: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5" /></label>
                  <label className="block text-sm font-semibold">Email<input disabled value={account.email} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-500" /></label>
                  <label className="block text-sm font-semibold">Phone<input type="tel" value={profile.phone} onChange={(event) => setProfile({ ...profile, phone: event.target.value })} placeholder="Optional" className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5" /></label>
                  {profileError && <p role="alert" className="text-sm text-red-700">{profileError}</p>}
                  <button type="submit" className="w-full rounded-xl bg-green-700 px-4 py-2.5 font-bold text-white">Save profile</button>
                </form>
                <button type="button" onClick={onLogout} className="mt-3 w-full rounded-xl border border-red-200 px-4 py-2.5 font-semibold text-red-700 hover:bg-red-50">Log out</button>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900"><MapPin size={20} className="text-green-800" /> Saved delivery addresses</h2>
                  <button type="button" onClick={() => setAddressFormOpen((open) => !open)} className="inline-flex items-center gap-1 rounded-lg bg-green-50 px-3 py-2 text-sm font-bold text-green-800"><Plus size={16} /> Add</button>
                </div>
                {addressFormOpen && (
                  <form onSubmit={saveAddress} className="mt-4 grid gap-3 rounded-xl bg-slate-50 p-4 sm:grid-cols-2">
                    <input name="label" required placeholder="Label (e.g. Home)" aria-label="Address label" className="rounded-lg border border-slate-300 px-3 py-2.5" />
                    <input name="district" required value="Rajshahi" readOnly aria-label="District" className="rounded-lg border border-slate-300 bg-slate-100 px-3 py-2.5" />
                    <input name="area" required placeholder="Area / Upazila" aria-label="Area or upazila" className="rounded-lg border border-slate-300 px-3 py-2.5" />
                    <input name="address" required minLength="8" placeholder="Street address" aria-label="Street address" className="rounded-lg border border-slate-300 px-3 py-2.5" />
                    {addressError && <p role="alert" className="text-sm text-red-700 sm:col-span-2">{addressError}</p>}
                    <button className="rounded-lg bg-green-700 px-4 py-2.5 font-bold text-white sm:col-span-2">Save address</button>
                  </form>
                )}
                {customer.addresses.length ? (
                  <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                    {customer.addresses.map((address) => (
                      <li key={address.id} className="rounded-xl border border-slate-200 p-4">
                        <div className="flex items-start justify-between gap-3"><div><p className="font-bold">{address.label}</p><p className="mt-1 text-sm text-slate-600">{address.area}, {address.district}</p><p className="text-sm text-slate-600">{address.address}</p></div><button type="button" onClick={() => customer.removeAddress(address.id)} className="text-sm font-semibold text-red-700">Remove</button></div>
                      </li>
                    ))}
                  </ul>
                ) : <p className="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">No saved addresses yet. Add one for quick reference.</p>}
              </section>
            </div>

            <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900"><Package size={20} className="text-green-800" /> My orders <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs text-green-800">{ownOrders.length}</span></h2>
                <button type="button" onClick={() => navigate('/orders')} className="text-sm font-bold text-green-800 hover:underline">Open order history</button>
              </div>
              {actionError && <p role="alert" className="mt-3 text-sm text-red-700">{actionError}</p>}
              {ownOrders.length ? (
                <div className="mt-4 space-y-3">
                  {ownOrders.map((order) => (
                    <article key={order.orderId} className="rounded-xl border border-slate-200 p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div><p className="font-bold text-green-800">{order.orderId}</p><p className="mt-1 text-xs text-slate-500">{order.createdAt || formatStatusTimestamp(order.createdAtISO)}</p></div>
                        <span className="rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-900">{getOrderStatus(order)}</span>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm">
                        <span>{order.items.length} product line(s) · Total <strong>{formatCurrency(order.total)}</strong></span>
                        <div className="flex flex-wrap gap-2">
                          <button type="button" onClick={() => navigate(`/track-order?orderId=${encodeURIComponent(order.orderId)}`)} className="rounded-lg border border-green-700 px-3 py-2 font-semibold text-green-800">Track</button>
                          {canCancelOrder(order) && <button type="button" onClick={() => cancelOrder(order.orderId)} className="rounded-lg border border-red-200 px-3 py-2 font-semibold text-red-700">Cancel</button>}
                        </div>
                      </div>
                      <details className="mt-3 border-t border-slate-100 pt-3">
                        <summary className="cursor-pointer text-sm font-semibold text-slate-700">Order details</summary>
                        <ul className="mt-2 space-y-1 text-sm text-slate-600">{order.items.map((item, index) => <li key={item.id ?? `${item.name}-${index}`}>{item.name} × {item.quantity} · {formatCurrency(Number(item.price) * Number(item.quantity || 1))}</li>)}</ul>
                        <p className="mt-2 text-sm text-slate-600">Delivery: {formatCurrency(order.delivery)} · Coupon: {order.couponCode || 'None'}</p>
                      </details>
                    </article>
                  ))}
                </div>
              ) : <p className="mt-4 rounded-xl bg-slate-50 p-5 text-sm text-slate-600">No orders are linked to this demo account yet. Orders placed while signed in will appear here.</p>}
            </section>

            <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { title: 'Wishlist', text: 'View your saved products', icon: Heart, to: '/wishlist' },
                { title: 'Notifications', text: 'Order updates and offers', icon: Bell, to: '/notifications' },
                { title: 'Coupon wallet', text: `${coupons.length} active demo coupons`, icon: Tag, to: '/offers' },
                { title: 'Customer support', text: 'Get help with an order', icon: MapPin, to: '/support/tickets' },
              ].map(({ title, text, icon: Icon, to }) => (
                <button key={title} type="button" onClick={() => navigate(to)} className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm hover:border-green-300 hover:bg-green-50">
                  <Icon className="text-green-800" size={21} /><p className="mt-3 font-bold">{title}</p><p className="mt-1 text-sm text-slate-600">{text}</p>
                </button>
              ))}
            </div>
            <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" aria-labelledby="coupon-wallet-heading">
              <div className="flex items-center justify-between gap-3">
                <h2 id="coupon-wallet-heading" className="flex items-center gap-2 text-lg font-bold text-slate-900"><Tag size={20} className="text-green-800" /> Coupon wallet</h2>
                <button type="button" onClick={() => navigate('/offers')} className="text-sm font-bold text-green-800 hover:underline">Browse offers</button>
              </div>
              {coupons.length ? (
                <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {coupons.map((coupon) => (
                    <li key={coupon.id} className="rounded-xl border border-dashed border-green-300 bg-green-50 p-4">
                      <p className="font-mono text-lg font-extrabold tracking-wide text-green-900">{coupon.code}</p>
                      <p className="mt-1 text-sm font-semibold text-slate-800">{formatCouponDiscount(coupon)}</p>
                      {Number(coupon.minimumOrder) > 0 && <p className="mt-1 text-xs text-slate-600">Minimum order {formatCurrency(coupon.minimumOrder)}</p>}
                      {coupon.expiryDate && <p className="mt-1 text-xs text-slate-600">Valid through {coupon.expiryDate}</p>}
                    </li>
                  ))}
                </ul>
              ) : <p className="mt-3 text-sm text-slate-600">No active coupons are available right now.</p>}
              <p className="mt-3 text-xs text-slate-500">Demo coupons can only be redeemed in this browser.</p>
            </section>
          </>
        )}
      </div>
    </main>
  )
}
