import { useState } from 'react'
import Login from './components/Login'
import Dashboard from './components/Dashboard'

import './App.css'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  return (
    <>
      {isLoggedIn
        ? <Dashboard />
        : <Login onLoginSuccess={() => setIsLoggedIn(true)} />
      }
    </>
  )
}

export default App
