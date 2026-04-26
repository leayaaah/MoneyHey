import { supabase } from '../config/supabase'
export const getTransactions = async () => {
    const { data, error } = await supabase
        .from('transactions')
        .select('*')
    if (error) {
        console.error('Error fetching transactions:', error)
        throw error
    }
    return data
}
export const addTransaction = async (transaction) => {
    const { data, error } = await supabase
        .from('transactions')
        .insert(transaction)
    if (error) {
        console.error('Error adding transaction:', error)
        throw error
    }
    return data
}