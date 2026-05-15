import { addTransaction, addTransactions, deleteTransactionsByIds, getTransactions, getTransactionsByType } from "../../infrastructure/repositories/transactionRepository";
import { mapTransactionsWithRelations } from "../../domain/transactions/transactionMapper";
import { validateTransaction } from "../../domain/transactions/transactionRules";
import { applyTransactionsToWalletBalances } from "./walletService";

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
    validateTransaction(transaction);
    let createdTransactions = [];

    try {
        createdTransactions = await addTransaction(transaction);
        await applyTransactionsToWalletBalances([transaction]);
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
    transactions.forEach(validateTransaction);
    let createdTransactions = [];

    try {
        createdTransactions = await addTransactions(transactions);
        await applyTransactionsToWalletBalances(transactions);
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

export const fetchTransactionsByType = async (type) => {
    try {
        const transactions = await getTransactionsByType(type);
        return mapTransactionsWithRelations(transactions);
    } catch (error) {
        console.error('Error fetching transactions by type:', error);
        throw error;
    }
}
