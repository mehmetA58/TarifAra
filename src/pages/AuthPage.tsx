import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from '../context/I18nContext'

export default function AuthPage() {
  const { signIn, signUp } = useAuth()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const err = mode === 'signin'
      ? await signIn(email, password)
      : await signUp(email, password)
    setLoading(false)
    if (err) {
      setError(err.message)
    } else {
      navigate('/')
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-12 px-4">
      <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-50 mb-6 text-center">
        {mode === 'signin' ? t.auth.signIn : t.auth.signUp}
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
            {t.auth.email}
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-brand-500 transition-shadow"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
            {t.auth.password}
          </label>
          <input
            id="password"
            type="password"
            required
            autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-brand-500 transition-shadow"
          />
        </div>

        {error && (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full min-h-11 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors duration-150"
        >
          {loading ? '...' : mode === 'signin' ? t.auth.signIn : t.auth.signUp}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-stone-500 dark:text-stone-400">
        {mode === 'signin' ? t.auth.noAccount : t.auth.hasAccount}{' '}
        <button
          onClick={() => { setMode(m => m === 'signin' ? 'signup' : 'signin'); setError(null) }}
          className="text-brand-500 hover:underline font-medium"
        >
          {mode === 'signin' ? t.auth.signUp : t.auth.signIn}
        </button>
      </p>
    </div>
  )
}
