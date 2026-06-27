import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getMealById, parseIngredients } from '../api/mealdb'
import type { MealDetail, Ingredient } from '../types/meal'
import { useAppContext } from '../context/AppContext'
import { useTranslation } from '../context/I18nContext'

export default function MealDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const [meal, setMeal] = useState<MealDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toggleFavorite, isFavorite } = useAppContext()

  useEffect(() => {
    if (!id) return

    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const result = await getMealById(id!)
        if (!cancelled) setMeal(result)
      } catch (err) {
        if (!cancelled)
          setError(err instanceof Error ? err.message : t.error.generic)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [id, t.error.generic])

  if (loading) return (
    <div className="animate-pulse space-y-4">
      <div className="h-5 w-20 bg-stone-200 dark:bg-stone-700 rounded-full" />
      <div className="aspect-video w-full bg-stone-200 dark:bg-stone-700 rounded-2xl" />
      <div className="h-8 bg-stone-200 dark:bg-stone-700 rounded-xl w-2/3" />
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-4 bg-stone-200 dark:bg-stone-700 rounded-full" style={{ width: `${70 + (i % 3) * 10}%` }} />
        ))}
      </div>
    </div>
  )

  if (error) return (
    <div role="alert" className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3">
      &#9888; {error}
    </div>
  )

  if (!meal) return (
    <div role="alert" className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3">
      {t.meals.notFound}
    </div>
  )

  const ingredients: Ingredient[] = parseIngredients(meal)
  const instructions = meal.strInstructions
    .split('\n')
    .filter((s) => s.trim())

  return (
    <div>
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-brand-600 dark:text-brand-400 font-medium hover:underline min-h-9 mb-2">
        {t.detail.back}
      </Link>

      <img
        src={meal.strMealThumb}
        alt={meal.strMeal}
        className="w-full max-h-80 object-cover rounded-2xl mt-2 shadow-md"
      />

      <div className="mt-5 flex flex-wrap items-start gap-3">
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-50 flex-1">{meal.strMeal}</h1>
        <button
          onClick={() => toggleFavorite(meal.idMeal)}
          aria-label={t.detail.favoriteLabel(isFavorite(meal.idMeal))}
          className={`min-h-11 px-4 rounded-xl border font-medium text-sm transition-colors duration-150 flex items-center gap-1.5 shrink-0
            ${isFavorite(meal.idMeal)
              ? 'bg-rose-50 dark:bg-rose-900/20 border-rose-300 dark:border-rose-700 text-rose-600 dark:text-rose-400'
              : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:border-rose-300 hover:text-rose-500'
            }`}
        >
          {isFavorite(meal.idMeal) ? '♥' : '♡'} {isFavorite(meal.idMeal) ? t.detail.removeFavorite : t.detail.addFavorite}
        </button>
      </div>

      <p className="mt-2 text-sm text-stone-500 dark:text-stone-400 flex items-center gap-2">
        <span className="bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 px-2.5 py-0.5 rounded-full text-xs font-medium">{meal.strCategory}</span>
        <span className="bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 px-2.5 py-0.5 rounded-full text-xs font-medium">{meal.strArea}</span>
      </p>

      <section className="mt-6">
        <h2 className="text-base font-semibold text-stone-800 dark:text-stone-200 mb-3">{t.detail.ingredients}</h2>
        <ul className="divide-y divide-stone-100 dark:divide-stone-800 rounded-xl border border-stone-100 dark:border-stone-800 overflow-hidden">
          {ingredients.map((ing, i) => (
            <li key={i} className="flex justify-between items-center px-4 py-2.5 text-sm bg-white dark:bg-stone-800/50">
              <span className="text-stone-800 dark:text-stone-200 font-medium">{ing.name}</span>
              <span className="text-stone-500 dark:text-stone-400 text-right ml-4">{ing.measure}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6">
        <h2 className="text-base font-semibold text-stone-800 dark:text-stone-200 mb-3">{t.detail.instructions}</h2>
        <div className="space-y-3 text-stone-700 dark:text-stone-300 leading-relaxed text-sm">
          {instructions.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      </section>

      {meal.strYoutube && meal.strYoutube.trim() !== '' && (
        <a
          href={meal.strYoutube}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t.detail.watchYoutubeLabel(meal.strMeal)}
          className="mt-6 inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium text-sm px-5 py-2.5 rounded-xl transition-colors duration-150 min-h-11"
        >
          &#9654; {t.detail.watchYoutube}
        </a>
      )}
    </div>
  )
}
