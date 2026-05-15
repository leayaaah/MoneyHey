import React, { useState, useEffect } from 'react';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import { fetchTransactions } from '../services/transactionService';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '../css/ReportPage.css';
import ExpensePieChart from '../components/report/ExpensePieChart';
import {
    getCategorySummary,
    getExpenseTotal,
    getIncomeTotal,
    getNetBalance,
} from '../domain/report';

function ReportPage({ onLogout }) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [transactions, setTransactions] = useState([]);

    useEffect(() => {
        const loadTransactions = async () => {
            try {
                const data = await fetchTransactions();
                setTransactions(data);
            } catch (error) {
                console.error('Failed to load transactions:', error);
            }
        };
        loadTransactions();
    }, []);

    const formattedDate = new Date().toLocaleDateString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    const expenseData = getCategorySummary(transactions, 'expense');
    const incomeData = getCategorySummary(transactions, 'income');
    const incomeTotal = getIncomeTotal(transactions);
    const expenseTotal = getExpenseTotal(transactions);
    const netBalance = getNetBalance(transactions);

    return (
        <div className="transaction-shell">
            <Header onToggleSidebar={() => setSidebarOpen(v => !v)} onLogout={onLogout} />

            <div className="report-body">
                <Sidebar open={sidebarOpen} />

                <main className={`report-main ${sidebarOpen ? 'sidebar-expanded' : 'sidebar-collapsed'}`}>
                    <div className="report-content">
                        <div className="page-title-row">
                            <div>
                                <h1 className="page-title font-headline">Báo cáo</h1>
                                <p className="page-subtitle">{formattedDate}</p>
                            </div>
                        </div>

                        <div className="summary-grid">
                            <div className="summary-card income">
                                <div className="summary-label">Tổng thu</div>
                                <div className="summary-value text-success">
                                    +{incomeTotal.toLocaleString('vi-VN')} đ
                                </div>
                            </div>

                            <div className="summary-card expense">
                                <div className="summary-label">Tổng chi</div>
                                <div className="summary-value text-danger">
                                    -{expenseTotal.toLocaleString('vi-VN')} đ
                                </div>
                            </div>

                            <div className="summary-card balance">
                                <div className="summary-label">Số dư</div>
                                <div className="summary-value">
                                    {netBalance.toLocaleString('vi-VN')} đ
                                </div>
                            </div>
                        </div>

                        <div className="row g-4 mt-2">
                            <div className="col-12 col-xl-6">
                                <div className="report-card">
                                    <h5 className="report-card-title">Chi tiêu theo danh mục</h5>
                                    <ExpensePieChart data={expenseData} />
                                </div>
                            </div>

                            <div className="col-12 col-xl-6">
                                <div className="report-card">
                                    <h5 className="report-card-title">Thu nhập theo danh mục</h5>
                                    <ExpensePieChart data={incomeData} />
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
