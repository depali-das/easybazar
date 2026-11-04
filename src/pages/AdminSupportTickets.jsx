import { useEffect, useMemo, useState } from 'react'
import { Headphones, Search } from 'lucide-react'
import {
  getSupportRequests,
  SUPPORT_STATUSES,
  updateSupportRequestStatus,
} from '../utils/supportStorage.js'

function formatDate(value) {
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? 'Date unavailable'
    : new Intl.DateTimeFormat('en-BD', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

export default function AdminSupportTickets() {
  const [requests, setRequests] = useState([])
  const [query, setQuery] = useState('')
  const [error, setError] = useState('')
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    function refresh() {
      try {
        setRequests(getSupportRequests())
        setLoadError('')
      } catch (loadFailure) {
        setLoadError(loadFailure.message)
      }
    }
    refresh()
    window.addEventListener('easybazar-support-requests-updated', refresh)
    return () => window.removeEventListener('easybazar-support-requests-updated', refresh)
  }, [])

  const filteredRequests = useMemo(() => {
    const search = query.trim().toLowerCase()
    if (!search) return requests
    return requests.filter((request) =>
      `${request.id} ${request.name} ${request.email} ${request.phone} ${request.subject} ${request.orderId}`
        .toLowerCase()
        .includes(search),
    )
  }, [query, requests])

  function changeStatus(requestId, status) {
    setError('')
    try {
      updateSupportRequestStatus(requestId, status)
    } catch (updateError) {
      setError(updateError.message)
    }
  }

  return (
    <section>
      <header className="mb-5">
        <p className="text-sm font-bold uppercase tracking-wide text-green-800">Frontend demo · Local browser tickets</p>
        <h1 className="mt-1 flex items-center gap-2 text-2xl font-extrabold text-slate-900"><Headphones size={25} /> Support Tickets</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">View and update demo tickets saved in this browser. Status changes are local only and do not notify customers on another device.</p>
      </header>
      <label className="mb-4 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3">
        <Search size={18} className="text-slate-500" />
        <input value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Search support tickets" placeholder="Search ticket, customer, subject, order..." className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none" />
      </label>
      {loadError && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-800">{loadError}</p>}
      {error && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      {filteredRequests.length ? (
        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <article key={request.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="break-all font-mono text-xs font-bold text-green-800">{request.id}</p>
                  <h2 className="mt-1 text-lg font-bold text-slate-900">{request.subject}</h2>
                  <p className="mt-1 text-sm text-slate-700">{request.name} · {request.phone}{request.email ? ` · ${request.email}` : ''}</p>
                  <p className="mt-1 text-xs text-slate-500">{request.category} · {formatDate(request.createdAt)}{request.orderId ? ` · Order ${request.orderId}` : ''}</p>
                </div>
                <label className="text-sm font-semibold text-slate-700">Status
                  <select value={SUPPORT_STATUSES.includes(request.status) ? request.status : 'Pending'} onChange={(event) => changeStatus(request.id, event.target.value)} className="mt-1 block min-w-36 rounded-lg border border-slate-300 bg-white px-3 py-2.5">
                    {SUPPORT_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
                  </select>
                </label>
              </div>
              <details className="mt-4 rounded-xl bg-slate-50 p-3">
                <summary className="cursor-pointer text-sm font-semibold text-slate-800">Read customer message</summary>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">{request.message}</p>
              </details>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-600">
          {requests.length ? 'No tickets match your search.' : 'No support requests have been saved in this browser.'}
        </div>
      )}
    </section>
  )
}
