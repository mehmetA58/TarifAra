import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getMealById, parseIngredients } from '../api/mealdb'
import type { MealDetail, Ingredient } from '../types/meal'
import { useAppContext } from '../context/AppContext'
import { useTranslation } from '../context/I18nContext'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

export default function MealDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const [meal, setMeal] = useState<MealDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toggleFavorite, isFavorite } = useAppContext()
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!id) return
    const mealId = id  // narrow to string for the async closure

    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const result = await getMealById(mealId)
        if (!cancelled) setMeal(result)
      } catch (err) {
        if (!cancelled)
          setError(err instanceof Error ? err.message : t.error.generic)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [id])

  useGSAP(() => {
    if (!pageRef.current || !meal) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const elements = pageRef.current.querySelectorAll('img, h1, section, .reveal-item')
    gsap.fromTo(
      elements,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.7, stagger: 0.1, ease: 'power3.out' }
    )
  }, { scope: pageRef, dependencies: [meal] })

  if (loading) return (
    <div className="animate-pulse space-y-4">
      <div className="h-5 w-20 bg-white/10 rounded-full" />
      <div className="aspect-video w-full bg-white/10 rounded-2xl" />
      <div className="h-8 bg-white/10 rounded-xl w-2/3" />
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-4 bg-white/10 rounded-full" style={{ width: `${70 + (i % 3) * 10}%` }} />
        ))}
      </div>
    </div>
  )

  if (error) return (
    <div role="alert" className="rounded-xl bg-red-900/20 border border-red-800/50 text-red-400 px-4 py-3">
      &#9888; {error}
    </div>
  )

  if (!meal) return (
    <div role="alert" className="rounded-xl bg-red-900/20 border border-red-800/50 text-red-400 px-4 py-3">
      {t.meals.notFound}
    </div>
  )

  const ingredients: Ingredient[] = parseIngredients(meal)
  const instructions = meal.strInstructions
    .split('\n')
    .filter((s) => s.trim())

  return (
    <div ref={pageRef}>
      <Link
        to="/"
        className="reveal-item inline-flex items-center gap-1 text-sm text-[#D9A35F] font-medium hover:underline min-h-9 mb-2"
      >
        {t.detail.back}
      </Link>

      <img
        src={meal.strMealThumb}
        alt={meal.strMeal}
        loading="eager"
        className="w-full max-h-80 object-cover rounded-2xl mt-2 shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
      />

      <div className="reveal-item mt-5 flex flex-wrap items-start gap-3">
        <h1 className="text-2xl font-semibold text-white flex-1"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
          {meal.strMeal}
        </h1>
        <button
          onClick={() => toggleFavorite(meal.idMeal)}
          aria-label={t.detail.favoriteLabel(isFavorite(meal.idMeal))}
          className={`min-h-11 px-4 rounded-xl border font-medium text-sm transition-colors duration-150 flex items-center gap-1.5 shrink-0
            ${isFavorite(meal.idMeal)
              ? 'bg-rose-900/20 border-rose-700/50 text-rose-400'
              : 'border-white/20 text-[#BDBDBD] hover:border-[#D9A35F]/50 hover:text-[#D9A35F]'
            }`}
        >
          {isFavorite(meal.idMeal) ? '♥' : '♡'} {isFavorite(meal.idMeal) ? t.detail.removeFavorite : t.detail.addFavorite}
        </button>
      </div>

      <p className="reveal-item mt-2 text-sm text-[#BDBDBD]/70 flex items-center gap-2">
        <span className="bg-[#D9A35F]/10 text-[#D9A35F] border border-[#D9A35F]/20 px-2.5 py-0.5 rounded-full text-xs font-medium">
          {meal.strCategory}
        </span>
        <span className="bg-white/5 text-[#BDBDBD] border border-white/10 px-2.5 py-0.5 rounded-full text-xs font-medium">
          {meal.strArea}
        </span>
      </p>

      <section className="reveal-item mt-6">
        <h2 className="text-base font-semibold text-white mb-3">{t.detail.ingredients}</h2>
        <ul className="glass rounded-xl overflow-hidden divide-y divide-white/5">
          {ingredients.map((ing, i) => (
            <li key={ing.name ?? i} className="flex justify-between items-center px-4 py-2.5 text-sm">
              <span className="text-white font-medium">{ing.name}</span>
              <span className="text-[#BDBDBD] text-right ml-4">{ing.measure}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="reveal-item mt-6">
        <h2 className="text-base font-semibold text-white mb-3">{t.detail.instructions}</h2>
        <div className="space-y-3 text-[#BDBDBD] leading-relaxed text-sm">
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
          className="reveal-item mt-6 inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium text-sm px-5 py-2.5 rounded-xl transition-colors duration-150 min-h-11"
        >
          &#9654; {t.detail.watchYoutube}
        </a>
      )}
    </div>
  )
}
