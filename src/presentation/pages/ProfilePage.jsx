import React, { useEffect, useMemo, useState } from 'react';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import { fetchWallets } from '../../application/services/walletService';
import { useAuth } from '../hooks/useAuth';
import '../../css/ProfilePage.css';

const SETTINGS_STORAGE_KEY = 'moneyhey_settings';
const DEFAULT_SETTINGS = {
    language: 'vi',
    currency: 'VND',
    startOfWeek: 'monday',
    notifications: true,
};

const getStoredSettings = () => {
    if (typeof window === 'undefined') {
        return DEFAULT_SETTINGS;
    }
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!stored) {
        return DEFAULT_SETTINGS;
    }
    try {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    } catch (error) {
        console.warn('Không thể đọc cài đặt đã lưu:', error);
        return DEFAULT_SETTINGS;
    }
};

const CURRENCY_LABELS = {
    VND: 'đ',
    USD: '$',
    EUR: '€',
};

const formatBalance = (value, currency) => {
    const numericValue = Number(value || 0);
    const suffix = CURRENCY_LABELS[currency] || currency;
    return `${numericValue.toLocaleString('vi-VN')} ${suffix}`;
};

const ProfilePage = ({ onLogout }) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [wallets, setWallets] = useState([]);
    const [walletLoading, setWalletLoading] = useState(true);
    const [walletError, setWalletError] = useState('');
    const [settings] = useState(getStoredSettings);
    const { user } = useAuth();

    const formattedDate = new Date().toLocaleDateString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    const initials = user?.name
        ?.split(' ')
        .map(part => part.trim())
        .filter(Boolean)
        .slice(-2)
        .map(part => part[0])
        .join('')
        .toUpperCase() || 'U';

    const totalBalance = useMemo(() => (
        wallets.reduce((sum, wallet) => sum + Number(wallet.balance || 0), 0)
    ), [wallets]);

    const languageLabel = settings.language === 'en' ? 'English' : 'Tiếng Việt';
    const startOfWeekLabel = settings.startOfWeek === 'sunday' ? 'Chủ nhật' : 'Thứ hai';

    useEffect(() => {
        let active = true;
        const loadWallets = async () => {
            setWalletLoading(true);
            setWalletError('');
            try {
                const data = await fetchWallets();
                if (active) {
                    setWallets(Array.isArray(data) ? data : []);
                }
            } catch (error) {
                console.error('Không thể tải danh sách ví:', error);
                if (active) {
                    setWalletError('Không thể tải danh sách ví lúc này.');
                    setWallets([]);
                }
            } finally {
                if (active) {
                    setWalletLoading(false);
                }
            }
        };
        loadWallets();
        return () => {
            active = false;
        };
    }, []);

    return (
        <div className="profile-shell">
            <Header onToggleSidebar={() => setSidebarOpen(v => !v)} onLogout={onLogout} />

            <div className="profile-body">
                <Sidebar open={sidebarOpen} />

                <main className={`profile-main ${sidebarOpen ? 'sidebar-expanded' : 'sidebar-collapsed'}`}>
                    <div className="page-title-row">
                        <div>
                            <h1 className="page-title font-headline">Hồ sơ người dùng</h1>
                            <p className="page-subtitle">{formattedDate}</p>
                        </div>
                        <button
                            type="button"
                            className="btn-primary-emerald px-4 py-2 d-flex align-items-center gap-2 shadow-sm"
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span>
                            Cập nhật hồ sơ
                        </button>
                    </div>

                    <div className="profile-grid">
                        <section className="profile-card profile-hero-card">
                            <div className="profile-hero">
                                <div className="profile-avatar">
                                    {user?.avatar
                                        ? <img src={user.avatar} alt={user?.name || 'User'} />
                                        : <span>{initials}</span>
                                    }
                                </div>
                                <div className="profile-hero-info">
                                    <h2 className="profile-name">{user?.name || 'Người dùng'}</h2>
                                    <p className="profile-email">{user?.email || 'Chưa cập nhật email'}</p>
                                    <div className="profile-tags">
                                        <span className="profile-tag">Tài khoản cá nhân</span>
                                        <span className="profile-tag success">Đang hoạt động</span>
                                    </div>
                                </div>
                            </div>

                            <div className="profile-info-grid">
                                <div className="profile-info-item">
                                    <span className="info-label">Mã người dùng</span>
                                    <span className="info-value">{user?.user_id || '---'}</span>
                                </div>
                                <div className="profile-info-item">
                                    <span className="info-label">Số điện thoại</span>
                                    <span className="info-value">Chưa cập nhật</span>
                                </div>
                                <div className="profile-info-item">
                                    <span className="info-label">Địa chỉ</span>
                                    <span className="info-value">Chưa cập nhật</span>
                                </div>
                                <div className="profile-info-item">
                                    <span className="info-label">Ngày tham gia</span>
                                    <span className="info-value">Chưa cập nhật</span>
                                </div>
                            </div>
                        </section>

                        <section className="profile-card">
                            <div className="profile-card-header">
                                <div>
                                    <h3 className="profile-card-title">Thông tin cơ bản</h3>
                                    <p className="profile-card-subtitle">Thiết lập mặc định và tuỳ chọn thường dùng</p>
                                </div>
                                <span className="profile-chip">{languageLabel}</span>
                            </div>

                            <div className="profile-detail-list">
                                <div className="profile-detail-row">
                                    <div>
                                        <div className="detail-title">Ngôn ngữ</div>
                                        <div className="detail-subtitle">Hiển thị giao diện</div>
                                    </div>
                                    <span className="detail-value">{languageLabel}</span>
                                </div>
                                <div className="profile-detail-row">
                                    <div>
                                        <div className="detail-title">Tiền tệ</div>
                                        <div className="detail-subtitle">Đơn vị hiển thị</div>
                                    </div>
                                    <span className="detail-value">{settings.currency}</span>
                                </div>
                                <div className="profile-detail-row">
                                    <div>
                                        <div className="detail-title">Bắt đầu tuần</div>
                                        <div className="detail-subtitle">Lịch báo cáo</div>
                                    </div>
                                    <span className="detail-value">{startOfWeekLabel}</span>
                                </div>
                                <div className="profile-detail-row">
                                    <div>
                                        <div className="detail-title">Ưu tiên thông báo</div>
                                        <div className="detail-subtitle">Nhắc nhở tài chính</div>
                                    </div>
                                    <span className="detail-value">
                                        {settings.notifications ? 'Đang bật' : 'Đang tắt'}
                                    </span>
                                </div>
                            </div>
                        </section>

                        <section className="profile-card wallet-card">
                            <div className="profile-card-header">
                                <div>
                                    <h3 className="profile-card-title">Quản lý ví</h3>
                                    <p className="profile-card-subtitle">Theo dõi và quản lý các ví đang sử dụng</p>
                                </div>
                                <button className="profile-action-btn" type="button">
                                    <span className="material-symbols-outlined">add</span>
                                    Thêm ví
                                </button>
                            </div>

                            <div className="wallet-summary">
                                <div className="wallet-summary-item">
                                    <div className="wallet-summary-label">Số lượng ví</div>
                                    <div className="wallet-summary-value">{wallets.length}</div>
                                </div>
                                <div className="wallet-summary-item">
                                    <div className="wallet-summary-label">Tổng số dư</div>
                                    <div className="wallet-summary-value">
                                        {formatBalance(totalBalance, settings.currency)}
                                    </div>
                                </div>
                            </div>

                            {walletLoading && (
                                <div className="profile-empty">Đang tải danh sách ví...</div>
                            )}
                            {!walletLoading && walletError && (
                                <div className="profile-empty error">{walletError}</div>
                            )}
                            {!walletLoading && !walletError && wallets.length === 0 && (
                                <div className="profile-empty">Chưa có ví nào. Hãy tạo ví để bắt đầu quản lý.</div>
                            )}
                            {!walletLoading && !walletError && wallets.length > 0 && (
                                <div className="wallet-list">
                                    {wallets.map((wallet) => (
                                        <div
                                            key={wallet.wallet_id || `${wallet.wallet_name || 'wallet'}-${wallet.balance || 0}`}
                                            className="wallet-item"
                                        >
                                            <div>
                                                <div className="wallet-name">{wallet.wallet_name || 'Ví cá nhân'}</div>
                                                <div className="wallet-meta">
                                                    {wallet.wallet_id ? `Mã ví: ${wallet.wallet_id}` : 'Mã ví: --'}
                                                </div>
                                            </div>
                                            <div className="wallet-balance">
                                                {formatBalance(wallet.balance, settings.currency)}
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
