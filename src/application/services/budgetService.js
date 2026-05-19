import {
    addBudget as addBudgetRecord,
    deleteBudgetById,
    fetchBudgetsByUserId,
    getBudgetById,
    updateBudgetById
} from '../../infrastructure/repositories/budgetRepository';
import { getTransactions } from '../../infrastructure/repositories/transactionRepository';

const toPersistedBudget = (budget) => ({
    user_id: budget.user_id,
    category_id: budget.category_id || null,
    amount: Number(budget.amount),
    start_date: budget.start_date,
    end_date: budget.end_date
});

export const validateBudget = (budget) => {
    if (!budget.amount || isNaN(budget.amount) || Number(budget.amount) <= 0) {
        throw new Error('Số tiền ngân sách phải là số dương.');
    }
    if (!budget.start_date) {
        throw new Error('Ngày bắt đầu là bắt buộc.');
    }
    if (!budget.end_date) {
        throw new Error('Ngày kết thúc là bắt buộc.');
    }
    if (new Date(budget.end_date) < new Date(budget.start_date)) {
        throw new Error('Ngày kết thúc phải sau ngày bắt đầu.');
    }
    return true;
};

export const fetchBudgets = async (userId) => {
    const budgets = await fetchBudgetsByUserId(userId);
    return budgets.map((budget) => ({
        ...budget,
        categoryName: budget.categories?.category_name || null
    }));
};

export const createBudget = async (budget) => {
    const persistedBudget = toPersistedBudget(budget);
    validateBudget(persistedBudget);
    return addBudgetRecord(persistedBudget);
};

export const updateBudget = async (budgetId, budget) => {
    const persistedBudget = toPersistedBudget(budget);
    validateBudget(persistedBudget);
    return updateBudgetById(budgetId, persistedBudget);
};

export const removeBudget = async (budgetId) => {
    await deleteBudgetById(budgetId);
};

export const calculateBudgetSpent = async (budget) => {
    const allTransactions = await getTransactions(budget.user_id);
    const startDate = new Date(budget.start_date);
    const endDate = new Date(budget.end_date);

    return allTransactions
        .filter((tx) => {
            if (tx.tx_type !== 'expense') {
                return false;
            }
            const txDate = new Date(tx.tx_date);
            const inDateRange = txDate >= startDate && txDate <= endDate;
            const inCategory = !budget.category_id || String(tx.category_id) === String(budget.category_id);
            return inDateRange && inCategory;
        })
        .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
};
