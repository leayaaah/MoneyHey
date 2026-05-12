import { addTransaction, getTransactions } from "../../infrastructure/repositories/transactionRepository";
import { mapTransactionsWithRelations } from "../../domain/transactions/transactionMapper";
import { validateTransaction } from "../../domain/transactions/transactionRules";

export const fetchTransactions = async () => {
    try {
        const transactions = await getTransactions();
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
