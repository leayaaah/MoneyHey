// src/services/walletService.js
// Business Logic layer — wallet / finance operations
import { walletRepository } from '../repositories/walletRepository';
import { Wallet } from '../models/Wallet';

export const walletService = {
    async getTotalBalance() {
        const data = await walletRepository.getAll();
        const wallets = data.map(w => new Wallet(w));
        return wallets.reduce((sum, w) => sum + (w.balance || 0), 0);
    },
};
