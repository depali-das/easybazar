import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CONTACT_INFO } from '../config/contact.js'
import { saveSupportRequest } from '../utils/supportStorage.js'

const ISSUE_CATEGORIES = [
  'Order Problem',
  'Delivery Problem',
  'Payment Problem',
  'Product Quality',
  'Return / Refund',
  'Account Problem',
  'Other',
]

function createEmptyForm(orderId = '', category = '') {
  return {
    name: '',
    phone: '',
    email: '',
    orderId,
    category: ISSUE_CATEGORIES.includes(category) ? category : '',
    subject: '',
    message: '',
  }
}

function isValidBangladeshPhone(phone) {
  return /^(?:(?:\+?88)?01[3-9]\d{8})$/.test(phone.replace(/[\s()-]/g, ''))
}

export default function ContactForm({
  initialOrderId = '',
  initialCategory = '',
  account = null,
  onSignIn,
}) {
  const navigate = useNavigate()
  const [form, setForm] = useState(() => ({
    ...createEmptyForm(initialOrderId, initialCategory),
    name: account?.name || '',
    email: account?.email || '',
  }))
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [ticketId, setTicketId] = useState('')

  function updateField(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: '' }))
    setSubmitError('')
  }

  function validate() {
    const nextErrors = {}
    if (!form.name.trim()) nextErrors.name = 'Please enter your name.'
    if (!form.phone.trim()) nextErrors.phone = 'Please enter your phone number.'
    else if (!isValidBangladeshPhone(form.phone.trim())) {
      nextErrors.phone = 'Enter a valid Bangladesh mobile number, e.g. 01712345678.'
    }
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      nextErrors.email = 'Enter a valid email address or leave this field empty.'
    }
    if (!form.category) nextErrors.category = 'Please choose an issue category.'
    if (!form.subject.trim()) nextErrors.subject = 'Please enter a subject.'
    if (!form.message.trim()) nextErrors.message = 'Please describe how we can help.'
    return nextErrors
  }

  function submitRequest(event) {
    event.preventDefault()
    const nextErrors = validate()
    setErrors(nextErrors)
    setTicketId('')
    if (Object.keys(nextErrors).length) return

    try {
      const request = saveSupportRequest({ ...form, customerId: account?.customerId || '' })
      setTicketId(request.id)
      setForm(createEmptyForm())
      setErrors({})
      setSubmitError('')
    } catch (error) {
      setSubmitError(error.message)
    }
  }

  function resetForm() {
    setForm(createEmptyForm(initialOrderId, initialCategory))
    setErrors({})
    setSubmitError('')
    setTicketId('')
  }

  const fields = [
    { name: 'name', label: 'Customer Name', required: true, autoComplete: 'name' },
    { name: 'phone', label: 'Phone Number', required: true, type: 'tel', autoComplete: 'tel', placeholder: '01712345678' },
    { name: 'email', label: 'Email (Optional)', type: 'email', autoComplete: 'email' },
    { name: 'orderId', label: 'Order ID (Optional)', placeholder: 'e.g. EB...' },
  ]

  return (
    <section aria-labelledby="support-form-title" className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-7">
      <div className="mb-5">
        <p className="text-sm font-bold uppercase tracking-wide text-green-800">Send us a message</p>
        <h2 id="support-form-title" className="mt-1 text-2xl font-extrabold text-slate-900">Submit a Support Request</h2>
        <p className="mt-2 text-sm text-slate-600">
          Call <a className="font-semibold text-green-800 hover:underline" href={`tel:${CONTACT_INFO.phoneLink}`}>{CONTACT_INFO.phone}</a>
          {' '}or email <a className="font-semibold text-green-800 hover:underline" href={`mailto:${CONTACT_INFO.email}`}>{CONTACT_INFO.email}</a>.
        </p>
      </div>

      {ticketId && (
        <div role="status" className="mb-5 rounded-xl border border-green-200 bg-green-50 p-4 text-green-950">
          <p className="font-bold">Your support request was saved.</p>
          <p className="mt-1 text-sm">Support Ticket ID: <strong>{ticketId}</strong></p>
          <p className="mt-1 text-xs">Demo only — this ticket is saved in this browser; no staff notification is sent.</p>
          <button type="button" onClick={() => navigate('/support/tickets')} className="mt-3 text-sm font-bold text-green-800 underline underline-offset-2">View My Support Tickets</button>
        </div>
      )}
      {!account && onSignIn && (
        <p className="mb-4 text-sm text-slate-600">Have a demo account? <button type="button" onClick={onSignIn} className="font-bold text-green-800 underline">Sign in</button> so this ticket is linked to your customer profile.</p>
      )}
      {submitError && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-800">{submitError}</p>}

      <form noValidate onSubmit={submitRequest} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          {fields.map((field) => (
            <label key={field.name} className="block text-sm font-semibold text-slate-800">
              {field.label}
              <input
                name={field.name}
                type={field.type || 'text'}
                value={form[field.name]}
                onChange={updateField}
                required={field.required}
                autoComplete={field.autoComplete}
                placeholder={field.placeholder}
                aria-invalid={Boolean(errors[field.name])}
                aria-describedby={errors[field.name] ? `${field.name}-error` : undefined}
                className={`mt-1.5 w-full rounded-xl border bg-white px-3 py-3 text-sm outline-none focus:ring-2 ${errors[field.name] ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : 'border-slate-300 focus:border-green-600 focus:ring-green-100'}`}
              />
              {errors[field.name] && <span id={`${field.name}-error`} className="mt-1 block text-xs font-medium text-red-700">{errors[field.name]}</span>}
            </label>
          ))}
          <label className="block text-sm font-semibold text-slate-800">
            Issue Category
            <select
              name="category"
              value={form.category}
              onChange={updateField}
              required
              aria-invalid={Boolean(errors.category)}
              aria-describedby={errors.category ? 'category-error' : undefined}
              className={`mt-1.5 w-full rounded-xl border bg-white px-3 py-3 text-sm outline-none focus:ring-2 ${errors.category ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : 'border-slate-300 focus:border-green-600 focus:ring-green-100'}`}
            >
              <option value="">Choose an issue</option>
              {ISSUE_CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
            {errors.category && <span id="category-error" className="mt-1 block text-xs font-medium text-red-700">{errors.category}</span>}
          </label>
          <label className="block text-sm font-semibold text-slate-800 sm:col-span-2">
            Subject
            <input
              name="subject"
              value={form.subject}
              onChange={updateField}
              required
              aria-invalid={Boolean(errors.subject)}
              aria-describedby={errors.subject ? 'subject-error' : undefined}
              className={`mt-1.5 w-full rounded-xl border bg-white px-3 py-3 text-sm outline-none focus:ring-2 ${errors.subject ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : 'border-slate-300 focus:border-green-600 focus:ring-green-100'}`}
            />
            {errors.subject && <span id="subject-error" className="mt-1 block text-xs font-medium text-red-700">{errors.subject}</span>}
          </label>
          <label className="block text-sm font-semibold text-slate-800 sm:col-span-2">
            Message
            <textarea
              name="message"
              value={form.message}
              onChange={updateField}
              required
              rows={5}
              aria-invalid={Boolean(errors.message)}
              aria-describedby={errors.message ? 'message-error' : undefined}
              placeholder="Tell us what happened and how we can help."
              className={`mt-1.5 w-full resize-y rounded-xl border bg-white px-3 py-3 text-sm outline-none focus:ring-2 ${errors.message ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : 'border-slate-300 focus:border-green-600 focus:ring-green-100'}`}
            />
            {errors.message && <span id="message-error" className="mt-1 block text-xs font-medium text-red-700">{errors.message}</span>}
          </label>
        </div>
        <p className="rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-900">
          Demo support system: requests are saved only in this browser. They are not sent to staff or a server, and are not a secure channel for sensitive information.
        </p>
        <div className="flex flex-wrap gap-3">
          <button type="submit" className="rounded-xl bg-green-700 px-5 py-3 font-bold text-white hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-200">Submit Request</button>
          <button type="button" onClick={resetForm} className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-100">Reset Form</button>
        </div>
      </form>
    </section>
  )
}
