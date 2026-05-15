import React from 'react';
import { useNavigate } from 'react-router-dom';

const CATEGORY_ICONS = {
    'Ăn uống': 'restaurant',
    'Thu nhập': 'payments',
    'Hóa đơn': 'receipt_long',
    'Di chuyển': 'directions_car',
    'Giải trí': 'movie',
    'Nhà ở': 'home',
};

const formatCurrency = (amount, type) =>
    `${type === 'expense' ? '-' : '+'}${Number(amount || 0).toLocaleString('vi-VN')} đ`;

const RecentTransactions = ({ transactions = [] }) => {
    const navigate = useNavigate();

    return (
        <div className="dash-card">
            <div className="dash-card-header">
                <h6 className="dash-card-title">Giao dịch gần đây</h6>
                <button
                    className="btn btn-link btn-sm p-0 text-decoration-none fw-semibold"
                    style={{ color: 'var(--emerald-primary)', fontSize: '13px' }}
                    onClick={() => navigate('/transactions')}
                >
                    Xem tất cả
                </button>
            </div>
            <div className="mt-3">
                {transactions.length === 0 ? (
                    <div className="text-muted small">Chưa có giao dịch nào.</div>
                ) : transactions.map((tx) => (
                    <div key={tx.trans_id} className="tx-row">
                        <div className="tx-icon">
                            <span className="material-symbols-outlined">
                                {CATEGORY_ICONS[tx.categoryName] || 'paid'}
                            </span>
                        </div>
                        <div className="tx-info">
                            <div className="tx-name">{tx.note || tx.categoryName || 'Giao dịch'}</div>
                            <div className="tx-meta">
                                {tx.categoryName} · {new Date(tx.tx_date).toLocaleDateString('vi-VN')}
                            </div>
                        </div>
                        <div className={`tx-amount ${tx.tx_type}`}>{formatCurrency(tx.amount, tx.tx_type)}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RecentTransactions;
