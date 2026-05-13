import React, { useEffect, useState } from 'react';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import '../../css/SettingsPage.css';

const SETTINGS_STORAGE_KEY = 'moneyhey_settings';
const DEFAULT_SETTINGS = {
    theme: 'light',
    language: 'vi',
    currency: 'VND',
    startOfWeek: 'monday',
    notifications: true,
    weeklyReport: false,
    autoBackup: true,
};

const getInitialSettings = () => {
    if (typeof window === 'undefined') {
        return DEFAULT_SETTINGS;
    }
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!stored) {
        return DEFAULT_SETTINGS;
    }
    try {
        const parsed = JSON.parse(stored);
        return { ...DEFAULT_SETTINGS, ...parsed };
    } catch (error) {
        console.warn('Không thể đọc cài đặt đã lưu:', error);
        return DEFAULT_SETTINGS;
    }
};

const SettingsPage = ({ onLogout }) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [settings, setSettings] = useState(getInitialSettings);

    const formattedDate = new Date().toLocaleDateString('vi-VN', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', settings.theme);
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    }, [settings]);

    const updateSetting = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleReset = () => {
        const ok = window.confirm('Bạn có muốn khôi phục cài đặt mặc định?');
        if (!ok) return;
        setSettings(DEFAULT_SETTINGS);
    };

    return (
        <div className="settings-shell">
            <Header onToggleSidebar={() => setSidebarOpen(v => !v)} onLogout={onLogout} />

            <div className="settings-body">
                <Sidebar open={sidebarOpen} />

                <main className={`settings-main ${sidebarOpen ? 'sidebar-expanded' : 'sidebar-collapsed'}`}>
                    <div className="page-title-row">
                        <div>
                            <h1 className="page-title font-headline">Cài đặt</h1>
                            <p className="page-subtitle">{formattedDate}</p>
                        </div>
                    </div>

                    <div className="settings-grid">
                        <section className="settings-card">
                            <div className="settings-card-header">
                                <div className="settings-card-icon">
                                    <span className="material-symbols-outlined">palette</span>
                                </div>
                                <div>
                                    <h5 className="settings-card-title">Giao diện</h5>
                                    <p className="settings-card-subtitle">Tùy chỉnh màu sắc và hiển thị</p>
                                </div>
                            </div>

                            <div className="settings-item">
                                <div>
                                    <div className="settings-item-title">Chế độ hiển thị</div>
                                    <div className="settings-item-subtitle">Chọn sáng hoặc tối</div>
                                </div>
                                <div className="settings-option-group">
                                    <button
                                        type="button"
                                        className={`settings-option ${settings.theme === 'light' ? 'active' : ''}`}
                                        onClick={() => updateSetting('theme', 'light')}
                                    >
                                        Sáng
                                    </button>
                                    <button
                                        type="button"
                                        className={`settings-option ${settings.theme === 'dark' ? 'active' : ''}`}
                                        onClick={() => updateSetting('theme', 'dark')}
                                    >
                                        Tối
                                    </button>
                                </div>
                            </div>

                            <div className="settings-item">
                                <div>
                                    <div className="settings-item-title">Màu chủ đạo</div>
                                    <div className="settings-item-subtitle">Mặc định Emerald</div>
                                </div>
                                <span className="settings-chip">Emerald</span>
                            </div>
                        </section>

                        <section className="settings-card">
                            <div className="settings-card-header">
                                <div className="settings-card-icon">
                                    <span className="material-symbols-outlined">notifications</span>
                                </div>
                                <div>
                                    <h5 className="settings-card-title">Thông báo</h5>
                                    <p className="settings-card-subtitle">Kiểm soát nhắc nhở quan trọng</p>
                                </div>
                            </div>

                            <div className="settings-item">
                                <div>
                                    <div className="settings-item-title">Nhắc nhở chi tiêu</div>
                                    <div className="settings-item-subtitle">Cảnh báo khi sắp vượt ngân sách</div>
                                </div>
                                <label className="settings-switch">
                                    <input
                                        type="checkbox"
                                        checked={settings.notifications}
                                        onChange={(event) => updateSetting('notifications', event.target.checked)}
                                    />
                                    <span className="settings-slider" />
                                </label>
                            </div>

                            <div className="settings-item">
                                <div>
                                    <div className="settings-item-title">Báo cáo tuần</div>
                                    <div className="settings-item-subtitle">Gửi email tổng kết mỗi tuần</div>
                                </div>
                                <label className="settings-switch">
                                    <input
                                        type="checkbox"
                                        checked={settings.weeklyReport}
                                        onChange={(event) => updateSetting('weeklyReport', event.target.checked)}
                                    />
                                    <span className="settings-slider" />
                                </label>
                            </div>
                        </section>

                        <section className="settings-card">
                            <div className="settings-card-header">
                                <div className="settings-card-icon">
                                    <span className="material-symbols-outlined">tune</span>
                                </div>
                                <div>
                                    <h5 className="settings-card-title">Định dạng</h5>
                                    <p className="settings-card-subtitle">Ngôn ngữ và tiền tệ hiển thị</p>
                                </div>
                            </div>

                            <div className="settings-item">
                                <div>
                                    <div className="settings-item-title">Ngôn ngữ</div>
                                    <div className="settings-item-subtitle">Hiển thị giao diện</div>
                                </div>
                                <select
                                    className="settings-select"
                                    value={settings.language}
                                    onChange={(event) => updateSetting('language', event.target.value)}
                                >
                                    <option value="vi">Tiếng Việt</option>
                                    <option value="en">English</option>
                                </select>
                            </div>

                            <div className="settings-item">
                                <div>
                                    <div className="settings-item-title">Tiền tệ</div>
                                    <div className="settings-item-subtitle">Đơn vị mặc định</div>
                                </div>
                                <select
                                    className="settings-select"
                                    value={settings.currency}
                                    onChange={(event) => updateSetting('currency', event.target.value)}
                                >
                                    <option value="VND">VND (₫)</option>
                                    <option value="USD">USD ($)</option>
                                    <option value="EUR">EUR (€)</option>
                                </select>
                            </div>

                            <div className="settings-item">
                                <div>
                                    <div className="settings-item-title">Bắt đầu tuần</div>
                                    <div className="settings-item-subtitle">Lịch báo cáo</div>
                                </div>
                                <select
                                    className="settings-select"
                                    value={settings.startOfWeek}
                                    onChange={(event) => updateSetting('startOfWeek', event.target.value)}
                                >
                                    <option value="monday">Thứ hai</option>
                                    <option value="sunday">Chủ nhật</option>
                                </select>
                            </div>
                        </section>

                        <section className="settings-card">
                            <div className="settings-card-header">
                                <div className="settings-card-icon">
                                    <span className="material-symbols-outlined">verified_user</span>
                                </div>
                                <div>
                                    <h5 className="settings-card-title">Bảo mật</h5>
                                    <p className="settings-card-subtitle">Tăng cường an toàn dữ liệu</p>
                                </div>
                            </div>

                            <div className="settings-item">
                                <div>
                                    <div className="settings-item-title">Tự động sao lưu</div>
                                    <div className="settings-item-subtitle">Lưu dữ liệu lên đám mây</div>
                                </div>
                                <label className="settings-switch">
                                    <input
                                        type="checkbox"
                                        checked={settings.autoBackup}
                                        onChange={(event) => updateSetting('autoBackup', event.target.checked)}
                                    />
                                    <span className="settings-slider" />
                                </label>
                            </div>

                            <div className="settings-item">
                                <div>
                                    <div className="settings-item-title">Khóa phiên tự động</div>
                                    <div className="settings-item-subtitle">Đăng xuất sau 10 phút không hoạt động</div>
                                </div>
                                <span className="settings-chip">Đang bật</span>
                            </div>
                        </section>
                    </div>

                    <div className="settings-footer">
                        <button type="button" className="settings-reset-btn" onClick={handleReset}>
                            Khôi phục mặc định
                        </button>
                        <span className="settings-hint">Các thay đổi được lưu tự động.</span>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default SettingsPage;
