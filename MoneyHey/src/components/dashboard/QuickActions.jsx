import React from 'react';

const QUICK_ACTIONS = [
    { label: 'Thêm chi tiêu', icon: 'add_circle',  color: '#e74c3c' },
    { label: 'Thêm thu nhập', icon: 'savings',      color: 'var(--emerald-primary)' },
    { label: 'Chuyển tiền',   icon: 'swap_horiz',   color: '#3498db' },
    { label: 'Lập ngân sách', icon: 'bar_chart',    color: '#f39c12' },
];

const QuickActions = () => (
    <div className="dash-card">
        <div className="dash-card-header">
            <h6 className="dash-card-title">Thao tác nhanh</h6>
        </div>
        <div className="d-flex gap-2 mt-3 d-flex justify-content-center flex-wrap">
            {QUICK_ACTIONS.map(action => (
                <button key={action.label} className="quick-action-btn" style={{ '--qa-color': action.color }}>
                    <span className="material-symbols-outlined">{action.icon}</span>
                    <span>{action.label}</span>
                </button>
            ))}
        </div>
    </div>
);

export default QuickActions;
