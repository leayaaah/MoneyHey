import { useState } from 'react'
import Login from './components/Login'
import Register from './components/Register'
import Dashboard from './components/Dashboard'

import './App.css'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [page, setPage] = useState('login')

  if (isLoggedIn) {
    return <Dashboard onLogout={() => setIsLoggedIn(false)} />
  }

  return (
    <>
      {page === 'login'
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
