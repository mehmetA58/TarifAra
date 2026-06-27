import { NavLink } from 'react-router-dom'
import { useTranslation } from '../context/I18nContext'

const NAV_ITEMS = [
  { to: '/',          icon: '🍽',  key: 'explore'   },
  { to: '/favorites', icon: '❤️',  key: 'favorites' },
  { to: '/planner',   icon: '📅',  key: 'planner'   },
  { to: '/shopping',  icon: '🛒',  key: 'shopping'  },
  { to: '/pantry',    icon: '📦',  key: 'pantry'    },
] as const

export default function BottomNav() {
  const { t } = useTranslation()

  return (
    <nav
      className="bottom-nav-safe fixed bottom-0 left-0 right-0 z-20 bg-white dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 md:hidden"
      aria-label="Main navigation"
    >
      <ul className="flex">
        {NAV_ITEMS.map(({ to, icon, key }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-0.5 min-h-[56px] w-full text-xs font-medium transition-colors duration-150 ${
                  isActive
                    ? 'text-brand-500'
                    : 'text-stone-500 dark:text-stone-400'
                }`
              }
              aria-label={t.nav[key as keyof typeof t.nav]}
            >
              <span className="text-lg leading-none" aria-hidden="true">{icon}</span>
              <span className="truncate max-w-full px-1">{t.nav[key as keyof typeof t.nav]}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
