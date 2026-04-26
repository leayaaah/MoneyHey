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