import { Routes, Route } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import ExplorePage from './pages/ExplorePage'
import { useAuth } from './hooks/useAuth'

import './App.css'

function App() {
  const { isLoggedIn, setIsLoggedIn, handleLogout } = useAuth()

  if (isLoggedIn) {
    return <DashboardPage onLogout={handleLogout} />
  }

  return (
    <Routes>
      <Route path='/login' element={<LoginPage onLoginSuccess={() => setIsLoggedIn(true)} />} />
      <Route path='/register' element={<RegisterPage />} />
      <Route path='/explore' element={<ExplorePage />} />
      <Route path='/dashboard' element={<DashboardPage onLogout={handleLogout} />} />
      <Route path='/' element={<LoginPage onLoginSuccess={() => setIsLoggedIn(true)} />} />
    </Routes>
  )
}

export default App
