import { useEffect } from 'react'
import { Routes, Route, Navigate} from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import ExplorePage from './pages/ExplorePage'
import TransactionPage from './pages/TransactionPage'
import ProtectedRoute from './components/auth/ProtectedRoute'

import './App.css'

function App() {
  const { isLoggedIn, setIsLoggedIn, logout } = useAuth();

  return (
    <Routes>
      <Route path='/login'    
        element={isLoggedIn 
          ? <Navigate to="/dashboard" replace /> 
          : <LoginPage />} />
      <Route path='/register'  element={<RegisterPage />} />
      <Route path='/explore'   element={<ExplorePage />} />

      <Route element={<ProtectedRoute isAuthenticated={isLoggedIn} />}>
        <Route path='/dashboard' element={<DashboardPage onLogout={logout} />} />
        <Route path='/transactions' element={<TransactionPage />}/>
      </Route>

      <Route path='/' 
        element={
          isLoggedIn 
            ? <Navigate to="/dashboard" replace /> 
            : <LoginPage />
        } 
      />
    </Routes>
  )
}

export default App
