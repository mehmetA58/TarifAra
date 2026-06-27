import { useState, useEffect, useRef, useCallback, type FormEvent } from 'react'
import { BrowserMultiFormatReader } from '@zxing/browser'
import type { IScannerControls } from '@zxing/browser'
import { getProductByBarcode } from '../api/openfoodfacts'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useTranslation } from '../context/I18nContext'
import type { OFFProduct, PantryItem } from '../types/pantry'

// ── Nutriscore badge ──────────────────────────────────────────────
const NUTRISCORE_COLORS: Record<string, string> = {
  a: 'bg-green-500',
  b: 'bg-lime-400',
  c: 'bg-yellow-400',
  d: 'bg-orange-400',
  e: 'bg-red-500',
}

function NutriScoreBadge({ grade }: { grade: string }) {
  const g = grade.toLowerCase()
  const color = NUTRISCORE_COLORS[g] ?? 'bg-stone-400'
  return (
    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-white font-black text-sm uppercase ${color}`}>
      {g}
    </span>
  )
}

// ── NOVA badge ────────────────────────────────────────────────────
const NOVA_COLORS: Record<number, string> = {
  1: 'bg-green-500',
  2: 'bg-yellow-400',
  3: 'bg-orange-400',
  4: 'bg-red-500',
}

function NovaBadge({ group }: { group: number }) {
  const color = NOVA_COLORS[group] ?? 'bg-stone-400'
  return (
    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-white font-black text-sm ${color}`}>
      {group}
    </span>
  )
}

// ── Barcode Scanner ───────────────────────────────────────────────
interface BarcodeScannerProps {
  onDetect: (barcode: string) => void
  onError: (msg: string) => void
}

function BarcodeScanner({ onDetect, onError }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const reader = new BrowserMultiFormatReader()
    let stopped = false
    let controls: IScannerControls | null = null

    reader
      .decodeFromConstraints(
        { video: { facingMode: 'environment' } },
        videoRef.current!,
        (result, err) => {
          if (stopped) return
          if (result) {
            stopped = true
            controls?.stop()
            onDetect(result.getText())
          }
          if (err && (err as Error).name !== 'NotFoundException') {
            if ((err as Error).name === 'NotAllowedError' || (err as Error).name === 'NotFoundError') {
              stopped = true
              controls?.stop()
              onError((err as Error).name)
            }
          }
        }
      )
      .then(c => {
        controls = c
      })
      .catch(err => {
        onError((err as Error).message ?? 'Camera error')
      })

    return () => {
      stopped = true
      controls?.stop()
    }
  }, [onDetect, onError])

  return (
    <div className="relative rounded-xl overflow-hidden bg-black">
      <video ref={videoRef} className="w-full max-h-64 object-cover" muted playsInline />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-48 h-32 border-2 border-white/60 rounded-lg" />
      </div>
    </div>
  )
}

// ── Nutriment row ─────────────────────────────────────────────────
function NutrimentRow({ label, value, unit = 'g' }: { label: string; value?: number; unit?: string }) {
  if (value === undefined || value === null) return null
  return (
    <tr className="border-b border-stone-100 dark:border-stone-800">
      <td className="py-2 pr-4 text-stone-600 dark:text-stone-400 text-sm">{label}</td>
      <td className="py-2 text-right font-medium text-stone-800 dark:text-stone-200 text-sm">{value.toFixed(1)} {unit}</td>
    </tr>
  )
}

// ── Main Page ─────────────────────────────────────────────────────
export default function PantryPage() {
  const { t } = useTranslation()
  const [pantry, setPantry] = useLocalStorage<PantryItem[]>('pantry-items', [])

  const [barcode, setBarcode] = useState('')
  const [scanning, setScanning] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)

  const [product, setProduct] = useState<OFFProduct | null | undefined>(undefined)
  // undefined = idle, null = not found, OFFProduct = found
  const [loading, setLoading] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)

  const handleDetect = useCallback((code: string) => {
    setScanning(false)
    setBarcode(code)
    fetchProduct(code)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleCameraError = useCallback((_msg: string) => {
    setScanning(false)
    setCameraError(t.pantry.cameraError)
  }, [t.pantry.cameraError])

  async function fetchProduct(code: string) {
    if (!code.trim()) return
    setLoading(true)
    setFetchError(null)
    setProduct(undefined)
    try {
      const result = await getProductByBarcode(code.trim())
      setProduct(result) // null = not found
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : t.error.generic)
    } finally {
      setLoading(false)
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    fetchProduct(barcode)
  }

  function handleAddToPantry() {
    if (!product) return
    const item: PantryItem = {
      barcode,
      product_name: product.product_name ?? barcode,
      brands: product.brands ?? '',
      image_url: product.image_url ?? '',
      quantity: product.quantity ?? '',
      nutriscore_grade: product.nutriscore_grade ?? '',
      nova_group: product.nova_group ?? null,
      nutriments: product.nutriments ?? {},
      added_at: new Date().toISOString(),
    }
    setPantry(prev => {
      const without = prev.filter(p => p.barcode !== barcode)
      return [item, ...without]
    })
  }

  function handleRemove(code: string) {
    setPantry(prev => prev.filter(p => p.barcode !== code))
  }

  const alreadyInPantry = pantry.some(p => p.barcode === barcode)

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-50 mb-6">{t.pantry.title}</h1>

      {/* ── Barcode input ── */}
      <form onSubmit={handleSubmit} className="flex gap-2 mb-3">
        <input
          type="text"
          value={barcode}
          onChange={e => setBarcode(e.target.value)}
          placeholder={t.pantry.inputPlaceholder}
          aria-label={t.pantry.inputPlaceholder}
          className="flex-1 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-brand-500 transition-shadow"
        />
        <button
          type="submit"
          className="min-h-11 px-4 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-colors duration-150 shrink-0"
        >
          {t.pantry.search}
        </button>
      </form>

      {/* ── Camera toggle ── */}
      <button
        type="button"
        onClick={() => { setScanning(s => !s); setCameraError(null) }}
        className={`mb-4 flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-colors duration-150 min-h-10
          ${scanning
            ? 'border-brand-500 text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-700/20'
            : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:border-brand-400'
          }`}
      >
        📷 {scanning ? t.pantry.stopScan : t.pantry.scanButton}
      </button>

      {cameraError && (
        <p className="mb-4 text-sm text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl px-4 py-3">
          {cameraError}
        </p>
      )}

      {/* ── Camera view ── */}
      {scanning && (
        <div className="mb-4">
          <BarcodeScanner onDetect={handleDetect} onError={handleCameraError} />
        </div>
      )}

      {/* ── States ── */}
      {loading && (
        <div className="animate-pulse space-y-3 mb-6">
          <div className="h-48 bg-stone-200 dark:bg-stone-700 rounded-2xl" />
          <div className="h-6 bg-stone-200 dark:bg-stone-700 rounded-full w-2/3" />
          <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded-full w-1/2" />
        </div>
      )}

      {!loading && fetchError && (
        <div role="alert" className="mb-6 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 text-sm">
          {fetchError}
        </div>
      )}

      {!loading && !fetchError && product === null && (
        <p className="mb-6 text-center text-stone-400 py-8">{t.pantry.notFound}</p>
      )}

      {/* ── Product card ── */}
      {!loading && !fetchError && product != null && (
        <div className="mb-8 rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 overflow-hidden shadow-sm">
          {product.image_url && (
            <img
              src={product.image_url}
              alt={product.product_name ?? ''}
              className="w-full max-h-56 object-contain bg-stone-50 dark:bg-stone-900 p-4"
            />
          )}
          <div className="p-4">
            <h2 className="text-lg font-bold text-stone-900 dark:text-stone-50 leading-snug">
              {product.product_name ?? barcode}
            </h2>
            {product.brands && (
              <p className="text-sm text-stone-500 dark:text-stone-400 mt-0.5">{product.brands}</p>
            )}
            {product.quantity && (
              <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">{product.quantity}</p>
            )}

            {/* Scores */}
            <div className="flex flex-wrap items-center gap-4 mt-4">
              {product.nutriscore_grade && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-stone-500 dark:text-stone-400">{t.pantry.nutriScore}</span>
                  <NutriScoreBadge grade={product.nutriscore_grade} />
                </div>
              )}
              {product.nova_group && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-stone-500 dark:text-stone-400">{t.pantry.novaGroup}</span>
                  <NovaBadge group={product.nova_group} />
                </div>
              )}
            </div>

            {/* Nutriments */}
            {product.nutriments && (
              <div className="mt-4">
                <p className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wide mb-2">
                  {t.pantry.per100g}
                </p>
                <table className="w-full">
                  <tbody>
                    <NutrimentRow label={t.pantry.nutrients.energy} value={product.nutriments['energy-kcal_100g']} unit="kcal" />
                    <NutrimentRow label={t.pantry.nutrients.fat} value={product.nutriments.fat_100g} />
                    <NutrimentRow label={t.pantry.nutrients.saturatedFat} value={product.nutriments['saturated-fat_100g']} />
                    <NutrimentRow label={t.pantry.nutrients.carbs} value={product.nutriments.carbohydrates_100g} />
                    <NutrimentRow label={t.pantry.nutrients.sugars} value={product.nutriments.sugars_100g} />
                    <NutrimentRow label={t.pantry.nutrients.protein} value={product.nutriments.proteins_100g} />
                    <NutrimentRow label={t.pantry.nutrients.salt} value={product.nutriments.salt_100g} />
                  </tbody>
                </table>
              </div>
            )}

            {/* Add button */}
            <button
              onClick={handleAddToPantry}
              className={`mt-4 w-full min-h-11 rounded-xl font-semibold text-sm transition-colors duration-150
                ${alreadyInPantry
                  ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-300 dark:border-green-700'
                  : 'bg-brand-500 hover:bg-brand-600 text-white'
                }`}
            >
              {alreadyInPantry ? `✓ ${t.pantry.added}` : t.pantry.addToPantry}
            </button>
          </div>
        </div>
      )}

      {/* ── Pantry list ── */}
      <section>
        <h2 className="text-base font-semibold text-stone-800 dark:text-stone-200 mb-3">{t.pantry.title}</h2>
        {pantry.length === 0 ? (
          <p className="text-center text-stone-400 py-8 text-sm">{t.pantry.emptyPantry}</p>
        ) : (
          <ul className="divide-y divide-stone-100 dark:divide-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 overflow-hidden">
            {pantry.map(item => (
              <li key={item.barcode} className="flex items-center gap-3 p-3 bg-white dark:bg-stone-800">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.product_name} className="w-12 h-12 object-contain rounded-lg bg-stone-50 dark:bg-stone-900 shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-stone-100 dark:bg-stone-700 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-stone-800 dark:text-stone-100 truncate">{item.product_name}</p>
                  <p className="text-xs text-stone-400 truncate">{item.brands}{item.quantity ? ` · ${item.quantity}` : ''}</p>
                </div>
                {item.nutriscore_grade && <NutriScoreBadge grade={item.nutriscore_grade} />}
                <button
                  onClick={() => handleRemove(item.barcode)}
                  aria-label={`Remove ${item.product_name}`}
                  className="min-w-8 min-h-8 flex items-center justify-center rounded-full text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-150 shrink-0"
                >
                  &#x2715;
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
