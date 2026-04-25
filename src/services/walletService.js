import { supabase } from '../config/supabase'

export const getTotalBalance = async () => {
    const { data: wallets, error } = await supabase
        .from('wallets')
        .select('balance')
    if (error) throw error
    return wallets.reduce((sum, wallet) => sum + (wallet.balance || 0), 0)
}
