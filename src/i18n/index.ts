import { messages as en } from './en'
import { messages as tr } from './tr'
import { messages as es } from './es'

export type Locale = 'en' | 'tr' | 'es'
export type Messages = typeof en

export const locales: Record<Locale, Messages> = { en, tr, es }
export const defaultLocale: Locale = 'en'
