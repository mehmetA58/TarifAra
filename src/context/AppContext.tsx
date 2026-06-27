import { createContext, useContext, useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useAuth } from './AuthContext'
import type { WeeklyPlan, Day, MealSlot, PlanEntry } from '../types/plan'
import { emptyPlan } from '../types/plan'
import {
  loadFavorites, addFavorite, removeFavorite,
  loadPlan, savePlan
} from '../api/cloudSync'

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
  const { user } = useAuth()
  const [favorites, setFavorites] = useLocalStorage<string[]>('favorites', [])
  const [plan, setPlan] = useLocalStorage<WeeklyPlan>('weeklyPlan', emptyPlan())

  // Track previous user id to detect sign-in event
  const prevUserIdRef = useRef<string | null>(null)

  // On sign-in: pull from Supabase, merge into localStorage
  useEffect(() => {
    const prevId = prevUserIdRef.current
    const currId = user?.id ?? null
    prevUserIdRef.current = currId

    if (currId && currId !== prevId) {
      // User just signed in — sync from cloud
      Promise.all([
        loadFavorites(currId),
        loadPlan(currId),
      ]).then(([cloudFavs, cloudPlan]) => {
        // Merge favorites: union of local and cloud
        setFavorites(local => {
          const merged = Array.from(new Set([...local, ...cloudFavs]))
          return merged
        })
        // Plan: cloud wins if it exists
        if (cloudPlan) {
          setPlan(cloudPlan)
        }
      })
    }
  }, [user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  function toggleFavorite(id: string) {
    const isCurrentlyFav = favorites.includes(id)
    setFavorites(prev =>
      isCurrentlyFav ? prev.filter(f => f !== id) : [...prev, id]
    )
    if (user) {
      if (isCurrentlyFav) {
        removeFavorite(user.id, id)
      } else {
        addFavorite(user.id, id)
      }
    }
  }

  function isFavorite(id: string) {
    return favorites.includes(id)
  }

  function setPlanEntry(day: Day, slot: MealSlot, entry: PlanEntry) {
    setPlan(prev => {
      const next: WeeklyPlan = {
        ...prev,
        [day]: { ...prev[day], [slot]: entry },
      }
      if (user) savePlan(user.id, next)
      return next
    })
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
