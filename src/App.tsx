import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { I18nProvider } from './context/I18nContext'
import { AuthProvider } from './context/AuthContext'
import { AppProvider } from './context/AppContext'
import Layout from './components/Layout'
import CustomCursor from './components/CustomCursor'
import { useLenis } from './hooks/useLenis'

const HomePage       = lazy(() => import('./pages/HomePage'))
const MealDetailPage = lazy(() => import('./pages/MealDetailPage'))
const FavoritesPage  = lazy(() => import('./pages/FavoritesPage'))
const PlannerPage    = lazy(() => import('./pages/PlannerPage'))
const ShoppingPage   = lazy(() => import('./pages/ShoppingPage'))
const AuthPage       = lazy(() => import('./pages/AuthPage'))
const PantryPage     = lazy(() => import('./pages/PantryPage'))
const NotFoundPage   = lazy(() => import('./pages/NotFoundPage'))

function AppInner() {
  useLenis()

  return (
    <BrowserRouter>
      <Layout>
        <Suspense fallback={
          <div role="status" aria-live="polite" className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-[#D9A35F] border-t-transparent rounded-full animate-spin" aria-label="Loading" />
          </div>
        }>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/meal/:id" element={<MealDetailPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/planner" element={<PlannerPage />} />
            <Route path="/shopping" element={<ShoppingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/pantry" element={<PantryPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </Layout>
    </BrowserRouter>
  )
}

export default function App() {
  return (
    <I18nProvider>
      <AuthProvider>
        <AppProvider>
          <AppInner />
          <CustomCursor />
        </AppProvider>
      </AuthProvider>
    </I18nProvider>
  )
}
