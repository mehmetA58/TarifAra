import { useState, useEffect } from 'react'
import { useDebounce } from '../hooks/useDebounce'
import MealCard from '../components/MealCard'
import {
  searchMealsByName,
  filterByCategory,
  getCategories,
} from '../api/mealdb'
import type { MealDetail, MealSummary, Category } from '../types/meal'

type Mode = 'categories' | 'category-meals' | 'search'

export default function HomePage() {
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, 400)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const [mode, setMode] = useState<Mode>('categories')
  const [categories, setCategories] = useState<Category[]>([])
  const [meals, setMeals] = useState<MealSummary[] | MealDetail[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Derive mode from state
  useEffect(() => {
    if (debouncedQuery.trim()) {
      setMode('search')
    } else if (selectedCategory) {
      setMode('category-meals')
    } else {
      setMode('categories')
    }
  }, [debouncedQuery, selectedCategory])

  // Fetch data based on mode
  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        if (mode === 'search') {
          const results = await searchMealsByName(debouncedQuery.trim())
          if (!cancelled) setMeals(results)
        } else if (mode === 'category-meals' && selectedCategory) {
          const results = await filterByCategory(selectedCategory)
          if (!cancelled) setMeals(results)
        } else {
          const results = await getCategories()
          if (!cancelled) setCategories(results)
        }
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
  }, [mode, debouncedQuery, selectedCategory])

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value)
    setSelectedCategory(null)
  }

  function handleCategoryClick(categoryName: string) {
    setSelectedCategory(categoryName)
  }

  function handleBackToCategories() {
    setSelectedCategory(null)
  }

  return (
    <div className="p-4">
      <input
        type="search"
        value={query}
        onChange={handleSearchChange}
        placeholder="Tarif ara..."
        aria-label="Tarif ara"
        className="w-full p-2 border mb-4"
      />

      {mode === 'category-meals' && (
        <button
          onClick={handleBackToCategories}
          className="mb-4 flex items-center gap-1"
          aria-label="Kategorilere geri dön"
        >
          &larr; Kategoriler
        </button>
      )}

      {loading && <p>Yükleniyor...</p>}
      {error && <p role="alert">{error}</p>}

      {!loading && !error && mode === 'categories' && (
        <>
          {categories.length === 0 ? (
            <p>Sonuç bulunamadı</p>
          ) : (
            <ul className="grid grid-cols-2 gap-4">
              {categories.map((cat) => (
                <li key={cat.idCategory}>
                  <button
                    onClick={() => handleCategoryClick(cat.strCategory)}
                    className="block w-full text-left"
                    aria-label={`${cat.strCategory} kategorisini görüntüle`}
                  >
                    <img src={cat.strCategoryThumb} alt={cat.strCategory} className="w-full" />
                    <p>{cat.strCategory}</p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {!loading && !error && (mode === 'search' || mode === 'category-meals') && (
        <>
          {meals.length === 0 ? (
            <p>Sonuç bulunamadı</p>
          ) : (
            <ul className="grid grid-cols-2 gap-4">
              {meals.map((meal) => (
                <li key={meal.idMeal}>
                  <MealCard
                    id={meal.idMeal}
                    name={meal.strMeal}
                    thumb={meal.strMealThumb}
                  />
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  )
}
