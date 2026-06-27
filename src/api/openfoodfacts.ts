import type { OFFProduct, OFFResponse } from '../types/pantry'

const BASE = 'https://world.openfoodfacts.org/api/v2/product'
const FIELDS = 'product_name,brands,image_url,nutriscore_grade,nova_group,nutriments,quantity'

export async function getProductByBarcode(barcode: string): Promise<OFFProduct | null> {
  const res = await fetch(`${BASE}/${encodeURIComponent(barcode)}.json?fields=${FIELDS}`)
  if (!res.ok) throw new Error(`Open Food Facts error: ${res.status}`)
  const data: OFFResponse = await res.json()
  if (data.status === 0) return null
  return data.product ?? null
}
