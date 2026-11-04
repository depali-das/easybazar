import { useState } from 'react'
import { ArrowLeft, ShieldAlert } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const DEMO_ADMIN_EMAIL = 'admin@easybazar.demo'
const DEMO_ADMIN_PASSWORD = 'easybazar-demo'

export default function AdminLogin({ onAuthenticated }) {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function submit(event) {
    event.preventDefault()
    if (
      email.trim().toLowerCase() !== DEMO_ADMIN_EMAIL ||
      password !== DEMO_ADMIN_PASSWORD
    ) {
      setError('Admin demo email or password is incorrect.')
      return
    }
    onAuthenticated()
  }

  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 p-4">
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
        <button type="button" onClick={() => navigate('/')} className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-green-800"><ArrowLeft size={17} /> Back to store</button>
        <div className="flex items-center gap-3">
          <span className="rounded-xl bg-green-100 p-3 text-green-800"><ShieldAlert size={23} /></span>
          <div><p className="text-sm font-bold text-green-800">EasyBazar</p><h1 className="text-2xl font-extrabold text-slate-900">Admin sign in</h1></div>
        </div>
        <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
          <strong>Frontend demo only.</strong> Admin access is kept in memory and resets when the page reloads. This client-side check is not secure authentication; protect admin data with a trusted backend before deployment.
        </p>
        <form onSubmit={submit} className="mt-5 space-y-4">
          <label className="block text-sm font-semibold text-slate-800">Demo admin email<input required type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100" /></label>
          <label className="block text-sm font-semibold text-slate-800">Demo password<input required type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100" /></label>
          {error && <p role="alert" className="text-sm font-semibold text-red-700">{error}</p>}
          <button type="submit" className="w-full rounded-xl bg-green-800 px-5 py-3 font-bold text-white hover:bg-green-900">Sign in to demo admin</button>
        </form>
        <p className="mt-4 text-xs leading-5 text-slate-500">Demo credentials: <code>admin@easybazar.demo</code> / <code>easybazar-demo</code>. Do not reuse real credentials.</p>
      </section>
    </main>
  )
}
