import { createContext, useContext, useCallback } from 'react'
import type { ReactNode } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { locales, defaultLocale } from '../i18n'
import type { Locale, Messages } from '../i18n'

interface I18nContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: Messages
}

const I18nContext = createContext<I18nContextValue | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleRaw] = useLocalStorage<Locale>('locale', defaultLocale)

  const setLocale = useCallback((l: Locale) => setLocaleRaw(l), [setLocaleRaw])

  const t = locales[locale] ?? locales[defaultLocale]

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useTranslation() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useTranslation must be used within I18nProvider')
  return ctx
}
