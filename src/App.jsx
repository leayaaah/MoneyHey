import { useEffect } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import ExplorePage from './pages/ExplorePage'
import TransactionPage from './pages/TransactionPage'
import ProtectedRoute from './components/auth/ProtectedRoute'

import './App.css'

function App() {
  const navigate = useNavigate();
  const { isLoggedIn, setIsLoggedIn, handleLogout } = useAuth();

  useEffect(() => {
    if (isLoggedIn) 
      navigate('/dashboard');
  }, [isLoggedIn, navigate]);

  return (
    <Routes>
      <Route path='/login'     element={<LoginPage onLoginSuccess={setIsLoggedIn} />} />
      <Route path='/register'  element={<RegisterPage />} />
      <Route path='/explore'   element={<ExplorePage />} />

      <Route element={<ProtectedRoute isAuthenticated={isLoggedIn} />}>
        <Route path='/dashboard' element={<DashboardPage onLogout={handleLogout} />} />
        <Route path='/transaction' element={<TransactionPage />} />
        
      </Route>

      <Route path='/' element={<LoginPage onLoginSuccess={setIsLoggedIn} />} />
    </Routes>
  )
}

export default App
