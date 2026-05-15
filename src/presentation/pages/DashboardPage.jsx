import React, { useState, useEffect } from 'react';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import SummaryCard from '../components/dashboard/SummaryCard';
import SpendingChart from '../components/dashboard/SpendingChart';
import RecentTransactions from '../components/dashboard/RecentTransactions';
import QuickActions from '../components/dashboard/QuickActions';
import '../../css/Dashboard.css';
import { getTotalBalance } from '../../application/services/walletService';
import { fetchTransactions } from '../../application/services/transactionService';
import { useAuth } from '../hooks/useAuth';
import { formatCompactVnd } from '../utils/formatCurrency';

const normalizeType = (type) => (type || '').toString().toLowerCase();
const getMonthStart = (date) => new Date(date.getFullYear(), date.getMonth(), 1);
const toNumber = (value) => Number(value || 0);
const toPercentChange = (current, previous) => {
    if (previous === 0) {
        return current === 0 ? 0 : null;
    }
    return Math.round(((current - previous) / Math.abs(previous)) * 100);
};
const toPercentText = (percentChange) => {
    if (percentChange === null) {
        return '∞';
    }
    return `${Math.abs(percentChange)}%`;
};

const DashboardPage = ({ onLogout }) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [summaryCards, setSummaryCards] = useState([]);
    const [spendingData, setSpendingData] = useState([]);
    const [recentTransactions, setRecentTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    const formattedDate = new Date().toLocaleDateString('vi-VN', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });

    useEffect(() => {
        const loadDashboardData = async () => {
            if (!user?.user_id) {
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const now = new Date();
                const currentMonthStart = getMonthStart(now);
                const previousMonthStart = new Date(currentMonthStart.getFullYear(), currentMonthStart.getMonth() - 1, 1);

                const [total, transactions] = await Promise.all([
                    getTotalBalance(user.user_id),
                    fetchTransactions({ userId: user.user_id })
                ]);

                const txList = Array.isArray(transactions) ? transactions : [];

                const currentMonthTxs = txList.filter(tx => {
                    const txDate = new Date(tx.tx_date);
                    return txDate >= currentMonthStart;
                });
                const previousMonthTxs = txList.filter(tx => {
                    const txDate = new Date(tx.tx_date);
                    return txDate >= previousMonthStart && txDate < currentMonthStart;
                });

                const calcByType = (list, txType) => list
                    .filter(tx => normalizeType(tx.tx_type) === txType)
                    .reduce((sum, tx) => sum + toNumber(tx.amount), 0);

                const currentIncome = calcByType(currentMonthTxs, 'income');
                const currentExpense = calcByType(currentMonthTxs, 'expense');
                const previousIncome = calcByType(previousMonthTxs, 'income');
                const previousExpense = calcByType(previousMonthTxs, 'expense');
                const currentNet = currentIncome - currentExpense;
                const previousNet = previousIncome - previousExpense;
                const estimatedPreviousBalance = total - currentNet;

                const incomeChange = toPercentChange(currentIncome, previousIncome);
                const expenseChange = toPercentChange(currentExpense, previousExpense);
                const netChange = toPercentChange(currentNet, previousNet);
                const balanceChange = toPercentChange(total, estimatedPreviousBalance);

                setSummaryCards([
                    {
                        id: 'income',
                        label: 'Thu tháng này',
                        value: formatCompactVnd(currentIncome, { showSign: true }),
                        change: toPercentText(incomeChange),
                        positive: currentIncome >= previousIncome,
                        icon: 'trending_up',
                        color: 'card-emerald',
                    },
                    {
                        id: 'expense',
                        label: 'Chi tháng này',
                        value: `-${formatCompactVnd(currentExpense)}`,
                        change: toPercentText(expenseChange),
                        positive: currentExpense <= previousExpense,
                        icon: 'trending_down',
                        color: 'card-red',
                    },
                    {
                        id: 'net',
                        label: 'Dòng tiền ròng',
                        value: formatCompactVnd(currentNet, { showSign: true }),
                        change: toPercentText(netChange),
                        positive: currentNet >= previousNet,
                        icon: 'query_stats',
                        color: 'card-blue',
                    },
                    {
                        id: 'balance',
                        label: 'Tổng số dư',
                        value: formatCompactVnd(total),
                        change: toPercentText(balanceChange),
                        positive: total >= 0,
                        icon: 'account_balance_wallet',
                        color: 'card-amber',
                    },
                ]);

                const categorySpendMap = currentMonthTxs
                    .filter(tx => normalizeType(tx.tx_type) === 'expense')
                    .reduce((acc, tx) => {
                        const key = tx.categoryName || 'Khác';
                        acc[key] = (acc[key] || 0) + toNumber(tx.amount);
                        return acc;
                    }, {});

                const totalExpenseInMonth = Object.values(categorySpendMap)
                    .reduce((sum, value) => sum + value, 0);

                const chartData = Object.entries(categorySpendMap)
                    .map(([label, value]) => ({
                        label,
                        value,
                        pct: totalExpenseInMonth > 0 ? Math.round((value / totalExpenseInMonth) * 100) : 0
                    }))
                    .sort((a, b) => b.value - a.value);

                setSpendingData(chartData);

                const recent = [...txList]
                    .sort((left, right) => new Date(right.tx_date) - new Date(left.tx_date))
                    .slice(0, 7)
                    .map((tx) => ({
                        id: tx.trans_id,
                        name: tx.note || tx.categoryName || 'Giao dịch',
                        category: tx.categoryName || 'Khác',
                        date: new Date(tx.tx_date).toLocaleDateString('vi-VN'),
                        amount: toNumber(tx.amount),
                        type: normalizeType(tx.tx_type) === 'income' ? 'income' : 'expense',
                    }));

                setRecentTransactions(recent);
            } catch (err) {
                console.error("Lỗi mạng lưới:", err);
                setSummaryCards([]);
                setSpendingData([]);
                setRecentTransactions([]);
            } finally {
                setLoading(false);
            }
        };

        loadDashboardData();
    }, [user?.user_id]);
    

    return (
        <div className="dashboard-shell">
        
            <Header onToggleSidebar={() => setSidebarOpen(v => !v)} onLogout={onLogout} />

            <div className="dashboard-body">
                <Sidebar open={sidebarOpen}/>

                <main className={`dashboard-main ${sidebarOpen ? 'sidebar-expanded' : 'sidebar-collapsed'}`}>
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
                        {summaryCards.map(card => (
                            <SummaryCard key={card.id} {...card} />
                        ))}
                    </div>

                    {/* Bottom row */}
                    <div className="row g-4 mt-0">
                        <div className="col-12 col-xl-4">
                            <QuickActions />
                        </div>
                        <div className="col-12 col-xl-8">
                            <SpendingChart data={spendingData} loading={loading} />
                        </div>
                    </div>

                    {/* Recent transactions */}
                    <div className="mt-4">
                        <RecentTransactions transactions={recentTransactions} loading={loading} />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardPage;
