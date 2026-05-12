import React, { useState, useEffect } from 'react';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import { fetchTransactions } from '../../application/services/transactionService';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '../../css/ReportPage.css';
import ExpensePieChart from '../components/report/ExpensePieChart';
import ExpenseBarChart from '../components/report/ExpenseBarChart';
import ExpenseLineChart from '../components/report/ExpenseLineChart';

const normalizeType = (type) => (type || '').toString().toLowerCase();

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
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });

    const getCategorySummary = (transactions, type) => {
        const map = {};

        transactions
            .filter(tx => normalizeType(tx.tx_type) === type)
            .forEach(tx => {
                const key = tx.categoryName || "Khác";

                if (!map[key]) {
                    map[key] = 0;
                }

                map[key] += Number(tx.amount);
            });

        return Object.keys(map).map(k => ({
            name: k,
            value: map[k]
        }));
    };

    const expenseData = getCategorySummary(transactions, 'expense');


    return (
        <div className="transaction-shell">
        
            <Header onToggleSidebar={() => setSidebarOpen(v => !v)} onLogout={onLogout} />

            <div className="report-body">
                <Sidebar open={sidebarOpen}/>

                <main className={`report-main ${sidebarOpen ? 'sidebar-expanded' : 'sidebar-collapsed'}`}>

                    <div className="report-content">

                        {/* TITLE */}
                        <div className="page-title-row">
                            <div>
                                <h1 className="page-title font-headline">Báo cáo</h1>
                                <p className="page-subtitle">{formattedDate}</p>
                            </div>
                        </div>

                        {/* ===== SUMMARY CARDS ===== */}
                        <div className="summary-grid">

                            <div className="summary-card income">
                                <div className="summary-label">Tổng thu</div>
                                <div className="summary-value text-success">
                                    +{transactions
                                        .filter(tx => normalizeType(tx.tx_type) === 'income')
                                        .reduce((s, tx) => s + Number(tx.amount), 0)
                                        .toLocaleString('vi-VN')} đ
                                </div>
                            </div>

                            <div className="summary-card expense">
                                <div className="summary-label">Tổng chi</div>
                                <div className="summary-value text-danger">
                                    -{transactions
                                        .filter(tx => normalizeType(tx.tx_type) === 'expense')
                                        .reduce((s, tx) => s + Number(tx.amount), 0)
                                        .toLocaleString('vi-VN')} đ
                                </div>
                            </div>

                            <div className="summary-card balance">
                                <div className="summary-label">Số dư</div>
                                <div className="summary-value">
                                    {(transactions.reduce((s, tx) =>
                                        normalizeType(tx.tx_type) === 'income'
                                            ? s + Number(tx.amount)
                                            : s - Number(tx.amount), 0)
                                    ).toLocaleString('vi-VN')} đ
                                </div>
                            </div>

                        </div>

                        {/* ===== CHARTS ===== */}
                        <div className="row g-4 mt-2">

                            <div className="col-12">
                                <div className="report-card">
                                    <h5 className="report-card-title">Tỷ trọng chi tiêu theo danh mục</h5>
                                    <ExpensePieChart data={expenseData} />
                                </div>
                            </div>

                            <div className="col-12 col-xl-6">
                                <div className="report-card">
                                    <h5 className="report-card-title">Chi tiêu tuyệt đối theo danh mục</h5>
                                    <ExpenseBarChart data={expenseData} />
                                </div>
                            </div>

                            <div className="col-12 col-xl-6">
                                <div className="report-card">
                                    <h5 className="report-card-title">Xu hướng chi tiêu 6 tháng gần nhất</h5>
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
