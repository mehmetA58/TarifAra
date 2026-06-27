import { useState, useEffect, useRef } from 'react'
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
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

const DIET_FILTERS = ['Vegan', 'Vegetarian'] as const

gsap.registerPlugin(ScrollTrigger)

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

  const categoriesRef = useRef<HTMLUListElement>(null)
  const mealsRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    if (debouncedQuery.trim()) {
      setMode('search')
    } else if (selectedCategory) {
      setMode('category-meals')
    } else {
      setMode('categories')
    }
  }, [debouncedQuery, selectedCategory])

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
    return () => { cancelled = true }
  }, [mode, debouncedQuery, selectedCategory, t.error.generic])

  useGSAP(() => {
    if (!categoriesRef.current) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const items = categoriesRef.current.querySelectorAll('li')
    if (!items.length) return
    gsap.fromTo(
      items,
      { opacity: 0, y: 40 },
      {
        opacity: 1, y: 0,
        duration: 0.8,
        stagger: 0.06,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: categoriesRef.current,
          start: 'top 88%',
          once: true,
        },
      }
    )
  }, { scope: categoriesRef, dependencies: [categories] })

  useGSAP(() => {
    if (!mealsRef.current) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const items = mealsRef.current.querySelectorAll('li')
    if (!items.length) return
    gsap.fromTo(
      items,
      { opacity: 0, y: 40 },
      {
        opacity: 1, y: 0,
        duration: 0.8,
        stagger: 0.06,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: mealsRef.current,
          start: 'top 88%',
          once: true,
        },
      }
    )
  }, { scope: mealsRef, dependencies: [meals] })

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
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-base
                     text-white placeholder:text-[#BDBDBD]/50 backdrop-blur-sm
                     focus:outline-none focus:border-[#D9A35F]/50 focus:ring-1 focus:ring-[#D9A35F]/30
                     transition-all duration-200"
        />
      </div>

      {/* Diet filter buttons */}
      {!debouncedQuery.trim() && (
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-medium text-[#BDBDBD]/60">{t.diet.label}:</span>
          {DIET_FILTERS.map(diet => (
            <button
              key={diet}
              onClick={() => {
                setSelectedCategory(prev => prev === diet ? null : diet)
                setQuery('')
              }}
              aria-pressed={selectedCategory === diet}
              className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors min-h-8
                ${selectedCategory === diet
                  ? 'bg-[#D9A35F] text-[#070707] border-[#D9A35F]'
                  : 'border-white/20 text-[#BDBDBD] hover:border-[#D9A35F]/50 hover:text-[#D9A35F]'
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
          className="mb-4 flex items-center gap-1.5 text-[#D9A35F] font-medium text-sm hover:underline min-h-9"
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
        <div role="alert" className="rounded-xl bg-red-900/20 border border-red-800/50 text-red-400 px-4 py-3 text-sm">
          &#9888; {error}
        </div>
      )}

      {/* Categories grid */}
      {!loading && !error && mode === 'categories' && (
        categories.length === 0 ? (
          <p className="text-center text-[#BDBDBD]/50 py-12">{t.categories.empty}</p>
        ) : (
          <ul ref={categoriesRef} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {categories.map(cat => (
              <li key={cat.idCategory}>
                <button
                  onClick={() => handleCategoryClick(cat.strCategory)}
                  className="glass glass-card group block w-full text-left rounded-[16px] overflow-hidden
                             motion-safe:transition-all motion-safe:duration-300
                             motion-safe:hover:-translate-y-1
                             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9A35F]"
                  aria-label={t.categories.viewLabel(cat.strCategory)}
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={cat.strCategoryThumb}
                      alt={cat.strCategory}
                      className="w-full h-full object-cover
                                 motion-safe:transition-transform motion-safe:duration-500
                                 motion-safe:group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent
                                    opacity-0 motion-safe:transition-opacity motion-safe:duration-300
                                    group-hover:opacity-100" />
                  </div>
                  <p className="px-3 py-3 text-sm font-medium text-[#BDBDBD] group-hover:text-white
                                motion-safe:transition-colors motion-safe:duration-200">
                    {cat.strCategory}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        )
      )}

      {/* Meals grid (search or category-meals) */}
      {!loading && !error && (mode === 'search' || mode === 'category-meals') && (
        meals.length === 0 ? (
          <p className="text-center text-[#BDBDBD]/50 py-12">{t.meals.empty}</p>
        ) : (
          <ul ref={mealsRef} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
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
