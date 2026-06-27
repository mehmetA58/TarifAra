import type { MealSummary, MealDetail, Category, Ingredient } from "../types/meal";

const BASE = "https://www.themealdb.com/api/json/v1/1";

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`TheMealDB hatası: ${res.status}`);
  return res.json() as Promise<T>;
}

// İsimle ara (tam detay döner)
export async function searchMealsByName(query: string): Promise<MealDetail[]> {
  const data = await getJson<{ meals: MealDetail[] | null }>(
    `${BASE}/search.php?s=${encodeURIComponent(query)}`
  );
  return data.meals ?? [];
}

// Malzemeye göre filtrele (yalnızca özet döner)
export async function filterByIngredient(ingredient: string): Promise<MealSummary[]> {
  const data = await getJson<{ meals: MealSummary[] | null }>(
    `${BASE}/filter.php?i=${encodeURIComponent(ingredient)}`
  );
  return data.meals ?? [];
}

// Kategoriye göre filtrele (özet)
export async function filterByCategory(category: string): Promise<MealSummary[]> {
  const data = await getJson<{ meals: MealSummary[] | null }>(
    `${BASE}/filter.php?c=${encodeURIComponent(category)}`
  );
  return data.meals ?? [];
}

// Ülkeye/bölgeye göre filtrele (özet)
export async function filterByArea(area: string): Promise<MealSummary[]> {
  const data = await getJson<{ meals: MealSummary[] | null }>(
    `${BASE}/filter.php?a=${encodeURIComponent(area)}`
  );
  return data.meals ?? [];
}

// ID ile tam tarif
export async function getMealById(id: string): Promise<MealDetail | null> {
  const data = await getJson<{ meals: MealDetail[] | null }>(
    `${BASE}/lookup.php?i=${encodeURIComponent(id)}`
  );
  return data.meals?.[0] ?? null;
}

// Rastgele tarif
export async function getRandomMeal(): Promise<MealDetail | null> {
  const data = await getJson<{ meals: MealDetail[] | null }>(`${BASE}/random.php`);
  return data.meals?.[0] ?? null;
}

// Tüm kategoriler (zengin meta + görsel)
export async function getCategories(): Promise<Category[]> {
  const data = await getJson<{ categories: Category[] }>(`${BASE}/categories.php`);
  return data.categories ?? [];
}

// strIngredient1..20 + strMeasure1..20 -> temiz malzeme listesi
export function parseIngredients(meal: MealDetail): Ingredient[] {
  const out: Ingredient[] = [];
  for (let i = 1; i <= 20; i++) {
    const name = (meal[`strIngredient${i}`] ?? "").trim();
    const measure = (meal[`strMeasure${i}`] ?? "").trim();
    if (name) out.push({ name, measure });
  }
  return out;
}