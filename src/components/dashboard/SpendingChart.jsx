// src/components/dashboard/SpendingChart.jsx
// Presentation layer — CSS-only spending bar chart
import React from 'react';

const SPENDING_BARS = [
    { label: 'Ăn uống',   pct: 38, value: '3.180.000 ₫' },
    { label: 'Nhà ở',     pct: 42, value: '3.500.000 ₫' },
    { label: 'Di chuyển', pct: 10, value: '850.000 ₫' },
    { label: 'Giải trí',  pct: 2,  value: '199.000 ₫' },
    { label: 'Hóa đơn',   pct: 8,  value: '621.000 ₫' },
];

const SpendingChart = () => (
    <div className="dash-card h-100">
        <div className="dash-card-header">
            <h6 className="dash-card-title">Chi tiêu theo danh mục</h6>
            <span className="badge-month">Tháng 3</span>
        </div>
        <div className="d-flex flex-column gap-3 mt-3">
            {SPENDING_BARS.map(bar => (
                <div key={bar.label}>
                    <div className="d-flex justify-content-between mb-1 small">
                        <span className="text-muted">{bar.label}</span>
                        <span className="fw-semibold">{bar.value}</span>
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
