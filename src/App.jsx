import { useState } from 'react'
import Login from './components/Login'
import Register from './components/Register'

import './App.css'

function App() {
  const [page, setPage] = useState('login')

  return (
    <>
      {page === 'login'
        ? <Login onNavigateToRegister={() => setPage('register')} />
        : <Register onNavigateToLogin={() => setPage('login')} />
      }
    </>
  )
}

export default App
