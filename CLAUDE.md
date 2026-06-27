# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

TheMealDB API ile tarif keşfi, haftalık yemek planlayıcı ve otomatik alışveriş listesi. Frontend-only; özel backend yok. Kullanıcı verisi (favoriler, haftalık plan) localStorage'da tutulur.

## Stack

- **Vite 8 + React 19 + TypeScript** — bundler ve UI framework
- **Tailwind CSS v4** — `@tailwindcss/vite` plugin üzerinden; `src/index.css`'te `@import "tailwindcss"` ile yüklenir (`tailwind.config.js` yoktur)
- **React Router v7** — `src/App.tsx`'teki `BrowserRouter` ile client-side routing
- **Oxlint** — `.oxlintrc.json` ile yapılandırılmış linter

## Commands

```bash
npm run dev      # dev server — http://localhost:5173
npm run build    # TypeScript kontrolü + Vite bundle
npm run preview  # production build önizlemesi
npm run lint     # Oxlint
```

## Structure

```
src/
  api/         # tüm fetch fonksiyonları (bileşenler doğrudan fetch yapmaz)
  components/  # paylaşımlı/yeniden kullanılabilir UI bileşenleri
  hooks/       # custom React hook'ları (örn. useLocalStorage)
  pages/       # rota bazlı sayfa bileşenleri (her rota için bir dosya)
  types/       # paylaşımlı TypeScript tip tanımları
  App.tsx      # rota bildirimleri (BrowserRouter + Routes)
  main.tsx     # React giriş noktası
  index.css    # global stiller; Tailwind import'u burada
```

## Key conventions

- Yeni rota: `src/pages/` altına bileşen ekle, `src/App.tsx`'e `<Route>` ekle.
- Tailwind v4'te config dosyası gerekmez. Özel tema token'ları `src/index.css`'te `@theme` bloğuyla tanımlanır.
- Tüm `fetch` çağrıları `src/api/` altında toplanır — bileşenler doğrudan `fetch` yapmaz.
- localStorage erişimi tek bir `useLocalStorage` hook'u üzerinden yürür.
- Her async ekran üç durumu işler: loading, empty, error.
- Fonksiyonel bileşenler + hook'lar. Açık tip tanımları; `any` yok. Paylaşılan mantık hook'lara çıkarılır.
- Önce çalışan en sade hâl, sonra cila.

## TheMealDB API

Base URL: `https://www.themealdb.com/api/json/v1/1` (key `1`, auth yok, CORS açık).

**Kritik kural** — hangi endpoint'in ne döndürdüğünü karıştırma:

| Endpoint | Ne döndürür |
|---|---|
| `filter.php?c=`, `filter.php?i=`, `filter.php?a=` | **Yalnızca özet**: `idMeal`, `strMeal`, `strMealThumb` |
| `lookup.php?i=` | **Tam tarif** (malzemeler + ölçüler dahil) |
| `search.php?s=` | **Tam tarif** listesi |

Detay ekranlarında her zaman `getMealById` (`lookup.php`) kullan. Malzemeler `strIngredient1`–`strIngredient20` ve `strMeasure1`–`strMeasure20` alanlarına yayılmıştır; bunları her zaman bir `parseIngredients` yardımcısıyla oku. Eşleşme yoksa TheMealDB `{ meals: null }` döner — bunu açıkça ele al.

## Subagents

- **frontend-developer** — özellik geliştirme: sayfalar, bileşenler, hook'lar, API entegrasyonu
- **ui-designer** — görsel cila: Tailwind stilleri, tasarım token'ları, dark mode, hareket
- **backend-developer** — yalnızca opsiyonel Supabase işi (auth + cross-device sync)

Üçü de bu CLAUDE.md'yi okur ve mevcut kalıplara uyar.

## Optional cloud upgrade

Supabase ile auth ve çoklu cihaz sync eklenebilir. Eklendiğinde: her tabloda RLS, frontend'e yalnızca anon/public key (`import.meta.env`), localStorage fallback bozulmadan korunur, SQL migration'ları `supabase/` altında versiyonlanır.
