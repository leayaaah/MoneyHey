import { addTransaction, addTransactions, getTransactions, getTransactionsByType } from "../../infrastructure/repositories/transactionRepository";
import { mapTransactionsWithRelations } from "../../domain/transactions/transactionMapper";
import { validateTransaction } from "../../domain/transactions/transactionRules";

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
    try {
        const newTransaction = await addTransaction(transaction);
        return newTransaction;
    } catch (error) {
        console.error('Error creating transaction:', error);
        throw error;
    }
}

export const createTransactions = async (transactions) => {
    transactions.forEach(validateTransaction);
    try {
        const newTransactions = await addTransactions(transactions);
        return newTransactions;
    } catch (error) {
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
