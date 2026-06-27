import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import { getMealById, parseIngredients } from '../api/mealdb'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { DAYS, SLOTS } from '../types/plan'
import type { MealDetail } from '../types/meal'

export default function ShoppingPage() {
  const { plan } = useAppContext()
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
        if (!cancelled) setError(err instanceof Error ? err.message : 'Bir hata oluştu')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [plan])

  function toggleChecked(name: string) {
    setChecked(prev => ({ ...prev, [name]: !prev[name] }))
  }

  return (
    <div className="p-4">
      <Link to="/" aria-label="Ana sayfaya geri dön">&larr; Ana Sayfa</Link>
      <h1 className="text-2xl font-bold my-4">Alışveriş Listesi</h1>
      {loading && <p>Yükleniyor...</p>}
      {error && <p role="alert">{error}</p>}
      {!loading && !error && items.length === 0 && <p>Haftalık planda yemek yok.</p>}
      {!loading && !error && items.length > 0 && (
        <ul>
          {items.map(item => (
            <li key={item.name} className="flex items-center gap-2 py-1">
              <input
                type="checkbox"
                id={`item-${item.name}`}
                checked={!!checked[item.name]}
                onChange={() => toggleChecked(item.name)}
                aria-label={item.name}
              />
              <label
                htmlFor={`item-${item.name}`}
                className={checked[item.name] ? 'line-through text-gray-400' : ''}
              >
                {item.name}
                {item.measures.length > 0 ? `: ${item.measures.join(', ')}` : ''}
              </label>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
