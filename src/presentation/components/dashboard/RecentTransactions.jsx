import React from 'react';
import { formatCompactVnd } from '../../utils/formatCurrency';

const CATEGORY_ICONS = {
    'Ăn uống':   'restaurant',
    'Thu nhập':  'payments',
    'Hóa đơn':   'receipt_long',
    'Di chuyển': 'directions_car',
    'Giải trí':  'movie',
    'Nhà ở':     'home',
};

const RecentTransactions = ({ transactions = [], loading = false }) => (
    <div className="dash-card">
        <div className="dash-card-header">
            <h6 className="dash-card-title">Giao dịch gần đây</h6>
            <button className="btn btn-link btn-sm p-0 text-decoration-none fw-semibold" style={{ color: 'var(--emerald-primary)', fontSize: '13px' }}>
                Xem tất cả
            </button>
        </div>
        <div className="mt-3">
            {loading && <div className="text-muted small">Đang tải giao dịch...</div>}
            {!loading && transactions.length === 0 && (
                <div className="text-muted small">Chưa có giao dịch nào để hiển thị.</div>
            )}
            {!loading && transactions.map(tx => (
                <div key={tx.id} className="tx-row">
                    <div className="tx-icon">
                        <span className="material-symbols-outlined">
                            {CATEGORY_ICONS[tx.category] || 'paid'}
                        </span>
                    </div>
                    <div className="tx-info">
                        <div className="tx-name">{tx.name}</div>
                        <div className="tx-meta">{tx.category} · {tx.date}</div>
                    </div>
                    <div className={`tx-amount ${tx.type}`}>
                        {tx.type === 'expense' ? '-' : '+'}
                        {formatCompactVnd(tx.amount)}
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export default RecentTransactions;
