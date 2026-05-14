import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../../css/Header.css';
import { useAuth } from '../../hooks/useAuth';

const Header = ({ onToggleSidebar, onLogout }) => {
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [notifCount] = useState(3);
    const navigate = useNavigate();

    const { user } = useAuth(); 
    const initials = user?.name
        ?.split(' ')
        .slice(-2)
        .map(w => w[0])
        .join('')
        .toUpperCase() || 'U';

    const handleLogout = () => {
        const ok = window.confirm('Bạn có chắc muốn đăng xuất không?');
        if (!ok) return;
        setShowUserMenu(false);
        onLogout && onLogout();
    };

    const handleNavigate = (path) => {
        setShowUserMenu(false);
        navigate(path);
    };

    return (
        <header className="dashboard-header d-flex align-items-center px-3 px-md-4">
            <div className="d-flex align-items-center gap-3 me-auto">
                <button
                    className="btn btn-icon border-0 p-1"
                    onClick={onToggleSidebar}
                >
                    <span className="material-symbols-outlined">menu</span>
                </button>

                <span className="fw-bold fs-5 font-headline" style={{ color: 'var(--emerald-primary)' }}>
                    Money Hey
                </span>
            </div>

            <div className="d-flex align-items-center gap-2 ms-auto">
                <div className="position-relative">
                    <button
                        className="btn btn-icon border-0 p-0 d-flex align-items-center gap-2"
                        onClick={() => setShowUserMenu(v => !v)}
                    >
                        <div className="avatar-circle">
                            {user?.avatar
                                ? <img src={user.avatar} alt={user.name} />
                                : <span>{initials}</span>
                            }
                        </div>

                        <span className="d-none d-md-block small fw-semibold">
                            {user?.name || 'User'}
                        </span>
                    </button>

                    {showUserMenu && (
                        <div className="user-dropdown shadow">
                            <div className="user-dropdown-header">
                                <div className="user-dropdown-name">{user?.name || 'User'}</div>
                                <div className="user-dropdown-email">{user?.email || 'Chưa cập nhật email'}</div>
                            </div>

                            <div className="user-dropdown-actions">
                                <button
                                    type="button"
                                    className="user-dropdown-btn"
                                    onClick={() => handleNavigate('/profile')}
                                >
                                    <span className="material-symbols-outlined">person</span>
                                    Hồ sơ của tôi
                                </button>
                                <button
                                    type="button"
                                    className="user-dropdown-btn"
                                    onClick={() => handleNavigate('/settings')}
                                >
                                    <span className="material-symbols-outlined">settings</span>
                                    Cài đặt
                                </button>
                            </div>

                            <div className="user-dropdown-divider" />

                            <button
                                type="button"
                                className="user-dropdown-btn danger"
                                onClick={handleLogout}
                            >
                                <span className="material-symbols-outlined">logout</span>
                                Đăng xuất
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
