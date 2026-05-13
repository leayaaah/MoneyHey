import { supabase } from '../supabaseClient'
export const getTransactions = async () => {
    const { data, error } = await supabase
        .from('transactions')
        .select(`*,
        categories ( category_name ),
        wallets ( wallet_name )`)
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

export const addTransactions = async (transactions) => {
    const { data, error } = await supabase
        .from('transactions')
        .insert(transactions)
    if (error) {
        console.error('Error adding transactions:', error)
        throw error
    }
    return data
}

export const getTransactionWithType = async(type) => {
    const { data, error } = await supabase
        .from('transactions')
        .select(`*,
        categories ( category_name ),
        wallets ( wallet_name )`)
        .eq('tx_type', type)
    if (error) {
        console.error('Error fetching transactions:', error)
        throw error
    }
    return data
}
