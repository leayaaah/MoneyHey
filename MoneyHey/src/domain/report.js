import { TRANSACTION_TYPES, getSignedTransactionAmount, toMoneyAmount } from './transaction';

export const getTransactionTotalByType = (transactions, type) => {
    return transactions
        .filter(tx => tx.tx_type === type)
        .reduce((sum, tx) => sum + toMoneyAmount(tx.amount), 0);
};

export const getIncomeTotal = (transactions) => (
    getTransactionTotalByType(transactions, TRANSACTION_TYPES.INCOME)
);

export const getExpenseTotal = (transactions) => (
    getTransactionTotalByType(transactions, TRANSACTION_TYPES.EXPENSE)
);

export const getNetBalance = (transactions) => {
    return transactions.reduce((sum, tx) => sum + getSignedTransactionAmount(tx), 0);
};

export const getCategorySummary = (transactions, type) => {
    const summaryByCategory = transactions
        .filter(tx => tx.tx_type === type)
        .reduce((summary, tx) => {
            const categoryName = tx.categoryName || 'Khac';
            summary[categoryName] = (summary[categoryName] || 0) + toMoneyAmount(tx.amount);
            return summary;
        }, {});

    return Object.entries(summaryByCategory).map(([name, value]) => ({ name, value }));
};
