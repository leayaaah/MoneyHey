import { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ExplorePage from './pages/ExplorePage';
import useAuth from './hooks/useAuth';

import './App.css';

function AppRoutes() {
    const { isLoggedIn, loadingAuth, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loadingAuth && isLoggedIn) {
            navigate('/dashboard', { replace: true });
        }
    }, [isLoggedIn, loadingAuth, navigate]);

    if (loadingAuth) return null;

    return (
        <Routes>
            <Route path="/login" element={isLoggedIn ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/dashboard" element={isLoggedIn ? <DashboardPage onLogout={logout} /> : <Navigate to="/login" replace />} />
            <Route path="/" element={<Navigate to={isLoggedIn ? '/dashboard' : '/login'} replace />} />
        </Routes>
    );
}

function App() {
    return <AppRoutes />;
}

export default App;
