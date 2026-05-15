import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboardData } from '../../application/services/dashboardService';
import '../../css/Dashboard.css';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import QuickActions from '../components/dashboard/QuickActions';
import RecentTransactions from '../components/dashboard/RecentTransactions';
import SpendingChart from '../components/dashboard/SpendingChart';
import SummaryCard from '../components/dashboard/SummaryCard';
import { useAuth } from '../hooks/useAuth';

const formatMoney = (amount) =>
    Number(amount || 0).toLocaleString('vi-VN', {
        style: 'currency',
        currency: 'VND',
    });

const DashboardPage = ({ onLogout }) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { user } = useAuth();

    const formattedDate = new Date().toLocaleDateString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    useEffect(() => {
        const loadDashboard = async () => {
            if (!user?.user_id) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError('');
                const data = await getDashboardData(user.user_id);
                setDashboardData(data);
            } catch (err) {
                console.error('Failed to load dashboard:', err);
                setError('Không thể tải dữ liệu dashboard.');
            } finally {
                setLoading(false);
            }
        };

        loadDashboard();
    }, [user?.user_id]);

    const summaryCards = dashboardData ? [
        {
            id: 'balance',
            label: 'Tổng số dư',
            value: formatMoney(dashboardData.totalBalance),
            icon: 'account_balance_wallet',
            color: 'card-emerald',
            subtitle: `${dashboardData.walletCount} ví đang hoạt động`,
        },
        {
            id: 'income',
            label: 'Thu nhập tháng này',
            value: formatMoney(dashboardData.currentMonthIncome),
            icon: 'trending_up',
            color: 'card-blue',
            trend: `${Math.abs(dashboardData.incomeTrend)}% so với tháng trước`,
            positive: dashboardData.incomeTrend >= 0,
        },
        {
            id: 'expense',
            label: 'Chi tiêu tháng này',
            value: formatMoney(dashboardData.currentMonthExpense),
            icon: 'payments',
            color: 'card-red',
            trend: `${Math.abs(dashboardData.expenseTrend)}% so với tháng trước`,
            positive: dashboardData.expenseTrend <= 0,
        },
        {
            id: 'budget',
            label: 'Ngân sách hoạt động',
            value: `${dashboardData.activeBudgetCount}`,
            icon: 'pie_chart',
            color: 'card-amber',
            subtitle: dashboardData.totalBudgetAmount > 0
                ? `${dashboardData.budgetUsagePercent}% ngân sách tháng đã dùng`
                : 'Chưa thiết lập ngân sách trong tháng',
        },
    ] : [];

    return (
        <div className="dashboard-shell">
            <Header onToggleSidebar={() => setSidebarOpen((v) => !v)} onLogout={onLogout} />

            <div className="dashboard-body">
                <Sidebar open={sidebarOpen} />

                <main className={`dashboard-main ${sidebarOpen ? 'sidebar-expanded' : 'sidebar-collapsed'}`}>
                    <div className="page-title-row">
                        <div>
                            <h1 className="page-title font-headline">Tổng quan</h1>
                            <p className="page-subtitle">{formattedDate}</p>
                        </div>
                        <button
                            className="btn-primary-emerald px-4 py-2 d-flex align-items-center gap-2 shadow-sm"
                            onClick={() => navigate('/transactions')}
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
                            Thêm giao dịch
                        </button>
                    </div>

                    {error ? <div className="alert alert-danger">{error}</div> : null}

                    {loading ? (
                        <div className="text-muted">Đang tải dữ liệu dashboard...</div>
                    ) : (
                        <>
                            <div className="summary-grid">
                                {summaryCards.map((card) => (
                                    <SummaryCard key={card.id} {...card} />
                                ))}
                            </div>

                            <div className="row g-4 mt-0">
                                <div className="col-12 col-xl-4">
                                    <QuickActions />
                                </div>
                                <div className="col-12 col-xl-8">
                                    <SpendingChart items={dashboardData?.categorySpending} />
                                </div>
                            </div>

                            <div className="mt-4">
                                <RecentTransactions transactions={dashboardData?.recentTransactions} />
                            </div>
                        </>
                    )}
                </main>
            </div>
        </div>
    );
};

export default DashboardPage;
