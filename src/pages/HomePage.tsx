import { useState, useEffect } from 'react'
import { useDebounce } from '../hooks/useDebounce'
import { useTranslation } from '../context/I18nContext'
import MealCard from '../components/MealCard'
import { SkeletonCard } from '../components/Skeleton'
import {
  searchMealsByName,
  filterByCategory,
  getCategories,
} from '../api/mealdb'
import type { MealDetail, MealSummary, Category } from '../types/meal'

type Mode = 'categories' | 'category-meals' | 'search'

export default function HomePage() {
  const { t } = useTranslation()
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
          setError(err instanceof Error ? err.message : t.error.generic)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [mode, debouncedQuery, selectedCategory, t.error.generic])

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
    <div>
      {/* Search input */}
      <div className="relative mb-6">
        <input
          type="search"
          value={query}
          onChange={handleSearchChange}
          placeholder={t.search.placeholder}
          aria-label={t.search.label}
          className="w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 px-4 py-3 text-base shadow-sm placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-shadow duration-150"
        />
      </div>

      {/* Diet filter buttons */}
      {!debouncedQuery.trim() && (
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-medium text-stone-500 dark:text-stone-400">{t.diet.label}:</span>
          {(['Vegan', 'Vegetarian'] as const).map(diet => (
            <button
              key={diet}
              onClick={() => {
                setSelectedCategory(prev => prev === diet ? null : diet)
                setQuery('')
              }}
              aria-pressed={selectedCategory === diet}
              className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors min-h-8
                ${selectedCategory === diet
                  ? 'bg-brand-500 text-white border-brand-500'
                  : 'border-stone-300 dark:border-stone-600 text-stone-600 dark:text-stone-400 hover:border-brand-400 hover:text-brand-600'
                }`}
            >
              {diet === 'Vegan' ? t.diet.vegan : t.diet.vegetarian}
            </button>
          ))}
        </div>
      )}

      {/* Back button */}
      {mode === 'category-meals' && (
        <button
          onClick={handleBackToCategories}
          className="mb-4 flex items-center gap-1.5 text-brand-600 dark:text-brand-400 font-medium text-sm hover:underline min-h-9"
          aria-label={t.categories.back}
        >
          {t.categories.back}
        </button>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div role="alert" className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 text-sm">
          &#9888; {error}
        </div>
      )}

      {/* Categories grid */}
      {!loading && !error && mode === 'categories' && (
        categories.length === 0 ? (
          <p className="text-center text-stone-400 py-12">{t.categories.empty}</p>
        ) : (
          <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {categories.map(cat => (
              <li key={cat.idCategory}>
                <button
                  onClick={() => handleCategoryClick(cat.strCategory)}
                  className="block w-full text-left rounded-xl overflow-hidden shadow-sm bg-white dark:bg-stone-800 motion-safe:transition-all motion-safe:duration-200 motion-safe:hover:shadow-md motion-safe:hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                  aria-label={t.categories.viewLabel(cat.strCategory)}
                >
                  <img src={cat.strCategoryThumb} alt={cat.strCategory} className="aspect-video object-cover w-full" loading="lazy" />
                  <p className="px-3 py-2.5 text-sm font-medium text-stone-800 dark:text-stone-100">{cat.strCategory}</p>
                </button>
              </li>
            ))}
          </ul>
        )
      )}

      {/* Meals grid (search or category-meals) */}
      {!loading && !error && (mode === 'search' || mode === 'category-meals') && (
        meals.length === 0 ? (
          <p className="text-center text-stone-400 py-12">{t.meals.empty}</p>
        ) : (
          <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {meals.map(meal => (
              <li key={meal.idMeal}>
                <MealCard id={meal.idMeal} name={meal.strMeal} thumb={meal.strMealThumb} />
              </li>
            ))}
          </ul>
        )
      )}
    </div>
  )
}
