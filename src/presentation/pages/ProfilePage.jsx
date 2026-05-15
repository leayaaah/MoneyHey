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
        console.warn('Khong the doc cai dat da luu:', error);
        return DEFAULT_SETTINGS;
    }
};

const CURRENCY_LABELS = {
    VND: 'd',
    USD: '$',
    EUR: 'EUR',
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

    const languageLabel = settings.language === 'en' ? 'English' : 'Tieng Viet';
    const startOfWeekLabel = settings.startOfWeek === 'sunday' ? 'Chu nhat' : 'Thu hai';

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
                console.error('Khong the tai danh sach vi:', error);

                if (!active) {
                    return;
                }

                startTransition(() => {
                    setWalletError('Khong the tai danh sach vi luc nay.');
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
            console.error('Khong the tai danh sach vi:', error);
            startTransition(() => {
                setWalletError('Khong the tai danh sach vi luc nay.');
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
            setWalletError('Phien dang nhap khong hop le.');
            return;
        }

        try {
            setIsSavingWallet(true);
            setWalletError('');
            setWalletActionMessage('');

            if (editingWalletId) {
                await updateWallet(editingWalletId, walletForm);
                setWalletActionMessage('Da cap nhat vi thanh cong.');
            } else {
                await createWallet({
                    ...walletForm,
                    user_id: userId,
                });
                setWalletActionMessage('Da tao vi moi.');
            }

            await loadWallets();
            resetWalletForm();
        } catch (error) {
            console.error('Khong the luu vi:', error);
            setWalletError(error?.message || 'Khong the luu thay doi cho vi.');
        } finally {
            setIsSavingWallet(false);
        }
    };

    const handleDeleteWallet = async (wallet) => {
        if (!userId) {
            setWalletError('Phien dang nhap khong hop le.');
            return;
        }

        if (!window.confirm(`Xoa vi "${wallet.wallet_name}"? Thao tac nay khong the hoan tac.`)) {
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

            setWalletActionMessage('Da xoa vi thanh cong.');
        } catch (error) {
            console.error('Khong the xoa vi:', error);
            setWalletError(error?.message || 'Khong the xoa vi nay.');
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
                            <h1 className="page-title font-headline">Ho so nguoi dung</h1>
                            <p className="page-subtitle">{formattedDate}</p>
                        </div>
                        <button
                            type="button"
                            className="btn-primary-emerald px-4 py-2 d-flex align-items-center gap-2 shadow-sm"
                            title="Tinh nang sap ra mat"
                            disabled
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span>
                            Cap nhat ho so
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
                                    <h2 className="profile-name">{user?.name || 'Nguoi dung'}</h2>
                                    <p className="profile-email">{user?.email || 'Chua cap nhat email'}</p>
                                    <div className="profile-tags">
                                        <span className="profile-tag">Tai khoan ca nhan</span>
                                        <span className="profile-tag success">Dang hoat dong</span>
                                    </div>
                                </div>
                            </div>

                            <div className="profile-info-grid">
                                <div className="profile-info-item">
                                    <span className="info-label">Ten hien thi</span>
                                    <span className="info-value">{user?.name || 'Nguoi dung'}</span>
                                </div>
                                <div className="profile-info-item">
                                    <span className="info-label">So dien thoai</span>
                                    <span className="info-value">Chua cap nhat</span>
                                </div>
                                <div className="profile-info-item">
                                    <span className="info-label">Dia chi</span>
                                    <span className="info-value">Chua cap nhat</span>
                                </div>
                                <div className="profile-info-item">
                                    <span className="info-label">Ngay tham gia</span>
                                    <span className="info-value">Chua cap nhat</span>
                                </div>
                            </div>
                        </section>

                        <section className="profile-card">
                            <div className="profile-card-header">
                                <div>
                                    <h3 className="profile-card-title">Thong tin co ban</h3>
                                    <p className="profile-card-subtitle">Thiet lap mac dinh va tuy chon thuong dung</p>
                                </div>
                                <span className="profile-chip">{languageLabel}</span>
                            </div>

                            <div className="profile-detail-list">
                                <div className="profile-detail-row">
                                    <div>
                                        <div className="detail-title">Ngon ngu</div>
                                        <div className="detail-subtitle">Hien thi giao dien</div>
                                    </div>
                                    <span className="detail-value">{languageLabel}</span>
                                </div>
                                <div className="profile-detail-row">
                                    <div>
                                        <div className="detail-title">Tien te</div>
                                        <div className="detail-subtitle">Don vi hien thi</div>
                                    </div>
                                    <span className="detail-value">{settings.currency}</span>
                                </div>
                                <div className="profile-detail-row">
                                    <div>
                                        <div className="detail-title">Bat dau tuan</div>
                                        <div className="detail-subtitle">Lich bao cao</div>
                                    </div>
                                    <span className="detail-value">{startOfWeekLabel}</span>
                                </div>
                                <div className="profile-detail-row">
                                    <div>
                                        <div className="detail-title">Uu tien thong bao</div>
                                        <div className="detail-subtitle">Nhac nho tai chinh</div>
                                    </div>
                                    <span className="detail-value">
                                        {settings.notifications ? 'Dang bat' : 'Dang tat'}
                                    </span>
                                </div>
                            </div>
                        </section>

                        <section className="profile-card wallet-card">
                            <div className="profile-card-header">
                                <div>
                                    <h3 className="profile-card-title">Quan ly vi</h3>
                                    <p className="profile-card-subtitle">Tao vi moi, chinh so du hien tai va don vi khong con dung</p>
                                </div>
                                <button
                                    className="profile-action-btn"
                                    type="button"
                                    onClick={handleCreateWallet}
                                >
                                    <span className="material-symbols-outlined">add</span>
                                    Them vi
                                </button>
                            </div>

                            <div className="wallet-summary">
                                <div className="wallet-summary-item">
                                    <div className="wallet-summary-label">So luong vi</div>
                                    <div className="wallet-summary-value">{wallets.length}</div>
                                </div>
                                <div className="wallet-summary-item">
                                    <div className="wallet-summary-label">Tong so du</div>
                                    <div className="wallet-summary-value">
                                        {formatBalance(totalBalance, settings.currency)}
                                    </div>
                                </div>
                            </div>

                            {walletFormVisible ? (
                                <form className="wallet-form" onSubmit={handleWalletSubmit}>
                                    <div className="wallet-form-grid">
                                        <div>
                                            <label className="form-label">Ten vi</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="wallet_name"
                                                value={walletForm.wallet_name}
                                                onChange={handleWalletFormChange}
                                                placeholder="Vi tien mat, MB Bank, MoMo..."
                                            />
                                        </div>
                                        <div>
                                            <label className="form-label">So du hien tai</label>
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
                                            Huy
                                        </button>
                                        <button
                                            type="submit"
                                            className="btn btn-primary"
                                            disabled={isSavingWallet}
                                        >
                                            {isSavingWallet
                                                ? 'Dang luu...'
                                                : editingWalletId
                                                    ? 'Cap nhat vi'
                                                    : 'Tao vi'}
                                        </button>
                                    </div>
                                </form>
                            ) : null}

                            {walletActionMessage ? (
                                <div className="profile-empty success">{walletActionMessage}</div>
                            ) : null}

                            {walletLoading ? (
                                <div className="profile-empty">Dang tai danh sach vi...</div>
                            ) : null}
                            {!walletLoading && walletError ? (
                                <div className="profile-empty error">{walletError}</div>
                            ) : null}
                            {!walletLoading && !walletError && wallets.length === 0 ? (
                                <div className="profile-empty">Chua co vi nao. Hay tao vi de bat dau quan ly.</div>
                            ) : null}
                            {!walletLoading && !walletError && wallets.length > 0 ? (
                                <div className="wallet-list">
                                    {wallets.map((wallet, index) => (
                                        <div
                                            key={wallet.wallet_id || `wallet-${wallet.wallet_name || 'unknown'}-${index}`}
                                            className="wallet-item"
                                        >
                                            <div className="wallet-item-main">
                                                <div className="wallet-name">{wallet.wallet_name || 'Vi ca nhan'}</div>
                                                <div className="wallet-meta">
                                                    Cap nhat so du thu cong de phan anh so tien dang co thuc te
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
                                                        Sua
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn btn-outline-danger btn-sm"
                                                        onClick={() => handleDeleteWallet(wallet)}
                                                        disabled={deletingWalletId === wallet.wallet_id}
                                                    >
                                                        {deletingWalletId === wallet.wallet_id ? 'Dang xoa...' : 'Xoa'}
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
