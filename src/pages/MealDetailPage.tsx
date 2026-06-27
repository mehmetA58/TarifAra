import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getMealById, parseIngredients } from '../api/mealdb'
import type { MealDetail, Ingredient } from '../types/meal'

export default function MealDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [meal, setMeal] = useState<MealDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
          setError(err instanceof Error ? err.message : 'Bir hata oluştu')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [id])

  if (loading) return <p className="p-4">Yükleniyor...</p>
  if (error) return <p className="p-4" role="alert">{error}</p>
  if (!meal) return <p className="p-4">Tarif bulunamadı.</p>

  const ingredients: Ingredient[] = parseIngredients(meal)
  const instructions = meal.strInstructions
    .split('\n')
    .filter((s) => s.trim())

  return (
    <div className="p-4">
      <Link to="/" aria-label="Ana sayfaya geri dön">&larr; Geri</Link>

      <img src={meal.strMealThumb} alt={meal.strMeal} className="w-full mt-4" />

      <h1 className="text-2xl font-bold mt-4">{meal.strMeal}</h1>

      <p className="mt-2">
        <span>{meal.strCategory}</span>
        {' · '}
        <span>{meal.strArea}</span>
      </p>

      <ul className="mt-4">
        {ingredients.map((ing, i) => (
          <li key={i}>
            {ing.measure} {ing.name}
          </li>
        ))}
      </ul>

      <div className="mt-4">
        {instructions.map((para, i) => (
          <p key={i} className="mb-2">{para}</p>
        ))}
      </div>

      {meal.strYoutube && meal.strYoutube.trim() !== '' && (
        <a
          href={meal.strYoutube}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-block"
          aria-label={`${meal.strMeal} tarifini YouTube'da izle`}
        >
          YouTube'da İzle
        </a>
      )}
    </div>
  )
}
