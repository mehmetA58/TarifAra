import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { I18nProvider } from './context/I18nContext'
import { AuthProvider } from './context/AuthContext'
import { AppProvider } from './context/AppContext'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import MealDetailPage from './pages/MealDetailPage'
import FavoritesPage from './pages/FavoritesPage'
import PlannerPage from './pages/PlannerPage'
import ShoppingPage from './pages/ShoppingPage'
import AuthPage from './pages/AuthPage'
import NotFoundPage from './pages/NotFoundPage'
import PantryPage from './pages/PantryPage'

export default function App() {
  return (
    <I18nProvider>
      <AuthProvider>
        <AppProvider>
          <BrowserRouter>
            <Layout>
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
            </Layout>
          </BrowserRouter>
        </AppProvider>
      </AuthProvider>
    </I18nProvider>
  )
}
