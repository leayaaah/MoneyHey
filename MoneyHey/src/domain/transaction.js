export const TRANSACTION_TYPES = {
    EXPENSE: 'expense',
    INCOME: 'income',
};

export const toMoneyAmount = (value) => {
    const amount = Number(value);
    return Number.isFinite(amount) ? amount : 0;
};

export const isValidTransactionType = (type) => (
    type === TRANSACTION_TYPES.EXPENSE || type === TRANSACTION_TYPES.INCOME
);

export const validateTransaction = (transaction) => {
    if (!transaction.amount || toMoneyAmount(transaction.amount) <= 0) {
        throw new Error('Amount must be a positive number');
    }
    if (!transaction.wallet_id) {
        throw new Error('Wallet is required');
    }
    if (!transaction.category_id) {
        throw new Error('Category is required');
    }
    if (!transaction.tx_date) {
        throw new Error('Transaction date is required');
    }
    if (!isValidTransactionType(transaction.tx_type)) {
        throw new Error('Transaction type must be either "expense" or "income"');
    }
    return true;
};

export const filterTransactions = (transactions, filters = {}) => {
    return transactions.filter(tx => {
        const txDate = new Date(tx.tx_date);

        if (filters.fromDate && txDate < new Date(filters.fromDate)) return false;
        if (filters.toDate && txDate > new Date(filters.toDate)) return false;
        if (filters.category && filters.category !== 'all' && tx.category_id !== Number(filters.category)) return false;

        return true;
    });
};

export const getSignedTransactionAmount = (transaction) => {
    const amount = toMoneyAmount(transaction.amount);
    return transaction.tx_type === TRANSACTION_TYPES.INCOME ? amount : -amount;
};
