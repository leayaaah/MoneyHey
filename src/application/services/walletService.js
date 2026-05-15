import { calculateTotalBalance } from '../../domain/wallets/walletCalculations'
import { fetchWalletBalances, fetchWallets } from '../../infrastructure/repositories/walletRepository'

export const getTotalBalance = async (userId) => {
    const wallets = await fetchWalletBalances(userId)
    return calculateTotalBalance(wallets)
}
export { fetchWallets }
