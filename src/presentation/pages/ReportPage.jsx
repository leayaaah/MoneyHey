import React, { startTransition, useEffect, useState } from 'react';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { fetchTransactions } from '../../application/services/transactionService';
import { getTotalBalance } from '../../application/services/walletService';
import '../../css/ReportPage.css';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import ExpenseBarChart from '../components/report/ExpenseBarChart';
import ExpenseLineChart from '../components/report/ExpenseLineChart';
import ExpensePieChart from '../components/report/ExpensePieChart';
import { useAuth } from '../hooks/useAuth';
import { formatCompactVnd } from '../utils/formatCurrency';

const normalizeType = (type) => (type || '').toString().toLowerCase();

const getCategorySummary = (transactions, type) => {
    const map = {};

    transactions
        .filter((transaction) => normalizeType(transaction.tx_type) === type)
        .forEach((transaction) => {
            const key = transaction.categoryName || 'Khac';

            if (!map[key]) {
                map[key] = 0;
            }

            map[key] += Number(transaction.amount);
        });

    return Object.keys(map).map((key) => ({
        name: key,
        value: map[key],
    }));
};

function ReportPage({ onLogout }) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [transactions, setTransactions] = useState([]);
    const [walletBalance, setWalletBalance] = useState(0);
    const { user } = useAuth();

    useEffect(() => {
        let active = true;

        if (!user?.user_id) {
            startTransition(() => {
                setTransactions([]);
                setWalletBalance(0);
            });
            return () => {
                active = false;
            };
        }

        Promise.all([
            fetchTransactions(user.user_id),
            getTotalBalance(user.user_id),
        ])
            .then(([transactionData, totalWalletBalance]) => {
                if (!active) {
                    return;
                }

                startTransition(() => {
                    setTransactions(Array.isArray(transactionData) ? transactionData : []);
                    setWalletBalance(Number(totalWalletBalance || 0));
                });
            })
            .catch((error) => {
                console.error('Failed to load report data:', error);
            });

        return () => {
            active = false;
        };
    }, [user?.user_id]);

    const formattedDate = new Date().toLocaleDateString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    const totalIncome = transactions
        .filter((transaction) => normalizeType(transaction.tx_type) === 'income')
        .reduce((sum, transaction) => sum + Number(transaction.amount), 0);
    const totalExpense = transactions
        .filter((transaction) => normalizeType(transaction.tx_type) === 'expense')
        .reduce((sum, transaction) => sum + Number(transaction.amount), 0);
    const netCashFlow = transactions.reduce((sum, transaction) => (
        normalizeType(transaction.tx_type) === 'income'
            ? sum + Number(transaction.amount)
            : sum - Number(transaction.amount)
    ), 0);
    const expenseData = getCategorySummary(transactions, 'expense');

    const formattedIncome = formatCompactVnd(totalIncome);
    const formattedExpense = formatCompactVnd(totalExpense);
    const formattedWalletBalance = formatCompactVnd(Math.abs(walletBalance));
    const formattedNetCashFlow = formatCompactVnd(netCashFlow, { showSign: true });

    return (
        <div className="transaction-shell">
            <Header onToggleSidebar={() => setSidebarOpen((value) => !value)} onLogout={onLogout} />

            <div className="report-body">
                <Sidebar open={sidebarOpen} />

                <main className={`report-main ${sidebarOpen ? 'sidebar-expanded' : 'sidebar-collapsed'}`}>
                    <div className="report-content">
                        <div className="page-title-row">
                            <div>
                                <h1 className="page-title font-headline">Bao cao</h1>
                                <p className="page-subtitle">{formattedDate}</p>
                            </div>
                        </div>

                        <div className="summary-grid">
                            <div className="summary-card card-emerald">
                                <div className="summary-card-icon">
                                    <span className="material-symbols-outlined">trending_up</span>
                                </div>
                                <div className="summary-card-body">
                                    <div className="summary-card-label">Tong thu</div>
                                    <div className="summary-card-value text-success">+{formattedIncome}</div>
                                </div>
                            </div>

                            <div className="summary-card card-red">
                                <div className="summary-card-icon">
                                    <span className="material-symbols-outlined">trending_down</span>
                                </div>
                                <div className="summary-card-body">
                                    <div className="summary-card-label">Tong chi</div>
                                    <div className="summary-card-value text-danger">-{formattedExpense}</div>
                                </div>
                            </div>

                            <div className="summary-card card-blue">
                                <div className="summary-card-icon">
                                    <span className="material-symbols-outlined">account_balance_wallet</span>
                                </div>
                                <div className="summary-card-body">
                                    <div className="summary-card-label">So du vi</div>
                                    <div className="summary-card-value">
                                        {walletBalance < 0 ? '-' : ''}
                                        {formattedWalletBalance}
                                    </div>
                                    <div className="summary-card-label">Dong tien rong: {formattedNetCashFlow}</div>
                                </div>
                            </div>
                        </div>

                        <div className="row g-4 mt-2">
                            <div className="col-12">
                                <div className="report-card report-card--chart">
                                    <h5 className="report-card-title">Ty trong chi tieu theo danh muc</h5>
                                    <ExpensePieChart data={expenseData} />
                                </div>
                            </div>

                            <div className="col-12 col-xl-6">
                                <div className="report-card report-card--chart">
                                    <h5 className="report-card-title">Chi tieu tuyet doi theo danh muc</h5>
                                    <ExpenseBarChart data={expenseData} />
                                </div>
                            </div>

                            <div className="col-12 col-xl-6">
                                <div className="report-card report-card--chart">
                                    <h5 className="report-card-title">Xu huong chi tieu 6 thang gan nhat</h5>
                                    <ExpenseLineChart />
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default ReportPage;
