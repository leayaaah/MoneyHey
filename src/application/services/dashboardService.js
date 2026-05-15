import { fetchBudgetsByUserId } from '../../infrastructure/repositories/budgetRepository';
import { getTransactions } from '../../infrastructure/repositories/transactionRepository';
import { fetchWallets } from '../../infrastructure/repositories/walletRepository';
import { mapTransactionsWithRelations } from '../../domain/transactions/transactionMapper';

const isSameMonth = (date, monthStart) =>
    date.getFullYear() === monthStart.getFullYear() &&
    date.getMonth() === monthStart.getMonth();

const sumTransactionAmounts = (transactions, type) =>
    transactions
        .filter((tx) => tx.tx_type === type)
        .reduce((total, tx) => total + Number(tx.amount || 0), 0);

const calculateTrendPercent = (currentValue, previousValue) => {
    if (previousValue === 0) {
        return currentValue === 0 ? 0 : 100;
    }

    return Math.round(((currentValue - previousValue) / previousValue) * 100);
};

const buildCategorySpending = (transactions) => {
    const expenseMap = new Map();

    transactions
        .filter((tx) => tx.tx_type === 'expense')
        .forEach((tx) => {
            const key = tx.categoryName || 'Khac';
            const nextAmount = (expenseMap.get(key) || 0) + Number(tx.amount || 0);
            expenseMap.set(key, nextAmount);
        });

    const totalExpense = Array.from(expenseMap.values()).reduce((sum, value) => sum + value, 0);

    return Array.from(expenseMap.entries())
        .map(([label, amount]) => ({
            label,
            amount,
            pct: totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0,
        }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5);
};

const calculateBudgetUsage = (budgets, transactions, monthStart, monthEnd) => {
    const activeBudgets = budgets.filter((budget) => {
        const startDate = new Date(budget.start_date);
        const endDate = new Date(budget.end_date);

        return startDate <= monthEnd && endDate >= monthStart;
    });

    const totalBudgetAmount = activeBudgets.reduce((sum, budget) => sum + Number(budget.amount || 0), 0);
    const budgetCategoryIds = new Set(
        activeBudgets
            .map((budget) => budget.category_id)
            .filter((categoryId) => categoryId !== null && categoryId !== undefined)
    );

    const usedBudgetAmount = transactions
        .filter((tx) => {
            if (tx.tx_type !== 'expense') {
                return false;
            }

            const txDate = new Date(tx.tx_date);
            return txDate >= monthStart &&
                txDate <= monthEnd &&
                budgetCategoryIds.has(tx.category_id);
        })
        .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);

    return {
        activeBudgets,
        totalBudgetAmount,
        usedBudgetAmount,
        usagePercent: totalBudgetAmount > 0 ? Math.round((usedBudgetAmount / totalBudgetAmount) * 100) : 0,
    };
};

export const getDashboardData = async (userId) => {
    const [wallets, rawTransactions, budgets] = await Promise.all([
        fetchWallets(userId),
        getTransactions(userId),
        fetchBudgetsByUserId(userId),
    ]);

    const transactions = mapTransactionsWithRelations(rawTransactions);
    const totalBalance = wallets.reduce((sum, wallet) => sum + Number(wallet.balance || 0), 0);
    const recentTransactions = [...transactions]
        .sort((a, b) => new Date(b.tx_date) - new Date(a.tx_date))
        .slice(0, 6);

    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const currentMonthTransactions = transactions.filter((tx) => isSameMonth(new Date(tx.tx_date), currentMonthStart));
    const previousMonthTransactions = transactions.filter((tx) => isSameMonth(new Date(tx.tx_date), previousMonthStart));

    const currentIncome = sumTransactionAmounts(currentMonthTransactions, 'income');
    const previousIncome = sumTransactionAmounts(previousMonthTransactions, 'income');
    const currentExpense = sumTransactionAmounts(currentMonthTransactions, 'expense');
    const previousExpense = sumTransactionAmounts(previousMonthTransactions, 'expense');
    const categorySpending = buildCategorySpending(currentMonthTransactions);
    const budgetUsage = calculateBudgetUsage(budgets, transactions, currentMonthStart, currentMonthEnd);

    return {
        totalBalance,
        walletCount: wallets.length,
        recentTransactions,
        categorySpending,
        currentMonthIncome: currentIncome,
        currentMonthExpense: currentExpense,
        incomeTrend: calculateTrendPercent(currentIncome, previousIncome),
        expenseTrend: calculateTrendPercent(currentExpense, previousExpense),
        activeBudgetCount: budgetUsage.activeBudgets.length,
        budgetUsagePercent: budgetUsage.usagePercent,
        totalBudgetAmount: budgetUsage.totalBudgetAmount,
    };
};
