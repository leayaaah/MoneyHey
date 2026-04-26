import { getTransactions } from "../repository/transactionRepo";

export const fetchTransactions = async () => {
    try {
        const transactions = await getTransactions();
        return transactions;
    } catch (error) {
        console.error('Error fetching transactions:', error);
        throw error;
    }   
    
}