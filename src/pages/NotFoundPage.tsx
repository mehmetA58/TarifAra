import { Link } from 'react-router-dom'
import { useTranslation } from '../context/I18nContext'

export default function NotFoundPage() {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col items-center justify-center text-center py-24 gap-4">
      <p className="text-8xl font-black text-stone-200 dark:text-stone-800">404</p>
      <h1 className="text-xl font-semibold text-stone-700 dark:text-stone-300">{t.notFound.heading}</h1>
      <p className="text-sm text-stone-400">{t.notFound.description}</p>
      <Link to="/" className="mt-2 inline-flex items-center gap-1.5 bg-brand-500 hover:bg-brand-600 text-white font-medium text-sm px-5 py-2.5 rounded-xl transition-colors duration-150 min-h-11">
        {t.notFound.home}
      </Link>
    </div>
  )
}
