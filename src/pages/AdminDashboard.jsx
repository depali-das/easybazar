import { lazy, Suspense, useMemo, useState } from 'react'
import {
  ArrowLeft,
  Boxes,
  BellRing,
  ChartNoAxesColumnIncreasing,
  Check,
  CircleAlert,
  ClipboardList,
  Headphones,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  Package,
  Pencil,
  Plus,
  Search,
  Settings,
  ShieldAlert,
  ShoppingBag,
  Tags,
  Trash2,
  Truck,
  Users,
  X,
} from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useCatalog } from '../context/CatalogContext.jsx'
import { useDelivery } from '../context/DeliveryContext.jsx'
import { useOrders } from '../context/OrderContext.jsx'
import {
  CANCELLED_STATUS,
  canCancelOrder,
  formatStatusTimestamp,
  getOrderStatus,
  maskPhoneNumber,
  ORDER_STATUSES,
} from '../utils/orderTracking.js'
import { DELIVERY_FEE } from '../utils/pricing.js'
import { CONTACT_INFO } from '../config/contact.js'
const AdminNotifications = lazy(() => import('./AdminNotifications.jsx'))
const AdminSupportTickets = lazy(() => import('./AdminSupportTickets.jsx'))

const NAV_ITEMS = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/products', label: 'Products', icon: ShoppingBag },
  { path: '/admin/categories', label: 'Categories', icon: Tags },
  { path: '/admin/orders', label: 'Orders', icon: ClipboardList },
  { path: '/admin/customers', label: 'Customers', icon: Users },
  { path: '/admin/inventory', label: 'Inventory', icon: Boxes },
  { path: '/admin/offers', label: 'Offers & Coupons', icon: Tags },
  { path: '/admin/notifications', label: 'Notifications', icon: BellRing },
  { path: '/admin/support', label: 'Support Tickets', icon: Headphones },
  { path: '/admin/delivery', label: 'Delivery Areas', icon: Truck },
  { path: '/admin/settings', label: 'Settings', icon: Settings },
]

const PAGE_TITLES = {
  '/admin': 'Dashboard',
  '/admin/products': 'Products Management',
  '/admin/categories': 'Categories Management',
  '/admin/orders': 'Orders Management',
  '/admin/customers': 'Customers Management',
  '/admin/inventory': 'Inventory Management',
  '/admin/offers': 'Offers & Coupons',
  '/admin/notifications': 'Notification Management',
  '/admin/support': 'Support Tickets',
  '/admin/delivery': 'Delivery Areas',
  '/admin/settings': 'Store Settings',
}

function readAsDataUrl(file) {
  if (file.size > 512 * 1024) {
    return Promise.reject(new Error('Choose an image smaller than 512 KB for browser storage.'))
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(new Error('The image could not be read.'))
    reader.readAsDataURL(file)
  })
}

function getCustomerKey(order) {
  const phoneDigits = String(order.customer?.phone || '').replace(/\D/g, '')
  return phoneDigits
    ? phoneDigits.slice(-11)
    : String(order.customer?.name || order.orderId).trim().toLowerCase()
}

function getOrderDate(order) {
  const parsed = order.createdAtISO ? new Date(order.createdAtISO) : new Date(order.createdAt)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function formatCurrency(value) {
  return `৳${Number(value || 0).toLocaleString('en-BD')}`
}

function Field({
  label,
  name,
  value,
  onChange,
  type = 'text',
  required = false,
  min,
  max,
  step,
  placeholder,
  options,
  rows,
  help,
}) {
  const common =
    'mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100'

  return (
    <label className="block text-sm font-semibold text-slate-800">
      {label}
      {options ? (
        <select
          name={name}
          value={value}
          required={required}
          onChange={(event) => onChange(event.target.value)}
          className={common}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      ) : rows ? (
        <textarea
          name={name}
          value={value}
          required={required}
          rows={rows}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className={common}
        />
      ) : (
        <input
          name={name}
          type={type}
          value={value}
          required={required}
          min={min}
          max={max}
          step={step}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className={common}
        />
      )}
      {help && <span className="mt-1 block text-xs font-normal text-slate-500">{help}</span>}
    </label>
  )
}

function PageHeading({ title, description, action }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <p className="text-sm font-bold text-green-800">EasyBazar Admin</p>
        <h1 className="mt-1 text-2xl font-extrabold text-slate-950 sm:text-3xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-slate-600">{description}</p>}
      </div>
      {action}
    </div>
  )
}

function EmptyState({ children }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-600">
      {children}
    </div>
  )
}
function TableFrame({ children }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full min-w-180 border-collapse text-left text-sm">{children}</table>
    </div>
  )
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-80 flex items-end justify-center bg-slate-950/50 p-0 sm:items-center sm:p-4">
      <section
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl sm:p-7"
      >
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-slate-900">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close dialog" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X size={20} /></button>
        </div>
        {children}
      </section>
    </div>
  )
}

function DashboardHome({ products, categories, orders, customers, navigate }) {
  const ordersByStatus = orders.map((order) => getOrderStatus(order))
  const revenue = orders.reduce(
    (sum, order) => sum + (getOrderStatus(order) === CANCELLED_STATUS ? 0 : Number(order.total || 0)),
    0,
  )
  const pendingOrders = ordersByStatus.filter(
    (status) => status !== 'Delivered' && status !== CANCELLED_STATUS,
  ).length
  const deliveredOrders = ordersByStatus.filter((status) => status === 'Delivered').length
  const cancelledOrders = ordersByStatus.filter((status) => status === CANCELLED_STATUS).length
  const [today] = useState(() => new Date())
  const lastSevenDays = Array.from({ length: 7 }, (_, index) => {
    const day = new Date(today)
    day.setHours(0, 0, 0, 0)
    day.setDate(day.getDate() - (6 - index))
    const dayOrders = orders.filter((order) => {
      const date = getOrderDate(order)
      return date && date.toDateString() === day.toDateString() && getOrderStatus(order) !== CANCELLED_STATUS
    })
    return {
      label: new Intl.DateTimeFormat('en', { weekday: 'short' }).format(day),
      value: dayOrders.reduce((sum, order) => sum + Number(order.total || 0), 0),
    }
  })
  const maxSales = Math.max(...lastSevenDays.map((day) => day.value), 1)
  const salesByProduct = new Map()
  orders.forEach((order) => {
    if (getOrderStatus(order) === CANCELLED_STATUS) return
    order.items.forEach((item) => {
      const key = item.id ?? item.name
      const current = salesByProduct.get(key) || { name: item.name, quantity: 0 }
      current.quantity += Number(item.quantity || 1)
      salesByProduct.set(key, current)
    })
  })
  const topProducts = [...salesByProduct.values()].sort((a, b) => b.quantity - a.quantity).slice(0, 5)
  const lowStock = products.filter((product) => Number.isFinite(product.stock) && product.stock <= 5)
  const activities = orders
    .flatMap((order) =>
      (order.statusHistory || []).map((entry) => ({
        orderId: order.orderId,
        status: entry.status,
        timestamp: entry.timestamp,
      })),
    )
    .filter((entry) => entry.timestamp)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 5)
  const stats = [
    { label: 'Total Orders', value: orders.length, icon: ClipboardList, color: 'bg-blue-50 text-blue-700' },
    { label: 'Total Revenue', value: formatCurrency(revenue), icon: ChartNoAxesColumnIncreasing, color: 'bg-green-50 text-green-700' },
    { label: 'Total Products', value: products.length, icon: ShoppingBag, color: 'bg-purple-50 text-purple-700' },
    { label: 'Total Customers', value: customers.length, icon: Users, color: 'bg-orange-50 text-orange-700' },
    { label: 'Pending Orders', value: pendingOrders, icon: CircleAlert, color: 'bg-amber-50 text-amber-700' },
    { label: 'Delivered Orders', value: deliveredOrders, icon: Check, color: 'bg-emerald-50 text-emerald-700' },
    { label: 'Cancelled Orders', value: cancelledOrders, icon: X, color: 'bg-red-50 text-red-700' },
  ]

  return (
    <>
      <PageHeading title="Dashboard" description="Overview based only on orders and products saved in this browser." />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <article key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div><p className="text-sm font-medium text-slate-600">{stat.label}</p><p className="mt-2 text-2xl font-extrabold text-slate-950">{stat.value}</p></div>
                <span className={`rounded-xl p-2.5 ${stat.color}`}><Icon size={20} aria-hidden="true" /></span>
              </div>
            </article>
          )
        })}
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.4fr_0.8fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div><h2 className="font-bold text-slate-900">Revenue Overview</h2><p className="mt-1 text-xs text-slate-500">Saved non-cancelled orders · last 7 days</p></div>
            <ChartNoAxesColumnIncreasing className="text-green-700" size={21} />
          </div>
          {orders.length ? (
            <div className="mt-6 flex h-48 items-end gap-3 border-b border-l border-slate-100 px-2">
              {lastSevenDays.map((day) => (
                <div key={day.label} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                  <span className="max-w-full truncate text-[10px] text-slate-500" title={formatCurrency(day.value)}>{day.value ? formatCurrency(day.value) : ''}</span>
                  <div
                    role="img"
                    aria-label={`${day.label}: ${formatCurrency(day.value)} revenue`}
                    title={`${day.label}: ${formatCurrency(day.value)}`}
                    className="w-full max-w-12 rounded-t-lg bg-green-600 transition hover:bg-green-700"
                    style={{ height: `${Math.max((day.value / maxSales) * 70, day.value ? 4 : 1)}%` }}
                  />
                  <span className="text-xs text-slate-500">{day.label}</span>
                </div>
              ))}
            </div>
          ) : <EmptyState>No order data yet. Revenue will appear after checkout orders are saved.</EmptyState>}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-bold text-slate-900">Best-selling products</h2>
          {topProducts.length ? (
            <ol className="mt-3 divide-y divide-slate-100">
              {topProducts.map((item, index) => (
                <li key={item.name} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <span className="min-w-0"><span className="mr-2 text-xs font-bold text-green-700">#{index + 1}</span><span className="font-medium text-slate-800">{item.name}</span></span>
                  <span className="shrink-0 font-bold text-slate-900">{item.quantity} sold</span>
                </li>
              ))}
            </ol>
          ) : <p className="mt-4 text-sm text-slate-500">No product sales recorded yet.</p>}
        </section>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between"><h2 className="font-bold text-slate-900">Recent orders</h2><button type="button" onClick={() => navigate('/admin/orders')} className="text-sm font-semibold text-green-800 hover:underline">View all</button></div>
          {orders.length ? <TableFrame><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr>{['Order ID', 'Customer', 'Status', 'Total'].map((head) => <th key={head} className="px-3 py-2">{head}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{orders.slice(0, 5).map((order) => <tr key={order.orderId}><td className="px-3 py-3 font-bold text-green-800">{order.orderId}</td><td className="px-3 py-3">Customer</td><td className="px-3 py-3">{getOrderStatus(order)}</td><td className="px-3 py-3 font-semibold">{formatCurrency(order.total)}</td></tr>)}</tbody></TableFrame> : <p className="text-sm text-slate-500">No orders are available.</p>}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-bold text-slate-900">Inventory & customer activity</h2>
          <div className="mt-4 grid gap-5 sm:grid-cols-2">
            <div><h3 className="text-sm font-semibold text-slate-700">Low stock (5 or less)</h3>{lowStock.length ? <ul className="mt-2 space-y-2 text-sm">{lowStock.slice(0, 4).map((product) => <li key={product.id} className="flex justify-between gap-2"><span className="truncate">{product.name}</span><span className="font-bold text-red-700">{product.stock}</span></li>)}</ul> : <p className="mt-2 text-xs text-slate-500">No stock counts at or below 5.</p>}</div>
            <div><h3 className="text-sm font-semibold text-slate-700">Latest customer activity</h3>{activities.length ? <ul className="mt-2 space-y-2 text-xs text-slate-600">{activities.slice(0, 4).map((activity, index) => <li key={`${activity.orderId}-${activity.status}-${index}`}><span className="font-semibold text-slate-800">{activity.orderId}</span><span> · {activity.status}</span><span className="block">{formatStatusTimestamp(activity.timestamp)}</span></li>)}</ul> : <p className="mt-2 text-xs text-slate-500">No status activity recorded.</p>}</div>
          </div>
          <p className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-500">{categories.filter((category) => category.active).length} active categories · no customer or sales data is fabricated</p>
        </section>
      </div>
    </>
  )
}

function ProductManagement({ products, categories, onAdd, onUpdate, onDelete }) {
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const filtered = products.filter((product) =>
    `${product.name} ${product.category}`.toLowerCase().includes(query.trim().toLowerCase()),
  )
  const emptyProduct = {
    name: '',
    category: categories.find((category) => category.active)?.name || '',
    price: '',
    originalPrice: '',
    unit: '',
    image: '',
    stock: '',
    active: true,
  }

  async function submitProduct(event) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const imageFile = form.get('imageFile')
    setBusy(true)
    setError('')
    try {
      const image = imageFile?.size ? await readAsDataUrl(imageFile) : editing?.image || '/images/fallback.jpg'
      const stockValue = String(form.get('stock') || '').trim()
      const stock = stockValue === '' ? undefined : Number(stockValue)
      const product = {
        name: String(form.get('name')).trim(),
        category: String(form.get('category')),
        price: Number(form.get('price')),
        originalPrice: Number(form.get('originalPrice') || form.get('price')),
        unit: String(form.get('unit')).trim(),
        image,
        active: form.get('active') === 'on',
        ...(stock !== undefined ? { stock } : {}),
      }
      const validStock = stock === undefined
        ? Boolean(editing?.id) && !Number.isFinite(editing.stock)
        : Number.isInteger(stock) && stock >= 0
      if (!product.name || !product.category || !Number.isFinite(product.price) || product.price < 0 || !validStock) {
        throw new Error('Enter a name, category, valid price, and whole-number stock of zero or more.')
      }
      if (editing?.id) onUpdate(editing.id, product)
      else onAdd(product)
      setEditing(null)
    } catch (submitError) {
      setError(submitError.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <PageHeading
        title="Products Management"
        description="Manage the same catalog used by the storefront."
        action={<button type="button" onClick={() => { setError(''); setEditing({ ...emptyProduct }) }} className="inline-flex items-center gap-2 rounded-xl bg-green-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-green-800"><Plus size={17} /> Add product</button>}
      />
      <div className="mb-4"><label className="flex max-w-md items-center gap-2 rounded-xl border border-slate-200 bg-white px-3"><Search size={18} className="text-slate-500" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products" className="w-full bg-transparent py-3 text-sm outline-none" /></label></div>
      {filtered.length ? (
        <TableFrame>
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr>{['Product', 'Category', 'Price', 'Stock', 'Availability', 'Actions'].map((head) => <th key={head} className="px-4 py-3">{head}</th>)}</tr></thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((product) => (
              <tr key={product.id}>
                <td className="px-4 py-3"><div className="flex items-center gap-3"><img src={product.image} alt="" className="h-11 w-11 rounded-lg bg-slate-100 object-cover" /><div><p className="font-bold text-slate-900">{product.name}</p><p className="text-xs text-slate-500">{product.unit}</p></div></div></td>
                <td className="px-4 py-3">{product.category}</td>
                <td className="px-4 py-3 font-semibold">{formatCurrency(product.price)}{product.originalPrice > product.price && <span className="ml-1 text-xs text-slate-400 line-through">{formatCurrency(product.originalPrice)}</span>}</td>
                <td className="px-4 py-3">{Number.isFinite(product.stock) ? product.stock : 'Not set'}</td>
                <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${product.active !== false && product.stock !== 0 ? 'bg-green-50 text-green-800' : 'bg-slate-100 text-slate-600'}`}>{product.active !== false && product.stock !== 0 ? 'Available' : 'Unavailable'}</span></td>
                <td className="px-4 py-3"><div className="flex gap-2"><button type="button" aria-label={`Edit ${product.name}`} onClick={() => { setError(''); setEditing({ ...product, stock: Number.isFinite(product.stock) ? product.stock : '' }) }} className="rounded-lg p-2 text-green-800 hover:bg-green-50"><Pencil size={16} /></button><button type="button" aria-label={`Delete ${product.name}`} onClick={() => { if (window.confirm(`Delete ${product.name} from the catalog?`)) onDelete(product.id) }} className="rounded-lg p-2 text-red-700 hover:bg-red-50"><Trash2 size={16} /></button></div></td>
              </tr>
            ))}
          </tbody>
        </TableFrame>
      ) : <EmptyState>No products match your search.</EmptyState>}

      {editing && (
        <Modal title={editing.id ? 'Edit product' : 'Add product'} onClose={() => setEditing(null)}>
          <form onSubmit={submitProduct} className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2"><Field name="name" label="Product name" value={editing.name} onChange={(name) => setEditing({ ...editing, name })} required /></div>
            <Field name="category" label="Category" value={editing.category} onChange={(category) => setEditing({ ...editing, category })} options={categories.filter((category) => category.active || category.name === editing.category).map((category) => ({ value: category.name, label: category.name }))} />
            <Field name="price" label="Discounted price (৳)" type="number" min="0" step="0.01" value={editing.price} onChange={(price) => setEditing({ ...editing, price })} required />
            <Field name="originalPrice" label="Original price (৳)" type="number" min="0" step="0.01" value={editing.originalPrice} onChange={(originalPrice) => setEditing({ ...editing, originalPrice })} />
            <Field name="unit" label="Unit" value={editing.unit} onChange={(unit) => setEditing({ ...editing, unit })} placeholder="e.g. 500 g" required />
            <Field name="stock" label="Stock quantity" type="number" min="0" step="1" value={editing.stock} onChange={(stock) => setEditing({ ...editing, stock })} required={!editing.id || Number.isFinite(editing.stock)} help={!Number.isFinite(editing.stock) && editing.id ? 'Leave blank to keep stock untracked, or enter a quantity to start tracking it.' : undefined} />
            <label className="block text-sm font-semibold text-slate-800 sm:col-span-2">Product image<input name="imageFile" type="file" accept="image/*" className="mt-2 block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-green-50 file:px-3 file:py-2 file:font-semibold file:text-green-800" /><span className="mt-1 block text-xs font-normal text-slate-500">Optional upload; image data is stored locally in this browser.</span></label>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-800 sm:col-span-2"><input name="active" type="checkbox" checked={editing.active !== false} onChange={(event) => setEditing({ ...editing, active: event.target.checked })} className="accent-green-700" /> Available in storefront</label>
            {error && <p role="alert" className="text-sm font-semibold text-red-700 sm:col-span-2">{error}</p>}
            <div className="flex justify-end gap-2 sm:col-span-2"><button type="button" onClick={() => setEditing(null)} className="rounded-xl border px-4 py-2.5 text-sm font-semibold">Cancel</button><button disabled={busy} type="submit" className="rounded-xl bg-green-700 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60">{busy ? 'Saving…' : 'Save product'}</button></div>
          </form>
        </Modal>
      )}
    </>
  )
}

function CategoryManagement({ categories, products, onAdd, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(null)
  const [error, setError] = useState('')

  function submit(event) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const imageFile = data.get('imageFile')
    const complete = async () => {
      try {
        const image = imageFile?.size ? await readAsDataUrl(imageFile) : editing.image || '/images/fallback.jpg'
        const category = { name: editing.name.trim(), emoji: editing.emoji || '🛒', image, active: editing.active }
        if (!category.name) throw new Error('Enter a category name.')
        if (editing.originalName) onUpdate(editing.originalName, category)
        else onAdd(category)
        setEditing(null)
        setError('')
      } catch (submitError) {
        setError(submitError.message)
      }
    }
    complete()
  }

  return (
    <>
      <PageHeading title="Categories Management" description="Categories stay connected to storefront filters and product records." action={<button type="button" onClick={() => { setError(''); setEditing({ name: '', emoji: '🛒', image: '', active: true }) }} className="inline-flex items-center gap-2 rounded-xl bg-green-700 px-4 py-2.5 text-sm font-bold text-white"><Plus size={17} /> Add category</button>} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {categories.map((category) => (
          <article key={category.name} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <img src={category.image} alt="" className="h-36 w-full bg-slate-100 object-cover" />
            <div className="p-4"><div className="flex items-center justify-between gap-3"><h2 className="font-bold text-slate-900">{category.emoji} {category.name}</h2><span className={`rounded-full px-2 py-1 text-xs font-bold ${category.active ? 'bg-green-50 text-green-800' : 'bg-slate-100 text-slate-600'}`}>{category.active ? 'Active' : 'Inactive'}</span></div><p className="mt-1 text-xs text-slate-500">{products.filter((product) => product.category === category.name).length} products</p><div className="mt-4 flex gap-2"><button type="button" onClick={() => { setError(''); setEditing({ ...category, originalName: category.name }) }} className="flex-1 rounded-lg border px-3 py-2 text-sm font-semibold hover:bg-slate-50">Edit</button><button type="button" onClick={() => { if (window.confirm(`Delete category “${category.name}”?`)) { try { onDelete(category.name) } catch (deleteError) { setError(deleteError.message) } } }} className="rounded-lg border border-red-100 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50">Delete</button></div></div>
          </article>
        ))}
      </div>
      {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      {editing && <Modal title={editing.originalName ? 'Edit category' : 'Add category'} onClose={() => setEditing(null)}><form onSubmit={submit} className="space-y-4"><Field name="name" label="Category name" value={editing.name} onChange={(name) => setEditing({ ...editing, name })} required /><Field name="emoji" label="Emoji/icon" value={editing.emoji} onChange={(emoji) => setEditing({ ...editing, emoji })} /><label className="block text-sm font-semibold text-slate-800">Category image<input name="imageFile" type="file" accept="image/*" className="mt-2 block w-full text-sm" /></label><label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={editing.active} onChange={(event) => setEditing({ ...editing, active: event.target.checked })} className="accent-green-700" /> Active in storefront</label>{error && <p role="alert" className="text-sm text-red-700">{error}</p>}<div className="flex justify-end gap-2"><button type="button" onClick={() => setEditing(null)} className="rounded-xl border px-4 py-2.5">Cancel</button><button type="submit" className="rounded-xl bg-green-700 px-4 py-2.5 font-bold text-white">Save category</button></div></form></Modal>}
    </>
  )
}

function OrderManagement({ orders, updateOrderStatus, navigate }) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('All')
  const [error, setError] = useState('')
  const visible = orders.filter((order) =>
    (filter === 'All' || getOrderStatus(order) === filter) &&
    `${order.orderId} ${order.customer?.name || ''}`.toLowerCase().includes(query.toLowerCase()),
  )

  function update(order, status) {
    setError('')
    try {
      updateOrderStatus(order.orderId, status)
    } catch (updateError) {
      setError(updateError.message)
    }
  }

  function cancel(order) {
    if (!canCancelOrder(order)) return
    if (!window.confirm(`Cancel order ${order.orderId}?`)) return
    update(order, CANCELLED_STATUS)
  }

  return (
    <>
      <PageHeading title="Orders Management" description="Updates are saved with the order and reflected on its tracking timeline." />
      <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_14rem]">
        <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3"><Search size={18} className="text-slate-500" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search Order ID or customer" className="w-full bg-transparent py-3 text-sm outline-none" /></label>
        <Field label="Filter status" value={filter} onChange={setFilter} options={[{ value: 'All', label: 'All statuses' }, ...ORDER_STATUSES.map((status) => ({ value: status, label: status })), { value: CANCELLED_STATUS, label: CANCELLED_STATUS }]} />
      </div>
      {error && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      {visible.length ? visible.map((order) => (
        <article key={order.orderId} className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-extrabold text-green-800">{order.orderId}</h2><p className="mt-1 text-sm text-slate-700">Customer · {maskPhoneNumber(order.customer?.phone)}</p><p className="mt-1 text-xs text-slate-500">{[order.customer?.upazila, order.customer?.district].filter(Boolean).join(', ')} · {order.createdAt}</p></div><p className="font-bold text-slate-900">{formatCurrency(order.total)}</p></div>
          <div className="mt-4 grid gap-4 border-t border-slate-100 pt-4 sm:grid-cols-[1fr_14rem_auto] sm:items-end">
            <div><p className="text-xs font-semibold uppercase text-slate-500">Items</p><p className="mt-1 text-sm text-slate-700">{order.items.map((item) => `${item.name} × ${item.quantity || 1}`).join(', ')}</p></div>
            <Field label="Update status" value={getOrderStatus(order)} onChange={(status) => update(order, status)} options={[...ORDER_STATUSES, ...(getOrderStatus(order) === CANCELLED_STATUS ? [CANCELLED_STATUS] : [])].map((status) => ({ value: status, label: status }))} />
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => navigate(`/track-order?orderId=${encodeURIComponent(order.orderId)}`)} className="rounded-xl border border-green-700 px-4 py-2.5 text-sm font-bold text-green-800 hover:bg-green-50">Tracking view</button>
              {canCancelOrder(order) && <button type="button" onClick={() => cancel(order)} className="rounded-xl border border-red-200 px-4 py-2.5 text-sm font-bold text-red-700 hover:bg-red-50">Cancel order</button>}
            </div>
          </div>
        </article>
      )) : <EmptyState>{orders.length ? 'No matching orders found.' : 'No orders have been saved yet.'}</EmptyState>}
    </>
  )
}

function CustomerManagement({ orders }) {
  const customers = useMemo(() => {
    const grouped = new Map()
    orders.forEach((order) => {
      const key = getCustomerKey(order)
      const current = grouped.get(key) || {
        key,
        name: order.customer?.name || 'Customer',
        phone: order.customer?.phone || '',
        area: [order.customer?.upazila, order.customer?.district].filter(Boolean).join(', '),
        orderIds: [],
        spending: 0,
      }
      current.orderIds.push(order.orderId)
      if (getOrderStatus(order) !== CANCELLED_STATUS) current.spending += Number(order.total || 0)
      grouped.set(key, current)
    })
    return [...grouped.values()].sort((a, b) => b.orderIds.length - a.orderIds.length)
  }, [orders])
  const [query, setQuery] = useState('')
  const filtered = customers.filter((customer) =>
    `${customer.name} ${customer.area} ${customer.orderIds.join(' ')}`.toLowerCase().includes(query.toLowerCase()),
  )

  return (
    <>
      <PageHeading title="Customers Management" description="Customer summaries are derived from saved demo orders; names are anonymized, phone numbers are masked, and street addresses are omitted." />
      <label className="mb-4 flex max-w-md items-center gap-2 rounded-xl border border-slate-200 bg-white px-3"><Search size={18} className="text-slate-500" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search customer or Order ID" className="w-full bg-transparent py-3 text-sm outline-none" /></label>
        {filtered.length ? <TableFrame><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr>{['Customer', 'Phone (masked)', 'Delivery area', 'Orders', 'Total spending'].map((label) => <th key={label} className="px-4 py-3">{label}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{filtered.map((customer, index) => <tr key={customer.key}><td className="px-4 py-3 font-semibold text-slate-900">Customer {index + 1}</td><td className="px-4 py-3">{maskPhoneNumber(customer.phone)}</td><td className="px-4 py-3">{customer.area || 'Not specified'}</td><td className="px-4 py-3">{customer.orderIds.length}<p className="max-w-52 truncate text-xs text-slate-500">{customer.orderIds.join(', ')}</p></td><td className="px-4 py-3 font-bold">{formatCurrency(customer.spending)}</td></tr>)}</tbody></TableFrame> : <EmptyState>No customer records from demo orders yet.</EmptyState>}
    </>
  )
}

function InventoryManagement({ products, stockHistory, updateStock }) {
  const [drafts, setDrafts] = useState({})
  const [error, setError] = useState('')
  function saveStock(product) {
    try {
      const value = drafts[product.id] ?? (Number.isFinite(product.stock) ? String(product.stock) : '')
      if (String(value).trim() === '') {
        throw new Error('Enter a whole-number stock quantity before saving.')
      }
      const next = Number(value)
      updateStock(product.id, next)
      setError('')
    } catch (updateError) {
      setError(updateError.message)
    }
  }

  return (
    <>
      <PageHeading title="Inventory Management" description="Stock counts and adjustment history are stored with the shared catalog." />
      {error && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      <TableFrame><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr>{['Product', 'Current stock', 'New stock', 'Status', 'Update'].map((head) => <th key={head} className="px-4 py-3">{head}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{products.map((product) => { const stock = product.stock; return <tr key={product.id}><td className="px-4 py-3 font-semibold">{product.name}</td><td className="px-4 py-3">{Number.isFinite(stock) ? stock : 'Not set'}</td><td className="px-4 py-3"><input type="number" min="0" step="1" value={drafts[product.id] ?? (Number.isFinite(stock) ? stock : '')} onChange={(event) => setDrafts({ ...drafts, [product.id]: event.target.value })} aria-label={`New stock for ${product.name}`} className="w-24 rounded-lg border border-slate-300 px-2 py-2" /></td><td className="px-4 py-3">{stock === 0 ? <span className="font-semibold text-red-700">Out of stock</span> : Number.isFinite(stock) && stock <= 5 ? <span className="font-semibold text-amber-700">Low stock</span> : Number.isFinite(stock) ? 'In stock' : 'Not tracked'}</td><td className="px-4 py-3"><button type="button" onClick={() => saveStock(product)} className="rounded-lg bg-green-700 px-3 py-2 text-xs font-bold text-white">Save</button></td></tr> })}</tbody></TableFrame>
      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="font-bold text-slate-900">Stock adjustment history</h2>{stockHistory.length ? <div className="mt-3 divide-y divide-slate-100">{stockHistory.slice(0, 20).map((entry) => <div key={entry.id} className="flex flex-wrap justify-between gap-2 py-3 text-sm"><span>{entry.productName}: {entry.previousStock ?? 'Not set'} → {entry.nextStock} <span className="text-slate-500">({entry.reason})</span></span><time className="text-xs text-slate-500">{formatStatusTimestamp(entry.timestamp)}</time></div>)}</div> : <p className="mt-2 text-sm text-slate-500">No stock updates recorded.</p>}</section>
    </>
  )
}

function OfferManagement({ offers, categories, products, addOffer, updateOffer, deleteOffer }) {
  const [editing, setEditing] = useState(null)
  const [error, setError] = useState('')

  function startCreate() {
    setEditing({
      code: '',
      discountType: 'percentage',
      discountValue: 10,
      minimumOrder: 0,
      maxDiscount: 0,
      usageLimit: 0,
      startDate: new Date().toISOString().slice(0, 10),
      expiryDate: '',
      active: true,
      targetMode: 'all',
      eligibleCategories: [],
      eligibleProductIds: [],
      singleUse: false,
    })
    setError('')
  }

  function submit(event) {
    event.preventDefault()
    const offer = {
      ...editing,
      code: editing.code.trim().toUpperCase(),
      discountValue: Number(editing.discountValue),
      minimumOrder: Number(editing.minimumOrder),
      maxDiscount: Number(editing.maxDiscount),
      usageLimit: Number(editing.usageLimit),
      active: Boolean(editing.active),
    }
    try {
      const percentInvalid = offer.discountType === 'percentage' &&
        (!Number.isFinite(offer.discountValue) || offer.discountValue <= 0 || offer.discountValue > 100)
      const amountInvalid = offer.discountType === 'fixed' &&
        (!Number.isFinite(offer.discountValue) || offer.discountValue <= 0)
      if (!/^[A-Z0-9_-]{3,30}$/.test(offer.code)) throw new Error('Use 3–30 letters, numbers, hyphens or underscores for the code.')
      if (percentInvalid || amountInvalid) throw new Error('Enter a valid discount value for the selected type.')
      if (!Number.isFinite(offer.minimumOrder) || offer.minimumOrder < 0 || !Number.isFinite(offer.maxDiscount) || offer.maxDiscount < 0 || !Number.isInteger(offer.usageLimit) || offer.usageLimit < 0) throw new Error('Minimum and maximum discount must be valid non-negative amounts; usage limit must be a whole number or zero.')
      if (!offer.startDate || !offer.expiryDate || offer.expiryDate < offer.startDate) throw new Error('Choose a valid start and expiry date.')
      if (offer.targetMode === 'categories' && !offer.eligibleCategories.length) throw new Error('Select at least one eligible category.')
      if (offer.targetMode === 'products' && !offer.eligibleProductIds.length) throw new Error('Select at least one eligible product.')
      if (editing.id) updateOffer(editing.id, offer)
      else addOffer(offer)
      setEditing(null)
      setError('')
    } catch (submitError) {
      setError(submitError.message)
    }
  }

  return (
    <>
      <PageHeading title="Offers & Coupons" description="Manage frontend demo coupons, redemption rules, and usage limits." action={<button type="button" onClick={startCreate} className="inline-flex items-center gap-2 rounded-xl bg-green-700 px-4 py-2.5 text-sm font-bold text-white"><Plus size={17} /> Create coupon</button>} />
      {offers.length ? <TableFrame><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr>{['Code', 'Discount', 'Eligibility', 'Min. order', 'Usage', 'Dates', 'Status', 'Actions'].map((head) => <th key={head} className="px-4 py-3">{head}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{offers.map((offer) => <tr key={offer.id}><td className="px-4 py-3 font-bold">{offer.code}{offer.demo && <span className="mt-1 block text-[10px] font-semibold uppercase text-slate-500">Demo</span>}</td><td className="px-4 py-3">{offer.discountType === 'percentage' ? `${offer.discountValue}%` : formatCurrency(offer.discountValue)}{offer.maxDiscount > 0 && <span className="block text-xs text-slate-500">Max {formatCurrency(offer.maxDiscount)}</span>}</td><td className="px-4 py-3 capitalize">{offer.targetMode === 'all' ? 'All products' : offer.targetMode}</td><td className="px-4 py-3">{formatCurrency(offer.minimumOrder)}</td><td className="px-4 py-3">{offer.usageCount || 0}{offer.usageLimit > 0 ? ` / ${offer.usageLimit}` : ' / ∞'}</td><td className="px-4 py-3">{offer.startDate}<span className="block text-xs text-slate-500">to {offer.expiryDate}</span></td><td className="px-4 py-3"><button type="button" onClick={() => updateOffer(offer.id, { active: !offer.active })} className={`rounded-full px-2.5 py-1 text-xs font-bold ${offer.active ? 'bg-green-50 text-green-800' : 'bg-slate-100 text-slate-600'}`}>{offer.active ? 'Active' : 'Inactive'}</button></td><td className="px-4 py-3"><div className="flex gap-2"><button type="button" onClick={() => { setEditing({ ...offer }); setError('') }} className="rounded-lg p-2 text-green-800 hover:bg-green-50" aria-label={`Edit ${offer.code}`}><Pencil size={16} /></button><button type="button" onClick={() => { if (window.confirm(`Delete coupon ${offer.code}?`)) deleteOffer(offer.id) }} className="rounded-lg p-2 text-red-700 hover:bg-red-50" aria-label={`Delete ${offer.code}`}><Trash2 size={16} /></button></div></td></tr>)}</tbody></TableFrame> : <EmptyState>No offers or coupons have been created.</EmptyState>}
      {error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}
      {editing && (
        <Modal title={editing.id ? 'Edit coupon' : 'Create coupon'} onClose={() => setEditing(null)}>
          <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2"><Field label="Coupon code" value={editing.code} onChange={(code) => setEditing({ ...editing, code: code.toUpperCase() })} required placeholder="e.g. SAVE20" /></div>
            <Field label="Discount type" value={editing.discountType} onChange={(discountType) => setEditing({ ...editing, discountType })} options={[{ value: 'percentage', label: 'Percentage discount' }, { value: 'fixed', label: 'Fixed amount discount' }]} />
            <Field label={editing.discountType === 'percentage' ? 'Discount percentage (%)' : 'Discount amount (৳)'} type="number" min="1" max={editing.discountType === 'percentage' ? '100' : undefined} step="1" value={editing.discountValue} onChange={(discountValue) => setEditing({ ...editing, discountValue })} required />
            <Field label="Minimum order (৳)" type="number" min="0" step="1" value={editing.minimumOrder} onChange={(minimumOrder) => setEditing({ ...editing, minimumOrder })} required />
            <Field label="Maximum discount (৳, 0 = no cap)" type="number" min="0" step="1" value={editing.maxDiscount} onChange={(maxDiscount) => setEditing({ ...editing, maxDiscount })} />
            <Field label="Usage limit (0 = unlimited)" type="number" min="0" step="1" value={editing.usageLimit} onChange={(usageLimit) => setEditing({ ...editing, usageLimit })} />
            <Field label="Start date" type="date" value={editing.startDate} onChange={(startDate) => setEditing({ ...editing, startDate })} required />
            <Field label="Expiry date" type="date" value={editing.expiryDate} onChange={(expiryDate) => setEditing({ ...editing, expiryDate })} required />
            <Field label="Eligible items" value={editing.targetMode} onChange={(targetMode) => setEditing({ ...editing, targetMode })} options={[{ value: 'all', label: 'All products' }, { value: 'categories', label: 'Selected categories' }, { value: 'products', label: 'Selected products' }]} />
            {editing.targetMode === 'categories' && (
              <fieldset className="max-h-40 space-y-2 overflow-y-auto rounded-xl border border-slate-200 p-3 sm:col-span-2">
                <legend className="px-1 text-sm font-semibold">Eligible categories</legend>
                {categories.map((category) => <label key={category.name} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editing.eligibleCategories.includes(category.name)} onChange={(event) => setEditing({ ...editing, eligibleCategories: event.target.checked ? [...editing.eligibleCategories, category.name] : editing.eligibleCategories.filter((name) => name !== category.name) })} />{category.name}</label>)}
              </fieldset>
            )}
            {editing.targetMode === 'products' && (
              <fieldset className="max-h-40 space-y-2 overflow-y-auto rounded-xl border border-slate-200 p-3 sm:col-span-2">
                <legend className="px-1 text-sm font-semibold">Eligible products</legend>
                {products.map((product) => <label key={product.id} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editing.eligibleProductIds.map(String).includes(String(product.id))} onChange={(event) => setEditing({ ...editing, eligibleProductIds: event.target.checked ? [...editing.eligibleProductIds, product.id] : editing.eligibleProductIds.filter((id) => String(id) !== String(product.id)) })} />{product.name}</label>)}
              </fieldset>
            )}
            <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={editing.singleUse} onChange={(event) => setEditing({ ...editing, singleUse: event.target.checked })} className="accent-green-700" /> One use per customer</label>
            <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={editing.active} onChange={(event) => setEditing({ ...editing, active: event.target.checked })} className="accent-green-700" /> Active</label>
            {error && <p role="alert" className="text-sm text-red-700 sm:col-span-2">{error}</p>}
            <p className="text-xs text-slate-500 sm:col-span-2">Usage: {editing.usageCount || 0}{editing.usageLimit > 0 ? ` / ${editing.usageLimit}` : ' redemptions; unlimited'}. This is frontend-only demo tracking.</p>
            <div className="flex justify-end gap-2 sm:col-span-2"><button type="button" onClick={() => setEditing(null)} className="rounded-xl border px-4 py-2.5">Cancel</button><button type="submit" className="rounded-xl bg-green-700 px-4 py-2.5 font-bold text-white">Save coupon</button></div>
          </form>
        </Modal>
      )}
    </>
  )
}

function DeliveryManagement({ locations, addLocation, removeLocation }) {
  const [area, setArea] = useState('')
  const [error, setError] = useState('')
  function submit(event) {
    event.preventDefault()
    try {
      addLocation(area)
      setArea('')
      setError('')
    } catch (addError) {
      setError(addError.message)
    }
  }
  return (
    <>
      <PageHeading title="Delivery Areas" description="Rajshahi is the only supported district. Configured areas are suggestions; customers can enter other localities within the district." />
      <section className="rounded-2xl border border-green-100 bg-green-50 p-5 text-sm text-green-950"><p><strong>Delivery Fee:</strong> ৳{DELIVERY_FEE}; free on product subtotal ৳{CONTACT_INFO.freeDeliveryMinimum}+</p><p className="mt-1"><strong>Estimated Delivery:</strong> 2–3 Hours</p><p className="mt-1"><strong>Operating Hours:</strong> 7 AM – 9 PM</p><p className="mt-1"><strong>Service District:</strong> Rajshahi only</p></section>
      <form onSubmit={submit} className="mt-5 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row"><label className="flex-1 text-sm font-semibold">Add serviceable area<input value={area} onChange={(event) => setArea(event.target.value)} placeholder="Area, upazila, union or village" className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5" /></label><button type="submit" className="self-end rounded-xl bg-green-700 px-4 py-2.5 text-sm font-bold text-white">Add area</button></form>
      {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
      <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="font-bold">Configured locations ({locations.length})</h2>{locations.length ? <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{locations.map((location) => <li key={location} className="flex items-center justify-between gap-2 rounded-xl border border-slate-100 px-3 py-2 text-sm"><span className="flex min-w-0 items-center gap-2 truncate"><MapPin size={15} className="shrink-0 text-green-700" />{location}</span><button type="button" aria-label={`Remove ${location}`} onClick={() => { if (window.confirm(`Remove ${location} from delivery areas?`)) removeLocation(location) }} className="rounded-lg p-1.5 text-red-700 hover:bg-red-50"><Trash2 size={15} /></button></li>)}</ul> : <p className="mt-3 text-sm text-slate-500">No serviceable areas configured.</p>}</section>
    </>
  )
}

function SettingsManagement({ settings, setSettings }) {
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  async function submit(event) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const logoFile = data.get('logoFile')
    try {
      const logo = logoFile?.size ? await readAsDataUrl(logoFile) : settings.logo
      setSettings({
        ...settings,
        currency: 'BDT (৳)',
        deliveryFee: DELIVERY_FEE,
        estimatedDelivery: '2–3 Hours',
        operatingHours: '7:00 AM – 9:00 PM',
        payments: ['Cash on Delivery', 'bKash', 'Nagad'],
        logo,
      })
      setSaved(true)
      setError('')
      window.setTimeout(() => setSaved(false), 2500)
    } catch (saveError) {
      setError(saveError.message)
    }
  }

  return (
    <>
      <PageHeading title="Store Settings" description="Demo-only browser settings. Delivery pricing and supported payment methods follow the fixed storefront policy." />
      <form onSubmit={submit} className="max-w-3xl space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="grid gap-4 sm:grid-cols-2"><Field label="Store name" value={settings.storeName} onChange={(storeName) => setSettings({ ...settings, storeName })} required /><Field label="Contact information" value={settings.contact} onChange={(contact) => setSettings({ ...settings, contact })} placeholder="Optional demo contact" /><div className="sm:col-span-2"><Field label="Store address" value={settings.address} onChange={(address) => setSettings({ ...settings, address })} required /></div></div>
        <label className="block text-sm font-semibold text-slate-800">Store logo<input name="logoFile" type="file" accept="image/*" className="mt-2 block w-full text-sm" /><span className="mt-1 block text-xs font-normal text-slate-500">Upload optional; saved in this browser only.</span></label>
        <div className="grid gap-3 rounded-xl bg-slate-50 p-4 text-sm sm:grid-cols-2"><p><strong>Currency:</strong> BDT (৳)</p><p><strong>Delivery fee:</strong> ৳{DELIVERY_FEE}; free on ৳{CONTACT_INFO.freeDeliveryMinimum}+ product subtotal</p><p><strong>Estimated delivery:</strong> 2–3 Hours</p><p><strong>Operating hours:</strong> 7:00 AM – 9:00 PM</p></div>
        <fieldset><legend className="text-sm font-bold text-slate-800">Demo payment methods (kept enabled)</legend><div className="mt-2 flex flex-wrap gap-2">{['Cash on Delivery', 'bKash', 'Nagad'].map((method) => <span key={method} className="rounded-full bg-green-50 px-3 py-1.5 text-sm font-semibold text-green-800">{method}</span>)}</div></fieldset>
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        {saved && <p role="status" className="text-sm font-semibold text-green-800">Settings saved in this browser.</p>}
        <button type="submit" className="rounded-xl bg-green-700 px-5 py-3 text-sm font-bold text-white">Save settings</button>
      </form>
    </>
  )
}

export default function AdminDashboard({ onLogout }) {
  const pathname = useLocation().pathname.replace(/\/+$/, '') || '/admin'
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const catalog = useCatalog()
  const delivery = useDelivery()
  const orderContext = useOrders()
  const page = PAGE_TITLES[pathname] ? pathname : '/admin'
  const customers = useMemo(() => {
    const keys = new Set(orderContext.orders.map(getCustomerKey))
    return [...keys]
  }, [orderContext.orders])

  function handleLogout() {
    onLogout()
  }

  let content
  switch (page) {
    case '/admin/products':
      content = <ProductManagement products={catalog.products} categories={catalog.categories} onAdd={catalog.addProduct} onUpdate={catalog.updateProduct} onDelete={catalog.deleteProduct} />
      break
    case '/admin/categories':
      content = <CategoryManagement categories={catalog.categories} products={catalog.products} onAdd={catalog.addCategory} onUpdate={catalog.updateCategory} onDelete={catalog.deleteCategory} />
      break
    case '/admin/orders':
      content = <OrderManagement orders={orderContext.orders} updateOrderStatus={orderContext.updateOrderStatus} navigate={navigate} />
      break
    case '/admin/customers':
      content = <CustomerManagement orders={orderContext.orders} />
      break
    case '/admin/inventory':
      content = <InventoryManagement products={catalog.products} stockHistory={catalog.stockHistory} updateStock={catalog.updateStock} />
      break
    case '/admin/offers':
      content = <OfferManagement offers={catalog.offers} categories={catalog.categories} products={catalog.products} addOffer={catalog.addOffer} updateOffer={catalog.updateOffer} deleteOffer={catalog.deleteOffer} />
      break
    case '/admin/notifications':
      content = <Suspense fallback={<p role="status" className="rounded-xl bg-white p-4 text-sm font-semibold text-green-900">Loading notification management…</p>}><AdminNotifications /></Suspense>
      break
    case '/admin/support':
      content = <Suspense fallback={<p role="status" className="rounded-xl bg-white p-4 text-sm font-semibold text-green-900">Loading support tickets…</p>}><AdminSupportTickets /></Suspense>
      break
    case '/admin/delivery':
      content = <DeliveryManagement locations={delivery.deliveryLocations} addLocation={delivery.addDeliveryLocation} removeLocation={delivery.removeDeliveryLocation} />
      break
    case '/admin/settings':
      content = <SettingsManagement settings={catalog.settings} setSettings={catalog.setSettings} />
      break
    default:
      content = <DashboardHome products={catalog.products} categories={catalog.categories} orders={orderContext.orders} customers={customers} navigate={navigate} />
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 lg:flex">
      {sidebarOpen && <button type="button" aria-label="Close admin navigation overlay" onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden" />}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-green-950 text-white transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between border-b border-green-900 px-5 py-5">
          <button type="button" onClick={() => navigate('/admin')} className="flex items-center gap-3 text-left">
            <span className="rounded-xl bg-green-700 p-2"><Package size={22} /></span>
            <span><span className="block font-extrabold">EasyBazar</span><span className="text-xs text-green-200">Admin demo</span></span>
          </button>
          <button type="button" onClick={() => setSidebarOpen(false)} aria-label="Close sidebar" className="rounded-lg p-2 text-green-100 hover:bg-green-900 lg:hidden"><X size={19} /></button>
        </div>
        <nav aria-label="Admin navigation" className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const active = page === item.path
            return <button key={item.path} type="button" onClick={() => { navigate(item.path); setSidebarOpen(false) }} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition ${active ? 'bg-green-700 text-white' : 'text-green-100 hover:bg-green-900'}`}><Icon size={18} />{item.label}</button>
          })}
        </nav>
        <div className="space-y-1 border-t border-green-900 p-3">
          <button type="button" onClick={() => navigate('/')} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-green-100 hover:bg-green-900"><ArrowLeft size={18} />Back to Store</button>
          <button type="button" onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-green-100 hover:bg-green-900"><LogOut size={18} />Logout (demo only)</button>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setSidebarOpen(true)} aria-label="Open admin navigation" className="rounded-lg p-2 hover:bg-slate-100 lg:hidden"><Menu size={21} /></button>
            <div><p className="text-xs font-semibold text-slate-500">EasyBazar · Demo Admin</p><p className="font-bold text-slate-900">{PAGE_TITLES[page]}</p></div>
          </div>
          <div className="flex items-center gap-2"><span className="hidden rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800 sm:inline-flex"><ShieldAlert size={14} className="mr-1" />Frontend demo</span><button type="button" onClick={() => navigate('/')} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold hover:bg-slate-50">View store</button></div>
        </header>
        <main className="mx-auto max-w-[1600px] p-4 sm:p-6 lg:p-8">
          {orderContext.loadError && <p role="alert" className="mb-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">{orderContext.loadError}</p>}
          {content}
        </main>
      </div>
    </div>
  )
}
