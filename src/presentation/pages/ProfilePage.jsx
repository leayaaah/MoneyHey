import React, { startTransition, useEffect, useMemo, useState } from 'react';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import {
    createWallet,
    fetchWallets,
    removeWallet,
    updateWallet
} from '../../application/services/walletService';
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

const createWalletFormState = () => ({
    wallet_name: '',
    balance: '0',
});

const ProfilePage = ({ onLogout }) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [wallets, setWallets] = useState([]);
    const [walletLoading, setWalletLoading] = useState(true);
    const [walletError, setWalletError] = useState('');
    const [walletForm, setWalletForm] = useState(createWalletFormState);
    const [walletFormVisible, setWalletFormVisible] = useState(false);
    const [editingWalletId, setEditingWalletId] = useState(null);
    const [walletActionMessage, setWalletActionMessage] = useState('');
    const [isSavingWallet, setIsSavingWallet] = useState(false);
    const [deletingWalletId, setDeletingWalletId] = useState(null);
    const [settings] = useState(getStoredSettings);
    const { user } = useAuth();
    const userId = user?.user_id;

    const formattedDate = useMemo(() => (
        new Date().toLocaleDateString('vi-VN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        })
    ), []);

    const initials = user?.name
        ?.split(' ')
        .map((part) => part.trim())
        .filter(Boolean)
        .slice(-2)
        .map((part) => part[0])
        .join('')
        .toUpperCase() || 'U';

    const totalBalance = useMemo(() => (
        wallets.reduce((sum, wallet) => sum + Number(wallet.balance || 0), 0)
    ), [wallets]);

    const languageLabel = settings.language === 'en' ? 'English' : 'Tiếng Việt';
    const startOfWeekLabel = settings.startOfWeek === 'sunday' ? 'Chủ nhật' : 'Thứ hai';

    const resetWalletForm = () => {
        setWalletForm(createWalletFormState());
        setWalletFormVisible(false);
        setEditingWalletId(null);
    };

    useEffect(() => {
        let active = true;

        startTransition(() => {
            setWalletLoading(true);
            setWalletError('');
        });

        if (!userId) {
            startTransition(() => {
                setWallets([]);
                setWalletLoading(false);
            });
            return () => {
                active = false;
            };
        }

        fetchWallets(userId)
            .then((data) => {
                if (!active) {
                    return;
                }

                startTransition(() => {
                    setWallets(Array.isArray(data) ? data : []);
                    setWalletLoading(false);
                });
            })
            .catch((error) => {
                console.error('Không thể tải danh sách ví:', error);

                if (!active) {
                    return;
                }

                startTransition(() => {
                    setWalletError('Không thể tải danh sách ví lúc này.');
                    setWallets([]);
                    setWalletLoading(false);
                });
            });

        return () => {
            active = false;
        };
    }, [userId]);

    const loadWallets = async () => {
        if (!userId) {
            startTransition(() => {
                setWallets([]);
                setWalletLoading(false);
            });
            return;
        }

        startTransition(() => {
            setWalletLoading(true);
            setWalletError('');
        });

        try {
            const data = await fetchWallets(userId);
            startTransition(() => {
                setWallets(Array.isArray(data) ? data : []);
                setWalletLoading(false);
            });
        } catch (error) {
            console.error('Không thể tải danh sách ví:', error);
            startTransition(() => {
                setWalletError('Không thể tải danh sách ví lúc này.');
                setWallets([]);
                setWalletLoading(false);
            });
        }
    };

    const handleWalletFormChange = (event) => {
        const { name, value } = event.target;
        setWalletForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleCreateWallet = () => {
        setWalletActionMessage('');
        setWalletError('');
        setEditingWalletId(null);
        setWalletForm(createWalletFormState());
        setWalletFormVisible(true);
    };

    const handleEditWallet = (wallet) => {
        setWalletActionMessage('');
        setWalletError('');
        setEditingWalletId(wallet.wallet_id);
        setWalletForm({
            wallet_name: wallet.wallet_name || '',
            balance: String(Number(wallet.balance || 0)),
        });
        setWalletFormVisible(true);
    };

    const handleWalletSubmit = async (event) => {
        event.preventDefault();

        if (!userId) {
            setWalletError('Phiên đăng nhập không hợp lệ.');
            return;
        }

        try {
            setIsSavingWallet(true);
            setWalletError('');
            setWalletActionMessage('');

            if (editingWalletId) {
                await updateWallet(editingWalletId, walletForm);
                setWalletActionMessage('Đã cập nhật ví thành công.');
            } else {
                await createWallet({
                    ...walletForm,
                    user_id: userId,
                });
                setWalletActionMessage('Đã tạo ví mới.');
            }

            await loadWallets();
            resetWalletForm();
        } catch (error) {
            console.error('Không thể lưu ví:', error);
            setWalletError(error?.message || 'Không thể lưu thay đổi cho ví.');
        } finally {
            setIsSavingWallet(false);
        }
    };

    const handleDeleteWallet = async (wallet) => {
        if (!userId) {
            setWalletError('Phiên đăng nhập không hợp lệ.');
            return;
        }

        if (!window.confirm(`Xóa ví "${wallet.wallet_name}"? Thao tác này không thể hoàn tác.`)) {
            return;
        }

        try {
            setDeletingWalletId(wallet.wallet_id);
            setWalletError('');
            setWalletActionMessage('');
            await removeWallet(wallet.wallet_id, userId);
            await loadWallets();

            if (editingWalletId === wallet.wallet_id) {
                resetWalletForm();
            }

            setWalletActionMessage('Đã xóa ví thành công.');
        } catch (error) {
            console.error('Không thể xóa ví:', error);
            setWalletError(error?.message || 'Không thể xóa ví này.');
        } finally {
            setDeletingWalletId(null);
        }
    };

    return (
        <div className="profile-shell">
            <Header onToggleSidebar={() => setSidebarOpen((v) => !v)} onLogout={onLogout} />

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
                            title="Tính năng sắp ra mắt"
                            disabled
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
                                        : <span>{initials}</span>}
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
                                    <span className="info-label">Tên hiển thị</span>
                                    <span className="info-value">{user?.name || 'Người dùng'}</span>
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
                                    <p className="profile-card-subtitle">Thiết lập mặc định và tùy chọn thường dùng</p>
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
                                    <p className="profile-card-subtitle">Tạo ví mới, chỉnh số dư hiện tại và dọn ví không còn dùng</p>
                                </div>
                                <button
                                    className="profile-action-btn"
                                    type="button"
                                    onClick={handleCreateWallet}
                                >
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

                            {walletFormVisible ? (
                                <form className="wallet-form" onSubmit={handleWalletSubmit}>
                                    <div className="wallet-form-grid">
                                        <div>
                                            <label className="form-label">Tên ví</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="wallet_name"
                                                value={walletForm.wallet_name}
                                                onChange={handleWalletFormChange}
                                                placeholder="Ví tiền mặt, MB Bank, MoMo..."
                                            />
                                        </div>
                                        <div>
                                            <label className="form-label">Số dư hiện tại</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                name="balance"
                                                value={walletForm.balance}
                                                onChange={handleWalletFormChange}
                                            />
                                        </div>
                                    </div>

                                    <div className="wallet-form-actions">
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary"
                                            onClick={resetWalletForm}
                                            disabled={isSavingWallet}
                                        >
                                            Hủy
                                        </button>
                                        <button
                                            type="submit"
                                            className="btn btn-primary"
                                            disabled={isSavingWallet}
                                        >
                                            {isSavingWallet
                                                ? 'Đang lưu...'
                                                : editingWalletId
                                                    ? 'Cập nhật ví'
                                                    : 'Tạo ví'}
                                        </button>
                                    </div>
                                </form>
                            ) : null}

                            {walletActionMessage ? (
                                <div className="profile-empty success">{walletActionMessage}</div>
                            ) : null}

                            {walletLoading ? (
                                <div className="profile-empty">Đang tải danh sách ví...</div>
                            ) : null}
                            {!walletLoading && walletError ? (
                                <div className="profile-empty error">{walletError}</div>
                            ) : null}
                            {!walletLoading && !walletError && wallets.length === 0 ? (
                                <div className="profile-empty">Chưa có ví nào. Hãy tạo ví để bắt đầu quản lý.</div>
                            ) : null}
                            {!walletLoading && !walletError && wallets.length > 0 ? (
                                <div className="wallet-list">
                                    {wallets.map((wallet, index) => (
                                        <div
                                            key={wallet.wallet_id || `wallet-${wallet.wallet_name || 'unknown'}-${index}`}
                                            className="wallet-item"
                                        >
                                            <div className="wallet-item-main">
                                                <div className="wallet-name">{wallet.wallet_name || 'Ví cá nhân'}</div>
                                                <div className="wallet-meta">
                                                    Cập nhật số dư thủ công để phản ánh số tiền đang có thực tế
                                                </div>
                                            </div>
                                            <div className="wallet-item-actions">
                                                <div className="wallet-balance">
                                                    {formatBalance(wallet.balance, settings.currency)}
                                                </div>
                                                <div className="wallet-action-row">
                                                    <button
                                                        type="button"
                                                        className="btn btn-outline-primary btn-sm"
                                                        onClick={() => handleEditWallet(wallet)}
                                                    >
                                                        Sửa
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn btn-outline-danger btn-sm"
                                                        onClick={() => handleDeleteWallet(wallet)}
                                                        disabled={deletingWalletId === wallet.wallet_id}
                                                    >
                                                        {deletingWalletId === wallet.wallet_id ? 'Đang xóa...' : 'Xóa'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : null}
                        </section>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ProfilePage;
