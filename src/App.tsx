import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import HomePage from './pages/HomePage'
import MealDetailPage from './pages/MealDetailPage'
import FavoritesPage from './pages/FavoritesPage'
import PlannerPage from './pages/PlannerPage'
import ShoppingPage from './pages/ShoppingPage'
import NotFoundPage from './pages/NotFoundPage'

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/meal/:id" element={<MealDetailPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/planner" element={<PlannerPage />} />
          <Route path="/shopping" element={<ShoppingPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  )
}
