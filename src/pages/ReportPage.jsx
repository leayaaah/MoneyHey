import React, { useState, useEffect, use } from 'react';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import { useNavigate, useLocation } from 'react-router-dom';
import { fetchTransactions } from '../services/transactionService';
import { fetchCategories } from '../services/categoryService';
import { fetchWallets } from '../services/walletService';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import TransactionList from '../components/transaction/TransactionList';
import AddTransactionModal from '../components/transaction/AddTransactionModal';
import TransactionFilter from '../components/transaction/TransactionFilter';
import '../css/ReportPage.css';
import Pagination from '../components/common/Pagination';
import ExpensePieChart from '../components/report/ExpensePieChart';

function ReportPage({ onLogout }) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [activeNav, setActiveNav] = useState('transactions');
    const [transactions, setTransactions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [wallets, setWallets] = useState([]);
    
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 2;
    useEffect(() => {
        setCurrentPage(1);
    }, [transactions]);

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

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const data = await fetchCategories();
                setCategories(data);
            } catch (error) {
                console.error('Failed to load categories:', error);
            }
        };
        loadCategories();
    }, []);

    useEffect(() => {
        const loadWallets = async () => {
            try {
                const data = await fetchWallets();
                setWallets(data);
            } catch (error) {
                console.error('Failed to load wallets:', error);
            }
        };
        loadWallets();
    }, []);


    // pageination
    const indexOfLast = currentPage * itemsPerPage;
    const indexOfFirst = indexOfLast - itemsPerPage;
    const currentTransactions = transactions.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(transactions.length / itemsPerPage);

    
    

    const formattedDate = new Date().toLocaleDateString('vi-VN', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
    const location = useLocation();


    // summary



    const getCategorySummary = (transactions, type) => {
        const map = {};

        transactions
            .filter(tx => tx.tx_type === type)
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
    const incomeData = getCategorySummary(transactions, 'income');  


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
                                        .filter(tx => tx.tx_type === 'income')
                                        .reduce((s, tx) => s + Number(tx.amount), 0)
                                        .toLocaleString('vi-VN')} đ
                                </div>
                            </div>

                            <div className="summary-card expense">
                                <div className="summary-label">Tổng chi</div>
                                <div className="summary-value text-danger">
                                    -{transactions
                                        .filter(tx => tx.tx_type === 'expense')
                                        .reduce((s, tx) => s + Number(tx.amount), 0)
                                        .toLocaleString('vi-VN')} đ
                                </div>
                            </div>

                            <div className="summary-card balance">
                                <div className="summary-label">Số dư</div>
                                <div className="summary-value">
                                    {(transactions.reduce((s, tx) =>
                                        tx.tx_type === 'income'
                                            ? s + Number(tx.amount)
                                            : s - Number(tx.amount), 0)
                                    ).toLocaleString('vi-VN')} đ
                                </div>
                            </div>

                        </div>

                        {/* ===== CHARTS ===== */}
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