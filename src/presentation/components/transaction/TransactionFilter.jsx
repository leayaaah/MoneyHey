import React from 'react';
import '/src/css/TransactionPage.css';

const defaultFilters = {
    fromDate: '',
    toDate: '',
    category: 'all',
    wallet: 'all',
    txType: 'all',
    keyword: ''
};

const TransactionFilter = ({ filters, setFilters, categories, wallets }) => {
    const handleChange = (event) => {
        const { name, value } = event.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const handleReset = () => {
        setFilters(defaultFilters);
    };

    return (
        <div className="filter-bar">
            <div className="filter-group">
                <label>Tu ngay</label>
                <input
                    type="date"
                    name="fromDate"
                    value={filters.fromDate}
                    onChange={handleChange}
                />
            </div>

            <div className="filter-group">
                <label>Den ngay</label>
                <input
                    type="date"
                    name="toDate"
                    value={filters.toDate}
                    onChange={handleChange}
                />
            </div>

            <div className="filter-group">
                <label>Loai giao dich</label>
                <select
                    name="txType"
                    value={filters.txType}
                    onChange={handleChange}
                >
                    <option value="all">Tat ca</option>
                    <option value="expense">Chi tieu</option>
                    <option value="income">Thu nhap</option>
                </select>
            </div>

            <div className="filter-group">
                <label>Danh muc</label>
                <select
                    name="category"
                    value={filters.category}
                    onChange={handleChange}
                >
                    <option value="all">Tat ca</option>
                    {categories.map((category) => (
                        <option key={category.category_id} value={category.category_id}>
                            {category.category_name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="filter-group">
                <label>Vi</label>
                <select
                    name="wallet"
                    value={filters.wallet}
                    onChange={handleChange}
                >
                    <option value="all">Tat ca</option>
                    {wallets.map((wallet) => (
                        <option key={wallet.wallet_id} value={wallet.wallet_id}>
                            {wallet.wallet_name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="filter-group">
                <label>Tim kiem</label>
                <input
                    type="text"
                    name="keyword"
                    value={filters.keyword}
                    onChange={handleChange}
                    placeholder="Ghi chu..."
                />
            </div>

            <button className="btn-reset" type="button" onClick={handleReset}>
                Reset
            </button>
        </div>
    );
};

export default TransactionFilter;
