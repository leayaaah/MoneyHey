import { toMoneyAmount } from './transaction';

export const calculateTotalBalance = (wallets) => {
    return wallets.reduce((sum, wallet) => sum + toMoneyAmount(wallet.balance), 0);
};
