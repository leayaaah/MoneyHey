import React, { startTransition, useEffect, useMemo, useState } from 'react';
import { Modal } from 'bootstrap';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import {
    fetchTransactions,
    removeTransaction
} from '../../application/services/transactionService';
import { fetchCategories } from '../../application/services/categoryService';
import { fetchWallets } from '../../application/services/walletService';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import TransactionList from '../components/transaction/TransactionList';
import AddTransactionModal from '../components/transaction/AddTransactionModal';
import TransactionFilter from '../components/transaction/TransactionFilter';
import '../../css/TransactionPage.css';
import Pagination from '../components/common/Pagination';
import { useAuth } from '../hooks/useAuth';

const defaultFilters = {
    fromDate: '',
    toDate: '',
    category: 'all',
    wallet: 'all',
    txType: 'all',
    keyword: ''
};

const normalizeDateOnly = (value) => String(value || '').split('T')[0];

function TransactionPage({ onLogout }) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [transactions, setTransactions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [wallets, setWallets] = useState([]);
    const [filters, setFilters] = useState(defaultFilters);
    const [currentPage, setCurrentPage] = useState(1);
    const [editingTransaction, setEditingTransaction] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
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

    const handleEditTransaction = (transaction) => {
        setEditingTransaction(transaction);
        const modalElement = document.getElementById('editTransactionModal');

        if (modalElement) {
            Modal.getOrCreateInstance(modalElement).show();
        }
    };

    const handleDeleteTransaction = async (transaction) => {
        const shouldDelete = window.confirm(`Xóa giao dịch "${transaction.note}"?`);

        if (!shouldDelete) {
            return;
        }

        try {
            setDeletingId(transaction.trans_id);
            await removeTransaction(transaction.trans_id);
            await Promise.all([loadTransactions(), loadWallets()]);
            alert('Đã xóa giao dịch.');
        } catch (error) {
            console.error('Failed to delete transaction:', error);
            alert(error?.message || 'Không thể xóa giao dịch.');
        } finally {
            setDeletingId(null);
        }
    };

    const filteredTransactions = useMemo(() => {
        const keyword = filters.keyword.trim().toLowerCase();

        return transactions
            .filter((tx) => {
                const txDate = normalizeDateOnly(tx.tx_date);
                const note = String(tx.note || '').toLowerCase();
                const categoryName = String(tx.categoryName || '').toLowerCase();
                const walletName = String(tx.walletName || '').toLowerCase();

                if (filters.fromDate && txDate < filters.fromDate) {
                    return false;
                }

                if (filters.toDate && txDate > filters.toDate) {
                    return false;
                }

                if (filters.category !== 'all' && String(tx.category_id) !== String(filters.category)) {
                    return false;
                }

                if (filters.wallet !== 'all' && String(tx.wallet_id) !== String(filters.wallet)) {
                    return false;
                }

                if (filters.txType !== 'all' && tx.tx_type !== filters.txType) {
                    return false;
                }

                if (keyword && !note.includes(keyword) && !categoryName.includes(keyword) && !walletName.includes(keyword)) {
                    return false;
                }

                return true;
            })
            .sort((left, right) => {
                const leftTime = new Date(left.tx_date).getTime();
                const rightTime = new Date(right.tx_date).getTime();

                return rightTime - leftTime;
            });
    }, [filters, transactions]);

    const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / itemsPerPage));

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    const indexOfLast = currentPage * itemsPerPage;
    const indexOfFirst = indexOfLast - itemsPerPage;
    const currentTransactions = filteredTransactions.slice(indexOfFirst, indexOfLast);

    const formattedDate = new Date().toLocaleDateString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <div className="transaction-shell">
            <Header onToggleSidebar={() => setSidebarOpen((value) => !value)} onLogout={onLogout} />

            <div className="transaction-body">
                <Sidebar open={sidebarOpen} />

                <main className={`transaction-main ${sidebarOpen ? 'sidebar-expanded' : 'sidebar-collapsed'}`}>
                    <div className="page-title-row">
                        <div className="transaction-nav">
                            <h1 className="page-title font-headline">Quản lý giao dịch</h1>
                            <p className="page-subtitle">{formattedDate}</p>
                        </div>
                        <button
                            className="btn-primary-emerald px-4 py-2 d-flex align-items-center gap-2 shadow-sm"
                            type="button"
                            data-bs-toggle="modal"
                            data-bs-target="#addModal"
                            data-bs-focus="false"
                        >
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
                        <AddTransactionModal
                            modalId="editTransactionModal"
                            mode="edit"
                            transaction={editingTransaction}
                            wallets={wallets}
                            categories={categories}
                            onTransactionsCreated={async () => {
                                await Promise.all([loadTransactions(), loadWallets()]);
                            }}
                            onCategoriesChanged={loadCategories}
                            onModalClosed={() => setEditingTransaction(null)}
                        />
                    </div>
                    <div className="transaction-content">
                        <TransactionFilter
                            filters={filters}
                            setFilters={handleFilterChange}
                            categories={categories}
                            wallets={wallets}
                        />
                        <TransactionList
                            transactions={currentTransactions}
                            onEdit={handleEditTransaction}
                            onDelete={handleDeleteTransaction}
                            deletingId={deletingId}
                        />
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
