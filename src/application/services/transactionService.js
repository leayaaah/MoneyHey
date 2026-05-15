import {
    addTransaction,
    addTransactions,
    deleteTransactionById,
    deleteTransactionsByIds,
    getTransactionById,
    getTransactions,
    getTransactionsByType,
    updateTransactionById
} from "../../infrastructure/repositories/transactionRepository";
import { mapTransactionsWithRelations } from "../../domain/transactions/transactionMapper";
import { validateTransaction } from "../../domain/transactions/transactionRules";
import { applyTransactionsToWalletBalances } from "./walletService";

const toPersistedTransaction = (transaction) => ({
    user_id: transaction.user_id,
    wallet_id: transaction.wallet_id,
    category_id: transaction.category_id,
    amount: Number(transaction.amount),
    note: transaction.note,
    tx_date: transaction.tx_date,
    tx_type: transaction.tx_type
});

const reverseTransactionEffect = (transaction) => ({
    wallet_id: transaction.wallet_id,
    amount: Number(transaction.amount),
    tx_type: transaction.tx_type === 'income' ? 'expense' : 'income'
});

export const fetchTransactions = async (userId) => {
    try {
        const transactions = await getTransactions(userId);
        return mapTransactionsWithRelations(transactions);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        throw error;
    }   
    
}
export const createTransaction = async (transaction) => {
    const persistedTransaction = toPersistedTransaction(transaction);
    validateTransaction(persistedTransaction);
    let createdTransactions = [];

    try {
        createdTransactions = await addTransaction(persistedTransaction);
        await applyTransactionsToWalletBalances([persistedTransaction]);
        const newTransaction = createdTransactions[0] || null;
        return newTransaction;
    } catch (error) {
        if (createdTransactions.length) {
            await deleteTransactionsByIds(
                createdTransactions
                    .map((createdTransaction) => createdTransaction.trans_id)
                    .filter(Boolean)
            );
        }
        console.error('Error creating transaction:', error);
        throw error;
    }
}

export const createTransactions = async (transactions) => {
    const persistedTransactions = transactions.map(toPersistedTransaction);
    persistedTransactions.forEach(validateTransaction);
    let createdTransactions = [];

    try {
        createdTransactions = await addTransactions(persistedTransactions);
        await applyTransactionsToWalletBalances(persistedTransactions);
        const newTransactions = createdTransactions;
        return newTransactions;
    } catch (error) {
        if (createdTransactions.length) {
            await deleteTransactionsByIds(
                createdTransactions
                    .map((createdTransaction) => createdTransaction.trans_id)
                    .filter(Boolean)
            );
        }
        console.error('Error creating transactions:', error);
        throw error;
    }
}

export const updateTransaction = async (transactionId, transaction) => {
    const persistedTransaction = toPersistedTransaction(transaction);
    validateTransaction(persistedTransaction);

    const existingTransaction = await getTransactionById(transactionId);
    const walletBalanceAdjustment = [
        reverseTransactionEffect(existingTransaction),
        persistedTransaction
    ];

    await applyTransactionsToWalletBalances(walletBalanceAdjustment);

    try {
        return await updateTransactionById(transactionId, persistedTransaction);
    } catch (error) {
        await applyTransactionsToWalletBalances([
            reverseTransactionEffect(persistedTransaction),
            existingTransaction
        ]);
        console.error('Error updating transaction:', error);
        throw error;
    }
}

export const removeTransaction = async (transactionId) => {
    const existingTransaction = await getTransactionById(transactionId);
    await applyTransactionsToWalletBalances([reverseTransactionEffect(existingTransaction)]);

    try {
        await deleteTransactionById(transactionId);
    } catch (error) {
        await applyTransactionsToWalletBalances([existingTransaction]);
        console.error('Error deleting transaction:', error);
        throw error;
    }
}

export const fetchTransactionsByType = async (type) => {
    try {
        const transactions = await getTransactionsByType(type);
        return mapTransactionsWithRelations(transactions);
    } catch (error) {
        console.error('Error fetching transactions by type:', error);
        throw error;
    }
}
