import React, { useState } from 'react';
import '../../css/Header.css';
import { useAuth } from '../../hooks/useAuth';

const Header = ({ onToggleSidebar, onLogout }) => {
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [notifCount] = useState(3);

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
                            <div className="px-3 pt-3 pb-2">
                                <div className="fw-bold small">{user?.name}</div>
                                <div className="text-muted" style={{ fontSize: '12px' }}>
                                    {user?.email}
                                </div>
                            </div>

                            <button
                                className="dropdown-item small py-2 text-danger w-100 text-start border-0 bg-transparent"
                                onClick={handleLogout}
                            >
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