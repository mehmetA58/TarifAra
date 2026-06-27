import { useState, useEffect } from 'react'
import { useAppContext } from '../context/AppContext'
import { useTranslation } from '../context/I18nContext'
import { getMealById } from '../api/mealdb'
import type { MealDetail } from '../types/meal'
import MealCard from '../components/MealCard'
import { SkeletonCard } from '../components/Skeleton'

export default function FavoritesPage() {
  const { favorites } = useAppContext()
  const { t } = useTranslation()
  const [meals, setMeals] = useState<MealDetail[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (favorites.length === 0) {
      setMeals([])
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)
    Promise.all(favorites.map(id => getMealById(id)))
      .then(results => {
        if (!cancelled) setMeals(results.filter((m): m is MealDetail => m !== null))
      })
      .catch(err => {
        if (!cancelled) setError(err instanceof Error ? err.message : t.error.generic)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [favorites, t.error.generic])

  return (
    <div>
      <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-50 mb-6">{t.favorites.title}</h1>

      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {!loading && error && (
        <div role="alert" className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 text-sm">
          &#9888; {error}
        </div>
      )}

      {!loading && !error && favorites.length === 0 && (
        <div className="text-center py-16 text-stone-400">
          <p className="text-4xl mb-3">&#9825;</p>
          <p className="font-medium">{t.favorites.empty}</p>
          <p className="text-sm mt-1">{t.favorites.hint}</p>
        </div>
      )}

      {!loading && !error && meals.length > 0 && (
        <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {meals.map(m => (
            <li key={m.idMeal}>
              <MealCard id={m.idMeal} name={m.strMeal} thumb={m.strMealThumb} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
