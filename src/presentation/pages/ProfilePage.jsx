import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import { useAuth } from '../hooks/useAuth';
import { fetchWallets, getTotalBalance } from '../../application/services/walletService';
import { formatCompactVnd } from '../utils/formatCurrency';
import '../../css/ProfilePage.css';

const ProfilePage = ({ onLogout }) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [wallets, setWallets] = useState([]);
    const [totalBalance, setTotalBalance] = useState(0);
    const [walletLoading, setWalletLoading] = useState(true);
    const [walletError, setWalletError] = useState('');
    const { user, isLoggedIn } = useAuth();

    const formattedDate = useMemo(() => new Date().toLocaleDateString('vi-VN', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    }), []);

    const initials = useMemo(() => {
        if (!user?.name) return 'U';
        return user.name
            .split(' ')
            .slice(-2)
            .map(part => part[0])
            .join('')
            .toUpperCase();
    }, [user?.name]);

    const loadWallets = useCallback(async () => {
        setWalletLoading(true);
        setWalletError('');
        try {
            const [walletData, total] = await Promise.all([
                fetchWallets(),
                getTotalBalance(),
            ]);
            setWallets(walletData);
            setTotalBalance(total);
        } catch (error) {
            console.error('Failed to load wallets:', error);
            setWalletError('Không thể tải thông tin ví lúc này.');
        } finally {
            setWalletLoading(false);
        }
    }, []);

    useEffect(() => {
        loadWallets();
    }, [loadWallets]);

    const totalBalanceText = formatCompactVnd(totalBalance);
    const walletCount = wallets.length;

    return (
        <div className="profile-shell">
            <Header onToggleSidebar={() => setSidebarOpen(v => !v)} onLogout={onLogout} />

            <div className="profile-body">
                <Sidebar open={sidebarOpen} />

                <main className={`profile-main ${sidebarOpen ? 'sidebar-expanded' : 'sidebar-collapsed'}`}>
                    <div className="page-title-row">
                        <div>
                            <h1 className="page-title font-headline">Hồ sơ cá nhân</h1>
                            <p className="page-subtitle">{formattedDate}</p>
                        </div>
                    </div>

                    <div className="profile-grid">
                        <section className="profile-card profile-card--user">
                            <div className="profile-user">
                                <div className="profile-avatar">
                                    {user?.avatar
                                        ? <img src={user.avatar} alt={user?.name || 'User'} />
                                        : <span>{initials}</span>
                                    }
                                </div>
                                <div>
                                    <h2 className="profile-user-name">{user?.name || 'Người dùng'}</h2>
                                    <p className="profile-user-email">{user?.email || 'Chưa cập nhật email'}</p>
                                </div>
                            </div>

                            <div className="profile-info-list">
                                <div className="profile-info-row">
                                    <span className="profile-info-label">ID người dùng</span>
                                    <span className="profile-info-value">{user?.user_id || '—'}</span>
                                </div>
                                <div className="profile-info-row">
                                    <span className="profile-info-label">Trạng thái</span>
                                    <span className="profile-info-value">{isLoggedIn ? 'Đang hoạt động' : 'Đã đăng xuất'}</span>
                                </div>
                                <div className="profile-info-row">
                                    <span className="profile-info-label">Số lượng ví</span>
                                    <span className="profile-info-value">{walletCount} ví</span>
                                </div>
                            </div>
                        </section>

                        <section className="profile-card">
                            <div className="profile-card-header">
                                <div>
                                    <h3 className="profile-card-title">Quản lý ví</h3>
                                    <p className="profile-card-subtitle">Theo dõi các ví đang sử dụng</p>
                                </div>
                                <button
                                    className="profile-refresh-btn"
                                    onClick={loadWallets}
                                    type="button"
                                >
                                    Làm mới
                                </button>
                            </div>

                            <div className="profile-wallet-summary">
                                <div className="profile-wallet-total">
                                    <span className="profile-wallet-label">Tổng số dư</span>
                                    <span className="profile-wallet-value">{totalBalanceText} đ</span>
                                </div>
                                <div className="profile-wallet-meta">
                                    {walletCount} ví đang hoạt động
                                </div>
                            </div>

                            {walletLoading ? (
                                <div className="profile-empty">Đang tải dữ liệu ví...</div>
                            ) : walletError ? (
                                <div className="profile-empty">{walletError}</div>
                            ) : wallets.length === 0 ? (
                                <div className="profile-empty">Bạn chưa có ví nào.</div>
                            ) : (
                                <div className="profile-wallet-list">
                                    {wallets.map(wallet => (
                                        <div key={wallet.wallet_id} className="profile-wallet-item">
                                            <div>
                                                <div className="profile-wallet-name">{wallet.wallet_name}</div>
                                                <div className="profile-wallet-id">ID: {wallet.wallet_id}</div>
                                            </div>
                                            <div className="profile-wallet-balance">
                                                {(wallet.balance || 0).toLocaleString('vi-VN')} đ
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ProfilePage;
