import React from 'react';
import { formatCompactVnd } from '../../utils/formatCurrency';

const SpendingChart = ({ data = [], loading = false }) => (
    <div className="dash-card h-100">
        <div className="dash-card-header">
            <h6 className="dash-card-title">Chi tiêu theo danh mục</h6>
            <span className="badge-month">
                {new Date().toLocaleDateString('vi-VN', { month: 'long' })}
            </span>
        </div>
        <div className="d-flex flex-column gap-3 mt-3">
            {loading && <div className="text-muted small">Đang tải dữ liệu chi tiêu...</div>}
            {!loading && data.length === 0 && (
                <div className="text-muted small">Chưa có dữ liệu chi tiêu trong tháng này.</div>
            )}
            {!loading && data.map(bar => (
                <div key={bar.label}>
                    <div className="d-flex justify-content-between mb-1 small">
                        <span className="text-muted">{bar.label}</span>
                        <span className="fw-semibold">{formatCompactVnd(bar.value)}</span>
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
