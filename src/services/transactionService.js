import { addTransaction, getTransactions } from "../api/transactionRepo";

export const fetchTransactions = async () => {
    try {
        const transactions = await getTransactions();
        return transactions;
    } catch (error) {
        console.error('Error fetching transactions:', error);
        throw error;
    }   
    
}
const validateTransaction = (transaction) => {
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
}

export const createTransaction = async (transaction) => {
    validateTransaction(transaction);
    try {
        const newTransaction = await addTransaction(transaction);
        return newTransaction;
    } catch (error) {
        console.error('Error creating transaction:', error);
        throw error;
    }
}