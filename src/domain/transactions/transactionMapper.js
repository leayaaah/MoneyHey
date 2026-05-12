export const mapTransactionWithRelations = (transaction) => ({
    ...transaction,
    categoryName: transaction.categories?.category_name || 'Uncategorized',
    walletName: transaction.wallets?.wallet_name || 'Unknown Wallet',
});

export const mapTransactionsWithRelations = (transactions) =>
    transactions.map(mapTransactionWithRelations);
