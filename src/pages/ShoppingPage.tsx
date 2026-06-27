import { useState, useEffect } from 'react'
import { useAppContext } from '../context/AppContext'
import { useTranslation } from '../context/I18nContext'
import { getMealById, parseIngredients } from '../api/mealdb'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { DAYS, SLOTS } from '../types/plan'
import type { MealDetail } from '../types/meal'

export default function ShoppingPage() {
  const { plan } = useAppContext()
  const { t } = useTranslation()
  const [items, setItems] = useState<Array<{ name: string; measures: string[] }>>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [checked, setChecked] = useLocalStorage<Record<string, boolean>>('shopping-checked', {})

  useEffect(() => {
    // Collect unique meal IDs from plan
    const seen = new Set<string>()
    const entries: Array<{ idMeal: string }> = []
    for (const day of DAYS) {
      for (const slot of SLOTS) {
        const e = plan[day][slot]
        if (e && !seen.has(e.idMeal)) {
          seen.add(e.idMeal)
          entries.push(e)
        }
      }
    }

    if (entries.length === 0) {
      setItems([])
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    Promise.all(entries.map(e => getMealById(e.idMeal)))
      .then((meals: Array<MealDetail | null>) => {
        if (cancelled) return
        const map = new Map<string, string[]>()
        for (const meal of meals) {
          if (!meal) continue
          for (const ing of parseIngredients(meal)) {
            const key = ing.name.toLowerCase()
            if (!map.has(key)) map.set(key, [])
            if (ing.measure) map.get(key)!.push(ing.measure)
          }
        }
        setItems(
          Array.from(map.entries()).map(([name, measures]) => ({
            name: name.charAt(0).toUpperCase() + name.slice(1),
            measures,
          }))
        )
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
  }, [plan, t.error.generic])

  function toggleChecked(name: string) {
    setChecked(prev => ({ ...prev, [name]: !prev[name] }))
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-50 mb-6">{t.shopping.title}</h1>

      {loading && (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-11 bg-stone-200 dark:bg-stone-700 rounded-xl animate-pulse" style={{ width: `${60 + (i % 4) * 10}%` }} />
          ))}
        </div>
      )}

      {!loading && error && (
        <div role="alert" className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 text-sm">
          &#9888; {error}
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="text-center py-16 text-stone-400">
          <p className="text-4xl mb-3">&#128722;</p>
          <p className="font-medium">{t.shopping.empty}</p>
          <p className="text-sm mt-1">{t.shopping.hint}</p>
        </div>
      )}

      {!loading && !error && items.length > 0 && (
        <ul className="rounded-xl border border-stone-200 dark:border-stone-800 overflow-hidden divide-y divide-stone-100 dark:divide-stone-800">
          {items.map(item => (
            <li key={item.name} className="flex items-center gap-3 px-4 min-h-11 bg-white dark:bg-stone-900 motion-safe:transition-colors">
              <input
                type="checkbox"
                id={`item-${item.name}`}
                checked={!!checked[item.name]}
                onChange={() => toggleChecked(item.name)}
                className="w-4 h-4 accent-brand-500 shrink-0 cursor-pointer"
              />
              <label
                htmlFor={`item-${item.name}`}
                className={`flex-1 text-sm py-2.5 cursor-pointer transition-colors duration-150 ${checked[item.name] ? 'line-through text-stone-400 dark:text-stone-600' : 'text-stone-800 dark:text-stone-200'}`}
              >
                <span className="font-medium">{item.name}</span>
                {item.measures.length > 0 && (
                  <span className="text-stone-400 dark:text-stone-500 ml-1.5">{item.measures.join(', ')}</span>
                )}
              </label>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
