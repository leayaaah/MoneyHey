import React from 'react';
import { useNavigate } from 'react-router-dom';

const QUICK_ACTIONS = [
    { label: 'Thêm chi tiêu', icon: 'add_circle', color: '#e74c3c', path: '/transactions' },
    { label: 'Thêm thu nhập', icon: 'savings', color: 'var(--emerald-primary)', path: '/transactions' },
    { label: 'Xem báo cáo', icon: 'bar_chart', color: '#3498db', path: '/reports' },
    { label: 'Xem ví tiền', icon: 'account_balance_wallet', color: '#f39c12', path: '/transactions' },
];

const QuickActions = () => {
    const navigate = useNavigate();

    return (
        <div className="dash-card">
            <div className="dash-card-header">
                <h6 className="dash-card-title">Thao tác nhanh</h6>
            </div>
            <div className="d-flex gap-2 mt-3 d-flex justify-content-center flex-wrap">
                {QUICK_ACTIONS.map((action) => (
                    <button
                        key={action.label}
                        className="quick-action-btn"
                        style={{ '--qa-color': action.color }}
                        onClick={() => navigate(action.path)}
                    >
                        <span className="material-symbols-outlined">{action.icon}</span>
                        <span>{action.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default QuickActions;
