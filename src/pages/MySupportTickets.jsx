import { useEffect, useState } from 'react'
import { ArrowLeft, ClipboardList, Inbox } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getSupportRequests, SUPPORT_STATUSES } from '../utils/supportStorage.js'

function formatCreatedDate(value) {
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? 'Date unavailable'
    : new Intl.DateTimeFormat('en-BD', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

function statusStyle(status) {
  if (status === 'Resolved') return 'bg-green-100 text-green-900'
  if (status === 'In Progress') return 'bg-blue-100 text-blue-900'
  return 'bg-amber-100 text-amber-900'
}

export default function MySupportTickets({ account, onSignIn }) {
  const navigate = useNavigate()
  const [requests, setRequests] = useState([])
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    function refreshRequests() {
      try {
        const savedRequests = getSupportRequests()
        setRequests(account?.customerId
          ? savedRequests.filter((request) => request.customerId === account.customerId)
          : [])
        setLoadError('')
      } catch (error) {
        setLoadError(error.message)
      }
    }
    refreshRequests()
    window.addEventListener('easybazar-support-requests-updated', refreshRequests)
    return () => window.removeEventListener('easybazar-support-requests-updated', refreshRequests)
  }, [account?.customerId])

  return (
    <main className="min-h-screen bg-[#f8faf7] px-4 py-8 pb-20 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-4xl">
        <button type="button" onClick={() => navigate('/')} className="mb-6 inline-flex items-center gap-2 rounded-lg font-semibold text-slate-700 hover:text-green-800 focus:outline-none focus:ring-4 focus:ring-green-100">
          <ArrowLeft size={18} aria-hidden="true" /> Back to EasyBazar
        </button>
        <header className="mb-6 flex items-center gap-3">
          <ClipboardList className="text-green-800" size={30} aria-hidden="true" />
          <div>
            <p className="font-semibold text-green-800">EasyBazar</p>
            <h1 className="text-3xl font-extrabold text-slate-900">My Support Tickets</h1>
          </div>
        </header>

        <p className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
          Demo mode: tickets linked to your signed-in demo customer are read from this browser’s LocalStorage only. There is no secure identity verification, staff notification, or support server.
        </p>
        {!account && <p className="mb-5 rounded-xl bg-white p-4 text-sm text-slate-700">Sign in to see support tickets linked to your demo customer. <button type="button" onClick={onSignIn} className="font-bold text-green-800 underline">Log in / Sign up</button></p>}
        {loadError && <p role="alert" className="mb-5 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-800">{loadError}</p>}

        {!loadError && requests.length === 0 && (
          <section className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <Inbox className="mx-auto text-slate-400" size={42} aria-hidden="true" />
            <h2 className="mt-3 text-xl font-bold text-slate-900">No support requests yet</h2>
            <p className="mt-2 text-sm text-slate-600">Requests you submit in this browser will appear here.</p>
            <button type="button" onClick={() => navigate('/support')} className="mt-5 rounded-xl bg-green-700 px-5 py-3 font-bold text-white hover:bg-green-800">Submit a Support Request</button>
          </section>
        )}

        <div className="space-y-4">
          {requests.map((request) => {
            const status = SUPPORT_STATUSES.includes(request.status) ? request.status : 'Pending'
            return (
              <article key={request.id} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Ticket ID</p>
                    <p className="mt-1 break-all font-mono text-sm font-bold text-green-900">{request.id}</p>
                    <h2 className="mt-2 text-lg font-bold text-slate-900">{request.subject}</h2>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusStyle(status)}`}>{status}</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
                  <span>{request.category}</span>
                  <span>{formatCreatedDate(request.createdAt)}</span>
                  {request.orderId && <span>Order ID: {request.orderId}</span>}
                </div>
                <details className="mt-4 rounded-xl bg-slate-50 p-3">
                  <summary className="cursor-pointer text-sm font-semibold text-slate-800">View request details</summary>
                  <dl className="mt-3 space-y-2 text-sm">
                    <div><dt className="inline font-semibold text-slate-800">Customer: </dt><dd className="inline text-slate-700">{request.name}</dd></div>
                    <div><dt className="inline font-semibold text-slate-800">Phone: </dt><dd className="inline text-slate-700">{request.phone}</dd></div>
                    {request.email && <div><dt className="inline font-semibold text-slate-800">Email: </dt><dd className="inline text-slate-700">{request.email}</dd></div>}
                    <div><dt className="font-semibold text-slate-800">Message</dt><dd className="mt-1 whitespace-pre-wrap text-slate-700">{request.message}</dd></div>
                  </dl>
                </details>
              </article>
            )
          })}
        </div>
      </div>
    </main>
  )
}
