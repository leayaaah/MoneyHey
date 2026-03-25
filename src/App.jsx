import { useState, useEffect } from 'react'
import Login from './components/Login'
import Register from './components/Register'
import Dashboard from './components/Dashboard'
import { supabase } from './services/supabase'

import './App.css'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [page, setPage] = useState('login')

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
  }

  if (isLoggedIn) {
    return <Dashboard onLogout={handleLogout} />
  }

  return (
    <>
      {
      page === 'login'
        ? <Login
            onLoginSuccess={() => setIsLoggedIn(true)}
            onNavigateToRegister={() => setPage('register')}
          />
        : <Register onNavigateToLogin={() => setPage('login')} />
      }
    </>
  )
}

export default App
