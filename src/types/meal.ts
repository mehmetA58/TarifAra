// filter.php ve search.php gibi uçlar yalnızca özet döndürür:
export interface MealSummary {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
}

// lookup.php / search.php tam tarifi döndürür (20 malzeme + 20 ölçü alanı):
export interface MealDetail {
  idMeal: string;
  strMeal: string;
  strCategory: string;
  strArea: string;
  strInstructions: string;
  strMealThumb: string;
  strTags: string | null;
  strYoutube: string | null;
  strSource: string | null;
  // strIngredient1..20 ve strMeasure1..20 alanları:
  [key: string]: string | null;
}

export interface Ingredient {
  name: string;
  measure: string;
}

export interface Category {
  idCategory: string;
  strCategory: string;
  strCategoryThumb: string;
  strCategoryDescription: string;
}