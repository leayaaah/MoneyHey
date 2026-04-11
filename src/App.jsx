import { useState, useEffect } from 'react'
import Login from './components/Login'
import Register from './components/Register'
import Dashboard from './components/Dashboard'
import Explore from './components/Explore'
import { supabase } from './services/supabase'
import { Routes, Route, useNavigate } from 'react-router-dom'

import './App.css'

function App() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const savedSession = localStorage.getItem('moneyhey_session')
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession)
        const isExpired = session.expires_at && session.expires_at * 1000 < Date.now()
        if (isExpired) {
          localStorage.removeItem('moneyhey_session')
          return
        }
        supabase.auth.setSession(session).then(({ data, error }) => {
          if (!error && data.session) {
            setIsLoggedIn(true)
          } else {
            localStorage.removeItem('moneyhey_session')
          }
        })
      } catch {
        localStorage.removeItem('moneyhey_session')
      }
    }
  }, [])

  const handleLogout = async () => {
    localStorage.removeItem('moneyhey_session')
    await supabase.auth.signOut()
    setIsLoggedIn(false)
    navigate('/login');
  }

  if (isLoggedIn) {
    navigate('/dashboard');
    return <Dashboard onLogout={handleLogout} />
  }

  return (
    <>
    <Routes>
      <Route path='/login' element={<Login onLoginSuccess={() => setIsLoggedIn(true)} />} />
      <Route path='/register' element={<Register />} />
      <Route path='/explore' element={<Explore />} />
      <Route path='/dashboard' element={<Dashboard onLogout={handleLogout} />} />


      <Route path='/' element={<Login onLoginSuccess={() => setIsLoggedIn(true)} />} />
    </Routes>



      {/* {
      page === 'login'
        ? <Login
            onLoginSuccess={() => setIsLoggedIn(true)}
            onNavigateToRegister={() => setPage('register')}
          />
        : <Register onNavigateToLogin={() => setPage('login')} />
      } */}
    </>
  )
}

export default App
