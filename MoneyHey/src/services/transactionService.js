import { addTransaction, getTransactions } from "../api/transactionRepo";
import { validateTransaction } from "../domain/transaction";

export const fetchTransactions = async () => {
    try {
        const transactions = await getTransactions();
        return transactions;
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
