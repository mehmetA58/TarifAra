export type Day = 'Pazartesi' | 'Salı' | 'Çarşamba' | 'Perşembe' | 'Cuma' | 'Cumartesi' | 'Pazar'
export type MealSlot = 'Kahvaltı' | 'Öğle' | 'Akşam'
export type PlanEntry = { idMeal: string; strMeal: string; strMealThumb: string } | null
export type WeeklyPlan = Record<Day, Record<MealSlot, PlanEntry>>

export const DAYS: Day[] = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar']
export const SLOTS: MealSlot[] = ['Kahvaltı', 'Öğle', 'Akşam']

export function emptyPlan(): WeeklyPlan {
  const plan = {} as WeeklyPlan
  for (const day of DAYS) {
    plan[day] = { Kahvaltı: null, Öğle: null, Akşam: null }
  }
  return plan
}
