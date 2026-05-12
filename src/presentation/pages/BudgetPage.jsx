import React, { useState } from 'react';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import '../../css/BudgetPage.css';

const BUDGET_ITEMS = [
    { id: 'housing', name: 'Nhà ở', limit: 8000000, spent: 6200000 },
    { id: 'food', name: 'Ăn uống', limit: 3500000, spent: 2800000 },
    { id: 'transport', name: 'Di chuyển', limit: 2000000, spent: 1500000 },
    { id: 'shopping', name: 'Mua sắm', limit: 2500000, spent: 2300000 },
];

const getBudgetStatus = (percentage) => {
    if (percentage >= 100) {
        return { label: 'Vượt ngân sách', tone: 'danger' };
    }
    if (percentage >= 80) {
        return { label: 'Sắp chạm', tone: 'warning' };
    }
    return { label: 'An toàn', tone: 'success' };
};

const BudgetPage = ({ onLogout }) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const formattedDate = new Date().toLocaleDateString('vi-VN', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });

    const totalLimit = BUDGET_ITEMS.reduce((sum, item) => sum + item.limit, 0);
    const totalSpent = BUDGET_ITEMS.reduce((sum, item) => sum + item.spent, 0);
    const totalRemaining = totalLimit - totalSpent;

    return (
        <div className="budget-shell">
            <Header onToggleSidebar={() => setSidebarOpen(v => !v)} onLogout={onLogout} />

            <div className="budget-body">
                <Sidebar open={sidebarOpen} />

                <main className={`budget-main ${sidebarOpen ? 'sidebar-expanded' : 'sidebar-collapsed'}`}>
                    <div className="page-title-row">
                        <div>
                            <h1 className="page-title font-headline">Ngân sách</h1>
                            <p className="page-subtitle">{formattedDate}</p>
                        </div>
                        <button className="btn-primary-emerald px-4 py-2 d-flex align-items-center gap-2 shadow-sm">
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
                            Thêm ngân sách
                        </button>
                    </div>

                    <div className="budget-summary">
                        <div className="budget-card">
                            <div className="budget-card-label">Tổng ngân sách</div>
                            <div className="budget-card-value">
                                {totalLimit.toLocaleString('vi-VN')} đ
                            </div>
                        </div>
                        <div className="budget-card warning">
                            <div className="budget-card-label">Đã chi</div>
                            <div className="budget-card-value">
                                {totalSpent.toLocaleString('vi-VN')} đ
                            </div>
                        </div>
                        <div className="budget-card success">
                            <div className="budget-card-label">Còn lại</div>
                            <div className="budget-card-value">
                                {totalRemaining.toLocaleString('vi-VN')} đ
                            </div>
                        </div>
                    </div>

                    <div className="budget-list">
                        {BUDGET_ITEMS.map(item => {
                            const percentage = Math.min((item.spent / item.limit) * 100, 100);
                            const status = getBudgetStatus((item.spent / item.limit) * 100);
                            return (
                                <div key={item.id} className="budget-item">
                                    <div className="budget-item-header">
                                        <div>
                                            <h3 className="budget-item-title">{item.name}</h3>
                                            <p className="budget-item-meta">
                                                Ngân sách: {item.limit.toLocaleString('vi-VN')} đ
                                            </p>
                                        </div>
                                        <span className={`budget-item-status ${status.tone}`}>
                                            {status.label}
                                        </span>
                                    </div>
                                    <div className="budget-progress">
                                        <div
                                            className="budget-progress-bar"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                    <div className="budget-item-footer">
                                        <span>Đã chi: {item.spent.toLocaleString('vi-VN')} đ</span>
                                        <span>Còn lại: {(item.limit - item.spent).toLocaleString('vi-VN')} đ</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default BudgetPage;
