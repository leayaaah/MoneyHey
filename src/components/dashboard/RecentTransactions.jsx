// src/components/dashboard/RecentTransactions.jsx
// Presentation layer — recent transactions list
import React from 'react';
import { Transaction } from '../../models/Transaction';

const CATEGORY_ICONS = {
    'Ăn uống':   'restaurant',
    'Thu nhập':  'payments',
    'Hóa đơn':   'receipt_long',
    'Di chuyển': 'directions_car',
    'Giải trí':  'movie',
    'Nhà ở':     'home',
};

const TRANSACTIONS = [
    new Transaction({ id: 1, name: 'Siêu thị Vinmart',   category: 'Ăn uống',    date: '24/03/2026', amount: '-320.000 ₫',     type: 'expense' }),
    new Transaction({ id: 2, name: 'Lương tháng 3',       category: 'Thu nhập',   date: '20/03/2026', amount: '+15.000.000 ₫',  type: 'income'  }),
    new Transaction({ id: 3, name: 'Điện - EVN',          category: 'Hóa đơn',    date: '18/03/2026', amount: '-450.000 ₫',     type: 'expense' }),
    new Transaction({ id: 4, name: 'Grab (di chuyển)',    category: 'Di chuyển',  date: '17/03/2026', amount: '-85.000 ₫',      type: 'expense' }),
    new Transaction({ id: 5, name: 'Freelance design',    category: 'Thu nhập',   date: '15/03/2026', amount: '+2.000.000 ₫',   type: 'income'  }),
    new Transaction({ id: 6, name: 'Netflix',             category: 'Giải trí',   date: '12/03/2026', amount: '-199.000 ₫',     type: 'expense' }),
    new Transaction({ id: 7, name: 'Thuê nhà tháng 3',   category: 'Nhà ở',      date: '10/03/2026', amount: '-3.500.000 ₫',   type: 'expense' }),
];

const RecentTransactions = () => (
    <div className="dash-card">
        <div className="dash-card-header">
            <h6 className="dash-card-title">Giao dịch gần đây</h6>
            <button className="btn btn-link btn-sm p-0 text-decoration-none fw-semibold" style={{ color: 'var(--emerald-primary)', fontSize: '13px' }}>
                Xem tất cả
            </button>
        </div>
        <div className="mt-3">
            {TRANSACTIONS.map(tx => (
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
                    <div className={`tx-amount ${tx.type}`}>{tx.amount}</div>
                </div>
            ))}
        </div>
    </div>
);

export default RecentTransactions;
