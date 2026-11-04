import { useState } from 'react'
import { Eye, EyeOff, LockKeyhole, X } from 'lucide-react'

export default function AuthDialog({ onClose, onAuthenticate }) {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const isSignup = mode === 'signup'

  function updateField(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (isSignup && form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setSubmitting(true)
    setError('')
    try {
      await onAuthenticate(mode, form)
      onClose()
    } catch (authError) {
      setError(authError.message || 'Unable to complete demo authentication.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/50 p-4">
      <button
        type="button"
        className="absolute inset-0 h-full w-full"
        onClick={onClose}
        aria-label="Close authentication dialog"
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-dialog-title"
        className="relative z-10 max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-2 text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-4 focus:ring-slate-200"
          aria-label="Close authentication dialog"
        >
          <X size={20} aria-hidden="true" />
        </button>

        <div className="mb-6 flex items-center gap-3">
          <span className="rounded-xl bg-green-50 p-3 text-green-700" aria-hidden="true">
            <LockKeyhole size={22} aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-semibold text-green-700">EasyBazar demo</p>
            <h2 id="auth-dialog-title" className="text-2xl font-extrabold text-slate-900">
              {isSignup ? 'Create account' : 'Welcome back'}
            </h2>
          </div>
        </div>

        <p className="mb-5 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-900">
          Demo only: this browser-only account is not secure and does not provide real authentication.
          Do not use a real or reused password.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignup && (
            <label className="block text-sm font-medium text-slate-700">
              Full name
              <input
                name="name"
                value={form.name}
                onChange={updateField}
                required
                autoComplete="name"
                className="mt-1.5 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />
            </label>
          )}

          <label className="block text-sm font-medium text-slate-700">
            Email
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={updateField}
              required
              autoComplete="email"
              className="mt-1.5 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Password
            <span className="relative mt-1.5 block">
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={updateField}
                required
                minLength={8}
                autoComplete={isSignup ? 'new-password' : 'current-password'}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 pr-12 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />
              <button
                type="button"
                onClick={() => setShowPassword((shown) => !shown)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-4 focus:ring-slate-200"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
              </button>
            </span>
          </label>

          {isSignup && (
            <label className="block text-sm font-medium text-slate-700">
              Confirm password
              <input
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                value={form.confirmPassword}
                onChange={updateField}
                required
                minLength={8}
                autoComplete="new-password"
                className="mt-1.5 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />
            </label>
          )}

          {error && (
            <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-green-700 px-5 py-3 font-semibold text-white transition hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-200 disabled:cursor-wait disabled:opacity-60"
          >
            {submitting ? 'Please wait…' : isSignup ? 'Create demo account' : 'Log in'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-700">
          {isSignup ? 'Already have an account?' : 'New to EasyBazar?'}{' '}
          <button
            type="button"
            onClick={() => {
              setMode(isSignup ? 'login' : 'signup')
              setError('')
            }}
            className="font-semibold text-green-700 hover:text-green-900 focus:outline-none focus:underline"
          >
            {isSignup ? 'Log in' : 'Create account'}
          </button>
        </p>
      </section>
    </div>
  )
}