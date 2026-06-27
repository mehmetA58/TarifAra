import { useState, useEffect } from 'react'
import { useAppContext } from '../context/AppContext'
import { useTranslation } from '../context/I18nContext'
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
  ariaLabel: string
}

function DraggableCard({ idMeal, strMeal, strMealThumb, ariaLabel }: DraggableCardProps) {
  return (
    <div
      draggable
      onDragStart={e => {
        e.dataTransfer.setData('application/json', JSON.stringify({ idMeal, strMeal, strMealThumb }))
        e.dataTransfer.effectAllowed = 'copy'
      }}
      className="flex items-center gap-2 p-2 cursor-grab active:cursor-grabbing rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 motion-safe:transition-shadow motion-safe:hover:shadow-md select-none"
      aria-label={ariaLabel}
    >
      <img src={strMealThumb} alt={strMeal} loading="lazy" className="w-10 h-10 object-cover rounded-lg shrink-0" />
      <span className="text-xs font-medium leading-tight line-clamp-2 text-stone-700 dark:text-stone-200">{strMeal}</span>
    </div>
  )
}

// A single planner cell (drop target)
interface PlanCellProps {
  day: Day
  slot: MealSlot
  entry: PlanEntry
  dropText: string
  removeLabel: (name: string) => string
  onDrop: (day: Day, slot: MealSlot, entry: NonNullable<PlanEntry>) => void
  onRemove: (day: Day, slot: MealSlot) => void
}

function PlanCell({ day, slot, entry, dropText, removeLabel, onDrop, onRemove }: PlanCellProps) {
  const [dragOver, setDragOver] = useState(false)
  return (
    <td
      className={`border border-stone-200 dark:border-stone-700 p-1.5 min-w-[7rem] align-top transition-colors duration-100
        ${dragOver ? 'bg-brand-50 dark:bg-brand-900/20 border-brand-400' : 'bg-white dark:bg-stone-900'}`}
      onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; setDragOver(true) }}
      onDragLeave={() => setDragOver(false)}
      onDrop={e => {
        e.preventDefault(); setDragOver(false)
        try {
          const parsed = JSON.parse(e.dataTransfer.getData('application/json')) as NonNullable<PlanEntry>
          if (parsed?.idMeal) onDrop(day, slot, parsed)
        } catch { /* ignore */ }
      }}
    >
      {entry ? (
        <div className="relative group">
          <img src={entry.strMealThumb} alt={entry.strMeal} loading="lazy" className="w-full aspect-square object-cover rounded-lg" />
          <p className="text-xs mt-1 leading-tight text-stone-700 dark:text-stone-300 line-clamp-2">{entry.strMeal}</p>
          <button
            onClick={() => onRemove(day, slot)}
            aria-label={removeLabel(entry.strMeal)}
            className="absolute top-1 right-1 w-8 h-8 min-w-8 min-h-8 flex items-center justify-center rounded-full bg-rose-500 text-white text-xs opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity duration-150"
          >
            &#10005;
          </button>
        </div>
      ) : (
        <div className={`min-h-16 flex items-center justify-center rounded-lg border-2 border-dashed text-xs transition-colors duration-100
          ${dragOver ? 'border-brand-400 text-brand-500' : 'border-stone-200 dark:border-stone-700 text-stone-300 dark:text-stone-600'}`}>
          {dropText}
        </div>
      )}
    </td>
  )
}

export default function PlannerPage() {
  const { favorites, plan, setPlanEntry, removePlanEntry } = useAppContext()
  const { t } = useTranslation()

  // Mobile state
  const [selectedDay, setSelectedDay] = useState<Day>('Monday')
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)

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
    <div>
      <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-50 mb-6">{t.planner.title}</h1>

      {/* MOBILE VIEW */}
      <div className="md:hidden">
        {/* Day tabs */}
        <div className="flex gap-1 overflow-x-auto pb-2 mb-4" style={{ scrollbarWidth: 'none' }}>
          {DAYS.map(day => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`shrink-0 min-h-9 px-3 rounded-xl text-sm font-medium transition-colors duration-150 ${
                selectedDay === day
                  ? 'bg-brand-500 text-white'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
              }`}
            >
              {t.days[day].slice(0, 3)}
            </button>
          ))}
        </div>

        {/* Slot cards for selected day */}
        <div className="space-y-3 mb-4">
          {SLOTS.map(slot => {
            const entry = plan[selectedDay][slot]
            return (
              <div key={slot} className="rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 bg-stone-50 dark:bg-stone-900 border-b border-stone-100 dark:border-stone-700">
                  <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wide">{t.slots[slot]}</span>
                  {entry && (
                    <button
                      onClick={() => removePlanEntry(selectedDay, slot)}
                      className="min-w-8 min-h-8 flex items-center justify-center rounded-full text-stone-400 hover:text-red-500 transition-colors"
                      aria-label={t.detail.removeLabel(entry.strMeal)}
                    >
                      ✕
                    </button>
                  )}
                </div>
                {entry ? (
                  <div className="flex items-center gap-3 px-4 py-3">
                    <img src={entry.strMealThumb} alt={entry.strMeal} loading="lazy" className="w-12 h-12 rounded-lg object-cover shrink-0" />
                    <span className="text-sm font-medium text-stone-800 dark:text-stone-100 line-clamp-2">{entry.strMeal}</span>
                  </div>
                ) : (
                  <button
                    onClick={() => setMobileSearchOpen(true)}
                    className="w-full px-4 py-4 text-sm text-stone-400 dark:text-stone-500 text-left hover:bg-stone-50 dark:hover:bg-stone-700/50 transition-colors"
                  >
                    + {t.planner.drop}
                  </button>
                )}
              </div>
            )
          })}
        </div>

        {/* Mobile search toggle button */}
        <button
          onClick={() => setMobileSearchOpen(s => !s)}
          className="w-full min-h-11 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm transition-colors mb-4"
        >
          🔍 {t.planner.searchPlaceholder}
        </button>

        {mobileSearchOpen && (
          <div className="rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 p-4 mb-4">
            <input
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={t.planner.searchPlaceholder}
              className="w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 px-3 py-2.5 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            {sidebarLoading && (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-14 bg-stone-200 dark:bg-stone-700 rounded-xl animate-pulse" />
                ))}
              </div>
            )}
            {!sidebarLoading && sidebarItems.length === 0 && (
              <p className="text-sm text-stone-400 dark:text-stone-500 text-center py-4">
                {query.trim() ? t.planner.noResults : t.planner.noFavorites}
              </p>
            )}
            <ul className="space-y-2 max-h-64 overflow-y-auto">
              {sidebarItems.map(meal => (
                <li key={meal.idMeal}>
                  <button
                    className="flex items-center gap-3 w-full rounded-lg p-2 hover:bg-stone-50 dark:hover:bg-stone-700 text-left transition-colors"
                    onClick={() => {
                      const emptySlot = SLOTS.find(s => !plan[selectedDay][s])
                      if (emptySlot) {
                        setPlanEntry(selectedDay, emptySlot, { idMeal: meal.idMeal, strMeal: meal.strMeal, strMealThumb: meal.strMealThumb })
                      }
                      setMobileSearchOpen(false)
                    }}
                  >
                    <img src={meal.strMealThumb} alt={meal.strMeal} loading="lazy" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                    <span className="text-sm text-stone-700 dark:text-stone-200 line-clamp-1">{meal.strMeal}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* DESKTOP VIEW */}
      <div className="hidden md:flex gap-4 items-start">
        {/* Sidebar */}
        <aside className="w-44 shrink-0 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 p-3">
          <input
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={t.planner.searchPlaceholder}
            aria-label={t.search.label}
            className="w-full rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 px-3 py-1.5 text-xs placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-brand-500 mb-2"
          />
          {!query.trim() && <p className="text-xs font-medium text-stone-500 dark:text-stone-400 mb-2">{t.nav.favorites}</p>}
          {sidebarLoading && (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-14 bg-stone-200 dark:bg-stone-700 rounded-xl animate-pulse" />
              ))}
            </div>
          )}
          {!sidebarLoading && sidebarItems.length === 0 && (
            <p className="text-xs text-stone-400 dark:text-stone-500 text-center py-4">
              {query.trim() ? t.planner.noResults : t.planner.noFavorites}
            </p>
          )}
          <ul className="flex flex-col gap-2">
            {sidebarItems.map(m => (
              <li key={m.idMeal}>
                <DraggableCard
                  idMeal={m.idMeal}
                  strMeal={m.strMeal}
                  strMealThumb={m.strMealThumb}
                  ariaLabel={t.planner.mealLabel(m.strMeal)}
                />
              </li>
            ))}
          </ul>
        </aside>
        {/* Grid */}
        <div className="overflow-x-auto flex-1">
          <table className="border-collapse text-xs w-full">
            <thead>
              <tr>
                <th className="border border-stone-200 dark:border-stone-700 p-2 text-left bg-stone-50 dark:bg-stone-800 font-semibold text-stone-600 dark:text-stone-400 whitespace-nowrap">{t.planner.mealSlot}</th>
                {DAYS.map(day => (
                  <th key={day} className="border border-stone-200 dark:border-stone-700 p-2 text-center bg-stone-50 dark:bg-stone-800 font-semibold text-stone-600 dark:text-stone-400 min-w-[7rem]">{t.days[day]}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SLOTS.map(slot => (
                <tr key={slot}>
                  <td className="border border-stone-200 dark:border-stone-700 p-2 font-semibold whitespace-nowrap bg-stone-50 dark:bg-stone-800 text-stone-600 dark:text-stone-400">{t.slots[slot]}</td>
                  {DAYS.map(day => (
                    <PlanCell
                      key={`${day}-${slot}`}
                      day={day}
                      slot={slot}
                      entry={plan[day][slot]}
                      dropText={t.planner.drop}
                      removeLabel={t.detail.removeLabel}
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
