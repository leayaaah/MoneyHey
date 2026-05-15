import React, { startTransition, useEffect, useState } from 'react';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import { fetchTransactions } from '../../application/services/transactionService';
import { fetchCategories } from '../../application/services/categoryService';
import { fetchWallets } from '../../application/services/walletService';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import TransactionList from '../components/transaction/TransactionList';
import AddTransactionModal from '../components/transaction/AddTransactionModal';
import TransactionFilter from '../components/transaction/TransactionFilter';
import '../../css/TransactionPage.css';
import Pagination from '../components/common/Pagination';
import { useAuth } from '../hooks/useAuth';

function TransactionPage({ onLogout }) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [transactions, setTransactions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [wallets, setWallets] = useState([]);
    const [filters, setFilters] = useState({
        fromDate: '',
        toDate: '',
        category: 'all'
    });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const { user } = useAuth();
    const userId = user?.user_id;

    useEffect(() => {
        let active = true;

        if (!userId) {
            startTransition(() => {
                setTransactions([]);
            });
            return () => {
                active = false;
            };
        }

        fetchTransactions(userId)
            .then((data) => {
                if (!active) {
                    return;
                }

                startTransition(() => {
                    setTransactions(data);
                });
            })
            .catch((error) => {
                console.error('Failed to load transactions:', error);
            });

        return () => {
            active = false;
        };
    }, [userId]);

    useEffect(() => {
        let active = true;

        fetchCategories()
            .then((data) => {
                if (!active) {
                    return;
                }

                startTransition(() => {
                    setCategories(data);
                });
            })
            .catch((error) => {
                console.error('Failed to load categories:', error);
            });

        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        let active = true;

        if (!userId) {
            startTransition(() => {
                setWallets([]);
            });
            return () => {
                active = false;
            };
        }

        fetchWallets(userId)
            .then((data) => {
                if (!active) {
                    return;
                }

                startTransition(() => {
                    setWallets(data);
                });
            })
            .catch((error) => {
                console.error('Failed to load wallets:', error);
            });

        return () => {
            active = false;
        };
    }, [userId]);

    const loadTransactions = async () => {
        if (!userId) {
            setTransactions([]);
            return;
        }

        const data = await fetchTransactions(userId);
        startTransition(() => {
            setTransactions(data);
        });
    };

    const loadCategories = async () => {
        const data = await fetchCategories();
        startTransition(() => {
            setCategories(data);
        });
        return data;
    };

    const loadWallets = async () => {
        if (!userId) {
            setWallets([]);
            return;
        }

        const data = await fetchWallets(userId);
        startTransition(() => {
            setWallets(data);
        });
    };

    const handleFilterChange = (nextFilters) => {
        setCurrentPage(1);
        setFilters((prev) => (
            typeof nextFilters === 'function'
                ? nextFilters(prev)
                : nextFilters
        ));
    };

    const filteredTransactions = transactions.filter(tx => {
        const txDate = new Date(tx.tx_date);

        if (filters.fromDate && txDate < new Date(filters.fromDate)) return false;
        if (filters.toDate && txDate > new Date(filters.toDate)) return false;
        if (filters.category !== 'all' && tx.category_id !== Number(filters.category)) return false;
        return true;
    }).sort((left, right) => {
        const leftTime = new Date(left.tx_date).getTime();
        const rightTime = new Date(right.tx_date).getTime();

        return rightTime - leftTime;
    });
    

    // pageination
    const indexOfLast = currentPage * itemsPerPage;
    const indexOfFirst = indexOfLast - itemsPerPage;
    const currentTransactions = filteredTransactions.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

    
    

    const formattedDate = new Date().toLocaleDateString('vi-VN', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });


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
                            data-bs-target="#addModal"
                            data-bs-focus="false">
                                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
                                Thêm giao dịch
                        </button>
                        <AddTransactionModal
                            wallets={wallets}
                            categories={categories}
                            onTransactionsCreated={async () => {
                                await Promise.all([loadTransactions(), loadWallets()]);
                            }}
                            onCategoriesChanged={loadCategories}
                        />
                    </div>
                    <div className="transaction-content">
                        <TransactionFilter filters={filters} setFilters={handleFilterChange} categories={categories} />
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
