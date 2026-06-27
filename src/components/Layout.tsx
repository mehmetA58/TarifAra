import { NavLink, Link } from 'react-router-dom'
import { useDarkMode } from '../hooks/useDarkMode'
import { useTranslation } from '../context/I18nContext'
import { useAuth } from '../context/AuthContext'
import BottomNav from './BottomNav'
import { useInstallPrompt } from '../hooks/useInstallPrompt'
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
  const { isInstallable, promptInstall } = useInstallPrompt()

  const navItems = [
    { to: '/', label: t.nav.explore, end: true },
    { to: '/favorites', label: t.nav.favorites },
    { to: '/planner', label: t.nav.planner },
    { to: '/shopping', label: t.nav.shopping },
    { to: '/pantry', label: t.nav.pantry },
  ]

  return (
    <div className="min-h-screen bg-[#070707] text-[#BDBDBD] dark:bg-[#070707] dark:text-[#BDBDBD]"
         style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <header className="glass sticky top-0 z-10 border-b border-white/10">
        <div className="max-w-[1280px] mx-auto px-4 h-14 flex items-center gap-6">
          <span className="font-semibold text-[#D9A35F] text-lg tracking-tight shrink-0"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            TarifAra
          </span>
          <nav className="hidden md:flex items-center gap-1 flex-1 overflow-x-auto">
            {navItems.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors duration-150 min-h-11 flex items-center
                  ${isActive
                    ? 'bg-[#D9A35F]/10 text-[#D9A35F] border border-[#D9A35F]/20'
                    : 'text-[#BDBDBD] hover:text-white hover:bg-white/5'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-1 shrink-0 ml-auto md:ml-0">
            {localeOptions.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setLocale(key)}
                aria-label={`Switch language to ${label}`}
                aria-pressed={locale === key}
                className={`px-2 py-1 rounded text-xs font-semibold transition-colors min-h-9
                  ${locale === key
                    ? 'bg-[#D9A35F] text-[#070707]'
                    : 'text-[#BDBDBD] hover:bg-white/5 hover:text-white'
                  }`}
              >
                {label}
              </button>
            ))}
          </div>
          {user ? (
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-[#BDBDBD]/60 hidden sm:block max-w-24 truncate">
                {user.email}
              </span>
              <button
                onClick={signOut}
                aria-label={t.auth.signOut}
                className="px-2 py-1 rounded text-xs font-semibold text-[#BDBDBD] hover:bg-white/5 hover:text-white transition-colors min-h-9"
              >
                {t.auth.signOut}
              </button>
            </div>
          ) : (
            <Link
              to="/auth"
              className="px-2 py-1 rounded text-xs font-semibold text-[#D9A35F] hover:bg-[#D9A35F]/10 transition-colors min-h-9 flex items-center shrink-0"
            >
              {t.auth.signIn}
            </Link>
          )}
          {isInstallable && (
            <button
              onClick={promptInstall}
              className="hidden md:flex items-center gap-1.5 min-h-9 px-3 rounded-xl border border-[#D9A35F] text-[#D9A35F] text-xs font-medium hover:bg-[#D9A35F]/10 transition-colors shrink-0"
            >
              ⬇ Install
            </button>
          )}
          <button
            onClick={toggleDark}
            aria-label={dark ? t.darkMode.toLight : t.darkMode.toDark}
            className="min-h-11 min-w-11 flex items-center justify-center rounded-lg text-[#BDBDBD] hover:bg-white/5 hover:text-white transition-colors duration-150 text-base shrink-0"
          >
            {dark ? '☀' : '☾'}
          </button>
        </div>
      </header>
      <main className="max-w-[1280px] mx-auto px-4 py-6 pb-20 md:pb-6">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
