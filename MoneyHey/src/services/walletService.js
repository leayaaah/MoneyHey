import { supabase } from '../config/supabase'
import { calculateTotalBalance } from '../domain/wallet'

export const getTotalBalance = async () => {
    const { data: wallets, error } = await supabase
        .from('wallets')
        .select('balance')
    if (error) throw error
    return calculateTotalBalance(wallets)
}
export const fetchWallets = async () => {
    const { data, error } = await supabase
        .from('wallets')
        .select('*')
    if (error) {
        console.error('Error fetching wallets:', error)
        throw error
    }
    return data
}
