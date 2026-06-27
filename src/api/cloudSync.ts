import { supabase } from '../lib/supabase'
import type { WeeklyPlan } from '../types/plan'

export async function loadFavorites(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('user_favorites')
    .select('meal_id')
    .eq('user_id', userId)
  if (error) {
    console.error('loadFavorites:', error.message)
    return []
  }
  return data.map(row => row.meal_id)
}

export async function addFavorite(userId: string, mealId: string): Promise<void> {
  const { error } = await supabase
    .from('user_favorites')
    .insert({ user_id: userId, meal_id: mealId })
  if (error && error.code !== '23505') { // 23505 = unique violation (already exists)
    console.error('addFavorite:', error.message)
  }
}

export async function removeFavorite(userId: string, mealId: string): Promise<void> {
  const { error } = await supabase
    .from('user_favorites')
    .delete()
    .eq('user_id', userId)
    .eq('meal_id', mealId)
  if (error) console.error('removeFavorite:', error.message)
}

export async function loadPlan(userId: string): Promise<WeeklyPlan | null> {
  const { data, error } = await supabase
    .from('user_plans')
    .select('plan')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) {
    console.error('loadPlan:', error.message)
    return null
  }
  return data ? (data.plan as WeeklyPlan) : null
}

export async function savePlan(userId: string, plan: WeeklyPlan): Promise<void> {
  const { error } = await supabase
    .from('user_plans')
    .upsert(
      { user_id: userId, plan, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    )
  if (error) console.error('savePlan:', error.message)
}
