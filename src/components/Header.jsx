import React, { useEffect, useState } from 'react';
import '../css/Header.css';
import { supabase } from '../services/supabase';

const Header = ({ onToggleSidebar, onLogout }) => {
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [notifCount] = useState(3);
    const [user, setUser] = useState({ name: "User", email: "user@moneyhey.vn", avatar: null });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data: authData, error: authError } = await supabase.auth.getUser();
                
                if (authError || !authData.user) {
                    console.log("Chưa đăng nhập, không tải profile.");
                    return; 
                }

                const { data: profileData, error: profileError } = await supabase
                    .from('profiles')
                    .select('full_name, email, avatar_img') 
                    .eq('user_id', authData.user.id)        
                    .single(); 

                if (profileError) {
                    console.error("Lỗi khi tải hồ sơ:", profileError.message);
                    return;
                }

                if (profileData) {
                    setUser({
                        name: profileData.full_name,
                        email: profileData.email,
                        avatar: profileData.avatar_img
                    });
                    console.log("Đã tải xong Profile:", profileData);
                }

            } catch (err) {
                console.error("Lỗi mạng lưới:", err);
            }
        };
        fetchProfile();
    }, []);

    const initials = user.name
        .split(' ')
        .slice(-2)
        .map(w => w[0])
        .join('')
        .toUpperCase();
    const handleLogout = () => {
        
        console.log('User logged out');
    }

    return (
        <header className="dashboard-header d-flex align-items-center px-3 px-md-4">
            <div className="d-flex align-items-center gap-3 me-auto">
                <button
                    className="btn btn-icon border-0 p-1"
                    onClick={onToggleSidebar}
                    aria-label="Toggle sidebar"
                >
                    <span className="material-symbols-outlined">menu</span>
                </button>
                <span className="fw-bold fs-5 font-headline" style={{ color: 'var(--emerald-primary)' }}>
                    Money Hey
                </span>
            </div>

            <div className="d-none d-md-flex flex-grow-1 mx-4" style={{ maxWidth: '400px' }}>
                <div className="input-group input-group-sm header-search">
                    <span className="input-group-text border-0 bg-transparent">
                        <span className="material-symbols-outlined fs-6 text-muted">search</span>
                    </span>
                    <input
                        type="search"
                        className="form-control border-0"
                        placeholder="Tìm kiếm giao dịch..."
                        aria-label="Search"
                    />
                </div>
            </div>

            <div className="d-flex align-items-center gap-2 ms-auto">
                <button className="btn btn-icon position-relative border-0 p-1" aria-label="Notifications">
                    <span className="material-symbols-outlined">notifications</span>
                    {notifCount > 0 && (
                        <span className="notif-badge">{notifCount}</span>
                    )}
                </button>

                <div className="position-relative">
                    <button
                        className="btn btn-icon border-0 p-0 d-flex align-items-center gap-2"
                        onClick={() => setShowUserMenu(v => !v)}
                        aria-label="User menu"
                        aria-expanded={showUserMenu}
                    >
                        <div className="avatar-circle">
                            {user.avatar
                                ? <img src={user.avatar} alt={user.name} />
                                : <span>{initials}</span>
                            }
                        </div>
                        <span className="d-none d-md-block small fw-semibold text-truncate" style={{ maxWidth: '120px' }}>
                            {user.name}
                        </span>
                        <span className="material-symbols-outlined d-none d-md-block" style={{ fontSize: '18px' }}>
                            expand_more
                        </span>
                    </button>

                    {showUserMenu && (
                        <div className="user-dropdown shadow">
                            <div className="user-dropdown-header px-3 pt-3 pb-2">
                                <div className="fw-bold small">{user.name}</div>
                                <div className="text-muted" style={{ fontSize: '12px' }}>{user.email}</div>
                            </div>
                            <hr className="my-1" />
                            <a href="#profile" className="dropdown-item small py-2">
                                <span className="material-symbols-outlined me-2" style={{ fontSize: '16px', verticalAlign: 'middle' }}>person</span>
                                Hồ sơ
                            </a>
                            <a href="#settings" className="dropdown-item small py-2">
                                <span className="material-symbols-outlined me-2" style={{ fontSize: '16px', verticalAlign: 'middle' }}>settings</span>
                                Cài đặt
                            </a>
                            <hr className="my-1" />
                            <button
                                className="dropdown-item small py-2 text-danger w-100 text-start border-0 bg-transparent"
                                onClick={() => { setShowUserMenu(false); onLogout && onLogout(); }}
                            >
                                <span className="material-symbols-outlined me-2" style={{ fontSize: '16px', verticalAlign: 'middle' }}>logout</span>
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