import { calculateTotalBalance } from '../../domain/wallets/walletCalculations'
import { fetchWalletBalances, fetchWallets } from '../../infrastructure/repositories/walletRepository'

export const getTotalBalance = async () => {
    const wallets = await fetchWalletBalances()
    return calculateTotalBalance(wallets)
}
export { fetchWallets }
