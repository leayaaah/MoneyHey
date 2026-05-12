export const calculateTotalBalance = (wallets) =>
    wallets.reduce((sum, wallet) => sum + (wallet.balance || 0), 0);
