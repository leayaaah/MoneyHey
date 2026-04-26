import { getTransactions } from "../api/transactionRepo";

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
    try {
        const newTransaction = await addTransaction(transaction);
        return newTransaction;
    } catch (error) {
        console.error('Error creating transaction:', error);
        throw error;
    }
}