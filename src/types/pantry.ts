export interface OFFNutriments {
  'energy-kcal_100g'?: number
  fat_100g?: number
  'saturated-fat_100g'?: number
  carbohydrates_100g?: number
  sugars_100g?: number
  proteins_100g?: number
  salt_100g?: number
}

export interface OFFProduct {
  product_name?: string
  brands?: string
  image_url?: string
  nutriscore_grade?: string
  nova_group?: number
  nutriments?: OFFNutriments
  quantity?: string
}

export interface OFFResponse {
  status: 0 | 1
  product?: OFFProduct
}

export interface PantryItem {
  barcode: string
  product_name: string
  brands: string
  image_url: string
  quantity: string
  nutriscore_grade: string
  nova_group: number | null
  nutriments: OFFNutriments
  added_at: string
}
