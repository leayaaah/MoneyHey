import React from 'react';

const SpendingChart = ({ items = [] }) => (
    <div className="dash-card h-100">
        <div className="dash-card-header">
            <h6 className="dash-card-title">Chi tiêu theo danh mục</h6>
            <span className="badge-month">
                {new Date().toLocaleDateString('vi-VN', { month: 'long' })}
            </span>
        </div>
        <div className="d-flex flex-column gap-3 mt-3">
            {items.length === 0 ? (
                <div className="text-muted small">Chưa có chi tiêu trong tháng này.</div>
            ) : items.map((bar) => (
                <div key={bar.label}>
                    <div className="d-flex justify-content-between mb-1 small">
                        <span className="text-muted">{bar.label}</span>
                        <span className="fw-semibold">
                            {Number(bar.amount || 0).toLocaleString('vi-VN')} đ
                        </span>
                    </div>
                    <div className="progress" style={{ height: '8px', borderRadius: '99px', background: 'var(--surface-bg)' }}>
                        <div
                            className="progress-bar"
                            role="progressbar"
                            style={{ width: `${bar.pct}%`, background: 'var(--emerald-primary)', borderRadius: '99px' }}
                            aria-valuenow={bar.pct}
                            aria-valuemin="0"
                            aria-valuemax="100"
                        />
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export default SpendingChart;
