// src/models/Transaction.js
// Domain layer — Transaction entity
export class Transaction {
    constructor({ id = null, name = '', category = '', date = '', amount = '', type = 'expense' } = {}) {
        this.id = id;
        this.name = name;
        this.category = category;
        this.date = date;
        this.amount = amount;
        this.type = type;
    }
}
