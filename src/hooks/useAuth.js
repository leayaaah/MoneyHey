import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { signOut, setSession } from '../services/authService'

export const useAuth = () => {
    const navigate = useNavigate()
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
                setSession(session).then(({ data, error }) => {
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
        await signOut()
        setIsLoggedIn(false)
        navigate('/login')
    }

    return { isLoggedIn, setIsLoggedIn, handleLogout }
}
