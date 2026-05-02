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


    return (
        <div className="transaction-shell">
        
            <Header onToggleSidebar={() => setSidebarOpen(v => !v)} onLogout={onLogout} />

            <div className="report-body">
                <Sidebar open={sidebarOpen}/>

                <main className={`report-main ${sidebarOpen ? 'sidebar-expanded' : 'sidebar-collapsed'}`}>
                    <div className='report-content'>
                        <h1 className="report-title">Báo cáo chi tiêu</h1>
                        <ExpensePieChart data={getCategorySummary(transactions)} />
                    </div>
                    
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </main>
            </div>
        </div>
    );
}

export default ReportPage;