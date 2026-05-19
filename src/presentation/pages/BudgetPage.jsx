import React, { startTransition, useEffect, useState } from 'react';
import { Modal } from 'bootstrap';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import AddBudgetModal from '../components/budget/AddBudgetModal';
import { fetchBudgets, removeBudget, calculateBudgetSpent } from '../../application/services/budgetService';
import { fetchCategories } from '../../application/services/categoryService';
import '../../css/BudgetPage.css';
import { useAuth } from '../hooks/useAuth';

const getBudgetStatus = (percentage) => {
    if (percentage >= 100) {
        return { label: 'Vượt ngân sách', tone: 'danger' };
    }
    if (percentage >= 80) {
        return { label: 'Sắp chạm', tone: 'warning' };
    }
    return { label: 'An toàn', tone: 'success' };
};

const getProgressBarClass = (percentage) => {
    if (percentage >= 100) return 'budget-progress-bar danger';
    if (percentage >= 80) return 'budget-progress-bar warning';
    return 'budget-progress-bar';
};

const BudgetPage = ({ onLogout }) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [budgets, setBudgets] = useState([]);
    const [categories, setCategories] = useState([]);
    const [budgetSpending, setBudgetSpending] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editingBudget, setEditingBudget] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const { user } = useAuth();
    const userId = user?.user_id;

    const formattedDate = new Date().toLocaleDateString('vi-VN', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });

    const loadBudgets = async () => {
        if (!userId) {
            setBudgets([]);
            return;
        }

        try {
            setLoading(true);
            setError('');
            const data = await fetchBudgets(userId);
            startTransition(() => {
                setBudgets(data);
            });

            const spendingMap = {};
            await Promise.all(
                data.map(async (budget) => {
                    const spent = await calculateBudgetSpent(budget);
                    spendingMap[budget.budget_id] = spent;
                })
            );
            startTransition(() => {
                setBudgetSpending(spendingMap);
            });
        } catch (err) {
            console.error('Failed to load budgets:', err);
            setError('Không thể tải dữ liệu ngân sách.');
        } finally {
            setLoading(false);
        }
    };

    const loadCategories = async () => {
        try {
            const data = await fetchCategories();
            startTransition(() => {
                setCategories(data);
            });
        } catch (err) {
            console.error('Failed to load categories:', err);
        }
    };

    useEffect(() => {
        if (!userId) {
            setBudgets([]);
            setLoading(false);
            return;
        }

        loadBudgets();
        loadCategories();
    }, [userId]);

    const handleEditBudget = (budget) => {
        setEditingBudget(budget);
        const modalElement = document.getElementById('editBudgetModal');
        if (modalElement) {
            Modal.getOrCreateInstance(modalElement).show();
        }
    };

    const handleDeleteBudget = async (budget) => {
        const budgetLabel = budget.categoryName || 'Tổng hợp';
        const shouldDelete = window.confirm(`Xóa ngân sách "${budgetLabel}"?`);

        if (!shouldDelete) return;

        try {
            setDeletingId(budget.budget_id);
            await removeBudget(budget.budget_id);
            await loadBudgets();
            alert('Đã xóa ngân sách.');
        } catch (err) {
            console.error('Failed to delete budget:', err);
            alert(err?.message || 'Không thể xóa ngân sách.');
        } finally {
            setDeletingId(null);
        }
    };

    const totalLimit = budgets.reduce((sum, b) => sum + Number(b.amount || 0), 0);
    const totalSpent = budgets.reduce((sum, b) => sum + (budgetSpending[b.budget_id] || 0), 0);
    const totalRemaining = totalLimit - totalSpent;

    return (
        <div className="budget-shell">
            <Header onToggleSidebar={() => setSidebarOpen(v => !v)} onLogout={onLogout} />

            <div className="budget-body">
                <Sidebar open={sidebarOpen} />

                <main className={`budget-main ${sidebarOpen ? 'sidebar-expanded' : 'sidebar-collapsed'}`}>
                    <div className="page-title-row">
                        <div>
                            <h1 className="page-title font-headline">Ngân sách</h1>
                            <p className="page-subtitle">{formattedDate}</p>
                        </div>
                        <button
                            className="btn-primary-emerald px-4 py-2 d-flex align-items-center gap-2 shadow-sm"
                            type="button"
                            data-bs-toggle="modal"
                            data-bs-target="#addBudgetModal"
                            data-bs-focus="false"
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
                            Thêm ngân sách
                        </button>

                        <AddBudgetModal
                            categories={categories}
                            onBudgetCreated={loadBudgets}
                        />
                        <AddBudgetModal
                            modalId="editBudgetModal"
                            mode="edit"
                            budget={editingBudget}
                            categories={categories}
                            onBudgetCreated={loadBudgets}
                            onModalClosed={() => setEditingBudget(null)}
                        />
                    </div>

                    {error ? <div className="alert alert-danger">{error}</div> : null}

                    {loading ? (
                        <div className="text-muted">Đang tải dữ liệu ngân sách...</div>
                    ) : (
                        <>
                            <div className="budget-summary">
                                <div className="budget-card">
                                    <div className="budget-card-label">Tổng ngân sách</div>
                                    <div className="budget-card-value">
                                        {totalLimit.toLocaleString('vi-VN')} đ
                                    </div>
                                </div>
                                <div className="budget-card warning">
                                    <div className="budget-card-label">Đã chi</div>
                                    <div className="budget-card-value">
                                        {totalSpent.toLocaleString('vi-VN')} đ
                                    </div>
                                </div>
                                <div className="budget-card success">
                                    <div className="budget-card-label">Còn lại</div>
                                    <div className="budget-card-value">
                                        {totalRemaining.toLocaleString('vi-VN')} đ
                                    </div>
                                </div>
                            </div>

                            {budgets.length === 0 ? (
                                <div className="budget-empty">
                                    <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--text-variant)' }}>account_balance_wallet</span>
                                    <p>Chưa có ngân sách nào. Nhấn "Thêm ngân sách" để bắt đầu.</p>
                                </div>
                            ) : (
                                <div className="budget-list">
                                    {budgets.map((budget) => {
                                        const spent = budgetSpending[budget.budget_id] || 0;
                                        const rawPercentage = budget.amount > 0
                                            ? (spent / budget.amount) * 100
                                            : 0;
                                        const percentage = Math.min(rawPercentage, 100);
                                        const status = getBudgetStatus(rawPercentage);
                                        const remaining = budget.amount - spent;
                                        const budgetLabel = budget.categoryName || 'Tổng hợp';
                                        const isDeleting = deletingId === budget.budget_id;

                                        return (
                                            <div key={budget.budget_id} className="budget-item">
                                                <div className="budget-item-header">
                                                    <div>
                                                        <h3 className="budget-item-title">{budgetLabel}</h3>
                                                        <p className="budget-item-meta">
                                                            Ngân sách: {Number(budget.amount).toLocaleString('vi-VN')} đ
                                                        </p>
                                                        <p className="budget-item-date">
                                                            {new Date(budget.start_date).toLocaleDateString('vi-VN')} — {new Date(budget.end_date).toLocaleDateString('vi-VN')}
                                                        </p>
                                                    </div>
                                                    <div className="budget-item-actions">
                                                        <span className={`budget-item-status ${status.tone}`}>
                                                            {status.label}
                                                        </span>
                                                        <div className="budget-item-btn-group">
                                                            <button
                                                                className="budget-action-btn"
                                                                title="Sửa"
                                                                onClick={() => handleEditBudget(budget)}
                                                                disabled={isDeleting}
                                                            >
                                                                <span className="material-symbols-outlined">edit</span>
                                                            </button>
                                                            <button
                                                                className="budget-action-btn danger"
                                                                title="Xóa"
                                                                onClick={() => handleDeleteBudget(budget)}
                                                                disabled={isDeleting}
                                                            >
                                                                <span className="material-symbols-outlined">delete</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="budget-progress">
                                                    <div
                                                        className={getProgressBarClass(rawPercentage)}
                                                        style={{ width: `${percentage}%` }}
                                                    />
                                                </div>
                                                <div className="budget-item-footer">
                                                    <span>Đã chi: {spent.toLocaleString('vi-VN')} đ</span>
                                                    <span>Còn lại: {remaining.toLocaleString('vi-VN')} đ</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </>
                    )}
                </main>
            </div>
        </div>
    );
};

export default BudgetPage;
