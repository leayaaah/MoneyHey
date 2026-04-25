// src/hooks/useWallet.js
// Adapter layer — bridges walletService with React state
import { useState, useEffect } from 'react';
import { walletService } from '../services/walletService';

export function useWallet() {
    const [totalBalance, setTotalBalance] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        walletService.getTotalBalance()
            .then(balance => setTotalBalance(balance))
            .catch(err => setError(err))
            .finally(() => setLoading(false));
    }, []);

    return { totalBalance, loading, error };
}
