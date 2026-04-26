import React, { useState, useEffect } from 'react';
import Header from '../components/common/Header';
import Sidebar from '../components/dashboard/Sidebar';
import { useNavigate, useLocation } from 'react-router-dom';
import { fetchTransactions } from '../services/transactionService';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

function TransactionPage({ onLogout }) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [activeNav, setActiveNav] = useState('transactions');
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

    console.log(transactions);


    const formattedDate = new Date().toLocaleDateString('vi-VN', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
    const navigate = useNavigate();
    const location = useLocation();
    const routes = {
        dashboard: '/dashboard',
        transactions: '/transactions',
        reports: '/reports',
        budget: '/budget',
        settings: '/settings',
    };  
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

                        <div
                            className="modal fade"
                            id="addModal"
                            tabIndex="-1"
                            role="dialog"
                            aria-labelledby="modalTitleId"
                            aria-hidden="true"
                        >
                            <div className="modal-dialog" role="document">
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <h5 className="modal-title" id="modalTitleId">
                                            Thêm giao dịch mới
                                        </h5>
                                        <button
                                            type="button"
                                            className="btn-close"
                                            data-bs-dismiss="modal"
                                            aria-label="Close"
                                        ></button>
                                    </div>
                                    <div className="modal-body">
                                        <div className="container">
                                            <form>
                                                <div className="mb-3 row">
                                                    <label
                                                        for="inputName"
                                                        className="col-3 col-form-label"
                                                        >Name</label
                                                    >
                                                    <div
                                                        className="col-9"
                                                    >
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            name="inputName"
                                                            id="inputName"
                                                            placeholder="Name"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="mb-3 row">
                                                    
                                                </div>
                                            </form>
                                        </div>
                                        
                                    </div>
                                    <div className="modal-footer">
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            data-bs-dismiss="modal"
                                        >
                                            Close
                                        </button>
                                        <button type="button" className="btn btn-primary">Save</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                    </div>
                    {/* Transaction list */}
                    <div className="transaction-list">
                        {transactions.map(tx => (
                            <div key={tx.trans_id} className="transaction-item d-flex align-items-center justify-content-between p-3 mb-2 rounded shadow-sm">
                                <div className="d-flex align-items-center gap-3">   
                                    <div>
                                        <div className="transaction-note font-headline">{tx.note}</div>
                                        <div className="transaction-date text-muted" style={{ fontSize: '14px' }}>{new Date(tx.tx_date).toLocaleDateString()}</div>
                                    </div>
                                </div>
                                <div className={`transaction-amount ${tx.tx_type === 'expense' ? 'expense' : 'income'}`}>
                                    {tx.tx_type === 'expense' ? '-' : '+'}{tx.amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                                </div>
                            </div>
                        ))}
                    </div>
                </main>
            </div>
        </div>
    );
}

export default TransactionPage;