import React, { useState, useEffect } from 'react';
import Header from './Header';
import '../css/Dashboard.css';
import {supabase} from "../services/supabase"

const SUMMARY_CARDS = [
    // {
    //     id: 'balance',
    //     label: 'Tổng số dư',
    //     value: '42.500.000 ₫',
    //     change: '+2.3%',
    //     positive: true,
    //     icon: 'account_balance_wallet',
    //     color: 'card-emerald',
    // },
    // {
    //     id: 'income',
    //     label: 'Thu nhập tháng này',
    //     value: '15.000.000 ₫',
    //     change: '+5.1%',
    //     positive: true,
    //     icon: 'trending_up',
    //     color: 'card-blue',
    // },
    // {
    //     id: 'expense',
    //     label: 'Chi tiêu tháng này',
    //     value: '8.350.000 ₫',
    //     change: '-1.2%',
    //     positive: false,
    //     icon: 'trending_down',
    //     color: 'card-red',
    // },
    // {
    //     id: 'savings',
    //     label: 'Tiết kiệm',
    //     value: '6.650.000 ₫',
    //     change: '+12.8%',
    //     positive: true,
    //     icon: 'savings',
    //     color: 'card-amber',
    // },
];

const TRANSACTIONS = [
    { id: 1, name: 'Siêu thị Vinmart',   category: 'Ăn uống',       date: '24/03/2026', amount: '-320.000 ₫', type: 'expense' },
    { id: 2, name: 'Lương tháng 3',       category: 'Thu nhập',      date: '20/03/2026', amount: '+15.000.000 ₫', type: 'income' },
    { id: 3, name: 'Điện - EVN',          category: 'Hóa đơn',       date: '18/03/2026', amount: '-450.000 ₫', type: 'expense' },
    { id: 4, name: 'Grab (di chuyển)',    category: 'Di chuyển',     date: '17/03/2026', amount: '-85.000 ₫',  type: 'expense' },
    { id: 5, name: 'Freelance design',    category: 'Thu nhập',      date: '15/03/2026', amount: '+2.000.000 ₫', type: 'income' },
    { id: 6, name: 'Netflix',             category: 'Giải trí',      date: '12/03/2026', amount: '-199.000 ₫', type: 'expense' },
    { id: 7, name: 'Thuê nhà tháng 3',   category: 'Nhà ở',         date: '10/03/2026', amount: '-3.500.000 ₫', type: 'expense' },
];

const CATEGORY_ICONS = {
    'Ăn uống':    'restaurant',
    'Thu nhập':   'payments',
    'Hóa đơn':    'receipt_long',
    'Di chuyển':  'directions_car',
    'Giải trí':   'movie',
    'Nhà ở':      'home',
};

const NAV_ITEMS = [
    { id: 'dashboard',    label: 'Tổng quan',    icon: 'dashboard' },
    { id: 'transactions', label: 'Giao dịch',    icon: 'swap_horiz' },
    { id: 'reports',      label: 'Báo cáo',      icon: 'bar_chart' },
    { id: 'budget',       label: 'Ngân sách',    icon: 'savings' },
    { id: 'settings',     label: 'Cài đặt',      icon: 'settings' },
];

/* ─── Sidebar ─────────────────────────────────────────────── */
const Sidebar = ({ open, activeNav, onNav }) => (
    <>
        {open && <div className="sidebar-backdrop d-md-none" />}
        <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
            <nav className="sidebar-nav pt-3">
                {NAV_ITEMS.map(item => (
                    <button
                        key={item.id}
                        className={`sidebar-nav-item ${activeNav === item.id ? 'active' : ''}`}
                        onClick={() => onNav(item.id)}
                    >
                        <span className="material-symbols-outlined">{item.icon}</span>
                        <span className="sidebar-label">{item.label}</span>
                    </button>
                ))}
            </nav>
        </aside>
    </>
);

/* ─── Summary card ────────────────────────────────────────── */
const SummaryCard = ({ label, value, change, positive, icon, color }) => (
    <div className={`summary-card ${color}`}>
        <div className="summary-card-icon">
            <span className="material-symbols-outlined">{icon}</span>
        </div>
        <div className="summary-card-body">
            <div className="summary-card-label">{label}</div>
            <div className="summary-card-value">{value}</div>
            <div className={`summary-card-change ${positive ? 'change-up' : 'change-down'}`}>
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                    {positive ? 'arrow_upward' : 'arrow_downward'}
                </span>
                {change} so với tháng trước
            </div>
        </div>
    </div>
);

/* ─── Spending bar chart (CSS-only) ──────────────────────── */
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

/* ─── Recent transactions ─────────────────────────────────── */
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

/* ─── Quick actions ───────────────────────────────────────── */
const QUICK_ACTIONS = [
    { label: 'Thêm chi tiêu', icon: 'add_circle',     color: '#e74c3c' },
    { label: 'Thêm thu nhập', icon: 'savings',         color: 'var(--emerald-primary)' },
    { label: 'Chuyển tiền',   icon: 'swap_horiz',      color: '#3498db' },
    { label: 'Lập ngân sách', icon: 'bar_chart',       color: '#f39c12' },
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

const Dashboard = ({ onLogout }) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [activeNav, setActiveNav] = useState('dashboard');
    const [totalBalance, setTotalBalance] = useState(0);

    const formattedDate = new Date().toLocaleDateString('vi-VN', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
    useEffect(() => {
      const fetchBalance = async() =>{
        try {
            const { data: wallets, error } = await supabase
                .from('wallets')
                .select('balance');
            if (error) {
                console.error("lỗi:", error.message);
                return;
            }
            const total = wallets.reduce((sum, wallet) => sum + (wallet.balance || 0), 0);
            setTotalBalance(total);
            } catch (err) {
            console.error("Lỗi mạng lưới:", err);
        }
      };
      fetchBalance();
      
    }, [])
    

    return (
        <div className="dashboard-shell">
            <Header onToggleSidebar={() => setSidebarOpen(v => !v)} onLogout={onLogout} />

            <div className="dashboard-body">
                <Sidebar open={sidebarOpen} activeNav={activeNav} onNav={setActiveNav} />

                <main className={`dashboard-main ${sidebarOpen ? 'sidebar-expanded' : 'sidebar-collapsed'}`}>
                    {/* Page title */}
                    <div className="page-title-row">
                        <div>
                            <h1 className="page-title font-headline">Tổng quan</h1>
                            <p className="page-subtitle">{formattedDate}</p>
                        </div>
                        <button className="btn-primary-emerald px-4 py-2 d-flex align-items-center gap-2 shadow-sm">
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
                            Thêm giao dịch
                        </button>
                    </div>

                    {/* Summary cards */}
                    <div className="summary-grid">
                        {SUMMARY_CARDS.map(card => (
                            <SummaryCard key={card.id} {...card} />
                        ))}
                    </div>

                    {/* Bottom row */}
                    <div className="row g-4 mt-0">
                        <div className="col-12 col-xl-4">
                            <QuickActions />
                        </div>
                        <div className="col-12 col-xl-8">
                            <SpendingChart />
                        </div>
                    </div>

                    {/* Recent transactions */}
                    <div className="mt-4">
                        <RecentTransactions />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Dashboard;
