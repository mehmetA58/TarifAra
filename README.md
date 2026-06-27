# TarifAra — Recipe Planner

A frontend-only web app for discovering recipes, planning weekly meals, and auto-generating a shopping list — with an optional barcode-powered pantry tracker.

**Live demo:** _[add link after deploy]_

![TarifAra screenshot](docs/screenshot.png)
<!-- Replace with an actual screenshot or an animated GIF of the main flows -->

---

## Features

| Feature | Detail |
|---|---|
| **Recipe discovery** | Search by name or browse 14 + categories via TheMealDB |
| **Diet filters** | One-click Vegan / Vegetarian category filter |
| **Recipe detail** | Ingredients, step-by-step instructions, YouTube link |
| **Favorites** | Heart-toggle on any recipe; persisted across sessions |
| **Weekly planner** | Drag-and-drop meals into a Mon–Sun × Breakfast/Lunch/Dinner grid |
| **Shopping list** | Auto-aggregated and deduplicated from the current weekly plan |
| **Pantry + Barcode** | Scan EAN/UPC barcodes (or type manually) → Nutri-Score badge, NOVA group, per-100g nutrition table, persistent pantry list |
| **Dark mode** | Manual toggle; stored in localStorage |
| **Multilingual** | English · Turkish · Spanish (custom i18n, no library) |
| **Cloud sync** | Optional Supabase auth (email/password) — favorites and weekly plan sync across devices |

---

## Tech stack

| Layer | Choice |
|---|---|
| UI framework | React 19 |
| Language | TypeScript (strict) |
| Bundler | Vite 8 |
| Styling | Tailwind CSS v4 (`@theme` tokens, no config file) |
| Routing | React Router v7 |
| Barcode scanning | @zxing/browser |
| Cloud (optional) | Supabase — auth + PostgreSQL + Row Level Security |
| Linter | Oxlint |
| APIs | TheMealDB (recipes) · Open Food Facts (nutrition) |

---

## Local setup

```bash
# 1. Clone
git clone https://github.com/<your-username>/TarifAra.git
cd TarifAra

# 2. Install
npm install

# 3. Environment (Supabase is optional — the app works fully offline without it)
cp .env.example .env.local
# Fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY if you want cloud sync

# 4. Run
npm run dev        # http://localhost:5173
npm run build      # production build → dist/
npm run preview    # preview the production build
npm run lint       # Oxlint
```

### Supabase setup (optional)

1. Create a project at [supabase.com](https://supabase.com).
2. Run `supabase/schema.sql` in the SQL editor to create the `user_favorites` and `user_plans` tables with RLS.
3. Copy the project URL and anon key into `.env.local`.
4. In **Authentication → Providers → Email**, disable "Confirm email" for local development.

---

## Deploy to GitHub Pages

The workflow at `.github/workflows/deploy.yml` runs automatically on every push to `main`.

**One-time setup:**

1. Push the repository to GitHub.
2. Go to **Settings → Pages → Source** and select **GitHub Actions**.
3. Add two repository secrets under **Settings → Secrets → Actions**:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   (Skip both if you are not using cloud sync — the app degrades gracefully.)
4. Push to `main` (or trigger **Actions → Deploy to GitHub Pages → Run workflow**).

Your site will be live at `https://<username>.github.io/TarifAra/`.

> **Custom domain:** Set your domain in **Settings → Pages**, then remove `VITE_BASE_PATH` from the workflow env block and set `base: '/'` in `vite.config.ts`.

### How SPA routing works on GitHub Pages

GitHub Pages has no server-side routing, so navigating directly to `/favorites` returns a 404. The fix:

- `public/404.html` intercepts the 404, encodes the real path into a query string, and redirects to the site root.
- A script in `index.html` decodes it and calls `history.replaceState` before React boots — React Router then reads the correct path.

---

## Technical decisions

### Tailwind CSS v4 without a config file
Tailwind v4 ships all defaults as CSS custom properties. Custom colors are declared with `@theme` in `index.css` instead of a JS config file. Dark mode uses a `@custom-variant` tied to `data-theme="dark"` on `<html>` — this lets the user toggle independently of the OS preference, and the preference is stored in localStorage.

### Custom i18n — no library
Three locale files export a typed `Messages` object. Parameterized strings are plain TypeScript functions (`viewLabel: (name: string) => \`View \${name}\``). The `useTranslation()` hook returns the full typed object. This approach adds zero runtime overhead and the compiler catches missing translations immediately.

### localStorage as the source of truth
All user data (favorites, weekly plan, pantry) lives in localStorage first. Supabase is an additive layer: on sign-in the app pulls cloud data and merges it (union for favorites, cloud wins for the plan). Every mutation writes to both stores. Signing out changes nothing in the UI — offline behavior is identical.

### Native drag-and-drop for the planner
The weekly planner uses the HTML5 Drag and Drop API (`draggable`, `onDragStart`, `onDrop`) with `dataTransfer.setData('application/json', …)`. No third-party DnD library needed; the payload is a small JSON with the meal id, name, and thumbnail.

### Three-state product fetch
The barcode lookup uses `undefined` (idle), `null` (not found), and `OFFProduct` (found) — not a loading boolean + separate error boolean. This makes the three cases structurally distinct and impossible to accidentally conflate in JSX.

### Supabase RLS — anon key only
The `supabase` client uses only the public anon key (safe to expose in frontend). Every table has Row Level Security: `auth.uid() = user_id` on all policies. No service-role key is ever present in the frontend bundle.
