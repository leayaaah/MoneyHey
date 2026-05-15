import { applyBalanceDelta, buildWalletBalanceDeltaMap, calculateTotalBalance } from '../../domain/wallets/walletCalculations'
import { countTransactionsByWalletId } from '../../infrastructure/repositories/transactionRepository'
import {
    createWallet as createWalletRecord,
    deleteWallet as deleteWalletRecord,
    fetchWalletBalances,
    fetchWalletById,
    fetchWallets,
    updateWallet as updateWalletRecord,
    updateWalletBalance
} from '../../infrastructure/repositories/walletRepository'

export const getTotalBalance = async (userId) => {
    const wallets = await fetchWalletBalances(userId)
    return calculateTotalBalance(wallets)
}

const normalizeWalletPayload = (wallet) => {
    const walletName = String(wallet.wallet_name || '').trim();
    const balance = Number(wallet.balance || 0);

    if (!walletName) {
        throw new Error('Tên ví không được để trống.');
    }

    if (Number.isNaN(balance)) {
        throw new Error('Số dư ví không hợp lệ.');
    }

    return {
        wallet_name: walletName,
        balance
    };
};

export const applyTransactionsToWalletBalances = async (transactions = []) => {
    const walletDeltas = buildWalletBalanceDeltaMap(transactions);
    const walletIds = Array.from(walletDeltas.keys());

    if (!walletIds.length) {
        return;
    }

    const originalWallets = await Promise.all(
        walletIds.map(async (walletId) => [walletId, await fetchWalletById(walletId)])
    );

    const originalWalletMap = new Map(originalWallets);
    const updatedWalletIds = [];

    try {
        for (const walletId of walletIds) {
            const wallet = originalWalletMap.get(walletId);

            if (!wallet) {
                throw new Error(`Không tìm thấy ví #${walletId}.`);
            }

            const nextBalance = applyBalanceDelta(wallet.balance, walletDeltas.get(walletId));
            await updateWalletBalance(walletId, nextBalance);
            updatedWalletIds.push(walletId);
        }
    } catch (error) {
        await Promise.all(updatedWalletIds.map(async (walletId) => {
            const wallet = originalWalletMap.get(walletId);
            await updateWalletBalance(walletId, wallet.balance);
        }));
        throw error;
    }
};

export const createWallet = async (wallet) => {
    const normalizedWallet = normalizeWalletPayload(wallet);
    return createWalletRecord({
        ...normalizedWallet,
        user_id: wallet.user_id
    });
};

export const updateWallet = async (walletId, wallet) => {
    const normalizedWallet = normalizeWalletPayload(wallet);
    return updateWalletRecord(walletId, normalizedWallet);
};

export const removeWallet = async (walletId, userId) => {
    const transactionCount = await countTransactionsByWalletId(walletId, userId);

    if (transactionCount > 0) {
        throw new Error('Không thể xóa ví đã có giao dịch. Hãy chuyển hoặc xóa các giao dịch liên quan trước.');
    }

    await deleteWalletRecord(walletId);
};

export { fetchWallets }
