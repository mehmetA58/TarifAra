import { NavLink, Link } from 'react-router-dom'
import { useDarkMode } from '../hooks/useDarkMode'
import { useTranslation } from '../context/I18nContext'
import { useAuth } from '../context/AuthContext'
import type { ReactNode } from 'react'
import type { Locale } from '../i18n'

const localeOptions: Array<{ key: Locale; label: string }> = [
  { key: 'en', label: 'EN' },
  { key: 'tr', label: 'TR' },
  { key: 'es', label: 'ES' },
]

export default function Layout({ children }: { children: ReactNode }) {
  const [dark, toggleDark] = useDarkMode()
  const { t, locale, setLocale } = useTranslation()
  const { user, signOut } = useAuth()

  const navItems = [
    { to: '/', label: t.nav.explore, end: true },
    { to: '/favorites', label: t.nav.favorites },
    { to: '/planner', label: t.nav.planner },
    { to: '/shopping', label: t.nav.shopping },
  ]

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-[oklch(14%_0.02_60)] text-stone-900 dark:text-stone-100">
      <header className="sticky top-0 z-10 border-b border-stone-200 dark:border-stone-800 bg-white/90 dark:bg-stone-900/90 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-6">
          <span className="font-bold text-brand-500 text-lg tracking-tight shrink-0">TarifAra</span>
          <nav className="flex items-center gap-1 flex-1 overflow-x-auto">
            {navItems.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors duration-150 min-h-9 flex items-center
                  ${isActive
                    ? 'bg-brand-50 dark:bg-brand-700/20 text-brand-600 dark:text-brand-400'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-1 shrink-0">
            {localeOptions.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setLocale(key)}
                aria-label={`Switch language to ${label}`}
                aria-pressed={locale === key}
                className={`px-2 py-1 rounded text-xs font-semibold transition-colors min-h-7
                  ${locale === key
                    ? 'bg-brand-500 text-white'
                    : 'text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
                  }`}
              >
                {label}
              </button>
            ))}
          </div>
          {user ? (
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-stone-500 dark:text-stone-400 hidden sm:block max-w-24 truncate">
                {user.email}
              </span>
              <button
                onClick={signOut}
                aria-label={t.auth.signOut}
                className="px-2 py-1 rounded text-xs font-semibold text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors min-h-7"
              >
                {t.auth.signOut}
              </button>
            </div>
          ) : (
            <Link
              to="/auth"
              className="px-2 py-1 rounded text-xs font-semibold text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-700/20 transition-colors min-h-7 flex items-center shrink-0"
            >
              {t.auth.signIn}
            </Link>
          )}
          <button
            onClick={toggleDark}
            aria-label={dark ? t.darkMode.toLight : t.darkMode.toDark}
            className="min-h-9 min-w-9 flex items-center justify-center rounded-lg text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors duration-150 text-base shrink-0"
          >
            {dark ? '☀' : '☾'}
          </button>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  )
}
