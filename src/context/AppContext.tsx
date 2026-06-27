import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import type { WeeklyPlan, Day, MealSlot, PlanEntry } from '../types/plan'
import { emptyPlan } from '../types/plan'

interface AppContextValue {
  favorites: string[]
  toggleFavorite: (id: string) => void
  isFavorite: (id: string) => boolean
  plan: WeeklyPlan
  setPlanEntry: (day: Day, slot: MealSlot, entry: PlanEntry) => void
  removePlanEntry: (day: Day, slot: MealSlot) => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useLocalStorage<string[]>('favorites', [])
  const [plan, setPlan] = useLocalStorage<WeeklyPlan>('weeklyPlan', emptyPlan())

  function toggleFavorite(id: string) {
    setFavorites(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    )
  }

  function isFavorite(id: string) {
    return favorites.includes(id)
  }

  function setPlanEntry(day: Day, slot: MealSlot, entry: PlanEntry) {
    setPlan(prev => ({
      ...prev,
      [day]: { ...prev[day], [slot]: entry }
    }))
  }

  function removePlanEntry(day: Day, slot: MealSlot) {
    setPlanEntry(day, slot, null)
  }

  return (
    <AppContext.Provider value={{ favorites, toggleFavorite, isFavorite, plan, setPlanEntry, removePlanEntry }}>
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useAppContext must be used within AppProvider')
  return ctx
}
