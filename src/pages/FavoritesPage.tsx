import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import { getMealById } from '../api/mealdb'
import type { MealDetail } from '../types/meal'
import MealCard from '../components/MealCard'

export default function FavoritesPage() {
  const { favorites } = useAppContext()
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
        if (!cancelled) setError(err instanceof Error ? err.message : 'Bir hata oluştu')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [favorites])

  return (
    <div className="p-4">
      <Link to="/" aria-label="Ana sayfaya geri dön">&larr; Ana Sayfa</Link>
      <h1 className="text-2xl font-bold my-4">Favoriler</h1>
      {loading && <p>Yükleniyor...</p>}
      {error && <p role="alert">{error}</p>}
      {!loading && !error && favorites.length === 0 && <p>Henüz favori yok.</p>}
      {!loading && !error && meals.length > 0 && (
        <ul className="grid grid-cols-2 gap-4">
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
