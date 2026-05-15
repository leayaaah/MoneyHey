const toAmountNumber = (value) => Number(value || 0);

export const calculateTotalBalance = (wallets) =>
    wallets.reduce((sum, wallet) => sum + toAmountNumber(wallet.balance), 0);

export const getTransactionBalanceDelta = (transaction) => {
    const amount = toAmountNumber(transaction.amount);
    return transaction.tx_type === 'income' ? amount : -amount;
};

export const buildWalletBalanceDeltaMap = (transactions = []) =>
    transactions.reduce((deltaMap, transaction) => {
        const walletId = String(transaction.wallet_id || '').trim();

        if (!walletId) {
            return deltaMap;
        }

        const nextDelta = (deltaMap.get(walletId) || 0) + getTransactionBalanceDelta(transaction);
        deltaMap.set(walletId, nextDelta);
        return deltaMap;
    }, new Map());

export const applyBalanceDelta = (currentBalance, delta) =>
    toAmountNumber(currentBalance) + toAmountNumber(delta);
