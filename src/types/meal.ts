// filter.php and search.php endpoints return summary only:
export interface MealSummary {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
}

// lookup.php / search.php return the full recipe (20 ingredients + 20 measure fields):
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
  // strIngredient1..20 and strMeasure1..20 fields:
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
