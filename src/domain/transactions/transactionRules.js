export const validateTransaction = (transaction) => {
    if (!transaction.amount || isNaN(transaction.amount) || Number(transaction.amount) <= 0) {
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
    if (!['expense', 'income'].includes(transaction.tx_type)) {
        throw new Error('Transaction type must be either "expense" or "income"');
    }
    return true;
};
