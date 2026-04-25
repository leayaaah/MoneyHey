// src/models/Wallet.js
// Domain layer — Wallet entity
export class Wallet {
    constructor({ id = null, balance = 0, currency = 'VND', name = '' } = {}) {
        this.id = id;
        this.balance = balance;
        this.currency = currency;
        this.name = name;
    }
}
