import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import { getMealById, searchMealsByName } from '../api/mealdb'
import { useDebounce } from '../hooks/useDebounce'
import { DAYS, SLOTS } from '../types/plan'
import type { Day, MealSlot, PlanEntry } from '../types/plan'
import type { MealDetail } from '../types/meal'

// A compact draggable card for the sidebar
interface DraggableCardProps {
  idMeal: string
  strMeal: string
  strMealThumb: string
}

function DraggableCard({ idMeal, strMeal, strMealThumb }: DraggableCardProps) {
  return (
    <div
      draggable
      onDragStart={e => {
        e.dataTransfer.setData(
          'application/json',
          JSON.stringify({ idMeal, strMeal, strMealThumb })
        )
        e.dataTransfer.effectAllowed = 'copy'
      }}
      className="flex items-center gap-2 p-1 cursor-grab border rounded"
      aria-label={`${strMeal} tarifi — sürükleyerek plana ekle`}
    >
      <img src={strMealThumb} alt={strMeal} className="w-12 h-12 object-cover shrink-0 rounded" />
      <span className="text-sm leading-tight line-clamp-2">{strMeal}</span>
    </div>
  )
}

// A single planner cell (drop target)
interface PlanCellProps {
  day: Day
  slot: MealSlot
  entry: PlanEntry
  onDrop: (day: Day, slot: MealSlot, entry: NonNullable<PlanEntry>) => void
  onRemove: (day: Day, slot: MealSlot) => void
}

function PlanCell({ day, slot, entry, onDrop, onRemove }: PlanCellProps) {
  const [dragOver, setDragOver] = useState(false)

  return (
    <td
      className={`border p-1 min-w-24 align-top ${dragOver ? 'bg-blue-50' : ''}`}
      onDragOver={e => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'copy'
        setDragOver(true)
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={e => {
        e.preventDefault()
        setDragOver(false)
        try {
          const raw = e.dataTransfer.getData('application/json')
          const parsed = JSON.parse(raw) as NonNullable<PlanEntry>
          if (parsed && parsed.idMeal) onDrop(day, slot, parsed)
        } catch {
          // ignore malformed drag data
        }
      }}
    >
      {entry ? (
        <div className="relative">
          <img src={entry.strMealThumb} alt={entry.strMeal} className="w-full object-cover" />
          <p className="text-xs mt-1 leading-tight">{entry.strMeal}</p>
          <button
            onClick={() => onRemove(day, slot)}
            aria-label={`${entry.strMeal} kaldır`}
            className="absolute top-0 right-0 bg-white rounded-full text-xs px-1 leading-none"
          >
            ✕
          </button>
        </div>
      ) : (
        <span className="text-xs text-gray-400 block text-center py-2">Buraya bırak</span>
      )}
    </td>
  )
}

export default function PlannerPage() {
  const { favorites, plan, setPlanEntry, removePlanEntry } = useAppContext()

  // Sidebar: favorites fetched by ID
  const [favMeals, setFavMeals] = useState<MealDetail[]>([])
  const [favLoading, setFavLoading] = useState(false)

  useEffect(() => {
    if (favorites.length === 0) {
      setFavMeals([])
      return
    }
    let cancelled = false
    setFavLoading(true)
    Promise.all(favorites.map(id => getMealById(id)))
      .then(results => {
        if (!cancelled) setFavMeals(results.filter((m): m is MealDetail => m !== null))
      })
      .finally(() => {
        if (!cancelled) setFavLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [favorites])

  // Sidebar: search
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, 400)
  const [searchResults, setSearchResults] = useState<MealDetail[]>([])
  const [searchLoading, setSearchLoading] = useState(false)

  useEffect(() => {
    const trimmed = debouncedQuery.trim()
    if (!trimmed) {
      setSearchResults([])
      return
    }
    let cancelled = false
    setSearchLoading(true)
    searchMealsByName(trimmed)
      .then(results => {
        if (!cancelled) setSearchResults(results)
      })
      .finally(() => {
        if (!cancelled) setSearchLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [debouncedQuery])

  // Determine which list to show: search results take priority when query is non-empty
  const sidebarItems = query.trim() ? searchResults : favMeals
  const sidebarLoading = query.trim() ? searchLoading : favLoading

  return (
    <div className="p-4">
      <Link to="/" aria-label="Ana sayfaya geri dön">&larr; Ana Sayfa</Link>
      <h1 className="text-2xl font-bold my-4">Haftalık Plan</h1>

      <div className="flex gap-4">
        {/* Left sidebar */}
        <aside className="w-48 shrink-0">
          <input
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Tarif ara..."
            aria-label="Tarif ara"
            className="w-full p-1 border text-sm mb-2"
          />
          {!query.trim() && (
            <p className="text-xs text-gray-500 mb-2">Favoriler</p>
          )}
          {sidebarLoading && <p className="text-xs text-gray-500">Yükleniyor...</p>}
          {!sidebarLoading && sidebarItems.length === 0 && !query.trim() && (
            <p className="text-xs text-gray-400">Henüz favori yok.</p>
          )}
          {!sidebarLoading && sidebarItems.length === 0 && query.trim() && (
            <p className="text-xs text-gray-400">Sonuç bulunamadı.</p>
          )}
          <ul className="flex flex-col gap-2">
            {sidebarItems.map(m => (
              <li key={m.idMeal}>
                <DraggableCard
                  idMeal={m.idMeal}
                  strMeal={m.strMeal}
                  strMealThumb={m.strMealThumb}
                />
              </li>
            ))}
          </ul>
        </aside>

        {/* Planner grid */}
        <div className="overflow-x-auto flex-1">
          <table className="border-collapse text-sm w-full">
            <thead>
              <tr>
                <th className="border p-2 text-left bg-gray-50">Öğün</th>
                {DAYS.map(day => (
                  <th key={day} className="border p-2 text-center bg-gray-50 min-w-24">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SLOTS.map(slot => (
                <tr key={slot}>
                  <td className="border p-2 font-medium whitespace-nowrap bg-gray-50">{slot}</td>
                  {DAYS.map(day => (
                    <PlanCell
                      key={`${day}-${slot}`}
                      day={day}
                      slot={slot}
                      entry={plan[day][slot]}
                      onDrop={setPlanEntry}
                      onRemove={removePlanEntry}
                    />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
