import { useEffect } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import ExplorePage from './pages/ExplorePage'

import './App.css'

function App() {
  const navigate = useNavigate();
  const { isLoggedIn, signIn, signOut } = useAuth();

  useEffect(() => {
    if (isLoggedIn) navigate('/dashboard');
    else navigate('/login');
  }, [isLoggedIn, navigate]);

  return (
    <Routes>
      <Route path='/login'     element={<LoginPage onSignIn={signIn} />} />
      <Route path='/register'  element={<RegisterPage />} />
      <Route path='/explore'   element={<ExplorePage />} />
      <Route path='/dashboard' element={<DashboardPage onLogout={signOut} />} />
      <Route path='/'          element={<LoginPage onSignIn={signIn} />} />
    </Routes>
  )
}

export default App
