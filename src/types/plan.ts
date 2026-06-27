export type Day = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday'
export type MealSlot = 'Breakfast' | 'Lunch' | 'Dinner'
export type PlanEntry = { idMeal: string; strMeal: string; strMealThumb: string } | null
export type WeeklyPlan = Record<Day, Record<MealSlot, PlanEntry>>

export const DAYS: Day[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
export const SLOTS: MealSlot[] = ['Breakfast', 'Lunch', 'Dinner']

export function emptyPlan(): WeeklyPlan {
  const plan = {} as WeeklyPlan
  for (const day of DAYS) {
    plan[day] = { Breakfast: null, Lunch: null, Dinner: null }
  }
  return plan
}
