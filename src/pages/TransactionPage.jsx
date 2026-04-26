import React, { useState, useEffect, use } from 'react';
import Header from '../components/common/Header';
import Sidebar from '../components/dashboard/Sidebar';
import { useNavigate, useLocation } from 'react-router-dom';
import { fetchTransactions } from '../services/transactionService';
import { fetchCategories } from '../services/categoryService';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import TransactionList from '../components/transaction/TransactionList';
import AddTransactionModal from '../components/transaction/AddTransactionModal';

function TransactionPage({ onLogout }) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [activeNav, setActiveNav] = useState('transactions');
    const [transactions, setTransactions] = useState([]);
    const [categories, setCategories] = useState([]);


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

    console.log(transactions);
    console.log(categories);
    

    const formattedDate = new Date().toLocaleDateString('vi-VN', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
    const navigate = useNavigate();
    const location = useLocation();
    useEffect(() => {
        const path = location.pathname.split('/')[1] || 'dashboard';
        setActiveNav(path);
    }, [location]);


    return (
        <div className="dashboard-shell">
        
            <Header onToggleSidebar={() => setSidebarOpen(v => !v)} onLogout={onLogout} />

            <div className="dashboard-body">
                <Sidebar open={sidebarOpen}/>

                <main className={`dashboard-main ${sidebarOpen ? 'sidebar-expanded' : 'sidebar-collapsed'}`}>
                    <div className="page-title-row">
                        <div>
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
                        <AddTransactionModal />
                    </div>


                    {/* List giao dịch */}
                    <TransactionList transactions={transactions} />
                </main>
            </div>
        </div>
    );
}

export default TransactionPage;