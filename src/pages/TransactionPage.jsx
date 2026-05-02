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
import '../css/TransactionPage.css';
import Pagination from '../components/common/Pagination';

function TransactionPage({ onLogout }) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [activeNav, setActiveNav] = useState('transactions');
    const [transactions, setTransactions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [wallets, setWallets] = useState([]);
    const [filters, setFilters] = useState({
        fromDate: '',
        toDate: '',
        category: 'all'
    });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 2;
    useEffect(() => {
        setCurrentPage(1);
    }, [filters]);



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

    const filteredTransactions = transactions.filter(tx => {
        const txDate = new Date(tx.tx_date);

        if (filters.fromDate && txDate < new Date(filters.fromDate)) return false;
        if (filters.toDate && txDate > new Date(filters.toDate)) return false;
        if (filters.category !== 'all' && tx.category_id !== Number(filters.category)) return false;
        console.log(tx);
        return true;
    });
    

    // pageination
    const indexOfLast = currentPage * itemsPerPage;
    const indexOfFirst = indexOfLast - itemsPerPage;
    const currentTransactions = filteredTransactions.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

    
    

    const formattedDate = new Date().toLocaleDateString('vi-VN', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
    const location = useLocation();


    return (
        <div className="transaction-shell">
        
            <Header onToggleSidebar={() => setSidebarOpen(v => !v)} onLogout={onLogout} />

            <div className="transaction-body">
                <Sidebar open={sidebarOpen}/>

                <main className={`transaction-main ${sidebarOpen ? 'sidebar-expanded' : 'sidebar-collapsed'}`}>
                    <div className="page-title-row">
                        <div className='transaction-nav'>
                            <h1 className="page-title font-headline">Quản lý giao dịch</h1>
                            <p className="page-subtitle">{formattedDate}</p>
                            
                        </div>
                        <button className="btn-primary-emerald px-4 py-2 d-flex align-items-center gap-2 shadow-sm"
                            type="button"
                            data-bs-toggle="modal" 
                            data-bs-target="#addModal">
                                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
                                Thêm giao dịch
                        </button>
                        <AddTransactionModal wallets={wallets} categories={categories} />
                    </div>
                    <div className="transaction-content">
                        <TransactionFilter filters={filters} setFilters={setFilters} categories={categories} />
                        {/* List giao dịch */}
                        <TransactionList transactions={currentTransactions} />
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

export default TransactionPage;