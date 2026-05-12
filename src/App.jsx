import { useEffect } from 'react'
import { Routes, Route, Navigate} from 'react-router-dom'
import { useAuth } from './presentation/hooks/useAuth'
import LoginPage from './presentation/pages/LoginPage'
import RegisterPage from './presentation/pages/RegisterPage'
import DashboardPage from './presentation/pages/DashboardPage'
import ExplorePage from './presentation/pages/ExplorePage'
import TransactionPage from './presentation/pages/TransactionPage'
import ProtectedRoute from './presentation/components/auth/ProtectedRoute'
import ReportPage from './presentation/pages/ReportPage'

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
        <Route path='/reports' element={<ReportPage onLogout={logout} />} />
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
